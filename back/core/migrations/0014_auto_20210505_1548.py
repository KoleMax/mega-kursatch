# Generated by Django 3.2 on 2021-05-05 15:48

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0013_auto_20210505_1542'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='station',
            name='destination_station',
        ),
        migrations.AddField(
            model_name='destinationstation',
            name='station',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='destination_stations', to='core.station', verbose_name='Станция назначения'),
        ),
    ]
