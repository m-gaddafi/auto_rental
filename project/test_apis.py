from decimal import Decimal
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from apps.confirmations.models import Confirmation
from apps.payments.models import RawPayment
from apps.units.models import Property, Unit

User = get_user_model()


class RestApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='apitestuser',
            password='password123',
            role='admin',
        )
        self.client.force_login(self.user)
        self.prop = Property.objects.create(name='Sunset Heights')
        self.unit = Unit.objects.create(
            property=self.prop,
            unit_id='SH-101',
            tenant_name='Jane Doe',
            tenant_phone='256700000001',
            monthly_rate=Decimal('500000'),
        )
        self.payment = RawPayment.objects.create(
            transaction_id='TXN-TEST-001',
            sender_name='Jane Doe',
            sender_phone='256700000001',
            amount=Decimal('500000'),
            status='manual',
        )

    def test_dashboard_api(self):
        response = self.client.get('/api/dashboard/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('pending_count', data)
        self.assertIn('unit_count', data)
        self.assertGreaterEqual(data['unit_count'], 1)
        self.assertGreaterEqual(data['pending_count'], 1)

    def test_auth_login_and_me_api(self):
        self.client.logout()
        login_res = self.client.post('/api/auth/login/', {
            'username': 'apitestuser',
            'password': 'password123',
        }, content_type='application/json')
        self.assertEqual(login_res.status_code, 200)
        self.assertEqual(login_res.json()['user']['username'], 'apitestuser')

        me_res = self.client.get('/api/auth/me/')
        self.assertEqual(me_res.status_code, 200)
        self.assertTrue(me_res.json()['authenticated'])

    def test_rent_sheet_api(self):
        response = self.client.get(f'/api/units/rent-sheet/?year=2026&property_id={self.prop.id}')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('rows', data)
        self.assertEqual(len(data['rows']), 1)
        self.assertEqual(data['rows'][0]['unit']['unit_id'], 'SH-101')

    def test_payment_parse_api(self):
        sample_sms = "TxnID: MTN123456 Date: 05/10/2026 Time: 14:30 From: John Smith Tel: 256770000000 Amount: UGX 300,000"
        response = self.client.post('/api/payments/parse/', {
            'raw_text': sample_sms,
        }, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['transactions'][0]['transaction_id'], 'MTN123456')
        self.assertEqual(data['transactions'][0]['amount'], 300000.0)

    def test_confirmation_and_verification_api(self):
        # 1. Manager allocates and creates confirmation
        conf_res = self.client.post('/api/confirmations/', {
            'payment_id': self.payment.id,
            'confirmation_comment': 'Rent payment for October',
            'allocations': [
                {
                    'unit': self.unit.id,
                    'amount': 500000,
                    'tag': 'full',
                    'month': 'october',
                    'year': 2026,
                }
            ],
        }, content_type='application/json')
        self.assertEqual(conf_res.status_code, 201)
        conf_id = conf_res.json()['id']

        # Payment status should now be manager_reviewed
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, 'manager_reviewed')

        # 2. Admin verifies confirmation
        verify_res = self.client.post(f'/api/confirmations/{conf_id}/verify/')
        self.assertEqual(verify_res.status_code, 200)

        # Payment status should now be confirmed
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, 'confirmed')

        # Master log entry should be created
        master_res = self.client.get('/api/masterlog/')
        self.assertEqual(master_res.status_code, 200)
        self.assertEqual(len(master_res.json()), 1)
        self.assertEqual(master_res.json()[0]['amount_paid'], '500000.00')
