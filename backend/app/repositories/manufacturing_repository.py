from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from app.models.manufacturing import (
    WorkCenter, WorkCenterCalendar, Machine, MachineMaintenance,
    Routing, RoutingStep, BillOfMaterials, BOMItem,
    ManufacturingOrder, WorkOrder, ProductionSchedule, ProductionBatch,
    MaterialReservation, MaterialConsumption, FinishedGoodsReceipt,
    ScrapRecord, ReworkOrder, ProductionCost, QualityInspection,
    QualityCheckpoint, CapacityPlanning, ProductionForecast
)
from app.repositories.crm_repository import CRMRepository

class WorkCenterRepository(CRMRepository[WorkCenter]):
    model = WorkCenter
    search_fields = ("name", "code", "description")

class WorkCenterCalendarRepository(CRMRepository[WorkCenterCalendar]):
    model = WorkCenterCalendar

class MachineRepository(CRMRepository[Machine]):
    model = Machine
    search_fields = ("name", "serial_number", "status")

class MachineMaintenanceRepository(CRMRepository[MachineMaintenance]):
    model = MachineMaintenance
    search_fields = ("description", "status")

class RoutingRepository(CRMRepository[Routing]):
    model = Routing
    search_fields = ("name", "version", "description")

class RoutingStepRepository(CRMRepository[RoutingStep]):
    model = RoutingStep
    search_fields = ("name", "operation_type")

class BillOfMaterialsRepository(CRMRepository[BillOfMaterials]):
    model = BillOfMaterials
    search_fields = ("name", "version")

class BOMItemRepository(CRMRepository[BOMItem]):
    model = BOMItem
    search_fields = ("notes",)

class ManufacturingOrderRepository(CRMRepository[ManufacturingOrder]):
    model = ManufacturingOrder
    search_fields = ("order_number", "status", "priority", "notes")

class WorkOrderRepository(CRMRepository[WorkOrder]):
    model = WorkOrder
    search_fields = ("name", "status")

class ProductionScheduleRepository(CRMRepository[ProductionSchedule]):
    model = ProductionSchedule
    search_fields = ("name", "status", "notes")

class ProductionBatchRepository(CRMRepository[ProductionBatch]):
    model = ProductionBatch
    search_fields = ("batch_number", "notes")

class MaterialReservationRepository(CRMRepository[MaterialReservation]):
    model = MaterialReservation
    search_fields = ("status",)

class MaterialConsumptionRepository(CRMRepository[MaterialConsumption]):
    model = MaterialConsumption
    search_fields = ("lot_number",)

class FinishedGoodsReceiptRepository(CRMRepository[FinishedGoodsReceipt]):
    model = FinishedGoodsReceipt

class ScrapRecordRepository(CRMRepository[ScrapRecord]):
    model = ScrapRecord
    search_fields = ("reason",)

class ReworkOrderRepository(CRMRepository[ReworkOrder]):
    model = ReworkOrder
    search_fields = ("reason", "status")

class ProductionCostRepository(CRMRepository[ProductionCost]):
    model = ProductionCost
    search_fields = ("cost_type", "description")

class QualityInspectionRepository(CRMRepository[QualityInspection]):
    model = QualityInspection
    search_fields = ("status", "notes")

class QualityCheckpointRepository(CRMRepository[QualityCheckpoint]):
    model = QualityCheckpoint
    search_fields = ("name", "expected_value", "actual_value", "notes")

class CapacityPlanningRepository(CRMRepository[CapacityPlanning]):
    model = CapacityPlanning

class ProductionForecastRepository(CRMRepository[ProductionForecast]):
    model = ProductionForecast
    search_fields = ("notes",)
