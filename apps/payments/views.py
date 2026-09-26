import uuid
from datetime import date, time
from decimal import Decimal, InvalidOperation

from datetime import datetime

from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test
from django.shortcuts import redirect, render

from accounts.permissions import can_paste_payments
from apps.units.models import Unit
from .forms import PaymentIngestForm
from .models import RawPayment
from .utils import parse_mtn_texts, parse_uploaded_payments


PREVIEW_SESSION_KEY = 'payment_import_preview'


def _serialise_payment(parsed):
    """Store preview data in the session without relying on non-JSON types."""
    return {
        **parsed,
        'amount': str(parsed['amount']),
        'payment_date': parsed['payment_date'].isoformat() if parsed['payment_date'] else None,
        'payment_time': parsed['payment_time'].isoformat() if parsed['payment_time'] else None,
    }


def _deserialise_payment(parsed):
    return {
        **parsed,
        'amount': Decimal(parsed['amount']),
        'payment_date': date.fromisoformat(parsed['payment_date']) if parsed['payment_date'] else None,
        'payment_time': time.fromisoformat(parsed['payment_time']) if parsed['payment_time'] else None,
    }


def _session_payment_sort_key(serialised):
    payment_date = serialised.get('payment_date')
    payment_time = serialised.get('payment_time') or '00:00:00'
    if payment_date and payment_time:
        try:
            return datetime.fromisoformat(f'{payment_date}T{payment_time}')
        except ValueError:
            pass
    return datetime.min


@login_required
@user_passes_test(can_paste_payments)
def ingest_payments(request):
    if request.method == 'POST':
        form = PaymentIngestForm(request.POST, request.FILES)
        if form.is_valid():
            raw_text = form.cleaned_data.get('raw_text', '')
            uploaded_file = form.cleaned_data.get('raw_file')
            try:
                parsed_payments = parse_uploaded_payments(uploaded_file) if uploaded_file else parse_mtn_texts(raw_text)
            except (ValueError, TypeError, InvalidOperation):
                form.add_error('raw_file', 'The uploaded file could not be parsed as payment data.')
                return render(request, 'payments/ingest.html', {'form': form})
            if not parsed_payments:
                form.add_error('raw_file', 'No transactions were found in the uploaded file.')
                return render(request, 'payments/ingest.html', {'form': form})
            request.session[PREVIEW_SESSION_KEY] = [_serialise_payment(parsed) for parsed in parsed_payments]
            return redirect('review_payments')
    else:
        form = PaymentIngestForm()
    return render(request, 'payments/ingest.html', {'form': form})


@login_required
@user_passes_test(can_paste_payments)
def review_payments(request):
    preview = request.session.get(PREVIEW_SESSION_KEY, [])
    if not preview:
        return redirect('ingest_payments')

    preview = sorted(preview, key=_session_payment_sort_key, reverse=True)

    if request.method == 'POST':
        if request.POST.get('action') == 'cancel':
            request.session.pop(PREVIEW_SESSION_KEY, None)
            return redirect('ingest_payments')

        imported_count = 0
        for serialised in preview:
            parsed = _deserialise_payment(serialised)
            transaction_id = parsed['transaction_id'] or f'manual-{uuid.uuid4().hex[:8]}'
            if RawPayment.objects.filter(transaction_id=transaction_id).exists():
                continue

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
            imported_count += 1
            suggested_unit = None
            if payment.sender_phone:
                suggested_unit = Unit.objects.filter(tenant_phone=payment.sender_phone, is_active=True).first()
            if suggested_unit is None and payment.amount > Decimal('0'):
                suggested_unit = Unit.objects.filter(monthly_rate__gte=payment.amount - Decimal('1000'), monthly_rate__lte=payment.amount + Decimal('1000'), is_active=True).first()
            if suggested_unit:
                payment.matched_unit = suggested_unit
                payment.save(update_fields=['matched_unit'])
        request.session.pop(PREVIEW_SESSION_KEY, None)
        messages.success(request, f'Successfully imported {imported_count} receipt{"s" if imported_count != 1 else ""}.')
        return redirect('pending_confirmations')

    return render(request, 'payments/review.html', {'payments': preview})
