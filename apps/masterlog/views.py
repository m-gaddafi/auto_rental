from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.shortcuts import render
from django.utils.timezone import now

from apps.confirmations.models import Confirmation
from apps.payments.models import RawPayment
from apps.units.models import Unit
from .models import MasterLogEntry
from .services import build_rent_sheet


@login_required
def master_log(request):
    query = request.GET.get('q', '').strip()
    try:
        year = int(request.GET.get('year', now().year))
    except (TypeError, ValueError):
        year = now().year
    search_results = MasterLogEntry.objects.select_related('payment', 'unit').order_by('-created_at')
    if query:
        search_results = search_results.filter(
            Q(payment__transaction_id__icontains=query)
            | Q(unit__unit_id__icontains=query)
            | Q(tenant_name__icontains=query)
            | Q(payment__sender_name__icontains=query)
        )
    else:
        search_results = search_results.none()
    return render(request, 'masterlog/master_log.html', {
        'sheet': build_rent_sheet(year),
        'query': query,
        'search_results': search_results[:50],
    })


@login_required
def dashboard(request):
    entries = MasterLogEntry.objects.select_related('payment', 'unit').order_by('-created_at')[:10]
    pending_count = RawPayment.objects.filter(status='manual').count()
    verified_count = MasterLogEntry.objects.filter(status='verified').count()
    unit_count = Unit.objects.filter(is_active=True).count()
    pending_verifications = 0
    rejected_confirmations = Confirmation.objects.filter(
        verification_status='rejected',
    ).select_related('payment').order_by('-verified_at')[:10]
    if request.user.is_authenticated and (request.user.is_superuser or request.user.is_staff or getattr(request.user, 'role', '') == 'admin'):
        pending_verifications = Confirmation.objects.filter(verification_status='pending').count()
    units = Unit.objects.filter(is_active=True).order_by('unit_id')
    return render(request, 'masterlog/dashboard.html', {
        'entries': entries,
        'pending_count': pending_count,
        'confirmed_count': verified_count,
        'unit_count': unit_count,
        'pending_verifications': pending_verifications,
        'rejected_confirmations': rejected_confirmations,
        'units': units,
    })
