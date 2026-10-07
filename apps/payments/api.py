import uuid
from decimal import Decimal, InvalidOperation
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from accounts.permissions import IsManagerOrAdmin
from rest_framework.response import Response

from apps.units.models import Unit
from .models import RawPayment
from .serializers import RawPaymentSerializer
from .utils import parse_mtn_texts, parse_uploaded_payments


class RawPaymentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RawPayment.objects.all().order_by('-created_at')
    serializer_class = RawPaymentSerializer
    permission_classes = [IsManagerOrAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(transaction_id__icontains=search)
                | Q(sender_name__icontains=search)
                | Q(sender_phone__icontains=search)
                | Q(matched_unit__unit_id__icontains=search)
            )
        return qs


@api_view(['POST'])
@permission_classes([IsManagerOrAdmin])
def api_parse_payments(request):
    raw_text = request.data.get('raw_text', '')
    uploaded_file = request.FILES.get('file')

    try:
        if uploaded_file:
            parsed_list = parse_uploaded_payments(uploaded_file)
        elif raw_text:
            parsed_list = parse_mtn_texts(raw_text)
        else:
            return Response({'detail': 'No text or file provided.'}, status=status.HTTP_400_BAD_REQUEST)
    except (ValueError, TypeError, InvalidOperation) as exc:
        return Response({'detail': f'Parsing failed: {str(exc)}'}, status=status.HTTP_400_BAD_REQUEST)

    if not parsed_list:
        return Response({'detail': 'No valid transactions detected.'}, status=status.HTTP_400_BAD_REQUEST)

    preview = []
    for item in parsed_list:
        amount = item.get('amount') or Decimal('0')
        phone = item.get('sender_phone') or ''
        suggested_unit = None

        if phone:
            suggested_unit = Unit.objects.filter(tenant_phone=phone, is_active=True).first()
        if suggested_unit is None and amount > Decimal('0'):
            suggested_unit = Unit.objects.filter(
                monthly_rate__gte=amount - Decimal('1000'),
                monthly_rate__lte=amount + Decimal('1000'),
                is_active=True,
            ).first()

        preview.append({
            'transaction_id': item.get('transaction_id') or '',
            'payment_date': str(item['payment_date']) if item.get('payment_date') else None,
            'payment_time': str(item['payment_time']) if item.get('payment_time') else None,
            'sender_name': item.get('sender_name') or '',
            'sender_phone': phone,
            'amount': float(amount),
            'raw_text': item.get('raw_text') or '',
            'suggested_unit_id': suggested_unit.id if suggested_unit else None,
            'suggested_unit_name': suggested_unit.unit_id if suggested_unit else None,
        })

    return Response({'count': len(preview), 'transactions': preview})


@api_view(['POST'])
@permission_classes([IsManagerOrAdmin])
def api_import_payments(request):
    transactions = request.data.get('transactions', [])
    if not isinstance(transactions, list) or not transactions:
        return Response({'detail': 'Transactions list is required.'}, status=status.HTTP_400_BAD_REQUEST)

    imported_count = 0
    skipped_count = 0
    created_payments = []

    for item in transactions:
        txn_id = item.get('transaction_id') or f'manual-{uuid.uuid4().hex[:8]}'
        if RawPayment.objects.filter(transaction_id=txn_id).exists():
            skipped_count += 1
            continue

        payment_date = item.get('payment_date')
        payment_time = item.get('payment_time')
        amount_val = Decimal(str(item.get('amount', 0)))

        payment = RawPayment.objects.create(
            transaction_id=txn_id,
            payment_date=payment_date if payment_date else None,
            payment_time=payment_time if payment_time else None,
            sender_name=item.get('sender_name', ''),
            sender_phone=item.get('sender_phone', ''),
            amount=amount_val,
            raw_text=item.get('raw_text', ''),
            status='manual',
        )

        unit_id = item.get('matched_unit') or item.get('suggested_unit_id')
        if unit_id:
            unit = Unit.objects.filter(id=unit_id, is_active=True).first()
            if unit:
                payment.matched_unit = unit
                payment.save(update_fields=['matched_unit'])
        elif payment.sender_phone:
            unit = Unit.objects.filter(tenant_phone=payment.sender_phone, is_active=True).first()
            if unit:
                payment.matched_unit = unit
                payment.save(update_fields=['matched_unit'])

        created_payments.append(payment)
        imported_count += 1

    return Response({
        'detail': f'Imported {imported_count} receipt(s). {skipped_count} skipped (duplicates).',
        'imported_count': imported_count,
        'skipped_count': skipped_count,
    })
