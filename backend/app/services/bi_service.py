from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.bi import (
    Dashboard,
    DashboardWidget,
    DashboardLayout,
    KPI,
    KPIHistory,
    Metric,
    MetricSnapshot,
    Report,
    ReportCategory,
    ReportSchedule,
    ScheduledReport,
    ReportExecution,
    DataSource,
    AnalyticsDataset,
    DataCube,
    DataAggregation,
    Chart,
    ChartSeries,
    FilterPreset,
    DrillDownConfiguration,
    ForecastModel,
    ForecastResult,
    AlertRule,
    AlertHistory,
    ExecutiveSummary,
    AnalyticsAuditLog,
)
from app.repositories.bi_repository import (
    DashboardRepository,
    DashboardWidgetRepository,
    DashboardLayoutRepository,
    KPIRepository,
    KPIHistoryRepository,
    MetricRepository,
    MetricSnapshotRepository,
    ReportRepository,
    ReportCategoryRepository,
    ReportScheduleRepository,
    ScheduledReportRepository,
    ReportExecutionRepository,
    DataSourceRepository,
    AnalyticsDatasetRepository,
    DataCubeRepository,
    DataAggregationRepository,
    ChartRepository,
    ChartSeriesRepository,
    FilterPresetRepository,
    DrillDownConfigurationRepository,
    ForecastModelRepository,
    ForecastResultRepository,
    AlertRuleRepository,
    AlertHistoryRepository,
    ExecutiveSummaryRepository,
    AnalyticsAuditLogRepository,
)
from app.schemas.bi import (
    DashboardCreate,
    DashboardUpdate,
    DashboardWidgetCreate,
    DashboardWidgetUpdate,
    DashboardLayoutCreate,
    DashboardLayoutUpdate,
    KPICreate,
    KPIUpdate,
    KPIHistoryCreate,
    MetricCreate,
    MetricUpdate,
    MetricSnapshotCreate,
    ReportCreate,
    ReportUpdate,
    ReportCategoryCreate,
    ReportCategoryUpdate,
    ReportScheduleCreate,
    ReportScheduleUpdate,
    ScheduledReportCreate,
    ScheduledReportUpdate,
    ReportExecutionCreate,
    DataSourceCreate,
    DataSourceUpdate,
    AnalyticsDatasetCreate,
    AnalyticsDatasetUpdate,
    DataCubeCreate,
    DataCubeUpdate,
    DataAggregationCreate,
    ChartCreate,
    ChartUpdate,
    ChartSeriesCreate,
    ChartSeriesUpdate,
    FilterPresetCreate,
    FilterPresetUpdate,
    DrillDownConfigurationCreate,
    DrillDownConfigurationUpdate,
    ForecastModelCreate,
    ForecastModelUpdate,
    ForecastResultCreate,
    AlertRuleCreate,
    AlertRuleUpdate,
    AlertHistoryCreate,
    ExecutiveSummaryCreate,
    ExecutiveSummaryUpdate,
    AnalyticsAuditLogCreate,
)


class DashboardService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = DashboardRepository(Dashboard, db)

    def create(self, data: DashboardCreate, organization_id: int, user_id: int) -> Dashboard:
        obj_in = data.model_dump()
        obj_in["organization_id"] = organization_id
        obj_in["created_by"] = user_id
        return self.repository.create(obj_in)

    def update(self, id: int, data: DashboardUpdate, user_id: int) -> Optional[Dashboard]:
        dashboard = self.repository.get(id)
        if not dashboard:
            return None
        obj_in = data.model_dump(exclude_unset=True)
        obj_in["updated_by"] = user_id
        return self.repository.update(dashboard, obj_in)

    def get(self, id: int) -> Optional[Dashboard]:
        return self.repository.get(id)

    def list(self, organization_id: int, skip: int = 0, limit: int = 100) -> List[Dashboard]:
        return self.repository.get_multi(filters={"organization_id": organization_id}, skip=skip, limit=limit)

    def delete(self, id: int, user_id: int) -> bool:
        dashboard = self.repository.get(id)
        if not dashboard:
            return False
        self.repository.delete(id)
        return True

    def generate_dashboard(self, id: int) -> Dict[str, Any]:
        """Generate full dashboard data, a placeholder for real BI engine logic."""
        dashboard = self.get(id)
        if not dashboard:
            return {}
        return {
            "id": dashboard.id,
            "name": dashboard.name,
            "widgets": [{"id": w.id, "title": w.title} for w in dashboard.widgets]
        }


class KPIService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = KPIRepository(KPI, db)
        self.history_repo = KPIHistoryRepository(KPIHistory, db)

    def create(self, data: KPICreate, organization_id: int, user_id: int) -> KPI:
        obj_in = data.model_dump()
        obj_in["organization_id"] = organization_id
        obj_in["created_by"] = user_id
        return self.repository.create(obj_in)

    def get(self, id: int) -> Optional[KPI]:
        return self.repository.get(id)

    def list(self, organization_id: int, skip: int = 0, limit: int = 100) -> List[KPI]:
        return self.repository.get_multi(filters={"organization_id": organization_id}, skip=skip, limit=limit)

    def update(self, id: int, data: KPIUpdate, user_id: int) -> Optional[KPI]:
        kpi = self.repository.get(id)
        if not kpi:
            return None
        obj_in = data.model_dump(exclude_unset=True)
        obj_in["updated_by"] = user_id
        return self.repository.update(kpi, obj_in)

    def delete(self, id: int, user_id: int) -> bool:
        kpi = self.repository.get(id)
        if not kpi:
            return False
        self.repository.delete(id)
        return True

    def calculate_kpi(self, kpi_id: int) -> float:
        """Placeholder for KPI calculation logic"""
        # Logic to execute self.get(kpi_id).calculation_logic
        return 100.0

    def record_history(self, kpi_id: int, value: float) -> KPIHistory:
        obj_in = {"kpi_id": kpi_id, "value": value, "timestamp": datetime.now()}
        return self.history_repo.create(obj_in)


class ReportService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = ReportRepository(Report, db)
        self.schedule_repo = ReportScheduleRepository(ReportSchedule, db)
        self.execution_repo = ReportExecutionRepository(ReportExecution, db)

    def create(self, data: ReportCreate, organization_id: int, user_id: int) -> Report:
        obj_in = data.model_dump()
        obj_in["organization_id"] = organization_id
        obj_in["created_by"] = user_id
        return self.repository.create(obj_in)

    def get(self, id: int) -> Optional[Report]:
        return self.repository.get(id)

    def list(self, organization_id: int, skip: int = 0, limit: int = 100) -> List[Report]:
        return self.repository.get_multi(filters={"organization_id": organization_id}, skip=skip, limit=limit)

    def update(self, id: int, data: ReportUpdate, user_id: int) -> Optional[Report]:
        report = self.repository.get(id)
        if not report:
            return None
        obj_in = data.model_dump(exclude_unset=True)
        obj_in["updated_by"] = user_id
        return self.repository.update(report, obj_in)

    def delete(self, id: int, user_id: int) -> bool:
        report = self.repository.get(id)
        if not report:
            return False
        self.repository.delete(id)
        return True

    def execute_report(self, report_id: int, user_id: int, parameters: Optional[Dict[str, Any]] = None) -> ReportExecution:
        obj_in = {
            "report_id": report_id,
            "executed_by": user_id,
            "execution_time": datetime.now(),
            "status": "completed",
            "parameters": parameters,
            "duration_ms": 150
        }
        return self.execution_repo.create(obj_in)

class AnalyticsService:
    """Service covering forecasting, aggregation, metrics, and alerting."""
    def __init__(self, db: Session):
        self.db = db
        self.metric_repo = MetricRepository(Metric, db)
        self.forecast_repo = ForecastModelRepository(ForecastModel, db)
        self.alert_repo = AlertRuleRepository(AlertRule, db)
        self.summary_repo = ExecutiveSummaryRepository(ExecutiveSummary, db)
        self.audit_repo = AnalyticsAuditLogRepository(AnalyticsAuditLog, db)

    def create_metric(self, data: MetricCreate, organization_id: int, user_id: int) -> Metric:
        obj_in = data.model_dump()
        obj_in["organization_id"] = organization_id
        obj_in["created_by"] = user_id
        return self.metric_repo.create(obj_in)

    def list_metrics(self, organization_id: int, skip: int = 0, limit: int = 100) -> List[Metric]:
        return self.metric_repo.get_multi(filters={"organization_id": organization_id}, skip=skip, limit=limit)

    def execute_forecast(self, model_id: int) -> Dict[str, Any]:
        """Placeholder for forecast execution"""
        return {"status": "success", "predictions": []}

    def generate_executive_summary(self, organization_id: int) -> ExecutiveSummary:
        """Placeholder for executive summary generation"""
        obj_in = {
            "organization_id": organization_id,
            "period_start": datetime.now(),
            "period_end": datetime.now(),
            "summary_text": "Quarterly summary based on key metrics...",
            "key_metrics": {"revenue": 10000, "growth": 0.15}
        }
        return self.summary_repo.create(obj_in)

    def log_audit(self, organization_id: int, user_id: int, action: str, resource_type: str, resource_id: str, details: Dict[str, Any]):
        obj_in = {
            "organization_id": organization_id,
            "user_id": user_id,
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "details": details,
            "timestamp": datetime.now()
        }
        return self.audit_repo.create(obj_in)
