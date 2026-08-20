from django.urls import path
from .views import create_unit, units_dashboard

urlpatterns = [
    path('', units_dashboard, name='units_dashboard'),
    path('create/', create_unit, name='create_unit'),
]
