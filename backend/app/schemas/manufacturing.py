from datetime import date, datetime, time
from decimal import Decimal
from typing import Optional

from pydantic import Field, constr

from app.schemas.crm_common import AuditResponseMixin, CRMBaseModel

# --- Work Center ---
class WorkCenterBase(CRMBaseModel):
    name: str = Field(..., max_length=150)
    code: str = Field(..., max_length=50)
    description: Optional[str] = None
    capacity_per_hour: Decimal = Field(default=Decimal("1.0"), max_digits=10, decimal_places=2)
    cost_per_hour: Decimal = Field(default=Decimal("0.0"), max_digits=15, decimal_places=2)
    is_active: bool = True

class WorkCenterCreate(WorkCenterBase):
    pass

class WorkCenterUpdate(CRMBaseModel):
    name: Optional[str] = Field(None, max_length=150)
    code: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    capacity_per_hour: Optional[Decimal] = Field(None, max_digits=10, decimal_places=2)
    cost_per_hour: Optional[Decimal] = Field(None, max_digits=15, decimal_places=2)
    is_active: Optional[bool] = None

class WorkCenterResponse(WorkCenterBase, AuditResponseMixin):
    id: str

# --- Work Center Calendar ---
class WorkCenterCalendarBase(CRMBaseModel):
    work_center_id: str
    day_of_week: int = Field(..., ge=0, le=6)
    start_time: time
    end_time: time
    is_working_day: bool = True

class WorkCenterCalendarCreate(WorkCenterCalendarBase):
    pass

class WorkCenterCalendarUpdate(CRMBaseModel):
    day_of_week: Optional[int] = Field(None, ge=0, le=6)
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    is_working_day: Optional[bool] = None

class WorkCenterCalendarResponse(WorkCenterCalendarBase, AuditResponseMixin):
    id: str

# --- Machine ---
class MachineBase(CRMBaseModel):
    work_center_id: str
    name: str = Field(..., max_length=150)
    serial_number: Optional[str] = Field(None, max_length=100)
    status: str = Field(default="active", max_length=50)
    hourly_cost: Decimal = Field(default=Decimal("0.0"), max_digits=15, decimal_places=2)

class MachineCreate(MachineBase):
    pass

class MachineUpdate(CRMBaseModel):
    work_center_id: Optional[int] = None
    name: Optional[str] = Field(None, max_length=150)
    serial_number: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = Field(None, max_length=50)
    hourly_cost: Optional[Decimal] = Field(None, max_digits=15, decimal_places=2)

class MachineResponse(MachineBase, AuditResponseMixin):
    id: str

# --- Machine Maintenance ---
class MachineMaintenanceBase(CRMBaseModel):
    machine_id: str
    start_date: datetime
    end_date: datetime
    description: Optional[str] = None
    cost: Decimal = Field(default=Decimal("0.0"), max_digits=15, decimal_places=2)
    status: str = Field(default="scheduled", max_length=50)

class MachineMaintenanceCreate(MachineMaintenanceBase):
    pass

class MachineMaintenanceUpdate(CRMBaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    description: Optional[str] = None
    cost: Optional[Decimal] = Field(None, max_digits=15, decimal_places=2)
    status: Optional[str] = Field(None, max_length=50)

class MachineMaintenanceResponse(MachineMaintenanceBase, AuditResponseMixin):
    id: str

# --- Routing ---
class RoutingBase(CRMBaseModel):
    name: str = Field(..., max_length=150)
    version: str = Field(default="1.0", max_length=50)
    description: Optional[str] = None
    is_active: bool = True

class RoutingCreate(RoutingBase):
    pass

class RoutingUpdate(CRMBaseModel):
    name: Optional[str] = Field(None, max_length=150)
    version: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    is_active: Optional[bool] = None

class RoutingResponse(RoutingBase, AuditResponseMixin):
    id: str

# --- Routing Step ---
class RoutingStepBase(CRMBaseModel):
    routing_id: str
    work_center_id: str
    name: str = Field(..., max_length=150)
    sequence: int
    operation_type: Optional[str] = Field(None, max_length=100)
    setup_time_minutes: Decimal = Field(default=Decimal("0.0"), max_digits=10, decimal_places=2)
    run_time_minutes: Decimal = Field(default=Decimal("0.0"), max_digits=10, decimal_places=2)

class RoutingStepCreate(RoutingStepBase):
    pass

class RoutingStepUpdate(CRMBaseModel):
    work_center_id: Optional[int] = None
    name: Optional[str] = Field(None, max_length=150)
    sequence: Optional[int] = None
    operation_type: Optional[str] = Field(None, max_length=100)
    setup_time_minutes: Optional[Decimal] = Field(None, max_digits=10, decimal_places=2)
    run_time_minutes: Optional[Decimal] = Field(None, max_digits=10, decimal_places=2)

class RoutingStepResponse(RoutingStepBase, AuditResponseMixin):
    id: str

# --- Bill Of Materials ---
class BillOfMaterialsBase(CRMBaseModel):
    product_id: str
    product_variant_id: Optional[int] = None
    routing_id: Optional[int] = None
    name: str = Field(..., max_length=150)
    version: str = Field(default="1.0", max_length=50)
    quantity: Decimal = Field(default=Decimal("1.0"), max_digits=15, decimal_places=4)
    is_active: bool = True

class BillOfMaterialsCreate(BillOfMaterialsBase):
    pass

class BillOfMaterialsUpdate(CRMBaseModel):
    product_id: Optional[int] = None
    product_variant_id: Optional[int] = None
    routing_id: Optional[int] = None
    name: Optional[str] = Field(None, max_length=150)
    version: Optional[str] = Field(None, max_length=50)
    quantity: Optional[Decimal] = Field(None, max_digits=15, decimal_places=4)
    is_active: Optional[bool] = None

class BillOfMaterialsResponse(BillOfMaterialsBase, AuditResponseMixin):
    id: str

# --- BOM Item ---
class BOMItemBase(CRMBaseModel):
    bom_id: str
    component_product_id: str
    component_variant_id: Optional[int] = None
    quantity: Decimal = Field(..., max_digits=15, decimal_places=4)
    uom_id: Optional[int] = None
    scrap_percentage: Decimal = Field(default=Decimal("0.0"), max_digits=5, decimal_places=2)
    notes: Optional[str] = None

class BOMItemCreate(BOMItemBase):
    pass

class BOMItemUpdate(CRMBaseModel):
    component_product_id: Optional[int] = None
    component_variant_id: Optional[int] = None
    quantity: Optional[Decimal] = Field(None, max_digits=15, decimal_places=4)
    uom_id: Optional[int] = None
    scrap_percentage: Optional[Decimal] = Field(None, max_digits=5, decimal_places=2)
    notes: Optional[str] = None

class BOMItemResponse(BOMItemBase, AuditResponseMixin):
    id: str

# --- Manufacturing Order ---
class ManufacturingOrderBase(CRMBaseModel):
    order_number: str = Field(..., max_length=50)
    product_id: str
    product_variant_id: Optional[int] = None
    bom_id: Optional[int] = None
    quantity_to_produce: Decimal = Field(..., max_digits=15, decimal_places=4)
    quantity_produced: Decimal = Field(default=Decimal("0.0"), max_digits=15, decimal_places=4)
    status: str = Field(default="draft", max_length=50)
    priority: str = Field(default="normal", max_length=20)
    planned_start_date: Optional[datetime] = None
    planned_end_date: Optional[datetime] = None
    actual_start_date: Optional[datetime] = None
    actual_end_date: Optional[datetime] = None
    notes: Optional[str] = None

class ManufacturingOrderCreate(ManufacturingOrderBase):
    pass

class ManufacturingOrderUpdate(CRMBaseModel):
    product_id: Optional[int] = None
    product_variant_id: Optional[int] = None
    bom_id: Optional[int] = None
    quantity_to_produce: Optional[Decimal] = Field(None, max_digits=15, decimal_places=4)
    quantity_produced: Optional[Decimal] = Field(None, max_digits=15, decimal_places=4)
    status: Optional[str] = Field(None, max_length=50)
    priority: Optional[str] = Field(None, max_length=20)
    planned_start_date: Optional[datetime] = None
    planned_end_date: Optional[datetime] = None
    actual_start_date: Optional[datetime] = None
    actual_end_date: Optional[datetime] = None
    notes: Optional[str] = None

class ManufacturingOrderResponse(ManufacturingOrderBase, AuditResponseMixin):
    id: str

# --- Work Order ---
class WorkOrderBase(CRMBaseModel):
    manufacturing_order_id: str
    work_center_id: str
    name: str = Field(..., max_length=150)
    status: str = Field(default="pending", max_length=50)
    planned_start_date: Optional[datetime] = None
    planned_end_date: Optional[datetime] = None
    actual_start_date: Optional[datetime] = None
    actual_end_date: Optional[datetime] = None
    expected_duration_minutes: Optional[Decimal] = Field(None, max_digits=10, decimal_places=2)
    actual_duration_minutes: Optional[Decimal] = Field(None, max_digits=10, decimal_places=2)

class WorkOrderCreate(WorkOrderBase):
    pass

class WorkOrderUpdate(CRMBaseModel):
    work_center_id: Optional[int] = None
    name: Optional[str] = Field(None, max_length=150)
    status: Optional[str] = Field(None, max_length=50)
    planned_start_date: Optional[datetime] = None
    planned_end_date: Optional[datetime] = None
    actual_start_date: Optional[datetime] = None
    actual_end_date: Optional[datetime] = None
    expected_duration_minutes: Optional[Decimal] = Field(None, max_digits=10, decimal_places=2)
    actual_duration_minutes: Optional[Decimal] = Field(None, max_digits=10, decimal_places=2)

class WorkOrderResponse(WorkOrderBase, AuditResponseMixin):
    id: str

# --- Production Schedule ---
class ProductionScheduleBase(CRMBaseModel):
    name: str = Field(..., max_length=150)
    start_date: date
    end_date: date
    status: str = Field(default="draft", max_length=50)
    notes: Optional[str] = None

class ProductionScheduleCreate(ProductionScheduleBase):
    pass

class ProductionScheduleUpdate(CRMBaseModel):
    name: Optional[str] = Field(None, max_length=150)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None

class ProductionScheduleResponse(ProductionScheduleBase, AuditResponseMixin):
    id: str

# --- Production Batch ---
class ProductionBatchBase(CRMBaseModel):
    batch_number: str = Field(..., max_length=100)
    manufacturing_order_id: str
    product_id: str
    quantity: Decimal = Field(..., max_digits=15, decimal_places=4)
    manufacturing_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    notes: Optional[str] = None

class ProductionBatchCreate(ProductionBatchBase):
    pass

class ProductionBatchUpdate(CRMBaseModel):
    quantity: Optional[Decimal] = Field(None, max_digits=15, decimal_places=4)
    manufacturing_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    notes: Optional[str] = None

class ProductionBatchResponse(ProductionBatchBase, AuditResponseMixin):
    id: str

# --- Material Reservation ---
class MaterialReservationBase(CRMBaseModel):
    manufacturing_order_id: str
    product_id: str
    product_variant_id: Optional[int] = None
    warehouse_id: str
    quantity_reserved: Decimal = Field(..., max_digits=15, decimal_places=4)
    status: str = Field(default="reserved", max_length=50)

class MaterialReservationCreate(MaterialReservationBase):
    pass

class MaterialReservationUpdate(CRMBaseModel):
    quantity_reserved: Optional[Decimal] = Field(None, max_digits=15, decimal_places=4)
    status: Optional[str] = Field(None, max_length=50)

class MaterialReservationResponse(MaterialReservationBase, AuditResponseMixin):
    id: str

# --- Material Consumption ---
class MaterialConsumptionBase(CRMBaseModel):
    manufacturing_order_id: str
    product_id: str
    product_variant_id: Optional[int] = None
    warehouse_id: str
    quantity_consumed: Decimal = Field(..., max_digits=15, decimal_places=4)
    consumption_date: datetime
    lot_number: Optional[str] = Field(None, max_length=100)

class MaterialConsumptionCreate(MaterialConsumptionBase):
    pass

class MaterialConsumptionUpdate(CRMBaseModel):
    quantity_consumed: Optional[Decimal] = Field(None, max_digits=15, decimal_places=4)
    consumption_date: Optional[datetime] = None
    lot_number: Optional[str] = Field(None, max_length=100)

class MaterialConsumptionResponse(MaterialConsumptionBase, AuditResponseMixin):
    id: str

# --- Finished Goods Receipt ---
class FinishedGoodsReceiptBase(CRMBaseModel):
    manufacturing_order_id: str
    product_id: str
    product_variant_id: Optional[int] = None
    warehouse_id: str
    quantity_received: Decimal = Field(..., max_digits=15, decimal_places=4)
    receipt_date: datetime
    batch_id: Optional[int] = None

class FinishedGoodsReceiptCreate(FinishedGoodsReceiptBase):
    pass

class FinishedGoodsReceiptUpdate(CRMBaseModel):
    quantity_received: Optional[Decimal] = Field(None, max_digits=15, decimal_places=4)
    receipt_date: Optional[datetime] = None
    batch_id: Optional[int] = None

class FinishedGoodsReceiptResponse(FinishedGoodsReceiptBase, AuditResponseMixin):
    id: str

# --- Scrap Record ---
class ScrapRecordBase(CRMBaseModel):
    manufacturing_order_id: str
    product_id: str
    product_variant_id: Optional[int] = None
    quantity: Decimal = Field(..., max_digits=15, decimal_places=4)
    reason: Optional[str] = None
    scrap_date: datetime

class ScrapRecordCreate(ScrapRecordBase):
    pass

class ScrapRecordUpdate(CRMBaseModel):
    quantity: Optional[Decimal] = Field(None, max_digits=15, decimal_places=4)
    reason: Optional[str] = None
    scrap_date: Optional[datetime] = None

class ScrapRecordResponse(ScrapRecordBase, AuditResponseMixin):
    id: str

# --- Rework Order ---
class ReworkOrderBase(CRMBaseModel):
    manufacturing_order_id: str
    product_id: str
    quantity_to_rework: Decimal = Field(..., max_digits=15, decimal_places=4)
    reason: Optional[str] = None
    status: str = Field(default="pending", max_length=50)

class ReworkOrderCreate(ReworkOrderBase):
    pass

class ReworkOrderUpdate(CRMBaseModel):
    quantity_to_rework: Optional[Decimal] = Field(None, max_digits=15, decimal_places=4)
    reason: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class ReworkOrderResponse(ReworkOrderBase, AuditResponseMixin):
    id: str

# --- Production Cost ---
class ProductionCostBase(CRMBaseModel):
    manufacturing_order_id: str
    cost_type: str = Field(..., max_length=50)
    amount: Decimal = Field(..., max_digits=15, decimal_places=2)
    currency: str = Field(default="USD", max_length=3)
    description: Optional[str] = None

class ProductionCostCreate(ProductionCostBase):
    pass

class ProductionCostUpdate(CRMBaseModel):
    cost_type: Optional[str] = Field(None, max_length=50)
    amount: Optional[Decimal] = Field(None, max_digits=15, decimal_places=2)
    currency: Optional[str] = Field(None, max_length=3)
    description: Optional[str] = None

class ProductionCostResponse(ProductionCostBase, AuditResponseMixin):
    id: str

# --- Quality Inspection ---
class QualityInspectionBase(CRMBaseModel):
    manufacturing_order_id: str
    inspector_id: Optional[int] = None
    inspection_date: Optional[datetime] = None
    status: str = Field(default="pending", max_length=50)
    notes: Optional[str] = None

class QualityInspectionCreate(QualityInspectionBase):
    pass

class QualityInspectionUpdate(CRMBaseModel):
    inspector_id: Optional[int] = None
    inspection_date: Optional[datetime] = None
    status: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None

class QualityInspectionResponse(QualityInspectionBase, AuditResponseMixin):
    id: str

# --- Quality Checkpoint ---
class QualityCheckpointBase(CRMBaseModel):
    inspection_id: str
    name: str = Field(..., max_length=150)
    expected_value: Optional[str] = Field(None, max_length=255)
    actual_value: Optional[str] = Field(None, max_length=255)
    passed: Optional[bool] = None
    notes: Optional[str] = None

class QualityCheckpointCreate(QualityCheckpointBase):
    pass

class QualityCheckpointUpdate(CRMBaseModel):
    name: Optional[str] = Field(None, max_length=150)
    expected_value: Optional[str] = Field(None, max_length=255)
    actual_value: Optional[str] = Field(None, max_length=255)
    passed: Optional[bool] = None
    notes: Optional[str] = None

class QualityCheckpointResponse(QualityCheckpointBase, AuditResponseMixin):
    id: str

# --- Capacity Planning ---
class CapacityPlanningBase(CRMBaseModel):
    work_center_id: str
    date: date
    available_capacity_hours: Decimal = Field(..., max_digits=10, decimal_places=2)
    allocated_capacity_hours: Decimal = Field(default=Decimal("0.0"), max_digits=10, decimal_places=2)

class CapacityPlanningCreate(CapacityPlanningBase):
    pass

class CapacityPlanningUpdate(CRMBaseModel):
    available_capacity_hours: Optional[Decimal] = Field(None, max_digits=10, decimal_places=2)
    allocated_capacity_hours: Optional[Decimal] = Field(None, max_digits=10, decimal_places=2)

class CapacityPlanningResponse(CapacityPlanningBase, AuditResponseMixin):
    id: str

# --- Production Forecast ---
class ProductionForecastBase(CRMBaseModel):
    product_id: str
    period_start: date
    period_end: date
    forecasted_quantity: Decimal = Field(..., max_digits=15, decimal_places=4)
    notes: Optional[str] = None

class ProductionForecastCreate(ProductionForecastBase):
    pass

class ProductionForecastUpdate(CRMBaseModel):
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    forecasted_quantity: Optional[Decimal] = Field(None, max_digits=15, decimal_places=4)
    notes: Optional[str] = None

class ProductionForecastResponse(ProductionForecastBase, AuditResponseMixin):
    id: str
