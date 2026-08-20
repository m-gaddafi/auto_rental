from django.urls import path
from .views import dashboard, master_log

urlpatterns = [
    path('', dashboard, name='dashboard'),
    path('master-log/', master_log, name='master_log'),
]
