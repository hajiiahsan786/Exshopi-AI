from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, List, Dict

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.manufacturing import (
    BillOfMaterials, BOMItem, ManufacturingOrder, MaterialReservation
)
from app.repositories.manufacturing_repository import (
    BillOfMaterialsRepository, ManufacturingOrderRepository, MaterialReservationRepository
)
from app.repositories.inventory_repository import InventoryRepository

class ManufacturingService:

    @staticmethod
    def explode_bom(db: Session, bom_id: int, quantity: Decimal) -> List[Dict[str, Any]]:
        """
        Recursively explodes a BOM to find all required leaf components.
        For simplicity in this step, it assumes a single-level BOM or handles flat lists.
        """
        bom = BillOfMaterialsRepository.get_by_id(db, bom_id)
        if not bom:
            raise HTTPException(status_code=404, detail="BOM not found")

        components = []
        # Calculate ratio of required quantity vs base BOM quantity
        ratio = quantity / bom.quantity if bom.quantity > 0 else Decimal("1.0")

        for item in bom.items:
            required_qty = item.quantity * ratio

            # Account for scrap percentage
            if item.scrap_percentage:
                required_qty = required_qty / (1 - (item.scrap_percentage / 100))

            components.append({
                "product_id": item.component_product_id,
                "product_variant_id": item.component_variant_id,
                "required_quantity": required_qty,
                "uom_id": item.uom_id,
                "notes": item.notes
            })

        return components

    @staticmethod
    def reserve_materials(db: Session, manufacturing_order_id: int, warehouse_id: int, current_user: Any) -> List[MaterialReservation]:
        """
        Checks inventory and reserves materials for a manufacturing order based on its BOM.
        """
        order = ManufacturingOrderRepository.get_by_id(db, manufacturing_order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Manufacturing order not found")

        if not order.bom_id:
            raise HTTPException(status_code=400, detail="Manufacturing order has no associated BOM")

        # 1. Explode BOM
        required_components = ManufacturingService.explode_bom(db, order.bom_id, order.quantity_to_produce)

        reservations = []
        for comp in required_components:
            product_id = comp["product_id"]
            variant_id = comp["product_variant_id"]
            qty = comp["required_quantity"]

            # 2. Check inventory availability (simplified check for this step)
            # In a full implementation, you'd query InventoryRepository to check actual available stock
            # Here we proceed to create the reservation record.

            # 3. Create Reservation
            reservation = MaterialReservation(
                manufacturing_order_id=order.id,
                product_id=product_id,
                product_variant_id=variant_id,
                warehouse_id=warehouse_id,
                quantity_reserved=qty,
                status="reserved"
            )

            MaterialReservationRepository.create(db, reservation, current_user.id if current_user else None)
            reservations.append(reservation)

        # Update order status
        order.status = "planned"
        ManufacturingOrderRepository.update(db, order.id, {"status": "planned"}, current_user.id if current_user else None)

        return reservations


    @staticmethod
    def schedule_order(db: Session, manufacturing_order_id: int, current_user: Any) -> ManufacturingOrder:
        """
        Schedules a manufacturing order and creates work orders based on routing steps.
        """
        order = ManufacturingOrderRepository.get_by_id(db, manufacturing_order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Manufacturing order not found")

        if not order.bom_id:
            raise HTTPException(status_code=400, detail="Manufacturing order has no associated BOM")

        bom = BillOfMaterialsRepository.get_by_id(db, order.bom_id)
        if not bom or not bom.routing_id:
            # If no routing, just mark as scheduled
            order.status = "planned"
            ManufacturingOrderRepository.update(db, order.id, {"status": "planned"}, current_user.id if current_user else None)
            return order

        routing = bom.routing

        from app.repositories.manufacturing_repository import WorkOrderRepository

        work_orders = []
        for step in routing.steps:
            duration = (step.setup_time_minutes + step.run_time_minutes) * order.quantity_to_produce

            wo = WorkOrder(
                manufacturing_order_id=order.id,
                work_center_id=step.work_center_id,
                name=f"{order.order_number} - {step.name}",
                status="pending",
                expected_duration_minutes=duration
            )
            WorkOrderRepository.create(db, wo, current_user.id if current_user else None)
            work_orders.append(wo)

        order.status = "planned"
        ManufacturingOrderRepository.update(db, order.id, {"status": "planned"}, current_user.id if current_user else None)
        return order

    @staticmethod
    def calculate_capacity(db: Session, work_center_id: int, target_date: datetime.date) -> Dict[str, Any]:
        """
        Calculates available capacity for a work center on a given date.
        """
        from app.repositories.manufacturing_repository import WorkCenterRepository, CapacityPlanningRepository

        wc = WorkCenterRepository.get_by_id(db, work_center_id)
        if not wc:
            raise HTTPException(status_code=404, detail="Work center not found")

        # Simplified logic:
        available = wc.capacity_per_hour * 8  # Assume 8 hours/day for this step

        capacity = CapacityPlanning(
            work_center_id=work_center_id,
            date=target_date,
            available_capacity_hours=available,
            allocated_capacity_hours=0.0
        )
        CapacityPlanningRepository.create(db, capacity, None)

        return {
            "work_center_id": work_center_id,
            "date": target_date,
            "available_capacity_hours": available,
            "allocated_capacity_hours": 0.0
        }

    @staticmethod
    def complete_manufacturing_order(db: Session, manufacturing_order_id: int, quantity_produced: Decimal, warehouse_id: int, current_user: Any) -> ManufacturingOrder:
        """
        Completes a manufacturing order, handles finished goods receipt, and calculates costs.
        """
        order = ManufacturingOrderRepository.get_by_id(db, manufacturing_order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Manufacturing order not found")

        from app.repositories.manufacturing_repository import FinishedGoodsReceiptRepository, ProductionCostRepository

        # 1. Update order status
        order.quantity_produced = quantity_produced
        order.status = "done"
        order.actual_end_date = datetime.now(timezone.utc)
        ManufacturingOrderRepository.update(db, order.id, {
            "quantity_produced": quantity_produced,
            "status": "done",
            "actual_end_date": order.actual_end_date
        }, current_user.id if current_user else None)

        # 2. Create Finished Goods Receipt
        receipt = FinishedGoodsReceipt(
            manufacturing_order_id=order.id,
            product_id=order.product_id,
            product_variant_id=order.product_variant_id,
            warehouse_id=warehouse_id,
            quantity_received=quantity_produced,
            receipt_date=datetime.now(timezone.utc)
        )
        FinishedGoodsReceiptRepository.create(db, receipt, current_user.id if current_user else None)

        # 3. Calculate basic production cost (simplified)
        material_cost = ProductionCost(
            manufacturing_order_id=order.id,
            cost_type="material",
            amount=Decimal("100.00"),  # Stub amount
            description="Estimated material cost"
        )
        ProductionCostRepository.create(db, material_cost, current_user.id if current_user else None)

        labor_cost = ProductionCost(
            manufacturing_order_id=order.id,
            cost_type="labor",
            amount=Decimal("50.00"), # Stub amount
            description="Estimated labor cost based on work orders"
        )
        ProductionCostRepository.create(db, labor_cost, current_user.id if current_user else None)

        return order

    @staticmethod
    def record_scrap(db: Session, manufacturing_order_id: int, product_id: int, quantity: Decimal, reason: str, current_user: Any) -> Any:
        from app.repositories.manufacturing_repository import ScrapRecordRepository
        from app.models.manufacturing import ScrapRecord

        scrap = ScrapRecord(
            manufacturing_order_id=manufacturing_order_id,
            product_id=product_id,
            quantity=quantity,
            reason=reason,
            scrap_date=datetime.now(timezone.utc)
        )
        ScrapRecordRepository.create(db, scrap, current_user.id if current_user else None)
        return scrap

    @staticmethod
    def create_rework_order(db: Session, manufacturing_order_id: int, product_id: int, quantity: Decimal, reason: str, current_user: Any) -> Any:
        from app.repositories.manufacturing_repository import ReworkOrderRepository
        from app.models.manufacturing import ReworkOrder

        rework = ReworkOrder(
            manufacturing_order_id=manufacturing_order_id,
            product_id=product_id,
            quantity_to_rework=quantity,
            reason=reason,
            status="pending"
        )
        ReworkOrderRepository.create(db, rework, current_user.id if current_user else None)
        return rework

    @staticmethod
    def record_quality_inspection(db: Session, manufacturing_order_id: int, status: str, notes: str, checkpoints: List[Dict[str, Any]], current_user: Any) -> Any:
        from app.repositories.manufacturing_repository import QualityInspectionRepository, QualityCheckpointRepository
        from app.models.manufacturing import QualityInspection, QualityCheckpoint

        inspection = QualityInspection(
            manufacturing_order_id=manufacturing_order_id,
            inspector_id=current_user.id if current_user else None,
            inspection_date=datetime.now(timezone.utc),
            status=status,
            notes=notes
        )
        QualityInspectionRepository.create(db, inspection, current_user.id if current_user else None)

        for cp in checkpoints:
            checkpoint = QualityCheckpoint(
                inspection_id=inspection.id,
                name=cp.get("name"),
                expected_value=cp.get("expected_value"),
                actual_value=cp.get("actual_value"),
                passed=cp.get("passed"),
                notes=cp.get("notes")
            )
            QualityCheckpointRepository.create(db, checkpoint, current_user.id if current_user else None)

        return inspection
