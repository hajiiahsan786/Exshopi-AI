from datetime import date as dt_date, datetime as dt_datetime
from decimal import Decimal
from typing import Any, List, Dict
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ----------------------------
# Mixins and Commons
# ----------------------------

class HRBaseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class AuditFieldsResponse(BaseModel):
    id: int
    uuid: str
    created_at: dt_datetime | None = None
    updated_at: dt_datetime | None = None
    created_by: int | None = None
    updated_by: int | None = None
    deleted_by: int | None = None
    deleted_at: dt_datetime | None = None


# ----------------------------
# Bulk Operations
# ----------------------------

class HRBulkIdsRequest(BaseModel):
    ids: List[int]


class HRBulkStatusRequest(BaseModel):
    ids: List[int]
    status: str


class HRBulkUpdateRequest(BaseModel):
    ids: List[int]
    values: Dict[str, Any]


# ----------------------------
# JobPosition Schemas
# ----------------------------

class JobPositionBase(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    department_id: int | None = None
    title: str
    description: str | None = None
    requirements: str | None = None
    status: str = "Active"


class JobPositionCreate(JobPositionBase):
    pass


class JobPositionUpdate(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    department_id: int | None = None
    title: str | None = None
    description: str | None = None
    requirements: str | None = None
    status: str | None = None


class JobPositionResponse(JobPositionBase, AuditFieldsResponse):
    pass


# ----------------------------
# Attendance Schemas
# ----------------------------

class AttendanceBase(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    employee_id: int
    date: dt_date
    check_in: dt_datetime | None = None
    check_out: dt_datetime | None = None
    status: str = "Present"
    notes: str | None = None


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    employee_id: int | None = None
    date: dt_date | None = None
    check_in: dt_datetime | None = None
    check_out: dt_datetime | None = None
    status: str | None = None
    notes: str | None = None


class AttendanceResponse(AttendanceBase, AuditFieldsResponse):
    pass


# ----------------------------
# LeaveRequest Schemas
# ----------------------------

class LeaveRequestBase(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    employee_id: int
    leave_type: str
    start_date: dt_date
    end_date: dt_date
    status: str = "Pending"
    reason: str | None = None
    approved_by: int | None = None


class LeaveRequestCreate(LeaveRequestBase):
    pass


class LeaveRequestUpdate(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    employee_id: int | None = None
    leave_type: str | None = None
    start_date: dt_date | None = None
    end_date: dt_date | None = None
    status: str | None = None
    reason: str | None = None
    approved_by: int | None = None


class LeaveRequestResponse(LeaveRequestBase, AuditFieldsResponse):
    pass


# ----------------------------
# Payroll Schemas
# ----------------------------

class PayrollBase(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    employee_id: int
    pay_period_start: dt_date
    pay_period_end: dt_date
    basic_salary: Decimal = Decimal("0.0")
    allowances: Decimal = Decimal("0.0")
    deductions: Decimal = Decimal("0.0")
    net_salary: Decimal = Decimal("0.0")
    status: str = "Draft"
    payment_date: dt_date | None = None


class PayrollCreate(PayrollBase):
    pass


class PayrollUpdate(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    employee_id: int | None = None
    pay_period_start: dt_date | None = None
    pay_period_end: dt_date | None = None
    basic_salary: Decimal | None = None
    allowances: Decimal | None = None
    deductions: Decimal | None = None
    net_salary: Decimal | None = None
    status: str | None = None
    payment_date: dt_date | None = None


class PayrollResponse(PayrollBase, AuditFieldsResponse):
    pass


# ----------------------------
# JobApplication Schemas
# ----------------------------

class JobApplicationBase(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    job_position_id: int | None = None
    candidate_name: str
    candidate_email: EmailStr
    candidate_phone: str | None = None
    resume_url: str | None = None
    status: str = "Applied"
    notes: str | None = None


class JobApplicationCreate(JobApplicationBase):
    pass


class JobApplicationUpdate(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    job_position_id: int | None = None
    candidate_name: str | None = None
    candidate_email: EmailStr | None = None
    candidate_phone: str | None = None
    resume_url: str | None = None
    status: str | None = None
    notes: str | None = None


class JobApplicationResponse(JobApplicationBase, AuditFieldsResponse):
    pass


# ----------------------------
# PerformanceReview Schemas
# ----------------------------

class PerformanceReviewBase(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    employee_id: int
    reviewer_id: int | None = None
    review_date: dt_date
    rating: int | None = None
    feedback: str | None = None
    goals: str | None = None
    status: str = "Draft"


class PerformanceReviewCreate(PerformanceReviewBase):
    pass


class PerformanceReviewUpdate(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    employee_id: int | None = None
    reviewer_id: int | None = None
    review_date: dt_date | None = None
    rating: int | None = None
    feedback: str | None = None
    goals: str | None = None
    status: str | None = None


class PerformanceReviewResponse(PerformanceReviewBase, AuditFieldsResponse):
    pass


# ----------------------------
# TrainingRecord Schemas
# ----------------------------

class TrainingRecordBase(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    employee_id: int
    training_name: str
    provider: str | None = None
    start_date: dt_date | None = None
    end_date: dt_date | None = None
    status: str = "Planned"
    result: str | None = None


class TrainingRecordCreate(TrainingRecordBase):
    pass


class TrainingRecordUpdate(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    employee_id: int | None = None
    training_name: str | None = None
    provider: str | None = None
    start_date: dt_date | None = None
    end_date: dt_date | None = None
    status: str | None = None
    result: str | None = None


class TrainingRecordResponse(TrainingRecordBase, AuditFieldsResponse):
    pass


# ----------------------------
# ShiftSchedule Schemas
# ----------------------------

class ShiftScheduleBase(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    employee_id: int
    start_time: dt_datetime
    end_time: dt_datetime
    shift_name: str | None = None
    notes: str | None = None
    status: str = "Scheduled"


class ShiftScheduleCreate(ShiftScheduleBase):
    pass


class ShiftScheduleUpdate(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    employee_id: int | None = None
    start_time: dt_datetime | None = None
    end_time: dt_datetime | None = None
    shift_name: str | None = None
    notes: str | None = None
    status: str | None = None


class ShiftScheduleResponse(ShiftScheduleBase, AuditFieldsResponse):
    pass


# ----------------------------
# Timesheet Schemas
# ----------------------------

class TimesheetBase(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    employee_id: int
    date: dt_date
    hours_worked: Decimal = Decimal("0.0")
    description: str | None = None
    status: str = "Draft"
    approved_by: int | None = None


class TimesheetCreate(TimesheetBase):
    pass


class TimesheetUpdate(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    employee_id: int | None = None
    date: dt_date | None = None
    hours_worked: Decimal | None = None
    description: str | None = None
    status: str | None = None
    approved_by: int | None = None


class TimesheetResponse(TimesheetBase, AuditFieldsResponse):
    pass


# ----------------------------
# EmployeeDocument Schemas
# ----------------------------

class EmployeeDocumentBase(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    employee_id: int
    document_name: str
    document_type: str | None = None
    document_url: str
    expiry_date: dt_date | None = None
    status: str = "Active"


class EmployeeDocumentCreate(EmployeeDocumentBase):
    pass


class EmployeeDocumentUpdate(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    employee_id: int | None = None
    document_name: str | None = None
    document_type: str | None = None
    document_url: str | None = None
    expiry_date: dt_date | None = None
    status: str | None = None


class EmployeeDocumentResponse(EmployeeDocumentBase, AuditFieldsResponse):
    pass


# ----------------------------
# EmployeeAsset Schemas
# ----------------------------

class EmployeeAssetBase(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    employee_id: int
    asset_name: str
    asset_type: str | None = None
    serial_number: str | None = None
    assigned_date: dt_date
    returned_date: dt_date | None = None
    status: str = "Assigned"


class EmployeeAssetCreate(EmployeeAssetBase):
    pass


class EmployeeAssetUpdate(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    employee_id: int | None = None
    asset_name: str | None = None
    asset_type: str | None = None
    serial_number: str | None = None
    assigned_date: dt_date | None = None
    returned_date: dt_date | None = None
    status: str | None = None


class EmployeeAssetResponse(EmployeeAssetBase, AuditFieldsResponse):
    pass


# ----------------------------
# Employee Schemas
# ----------------------------

class EmployeeBase(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    department_id: int | None = None
    user_id: int | None = None
    manager_id: int | None = None
    job_position_id: int | None = None
    first_name: str
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    position: str | None = None
    is_active: bool = True
    hire_date: dt_date | None = None
    birth_date: dt_date | None = None
    gender: str | None = None
    address: str | None = None
    salary: Decimal | None = Decimal("0.0")
    status: str = "Active"


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(HRBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    department_id: int | None = None
    user_id: int | None = None
    manager_id: int | None = None
    job_position_id: int | None = None
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    position: str | None = None
    is_active: bool | None = None
    hire_date: dt_date | None = None
    birth_date: dt_date | None = None
    gender: str | None = None
    address: str | None = None
    salary: Decimal | None = None
    status: str | None = None


class EmployeeResponse(EmployeeBase, AuditFieldsResponse):
    pass


# ----------------------------
# Organization Chart Schemas
# ----------------------------

class OrgChartNode(HRBaseModel):
    id: int
    first_name: str
    last_name: str | None = None
    position: str | None = None
    email: str | None = None
    subordinates: List["OrgChartNode"] = []
