from django.urls import path
from .views import confirm_payment, pending_confirmations, pending_verifications, verify_confirmation

urlpatterns = [
    path('', pending_confirmations, name='pending_confirmations'),
    path('<int:payment_id>/confirm/', confirm_payment, name='confirm_payment'),
    path('verifications/', pending_verifications, name='pending_verifications'),
    path('verifications/<int:confirmation_id>/verify/', verify_confirmation, name='verify_confirmation'),
]
