from django import forms
from django.contrib import admin
from django.db.models import ManyToManyField
from django.forms import CheckboxSelectMultiple
from django.utils.html import format_html

from core import models


# Register your models here.


@admin.register(models.FuelType)
class FuelTypeAdmin(admin.ModelAdmin):
    list_display = ("name", )


@admin.register(models.FuelMark)
class FuelMarkAdmin(admin.ModelAdmin):
    list_display = ("name", "fuel_type")


class OrganizationForm(forms.ModelForm):

    class Meta:
        models = models.Organization
        fields = [
            "name"
        ]


@admin.register(models.Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")


class FuelTypeInline(admin.StackedInline):
    extra = 0
    model = models.StationToFuelBalance


class DestinationStationInline(admin.StackedInline):
    extra = 0
    model = models.DestinationStation


@admin.register(models.Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ("organization", "get_all_fuel_types", "name", "created_at")
    search_fields = ()
    list_filter = ()

    inlines = [FuelTypeInline, DestinationStationInline]

    formfield_overrides = {
        ManyToManyField: {'widget': CheckboxSelectMultiple},
    }

    def get_all_fuel_types(self, obj):
        all_types = obj.fuel_types.all()
        return ';\n'.join([t.name for t in all_types])

    get_all_fuel_types.short_description = 'Виды топлива'

    def balance(self, obj):
        balances = []
        for name, value in {
            "Уголь Бурый": 1000,
            "Уголь серый": 1500,
            "Нефть": 3000,
        }.items():
            balances.append(
                f'<p>{name}: {value}</p>')
        return format_html(''.join(balances))

    def get_readonly_fields(self, *args, **kwargs):
        fields = list(super().get_readonly_fields(*args, **kwargs))
        fields.append("balance")
        return tuple(fields)

    balance.short_description = "Баланс"
    balance.allow_tags = True


@admin.register(models.DeliveryStation)
class DeliveryStationAdmin(admin.ModelAdmin):
    list_display = ("organization", "name", "created_at")
    search_fields = ()
    list_filter = ()


@admin.register(models.CounterPartyType)
class CounterPartyTypeAdmin(admin.ModelAdmin):
    list_display = ("name", )


@admin.register(models.CounterParty)
class CounterPartyAdmin(admin.ModelAdmin):
    list_display = ("name", "get_all_types", "address", "u_address", "inn", "ogrn", "created_at")
    formfield_overrides = {
        ManyToManyField: {'widget': CheckboxSelectMultiple},
    }

    def get_all_types(self, obj: models.CounterParty):
        all_types = obj.types.all()
        return ';\n'.join([t.name for t in all_types])

    get_all_types.short_description = 'Виды'


class ContractObjectInline(admin.StackedInline):
    extra = 0
    model = models.ContractObject


@admin.register(models.Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ("subscribe_at", "number", "provider", "customer", "start_at", "end_at")
    inlines = [ContractObjectInline]

    def render_change_form(self, request, context, *args, **kwargs):
        context['adminform'].form.fields['provider'].queryset = models.CounterParty.objects.filter(types__name='Поставщик')
        return super(ContractAdmin, self).render_change_form(request, context, *args, **kwargs)


@admin.register(models.OperationStatus)
class OperationStatusAdmin(admin.ModelAdmin):
    list_display = ("name", )


@admin.register(models.OperationType)
class OperationTypeAdmin(admin.ModelAdmin):
    list_display = ("name", )


@admin.register(models.Operation)
class OperationAdmin(admin.ModelAdmin):
    list_display = ("contract_object", )


@admin.register(models.StatusRecord)
class StatusRecordAdmin(admin.ModelAdmin):
    list_display = ("user", )


@admin.register(models.Waybill)
class WaybillAdmin(admin.ModelAdmin):
    list_display = ("number", )


@admin.register(models.WriteOff)
class WriteOffAdmin(admin.ModelAdmin):
    list_display = ("number", )

