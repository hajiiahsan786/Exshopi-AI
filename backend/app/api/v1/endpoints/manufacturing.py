from typing import Any
from sqlalchemy.orm import Session
from fastapi import Depends
from app.database.dependencies import get_db
from app.security.manufacturing_permissions import require_manufacturing_permission
from fastapi import APIRouter
from app.api.v1.endpoints.manufacturing_router_factory import create_manufacturing_router

from app.schemas.manufacturing import (
    ManufacturingOrderCreate, ManufacturingOrderResponse, ManufacturingOrderUpdate,
    BillOfMaterialsCreate, BillOfMaterialsResponse, BillOfMaterialsUpdate,
    WorkCenterCreate, WorkCenterResponse, WorkCenterUpdate,
    MachineCreate, MachineResponse, MachineUpdate,
    RoutingCreate, RoutingResponse, RoutingUpdate,
    ProductionScheduleCreate, ProductionScheduleResponse, ProductionScheduleUpdate
)
from app.repositories.manufacturing_repository import (
    ManufacturingOrderRepository, BillOfMaterialsRepository, WorkCenterRepository,
    MachineRepository, RoutingRepository, ProductionScheduleRepository
)

# Standard CRUD Routers using Repository directly for simplified logic
manufacturing_orders_router = create_manufacturing_router(
    service=ManufacturingOrderRepository,
    create_schema=ManufacturingOrderCreate,
    update_schema=ManufacturingOrderUpdate,
    single_response=ManufacturingOrderResponse,
    list_response=list[ManufacturingOrderResponse],
    permission_prefix="manufacturing.orders",
    entity_label="Manufacturing Order",
)

boms_router = create_manufacturing_router(
    service=BillOfMaterialsRepository,
    create_schema=BillOfMaterialsCreate,
    update_schema=BillOfMaterialsUpdate,
    single_response=BillOfMaterialsResponse,
    list_response=list[BillOfMaterialsResponse],
    permission_prefix="manufacturing.boms",
    entity_label="Bill of Materials",
)

work_centers_router = create_manufacturing_router(
    service=WorkCenterRepository,
    create_schema=WorkCenterCreate,
    update_schema=WorkCenterUpdate,
    single_response=WorkCenterResponse,
    list_response=list[WorkCenterResponse],
    permission_prefix="manufacturing.work_centers",
    entity_label="Work Center",
)

machines_router = create_manufacturing_router(
    service=MachineRepository,
    create_schema=MachineCreate,
    update_schema=MachineUpdate,
    single_response=MachineResponse,
    list_response=list[MachineResponse],
    permission_prefix="manufacturing.machines",
    entity_label="Machine",
)

routings_router = create_manufacturing_router(
    service=RoutingRepository,
    create_schema=RoutingCreate,
    update_schema=RoutingUpdate,
    single_response=RoutingResponse,
    list_response=list[RoutingResponse],
    permission_prefix="manufacturing.routings",
    entity_label="Routing",
)

schedules_router = create_manufacturing_router(
    service=ProductionScheduleRepository,
    create_schema=ProductionScheduleCreate,
    update_schema=ProductionScheduleUpdate,
    single_response=ProductionScheduleResponse,
    list_response=list[ProductionScheduleResponse],
    permission_prefix="manufacturing.schedules",
    entity_label="Production Schedule",
)

MANUFACTURING_ROUTERS = (
    (manufacturing_orders_router, "/orders", ["Manufacturing Orders"]),
    (boms_router, "/boms", ["Bills of Materials"]),
    (work_centers_router, "/work-centers", ["Work Centers"]),
    (machines_router, "/machines", ["Machines"]),
    (routings_router, "/routings", ["Routings"]),
    (schedules_router, "/schedules", ["Production Schedules"]),
)

@boms_router.post("/{bom_id}/explode")
def explode_bom(bom_id: str, quantity: float = 1.0, db: Session = Depends(get_db)):
    from decimal import Decimal
    from app.services.manufacturing_service import ManufacturingService
    return {
        "success": True,
        "message": "BOM exploded successfully",
        "data": ManufacturingService.explode_bom(db, bom_id, Decimal(str(quantity)))
    }

@manufacturing_orders_router.post("/{order_id}/reserve-materials")
def reserve_materials(order_id: str, warehouse_id: int, db: Session = Depends(get_db), current_user: Any = Depends(require_manufacturing_permission("manufacturing.orders.update"))):
    from app.services.manufacturing_service import ManufacturingService
    return {
        "success": True,
        "message": "Materials reserved successfully",
        "data": ManufacturingService.reserve_materials(db, order_id, warehouse_id, current_user)
    }
