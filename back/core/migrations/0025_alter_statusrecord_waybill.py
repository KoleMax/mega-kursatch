# Generated by Django 3.2 on 2021-05-10 11:22

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0024_alter_waybill_operation'),
    ]

    operations = [
        migrations.AlterField(
            model_name='statusrecord',
            name='waybill',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='status', to='core.waybill', verbose_name='Накладная'),
        ),
    ]
