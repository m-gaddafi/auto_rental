from rest_framework import serializers
from .models import MasterLogEntry


class MasterLogEntrySerializer(serializers.ModelSerializer):
    unit_name = serializers.CharField(source='unit.unit_id', read_only=True)
    property_name = serializers.CharField(source='unit.property.name', read_only=True)
    transaction_id = serializers.CharField(source='payment.transaction_id', read_only=True)
    payment_date = serializers.DateField(source='payment.payment_date', read_only=True)
    sender_phone = serializers.CharField(source='payment.sender_phone', read_only=True)

    class Meta:
        model = MasterLogEntry
        fields = [
            'id',
            'transaction_id',
            'payment',
            'payment_date',
            'sender_phone',
            'unit',
            'unit_name',
            'property_name',
            'tenant_name',
            'amount_paid',
            'status',
            'payment_status',
            'payment_month',
            'payment_year',
            'confirmation_tag',
            'confirmation_comment',
            'created_at',
            'updated_at',
        ]
