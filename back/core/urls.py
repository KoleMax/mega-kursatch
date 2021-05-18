from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import current_user, UserList, StationViewSet, CounterPartyViewSet, OrganizationViewSet, \
    DeliveryStationViewSet, ContractsViewSet, FuelMarkView, FuelTypeView, OperationView, WriteOffView

router = DefaultRouter(trailing_slash=True)

router.register('station', StationViewSet)
router.register('counterparty', CounterPartyViewSet)
router.register('organization', OrganizationViewSet)
router.register('deliverystation', DeliveryStationViewSet)
router.register('contract', ContractsViewSet)
router.register('type', FuelTypeView)
router.register('mark', FuelMarkView)
router.register('operation', OperationView)
router.register('writeoff', WriteOffView)

urlpatterns = [
    path('current_user/', current_user),
    path('users/', UserList.as_view()),
] + router.urls
