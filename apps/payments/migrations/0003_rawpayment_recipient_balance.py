from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('payments', '0002_alter_rawpayment_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='rawpayment',
            name='recipient_name',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='rawpayment',
            name='balance',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True),
        ),
    ]
