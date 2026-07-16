from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Date, Numeric, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base
from app.models.crm_mixins import AuditMixin, UUIDMixin


class Employee(UUIDMixin, AuditMixin, Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True)
    organization_id = Column(
        Integer,
        ForeignKey("organizations.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
        index=True,
    )
    company_id = Column(
        Integer,
        ForeignKey("companies.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
        index=True,
    )
    department_id = Column(
        Integer,
        ForeignKey("departments.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
        index=True,
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
        index=True,
    )
    manager_id = Column(
        Integer,
        ForeignKey("employees.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
        index=True,
    )
    job_position_id = Column(
        Integer,
        ForeignKey("job_positions.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
        index=True,
    )
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100))
    email = Column(String(255), unique=True, index=True)
    phone = Column(String(30))
    position = Column(String(100))  # Kept for compatibility
    is_active = Column(Boolean, default=True)
    hire_date = Column(Date, nullable=True)
    birth_date = Column(Date, nullable=True)
    gender = Column(String(50), nullable=True)
    address = Column(String(255), nullable=True)
    salary = Column(Numeric(18, 4), nullable=True, default=0.0)
    status = Column(String(50), default="Active", index=True)  # e.g., Active, Terminated, On Leave

    organization = relationship("Organization")
    company = relationship("Company")
    department = relationship("Department", back_populates="employees")
    user = relationship("User", foreign_keys=[user_id])

    manager = relationship("Employee", remote_side=[id], back_populates="subordinates")
    subordinates = relationship("Employee", back_populates="manager")
    job_position = relationship("JobPosition", back_populates="employees")
    attendances = relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")
    leave_requests = relationship("LeaveRequest", foreign_keys="[LeaveRequest.employee_id]", back_populates="employee", cascade="all, delete-orphan")
    payrolls = relationship("Payroll", back_populates="employee", cascade="all, delete-orphan")
    performance_reviews = relationship("PerformanceReview", foreign_keys="[PerformanceReview.employee_id]", back_populates="employee", cascade="all, delete-orphan")
    performance_reviews_conducted = relationship("PerformanceReview", foreign_keys="[PerformanceReview.reviewer_id]", back_populates="reviewer")
    training_records = relationship("TrainingRecord", back_populates="employee", cascade="all, delete-orphan")
    shifts = relationship("ShiftSchedule", back_populates="employee", cascade="all, delete-orphan")
    timesheets = relationship("Timesheet", foreign_keys="[Timesheet.employee_id]", back_populates="employee", cascade="all, delete-orphan")
    documents = relationship("EmployeeDocument", back_populates="employee", cascade="all, delete-orphan")
    assets = relationship("EmployeeAsset", back_populates="employee", cascade="all, delete-orphan")


class JobPosition(UUIDMixin, AuditMixin, Base):
    __tablename__ = "job_positions"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    status = Column(String(50), default="Active", index=True)  # e.g., Active, Closed, Draft

    organization = relationship("Organization")
    company = relationship("Company")
    department = relationship("Department")
    employees = relationship("Employee", back_populates="job_position")
    applications = relationship("JobApplication", back_populates="job_position", cascade="all, delete-orphan")


class Attendance(UUIDMixin, AuditMixin, Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    check_in = Column(DateTime(timezone=True), nullable=True)
    check_out = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default="Present", index=True)  # e.g., Present, Absent, Late, Half Day
    notes = Column(Text, nullable=True)

    organization = relationship("Organization")
    company = relationship("Company")
    employee = relationship("Employee", back_populates="attendances")


class LeaveRequest(UUIDMixin, AuditMixin, Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    leave_type = Column(String(50), nullable=False, index=True)  # e.g., Sick, Vacation, Unpaid, Personal
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=False, index=True)
    status = Column(String(50), default="Pending", index=True)  # e.g., Pending, Approved, Rejected
    reason = Column(Text, nullable=True)
    approved_by = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)

    organization = relationship("Organization")
    company = relationship("Company")
    employee = relationship("Employee", foreign_keys=[employee_id], back_populates="leave_requests")
    approver = relationship("Employee", foreign_keys=[approved_by])


class Payroll(UUIDMixin, AuditMixin, Base):
    __tablename__ = "payrolls"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    pay_period_start = Column(Date, nullable=False, index=True)
    pay_period_end = Column(Date, nullable=False, index=True)
    basic_salary = Column(Numeric(18, 4), default=0.0)
    allowances = Column(Numeric(18, 4), default=0.0)
    deductions = Column(Numeric(18, 4), default=0.0)
    net_salary = Column(Numeric(18, 4), default=0.0)
    status = Column(String(50), default="Draft", index=True)  # e.g., Draft, Paid, Processing
    payment_date = Column(Date, nullable=True)

    organization = relationship("Organization")
    company = relationship("Company")
    employee = relationship("Employee", back_populates="payrolls")


class JobApplication(UUIDMixin, AuditMixin, Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True)
    job_position_id = Column(Integer, ForeignKey("job_positions.id", ondelete="SET NULL"), nullable=True, index=True)
    candidate_name = Column(String(150), nullable=False)
    candidate_email = Column(String(255), index=True)
    candidate_phone = Column(String(30), nullable=True)
    resume_url = Column(String(500), nullable=True)
    status = Column(String(50), default="Applied", index=True)  # e.g., Applied, Interviewing, Offered, Hired, Rejected
    notes = Column(Text, nullable=True)

    organization = relationship("Organization")
    company = relationship("Company")
    job_position = relationship("JobPosition", back_populates="applications")


class PerformanceReview(UUIDMixin, AuditMixin, Base):
    __tablename__ = "performance_reviews"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True, index=True)
    review_date = Column(Date, nullable=False, index=True)
    rating = Column(Integer, nullable=True)  # e.g., 1 to 5
    feedback = Column(Text, nullable=True)
    goals = Column(Text, nullable=True)
    status = Column(String(50), default="Draft", index=True)  # e.g., Draft, Completed

    organization = relationship("Organization")
    company = relationship("Company")
    employee = relationship("Employee", foreign_keys=[employee_id], back_populates="performance_reviews")
    reviewer = relationship("Employee", foreign_keys=[reviewer_id], back_populates="performance_reviews_conducted")


class TrainingRecord(UUIDMixin, AuditMixin, Base):
    __tablename__ = "training_records"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    training_name = Column(String(150), nullable=False)
    provider = Column(String(150), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(String(50), default="Planned", index=True)  # e.g., Planned, In Progress, Completed
    result = Column(String(100), nullable=True)  # e.g., Pass, Fail, Certified

    organization = relationship("Organization")
    company = relationship("Company")
    employee = relationship("Employee", back_populates="training_records")


class ShiftSchedule(UUIDMixin, AuditMixin, Base):
    __tablename__ = "shift_schedules"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    shift_name = Column(String(100), nullable=True)  # e.g., Morning, Evening, Night
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="Scheduled", index=True)  # e.g., Scheduled, Completed, Cancelled

    organization = relationship("Organization")
    company = relationship("Company")
    employee = relationship("Employee", back_populates="shifts")


class Timesheet(UUIDMixin, AuditMixin, Base):
    __tablename__ = "timesheets"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    hours_worked = Column(Numeric(5, 2), default=0.0)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="Draft", index=True)  # e.g., Draft, Submitted, Approved, Rejected
    approved_by = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)

    organization = relationship("Organization")
    company = relationship("Company")
    employee = relationship("Employee", foreign_keys=[employee_id], back_populates="timesheets")
    approver = relationship("Employee", foreign_keys=[approved_by])


class EmployeeDocument(UUIDMixin, AuditMixin, Base):
    __tablename__ = "employee_documents"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    document_name = Column(String(150), nullable=False)
    document_type = Column(String(100), nullable=True)  # e.g., Contract, ID, Visa, Certification
    document_url = Column(String(500), nullable=False)
    expiry_date = Column(Date, nullable=True)
    status = Column(String(50), default="Active", index=True)  # e.g., Active, Expired, Revoked

    organization = relationship("Organization")
    company = relationship("Company")
    employee = relationship("Employee", back_populates="documents")


class EmployeeAsset(UUIDMixin, AuditMixin, Base):
    __tablename__ = "employee_assets"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_name = Column(String(150), nullable=False)
    asset_type = Column(String(100), nullable=True)  # e.g., Laptop, Phone, Keycard
    serial_number = Column(String(100), nullable=True, index=True)
    assigned_date = Column(Date, nullable=False)
    returned_date = Column(Date, nullable=True)
    status = Column(String(50), default="Assigned", index=True)  # e.g., Assigned, Returned, Damaged, Lost

    organization = relationship("Organization")
    company = relationship("Company")
    employee = relationship("Employee", back_populates="assets")
