from rest_framework import serializers
from rest_framework_jwt.settings import api_settings
from django.contrib.auth.models import User

from . import models


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('username',)


class UserSerializerWithToken(serializers.ModelSerializer):

    token = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True)

    def get_token(self, obj):
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

        payload = jwt_payload_handler(obj)
        token = jwt_encode_handler(payload)
        return token

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

    class Meta:
        model = User
        fields = ('token', 'username', 'password')


class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Station
        fields = ["id", "name", "organization", "ceo_name", "fuel_types", "address", "created_at", "updated_at"]

    def to_internal_value(self, data):
        organization_name = data['organization']
        if organization_name:
            data['organization'] = models.Organization.objects.get(name=organization_name).id

        del data['destination_station']

        return super().to_internal_value(data)

    def to_representation(self, instance):

        ret = super().to_representation(instance)
        ret['fuel_types'] = '; '.join([t.name for t in instance.fuel_types.all()])

        ret['balance'] = [{
            'fuel_type': k,
            'amount': v,
        } for k, v in instance.get_balance().items()]

        ret['organization'] = instance.organization.name
        destination_station = models.DestinationStation.objects.filter(station__id=instance.id)
        if destination_station:
            ret['destination_station'] = destination_station[0].name
        else:
            ret['destination_station'] = None
        return ret


class CounterPartySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CounterParty
        fields = ["id", "name", "address", "u_address", "delivery_station", "inn", "ogrn", "types"]

    def to_internal_value(self, data):
        delivery_station_name = data['delivery_station']
        if delivery_station_name:
            data['delivery_station'] = models.DeliveryStation.objects.get(name=delivery_station_name).id

        return super().to_internal_value(data)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['types'] = [t.name for t in instance.types.all()]
        if instance.delivery_station:
            ret['delivery_station'] = instance.delivery_station.name
        else:
            ret['delivery_station'] = None
        return ret


class DeliveryStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.DeliveryStation
        fields = ["id", "name", "organization", "ceo_name", "address"]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.organization:
            ret['organization'] = instance.organization.name
        else:
            ret['organization'] = None
        return ret


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Organization
        fields = ["id", "name"]


class ContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Contract
        fields = ["id", "number", "subscribe_at", "provider", "customer", "start_at", "end_at"]

    def to_internal_value(self, data):
        provider_name = data['provider']
        if provider_name:
            data['provider'] = models.CounterParty.objects.get(name=provider_name).id

        customer_name = data['customer']
        if customer_name:
            data['customer'] = models.Organization.objects.get(name=customer_name).id

        return super().to_internal_value(data)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.provider:
            ret['provider'] = instance.provider.name
        else:
            ret['provider'] = None

        if instance.customer:
            ret['customer'] = instance.customer.name
        else:
            ret['customer'] = None

        total_amount = 0
        total_price = 0

        ret['contract_objects'] = list()

        for o in models.ContractObject.objects.filter(contract__id=instance.id):
            total_amount += o.amount
            total_price += o.price
            ret['contract_objects'].append({
                'id': o.id,
                'fuel_type': o.fuel_type.name,
                'fuel_mark': o.fuel_mark.name,
                'shipper': o.shipper.name,
                'price': o.price,
                'amount': o.amount,
                'station': o.station.name,
                'delivery_station': o.shipper_station.name,
                'destination_station': o.destination_station.name
            })

        ret['amount'] = total_amount
        ret['price'] = total_price

        return ret


class FuelTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.FuelType
        fields = ['id', 'name']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        marks = [m.name for m in models.FuelMark.objects.filter(fuel_type__id=instance.id)]
        ret['marks'] = marks
        return ret


class FuelMarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.FuelMark
        fields = ['id', 'fuel_type', 'name']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.fuel_type:
            ret['fuel_type'] = instance.fuel_type.name
        else:
            ret['fuel_type'] = None

        return ret


class OperationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Operation
        fields = ['id', 'operation_type', 'contract_object', 'source_station', 'dest_station', 'fuel_type', 'created_at']

    def to_internal_value(self, data):
        station_name = data.get('station')
        if station_name:
            data['station'] = models.Station.objects.get(name=station_name).id

        contract_object_id = data.get('contract_object_id')
        if contract_object_id:
            data.pop('contract_object_id')
            data['contract_object'] = models.ContractObject.objects.get(id=contract_object_id).id

        operation_type = data['operation_type']
        if operation_type:
            data['operation_type'] = models.OperationType.objects.get(name=operation_type).id

        source_station = data.get('source_station')
        if source_station:
            data['source_station'] = source_station['id']

        dest_station = data.get('dest_station')
        if dest_station:
            data['dest_station'] = dest_station['id']

        fuel_type = data.get('fuel_type')
        if fuel_type:
            data['fuel_type'] = models.FuelType.objects.get(name=fuel_type).id

        return super().to_internal_value(data)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.operation_type:
            ret['operation_type'] = instance.operation_type.name
        else:
            ret['operation_type'] = None

        if instance.source_station:
            source_station = models.Station.objects.get(id=instance.source_station.id)

            destination_station = models.DestinationStation.objects.filter(station__id=source_station.id)

            ret['source_station'] = {
                "id": source_station.id,
                "name": source_station.name,
                "organization": source_station.organization.name,
                "ceo_name": source_station.ceo_name,
                "fuel_types": '; '.join([t.name for t in source_station.fuel_types.all()]),
                "address": source_station.address,
                "created_at": source_station.created_at,
                "updated_at": source_station.updated_at,

                "destination_station": destination_station[0].name if len(destination_station) else None
            }

        if instance.dest_station:
            dest_station = models.Station.objects.get(id=instance.dest_station.id)

            destination_station = models.DestinationStation.objects.filter(station__id=dest_station.id)

            ret['dest_station'] = {
                "id": dest_station.id,
                "name": dest_station.name,
                "organization": dest_station.organization.name,
                "ceo_name": dest_station.ceo_name,
                "fuel_types": '; '.join([t.name for t in dest_station.fuel_types.all()]),
                "address": dest_station.address,
                "created_at": dest_station.created_at,
                "updated_at": dest_station.updated_at,

                "destination_station": destination_station[0].name if len(destination_station) else None

            }

        if instance.fuel_type:
            ret['fuel_type'] = instance.fuel_type.name

        if instance.contract_object:
            ret['contract_number'] = instance.contract_object.contract.number
            ret['fuel_type'] = instance.contract_object.fuel_type.name or None
            ret['station'] = instance.contract_object.station.name
            ret['contract_object'] = {
                'id': instance.contract_object.id,
                'fuel_type': instance.contract_object.fuel_type.name,
                'fuel_mark': instance.contract_object.fuel_mark.name,
                'shipper': instance.contract_object.shipper.name,
                'amount': instance.contract_object.amount,
                'price': instance.contract_object.price,
                'station': instance.contract_object.station.name,
                'delivery_station': instance.contract_object.shipper_station.name,
                'destination_station': instance.contract_object.destination_station.name
            }
        else:
            ret['contract_number'] = None
            ret['station'] = None
            ret['contract_object'] = None

        waybills = models.Waybill.objects.filter(operation__id=instance.id)

        ret['waybills'] = []

        for w in waybills:
            ret['waybills'].append(
                {
                    'id': w.id,
                    'number': w.number,
                    'status_history': {
                        status.status.name: {
                            'amount': status.amount,
                            'wagons': status.wagons,
                            'created_at': status.created_at,
                        } for status in models.StatusRecord.objects.filter(waybill__id=w.id).order_by('created_at',
                                                                                                      'status__id')
                    }
                }
            )

        ret['status'] = None
        ret['status_change_date'] = None
        ret['status_history'] = []

        if len(waybills) > 0:
            status_records = models.StatusRecord.objects.filter(waybill__id=waybills.first().id).order_by('created_at',
                                                                                                          'status__id')
            if len(status_records) > 0:
                ret['status'] = status_records.last().status.name
                ret['status_change_date'] = status_records.last().created_at
                ret['status_history'] = [{
                    'status': sr.status.name,
                    'status_change_date': sr.created_at,
                    'user': sr.user.username,
                } for sr in status_records]

        ret['canceled_operation'] = None

        canceled_operation = models.Operation.objects.filter(cancelling_operation__id=instance.id)
        if len(canceled_operation):
            waybills = models.Waybill.objects.filter(operation__id=canceled_operation.first().id)
            ret['canceled_operation'] = {
                'id': canceled_operation.first().id,
                'contract_number': canceled_operation.first().contract_object.contract.number,
                'waybill_numbers': [w.number for w in waybills],
                'contract_object': {
                    'id': canceled_operation.first().contract_object.id,
                    'fuel_type': canceled_operation.first().contract_object.fuel_type.name,
                    'fuel_mark': canceled_operation.first().contract_object.fuel_mark.name,
                    'shipper': canceled_operation.first().contract_object.shipper.name,
                    'amount': canceled_operation.first().contract_object.amount,
                    'price': canceled_operation.first().contract_object.price,
                    'station': canceled_operation.first().contract_object.station.name,
                    'delivery_station': canceled_operation.first().contract_object.shipper_station.name,
                    'destination_station': canceled_operation.first().contract_object.destination_station.name
                },
                'waybills': list(),
            }

            for w in waybills:
                ret['canceled_operation']['waybills'].append(
                    {
                        'number': w.number,
                        'status_history': {
                            status.status.name: {
                                'amount': status.amount,
                                'wagons': status.wagons,
                                'created_at': status.created_at,
                            } for status in models.StatusRecord.objects.filter(waybill__id=w.id).order_by('created_at',
                                                                                                          'status__id')
                        }
                    }
                )

        return ret


class WriteOffSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.WriteOff
        fields = ['id', 'number', 'station', 'fuel_type', 'amount', 'created_at']

    def to_internal_value(self, data):
        station_name = data['station']
        if station_name:
            data['station'] = models.Station.objects.get(name=station_name).id

        fuel_type_name = data['fuel_type']
        if fuel_type_name:
            data['fuel_type'] = models.FuelType.objects.get(name=fuel_type_name).id

        return super().to_internal_value(data)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.station:
            ret['station'] = instance.station.name
        if instance.fuel_type:
            ret['fuel_type'] = instance.fuel_type.name
        return ret


class ReportSerializer(serializers.Serializer):

    organization = serializers.CharField(max_length=1024)
    station = serializers.CharField(max_length=1024)

    start_date = serializers.DateField()
    end_date = serializers.DateField()
