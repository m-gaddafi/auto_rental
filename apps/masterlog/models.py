from decimal import Decimal

from django.db import models

from apps.payments.models import RawPayment
from apps.units.models import Unit


class MasterLogEntry(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('full', 'Full Payment'),
        ('partial', 'Partial Payment'),
        ('overpayment', 'Over Payment'),
        ('unpaid', 'Not Paid'),
    ]

    MONTH_CHOICES = [
        ('', 'Select month'),
        ('january', 'January'),
        ('february', 'February'),
        ('march', 'March'),
        ('april', 'April'),
        ('may', 'May'),
        ('june', 'June'),
        ('july', 'July'),
        ('august', 'August'),
        ('september', 'September'),
        ('october', 'October'),
        ('november', 'November'),
        ('december', 'December'),
    ]

    payment = models.OneToOneField(RawPayment, on_delete=models.CASCADE, related_name='master_entry')
    unit = models.ForeignKey(Unit, null=True, blank=True, on_delete=models.SET_NULL, related_name='master_entries')
    tenant_name = models.CharField(max_length=255, blank=True)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='partial')
    payment_month = models.CharField(max_length=20, choices=MONTH_CHOICES, blank=True)
    payment_year = models.PositiveSmallIntegerField(null=True, blank=True)
    confirmation_tag = models.CharField(max_length=50, blank=True)
    confirmation_comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def current_balance(self):
        if not self.unit:
            return Decimal('0')
        return self.unit.monthly_rate - self.amount_paid

    def __str__(self):
        return f'{self.payment.transaction_id} - {self.unit.unit_id if self.unit else "n/a"}'
