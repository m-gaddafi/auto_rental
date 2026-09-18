from calendar import month_name
from datetime import date
from decimal import Decimal

from django.db.models import Sum

from apps.units.models import Unit

from .models import MasterLogEntry


# Keep one canonical, complete calendar for the unit accounting sheet.  The
# table is built from this list, so a new property/unit automatically has all
# twelve month columns without an administrator having to create them by hand.
MONTHS = [(month_name[number].lower(), month_name[number]) for number in range(1, 13)]


def sync_master_log(confirmation):
    """Replace the payment's master-log rows with its verified allocations."""
    payment = confirmation.payment
    MasterLogEntry.objects.filter(payment=payment).delete()

    allocations = list(confirmation.allocations.select_related('unit'))
    if allocations:
        MasterLogEntry.objects.bulk_create([
            MasterLogEntry(
                payment=payment,
                unit=allocation.unit,
                tenant_name=payment.sender_name,
                amount_paid=allocation.amount,
                status='verified',
                payment_status='partial',
                payment_month=allocation.payment_month,
                payment_year=allocation.payment_year,
                confirmation_tag=allocation.allocation_tag,
                confirmation_comment=confirmation.confirmation_comment,
            )
            for allocation in allocations
        ])
        _refresh_allocation_accounting(allocations)
        return

    MasterLogEntry.objects.create(
        payment=payment,
        unit=confirmation.selected_unit,
        tenant_name=payment.sender_name,
        amount_paid=payment.amount,
        status='verified',
        payment_status=confirmation.payment_status,
        payment_month=confirmation.payment_month,
        payment_year=confirmation.payment_year,
        confirmation_tag=confirmation.confirmation_tag,
        confirmation_comment=confirmation.confirmation_comment,
    )


def _refresh_allocation_accounting(allocations):
    """Update the accounting state for every unit/month touched by a payment.

    A verified allocation is the source of truth.  Recalculating the monthly
    total means split payments and later balance payments update the same unit
    correctly rather than treating each transaction in isolation.
    """
    affected_periods = {
        (allocation.unit_id, allocation.payment_month, allocation.payment_year)
        for allocation in allocations
        if allocation.unit_id and allocation.payment_month and allocation.payment_year
    }
    for unit_id, month, year in affected_periods:
        entries = MasterLogEntry.objects.filter(
            unit_id=unit_id,
            payment_month=month,
            payment_year=year,
            status='verified',
        )
        total = entries.aggregate(total=Sum('amount_paid'))['total'] or Decimal('0')
        rate = Unit.objects.only('monthly_rate').get(pk=unit_id).monthly_rate
        status = 'overpayment' if total > rate else 'full' if total == rate else 'partial'
        entries.update(payment_status=status)


def build_rent_sheet(year=None, property_obj=None):
    """Build the spreadsheet-style rental view, optionally for one property."""
    year = year or date.today().year
    units_query = Unit.objects.filter(is_active=True).select_related('property')
    if property_obj is not None:
        units_query = units_query.filter(property=property_obj)
    units = list(units_query.order_by('property__name', 'unit_id'))
    monthly_amounts = {
        (entry['unit_id'], entry['payment_month']): entry['total']
        for entry in (
            MasterLogEntry.objects.filter(payment_year=year, unit__isnull=False, status='verified')
            .values('unit_id', 'payment_month')
            .annotate(total=Sum('amount_paid'))
        )
    }
    rows = []
    for unit in units:
        cells = []
        for month_key, _ in MONTHS:
            amount = monthly_amounts.get((unit.id, month_key), Decimal('0')) or Decimal('0')
            state = 'paid-full' if amount >= unit.monthly_rate and amount > 0 else 'paid-partial' if amount > 0 else 'not-paid'
            cells.append({'amount': amount, 'state': state})
        rows.append({'unit': unit, 'cells': cells})

    monthly_totals = [
        sum((monthly_amounts.get((unit.id, month_key), Decimal('0')) or Decimal('0') for unit in units), Decimal('0'))
        for month_key, _ in MONTHS
    ]
    maximum_possible = sum((unit.monthly_rate for unit in units), Decimal('0'))
    recovery = [(total / maximum_possible * Decimal('100')) if maximum_possible else Decimal('0') for total in monthly_totals]
    return {'year': year, 'property': property_obj, 'months': MONTHS, 'rows': rows, 'monthly_totals': monthly_totals,
            'maximum_possible': maximum_possible, 'recovery': recovery}
