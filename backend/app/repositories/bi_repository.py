from __future__ import annotations
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

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
from app.repositories.crm_repository import CRMRepository


class DashboardRepository(CRMRepository[Dashboard]):
    pass

class DashboardWidgetRepository(CRMRepository[DashboardWidget]):
    pass

class DashboardLayoutRepository(CRMRepository[DashboardLayout]):
    pass

class KPIRepository(CRMRepository[KPI]):
    pass

class KPIHistoryRepository(CRMRepository[KPIHistory]):
    pass

class MetricRepository(CRMRepository[Metric]):
    pass

class MetricSnapshotRepository(CRMRepository[MetricSnapshot]):
    pass

class ReportRepository(CRMRepository[Report]):
    pass

class ReportCategoryRepository(CRMRepository[ReportCategory]):
    pass

class ReportScheduleRepository(CRMRepository[ReportSchedule]):
    pass

class ScheduledReportRepository(CRMRepository[ScheduledReport]):
    pass

class ReportExecutionRepository(CRMRepository[ReportExecution]):
    pass

class DataSourceRepository(CRMRepository[DataSource]):
    pass

class AnalyticsDatasetRepository(CRMRepository[AnalyticsDataset]):
    pass

class DataCubeRepository(CRMRepository[DataCube]):
    pass

class DataAggregationRepository(CRMRepository[DataAggregation]):
    pass

class ChartRepository(CRMRepository[Chart]):
    pass

class ChartSeriesRepository(CRMRepository[ChartSeries]):
    pass

class FilterPresetRepository(CRMRepository[FilterPreset]):
    pass

class DrillDownConfigurationRepository(CRMRepository[DrillDownConfiguration]):
    pass

class ForecastModelRepository(CRMRepository[ForecastModel]):
    pass

class ForecastResultRepository(CRMRepository[ForecastResult]):
    pass

class AlertRuleRepository(CRMRepository[AlertRule]):
    pass

class AlertHistoryRepository(CRMRepository[AlertHistory]):
    pass

class ExecutiveSummaryRepository(CRMRepository[ExecutiveSummary]):
    pass

class AnalyticsAuditLogRepository(CRMRepository[AnalyticsAuditLog]):
    pass
