from app.models.sales import Payment
from app.repositories.order_repository import SalesRepository


class PaymentRepository(SalesRepository[Payment]):
    model = Payment
    search_fields = ("payment_number", "payment_method", "status", "transaction_reference", "provider", "notes")
