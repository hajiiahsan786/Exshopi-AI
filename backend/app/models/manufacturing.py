import uuid as uuid_lib
from sqlalchemy import Boolean, CheckConstraint, Column, DateTime, ForeignKey, Integer, JSON, Numeric, String, Text, UniqueConstraint, Date, Time
from sqlalchemy.orm import relationship

from app.database.base import Base
from app.models.crm_mixins import AuditMixin, UUIDMixin

# Define Models

class WorkCenter(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_work_centers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    name = Column(String(150), nullable=False)
    code = Column(String(50), nullable=False, unique=True, index=True)
    description = Column(Text)
    capacity_per_hour = Column(Numeric(10, 2), nullable=False, default=1.0)
    cost_per_hour = Column(Numeric(15, 2), nullable=False, default=0.0)
    is_active = Column(Boolean, default=True)

    machines = relationship("Machine", back_populates="work_center")
    calendars = relationship("WorkCenterCalendar", back_populates="work_center")
    routing_steps = relationship("RoutingStep", back_populates="work_center")
    capacity_plannings = relationship("CapacityPlanning", back_populates="work_center")

class WorkCenterCalendar(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_work_center_calendars"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    work_center_id = Column(String(36), ForeignKey("manufacturing_work_centers.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False) # 0 = Monday, 6 = Sunday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_working_day = Column(Boolean, default=True)

    work_center = relationship("WorkCenter", back_populates="calendars")

class Machine(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_machines"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    work_center_id = Column(String(36), ForeignKey("manufacturing_work_centers.id"), nullable=False)
    name = Column(String(150), nullable=False)
    serial_number = Column(String(100), unique=True)
    status = Column(String(50), default="active") # active, maintenance, broken
    hourly_cost = Column(Numeric(15, 2), default=0.0)

    work_center = relationship("WorkCenter", back_populates="machines")
    maintenances = relationship("MachineMaintenance", back_populates="machine")

class MachineMaintenance(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_machine_maintenances"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    machine_id = Column(String(36), ForeignKey("manufacturing_machines.id"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    description = Column(Text)
    cost = Column(Numeric(15, 2), default=0.0)
    status = Column(String(50), default="scheduled") # scheduled, in_progress, completed, cancelled

    machine = relationship("Machine", back_populates="maintenances")

class Routing(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_routings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    name = Column(String(150), nullable=False)
    version = Column(String(50), nullable=False, default="1.0")
    description = Column(Text)
    is_active = Column(Boolean, default=True)

    steps = relationship("RoutingStep", back_populates="routing", order_by="RoutingStep.sequence")
    boms = relationship("BillOfMaterials", back_populates="routing")

class RoutingStep(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_routing_steps"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    routing_id = Column(String(36), ForeignKey("manufacturing_routings.id"), nullable=False)
    work_center_id = Column(String(36), ForeignKey("manufacturing_work_centers.id"), nullable=False)
    name = Column(String(150), nullable=False)
    sequence = Column(Integer, nullable=False)
    operation_type = Column(String(100))
    setup_time_minutes = Column(Numeric(10, 2), default=0.0)
    run_time_minutes = Column(Numeric(10, 2), default=0.0)

    routing = relationship("Routing", back_populates="steps")
    work_center = relationship("WorkCenter", back_populates="routing_steps")

class BillOfMaterials(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_boms"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    routing_id = Column(String(36), ForeignKey("manufacturing_routings.id"), nullable=True)
    name = Column(String(150), nullable=False)
    version = Column(String(50), nullable=False, default="1.0")
    quantity = Column(Numeric(15, 4), nullable=False, default=1.0) # Base quantity this BOM produces
    is_active = Column(Boolean, default=True)

    routing = relationship("Routing", back_populates="boms")
    items = relationship("BOMItem", back_populates="bom", cascade="all, delete-orphan")
    manufacturing_orders = relationship("ManufacturingOrder", back_populates="bom")

class BOMItem(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_bom_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    bom_id = Column(String(36), ForeignKey("manufacturing_boms.id"), nullable=False)
    component_product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    component_variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    quantity = Column(Numeric(15, 4), nullable=False)
    uom_id = Column(Integer, ForeignKey("units.id"), nullable=True) # Unit of measure
    scrap_percentage = Column(Numeric(5, 2), default=0.0)
    notes = Column(Text)

    bom = relationship("BillOfMaterials", back_populates="items")

class ManufacturingOrder(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    order_number = Column(String(50), nullable=False, unique=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    bom_id = Column(String(36), ForeignKey("manufacturing_boms.id"), nullable=True)
    quantity_to_produce = Column(Numeric(15, 4), nullable=False)
    quantity_produced = Column(Numeric(15, 4), default=0.0)
    status = Column(String(50), default="draft") # draft, confirmed, planned, in_progress, done, cancelled
    priority = Column(String(20), default="normal") # low, normal, high, urgent
    planned_start_date = Column(DateTime)
    planned_end_date = Column(DateTime)
    actual_start_date = Column(DateTime)
    actual_end_date = Column(DateTime)
    notes = Column(Text)

    bom = relationship("BillOfMaterials", back_populates="manufacturing_orders")
    work_orders = relationship("WorkOrder", back_populates="manufacturing_order")
    material_reservations = relationship("MaterialReservation", back_populates="manufacturing_order")
    material_consumptions = relationship("MaterialConsumption", back_populates="manufacturing_order")
    finished_goods_receipts = relationship("FinishedGoodsReceipt", back_populates="manufacturing_order")
    scrap_records = relationship("ScrapRecord", back_populates="manufacturing_order")
    rework_orders = relationship("ReworkOrder", back_populates="manufacturing_order")
    production_costs = relationship("ProductionCost", back_populates="manufacturing_order")
    quality_inspections = relationship("QualityInspection", back_populates="manufacturing_order")
    batches = relationship("ProductionBatch", back_populates="manufacturing_order")

class WorkOrder(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_work_orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    manufacturing_order_id = Column(String(36), ForeignKey("manufacturing_orders.id"), nullable=False)
    work_center_id = Column(String(36), ForeignKey("manufacturing_work_centers.id"), nullable=False)
    name = Column(String(150), nullable=False)
    status = Column(String(50), default="pending") # pending, ready, in_progress, done, cancelled
    planned_start_date = Column(DateTime)
    planned_end_date = Column(DateTime)
    actual_start_date = Column(DateTime)
    actual_end_date = Column(DateTime)
    expected_duration_minutes = Column(Numeric(10, 2))
    actual_duration_minutes = Column(Numeric(10, 2))

    manufacturing_order = relationship("ManufacturingOrder", back_populates="work_orders")

class ProductionSchedule(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_production_schedules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    name = Column(String(150), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(50), default="draft")
    notes = Column(Text)

class ProductionBatch(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_production_batches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    batch_number = Column(String(100), nullable=False, unique=True)
    manufacturing_order_id = Column(String(36), ForeignKey("manufacturing_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Numeric(15, 4), nullable=False)
    manufacturing_date = Column(DateTime)
    expiry_date = Column(DateTime)
    notes = Column(Text)

    manufacturing_order = relationship("ManufacturingOrder", back_populates="batches")

class MaterialReservation(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_material_reservations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    manufacturing_order_id = Column(String(36), ForeignKey("manufacturing_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity_reserved = Column(Numeric(15, 4), nullable=False)
    status = Column(String(50), default="reserved") # reserved, consumed, released

    manufacturing_order = relationship("ManufacturingOrder", back_populates="material_reservations")

class MaterialConsumption(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_material_consumptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    manufacturing_order_id = Column(String(36), ForeignKey("manufacturing_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity_consumed = Column(Numeric(15, 4), nullable=False)
    consumption_date = Column(DateTime, nullable=False)
    lot_number = Column(String(100))

    manufacturing_order = relationship("ManufacturingOrder", back_populates="material_consumptions")

class FinishedGoodsReceipt(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_finished_goods_receipts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    manufacturing_order_id = Column(String(36), ForeignKey("manufacturing_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity_received = Column(Numeric(15, 4), nullable=False)
    receipt_date = Column(DateTime, nullable=False)
    batch_id = Column(String(36), ForeignKey("manufacturing_production_batches.id"), nullable=True)

    manufacturing_order = relationship("ManufacturingOrder", back_populates="finished_goods_receipts")

class ScrapRecord(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_scrap_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    manufacturing_order_id = Column(String(36), ForeignKey("manufacturing_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    quantity = Column(Numeric(15, 4), nullable=False)
    reason = Column(Text)
    scrap_date = Column(DateTime, nullable=False)

    manufacturing_order = relationship("ManufacturingOrder", back_populates="scrap_records")

class ReworkOrder(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_rework_orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    manufacturing_order_id = Column(String(36), ForeignKey("manufacturing_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity_to_rework = Column(Numeric(15, 4), nullable=False)
    reason = Column(Text)
    status = Column(String(50), default="pending") # pending, in_progress, done

    manufacturing_order = relationship("ManufacturingOrder", back_populates="rework_orders")

class ProductionCost(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_production_costs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    manufacturing_order_id = Column(String(36), ForeignKey("manufacturing_orders.id"), nullable=False)
    cost_type = Column(String(50), nullable=False) # material, labor, overhead
    amount = Column(Numeric(15, 2), nullable=False)
    currency = Column(String(3), default="USD")
    description = Column(Text)

    manufacturing_order = relationship("ManufacturingOrder", back_populates="production_costs")

class QualityInspection(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_quality_inspections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    manufacturing_order_id = Column(String(36), ForeignKey("manufacturing_orders.id"), nullable=False)
    inspector_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    inspection_date = Column(DateTime)
    status = Column(String(50), default="pending") # pending, passed, failed
    notes = Column(Text)

    manufacturing_order = relationship("ManufacturingOrder", back_populates="quality_inspections")
    inspector = relationship("User", foreign_keys=[inspector_id])
    checkpoints = relationship("QualityCheckpoint", back_populates="inspection")

class QualityCheckpoint(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_quality_checkpoints"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    inspection_id = Column(String(36), ForeignKey("manufacturing_quality_inspections.id"), nullable=False)
    name = Column(String(150), nullable=False)
    expected_value = Column(String(255))
    actual_value = Column(String(255))
    passed = Column(Boolean)
    notes = Column(Text)

    inspection = relationship("QualityInspection", back_populates="checkpoints")

class CapacityPlanning(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_capacity_plannings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    work_center_id = Column(String(36), ForeignKey("manufacturing_work_centers.id"), nullable=False)
    date = Column(Date, nullable=False)
    available_capacity_hours = Column(Numeric(10, 2), nullable=False)
    allocated_capacity_hours = Column(Numeric(10, 2), default=0.0)

    work_center = relationship("WorkCenter", back_populates="capacity_plannings")

class ProductionForecast(UUIDMixin, AuditMixin, Base):
    __tablename__ = "manufacturing_production_forecasts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid_lib.uuid4()))
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    forecasted_quantity = Column(Numeric(15, 4), nullable=False)
    notes = Column(Text)
