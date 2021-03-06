# Generated by Django 3.2 on 2021-05-09 06:39

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0021_auto_20210509_0313'),
    ]

    operations = [
        migrations.AddField(
            model_name='operation',
            name='dest_station',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='operations_as_destination', to='core.station', verbose_name='Станция назначения (Внутреннее перемещение)'),
        ),
        migrations.AddField(
            model_name='operation',
            name='fuel_type',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='core.fueltype', verbose_name='Вид топлива (Внутреннее перемещение)'),
        ),
        migrations.AddField(
            model_name='operation',
            name='source_station',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='core.station', verbose_name='Станция отправления (Внутреннее перемещение)'),
        ),
    ]
