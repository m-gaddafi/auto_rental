from django.urls import path
from .views import create_property, create_unit, property_rent_sheet, units_dashboard

urlpatterns = [
    path('', units_dashboard, name='units_dashboard'),
    path('properties/<int:property_id>/', property_rent_sheet, name='property_rent_sheet'),
    path('create/', create_unit, name='create_unit'),
    path('properties/create/', create_property, name='create_property'),
]
