from django.db import migrations


def sync_active_with_occupancy(apps, schema_editor):
    Unit = apps.get_model('units', 'Unit')
    for unit in Unit.objects.all().iterator():
        unit.is_active = unit.is_occupied
        unit.save(update_fields=['is_active'])


class Migration(migrations.Migration):
    dependencies = [
        ('units', '0004_unit_occupancy'),
    ]

    operations = [
        migrations.RunPython(sync_active_with_occupancy, migrations.RunPython.noop),
    ]
