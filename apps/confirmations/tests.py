from datetime import datetime
from decimal import Decimal

from django.db.models import Sum
from django.test import TestCase
from django.urls import reverse

from apps.confirmations.models import Confirmation, PaymentAllocation
from apps.masterlog.models import MasterLogEntry
from apps.masterlog.services import sync_master_log
from apps.payments.models import RawPayment
from apps.units.models import Unit
from accounts.models import CustomUser


from apps.confirmations.forms import ConfirmationForm


class PaymentAllocationTest(TestCase):
    def test_admin_verification_creates_master_log_by_unit_and_month(self):
        payment = RawPayment.objects.create(
            transaction_id='TX-VERIFY-001',
            amount=Decimal('5000.00'),
            sender_name='Jane Doe',
        )
        confirmation = Confirmation.objects.create(
            payment=payment,
            confirmation_tag='allocation',
            confirmation_comment='Verified allocation',
            confirmed_by='manager',
        )
        january_unit = Unit.objects.create(unit_id='U-101', tenant_name='January Tenant')
        february_unit = Unit.objects.create(unit_id='U-102', tenant_name='February Tenant')
        PaymentAllocation.objects.create(
            confirmation=confirmation,
            unit=january_unit,
            amount=Decimal('3000.00'),
            allocation_tag='part',
            payment_month='january',
            payment_year=2026,
        )
        PaymentAllocation.objects.create(
            confirmation=confirmation,
            unit=february_unit,
            amount=Decimal('2000.00'),
            allocation_tag='bal',
            payment_month='february',
            payment_year=2026,
        )

        confirmation.verification_status = 'verified'
        payment.status = 'confirmed'
        confirmation.save(update_fields=['verification_status'])
        payment.save(update_fields=['status'])
        sync_master_log(confirmation)
        entries = MasterLogEntry.objects.filter(payment=payment).order_by('unit__unit_id')
        self.assertEqual(entries.count(), 2)
        self.assertEqual(
            list(entries.values_list('unit__unit_id', 'payment_month', 'amount_paid')),
            [
                ('U-101', 'january', Decimal('3000.00')),
                ('U-102', 'february', Decimal('2000.00')),
            ],
        )

        sync_master_log(confirmation)
        self.assertEqual(MasterLogEntry.objects.filter(payment=payment).count(), 2)

    def test_confirmation_form_only_allows_active_units(self):
        active_unit = Unit.objects.create(unit_id='U-101', is_active=True)
        inactive_unit = Unit.objects.create(unit_id='U-102', is_active=False)

        form = ConfirmationForm(
            data={
                'payment_id': 1,
                'allocation_unit_1': str(active_unit.pk),
                'allocation_amount_1': '5000.00',
                'allocation_tag_1': 'full',
                'allocation_month_1': 'january',
                'allocation_year_1': '2026',
                'confirmation_comment': 'Payment confirmed',
            }
        )

        self.assertTrue(form.is_valid())
        self.assertEqual(form.get_allocation_rows()[0]['unit'].pk, active_unit.pk)
        self.assertNotIn(inactive_unit, form.fields['allocation_unit_1'].queryset)

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

    def test_verification_updates_the_allocated_units_monthly_accounting(self):
        unit = Unit.objects.create(unit_id='U-ACCOUNTING', monthly_rate=Decimal('5000.00'))
        first_payment = RawPayment.objects.create(transaction_id='TX-ACCOUNTING-1', amount=Decimal('3000.00'))
        first_confirmation = Confirmation.objects.create(payment=first_payment, confirmation_tag='part')
        PaymentAllocation.objects.create(
            confirmation=first_confirmation, unit=unit, amount=Decimal('3000.00'),
            allocation_tag='part', payment_month='january', payment_year=2026,
        )
        sync_master_log(first_confirmation)

        second_payment = RawPayment.objects.create(transaction_id='TX-ACCOUNTING-2', amount=Decimal('2000.00'))
        second_confirmation = Confirmation.objects.create(payment=second_payment, confirmation_tag='bal')
        PaymentAllocation.objects.create(
            confirmation=second_confirmation, unit=unit, amount=Decimal('2000.00'),
            allocation_tag='bal', payment_month='january', payment_year=2026,
        )
        sync_master_log(second_confirmation)

        statuses = MasterLogEntry.objects.filter(
            unit=unit, payment_month='january', payment_year=2026,
        ).values_list('payment_status', flat=True)
        self.assertEqual(set(statuses), {'full'})

    def test_manager_comment_is_optional_on_confirmation_form(self):
        unit = Unit.objects.create(unit_id='U-101')
        form = ConfirmationForm(
            data={
                'payment_id': 1,
                'allocation_unit_1': str(unit.pk),
                'allocation_amount_1': '5000.00',
                'allocation_tag_1': 'full',
                'allocation_month_1': 'january',
                'allocation_year_1': '2026',
                'confirmation_comment': '',
            }
        )

        self.assertTrue(form.is_valid())
        self.assertEqual(form.cleaned_data['confirmation_comment'], '')

    def test_allocation_defaults_to_the_current_month_and_year(self):
        form = ConfirmationForm(initial={'payment_id': 1})

        self.assertEqual(form.fields['allocation_month_1'].initial, datetime.now().strftime('%B').lower())
        self.assertEqual(form.fields['allocation_year_1'].initial, str(datetime.now().year))

    def test_admin_rejection_requires_comment_and_returns_payment_to_manager(self):
        admin = CustomUser.objects.create_superuser(username='admin', password='password')
        payment = RawPayment.objects.create(
            transaction_id='TX-REJECT-001',
            amount=Decimal('5000.00'),
        )
        confirmation = Confirmation.objects.create(
            payment=payment,
            confirmation_tag='full',
            confirmed_by='manager',
        )

        self.client.force_login(admin)
        response = self.client.post(reverse('verify_confirmation', args=[confirmation.id]), {'action': 'reject'})

        self.assertEqual(response.status_code, 200)
        confirmation.refresh_from_db()
        payment.refresh_from_db()
        self.assertEqual(confirmation.verification_status, 'pending')
        self.assertEqual(payment.status, 'pending')

        response = self.client.post(
            reverse('verify_confirmation', args=[confirmation.id]),
            {'action': 'reject', 'rejection_comment': 'Please correct the unit allocation.'},
        )

        self.assertRedirects(response, reverse('pending_verifications'))
        confirmation.refresh_from_db()
        payment.refresh_from_db()
        self.assertEqual(confirmation.verification_status, 'rejected')
        self.assertEqual(confirmation.rejection_comment, 'Please correct the unit allocation.')
        self.assertEqual(payment.status, 'manual')

    def test_admin_can_verify_a_payment_without_a_comment(self):
        admin = CustomUser.objects.create_superuser(username='verify-admin', password='password')
        payment = RawPayment.objects.create(transaction_id='TX-VERIFY-NOTELESS', amount=Decimal('5000.00'))
        confirmation = Confirmation.objects.create(
            payment=payment,
            confirmation_tag='full',
            confirmation_comment='',
            confirmed_by='manager',
        )

        self.client.force_login(admin)
        response = self.client.post(reverse('verify_confirmation', args=[confirmation.id]), {'action': 'verify'})

        self.assertRedirects(response, reverse('pending_verifications'))
        confirmation.refresh_from_db()
        payment.refresh_from_db()
        self.assertEqual(confirmation.verification_status, 'verified')
        self.assertEqual(confirmation.confirmation_comment, '')
        self.assertEqual(payment.status, 'confirmed')
