from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.shortcuts import render
from django.urls import include, path

from apps.units.models import Unit


def home(request):
    units = Unit.objects.filter(is_active=True).order_by('unit_id')
    return render(request, 'home.html', {'units': units})


urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('accounts/login/', auth_views.LoginView.as_view(template_name='auth/login.html'), name='login'),
    path('accounts/logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
    path('accounts/', include('accounts.urls')),
    path('api/', include('accounts.urls')),
    path('units/', include('apps.units.urls')),
    path('payments/', include('apps.payments.urls')),
    path('confirmations/', include('apps.confirmations.urls')),
    path('dashboard/', include('apps.masterlog.urls')),
]
