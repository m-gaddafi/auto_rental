from django.urls import path
from .views import ingest_payments

urlpatterns = [
    path('ingest/', ingest_payments, name='ingest_payments'),
]
