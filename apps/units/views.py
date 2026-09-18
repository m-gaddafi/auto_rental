from django.contrib.auth.decorators import login_required, user_passes_test
from django.shortcuts import get_object_or_404, redirect, render
from django.utils.timezone import now

from apps.masterlog.services import build_rent_sheet

from .forms import PropertyForm, UnitForm
from .models import Property, Unit


def is_admin_or_staff(user):
    return user.is_authenticated and (user.is_superuser or user.is_staff or getattr(user, 'role', '') == 'admin')


@login_required
def units_dashboard(request):
    can_add_unit = is_admin_or_staff(request.user)
    try:
        year = int(request.GET.get('year', now().year))
    except (TypeError, ValueError):
        year = now().year
    return render(request, 'units/list.html', {
        'sheet': build_rent_sheet(year),
        'can_add_unit': can_add_unit,
        'properties': Property.objects.prefetch_related('units').order_by('name'),
    })


@login_required
def property_rent_sheet(request, property_id):
    """Show an Excel-sheet style ledger for one property only."""
    property_obj = get_object_or_404(Property, pk=property_id)
    try:
        year = int(request.GET.get('year', now().year))
    except (TypeError, ValueError):
        year = now().year
    return render(request, 'units/property_sheet.html', {
        'property': property_obj,
        'sheet': build_rent_sheet(year, property_obj),
        'can_add_unit': is_admin_or_staff(request.user),
    })


@login_required
@user_passes_test(is_admin_or_staff)
def create_unit(request):
    if request.method == 'POST':
        form = UnitForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('units_dashboard')
    else:
        # A property-table page can send the administrator here with its
        # property preselected, preventing units from being filed elsewhere.
        form = UnitForm(initial={'property': request.GET.get('property', '')})
    return render(request, 'units/create.html', {'form': form})


@login_required
@user_passes_test(is_admin_or_staff)
def create_property(request):
    if request.method == 'POST':
        form = PropertyForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('units_dashboard')
    else:
        form = PropertyForm()
    return render(request, 'units/create_property.html', {'form': form})
