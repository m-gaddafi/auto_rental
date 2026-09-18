from decimal import Decimal

from django.contrib.auth.decorators import login_required, user_passes_test
from django.db import transaction
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404, redirect, render
from django.utils.timezone import now

from accounts.permissions import can_verify_payments
from apps.confirmations.forms import ConfirmationForm, RejectionForm
from apps.confirmations.models import Confirmation, PaymentAllocation
from apps.masterlog.services import sync_master_log
from apps.payments.models import RawPayment
from apps.units.models import Unit


def is_manager_or_admin(user):
    return user.is_authenticated and (user.role == 'manager' or user.is_superuser or user.is_staff or getattr(user, 'role', '') == 'admin')


def is_admin_only(user):
    return can_verify_payments(user)


@login_required
@user_passes_test(is_manager_or_admin)
def pending_confirmations(request):
    rejected_confirmations = Confirmation.objects.filter(verification_status='rejected').order_by('-verified_at')
    payments = RawPayment.objects.filter(status='manual').prefetch_related(
        Prefetch('confirmations', queryset=rejected_confirmations, to_attr='rejected_confirmations')
    ).order_by('-created_at')
    return render(request, 'confirmations/pending.html', {'payments': payments, 'form': ConfirmationForm()})


@login_required
@user_passes_test(is_manager_or_admin)
def confirm_payment(request, payment_id):
    payment = get_object_or_404(RawPayment, id=payment_id)
    units = Unit.objects.filter(is_active=True).order_by('unit_id')
    if request.method == 'POST':
        form = ConfirmationForm(request.POST)
        if form.is_valid():
            comment = form.cleaned_data['confirmation_comment'].strip()
            selected_unit = None

            allocation_rows = form.get_allocation_rows()
            if not allocation_rows:
                form.add_error(None, 'Add at least one unit allocation row before submitting the confirmation.')
            else:
                total_allocated = sum((row['amount'] for row in allocation_rows), Decimal('0'))
                if total_allocated != Decimal(str(payment.amount)):
                    form.add_error(None, f'The allocation total of UGX {total_allocated} must match the payment amount of UGX {payment.amount}.')

            if form.errors:
                return render(request, 'confirmations/confirm.html', {'form': form, 'payment': payment, 'units': units})

            confirmation = Confirmation.objects.create(
                payment=payment,
                selected_unit=selected_unit,
                confirmation_comment=comment,
                confirmed_by=request.user.username,
            )

            for row in allocation_rows:
                PaymentAllocation.objects.create(
                    confirmation=confirmation,
                    unit=row['unit'],
                    amount=row['amount'],
                    allocation_tag=row['tag'],
                    payment_month=row['month'],
                    payment_year=row['year'],
                )

            payment.matched_unit = selected_unit or (confirmation.allocations.first().unit if confirmation.allocations.exists() else None)
            payment.status = 'manager_reviewed'
            payment.save(update_fields=['matched_unit', 'status'])
            return redirect('pending_confirmations')
    else:
        form = ConfirmationForm(initial={'payment_id': payment.id})
    return render(request, 'confirmations/confirm.html', {'form': form, 'payment': payment, 'units': units})


@login_required
@user_passes_test(is_admin_only)
def pending_verifications(request):
    confirmations = Confirmation.objects.filter(verification_status='pending').select_related('payment', 'selected_unit').order_by('-confirmed_at')
    return render(request, 'confirmations/pending_verifications.html', {'confirmations': confirmations})


@login_required
@user_passes_test(is_admin_only)
def verify_confirmation(request, confirmation_id):
    confirmation = get_object_or_404(Confirmation, id=confirmation_id)
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'verify':
            with transaction.atomic():
                confirmation.verification_status = 'verified'
                confirmation.verified_by = request.user.username
                confirmation.verified_at = now()
                confirmation.save(update_fields=['verification_status', 'verified_by', 'verified_at'])
                payment = confirmation.payment
                payment.status = 'confirmed'
                payment.save(update_fields=['status'])
                sync_master_log(confirmation)
        elif action == 'reject':
            rejection_form = RejectionForm(request.POST)
            if not rejection_form.is_valid():
                return render(request, 'confirmations/verify.html', {
                    'confirmation': confirmation,
                    'rejection_form': rejection_form,
                })
            confirmation.verification_status = 'rejected'
            confirmation.rejection_comment = rejection_form.cleaned_data['rejection_comment'].strip()
            confirmation.verified_by = request.user.username
            confirmation.verified_at = now()
            confirmation.save(update_fields=['verification_status', 'rejection_comment', 'verified_by', 'verified_at'])
            confirmation.payment.status = 'manual'
            confirmation.payment.save(update_fields=['status'])
        return redirect('pending_verifications')
    return render(request, 'confirmations/verify.html', {
        'confirmation': confirmation,
        'rejection_form': RejectionForm(),
    })
