from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_customuser_role'),
    ]

    operations = [
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
    ]