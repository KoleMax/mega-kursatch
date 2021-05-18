# Generated by Django 3.2 on 2021-04-27 18:18

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Organization',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512, unique=True, verbose_name='Наименование')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='дата создания')),
                ('updated_at', models.DateTimeField(auto_now=True, null=True, verbose_name='дата обновления')),
            ],
            options={
                'verbose_name': 'Организация',
                'verbose_name_plural': 'Организации',
            },
        ),
        migrations.CreateModel(
            name='Station',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512, unique=True, verbose_name='Наименование')),
                ('ceo_name', models.CharField(max_length=512, verbose_name='ФИО руководтеля')),
                ('address', models.CharField(max_length=512, verbose_name='Адрес')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='дата создания')),
                ('updated_at', models.DateTimeField(auto_now=True, null=True, verbose_name='дата обновления')),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='stations', to='core.organization')),
            ],
            options={
                'verbose_name': 'Станция',
                'verbose_name_plural': 'Станции',
            },
        ),
    ]
