import os
import unittest
from datetime import date, datetime, timezone
from decimal import Decimal
import io

from fastapi import UploadFile
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base import Base
# Import all models to ensure they are registered with Base
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
from app.models.organization import Organization
from app.models.company import Company
from app.models.department import Department
from app.models.user import User
from app.models.role import Role

from app.repositories.employee_repository import (
    EmployeeRepository,
    JobPositionRepository,
    AttendanceRepository,
    LeaveRequestRepository,
    PayrollRepository,
    JobApplicationRepository,
    PerformanceReviewRepository,
    TrainingRecordRepository,
    ShiftScheduleRepository,
    TimesheetRepository,
    EmployeeDocumentRepository,
    EmployeeAssetRepository,
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
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    JobPositionCreate,
    AttendanceCreate,
    LeaveRequestCreate,
    PayrollCreate,
    JobApplicationCreate,
    PerformanceReviewCreate,
    TrainingRecordCreate,
    ShiftScheduleCreate,
    TimesheetCreate,
    EmployeeDocumentCreate,
    EmployeeAssetCreate,
)


class TestHRModule(unittest.TestCase):
    def setUp(self):
        # Create a brand-new independent in-memory database for each test to guarantee complete isolation
        self.engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        Base.metadata.create_all(bind=self.engine)
        self.db = self.SessionLocal()

        # 1. Create a Role
        self.role = Role(name="Super Admin", description="Full Access")
        self.db.add(self.role)
        self.db.commit()
        self.db.refresh(self.role)

        # 2. Create a User
        self.user = User(
            full_name="Test Owner",
            email="owner@example.com",
            password_hash="hashed",
            role_id=self.role.id,
            is_active=True,
        )
        self.db.add(self.user)
        self.db.commit()
        self.db.refresh(self.user)

        # 3. Create an Organization owned by User
        self.org = Organization(name="Test Org", slug="test-org", owner_id=self.user.id)
        self.db.add(self.org)
        self.db.commit()
        self.db.refresh(self.org)

        # 4. Create Company
        self.company = Company(name="Test Co", organization_id=self.org.id, owner_id=self.user.id)
        self.db.add(self.company)
        self.db.commit()
        self.db.refresh(self.company)

        # 5. Create Department
        self.dept = Department(name="Test Dept", organization_id=self.org.id, company_id=self.company.id)
        self.db.add(self.dept)
        self.db.commit()
        self.db.refresh(self.dept)

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(bind=self.engine)
        self.engine.dispose()

    def test_employee_crud_and_org_chart(self):
        # 1. Create a Manager
        mgr_data = EmployeeCreate(
            first_name="Jane",
            last_name="Doe",
            email="jane.doe@example.com",
            phone="12345678",
            position="Director",
            organization_id=self.org.id,
            company_id=self.company.id,
            department_id=self.dept.id,
        )
        manager = EmployeeService.create(self.db, mgr_data)
        self.assertIsNotNone(manager.id)
        self.assertEqual(manager.first_name, "Jane")
        self.assertEqual(manager.status, "Active")

        # 2. Create a Subordinate reporting to Jane
        sub_data = EmployeeCreate(
            first_name="John",
            last_name="Smith",
            email="john.smith@example.com",
            phone="87654321",
            position="Manager",
            organization_id=self.org.id,
            company_id=self.company.id,
            department_id=self.dept.id,
            manager_id=manager.id,
        )
        subordinate = EmployeeService.create(self.db, sub_data)
        self.assertIsNotNone(subordinate.id)
        self.assertEqual(subordinate.manager_id, manager.id)

        # 3. Test Org Chart hierarchy calculation
        chart = EmployeeService.get_org_chart(self.db)
        self.assertEqual(len(chart), 1)  # Only Jane is at root
        self.assertEqual(chart[0]["first_name"], "Jane")
        self.assertEqual(len(chart[0]["subordinates"]), 1)
        self.assertEqual(chart[0]["subordinates"][0]["first_name"], "John")

        # 4. List employees with filters
        res = EmployeeService.list(self.db, search="Smith")
        self.assertEqual(res.total, 1)
        self.assertEqual(res.items[0].first_name, "John")

        # 5. Update Employee details
        up_data = EmployeeUpdate(first_name="Johnny", salary=Decimal("150000.00"))
        updated = EmployeeService.update(self.db, subordinate.id, up_data)
        self.assertEqual(updated.first_name, "Johnny")
        self.assertEqual(updated.salary, Decimal("150000.00"))

        # 6. Soft Delete
        EmployeeService.delete(self.db, subordinate.id)
        # Verify no longer returned by default
        res2 = EmployeeService.list(self.db)
        self.assertEqual(res2.total, 1)  # Only manager remains

        # Verify still in DB as soft-deleted
        item_in_db = EmployeeService.get(self.db, subordinate.id, include_deleted=True)
        self.assertIsNotNone(item_in_db.deleted_at)

        # 7. Restore
        EmployeeService.restore(self.db, subordinate.id)
        res3 = EmployeeService.list(self.db)
        self.assertEqual(res3.total, 2)

    def test_job_position_service(self):
        data = JobPositionCreate(
            title="Senior Architect",
            description="Responsible for system design.",
            requirements="Python, SQLAlchemy, FastAPI",
            organization_id=self.org.id,
            company_id=self.company.id,
            department_id=self.dept.id,
        )
        job = JobPositionService.create(self.db, data)
        self.assertEqual(job.title, "Senior Architect")
        self.assertEqual(job.status, "Active")

    def test_attendance_service(self):
        # Create mock employee
        emp = Employee(first_name="A", last_name="B", email="ab@example.com")
        self.db.add(emp)
        self.db.commit()

        att_data = AttendanceCreate(
            employee_id=emp.id,
            date=date(2026, 7, 14),
            check_in=datetime(2026, 7, 14, 9, 0, tzinfo=timezone.utc),
            check_out=datetime(2026, 7, 14, 17, 0, tzinfo=timezone.utc),
            status="Present",
            notes="On time",
        )
        att = AttendanceService.create(self.db, att_data)
        self.assertEqual(att.employee_id, emp.id)
        self.assertEqual(att.status, "Present")

    def test_leave_request_service(self):
        emp = Employee(first_name="A", last_name="B", email="ab@example.com")
        self.db.add(emp)
        self.db.commit()

        leave_data = LeaveRequestCreate(
            employee_id=emp.id,
            leave_type="Vacation",
            start_date=date(2026, 8, 1),
            end_date=date(2026, 8, 15),
            status="Pending",
            reason="Summer trip",
        )
        leave = LeaveRequestService.create(self.db, leave_data)
        self.assertEqual(leave.leave_type, "Vacation")
        self.assertEqual(leave.status, "Pending")

    def test_payroll_service_auto_calculation(self):
        emp = Employee(first_name="A", last_name="B", email="ab@example.com")
        self.db.add(emp)
        self.db.commit()

        pay_data = PayrollCreate(
            employee_id=emp.id,
            pay_period_start=date(2026, 7, 1),
            pay_period_end=date(2026, 7, 31),
            basic_salary=Decimal("5000.00"),
            allowances=Decimal("800.00"),
            deductions=Decimal("200.00"),
        )
        # Net Salary should be basic + allowance - deduction = 5000 + 800 - 200 = 5600
        pay = PayrollService.create(self.db, pay_data)
        self.assertEqual(pay.net_salary, Decimal("5600.00"))

    def test_job_application_recruitment_service(self):
        app_data = JobApplicationCreate(
            candidate_name="Alice Candidate",
            candidate_email="alice@example.com",
            candidate_phone="9999999",
            resume_url="http://s3.amazonaws.com/resumes/alice.pdf",
            status="Applied",
        )
        app = JobApplicationService.create(self.db, app_data)
        self.assertEqual(app.candidate_name, "Alice Candidate")
        self.assertEqual(app.status, "Applied")

    def test_performance_review_service(self):
        emp = Employee(first_name="A", last_name="B", email="ab@example.com")
        self.db.add(emp)
        self.db.commit()

        review_data = PerformanceReviewCreate(
            employee_id=emp.id,
            review_date=date(2026, 7, 14),
            rating=5,
            feedback="Exceeded expectations.",
            goals="Learn Rust.",
            status="Completed",
        )
        review = PerformanceReviewService.create(self.db, review_data)
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.status, "Completed")

    def test_training_record_service(self):
        emp = Employee(first_name="A", last_name="B", email="ab@example.com")
        self.db.add(emp)
        self.db.commit()

        train_data = TrainingRecordCreate(
            employee_id=emp.id,
            training_name="Secure Coding Patterns",
            provider="OWASP",
            start_date=date(2026, 7, 1),
            end_date=date(2026, 7, 3),
            status="Completed",
            result="Pass",
        )
        train = TrainingRecordService.create(self.db, train_data)
        self.assertEqual(train.training_name, "Secure Coding Patterns")
        self.assertEqual(train.result, "Pass")

    def test_shift_schedule_service(self):
        emp = Employee(first_name="A", last_name="B", email="ab@example.com")
        self.db.add(emp)
        self.db.commit()

        shift_data = ShiftScheduleCreate(
            employee_id=emp.id,
            start_time=datetime(2026, 7, 14, 8, 0, tzinfo=timezone.utc),
            end_time=datetime(2026, 7, 14, 16, 0, tzinfo=timezone.utc),
            shift_name="Day Shift",
            status="Scheduled",
        )
        shift = ShiftScheduleService.create(self.db, shift_data)
        self.assertEqual(shift.shift_name, "Day Shift")

    def test_timesheet_service(self):
        emp = Employee(first_name="A", last_name="B", email="ab@example.com")
        self.db.add(emp)
        self.db.commit()

        time_data = TimesheetCreate(
            employee_id=emp.id,
            date=date(2026, 7, 14),
            hours_worked=Decimal("8.5"),
            description="Feature development.",
            status="Draft",
        )
        ts = TimesheetService.create(self.db, time_data)
        self.assertEqual(ts.hours_worked, Decimal("8.5"))

    def test_employee_document_service(self):
        emp = Employee(first_name="A", last_name="B", email="ab@example.com")
        self.db.add(emp)
        self.db.commit()

        doc_data = EmployeeDocumentCreate(
            employee_id=emp.id,
            document_name="Employment Agreement",
            document_type="Contract",
            document_url="http://s3.amazonaws.com/docs/contract.pdf",
            status="Active",
        )
        doc = EmployeeDocumentService.create(self.db, doc_data)
        self.assertEqual(doc.document_name, "Employment Agreement")

    def test_employee_asset_service(self):
        emp = Employee(first_name="A", last_name="B", email="ab@example.com")
        self.db.add(emp)
        self.db.commit()

        asset_data = EmployeeAssetCreate(
            employee_id=emp.id,
            asset_name="MacBook Pro M3",
            asset_type="Laptop",
            serial_number="C02XXYYZZ",
            assigned_date=date(2026, 7, 14),
            status="Assigned",
        )
        asset = EmployeeAssetService.create(self.db, asset_data)
        self.assertEqual(asset.asset_name, "MacBook Pro M3")

    def test_import_export_excel_and_csv(self):
        # Create mock employees to export
        emp1 = Employee(first_name="Alice", last_name="A", email="alice.a@example.com")
        emp2 = Employee(first_name="Bob", last_name="B", email="bob.b@example.com")
        self.db.add_all([emp1, emp2])
        self.db.commit()

        # 1. Export as JSON
        rows_json = EmployeeService.export_rows(self.db, "json")
        self.assertEqual(len(rows_json), 2)
        names = {row["first_name"] for row in rows_json}
        self.assertEqual(names, {"Alice", "Bob"})

        # 2. Export as CSV
        rows_csv = EmployeeService.export_rows(self.db, "csv")
        self.assertIn("Alice", rows_csv)
        self.assertIn("Bob", rows_csv)

        # 3. Export as Excel (XLSX zip bytes)
        rows_xlsx = EmployeeService.export_rows(self.db, "xlsx")
        self.assertTrue(isinstance(rows_xlsx, bytes))
        self.assertTrue(len(rows_xlsx) > 0)

        # 4. Import from CSV
        csv_file_content = "first_name,last_name,email,phone,position,is_active\nCharlie,C,charlie@example.com,,Tester,True\n"
        upload_file = UploadFile(
            file=io.BytesIO(csv_file_content.encode("utf-8")),
            filename="import_employees.csv"
        )
        # Import using service layer with row-level validation schema
        import asyncio
        loop = asyncio.get_event_loop()
        res = loop.run_until_complete(EmployeeService.import_csv(self.db, upload_file, EmployeeCreate))
        self.assertEqual(res["created"], 1)
        self.assertEqual(len(res["errors"]), 0)

        # Verify Charlie is in db
        db_charlie = self.db.query(Employee).filter(Employee.first_name == "Charlie").first()
        self.assertIsNotNone(db_charlie)
        self.assertEqual(db_charlie.email, "charlie@example.com")
