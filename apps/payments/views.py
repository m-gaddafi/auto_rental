import uuid
from decimal import Decimal

from django.contrib.auth.decorators import login_required, user_passes_test
from django.shortcuts import redirect, render

from apps.units.models import Unit
from .forms import PaymentIngestForm
from .models import RawPayment
from .utils import parse_mtn_texts


def is_admin_only(user):
    return user.is_authenticated and (user.is_superuser or user.is_staff or getattr(user, 'role', '') == 'admin')


@login_required
@user_passes_test(is_admin_only)
def ingest_payments(request):
    if request.method == 'POST':
        form = PaymentIngestForm(request.POST)
        if form.is_valid():
            raw_text = form.cleaned_data['raw_text']
            parsed_payments = parse_mtn_texts(raw_text)
            for parsed in parsed_payments:
                transaction_id = parsed['transaction_id']
                if not transaction_id:
                    transaction_id = f'manual-{uuid.uuid4().hex[:8]}'
                elif RawPayment.objects.filter(transaction_id=transaction_id).exists():
                    transaction_id = f'{transaction_id}-{uuid.uuid4().hex[:8]}'

                payment = RawPayment.objects.create(
                    transaction_id=transaction_id,
                    payment_date=parsed['payment_date'],
                    payment_time=parsed['payment_time'],
                    sender_name=parsed['sender_name'],
                    sender_phone=parsed['sender_phone'],
                    amount=parsed['amount'],
                    raw_text=parsed['raw_text'],
                    status='manual',
                )
                suggested_unit = None
                if payment.sender_phone:
                    suggested_unit = Unit.objects.filter(tenant_phone=payment.sender_phone, is_active=True).first()
                if suggested_unit is None and payment.amount > Decimal('0'):
                    suggested_unit = Unit.objects.filter(monthly_rate__gte=payment.amount - Decimal('1000'), monthly_rate__lte=payment.amount + Decimal('1000'), is_active=True).first()
                if suggested_unit:
                    payment.matched_unit = suggested_unit
                    payment.save(update_fields=['matched_unit'])
            return redirect('pending_confirmations')
    else:
        form = PaymentIngestForm()
    return render(request, 'payments/ingest.html', {'form': form})
