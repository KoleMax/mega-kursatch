# Generated by Django 3.2 on 2021-05-09 03:13

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0020_auto_20210508_2336'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='statusrecord',
            options={'verbose_name': 'Смена статуса накладной', 'verbose_name_plural': 'Смены статусов накладных'},
        ),
        migrations.AddField(
            model_name='operation',
            name='cancelling_operation',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='core.operation', verbose_name='Операция возврата (если была)'),
        ),
    ]
