from django.db import migrations, models


def add_role_column(apps, schema_editor):
    CustomUser = apps.get_model('accounts', 'CustomUser')
    with schema_editor.connection.cursor() as cursor:
        columns = {
            column.name
            for column in schema_editor.connection.introspection.get_table_description(
                cursor,
                CustomUser._meta.db_table,
            )
        }
    if 'role' not in columns:
        field = models.CharField(default='user', max_length=20)
        field.set_attributes_from_name('role')
        schema_editor.add_field(CustomUser, field)

class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[migrations.RunPython(add_role_column, migrations.RunPython.noop)],
            state_operations=[
                migrations.AddField(
                    model_name='customuser',
                    name='role',
                    field=models.CharField(default='user', max_length=20),
                ),
            ],
        ),
    ]
