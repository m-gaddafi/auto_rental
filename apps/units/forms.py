from django import forms

from .models import Unit


class UnitForm(forms.ModelForm):
    class Meta:
        model = Unit
        fields = ['unit_id', 'tenant_name', 'tenant_phone', 'monthly_rate', 'is_active']
        labels = {
            'unit_id': 'Unit ID',
            'tenant_name': 'Tenant name',
            'tenant_phone': 'Tenant phone',
            'monthly_rate': 'Monthly rate',
            'is_active': 'Active unit',
        }
        help_texts = {
            'monthly_rate': 'Enter the monthly rental rate for the unit.',
        }
