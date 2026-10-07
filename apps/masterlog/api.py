from decimal import Decimal
from django.db.models import Max, Min, Q, Sum
from django.utils.timezone import now
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from accounts.permissions import IsManagerOrAdmin
from rest_framework.response import Response

from apps.confirmations.models import Confirmation
from apps.payments.models import RawPayment
from apps.units.models import Property, Unit
from .models import MasterLogEntry
from .serializers import MasterLogEntrySerializer


@api_view(['GET'])
@permission_classes([IsManagerOrAdmin])
def api_dashboard_stats(request):
    current_year = now().year
    pending_count = RawPayment.objects.filter(status='manual').count()
    verified_count = MasterLogEntry.objects.filter(status='verified').count()
    unit_count = Unit.objects.filter(is_active=True).count()
    property_count = Property.objects.filter(is_active=True).count()
    pending_verifications = Confirmation.objects.filter(verification_status='pending').count()

    rejected_confirmations = [
        {
            'id': c.id,
            'transaction_id': c.payment.transaction_id,
            'amount': float(c.payment.amount),
            'sender_name': c.payment.sender_name,
            'rejection_comment': c.rejection_comment,
            'verified_by': c.verified_by,
            'verified_at': c.verified_at,
        }
        for c in Confirmation.objects.filter(verification_status='rejected')
        .select_related('payment')
        .order_by('-verified_at')[:10]
    ]

    rate_range = Unit.objects.filter(is_active=True).aggregate(
        lowest_rate=Min('monthly_rate'),
        highest_rate=Max('monthly_rate'),
        total_monthly_potential=Sum('monthly_rate'),
    )

    year_revenue = MasterLogEntry.objects.filter(
        payment_year=current_year,
        status='verified',
    ).aggregate(total=Sum('amount_paid'))['total'] or Decimal('0')

    return Response({
        'pending_count': pending_count,
        'confirmed_count': verified_count,
        'unit_count': unit_count,
        'property_count': property_count,
        'pending_verifications': pending_verifications,
        'rejected_confirmations': rejected_confirmations,
        'lowest_rate': float(rate_range['lowest_rate'] or 0),
        'highest_rate': float(rate_range['highest_rate'] or 0),
        'total_monthly_potential': float(rate_range['total_monthly_potential'] or 0),
        'total_revenue_year': float(year_revenue),
        'year': current_year,
    })


@api_view(['GET'])
@permission_classes([IsManagerOrAdmin])
def api_master_log(request):
    query = request.query_params.get('q', '').strip()
    year_param = request.query_params.get('year')
    month_param = request.query_params.get('month')
    status_param = request.query_params.get('payment_status')

    qs = MasterLogEntry.objects.select_related('payment', 'unit', 'unit__property').order_by('-created_at')

    if query:
        qs = qs.filter(
            Q(payment__transaction_id__icontains=query)
            | Q(unit__unit_id__icontains=query)
            | Q(tenant_name__icontains=query)
            | Q(payment__sender_name__icontains=query)
            | Q(unit__property__name__icontains=query)
        )

    if year_param:
        try:
            qs = qs.filter(payment_year=int(year_param))
        except ValueError:
            pass

    if month_param:
        qs = qs.filter(payment_month__iexact=month_param)

    if status_param:
        qs = qs.filter(payment_status=status_param)

    return Response(MasterLogEntrySerializer(qs[:100], many=True).data)
