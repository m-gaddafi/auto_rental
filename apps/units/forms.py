from django import forms

from .models import Property, Unit


class PropertyForm(forms.ModelForm):
    class Meta:
        model = Property
        fields = ['name', 'is_active']
        labels = {'name': 'Property name', 'is_active': 'Active property'}


class UnitForm(forms.ModelForm):
    property = forms.ModelChoiceField(
        queryset=Property.objects.filter(is_active=True).order_by('name'),
        label='Property',
    )

    class Meta:
        model = Unit
        fields = ['property', 'unit_id', 'tenant_name', 'tenant_phone', 'monthly_rate', 'is_active']
        labels = {
            'property': 'Property',
            'unit_id': 'Unit ID',
            'tenant_name': 'Tenant name',
            'tenant_phone': 'Tenant phone',
            'monthly_rate': 'Monthly rate',
            'is_active': 'Active unit',
        }
        help_texts = {
            'monthly_rate': 'Enter the monthly rental rate for the unit.',
        }
