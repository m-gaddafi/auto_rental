from rest_framework import serializers
from .models import Property, Unit


class PropertySerializer(serializers.ModelSerializer):
    unit_count = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = ['id', 'name', 'is_active', 'unit_count']

    def get_unit_count(self, obj):
        return obj.units.filter(is_active=True).count()


class UnitSerializer(serializers.ModelSerializer):
    property_name = serializers.CharField(source='property.name', read_only=True)
    total_paid = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    current_balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Unit
        fields = [
            'id',
            'property',
            'property_name',
            'unit_id',
            'tenant_name',
            'tenant_phone',
            'monthly_rate',
            'is_active',
            'is_occupied',
            'total_paid',
            'current_balance',
        ]
