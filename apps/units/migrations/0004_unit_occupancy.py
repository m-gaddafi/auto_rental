from django.db import migrations, models


def set_existing_occupancy(apps, schema_editor):
    Unit = apps.get_model('units', 'Unit')
    for unit in Unit.objects.exclude(tenant_name='').iterator():
        unit.is_occupied = True
        unit.save(update_fields=['is_occupied'])


class Migration(migrations.Migration):
    dependencies = [
        ('units', '0003_create_msj_property'),
    ]

    operations = [
        migrations.AddField(
            model_name='unit',
            name='is_occupied',
            field=models.BooleanField(default=False),
        ),
        migrations.RunPython(set_existing_occupancy, migrations.RunPython.noop),
    ]
