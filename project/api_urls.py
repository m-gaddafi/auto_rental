from django.urls import include, path
from rest_framework.routers import DefaultRouter

from accounts.api import api_create_manager, api_login, api_logout, api_me
from accounts.views import UserViewSet
from apps.confirmations.api import (
    api_create_confirmation,
    api_pending_confirmations,
    api_pending_verifications,
    api_reject_confirmation,
    api_verify_confirmation,
)
from apps.masterlog.api import api_dashboard_stats, api_master_log
from apps.payments.api import (
    RawPaymentViewSet,
    api_import_payments,
    api_parse_payments,
)
from apps.units.api import PropertyViewSet, UnitViewSet, api_rent_sheet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'units', UnitViewSet, basename='unit')
router.register(r'payments', RawPaymentViewSet, basename='raw-payment')

urlpatterns = [
    # Auth endpoints
    path('auth/login/', api_login, name='api_login'),
    path('auth/logout/', api_logout, name='api_logout'),
    path('auth/me/', api_me, name='api_me'),
    path('auth/create-manager/', api_create_manager, name='api_create_manager'),

    # Units & Properties
    path('units/rent-sheet/', api_rent_sheet, name='api_rent_sheet'),

    # Payments parsing & import
    path('payments/parse/', api_parse_payments, name='api_parse_payments'),
    path('payments/import/', api_import_payments, name='api_import_payments'),

    # Confirmations & Verifications
    path('confirmations/pending/', api_pending_confirmations, name='api_pending_confirmations'),
    path('confirmations/', api_create_confirmation, name='api_create_confirmation'),
    path('confirmations/verifications/', api_pending_verifications, name='api_pending_verifications'),
    path('confirmations/<int:confirmation_id>/verify/', api_verify_confirmation, name='api_verify_confirmation'),
    path('confirmations/<int:confirmation_id>/reject/', api_reject_confirmation, name='api_reject_confirmation'),

    # Dashboard & Master Log
    path('dashboard/', api_dashboard_stats, name='api_dashboard_stats'),
    path('masterlog/', api_master_log, name='api_master_log'),

    # Routers (users, properties, units, payments)
    path('', include(router.urls)),
]
