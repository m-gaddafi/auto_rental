from decimal import Decimal
from django.db import transaction
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from accounts.permissions import IsAdmin, IsManagerOrAdmin
from rest_framework.response import Response

from apps.masterlog.services import sync_master_log
from apps.payments.models import RawPayment
from apps.payments.serializers import RawPaymentSerializer
from apps.units.models import Unit
from .models import Confirmation, PaymentAllocation
from .serializers import ConfirmationSerializer


@api_view(['GET'])
@permission_classes([IsManagerOrAdmin])
def api_pending_confirmations(request):
    rejected_confirmations = Confirmation.objects.filter(verification_status='rejected').order_by('-verified_at')
    payments = (
        RawPayment.objects.filter(status='manual')
        .prefetch_related(
            Prefetch('confirmations', queryset=rejected_confirmations, to_attr='rejected_confirmations')
        )
        .order_by('-payment_date', '-payment_time', '-created_at')
    )

    results = []
    for p in payments:
        p_data = RawPaymentSerializer(p).data
        rejected_list = getattr(p, 'rejected_confirmations', [])
        p_data['rejected_confirmations'] = [
            {
                'id': r.id,
                'comment': r.confirmation_comment,
                'rejection_comment': r.rejection_comment,
                'verified_by': r.verified_by,
                'verified_at': r.verified_at,
            }
            for r in rejected_list
        ]
        results.append(p_data)

    return Response(results)


@api_view(['POST'])
@permission_classes([IsManagerOrAdmin])
def api_create_confirmation(request):
    data = request.data
    payment_id = data.get('payment_id')
    if not payment_id:
        return Response({'detail': 'payment_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    payment = get_object_or_404(RawPayment, pk=payment_id)
    comment = data.get('confirmation_comment', '').strip()
    allocations_data = data.get('allocations', [])

    if not allocations_data:
        return Response(
            {'detail': 'Add at least one unit allocation row before submitting.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Validate allocations and sum
    total_allocated = Decimal('0')
    parsed_allocations = []
    for item in allocations_data:
        unit_id = item.get('unit')
        amount_val = Decimal(str(item.get('amount', 0)))
        tag = item.get('allocation_tag') or item.get('tag') or 'part'
        month = item.get('payment_month') or item.get('month') or ''
        year_val = item.get('payment_year') or item.get('year') or now().year

        unit = Unit.objects.filter(pk=unit_id, is_active=True).first()
        if not unit:
            return Response({'detail': f'Unit #{unit_id} not found.'}, status=status.HTTP_400_BAD_REQUEST)

        total_allocated += amount_val
        parsed_allocations.append({
            'unit': unit,
            'amount': amount_val,
            'tag': tag,
            'month': month,
            'year': int(year_val),
            'comment': item.get('comment', '').strip(),
        })

    if total_allocated != Decimal(str(payment.amount)):
        return Response(
            {
                'detail': f'The allocation total of UGX {total_allocated:,} must match the payment amount of UGX {payment.amount:,}.'
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    with transaction.atomic():
        confirmation = Confirmation.objects.create(
            payment=payment,
            selected_unit=parsed_allocations[0]['unit'] if parsed_allocations else None,
            confirmation_comment=comment,
            confirmed_by=request.user.username if request.user.is_authenticated else 'Manager',
        )

        for alloc in parsed_allocations:
            PaymentAllocation.objects.create(
                confirmation=confirmation,
                unit=alloc['unit'],
                amount=alloc['amount'],
                allocation_tag=alloc['tag'],
                payment_month=alloc['month'],
                payment_year=alloc['year'],
                comment=alloc['comment'],
            )

        payment.matched_unit = parsed_allocations[0]['unit'] if parsed_allocations else None
        payment.status = 'manager_reviewed'
        payment.save(update_fields=['matched_unit', 'status'])

    return Response(ConfirmationSerializer(confirmation).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAdmin])
def api_pending_verifications(request):
    confirmations = (
        Confirmation.objects.filter(verification_status='pending')
        .select_related('payment', 'selected_unit')
        .prefetch_related('allocations__unit')
        .order_by('-confirmed_at')
    )
    return Response(ConfirmationSerializer(confirmations, many=True).data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def api_verify_confirmation(request, confirmation_id):
    confirmation = get_object_or_404(Confirmation, pk=confirmation_id)
    with transaction.atomic():
        confirmation.verification_status = 'verified'
        confirmation.verified_by = request.user.username if request.user.is_authenticated else 'Admin'
        confirmation.verified_at = now()
        confirmation.save(update_fields=['verification_status', 'verified_by', 'verified_at'])

        payment = confirmation.payment
        payment.status = 'confirmed'
        payment.save(update_fields=['status'])

        sync_master_log(confirmation)

    return Response({'detail': 'Payment successfully verified and logged to Master Ledger.'})


@api_view(['POST'])
@permission_classes([IsAdmin])
def api_reject_confirmation(request, confirmation_id):
    confirmation = get_object_or_404(Confirmation, pk=confirmation_id)
    rejection_comment = request.data.get('rejection_comment', '').strip()

    if not rejection_comment:
        return Response({'detail': 'Rejection comment is required.'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        confirmation.verification_status = 'rejected'
        confirmation.rejection_comment = rejection_comment
        confirmation.verified_by = request.user.username if request.user.is_authenticated else 'Admin'
        confirmation.verified_at = now()
        confirmation.save(update_fields=['verification_status', 'rejection_comment', 'verified_by', 'verified_at'])

        confirmation.payment.status = 'manual'
        confirmation.payment.save(update_fields=['status'])

    return Response({'detail': 'Confirmation rejected and sent back to manual review.'})
