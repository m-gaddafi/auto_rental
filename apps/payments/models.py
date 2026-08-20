from django.db import models
from apps.units.models import Unit


class RawPayment(models.Model):
    transaction_id = models.CharField(max_length=100, unique=True)
    payment_date = models.DateField(blank=True, null=True)
    payment_time = models.TimeField(blank=True, null=True)
    sender_name = models.CharField(max_length=255, blank=True)
    sender_phone = models.CharField(max_length=30, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    raw_text = models.TextField(blank=True)
    matched_unit = models.ForeignKey(Unit, null=True, blank=True, on_delete=models.SET_NULL, related_name='matched_payments')
    status = models.CharField(
        max_length=30,
        choices=[
            ('pending', 'Pending'),
            ('confirmed', 'Confirmed'),
            ('manual', 'Manual Review'),
            ('manager_reviewed', 'Manager reviewed'),
        ],
        default='pending',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.transaction_id or 'Payment'
