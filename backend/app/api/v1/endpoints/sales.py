from app.api.v1.endpoints.sales_router_factory import create_sales_router
from app.schemas.sales import (
    DiscountCreate,
    DiscountListResponse,
    DiscountSingleResponse,
    DiscountUpdate,
    InvoiceCreate,
    InvoiceItemCreate,
    InvoiceItemListResponse,
    InvoiceItemSingleResponse,
    InvoiceItemUpdate,
    InvoiceListResponse,
    InvoicePaymentCreate,
    InvoicePaymentListResponse,
    InvoicePaymentSingleResponse,
    InvoicePaymentUpdate,
    InvoiceSingleResponse,
    InvoiceUpdate,
    OrderAttachmentCreate,
    OrderAttachmentListResponse,
    OrderAttachmentSingleResponse,
    OrderAttachmentUpdate,
    OrderItemCreate,
    OrderItemListResponse,
    OrderItemSingleResponse,
    OrderItemUpdate,
    OrderNoteCreate,
    OrderNoteListResponse,
    OrderNoteSingleResponse,
    OrderNoteUpdate,
    OrderTimelineCreate,
    OrderTimelineListResponse,
    OrderTimelineSingleResponse,
    OrderTimelineUpdate,
    PaymentCreate,
    PaymentListResponse,
    PaymentSingleResponse,
    PaymentUpdate,
    QuoteApprovalCreate,
    QuoteApprovalListResponse,
    QuoteApprovalSingleResponse,
    QuoteApprovalUpdate,
    QuoteCreate,
    QuoteItemCreate,
    QuoteItemListResponse,
    QuoteItemSingleResponse,
    QuoteItemUpdate,
    QuoteListResponse,
    QuoteSingleResponse,
    QuoteUpdate,
    QuoteVersionCreate,
    QuoteVersionListResponse,
    QuoteVersionSingleResponse,
    QuoteVersionUpdate,
    SalesOrderCreate,
    SalesOrderListResponse,
    SalesOrderSingleResponse,
    SalesOrderUpdate,
    ShipmentCreate,
    ShipmentListResponse,
    ShipmentSingleResponse,
    ShipmentUpdate,
    ShippingMethodCreate,
    ShippingMethodListResponse,
    ShippingMethodSingleResponse,
    ShippingMethodUpdate,
    TaxCreate,
    TaxListResponse,
    TaxSingleResponse,
    TaxUpdate,
)
from app.services.discount_service import DiscountService
from app.services.invoice_service import InvoiceItemService, InvoicePaymentService, InvoiceService
from app.services.order_service import (
    OrderAttachmentService,
    OrderItemService,
    OrderNoteService,
    OrderTimelineService,
    SalesOrderService,
)
from app.services.payment_service import PaymentService
from app.services.quotation_service import (
    QuoteApprovalService,
    QuoteItemService,
    QuoteService,
    QuoteVersionService,
)
from app.services.shipment_service import ShipmentService, ShippingMethodService
from app.services.tax_service import TaxService


orders_router = create_sales_router(
    service=SalesOrderService,
    create_schema=SalesOrderCreate,
    update_schema=SalesOrderUpdate,
    single_response=SalesOrderSingleResponse,
    list_response=SalesOrderListResponse,
    permission_prefix="orders",
    entity_label="Orders",
    manager_permissions=("orders.manage",),
)

order_items_router = create_sales_router(
    service=OrderItemService,
    create_schema=OrderItemCreate,
    update_schema=OrderItemUpdate,
    single_response=OrderItemSingleResponse,
    list_response=OrderItemListResponse,
    permission_prefix="orders",
    entity_label="Order items",
    manager_permissions=("orders.manage",),
)

order_notes_router = create_sales_router(
    service=OrderNoteService,
    create_schema=OrderNoteCreate,
    update_schema=OrderNoteUpdate,
    single_response=OrderNoteSingleResponse,
    list_response=OrderNoteListResponse,
    permission_prefix="orders",
    entity_label="Order notes",
    manager_permissions=("orders.manage",),
)

order_timeline_router = create_sales_router(
    service=OrderTimelineService,
    create_schema=OrderTimelineCreate,
    update_schema=OrderTimelineUpdate,
    single_response=OrderTimelineSingleResponse,
    list_response=OrderTimelineListResponse,
    permission_prefix="orders",
    entity_label="Order timeline",
    manager_permissions=("orders.manage",),
)

order_attachments_router = create_sales_router(
    service=OrderAttachmentService,
    create_schema=OrderAttachmentCreate,
    update_schema=OrderAttachmentUpdate,
    single_response=OrderAttachmentSingleResponse,
    list_response=OrderAttachmentListResponse,
    permission_prefix="orders",
    entity_label="Order attachments",
    manager_permissions=("orders.manage",),
)

quotes_router = create_sales_router(
    service=QuoteService,
    create_schema=QuoteCreate,
    update_schema=QuoteUpdate,
    single_response=QuoteSingleResponse,
    list_response=QuoteListResponse,
    permission_prefix="quotes",
    entity_label="Quotes",
    manager_permissions=("quotes.manage",),
)

quote_items_router = create_sales_router(
    service=QuoteItemService,
    create_schema=QuoteItemCreate,
    update_schema=QuoteItemUpdate,
    single_response=QuoteItemSingleResponse,
    list_response=QuoteItemListResponse,
    permission_prefix="quotes",
    entity_label="Quote items",
    manager_permissions=("quotes.manage",),
)

quote_versions_router = create_sales_router(
    service=QuoteVersionService,
    create_schema=QuoteVersionCreate,
    update_schema=QuoteVersionUpdate,
    single_response=QuoteVersionSingleResponse,
    list_response=QuoteVersionListResponse,
    permission_prefix="quotes",
    entity_label="Quote versions",
    manager_permissions=("quotes.manage",),
)

quote_approvals_router = create_sales_router(
    service=QuoteApprovalService,
    create_schema=QuoteApprovalCreate,
    update_schema=QuoteApprovalUpdate,
    single_response=QuoteApprovalSingleResponse,
    list_response=QuoteApprovalListResponse,
    permission_prefix="quotes",
    entity_label="Quote approvals",
    manager_permissions=("quotes.manage",),
)

invoices_router = create_sales_router(
    service=InvoiceService,
    create_schema=InvoiceCreate,
    update_schema=InvoiceUpdate,
    single_response=InvoiceSingleResponse,
    list_response=InvoiceListResponse,
    permission_prefix="invoices",
    entity_label="Invoices",
    manager_permissions=("invoices.manage",),
)

invoice_items_router = create_sales_router(
    service=InvoiceItemService,
    create_schema=InvoiceItemCreate,
    update_schema=InvoiceItemUpdate,
    single_response=InvoiceItemSingleResponse,
    list_response=InvoiceItemListResponse,
    permission_prefix="invoices",
    entity_label="Invoice items",
    manager_permissions=("invoices.manage",),
)

invoice_payments_router = create_sales_router(
    service=InvoicePaymentService,
    create_schema=InvoicePaymentCreate,
    update_schema=InvoicePaymentUpdate,
    single_response=InvoicePaymentSingleResponse,
    list_response=InvoicePaymentListResponse,
    permission_prefix="invoices",
    entity_label="Invoice payments",
    manager_permissions=("invoices.manage",),
)

payments_router = create_sales_router(
    service=PaymentService,
    create_schema=PaymentCreate,
    update_schema=PaymentUpdate,
    single_response=PaymentSingleResponse,
    list_response=PaymentListResponse,
    permission_prefix="payments",
    entity_label="Payments",
    manager_permissions=("payments.manage",),
)

shipments_router = create_sales_router(
    service=ShipmentService,
    create_schema=ShipmentCreate,
    update_schema=ShipmentUpdate,
    single_response=ShipmentSingleResponse,
    list_response=ShipmentListResponse,
    permission_prefix="shipments",
    entity_label="Shipments",
    manager_permissions=("shipments.manage",),
)

shipping_methods_router = create_sales_router(
    service=ShippingMethodService,
    create_schema=ShippingMethodCreate,
    update_schema=ShippingMethodUpdate,
    single_response=ShippingMethodSingleResponse,
    list_response=ShippingMethodListResponse,
    permission_prefix="shipments",
    entity_label="Shipping methods",
    manager_permissions=("shipments.manage",),
)

discounts_router = create_sales_router(
    service=DiscountService,
    create_schema=DiscountCreate,
    update_schema=DiscountUpdate,
    single_response=DiscountSingleResponse,
    list_response=DiscountListResponse,
    permission_prefix="sales",
    entity_label="Discounts",
)

taxes_router = create_sales_router(
    service=TaxService,
    create_schema=TaxCreate,
    update_schema=TaxUpdate,
    single_response=TaxSingleResponse,
    list_response=TaxListResponse,
    permission_prefix="sales",
    entity_label="Taxes",
)

SALES_ROUTERS = (
    (orders_router, "/orders", ["Orders"]),
    (order_items_router, "/order-items", ["Order Items"]),
    (order_notes_router, "/order-notes", ["Order Notes"]),
    (order_timeline_router, "/order-timeline", ["Order Timeline"]),
    (order_attachments_router, "/order-attachments", ["Order Attachments"]),
    (quotes_router, "/quotes", ["Quotes"]),
    (quote_items_router, "/quote-items", ["Quote Items"]),
    (quote_versions_router, "/quote-versions", ["Quote Versions"]),
    (quote_approvals_router, "/quote-approvals", ["Quote Approvals"]),
    (invoices_router, "/invoices", ["Invoices"]),
    (invoice_items_router, "/invoice-items", ["Invoice Items"]),
    (invoice_payments_router, "/invoice-payments", ["Invoice Payments"]),
    (payments_router, "/payments", ["Payments"]),
    (shipments_router, "/shipments", ["Shipments"]),
    (shipping_methods_router, "/shipping-methods", ["Shipping Methods"]),
    (discounts_router, "/discounts", ["Discounts"]),
    (taxes_router, "/taxes", ["Taxes"]),
)
