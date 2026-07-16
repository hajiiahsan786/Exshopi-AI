from app.models.sales import Quote, QuoteApproval, QuoteItem, QuoteVersion
from app.repositories.order_repository import SalesRepository


class QuoteRepository(SalesRepository[Quote]):
    model = Quote
    search_fields = ("quote_number", "status", "currency", "notes", "terms")


class QuoteItemRepository(SalesRepository[QuoteItem]):
    model = QuoteItem
    search_fields = ("sku", "name")


class QuoteVersionRepository(SalesRepository[QuoteVersion]):
    model = QuoteVersion
    search_fields = ()


class QuoteApprovalRepository(SalesRepository[QuoteApproval]):
    model = QuoteApproval
    search_fields = ("status", "notes")
