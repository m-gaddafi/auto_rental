from decimal import Decimal

from django.db.models import Sum
from django.test import TestCase

from apps.confirmations.models import Confirmation, PaymentAllocation
from apps.payments.models import RawPayment
from apps.units.models import Unit


from apps.confirmations.forms import ConfirmationForm


class PaymentAllocationTest(TestCase):
    def test_total_allocations_matches_payment_amount(self):
        payment = RawPayment.objects.create(
            transaction_id='TX-ALLOC-001',
            amount=Decimal('5000.00'),
            sender_name='Jane Doe',
            sender_phone='0770000000',
        )
        confirmation = Confirmation.objects.create(
            payment=payment,
            confirmation_tag='U-101',
            confirmed_by='manager',
        )
        unit_1 = Unit.objects.create(unit_id='U-101', monthly_rate=Decimal('3000.00'))
        unit_2 = Unit.objects.create(unit_id='U-102', monthly_rate=Decimal('2000.00'))

        PaymentAllocation.objects.create(
            confirmation=confirmation,
            unit=unit_1,
            amount=Decimal('3000.00'),
            allocation_tag='part',
            payment_month='january',
            payment_year=2026,
        )
        PaymentAllocation.objects.create(
            confirmation=confirmation,
            unit=unit_2,
            amount=Decimal('2000.00'),
            allocation_tag='bal',
            payment_month='january',
            payment_year=2026,
        )

        total = confirmation.allocations.aggregate(total=Sum('amount'))['total'] or Decimal('0')
        self.assertEqual(total, Decimal('5000.00'))

    def test_manager_comment_is_required_on_confirmation_form(self):
        form = ConfirmationForm(
            data={
                'payment_id': 1,
                'allocation_unit_1': 'U-101',
                'allocation_amount_1': '5000.00',
                'allocation_tag_1': 'full',
                'allocation_month_1': 'january',
                'allocation_year_1': '2026',
                'confirmation_comment': '',
            }
        )

        self.assertFalse(form.is_valid())
        self.assertIn('confirmation_comment', form.errors)
