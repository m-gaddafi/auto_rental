from django.urls import path
from .views import ingest_payments, review_payments

urlpatterns = [
    path('ingest/', ingest_payments, name='ingest_payments'),
    path('review/', review_payments, name='review_payments'),
]
