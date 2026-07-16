import csv
import io
import re
from datetime import datetime, timezone, date
from decimal import Decimal
from typing import Any, List, Dict, Tuple

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

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
from app.models.inventory import Supplier, Product, ProductVariant, Inventory, StockMovement, Warehouse
from app.models.finance import Budget, BudgetLine, VendorBill, ChartOfAccount
from app.models.department import Department
from app.models.user import User

from app.repositories.procurement_repository import (
    SupplierCategoryRepository,
    SupplierContactRepository,
    SupplierAddressRepository,
    SupplierBankingInfoRepository,
    SupplierDocumentRepository,
    SupplierRatingRepository,
    SupplierPerformanceRepository,
    PurchaseRequestRepository,
    PurchaseRequestItemRepository,
    PurchaseRequestApprovalRepository,
    RFQRepository,
    RFQItemRepository,
    RFQSupplierRepository,
    RFQResponseItemRepository,
    PurchaseOrderRepository,
    PurchaseOrderItemRepository,
    PurchaseOrderApprovalRepository,
    GoodsReceiptNoteRepository,
    GoodsReceiptItemRepository,
    PurchaseReturnRepository,
    PurchaseReturnItemRepository,
    SupplierPaymentRepository,
)
from app.repositories.inventory_repository import SupplierRepository, ProductRepository, WarehouseRepository
from app.repositories.finance_repository import BudgetRepository, BudgetLineRepository, VendorBillRepository

from app.services.inventory_service import InventoryService, BaseInventoryService, build_xlsx, slugify, generate_identifier, normalize_payload

class BaseProcurementService(BaseInventoryService):
    pass


class SupplierCategoryService(BaseProcurementService):
    repository = SupplierCategoryRepository
    entity_name = "Supplier category"
    export_fields = ("id", "uuid", "name", "description", "status")


class SupplierContactService(BaseProcurementService):
    repository = SupplierContactRepository
    entity_name = "Supplier contact"
    export_fields = ("id", "uuid", "supplier_id", "first_name", "last_name", "email", "phone", "position", "is_primary", "status")


class SupplierAddressService(BaseProcurementService):
    repository = SupplierAddressRepository
    entity_name = "Supplier address"
    export_fields = ("id", "uuid", "supplier_id", "address_line1", "city", "state", "postal_code", "country", "address_type", "is_primary", "status")


class SupplierBankingInfoService(BaseProcurementService):
    repository = SupplierBankingInfoRepository
    entity_name = "Supplier banking info"
    export_fields = ("id", "uuid", "supplier_id", "bank_name", "account_name", "account_number", "routing_number", "swift_code", "status")


class SupplierDocumentService(BaseProcurementService):
    repository = SupplierDocumentRepository
    entity_name = "Supplier document"
    export_fields = ("id", "uuid", "supplier_id", "name", "document_type", "document_url", "uploaded_at", "expires_at", "status")


class SupplierRatingService(BaseProcurementService):
    repository = SupplierRatingRepository
    entity_name = "Supplier rating"
    export_fields = ("id", "uuid", "supplier_id", "quality_score", "delivery_score", "cost_score", "service_score", "overall_score", "comments", "status")


class SupplierPerformanceService(BaseProcurementService):
    repository = SupplierPerformanceRepository
    entity_name = "Supplier performance"
    export_fields = ("id", "uuid", "supplier_id", "evaluation_period", "on_time_delivery_rate", "quality_pass_rate", "average_lead_time_days", "cost_savings_percent", "overall_performance_score", "status")


class SupplierServiceExtended(BaseProcurementService):
    repository = SupplierRepository
    entity_name = "Supplier"
    export_fields = ("id", "uuid", "company", "contact_person", "email", "phone", "address", "country", "website", "payment_terms", "tax_number", "status", "category_id", "is_preferred")


class PurchaseRequestService(BaseProcurementService):
    repository = PurchaseRequestRepository
    entity_name = "Purchase request"
    export_fields = ("id", "uuid", "department_id", "requester_id", "budget_id", "title", "priority", "status", "total_amount")

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> PurchaseRequest:
        payload = normalize_payload(cls.repository.to_dict(data))
        items_data = payload.pop("items", []) or []

        cls.ensure_required(payload, "department_id")
        cls.ensure_required(payload, "requester_id")
        cls.ensure_required(payload, "title")

        # Validate budget if budget_id provided
        budget_id = payload.get("budget_id")
        total_amount = Decimal("0.0")
        for item in items_data:
            qty = int(item.get("quantity") or 1)
            price = Decimal(str(item.get("estimated_unit_price") or 0))
            item["total_price"] = Decimal(qty) * price
            total_amount += item["total_price"]

        payload["total_amount"] = total_amount

        if budget_id:
            cls.validate_budget(db, budget_id, total_amount)

        pr = cls.repository.create(db, payload, user_id)

        # Create Items
        for item in items_data:
            item["purchase_request_id"] = pr.id
            PurchaseRequestItemRepository.create(db, item, user_id)

        db.refresh(pr)
        return pr

    @classmethod
    def update(cls, db: Session, item_id: int, data: Any, user_id: int | None = None) -> PurchaseRequest:
        pr = cls.repository.get_by_id(db, item_id)
        if not pr:
            raise HTTPException(status_code=404, detail="Purchase request not found")

        payload = normalize_payload(cls.repository.to_dict(data))
        items_data = payload.pop("items", None)

        # Update base fields
        updated_pr = cls.repository.update(db, pr, payload, user_id)

        if items_data is not None:
            # Drop existing items and create new ones
            for item in pr.items:
                PurchaseRequestItemRepository.hard_delete(db, item)

            total_amount = Decimal("0.0")
            for item in items_data:
                item["purchase_request_id"] = pr.id
                qty = int(item.get("quantity") or 1)
                price = Decimal(str(item.get("estimated_unit_price") or 0))
                item["total_price"] = Decimal(qty) * price
                total_amount += item["total_price"]
                PurchaseRequestItemRepository.create(db, item, user_id)

            updated_pr.total_amount = total_amount
            db.commit()

            budget_id = updated_pr.budget_id
            if budget_id:
                cls.validate_budget(db, budget_id, total_amount)

        db.refresh(updated_pr)
        return updated_pr

    @classmethod
    def validate_budget(cls, db: Session, budget_id: int, request_amount: Decimal) -> None:
        budget = db.query(Budget).filter(Budget.id == budget_id).first()
        if not budget:
            raise HTTPException(status_code=404, detail="Budget not found")

        remaining_budget = budget.total_amount - budget.consumed_amount
        if request_amount > remaining_budget:
            raise HTTPException(
                status_code=400,
                detail=f"Budget validation failed. Requested amount {request_amount} exceeds remaining budget of {remaining_budget}."
            )

    @classmethod
    def approve_request(cls, db: Session, pr_id: int, approver_id: int, action: str, comments: str | None = None) -> PurchaseRequest:
        pr = cls.repository.get_by_id(db, pr_id)
        if not pr:
            raise HTTPException(status_code=404, detail="Purchase request not found")

        if pr.status != "pending_approval":
            pr.status = "pending_approval" # Force transition to pending_approval if draft

        if action == "approved":
            # Re-validate budget upon approval and deduct/consume budget
            if pr.budget_id:
                cls.validate_budget(db, pr.budget_id, pr.total_amount)
                budget = db.query(Budget).filter(Budget.id == pr.budget_id).first()
                budget.consumed_amount += pr.total_amount
            pr.status = "approved"
        else:
            pr.status = "rejected"

        # Log Approval
        approval_data = {
            "purchase_request_id": pr.id,
            "approver_id": approver_id,
            "action": action,
            "comments": comments,
            "status": "completed"
        }
        PurchaseRequestApprovalRepository.create(db, approval_data, approver_id)

        db.commit()
        db.refresh(pr)
        return pr


class RFQService(BaseProcurementService):
    repository = RFQRepository
    entity_name = "RFQ"
    export_fields = ("id", "uuid", "rfq_number", "title", "description", "status", "due_date")

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> RFQ:
        payload = normalize_payload(cls.repository.to_dict(data))
        items_data = payload.pop("items", []) or []
        supplier_ids = payload.pop("supplier_ids", []) or []

        cls.ensure_required(payload, "title")
        cls.ensure_required(payload, "due_date")

        payload["rfq_number"] = generate_identifier("RFQ")
        payload["created_by"] = user_id

        rfq = cls.repository.create(db, payload, user_id)

        # Create RFQ Items
        for item in items_data:
            item["rfq_id"] = rfq.id
            RFQItemRepository.create(db, item, user_id)

        # Invite Suppliers
        for s_id in supplier_ids:
            RFQSupplierRepository.create(db, {
                "rfq_id": rfq.id,
                "supplier_id": s_id,
                "status": "invited",
                "total_bid": Decimal("0.0")
            }, user_id)

        db.refresh(rfq)
        return rfq

    @classmethod
    def submit_response(cls, db: Session, rfq_id: int, supplier_id: int, responses: List[Dict[str, Any]], notes: str | None = None) -> RFQSupplier:
        rfq_s = db.query(RFQSupplier).filter(RFQSupplier.rfq_id == rfq_id, RFQSupplier.supplier_id == supplier_id).first()
        if not rfq_s:
            raise HTTPException(status_code=404, detail="Supplier not invited to this RFQ")

        # Clear existing responses
        for resp in rfq_s.responses:
            RFQResponseItemRepository.hard_delete(db, resp)

        total_bid = Decimal("0.0")
        for resp in responses:
            rfq_item_id = resp.get("rfq_item_id")
            unit_price = Decimal(str(resp.get("quoted_unit_price") or 0))
            rfq_item = RFQItemRepository.get_by_id(db, rfq_item_id)
            if not rfq_item:
                raise HTTPException(status_code=404, detail=f"RFQ item {rfq_item_id} not found")

            total_item_price = Decimal(rfq_item.quantity) * unit_price
            total_bid += total_item_price

            RFQResponseItemRepository.create(db, {
                "rfq_supplier_id": rfq_s.id,
                "rfq_item_id": rfq_item_id,
                "quoted_unit_price": unit_price,
                "quoted_total_price": total_item_price,
                "delivery_lead_time_days": resp.get("delivery_lead_time_days", 0),
                "status": "responded"
            })

        rfq_s.total_bid = total_bid
        rfq_s.status = "responded"
        rfq_s.submitted_at = datetime.now(timezone.utc)
        rfq_s.notes = notes

        # If RFQ is in draft, move to sent
        if rfq_s.rfq.status == "draft":
            rfq_s.rfq.status = "sent"

        db.commit()
        db.refresh(rfq_s)
        return rfq_s

    @classmethod
    def get_comparison_table(cls, db: Session, rfq_id: int) -> Dict[str, Any]:
        rfq = cls.repository.get_by_id(db, rfq_id)
        if not rfq:
            raise HTTPException(status_code=404, detail="RFQ not found")

        comparison = []
        for item in rfq.items:
            bids = []
            for supplier in rfq.suppliers:
                resp_item = db.query(RFQResponseItem).filter(
                    RFQResponseItem.rfq_supplier_id == supplier.id,
                    RFQResponseItem.rfq_item_id == item.id
                ).first()
                bids.append({
                    "supplier_id": supplier.supplier_id,
                    "supplier_company": supplier.supplier.company if supplier.supplier else "",
                    "quoted_unit_price": resp_item.quoted_unit_price if resp_item else None,
                    "quoted_total_price": resp_item.quoted_total_price if resp_item else None,
                    "delivery_lead_time_days": resp_item.delivery_lead_time_days if resp_item else None,
                })
            comparison.append({
                "rfq_item_id": item.id,
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else "",
                "quantity": item.quantity,
                "bids": bids
            })

        return {
            "rfq_id": rfq.id,
            "rfq_number": rfq.rfq_number,
            "comparison": comparison
        }

    @classmethod
    def select_winner(cls, db: Session, rfq_id: int, winning_supplier_id: int, user_id: int | None = None) -> RFQ:
        rfq = cls.repository.get_by_id(db, rfq_id)
        if not rfq:
            raise HTTPException(status_code=404, detail="RFQ not found")

        winner_found = False
        for s in rfq.suppliers:
            if s.supplier_id == winning_supplier_id:
                s.status = "won"
                winner_found = True
            else:
                s.status = "lost"

        if not winner_found:
            raise HTTPException(status_code=404, detail="Winning supplier not found among RFQ list")

        rfq.status = "awarded"
        db.commit()

        # Automatically spawn draft Purchase Order
        winning_rfq_supplier = db.query(RFQSupplier).filter(RFQSupplier.rfq_id == rfq.id, RFQSupplier.supplier_id == winning_supplier_id).first()
        po_data = {
            "organization_id": rfq.organization_id,
            "company_id": rfq.company_id,
            "rfq_id": rfq.id,
            "supplier_id": winning_supplier_id,
            "po_number": generate_identifier("PO"),
            "title": f"PO spawned from RFQ: {rfq.title}",
            "status": "draft",
            "total_amount": winning_rfq_supplier.total_bid,
            "currency": "USD"
        }
        po = PurchaseOrderRepository.create(db, po_data, user_id)

        for item in rfq.items:
            quoted_item = db.query(RFQResponseItem).filter(
                RFQResponseItem.rfq_supplier_id == winning_rfq_supplier.id,
                RFQResponseItem.rfq_item_id == item.id
            ).first()
            unit_price = quoted_item.quoted_unit_price if quoted_item else Decimal("0.0")
            PurchaseOrderItemRepository.create(db, {
                "purchase_order_id": po.id,
                "product_id": item.product_id,
                "variant_id": item.variant_id,
                "quantity": item.quantity,
                "unit_price": unit_price,
                "total_amount": unit_price * item.quantity,
                "status": "pending"
            }, user_id)

        db.commit()
        db.refresh(rfq)
        return rfq


class PurchaseOrderService(BaseProcurementService):
    repository = PurchaseOrderRepository
    entity_name = "Purchase order"
    export_fields = ("id", "uuid", "po_number", "title", "supplier_id", "status", "total_amount", "currency")

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> PurchaseOrder:
        payload = normalize_payload(cls.repository.to_dict(data))
        items_data = payload.pop("items", []) or []

        cls.ensure_required(payload, "supplier_id")
        cls.ensure_required(payload, "title")

        payload["po_number"] = generate_identifier("PO")
        total_amount = Decimal("0.0")
        for item in items_data:
            qty = int(item.get("quantity") or 1)
            price = Decimal(str(item.get("unit_price") or 0))
            tax_rate = Decimal(str(item.get("tax_rate") or 0))
            tax_amt = price * qty * (tax_rate / 100)
            disc_amt = Decimal(str(item.get("discount_amount") or 0))

            item["tax_amount"] = tax_amt
            item["total_amount"] = (price * qty) + tax_amt - disc_amt
            total_amount += item["total_amount"]

        payload["total_amount"] = total_amount

        po = cls.repository.create(db, payload, user_id)

        # Create Items
        for item in items_data:
            item["purchase_order_id"] = po.id
            PurchaseOrderItemRepository.create(db, item, user_id)

        db.refresh(po)
        return po

    @classmethod
    def approve_order(cls, db: Session, po_id: int, approver_id: int, action: str, comments: str | None = None) -> PurchaseOrder:
        po = cls.repository.get_by_id(db, po_id)
        if not po:
            raise HTTPException(status_code=404, detail="Purchase order not found")

        if action == "approved":
            po.status = "approved"

            # Auto spawn VendorBill inside Finance Module!
            bill_data = {
                "organization_id": po.organization_id,
                "company_id": po.company_id,
                "supplier_id": po.supplier_id,
                "bill_number": generate_identifier("BILL"),
                "total_amount": po.total_amount,
                "balance_due": po.total_amount,
                "status": "Draft",
                "notes": f"Auto-generated from PO: {po.po_number}"
            }
            VendorBillRepository.create(db, bill_data, approver_id)
        else:
            po.status = "rejected"

        # Log PO approval
        PurchaseOrderApprovalRepository.create(db, {
            "purchase_order_id": po.id,
            "approver_id": approver_id,
            "action": action,
            "comments": comments,
            "status": "completed"
        }, approver_id)

        db.commit()
        db.refresh(po)
        return po


class GoodsReceiptService(BaseProcurementService):
    repository = GoodsReceiptNoteRepository
    entity_name = "Goods receipt"
    export_fields = ("id", "uuid", "grn_number", "purchase_order_id", "warehouse_id", "received_by_id", "status")

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> GoodsReceiptNote:
        payload = normalize_payload(cls.repository.to_dict(data))
        items_data = payload.pop("items", []) or []

        cls.ensure_required(payload, "purchase_order_id")
        cls.ensure_required(payload, "warehouse_id")
        cls.ensure_required(payload, "received_by_id")

        payload["grn_number"] = generate_identifier("GRN")
        grn = cls.repository.create(db, payload, user_id)

        # Create Items
        for item in items_data:
            item["goods_receipt_note_id"] = grn.id
            GoodsReceiptItemRepository.create(db, item, user_id)

        db.refresh(grn)
        return grn

    @classmethod
    def complete_receipt(cls, db: Session, grn_id: int, user_id: int | None = None) -> GoodsReceiptNote:
        grn = cls.repository.get_by_id(db, grn_id)
        if not grn:
            raise HTTPException(status_code=404, detail="Goods receipt note not found")

        if grn.status == "completed":
            return grn

        po = grn.purchase_order
        if not po:
            raise HTTPException(status_code=404, detail="Purchase order not found")

        # Update Stock & Purchase order item received quantities
        for grn_item in grn.items:
            # Find matching PO item
            po_item = db.query(PurchaseOrderItem).filter(
                PurchaseOrderItem.purchase_order_id == po.id,
                PurchaseOrderItem.product_id == grn_item.product_id,
                PurchaseOrderItem.variant_id == grn_item.variant_id
            ).first()

            if po_item:
                po_item.received_quantity += grn_item.quantity_received
                if po_item.received_quantity >= po_item.quantity:
                    po_item.status = "completed"
                else:
                    po_item.status = "partially_received"

            # Apply stock update (Inventory Integration!)
            InventoryService.update_stock(
                db,
                product_id=grn_item.product_id,
                variant_id=grn_item.variant_id,
                warehouse_id=grn.warehouse_id,
                delta=grn_item.quantity_received,
                movement_type="Purchase",
                user_id=user_id,
                reference_type="GRN",
                reference_id=grn.id,
                reason="PO Goods Receipt"
            )

        # Update PO overall status
        all_po_items = db.query(PurchaseOrderItem).filter(PurchaseOrderItem.purchase_order_id == po.id).all()
        if all(item.status == "completed" for item in all_po_items):
            po.status = "completed"
        else:
            po.status = "partially_received"

        grn.status = "completed"
        db.commit()
        db.refresh(grn)
        return grn


class PurchaseReturnService(BaseProcurementService):
    repository = PurchaseReturnRepository
    entity_name = "Purchase return"
    export_fields = ("id", "uuid", "return_number", "purchase_order_id", "supplier_id", "warehouse_id", "status")

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> PurchaseReturn:
        payload = normalize_payload(cls.repository.to_dict(data))
        items_data = payload.pop("items", []) or []

        cls.ensure_required(payload, "supplier_id")
        cls.ensure_required(payload, "warehouse_id")
        cls.ensure_required(payload, "returned_by_id")

        payload["return_number"] = generate_identifier("RET")
        ret = cls.repository.create(db, payload, user_id)

        # Create Items
        for item in items_data:
            item["purchase_return_id"] = ret.id
            PurchaseReturnItemRepository.create(db, item, user_id)

        db.refresh(ret)
        return ret

    @classmethod
    def complete_return(cls, db: Session, return_id: int, user_id: int | None = None) -> PurchaseReturn:
        ret = cls.repository.get_by_id(db, return_id)
        if not ret:
            raise HTTPException(status_code=404, detail="Purchase return not found")

        if ret.status == "completed":
            return ret

        # Update Stock (Inventory Restoration!) & PO item returned quantities
        for item in ret.items:
            if ret.purchase_order_id:
                po_item = db.query(PurchaseOrderItem).filter(
                    PurchaseOrderItem.purchase_order_id == ret.purchase_order_id,
                    PurchaseOrderItem.product_id == item.product_id,
                    PurchaseOrderItem.variant_id == item.variant_id
                ).first()
                if po_item:
                    po_item.returned_quantity += item.quantity_returned

            # Reduce stock by returned quantity (Negative Delta!)
            InventoryService.update_stock(
                db,
                product_id=item.product_id,
                variant_id=item.variant_id,
                warehouse_id=ret.warehouse_id,
                delta=-item.quantity_returned,
                movement_type="Return",
                user_id=user_id,
                reference_type="Return",
                reference_id=ret.id,
                reason="Purchase Return to Supplier"
            )

        ret.status = "completed"
        db.commit()
        db.refresh(ret)
        return ret


class SupplierPaymentService(BaseProcurementService):
    repository = SupplierPaymentRepository
    entity_name = "Supplier payment"
    export_fields = ("id", "uuid", "payment_number", "vendor_bill_id", "supplier_id", "payment_method", "status", "amount")

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> SupplierPayment:
        payload = normalize_payload(cls.repository.to_dict(data))
        cls.ensure_required(payload, "vendor_bill_id")
        cls.ensure_required(payload, "supplier_id")
        cls.ensure_required(payload, "amount")

        payload["payment_number"] = generate_identifier("PAY")
        sp = cls.repository.create(db, payload, user_id)

        # Update Vendor Bill in Finance Module (Finance Integration!)
        bill = db.query(VendorBill).filter(VendorBill.id == sp.vendor_bill_id).first()
        if bill:
            bill.paid_amount += sp.amount
            bill.balance_due = bill.total_amount - bill.paid_amount
            if bill.balance_due <= 0:
                bill.status = "Paid"
            else:
                bill.status = "Partially Paid"

        sp.status = "completed"
        db.commit()
        db.refresh(sp)
        return sp


class ProcurementAnalyticsService:
    @classmethod
    def get_dashboard(cls, db: Session) -> Dict[str, Any]:
        # Procurement Costs & Totals
        total_po_cost = db.query(func.sum(PurchaseOrder.total_amount)).filter(PurchaseOrder.status == "completed").scalar() or Decimal("0.0")
        total_pos = db.query(func.count(PurchaseOrder.id)).scalar() or 0
        total_suppliers = db.query(func.count(Supplier.id)).scalar() or 0

        # Purchase Trends (Monthly aggregation)
        trends = db.query(
            func.to_char(PurchaseOrder.created_at, 'YYYY-MM').label("month"),
            func.sum(PurchaseOrder.total_amount).label("total")
        ).filter(PurchaseOrder.status == "completed").group_by("month").order_by("month").all()

        monthly_trends = [{"month": r.month, "total_spent": float(r.total or 0)} for r in trends]

        # Top Suppliers by Spending
        top_sup = db.query(
            Supplier.company.label("company"),
            func.sum(PurchaseOrder.total_amount).label("spent")
        ).join(PurchaseOrder, Supplier.id == PurchaseOrder.supplier_id).filter(PurchaseOrder.status == "completed").group_by(Supplier.company).order_by(func.sum(PurchaseOrder.total_amount).desc()).limit(5).all()

        top_suppliers = [{"supplier": s.company, "total_spent": float(s.spent or 0)} for s in top_sup]

        # Delivery Performance (Late / On Time)
        total_grns = db.query(func.count(GoodsReceiptNote.id)).scalar() or 0

        # Budget Savings (PR Budget vs actual PO spending)
        savings = db.query(
            func.sum(PurchaseRequest.total_amount).label("budget_total"),
            func.sum(PurchaseOrder.total_amount).label("po_total")
        ).join(PurchaseOrder, PurchaseRequest.id == PurchaseOrder.purchase_request_id).filter(PurchaseOrder.status == "completed").first()

        cost_savings = 0.0
        if savings and savings.budget_total and savings.budget_total > 0:
            cost_savings = float(savings.budget_total - (savings.po_total or Decimal(0)))

        return {
            "total_po_spending": float(total_po_cost),
            "total_orders": total_pos,
            "total_suppliers_count": total_suppliers,
            "monthly_purchase_trends": monthly_trends,
            "top_suppliers": top_suppliers,
            "total_deliveries": total_grns,
            "cost_savings": cost_savings,
            "report_generated_at": datetime.now(timezone.utc).isoformat()
        }
