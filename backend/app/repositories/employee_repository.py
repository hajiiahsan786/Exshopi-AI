from typing import Any
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.employee import (
    Employee,
    JobPosition,
    Attendance,
    LeaveRequest,
    Payroll,
    JobApplication,
    PerformanceReview,
    TrainingRecord,
    ShiftSchedule,
    Timesheet,
    EmployeeDocument,
    EmployeeAsset,
)
from app.repositories.crm_repository import CRMRepository


class EmployeeRepository(CRMRepository[Employee]):
    model = Employee
    search_fields = ("first_name", "last_name", "email", "phone", "position", "status")
    sortable_fields = CRMRepository.sortable_fields | {
        "hire_date",
        "birth_date",
        "salary",
    }


class JobPositionRepository(CRMRepository[JobPosition]):
    model = JobPosition
    search_fields = ("title", "description", "requirements", "status")
    sortable_fields = CRMRepository.sortable_fields | {"title"}


class AttendanceRepository(CRMRepository[Attendance]):
    model = Attendance
    search_fields = ("status", "notes")
    sortable_fields = CRMRepository.sortable_fields | {"date", "check_in", "check_out"}


class LeaveRequestRepository(CRMRepository[LeaveRequest]):
    model = LeaveRequest
    search_fields = ("leave_type", "status", "reason")
    sortable_fields = CRMRepository.sortable_fields | {"start_date", "end_date"}


class PayrollRepository(CRMRepository[Payroll]):
    model = Payroll
    search_fields = ("status",)
    sortable_fields = CRMRepository.sortable_fields | {
        "pay_period_start",
        "pay_period_end",
        "basic_salary",
        "allowances",
        "deductions",
        "net_salary",
        "payment_date",
    }


class JobApplicationRepository(CRMRepository[JobApplication]):
    model = JobApplication
    search_fields = ("candidate_name", "candidate_email", "candidate_phone", "status", "notes")
    sortable_fields = CRMRepository.sortable_fields | {"candidate_name"}


class PerformanceReviewRepository(CRMRepository[PerformanceReview]):
    model = PerformanceReview
    search_fields = ("feedback", "goals", "status")
    sortable_fields = CRMRepository.sortable_fields | {"review_date", "rating"}


class TrainingRecordRepository(CRMRepository[TrainingRecord]):
    model = TrainingRecord
    search_fields = ("training_name", "provider", "status", "result")
    sortable_fields = CRMRepository.sortable_fields | {"start_date", "end_date"}


class ShiftScheduleRepository(CRMRepository[ShiftSchedule]):
    model = ShiftSchedule
    search_fields = ("shift_name", "notes", "status")
    sortable_fields = CRMRepository.sortable_fields | {"start_time", "end_time"}


class TimesheetRepository(CRMRepository[Timesheet]):
    model = Timesheet
    search_fields = ("description", "status")
    sortable_fields = CRMRepository.sortable_fields | {"date", "hours_worked"}


class EmployeeDocumentRepository(CRMRepository[EmployeeDocument]):
    model = EmployeeDocument
    search_fields = ("document_name", "document_type", "status")
    sortable_fields = CRMRepository.sortable_fields | {"expiry_date"}


class EmployeeAssetRepository(CRMRepository[EmployeeAsset]):
    model = EmployeeAsset
    search_fields = ("asset_name", "asset_type", "serial_number", "status")
    sortable_fields = CRMRepository.sortable_fields | {"assigned_date", "returned_date"}
