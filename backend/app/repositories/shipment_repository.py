from app.models.sales import Shipment, ShippingMethod
from app.repositories.order_repository import SalesRepository


class ShippingMethodRepository(SalesRepository[ShippingMethod]):
    model = ShippingMethod
    search_fields = ("name", "courier", "service_level", "status", "description")


class ShipmentRepository(SalesRepository[Shipment]):
    model = Shipment
    search_fields = ("shipment_number", "tracking_number", "courier", "status", "notes")
