from rest_framework.permissions import BasePermission

def is_admin(user):
    return user.is_authenticated and (user.is_superuser or user.is_staff or user.role == 'admin')

class IsAdmin(BasePermission):
    """Allows access only to admin users."""
    def has_permission(self, request, view):
        return is_admin(request.user)

class IsManager(BasePermission):
    """Allows access only to manager users."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'manager'

class IsManagerOrAdmin(BasePermission):
    """Allows access to managers or admins."""
    def has_permission(self, request, view):
        return is_admin(request.user) or (request.user and request.user.is_authenticated and request.user.role == 'manager')