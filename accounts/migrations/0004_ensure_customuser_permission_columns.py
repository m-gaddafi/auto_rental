from django.db import migrations


def ensure_permission_columns(apps, schema_editor):
    """Create permission columns when older conditional migrations skipped them."""
    CustomUser = apps.get_model('accounts', 'CustomUser')
    table_name = CustomUser._meta.db_table
    with schema_editor.connection.cursor() as cursor:
        columns = {
            column.name
            for column in schema_editor.connection.introspection.get_table_description(cursor, table_name)
        }

    quoted_table = schema_editor.quote_name(table_name)
    for column_name in ('can_paste_payments', 'can_verify_payments'):
        if column_name not in columns:
            schema_editor.execute(
                f'ALTER TABLE {quoted_table} ADD COLUMN '
                f'{schema_editor.quote_name(column_name)} bool NOT NULL DEFAULT 0'
            )


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0003_customuser_permissions'),
    ]

    operations = [
        migrations.RunPython(ensure_permission_columns, migrations.RunPython.noop),
    ]
