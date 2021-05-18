from django.contrib.auth.models import User
from rest_framework import permissions, status
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from . import models
from . import serializers


@api_view(['GET'])
def current_user(request):
    """
    Determine the current user by their token, and return their data
    """

    serializer = serializers.UserSerializer(request.user)
    return Response(serializer.data)


class UserList(APIView):
    """
    Create a new user. It's called 'UserList' because normally we'd have a get
    method here too, for retrieving a list of all User objects.
    """

    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        serializer = serializers.UserSerializerWithToken(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = models.Organization.objects.all()
    serializer_class = serializers.OrganizationSerializer


class StationViewSet(viewsets.ModelViewSet):
    queryset = models.Station.objects.all()
    serializer_class = serializers.StationSerializer


class CounterPartyViewSet(viewsets.ModelViewSet):
    queryset = models.CounterParty.objects.all()
    serializer_class = serializers.CounterPartySerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            raise e
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def get_providers(self, request):
        qs = models.CounterParty.objects.filter(types__name="Поставщик")
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def get_shippers(self, request):
        qs = models.CounterParty.objects.filter(types__name="Грузоотправитель")
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class DeliveryStationViewSet(viewsets.ModelViewSet):
    queryset = models.DeliveryStation.objects.all()
    serializer_class = serializers.DeliveryStationSerializer


class ContractsViewSet(viewsets.ModelViewSet):
    queryset = models.Contract.objects.all()
    serializer_class = serializers.ContractSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)

        customer_objects = request.data.pop('contract_objects', [])

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        valid_ids = set()
        for data in customer_objects:
            if data['id'] is not None:
                contract_obj = models.ContractObject.objects.get(id=data['id'])
            else:
                contract_obj = models.ContractObject()

            contract_obj.contract = models.Contract.objects.get(id=instance.id)
            contract_obj.fuel_type = models.FuelType.objects.get(name=data['fuel_type'])
            contract_obj.fuel_mark = models.FuelMark.objects.get(name=data['fuel_mark'])
            contract_obj.shipper = models.CounterParty.objects.get(name=data['shipper'])
            contract_obj.amount = data['amount']
            contract_obj.price = data['price']
            contract_obj.station = models.Station.objects.get(name=data['station'])
            contract_obj.shipper_station = models.DeliveryStation.objects.get(name=data['delivery_station'])
            contract_obj.destination_station = models.DestinationStation.objects.get(name=data['destination_station'])
            contract_obj.save()
            valid_ids.add(contract_obj.id)

        for obj in models.ContractObject.objects.filter(contract__id=instance.id):
            if obj.id not in valid_ids:
                obj.delete()

        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        instance = models.Contract.objects.get(number=serializer.data['number'])
        valid_ids = set()
        for data in request.data.get('contract_objects', []):
            if data['id'] is not None:
                contract_obj = models.ContractObject.objects.get(id=data['id'])
            else:
                contract_obj = models.ContractObject()

            contract_obj.contract = models.Contract.objects.get(id=instance.id)
            contract_obj.fuel_type = models.FuelType.objects.get(name=data['fuel_type'])
            contract_obj.fuel_mark = models.FuelMark.objects.get(name=data['fuel_mark'])
            contract_obj.shipper = models.CounterParty.objects.get(name=data['shipper'])
            contract_obj.amount = data['amount']
            contract_obj.price = data['price']
            contract_obj.station = models.Station.objects.get(name=data['station'])
            contract_obj.shipper_station = models.DeliveryStation.objects.get(name=data['delivery_station'])
            contract_obj.destination_station = models.DestinationStation.objects.get(name=data['destination_station'])
            contract_obj.save()
            valid_ids.add(contract_obj.id)

        for obj in models.ContractObject.objects.filter(contract__id=instance.id):
            if obj.id not in valid_ids:
                obj.delete()

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class FuelTypeView(viewsets.ModelViewSet):
    queryset = models.FuelType.objects.all()
    serializer_class = serializers.FuelTypeSerializer


class FuelMarkView(viewsets.ModelViewSet):
    queryset = models.FuelMark.objects.all()
    serializer_class = serializers.FuelMarkSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class OperationView(viewsets.ModelViewSet):
    queryset = models.Operation.objects.all()
    serializer_class = serializers.OperationSerializer

    @action(detail=False, methods=['get'])
    def get_delivery(self, request):
        qs = models.Operation.objects.filter(operation_type__name="Поставка от поставщика", cancelling_operation=None)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)

        username = request.user.username

        user = User.objects.get(username=username)

        waybills = request.data.pop('waybills')
        request.data.pop('status')
        request.data.pop('status_change_date')
        request.data.pop('status_history')
        if request.data.get('contract_object'):
            request.data.pop('contract_object')

        canceled_operation = None
        if request.data.get('canceled_operation'):
            canceled_operation = request.data.pop('canceled_operation')

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        valid_ids = set()

        for waybill_data in waybills:
            waybill_id = waybill_data.get('id')
            if waybill_id:
                waybill = models.Waybill.objects.get(id=waybill_id)
            else:
                waybill = models.Waybill()

            waybill.operation = instance
            waybill.number = waybill_data['number']
            waybill.save()

            valid_ids.add(waybill.id)

            for status_name, data in waybill_data['status_history'].items():
                waybill_status_record = waybill.statuses.filter(status__name=status_name).first()
                if not waybill_status_record:
                    waybill_status_record = models.StatusRecord()

                waybill_status_record.amount = data['amount']
                waybill_status_record.wagons = data['wagons']
                waybill_status_record.user = user
                waybill_status_record.status = models.OperationStatus.objects.get(name=status_name)
                waybill_status_record.waybill = waybill
                waybill_status_record.save()

        for wb in instance.waybills.all():
            if wb.id not in valid_ids:
                wb.delete()

        if canceled_operation:
            co = models.Operation.objects.get(id=canceled_operation['id'])
            co.cancelling_operation = instance
            co.save()
            print('Here')

        return Response(serializer.data)

    def create(self, request, *args, **kwargs):

        username = request.user.username

        user = User.objects.get(username=username)

        waybills = request.data.pop('waybills')
        request.data.pop('status')
        request.data.pop('status_change_date')
        request.data.pop('status_history')
        if request.data.get('contract_object'):
            request.data.pop('contract_object')
        canceled_operation = None
        if request.data.get('canceled_operation'):
            canceled_operation = request.data.pop('canceled_operation')

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        instance = models.Operation.objects.get(id=serializer.data['id'])

        valid_ids = set()

        for waybill_data in waybills:

            waybill_id = waybill_data.get('id')
            if waybill_id:
                waybill = models.Waybill.objects.get(id=waybill_id)
            else:
                waybill = models.Waybill()

            waybill.operation = instance
            waybill.number = waybill_data['number']
            waybill.save()

            valid_ids.add(waybill.id)

            for status_name, data in waybill_data['status_history'].items():
                waybill_status_record = waybill.statuses.filter(status__name=status_name).first()
                if not waybill_status_record:
                    waybill_status_record = models.StatusRecord()

                waybill_status_record.amount = data['amount']
                waybill_status_record.wagons = data['wagons']
                waybill_status_record.user = user
                waybill_status_record.status = models.OperationStatus.objects.get(name=status_name)
                waybill_status_record.waybill = waybill
                waybill_status_record.save()

        for wb in instance.waybills.all():
            if wb.id not in valid_ids:
                wb.delete()

        if canceled_operation:
            co = models.Operation.objects.get(id=canceled_operation['id'])
            co.cancelling_operation = instance
            co.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class WriteOffView(viewsets.ModelViewSet):
    queryset = models.WriteOff.objects.all()
    serializer_class = serializers.WriteOffSerializer


class ReportView(APIView):

    def post(self, request):
        serializer = serializers.ReportSerializer(data=request.data)



        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)