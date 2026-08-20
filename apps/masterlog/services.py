from decimal import Decimal

from django.db.models import Sum

from apps.units.models import Unit

from .models import MasterLogEntry


MONTHS = [
    ('april', 'April'), ('may', 'May'), ('june', 'June'),
    ('july', 'July'), ('august', 'August'), ('september', 'September'),
]


def build_rent_sheet(year=2026):
    """Build the spreadsheet-style rental view from master-log entries."""
    units = list(Unit.objects.filter(is_active=True).order_by('unit_id'))
    monthly_amounts = {
        (entry['unit_id'], entry['payment_month']): entry['total']
        for entry in (
            MasterLogEntry.objects.filter(payment_year=year, unit__isnull=False)
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
    return {'year': year, 'months': MONTHS, 'rows': rows, 'monthly_totals': monthly_totals,
            'maximum_possible': maximum_possible, 'recovery': recovery}
