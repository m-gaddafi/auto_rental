from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required, user_passes_test
from django.shortcuts import redirect, render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .forms import ManagerCreationForm
from .serializers import UserSerializer

User = get_user_model()


def is_admin_or_staff(user):
    return user.is_authenticated and (user.is_superuser or user.is_staff or getattr(user, 'role', '') == 'admin')


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff or self.request.user.role == 'admin':
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    @action(detail=True, methods=['post'])
    def set_password(self, request, pk=None):
        user = self.get_object()
        if user != request.user and not request.user.is_staff:
            return Response({'detail': 'Not allowed'}, status=403)
        password = request.data.get('password')
        if not password:
            return Response({'detail': 'Password required'}, status=400)
        user.set_password(password)
        user.save()
        return Response({'detail': 'Password updated'})


@login_required
@user_passes_test(is_admin_or_staff)
def create_manager(request):
    if request.method == 'POST':
        form = ManagerCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('dashboard')
    else:
        form = ManagerCreationForm()
    return render(request, 'accounts/create_manager.html', {'form': form})
