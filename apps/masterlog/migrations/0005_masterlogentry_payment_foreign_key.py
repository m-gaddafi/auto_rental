from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('masterlog', '0004_masterlogentry_payment_year'),
    ]

    operations = [
        migrations.AlterField(
            model_name='masterlogentry',
            name='payment',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='master_entries',
                to='payments.rawpayment',
            ),
        ),
    ]