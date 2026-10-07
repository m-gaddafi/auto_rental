from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import include, path

from project import spa

urlpatterns = [
    # Static assets for React Vite build
    path('assets/<path:path>', spa.serve_assets, name='frontend_assets'),
    path('favicon.svg', spa.serve_frontend_file, {'path': 'favicon.svg'}, name='frontend_favicon'),
    path('icons.svg', spa.serve_frontend_file, {'path': 'icons.svg'}, name='frontend_icons'),

    # React Single Page Application at root
    path('', spa.spa_view, name='home'),

    # Backend REST APIs and Django Admin
    path('admin/', admin.site.urls),
    path('api/', include('project.api_urls')),

    # Classic Django views (preserved for traditional access and testing)
    path('accounts/login/', auth_views.LoginView.as_view(template_name='auth/login.html'), name='login'),
    path('accounts/logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
    path('accounts/', include('accounts.urls')),
    path('units/', include('apps.units.urls')),
    path('payments/', include('apps.payments.urls')),
    path('confirmations/', include('apps.confirmations.urls')),
    path('dashboard/', include('apps.masterlog.urls')),
]
