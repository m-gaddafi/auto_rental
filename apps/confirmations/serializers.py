from rest_framework import serializers
from .models import Confirmation, PaymentAllocation
from apps.payments.serializers import RawPaymentSerializer


class PaymentAllocationSerializer(serializers.ModelSerializer):
    unit_name = serializers.CharField(source='unit.unit_id', read_only=True)
    property_name = serializers.CharField(source='unit.property.name', read_only=True)

    class Meta:
        model = PaymentAllocation
        fields = [
            'id',
            'unit',
            'unit_name',
            'property_name',
            'amount',
            'allocation_tag',
            'payment_month',
            'payment_year',
            'comment',
        ]


class ConfirmationSerializer(serializers.ModelSerializer):
    payment_details = RawPaymentSerializer(source='payment', read_only=True)
    allocations = PaymentAllocationSerializer(many=True, read_only=True)
    selected_unit_name = serializers.CharField(source='selected_unit.unit_id', read_only=True)

    class Meta:
        model = Confirmation
        fields = [
            'id',
            'payment',
            'payment_details',
            'selected_unit',
            'selected_unit_name',
            'payment_status',
            'payment_month',
            'payment_year',
            'confirmation_tag',
            'confirmation_comment',
            'rejection_comment',
            'confirmed_by',
            'confirmed_at',
            'verification_status',
            'verified_by',
            'verified_at',
            'allocations',
            'allocation_total',
            'confirmed_units',
        ]
