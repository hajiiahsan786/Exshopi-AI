from app.models.sales import Invoice, InvoiceItem, InvoicePayment
from app.repositories.order_repository import SalesRepository


class InvoiceRepository(SalesRepository[Invoice]):
    model = Invoice
    search_fields = ("invoice_number", "status", "payment_status", "currency", "notes")


class InvoiceItemRepository(SalesRepository[InvoiceItem]):
    model = InvoiceItem
    search_fields = ("sku", "name")


class InvoicePaymentRepository(SalesRepository[InvoicePayment]):
    model = InvoicePayment
    search_fields = ()
