from django.test import TestCase

from accounts.forms import ManagerCreationForm


class ManagerPermissionTest(TestCase):
    def test_manager_creation_saves_selected_capabilities(self):
        form = ManagerCreationForm(data={
            'username': 'payments-manager',
            'email': 'manager@example.com',
            'password': 'strong-password',
            'can_paste_payments': 'on',
            'can_verify_payments': 'on',
        })

        self.assertTrue(form.is_valid())
        manager = form.save()

        self.assertEqual(manager.role, 'manager')
        self.assertTrue(manager.can_paste_payments)
        self.assertTrue(manager.can_verify_payments)