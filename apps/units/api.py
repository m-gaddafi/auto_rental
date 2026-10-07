from datetime import date
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from accounts.permissions import IsManagerOrAdmin
from rest_framework.response import Response

from apps.masterlog.services import build_rent_sheet
from .models import Property, Unit
from .serializers import PropertySerializer, UnitSerializer


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all().order_by('name')
    serializer_class = PropertySerializer
    permission_classes = [IsManagerOrAdmin]


class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all().select_related('property').order_by('unit_id')
    serializer_class = UnitSerializer
    permission_classes = [IsManagerOrAdmin]

    def get_queryset(self):
        qs = Unit.objects.all().select_related('property').order_by('unit_id')
        
        # Status filtering
        status_param = self.request.query_params.get('status')
        if status_param == 'active':
            qs = qs.filter(is_active=True)
        elif status_param == 'inactive':
            qs = qs.filter(is_active=False)

        property_id = self.request.query_params.get('property_id')
        if property_id:
            qs = qs.filter(property_id=property_id)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(unit_id__icontains=search) | qs.filter(tenant_name__icontains=search)

        return qs

    @action(detail=True, methods=['post', 'patch'])
    def toggle_status(self, request, pk=None):
        unit = self.get_object()
        new_status = request.data.get('is_active')
        if new_status is not None:
            unit.is_active = bool(new_status)
        else:
            unit.is_active = not unit.is_active
        unit.save(update_fields=['is_active'])
        return Response(self.get_serializer(unit).data)


@api_view(['GET'])
@permission_classes([IsManagerOrAdmin])
def api_rent_sheet(request):
    try:
        year = int(request.query_params.get('year', date.today().year))
    except (TypeError, ValueError):
        year = date.today().year

    property_id = request.query_params.get('property_id')
    property_obj = None
    if property_id:
        property_obj = get_object_or_404(Property, pk=property_id)

    sheet = build_rent_sheet(year=year, property_obj=property_obj)

    # Format rows for JSON serialization
    serialized_rows = []
    for r in sheet['rows']:
        u = r['unit']
        serialized_rows.append({
            'unit': {
                'id': u.id,
                'unit_id': u.unit_id,
                'property_id': u.property_id,
                'property_name': u.property.name if u.property else None,
                'tenant_name': u.tenant_name,
                'tenant_phone': u.tenant_phone,
                'monthly_rate': float(u.monthly_rate),
                'total_paid': float(u.total_paid),
                'current_balance': float(u.current_balance),
                'is_active': u.is_active,
            },
            'cells': [{'amount': float(c['amount']), 'state': c['state']} for c in r['cells']],
        })

    return Response({
        'year': sheet['year'],
        'property': {'id': sheet['property'].id, 'name': sheet['property'].name} if sheet['property'] else None,
        'months': sheet['months'],
        'rows': serialized_rows,
        'monthly_totals': [float(t) for t in sheet['monthly_totals']],
        'maximum_possible': float(sheet['maximum_possible']),
        'recovery': [float(rec) for rec in sheet['recovery']],
    })
