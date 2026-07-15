from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.v1.endpoints.hr_router_factory import create_hr_router
from app.database.dependencies import get_db
from app.schemas.crm_common import APIResponse
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeResponse,
    EmployeeUpdate,
    JobPositionCreate,
    JobPositionResponse,
    JobPositionUpdate,
    AttendanceCreate,
    AttendanceResponse,
    AttendanceUpdate,
    LeaveRequestCreate,
    LeaveRequestResponse,
    LeaveRequestUpdate,
    PayrollCreate,
    PayrollResponse,
    PayrollUpdate,
    JobApplicationCreate,
    JobApplicationResponse,
    JobApplicationUpdate,
    PerformanceReviewCreate,
    PerformanceReviewResponse,
    PerformanceReviewUpdate,
    TrainingRecordCreate,
    TrainingRecordResponse,
    TrainingRecordUpdate,
    ShiftScheduleCreate,
    ShiftScheduleResponse,
    ShiftScheduleUpdate,
    TimesheetCreate,
    TimesheetResponse,
    TimesheetUpdate,
    EmployeeDocumentCreate,
    EmployeeDocumentResponse,
    EmployeeDocumentUpdate,
    EmployeeAssetCreate,
    EmployeeAssetResponse,
    EmployeeAssetUpdate,
    OrgChartNode,
)
from app.services.employee_service import (
    EmployeeService,
    JobPositionService,
    AttendanceService,
    LeaveRequestService,
    PayrollService,
    JobApplicationService,
    PerformanceReviewService,
    TrainingRecordService,
    ShiftScheduleService,
    TimesheetService,
    EmployeeDocumentService,
    EmployeeAssetService,
)
from app.security.hr_permissions import require_hr_permission
from app.models.user import User

employees_router = create_hr_router(
    service=EmployeeService,
    create_schema=EmployeeCreate,
    update_schema=EmployeeUpdate,
    single_response=EmployeeResponse,
    permission_prefix="hr",
    entity_label="Employees",
)

@employees_router.get(
    "/org-chart/tree",
    response_model=APIResponse[list[OrgChartNode]],
    summary="Get Organization Chart Tree",
    description="Calculates and returns the entire reporting hierarchy tree structure for the company.",
)
def get_org_chart_tree(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_permission("hr.read")),
):
    del current_user
    tree = EmployeeService.get_org_chart(db)
    return APIResponse(message="Organization chart retrieved successfully", data=tree)

job_positions_router = create_hr_router(
    service=JobPositionService,
    create_schema=JobPositionCreate,
    update_schema=JobPositionUpdate,
    single_response=JobPositionResponse,
    permission_prefix="hr",
    entity_label="Job Positions",
)

attendances_router = create_hr_router(
    service=AttendanceService,
    create_schema=AttendanceCreate,
    update_schema=AttendanceUpdate,
    single_response=AttendanceResponse,
    permission_prefix="hr",
    entity_label="Attendances",
)

leave_requests_router = create_hr_router(
    service=LeaveRequestService,
    create_schema=LeaveRequestCreate,
    update_schema=LeaveRequestUpdate,
    single_response=LeaveRequestResponse,
    permission_prefix="hr",
    entity_label="Leave Requests",
)

payroll_router = create_hr_router(
    service=PayrollService,
    create_schema=PayrollCreate,
    update_schema=PayrollUpdate,
    single_response=PayrollResponse,
    permission_prefix="hr",
    entity_label="Payrolls",
)

recruitment_router = create_hr_router(
    service=JobApplicationService,
    create_schema=JobApplicationCreate,
    update_schema=JobApplicationUpdate,
    single_response=JobApplicationResponse,
    permission_prefix="hr",
    entity_label="Job Applications",
)

performance_reviews_router = create_hr_router(
    service=PerformanceReviewService,
    create_schema=PerformanceReviewCreate,
    update_schema=PerformanceReviewUpdate,
    single_response=PerformanceReviewResponse,
    permission_prefix="hr",
    entity_label="Performance Reviews",
)

training_router = create_hr_router(
    service=TrainingRecordService,
    create_schema=TrainingRecordCreate,
    update_schema=TrainingRecordUpdate,
    single_response=TrainingRecordResponse,
    permission_prefix="hr",
    entity_label="Training Records",
)

shifts_router = create_hr_router(
    service=ShiftScheduleService,
    create_schema=ShiftScheduleCreate,
    update_schema=ShiftScheduleUpdate,
    single_response=ShiftScheduleResponse,
    permission_prefix="hr",
    entity_label="Shift Schedules",
)

timesheets_router = create_hr_router(
    service=TimesheetService,
    create_schema=TimesheetCreate,
    update_schema=TimesheetUpdate,
    single_response=TimesheetResponse,
    permission_prefix="hr",
    entity_label="Timesheets",
)

documents_router = create_hr_router(
    service=EmployeeDocumentService,
    create_schema=EmployeeDocumentCreate,
    update_schema=EmployeeDocumentUpdate,
    single_response=EmployeeDocumentResponse,
    permission_prefix="hr",
    entity_label="Employee Documents",
)

assets_router = create_hr_router(
    service=EmployeeAssetService,
    create_schema=EmployeeAssetCreate,
    update_schema=EmployeeAssetUpdate,
    single_response=EmployeeAssetResponse,
    permission_prefix="hr",
    entity_label="Employee Assets",
)

HR_ROUTERS = (
    (employees_router, "/hr/employees", ["Employees"]),
    (job_positions_router, "/hr/job-positions", ["Job Positions"]),
    (attendances_router, "/hr/attendances", ["Attendances"]),
    (leave_requests_router, "/hr/leave-requests", ["Leave Requests"]),
    (payroll_router, "/hr/payrolls", ["Payroll"]),
    (recruitment_router, "/hr/recruitment", ["Recruitment"]),
    (performance_reviews_router, "/hr/performance-reviews", ["Performance Reviews"]),
    (training_router, "/hr/training", ["Training Records"]),
    (shifts_router, "/hr/shift-scheduling", ["Shift Schedules"]),
    (timesheets_router, "/hr/timesheets", ["Timesheets"]),
    (documents_router, "/hr/documents", ["Employee Documents"]),
    (assets_router, "/hr/assets", ["Employee Assets"]),
)
