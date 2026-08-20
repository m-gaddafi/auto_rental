from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, create_manager

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('create-manager/', create_manager, name='create_manager'),
]
