from django.test import TestCase
from django.urls import reverse

from accounts.forms import ManagerCreationForm
from accounts.models import CustomUser


class ManagerPermissionTest(TestCase):
    def test_manager_creation_saves_selected_capabilities(self):
        form = ManagerCreationForm(data={
            'username': 'payments-manager',
            'email': 'manager@example.com',
            'password': 'strong-password',
        })

        self.assertTrue(form.is_valid())
        manager = form.save()

        self.assertEqual(manager.role, 'manager')


class LoginRedirectTest(TestCase):
    def test_login_redirects_to_dashboard(self):
        CustomUser.objects.create_user(username='dashboard-user', password='password')

        response = self.client.post(reverse('login'), {
            'username': 'dashboard-user',
            'password': 'password',
        })

        self.assertRedirects(response, reverse('dashboard'))
