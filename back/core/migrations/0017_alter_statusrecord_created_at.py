# Generated by Django 3.2 on 2021-05-08 15:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0016_auto_20210506_0328'),
    ]

    operations = [
        migrations.AlterField(
            model_name='statusrecord',
            name='created_at',
            field=models.DateField(auto_now_add=True, verbose_name='дата создания'),
        ),
    ]
