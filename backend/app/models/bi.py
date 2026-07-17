from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, JSON, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base
from app.models.crm_mixins import AuditMixin, UUIDMixin

class Dashboard(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bi_dashboards"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    dashboard_type = Column(String(100), nullable=False)
    is_public = Column(Boolean, default=False)
    layout = Column(JSON, nullable=True)

    organization = relationship("Organization")
    widgets = relationship("DashboardWidget", back_populates="dashboard", cascade="all, delete-orphan")

class DashboardWidget(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bi_dashboard_widgets"

    id = Column(Integer, primary_key=True)
    dashboard_id = Column(Integer, ForeignKey("bi_dashboards.id"), nullable=False)
    title = Column(String(255), nullable=False)
    widget_type = Column(String(100), nullable=False)
    configuration = Column(JSON, nullable=False)
    position_x = Column(Integer, default=0)
    position_y = Column(Integer, default=0)
    width = Column(Integer, default=1)
    height = Column(Integer, default=1)

    dashboard = relationship("Dashboard", back_populates="widgets")

class DashboardLayout(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bi_dashboard_layouts"

    id = Column(Integer, primary_key=True)
    dashboard_id = Column(Integer, ForeignKey("bi_dashboards.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    layout_config = Column(JSON, nullable=False)

    dashboard = relationship("Dashboard")
    user = relationship("User", foreign_keys=[user_id])

class KPI(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bi_kpis"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)
    calculation_logic = Column(Text, nullable=False)
    target_value = Column(Numeric(15, 2), nullable=True)
    unit = Column(String(50), nullable=True)

    organization = relationship("Organization")
    history = relationship("KPIHistory", back_populates="kpi", cascade="all, delete-orphan")

class KPIHistory(UUIDMixin, Base):
    __tablename__ = "bi_kpi_history"

    id = Column(Integer, primary_key=True)
    kpi_id = Column(Integer, ForeignKey("bi_kpis.id"), nullable=False, index=True)
    value = Column(Numeric(15, 2), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False, default=func.now())
    period = Column(String(50), nullable=True)

    kpi = relationship("KPI", back_populates="history")

class Metric(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bi_metrics"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    metric_type = Column(String(100), nullable=False)
    query_config = Column(JSON, nullable=False)

    organization = relationship("Organization")
    snapshots = relationship("MetricSnapshot", back_populates="metric", cascade="all, delete-orphan")

class MetricSnapshot(UUIDMixin, Base):
    __tablename__ = "bi_metric_snapshots"

    id = Column(Integer, primary_key=True)
    metric_id = Column(Integer, ForeignKey("bi_metrics.id"), nullable=False, index=True)
    value = Column(JSON, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False, default=func.now())

    metric = relationship("Metric", back_populates="snapshots")

class ReportCategory(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bi_report_categories"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    organization = relationship("Organization")
    reports = relationship("Report", back_populates="category")

class Report(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bi_reports"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("bi_report_categories.id"), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    report_type = Column(String(100), nullable=False)
    data_source_config = Column(JSON, nullable=False)
    visualization_config = Column(JSON, nullable=True)

    organization = relationship("Organization")
    category = relationship("ReportCategory", back_populates="reports")
    schedules = relationship("ReportSchedule", back_populates="report", cascade="all, delete-orphan")

class ReportSchedule(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bi_report_schedules"

    id = Column(Integer, primary_key=True)
    report_id = Column(Integer, ForeignKey("bi_reports.id"), nullable=False)
    cron_expression = Column(String(100), nullable=False)
    recipients = Column(JSON, nullable=False)
    format = Column(String(20), nullable=False, default="pdf")
    is_active = Column(Boolean, default=True)

    report = relationship("Report", back_populates="schedules")

class ScheduledReport(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bi_scheduled_reports"

    id = Column(Integer, primary_key=True)
    schedule_id = Column(Integer, ForeignKey("bi_report_schedules.id"), nullable=False)
    execution_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(50), nullable=False)
    file_url = Column(String(500), nullable=True)
    error_message = Column(Text, nullable=True)

    schedule = relationship("ReportSchedule")

class ReportExecution(UUIDMixin, Base):
    __tablename__ = "bi_report_executions"

    id = Column(Integer, primary_key=True)
    report_id = Column(Integer, ForeignKey("bi_reports.id"), nullable=False)
    executed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    execution_time = Column(DateTime(timezone=True), nullable=False, default=func.now())
    duration_ms = Column(Integer, nullable=True)
    status = Column(String(50), nullable=False)
    parameters = Column(JSON, nullable=True)

    report = relationship("Report")
    user = relationship("User", foreign_keys=[executed_by])

class DataSource(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bi_data_sources"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    source_type = Column(String(100), nullable=False)
    connection_config = Column(JSON, nullable=False)

    organization = relationship("Organization")

class AnalyticsDataset(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bi_analytics_datasets"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    query_definition = Column(Text, nullable=False)
    schema_definition = Column(JSON, nullable=True)

    organization = relationship("Organization")

class DataCube(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bi_data_cubes"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    dimensions = Column(JSON, nullable=False)
    measures = Column(JSON, nullable=False)
    dataset_id = Column(Integer, ForeignKey("bi_analytics_datasets.id"), nullable=True)

    organization = relationship("Organization")
    dataset = relationship("AnalyticsDataset")

class DataAggregation(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bi_data_aggregations"

    id = Column(Integer, primary_key=True)
    cube_id = Column(Integer, ForeignKey("bi_data_cubes.id"), nullable=False)
    aggregation_level = Column(String(100), nullable=False)
    data = Column(JSON, nullable=False)
    last_updated = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    cube = relationship("DataCube")

class Chart(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bi_charts"

    id = Column(Integer, primary_key=True)
    dashboard_id = Column(Integer, ForeignKey("bi_dashboards.id"), nullable=True)
    name = Column(String(255), nullable=False)
    chart_type = Column(String(100), nullable=False)
    options = Column(JSON, nullable=True)

    dashboard = relationship("Dashboard")
    series = relationship("ChartSeries", back_populates="chart", cascade="all, delete-orphan")

class ChartSeries(UUIDMixin, Base):
    __tablename__ = "bi_chart_series"

    id = Column(Integer, primary_key=True)
    chart_id = Column(Integer, ForeignKey("bi_charts.id"), nullable=False)
    name = Column(String(100), nullable=False)
    data_source = Column(JSON, nullable=False)
    color = Column(String(50), nullable=True)

    chart = relationship("Chart", back_populates="series")

class FilterPreset(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bi_filter_presets"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    dashboard_id = Column(Integer, ForeignKey("bi_dashboards.id"), nullable=True)
    name = Column(String(255), nullable=False)
    filters = Column(JSON, nullable=False)

    organization = relationship("Organization")
    user = relationship("User", foreign_keys=[user_id])
    dashboard = relationship("Dashboard")

class DrillDownConfiguration(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bi_drill_down_configs"

    id = Column(Integer, primary_key=True)
    source_widget_id = Column(Integer, ForeignKey("bi_dashboard_widgets.id"), nullable=False)
    target_dashboard_id = Column(Integer, ForeignKey("bi_dashboards.id"), nullable=True)
    target_report_id = Column(Integer, ForeignKey("bi_reports.id"), nullable=True)
    parameter_mapping = Column(JSON, nullable=False)

    source_widget = relationship("DashboardWidget")
    target_dashboard = relationship("Dashboard")
    target_report = relationship("Report")

class ForecastModel(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bi_forecast_models"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    target_metric = Column(String(100), nullable=False)
    algorithm = Column(String(100), nullable=False)
    parameters = Column(JSON, nullable=True)

    organization = relationship("Organization")
    results = relationship("ForecastResult", back_populates="model", cascade="all, delete-orphan")

class ForecastResult(UUIDMixin, Base):
    __tablename__ = "bi_forecast_results"

    id = Column(Integer, primary_key=True)
    model_id = Column(Integer, ForeignKey("bi_forecast_models.id"), nullable=False)
    forecast_date = Column(Date, nullable=False)
    predicted_value = Column(Numeric(15, 2), nullable=False)
    lower_bound = Column(Numeric(15, 2), nullable=True)
    upper_bound = Column(Numeric(15, 2), nullable=True)
    confidence_level = Column(Numeric(5, 2), nullable=True)

    model = relationship("ForecastModel", back_populates="results")

class AlertRule(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bi_alert_rules"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    metric_id = Column(Integer, ForeignKey("bi_metrics.id"), nullable=True)
    kpi_id = Column(Integer, ForeignKey("bi_kpis.id"), nullable=True)
    condition = Column(String(50), nullable=False)
    threshold = Column(Numeric(15, 2), nullable=False)
    action_config = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True)

    organization = relationship("Organization")
    metric = relationship("Metric")
    kpi = relationship("KPI")

class AlertHistory(UUIDMixin, Base):
    __tablename__ = "bi_alert_history"

    id = Column(Integer, primary_key=True)
    rule_id = Column(Integer, ForeignKey("bi_alert_rules.id"), nullable=False)
    triggered_at = Column(DateTime(timezone=True), nullable=False, default=func.now())
    triggered_value = Column(Numeric(15, 2), nullable=False)
    status = Column(String(50), nullable=False)

    rule = relationship("AlertRule")

class ExecutiveSummary(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bi_executive_summaries"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    summary_text = Column(Text, nullable=False)
    key_metrics = Column(JSON, nullable=False)

    organization = relationship("Organization")

class AnalyticsAuditLog(UUIDMixin, Base):
    __tablename__ = "bi_analytics_audit_logs"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, default=func.now())

    organization = relationship("Organization")
    user = relationship("User", foreign_keys=[user_id])
