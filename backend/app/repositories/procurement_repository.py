from typing import Any, Generic, TypeVar, List
from sqlalchemy import or_, String, cast
from sqlalchemy.orm import Query, Session
from app.repositories.inventory_repository import InventoryRepository
from app.models.procurement import (
    SupplierCategory,
    SupplierContact,
    SupplierAddress,
    SupplierBankingInfo,
    SupplierDocument,
    SupplierRating,
    SupplierPerformance,
    PurchaseRequest,
    PurchaseRequestItem,
    PurchaseRequestApproval,
    RFQ,
    RFQItem,
    RFQSupplier,
    RFQResponseItem,
    PurchaseOrder,
    PurchaseOrderItem,
    PurchaseOrderApproval,
    GoodsReceiptNote,
    GoodsReceiptItem,
    PurchaseReturn,
    PurchaseReturnItem,
    SupplierPayment,
)

ModelT = TypeVar("ModelT")

class ProcurementRepository(InventoryRepository[ModelT], Generic[ModelT]):
    sortable_fields = InventoryRepository.sortable_fields | {
        "title",
        "name",
        "rfq_number",
        "po_number",
        "grn_number",
        "return_number",
        "payment_number",
        "total_amount",
        "amount",
        "status",
        "priority",
    }


class SupplierCategoryRepository(ProcurementRepository[SupplierCategory]):
    model = SupplierCategory
    search_fields = ("name", "description", "status")


class SupplierContactRepository(ProcurementRepository[SupplierContact]):
    model = SupplierContact
    search_fields = ("first_name", "last_name", "email", "phone", "position", "status")


class SupplierAddressRepository(ProcurementRepository[SupplierAddress]):
    model = SupplierAddress
    search_fields = ("address_line1", "city", "state", "postal_code", "country", "address_type", "status")


class SupplierBankingInfoRepository(ProcurementRepository[SupplierBankingInfo]):
    model = SupplierBankingInfo
    search_fields = ("bank_name", "account_name", "account_number", "swift_code", "status")


class SupplierDocumentRepository(ProcurementRepository[SupplierDocument]):
    model = SupplierDocument
    search_fields = ("name", "document_type", "status")


class SupplierRatingRepository(ProcurementRepository[SupplierRating]):
    model = SupplierRating
    search_fields = ("comments", "status")


class SupplierPerformanceRepository(ProcurementRepository[SupplierPerformance]):
    model = SupplierPerformance
    search_fields = ("evaluation_period", "status")


class PurchaseRequestRepository(ProcurementRepository[PurchaseRequest]):
    model = PurchaseRequest
    search_fields = ("title", "description", "priority", "status", "notes")


class PurchaseRequestItemRepository(ProcurementRepository[PurchaseRequestItem]):
    model = PurchaseRequestItem
    search_fields = ("status",)


class PurchaseRequestApprovalRepository(ProcurementRepository[PurchaseRequestApproval]):
    model = PurchaseRequestApproval
    search_fields = ("action", "comments", "status")


class RFQRepository(ProcurementRepository[RFQ]):
    model = RFQ
    search_fields = ("rfq_number", "title", "description", "status")


class RFQItemRepository(ProcurementRepository[RFQItem]):
    model = RFQItem
    search_fields = ("description", "status")


class RFQSupplierRepository(ProcurementRepository[RFQSupplier]):
    model = RFQSupplier
    search_fields = ("status", "notes")


class RFQResponseItemRepository(ProcurementRepository[RFQResponseItem]):
    model = RFQResponseItem
    search_fields = ("status",)


class PurchaseOrderRepository(ProcurementRepository[PurchaseOrder]):
    model = PurchaseOrder
    search_fields = ("po_number", "title", "description", "status", "notes")


class PurchaseOrderItemRepository(ProcurementRepository[PurchaseOrderItem]):
    model = PurchaseOrderItem
    search_fields = ("status",)


class PurchaseOrderApprovalRepository(ProcurementRepository[PurchaseOrderApproval]):
    model = PurchaseOrderApproval
    search_fields = ("action", "comments", "status")


class GoodsReceiptNoteRepository(ProcurementRepository[GoodsReceiptNote]):
    model = GoodsReceiptNote
    search_fields = ("grn_number", "status", "notes")


class GoodsReceiptItemRepository(ProcurementRepository[GoodsReceiptItem]):
    model = GoodsReceiptItem
    search_fields = ("batch_number", "serial_number", "quality_status", "inspection_notes", "status")


class PurchaseReturnRepository(ProcurementRepository[PurchaseReturn]):
    model = PurchaseReturn
    search_fields = ("return_number", "status", "notes")


class PurchaseReturnItemRepository(ProcurementRepository[PurchaseReturnItem]):
    model = PurchaseReturnItem
    search_fields = ("reason", "condition_type", "status")


class SupplierPaymentRepository(ProcurementRepository[SupplierPayment]):
    model = SupplierPayment
    search_fields = ("payment_number", "payment_method", "status", "transaction_reference", "notes")
