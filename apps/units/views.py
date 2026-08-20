from django.contrib.auth.decorators import login_required, user_passes_test
from django.shortcuts import redirect, render

from apps.masterlog.services import build_rent_sheet

from .forms import UnitForm
from .models import Unit


def is_admin_or_staff(user):
    return user.is_authenticated and (user.is_superuser or user.is_staff or getattr(user, 'role', '') == 'admin')


@login_required
def units_dashboard(request):
    can_add_unit = is_admin_or_staff(request.user)
    return render(request, 'units/list.html', {'sheet': build_rent_sheet(), 'can_add_unit': can_add_unit})


@login_required
@user_passes_test(is_admin_or_staff)
def create_unit(request):
    if request.method == 'POST':
        form = UnitForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('units_dashboard')
    else:
        form = UnitForm()
    return render(request, 'units/create.html', {'form': form})
