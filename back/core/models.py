from django.db import models

from django.contrib.auth.models import User


# Create your models here.


class FuelType(models.Model):
    class Meta:
        verbose_name = 'Вид топлива'
        verbose_name_plural = 'Виды топлива'

    name = models.CharField(max_length=512, verbose_name='Наименование')

    def __str__(self):
        return self.name


class FuelMark(models.Model):
    class Meta:
        verbose_name = 'Марка топлива'
        verbose_name_plural = 'Марки топлива'

    fuel_type = models.ForeignKey(FuelType, null=True, blank=True, verbose_name='Тип топлива',
                                  related_name='marks', on_delete=models.DO_NOTHING)
    name = models.CharField(max_length=512, verbose_name='Наименование')

    def __str__(self):
        return self.name


class Organization(models.Model):
    class Meta:
        verbose_name = 'Организация'
        verbose_name_plural = 'Организации'

    name = models.CharField(max_length=512, verbose_name='Наименование')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='дата обновления', null=True)

    def __str__(self):
        return f"Организация {self.name}"


class Station(models.Model):
    class Meta:
        verbose_name = 'Станция'
        verbose_name_plural = 'Станции'

    name = models.CharField(max_length=512, unique=True, verbose_name='Наименование')
    organization = models.ForeignKey(Organization, verbose_name='Организация владелец', related_name='stations',
                                     on_delete=models.CASCADE)
    ceo_name = models.CharField(max_length=512, verbose_name='ФИО руководтеля')
    address = models.CharField(max_length=512, verbose_name='Адрес')

    fuel_types = models.ManyToManyField(FuelType, through='StationToFuelBalance', null=True, blank=True,
                                        verbose_name='Виды топлива')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='дата обновления', null=True)

    def __str__(self):
        return f"Станция {self.name}"

    def get_balance(self):

        balance = {f.fuel_type.name: f.amount for f in StationToFuelBalance.objects.filter(station__id=self.id)}

        for operation in Operation.objects.filter(operation_type__name='Внутреннее пермещение', source_station__id=self.id):
            b = operation.get_delivered_waybills_amounts()
            balance[b[0]] -= b[1]

        for operation in Operation.objects.filter(operation_type__name='Внутреннее пермещение', dest_station__id=self.id):
            b = operation.get_delivered_waybills_amounts()
            balance[b[0]] += b[1]

        for operation in Operation.objects.filter(operation_type__name='Поставка от поставщика', cancelling_operation=None, contract_object__station__id=self.id):
            b = operation.get_delivered_waybills_amounts()
            balance[b[0]] += b[1]

        for writeOff in WriteOff.objects.filter(station__id=self.id):
            balance[writeOff.fuel_type.name] -= writeOff.amount

        return balance


class DestinationStation(models.Model):
    class Meta:
        verbose_name = 'Станция назначения'
        verbose_name_plural = 'Станции назначения'

    name = models.CharField(max_length=512, unique=True, verbose_name='Наименование')
    station = models.ForeignKey(Station, null=True, blank=True, verbose_name='Станция назначения',
                                related_name='destination_stations', on_delete=models.DO_NOTHING)

    def __str__(self):
        return f"Станция назначения {self.name}"


class StationToFuelBalance(models.Model):
    station = models.ForeignKey(Station, on_delete=models.DO_NOTHING)
    fuel_type = models.ForeignKey(FuelType, on_delete=models.DO_NOTHING)
    amount = models.IntegerField(null=True)


# For counter party :)
class DeliveryStation(models.Model):
    class Meta:
        verbose_name = 'Станция отгрузки'
        verbose_name_plural = 'Станции отгрузки'

    name = models.CharField(max_length=512, unique=True, verbose_name='Наименование')
    organization = models.ForeignKey(Organization, verbose_name='Организация владелец',
                                     related_name='delivery_stations',
                                     on_delete=models.CASCADE)

    ceo_name = models.CharField(max_length=512, verbose_name='ФИО руководтеля')
    address = models.CharField(max_length=512, verbose_name='Адрес')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='дата обновления', null=True)

    def __str__(self):
        return f"Станция отгрузки {self.name}"


class CounterPartyType(models.Model):
    class Meta:
        verbose_name = 'Тип контрагента'
        verbose_name_plural = 'Типы контрагентов'

    name = models.CharField(max_length=512, unique=True, verbose_name='Наименование')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='дата обновления', null=True)

    def __str__(self):
        return self.name


class CounterParty(models.Model):
    class Meta:
        verbose_name = 'Контрагент'
        verbose_name_plural = 'Контрагенты'

    name = models.CharField(max_length=512, unique=True, verbose_name='Юридическое наименование')
    address = models.CharField(max_length=512, null=True, verbose_name='Фактический адрес')
    u_address = models.CharField(max_length=512, null=True, verbose_name='Юридический адрес')

    delivery_station = models.ForeignKey(DeliveryStation, null=True, blank=True,
                                         verbose_name="Станция отгрузки", on_delete=models.CASCADE)

    inn = models.CharField(max_length=512, null=True, verbose_name='ИНН')
    ogrn = models.CharField(max_length=512, null=True, verbose_name='ОГРН')

    types = models.ManyToManyField(CounterPartyType, null=True, blank=True, verbose_name='Вид')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='дата обновления', null=True)

    def __str__(self):
        return self.name


class Contract(models.Model):
    class Meta:
        verbose_name = 'Договор'
        verbose_name_plural = 'Договоры'

    number = models.CharField(max_length=512, null=True, unique=True, verbose_name='Номер')
    subscribe_at = models.DateField(null=True, blank=True, verbose_name='Дата подписания')

    provider = models.ForeignKey(CounterParty, null=True, blank=True, verbose_name='Поставщик',
                                 on_delete=models.DO_NOTHING)
    customer = models.ForeignKey(Organization, null=True, blank=True, verbose_name='Покупатель',
                                 on_delete=models.DO_NOTHING)

    start_at = models.DateField(null=True, blank=True, verbose_name='Дата начала действия')
    end_at = models.DateField(null=True, blank=True, verbose_name='Дата окончания действия')

    created_at = models.DateTimeField(auto_now_add=True, null=True, verbose_name='дата создания')
    updated_at = models.DateTimeField(auto_now=True, null=True, verbose_name='дата обновления')

    def __str__(self):
        if self.customer:
            return f'{self.customer.name} {self.number}'
        return ''


class ContractObject(models.Model):
    class Meta:
        verbose_name = 'Предмет договора'
        verbose_name_plural = 'Предметы договора'

    contract = models.ForeignKey(Contract, null=True, blank=True, verbose_name='Договор', on_delete=models.DO_NOTHING)

    fuel_type = models.ForeignKey(FuelType, null=True, blank=True, verbose_name='Вид топлива',
                                  on_delete=models.DO_NOTHING)
    fuel_mark = models.ForeignKey(FuelMark, null=True, blank=True, verbose_name='Марка топлива',
                                  on_delete=models.DO_NOTHING)
    shipper = models.ForeignKey(CounterParty, null=True, blank=True, verbose_name='Грузоотправитель',
                                  on_delete=models.DO_NOTHING)
    amount = models.IntegerField(null=True, blank=True, verbose_name='Количество')
    price = models.IntegerField(null=True, blank=True, verbose_name='Стоимость')

    station = models.ForeignKey(Station, null=True, blank=True, verbose_name='Станция',
                                  on_delete=models.DO_NOTHING)

    shipper_station = models.ForeignKey(DeliveryStation, null=True, blank=True, verbose_name='Станция отгрузки',
                                        on_delete=models.DO_NOTHING)

    destination_station = models.ForeignKey(DestinationStation, null=True, blank=True, verbose_name='Станция назначения',
                                            on_delete=models.DO_NOTHING)

    def __str__(self):
        if self.contract:
            return f'{str(self.contract)}'
        return ''


class OperationStatus(models.Model):
    class Meta:
        verbose_name = 'Статус операции'
        verbose_name_plural = 'Статусы операций'

    name = models.CharField(max_length=512, unique=True, verbose_name='Наименование')

    def __str__(self):
        return self.name


class OperationType(models.Model):
    class Meta:
        verbose_name = 'Тип операции'
        verbose_name_plural = 'Типы операций'

    name = models.CharField(max_length=512, unique=True, verbose_name='Наименование')

    def __str__(self):
        return self.name


class Operation(models.Model):
    class Meta:
        verbose_name = 'Операция'
        verbose_name_plural = 'Операции'

    operation_type = models.ForeignKey(OperationType, null=True, blank=True, verbose_name='Тип',
                                       on_delete=models.DO_NOTHING)

    cancelling_operation = models.ForeignKey("Operation", null=True, blank=True, verbose_name='Операция возврата (если была)',
                                             on_delete=models.DO_NOTHING)

    contract_object = models.ForeignKey(ContractObject, null=True, blank=True, verbose_name='Объект договора',
                                        on_delete=models.DO_NOTHING)

    source_station = models.ForeignKey(Station, null=True, blank=True, verbose_name='Станция отправления (Внутреннее перемещение)',
                                        on_delete=models.DO_NOTHING)

    dest_station = models.ForeignKey(Station, null=True, blank=True, verbose_name='Станция назначения (Внутреннее перемещение)',
                                    related_name='operations_as_destination', on_delete=models.DO_NOTHING)

    fuel_type = models.ForeignKey(FuelType, null=True, blank=True, verbose_name='Вид топлива (Внутреннее перемещение)',
                                        on_delete=models.DO_NOTHING)

    created_at = models.DateField(auto_now_add=True, null=True, verbose_name='дата создания')

    def get_delivered_waybills_amounts(self):
        amount = 0
        for w in self.waybills.all():
            for s in w.statuses.filter(status__name='Доставлено'):
                amount += s.amount
        return [
            self.fuel_type.name if self.fuel_type else self.contract_object.fuel_type.name, amount
        ]


class Waybill(models.Model):
    class Meta:
        verbose_name = 'Накладная'
        verbose_name_plural = 'Накладные'

    number = models.CharField(max_length=512, null=True, unique=True, verbose_name='Номер')
    operation = models.ForeignKey(Operation, null=True, blank=True, verbose_name='Операция', related_name='waybills',
                                  on_delete=models.DO_NOTHING)


class StatusRecord(models.Model):
    class Meta:
        verbose_name = 'Смена статуса накладной'
        verbose_name_plural = 'Смены статусов накладных'

    user = models.ForeignKey(User, null=True, blank=True, verbose_name='Пользователь',
                             on_delete=models.DO_NOTHING)
    status = models.ForeignKey(OperationStatus, null=True, blank=True, verbose_name='Статус',
                               on_delete=models.DO_NOTHING)
    waybill = models.ForeignKey(Waybill, null=True, blank=True, verbose_name='Накладная', related_name='statuses',
                                on_delete=models.CASCADE)
    created_at = models.DateField(auto_now_add=True, verbose_name='дата создания')

    amount = models.IntegerField(null=True, blank=True, verbose_name='Масса')
    wagons = models.IntegerField(null=True, blank=True, verbose_name='Вагоны')


class WriteOff(models.Model):
    class Meta:
        verbose_name = 'Списание'
        verbose_name_plural = 'Списания'

    number = models.CharField(max_length=512, null=True, unique=True, verbose_name='Номер')
    station = models.ForeignKey(Station, null=True, blank=True,
                                verbose_name='Станция отправления (Внутреннее перемещение)', on_delete=models.DO_NOTHING)

    fuel_type = models.ForeignKey(FuelType, null=True, blank=True, verbose_name='Вид топлива (Внутреннее перемещение)',
                                        on_delete=models.DO_NOTHING)

    amount = models.IntegerField(null=True, blank=True, verbose_name='Масса')

    created_at = models.DateField(auto_now_add=True, verbose_name='дата создания')
