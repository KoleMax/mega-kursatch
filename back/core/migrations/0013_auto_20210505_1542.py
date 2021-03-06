# Generated by Django 3.2 on 2021-05-05 15:42

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0012_fuelmark'),
    ]

    operations = [
        migrations.CreateModel(
            name='DestinationStation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512, unique=True, verbose_name='Наименование')),
            ],
            options={
                'verbose_name': 'Станция назначения',
                'verbose_name_plural': 'Станции назначения',
            },
        ),
        migrations.AddField(
            model_name='contractobject',
            name='amount',
            field=models.IntegerField(blank=True, null=True, verbose_name='Количество'),
        ),
        migrations.AddField(
            model_name='contractobject',
            name='fuel_mark',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='core.fuelmark', verbose_name='Марка топлива'),
        ),
        migrations.AddField(
            model_name='contractobject',
            name='price',
            field=models.IntegerField(blank=True, null=True, verbose_name='Стоимость'),
        ),
        migrations.AddField(
            model_name='contractobject',
            name='shipper',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='core.counterparty', verbose_name='Грузоотправитель'),
        ),
        migrations.AddField(
            model_name='contractobject',
            name='shipper_station',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='core.deliverystation', verbose_name='Станция отгрузки'),
        ),
        migrations.AddField(
            model_name='contractobject',
            name='station',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='core.station', verbose_name='Станция'),
        ),
        migrations.AddField(
            model_name='contractobject',
            name='destination_station',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='core.destinationstation', verbose_name='Станция назначения'),
        ),
        migrations.AlterField(
            model_name='station',
            name='destination_station',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='stations', to='core.destinationstation', verbose_name='Станция назначения'),
        ),
    ]
