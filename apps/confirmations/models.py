from decimal import Decimal

from django.db import models
from django.db.models import Sum

from apps.payments.models import RawPayment
from apps.units.models import Unit


class Confirmation(models.Model):
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

    VERIFICATION_STATUS_CHOICES = [
        ('pending', 'Pending verification'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]

    payment = models.ForeignKey(RawPayment, on_delete=models.CASCADE, related_name='confirmations')
    selected_unit = models.ForeignKey(Unit, null=True, blank=True, on_delete=models.SET_NULL, related_name='confirmations')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='partial')
    payment_month = models.CharField(max_length=20, choices=MONTH_CHOICES, blank=True)
    payment_year = models.PositiveSmallIntegerField(null=True, blank=True)
    confirmation_tag = models.CharField(max_length=50)
    confirmation_comment = models.TextField(blank=True)
    rejection_comment = models.TextField(blank=True)
    confirmed_by = models.CharField(max_length=100, blank=True)
    confirmed_at = models.DateTimeField(auto_now_add=True)
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS_CHOICES, default='pending')
    verified_by = models.CharField(max_length=100, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    @property
    def allocation_total(self):
        total = self.allocations.aggregate(total=Sum('amount'))['total'] or Decimal('0')
        return Decimal(total)

    @property
    def confirmed_units(self):
        return ', '.join(
            allocation.unit.unit_id
            for allocation in self.allocations.all()
            if allocation.unit
        ) or '-'

    def __str__(self):
        return f'{self.payment.transaction_id} -> {self.confirmation_tag} ({self.verification_status})'


class PaymentAllocation(models.Model):
    ALLOCATION_TAG_CHOICES = [
        ('full', 'Full'),
        ('part', 'Part'),
        ('bal', 'Bal'),
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

    confirmation = models.ForeignKey(Confirmation, on_delete=models.CASCADE, related_name='allocations')
    unit = models.ForeignKey(Unit, null=True, blank=True, on_delete=models.SET_NULL, related_name='payment_allocations')
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    allocation_tag = models.CharField(max_length=10, choices=ALLOCATION_TAG_CHOICES, default='part')
    payment_month = models.CharField(max_length=20, choices=MONTH_CHOICES, blank=True)
    payment_year = models.PositiveSmallIntegerField(null=True, blank=True)
    comment = models.TextField(blank=True)

    def __str__(self):
        unit_name = self.unit.unit_id if self.unit else 'n/a'
        return f'{unit_name} - {self.amount}'
