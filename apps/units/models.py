from decimal import Decimal
from builtins import property as builtin_property

from django.db import models


class Property(models.Model):
    name = models.CharField(max_length=150, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Unit(models.Model):
    property = models.ForeignKey(Property, null=True, blank=True, on_delete=models.CASCADE, related_name='units')
    unit_id = models.CharField(max_length=50, unique=True)
    tenant_name = models.CharField(max_length=255, blank=True)
    tenant_phone = models.CharField(max_length=30, blank=True)
    monthly_rate = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.unit_id

    @builtin_property
    def total_paid(self):
        from apps.masterlog.models import MasterLogEntry

        total = MasterLogEntry.objects.filter(unit=self, status='confirmed').aggregate(total=models.Sum('amount_paid'))['total'] or Decimal('0')
        return Decimal(total)

    @builtin_property
    def current_balance(self):
        return self.monthly_rate - self.total_paid
