from app.models.sales import Tax
from app.repositories.order_repository import SalesRepository


class TaxRepository(SalesRepository[Tax]):
    model = Tax
    search_fields = ("name", "tax_type", "country", "region", "status", "description")
