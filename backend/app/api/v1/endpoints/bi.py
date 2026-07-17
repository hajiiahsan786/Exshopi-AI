from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.security.dependencies import get_current_user
from app.models.user import User
from app.schemas.bi import (
    DashboardCreate,
    DashboardResponse,
    DashboardUpdate,
    KPICreate,
    KPIResponse,
    KPIUpdate,
    ReportCreate,
    ReportResponse,
    ReportUpdate,
    MetricCreate,
    MetricResponse,
    ReportExecutionResponse
)
from app.services.bi_service import DashboardService, KPIService, ReportService, AnalyticsService


router = APIRouter()

# --- Dashboards ---
@router.post("/dashboards/", response_model=DashboardResponse)
def create_dashboard(
    *,
    db: Session = Depends(get_db),
    dashboard_in: DashboardCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    service = DashboardService(db)
    # Assuming organization_id is accessible via current_user or provided; setting to 1 for example
    return service.create(dashboard_in, organization_id=current_user.organization_id, user_id=current_user.id)

@router.get("/dashboards/", response_model=List[DashboardResponse])
def read_dashboards(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    service = DashboardService(db)
    return service.list(organization_id=current_user.organization_id, skip=skip, limit=limit)

@router.get("/dashboards/{dashboard_id}", response_model=DashboardResponse)
def read_dashboard(
    dashboard_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    service = DashboardService(db)
    dashboard = service.get(dashboard_id)
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    return dashboard

@router.put("/dashboards/{dashboard_id}", response_model=DashboardResponse)
def update_dashboard(
    *,
    db: Session = Depends(get_db),
    dashboard_id: int,
    dashboard_in: DashboardUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    service = DashboardService(db)
    dashboard = service.update(dashboard_id, dashboard_in, user_id=current_user.id)
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    return dashboard

@router.delete("/dashboards/{dashboard_id}")
def delete_dashboard(
    dashboard_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    service = DashboardService(db)
    success = service.delete(dashboard_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    return {"message": "Dashboard deleted successfully"}

@router.post("/dashboards/{dashboard_id}/generate")
def generate_dashboard(
    dashboard_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    service = DashboardService(db)
    return service.generate_dashboard(dashboard_id)


# --- KPIs ---
@router.post("/kpis/", response_model=KPIResponse)
def create_kpi(
    *,
    db: Session = Depends(get_db),
    kpi_in: KPICreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    service = KPIService(db)
    return service.create(kpi_in, organization_id=current_user.organization_id, user_id=current_user.id)

@router.get("/kpis/", response_model=List[KPIResponse])
def read_kpis(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    service = KPIService(db)
    return service.list(organization_id=current_user.organization_id, skip=skip, limit=limit)


# --- Reports ---
@router.post("/reports/", response_model=ReportResponse)
def create_report(
    *,
    db: Session = Depends(get_db),
    report_in: ReportCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    service = ReportService(db)
    return service.create(report_in, organization_id=current_user.organization_id, user_id=current_user.id)

@router.get("/reports/", response_model=List[ReportResponse])
def read_reports(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    service = ReportService(db)
    return service.list(organization_id=current_user.organization_id, skip=skip, limit=limit)

@router.post("/reports/{report_id}/execute", response_model=ReportExecutionResponse)
def execute_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    service = ReportService(db)
    return service.execute_report(report_id, user_id=current_user.id)


# --- Metrics & Analytics ---
@router.post("/metrics/", response_model=MetricResponse)
def create_metric(
    *,
    db: Session = Depends(get_db),
    metric_in: MetricCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    service = AnalyticsService(db)
    return service.create_metric(metric_in, organization_id=current_user.organization_id, user_id=current_user.id)

@router.get("/metrics/", response_model=List[MetricResponse])
def read_metrics(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    service = AnalyticsService(db)
    return service.list_metrics(organization_id=current_user.organization_id, skip=skip, limit=limit)
