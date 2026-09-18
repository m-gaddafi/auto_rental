from django.db import migrations, models


def add_permission_columns(apps, schema_editor):
    CustomUser = apps.get_model('accounts', 'CustomUser')
    with schema_editor.connection.cursor() as cursor:
        columns = {
            column.name
            for column in schema_editor.connection.introspection.get_table_description(
                cursor,
                CustomUser._meta.db_table,
            )
        }
    for field_name in ('can_paste_payments', 'can_verify_payments'):
        if field_name not in columns:
            field = models.BooleanField(default=False)
            field.set_attributes_from_name(field_name)
            schema_editor.add_field(CustomUser, field)

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_customuser_role'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[migrations.RunPython(add_permission_columns, migrations.RunPython.noop)],
            state_operations=[
                migrations.AddField(
                    model_name='customuser',
                    name='can_paste_payments',
                    field=models.BooleanField(default=False),
                ),
                migrations.AddField(
                    model_name='customuser',
                    name='can_verify_payments',
                    field=models.BooleanField(default=False),
                ),
            ],
        ),
    ]