from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('confirmations', '0007_paymentallocation'),
    ]

    operations = [
        migrations.AddField(
            model_name='confirmation',
            name='rejection_comment',
            field=models.TextField(blank=True),
        ),
    ]