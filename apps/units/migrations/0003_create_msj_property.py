from django.db import migrations


MSJ_UNITS = {
    'MSJ 1': '250000.00', 'MSJ 2': '250000.00', 'MSJ 3': '250000.00',
    'MSJ 4': '250000.00', 'MSJ 5': '250000.00', 'MSJ 6': '300000.00',
    'MSJ 7': '300000.00', 'MSJ 8': '300000.00', 'MSJ 9': '300000.00',
    'MSJ 10': '300000.00', 'MSJ 68': '350000.00', 'MSJ 69': '350000.00',
    'MSJ 70': '400000.00', 'MSJ 71': '400000.00', 'MSJ 72': '350000.00',
    'MSJ 73': '350000.00', 'MSJ 74': '350000.00', 'MSJ 75': '350000.00',
}


def create_msj_property(apps, schema_editor):
    Property = apps.get_model('units', 'Property')
    Unit = apps.get_model('units', 'Unit')
    msj, _ = Property.objects.get_or_create(name='MSJ', defaults={'is_active': True})
    for unit_id, rate in MSJ_UNITS.items():
        unit, _ = Unit.objects.get_or_create(
            unit_id=unit_id,
            defaults={'monthly_rate': rate, 'is_active': True, 'property': msj},
        )
        # Do not move an explicitly filed unit from a different property.
        if unit.property_id is None:
            unit.property = msj
            unit.save(update_fields=['property'])


def remove_msj_property(apps, schema_editor):
    # Preserve accounting data on rollback; this migration only seeds setup data.
    pass


class Migration(migrations.Migration):
    dependencies = [('units', '0002_property_unit_property')]

    operations = [migrations.RunPython(create_msj_property, remove_msj_property)]
