from app.models.sales import Discount
from app.repositories.order_repository import SalesRepository


class DiscountRepository(SalesRepository[Discount]):
    model = Discount
    search_fields = ("name", "code", "discount_type", "status", "description")
