from datetime import date, datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TimestampSchema(BaseModel):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class AuditSchema(TimestampSchema):
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None
    deleted_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# --- Dashboard ---
class DashboardBase(BaseModel):
    name: str
    description: Optional[str] = None
    dashboard_type: str
    is_public: bool = False
    layout: Optional[Dict[str, Any]] = None

class DashboardCreate(DashboardBase):
    pass

class DashboardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    dashboard_type: Optional[str] = None
    is_public: Optional[bool] = None
    layout: Optional[Dict[str, Any]] = None

class DashboardResponse(DashboardBase, AuditSchema):
    id: int
    uuid: UUID
    organization_id: int
    model_config = ConfigDict(from_attributes=True)


# --- DashboardWidget ---
class DashboardWidgetBase(BaseModel):
    title: str
    widget_type: str
    configuration: Dict[str, Any]
    position_x: int = 0
    position_y: int = 0
    width: int = 1
    height: int = 1

class DashboardWidgetCreate(DashboardWidgetBase):
    dashboard_id: int

class DashboardWidgetUpdate(BaseModel):
    title: Optional[str] = None
    widget_type: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = None
    position_x: Optional[int] = None
    position_y: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None

class DashboardWidgetResponse(DashboardWidgetBase, AuditSchema):
    id: int
    uuid: UUID
    dashboard_id: int
    model_config = ConfigDict(from_attributes=True)


# --- DashboardLayout ---
class DashboardLayoutBase(BaseModel):
    layout_config: Dict[str, Any]

class DashboardLayoutCreate(DashboardLayoutBase):
    dashboard_id: int

class DashboardLayoutUpdate(BaseModel):
    layout_config: Optional[Dict[str, Any]] = None

class DashboardLayoutResponse(DashboardLayoutBase, AuditSchema):
    id: int
    uuid: UUID
    dashboard_id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)


# --- KPI ---
class KPIBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    calculation_logic: str
    target_value: Optional[float] = None
    unit: Optional[str] = None

class KPICreate(KPIBase):
    pass

class KPIUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    calculation_logic: Optional[str] = None
    target_value: Optional[float] = None
    unit: Optional[str] = None

class KPIResponse(KPIBase, AuditSchema):
    id: int
    uuid: UUID
    organization_id: int
    model_config = ConfigDict(from_attributes=True)


# --- KPIHistory ---
class KPIHistoryBase(BaseModel):
    value: float
    timestamp: datetime
    period: Optional[str] = None

class KPIHistoryCreate(KPIHistoryBase):
    kpi_id: int

class KPIHistoryUpdate(BaseModel):
    value: Optional[float] = None
    timestamp: Optional[datetime] = None
    period: Optional[str] = None

class KPIHistoryResponse(KPIHistoryBase):
    id: int
    uuid: UUID
    kpi_id: int
    model_config = ConfigDict(from_attributes=True)


# --- Metric ---
class MetricBase(BaseModel):
    name: str
    metric_type: str
    query_config: Dict[str, Any]

class MetricCreate(MetricBase):
    pass

class MetricUpdate(BaseModel):
    name: Optional[str] = None
    metric_type: Optional[str] = None
    query_config: Optional[Dict[str, Any]] = None

class MetricResponse(MetricBase, AuditSchema):
    id: int
    uuid: UUID
    organization_id: int
    model_config = ConfigDict(from_attributes=True)


# --- MetricSnapshot ---
class MetricSnapshotBase(BaseModel):
    value: Dict[str, Any]
    timestamp: datetime

class MetricSnapshotCreate(MetricSnapshotBase):
    metric_id: int

class MetricSnapshotUpdate(BaseModel):
    value: Optional[Dict[str, Any]] = None
    timestamp: Optional[datetime] = None

class MetricSnapshotResponse(MetricSnapshotBase):
    id: int
    uuid: UUID
    metric_id: int
    model_config = ConfigDict(from_attributes=True)


# --- ReportCategory ---
class ReportCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class ReportCategoryCreate(ReportCategoryBase):
    pass

class ReportCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ReportCategoryResponse(ReportCategoryBase, AuditSchema):
    id: int
    uuid: UUID
    organization_id: int
    model_config = ConfigDict(from_attributes=True)


# --- Report ---
class ReportBase(BaseModel):
    category_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    report_type: str
    data_source_config: Dict[str, Any]
    visualization_config: Optional[Dict[str, Any]] = None

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    report_type: Optional[str] = None
    data_source_config: Optional[Dict[str, Any]] = None
    visualization_config: Optional[Dict[str, Any]] = None

class ReportResponse(ReportBase, AuditSchema):
    id: int
    uuid: UUID
    organization_id: int
    model_config = ConfigDict(from_attributes=True)


# --- ReportSchedule ---
class ReportScheduleBase(BaseModel):
    cron_expression: str
    recipients: List[str]
    format: str = "pdf"
    is_active: bool = True

class ReportScheduleCreate(ReportScheduleBase):
    report_id: int

class ReportScheduleUpdate(BaseModel):
    cron_expression: Optional[str] = None
    recipients: Optional[List[str]] = None
    format: Optional[str] = None
    is_active: Optional[bool] = None

class ReportScheduleResponse(ReportScheduleBase, AuditSchema):
    id: int
    uuid: UUID
    report_id: int
    model_config = ConfigDict(from_attributes=True)


# --- ScheduledReport ---
class ScheduledReportBase(BaseModel):
    execution_time: datetime
    status: str
    file_url: Optional[str] = None
    error_message: Optional[str] = None

class ScheduledReportCreate(ScheduledReportBase):
    schedule_id: int

class ScheduledReportUpdate(BaseModel):
    status: Optional[str] = None
    file_url: Optional[str] = None
    error_message: Optional[str] = None

class ScheduledReportResponse(ScheduledReportBase, AuditSchema):
    id: int
    uuid: UUID
    schedule_id: int
    model_config = ConfigDict(from_attributes=True)


# --- ReportExecution ---
class ReportExecutionBase(BaseModel):
    execution_time: datetime
    duration_ms: Optional[int] = None
    status: str
    parameters: Optional[Dict[str, Any]] = None

class ReportExecutionCreate(ReportExecutionBase):
    report_id: int

class ReportExecutionUpdate(BaseModel):
    duration_ms: Optional[int] = None
    status: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None

class ReportExecutionResponse(ReportExecutionBase):
    id: int
    uuid: UUID
    report_id: int
    executed_by: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)


# --- DataSource ---
class DataSourceBase(BaseModel):
    name: str
    source_type: str
    connection_config: Dict[str, Any]

class DataSourceCreate(DataSourceBase):
    pass

class DataSourceUpdate(BaseModel):
    name: Optional[str] = None
    source_type: Optional[str] = None
    connection_config: Optional[Dict[str, Any]] = None

class DataSourceResponse(DataSourceBase, AuditSchema):
    id: int
    uuid: UUID
    organization_id: int
    model_config = ConfigDict(from_attributes=True)


# --- AnalyticsDataset ---
class AnalyticsDatasetBase(BaseModel):
    name: str
    query_definition: str
    schema_definition: Optional[Dict[str, Any]] = None

class AnalyticsDatasetCreate(AnalyticsDatasetBase):
    pass

class AnalyticsDatasetUpdate(BaseModel):
    name: Optional[str] = None
    query_definition: Optional[str] = None
    schema_definition: Optional[Dict[str, Any]] = None

class AnalyticsDatasetResponse(AnalyticsDatasetBase, AuditSchema):
    id: int
    uuid: UUID
    organization_id: int
    model_config = ConfigDict(from_attributes=True)


# --- DataCube ---
class DataCubeBase(BaseModel):
    name: str
    dimensions: Dict[str, Any]
    measures: Dict[str, Any]
    dataset_id: Optional[int] = None

class DataCubeCreate(DataCubeBase):
    pass

class DataCubeUpdate(BaseModel):
    name: Optional[str] = None
    dimensions: Optional[Dict[str, Any]] = None
    measures: Optional[Dict[str, Any]] = None
    dataset_id: Optional[int] = None

class DataCubeResponse(DataCubeBase, AuditSchema):
    id: int
    uuid: UUID
    organization_id: int
    model_config = ConfigDict(from_attributes=True)


# --- DataAggregation ---
class DataAggregationBase(BaseModel):
    aggregation_level: str
    data: Dict[str, Any]
    last_updated: Optional[datetime] = None

class DataAggregationCreate(DataAggregationBase):
    cube_id: int

class DataAggregationUpdate(BaseModel):
    aggregation_level: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class DataAggregationResponse(DataAggregationBase, AuditSchema):
    id: int
    uuid: UUID
    cube_id: int
    model_config = ConfigDict(from_attributes=True)


# --- Chart ---
class ChartBase(BaseModel):
    dashboard_id: Optional[int] = None
    name: str
    chart_type: str
    options: Optional[Dict[str, Any]] = None

class ChartCreate(ChartBase):
    pass

class ChartUpdate(BaseModel):
    dashboard_id: Optional[int] = None
    name: Optional[str] = None
    chart_type: Optional[str] = None
    options: Optional[Dict[str, Any]] = None

class ChartResponse(ChartBase, AuditSchema):
    id: int
    uuid: UUID
    model_config = ConfigDict(from_attributes=True)


# --- ChartSeries ---
class ChartSeriesBase(BaseModel):
    name: str
    data_source: Dict[str, Any]
    color: Optional[str] = None

class ChartSeriesCreate(ChartSeriesBase):
    chart_id: int

class ChartSeriesUpdate(BaseModel):
    name: Optional[str] = None
    data_source: Optional[Dict[str, Any]] = None
    color: Optional[str] = None

class ChartSeriesResponse(ChartSeriesBase):
    id: int
    uuid: UUID
    chart_id: int
    model_config = ConfigDict(from_attributes=True)


# --- FilterPreset ---
class FilterPresetBase(BaseModel):
    dashboard_id: Optional[int] = None
    name: str
    filters: Dict[str, Any]

class FilterPresetCreate(FilterPresetBase):
    pass

class FilterPresetUpdate(BaseModel):
    dashboard_id: Optional[int] = None
    name: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None

class FilterPresetResponse(FilterPresetBase, AuditSchema):
    id: int
    uuid: UUID
    organization_id: int
    user_id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)


# --- DrillDownConfiguration ---
class DrillDownConfigurationBase(BaseModel):
    target_dashboard_id: Optional[int] = None
    target_report_id: Optional[int] = None
    parameter_mapping: Dict[str, Any]

class DrillDownConfigurationCreate(DrillDownConfigurationBase):
    source_widget_id: int

class DrillDownConfigurationUpdate(BaseModel):
    target_dashboard_id: Optional[int] = None
    target_report_id: Optional[int] = None
    parameter_mapping: Optional[Dict[str, Any]] = None

class DrillDownConfigurationResponse(DrillDownConfigurationBase, AuditSchema):
    id: int
    uuid: UUID
    source_widget_id: int
    model_config = ConfigDict(from_attributes=True)


# --- ForecastModel ---
class ForecastModelBase(BaseModel):
    name: str
    target_metric: str
    algorithm: str
    parameters: Optional[Dict[str, Any]] = None

class ForecastModelCreate(ForecastModelBase):
    pass

class ForecastModelUpdate(BaseModel):
    name: Optional[str] = None
    target_metric: Optional[str] = None
    algorithm: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None

class ForecastModelResponse(ForecastModelBase, AuditSchema):
    id: int
    uuid: UUID
    organization_id: int
    model_config = ConfigDict(from_attributes=True)


# --- ForecastResult ---
class ForecastResultBase(BaseModel):
    forecast_date: date
    predicted_value: float
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    confidence_level: Optional[float] = None

class ForecastResultCreate(ForecastResultBase):
    model_id: int

class ForecastResultUpdate(BaseModel):
    forecast_date: Optional[date] = None
    predicted_value: Optional[float] = None
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    confidence_level: Optional[float] = None

class ForecastResultResponse(ForecastResultBase):
    id: int
    uuid: UUID
    model_id: int
    model_config = ConfigDict(from_attributes=True)


# --- AlertRule ---
class AlertRuleBase(BaseModel):
    name: str
    metric_id: Optional[int] = None
    kpi_id: Optional[int] = None
    condition: str
    threshold: float
    action_config: Dict[str, Any]
    is_active: bool = True

class AlertRuleCreate(AlertRuleBase):
    pass

class AlertRuleUpdate(BaseModel):
    name: Optional[str] = None
    metric_id: Optional[int] = None
    kpi_id: Optional[int] = None
    condition: Optional[str] = None
    threshold: Optional[float] = None
    action_config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class AlertRuleResponse(AlertRuleBase, AuditSchema):
    id: int
    uuid: UUID
    organization_id: int
    model_config = ConfigDict(from_attributes=True)


# --- AlertHistory ---
class AlertHistoryBase(BaseModel):
    triggered_at: datetime
    triggered_value: float
    status: str

class AlertHistoryCreate(AlertHistoryBase):
    rule_id: int

class AlertHistoryUpdate(BaseModel):
    triggered_value: Optional[float] = None
    status: Optional[str] = None

class AlertHistoryResponse(AlertHistoryBase):
    id: int
    uuid: UUID
    rule_id: int
    model_config = ConfigDict(from_attributes=True)


# --- ExecutiveSummary ---
class ExecutiveSummaryBase(BaseModel):
    period_start: datetime
    period_end: datetime
    summary_text: str
    key_metrics: Dict[str, Any]

class ExecutiveSummaryCreate(ExecutiveSummaryBase):
    pass

class ExecutiveSummaryUpdate(BaseModel):
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    summary_text: Optional[str] = None
    key_metrics: Optional[Dict[str, Any]] = None

class ExecutiveSummaryResponse(ExecutiveSummaryBase, AuditSchema):
    id: int
    uuid: UUID
    organization_id: int
    model_config = ConfigDict(from_attributes=True)


# --- AnalyticsAuditLog ---
class AnalyticsAuditLogBase(BaseModel):
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime

class AnalyticsAuditLogCreate(AnalyticsAuditLogBase):
    pass

class AnalyticsAuditLogResponse(AnalyticsAuditLogBase):
    id: int
    uuid: UUID
    organization_id: int
    user_id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)
