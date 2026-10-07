from rest_framework import serializers
from .models import RawPayment


class RawPaymentSerializer(serializers.ModelSerializer):
    matched_unit_name = serializers.CharField(source='matched_unit.unit_id', read_only=True)
    property_name = serializers.CharField(source='matched_unit.property.name', read_only=True)

    class Meta:
        model = RawPayment
        fields = [
            'id',
            'transaction_id',
            'payment_date',
            'payment_time',
            'sender_name',
            'sender_phone',
            'amount',
            'raw_text',
            'matched_unit',
            'matched_unit_name',
            'property_name',
            'status',
            'created_at',
            'updated_at',
        ]
