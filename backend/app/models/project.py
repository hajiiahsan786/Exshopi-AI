import uuid as uuid_lib

from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from app.database.base import Base
from app.models.crm_mixins import AuditMixin, UUIDMixin


class ProjectRole(UUIDMixin, AuditMixin, Base):
    __tablename__ = "project_roles"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(150), nullable=False, index=True)
    description = Column(Text)
    permissions = Column(JSON, default=list)

    organization = relationship("Organization")


class Project(UUIDMixin, AuditMixin, Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    code = Column(String(50), index=True)
    description = Column(Text)
    status = Column(String(50), nullable=False, default="planning", index=True)
    type = Column(String(50), index=True)
    priority = Column(String(50), default="medium", index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    start_date = Column(Date)
    end_date = Column(Date)
    budget = Column(Float, default=0.0)
    currency_code = Column(String(10), default="USD")
    progress = Column(Float, default=0.0)
    is_template = Column(Boolean, default=False)

    organization = relationship("Organization")
    company = relationship("Company")
    customer = relationship("Customer")
    owner = relationship("User", foreign_keys=[owner_id])
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    phases = relationship("ProjectPhase", back_populates="project", cascade="all, delete-orphan")
    sprints = relationship("Sprint", back_populates="project", cascade="all, delete-orphan")
    epics = relationship("Epic", back_populates="project", cascade="all, delete-orphan")
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("ProjectTask", back_populates="project", cascade="all, delete-orphan")


class ProjectMember(UUIDMixin, AuditMixin, Base):
    __tablename__ = "project_members"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    project_role_id = Column(Integer, ForeignKey("project_roles.id"), nullable=True)
    billing_rate = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)

    project = relationship("Project", back_populates="members")
    user = relationship("User", foreign_keys=[user_id])
    project_role = relationship("ProjectRole")
    allocations = relationship("ResourceAllocation", back_populates="member", cascade="all, delete-orphan")


class ProjectPhase(UUIDMixin, AuditMixin, Base):
    __tablename__ = "project_phases"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text)
    start_date = Column(Date)
    end_date = Column(Date)
    status = Column(String(50), default="pending")
    sequence = Column(Integer, default=0)

    project = relationship("Project", back_populates="phases")


class Milestone(UUIDMixin, AuditMixin, Base):
    __tablename__ = "project_milestones"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text)
    due_date = Column(Date)
    status = Column(String(50), default="pending")

    project = relationship("Project", back_populates="milestones")


class Sprint(UUIDMixin, AuditMixin, Base):
    __tablename__ = "project_sprints"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    goal = Column(Text)
    start_date = Column(Date)
    end_date = Column(Date)
    status = Column(String(50), default="planning")

    project = relationship("Project", back_populates="sprints")
    stories = relationship("Story", back_populates="sprint")


class Epic(UUIDMixin, AuditMixin, Base):
    __tablename__ = "project_epics"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    status = Column(String(50), default="open")
    priority = Column(String(50), default="medium")

    project = relationship("Project", back_populates="epics")
    stories = relationship("Story", back_populates="epic")


class Story(UUIDMixin, AuditMixin, Base):
    __tablename__ = "project_stories"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    epic_id = Column(Integer, ForeignKey("project_epics.id"), nullable=True, index=True)
    sprint_id = Column(Integer, ForeignKey("project_sprints.id"), nullable=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    status = Column(String(50), default="backlog")
    points = Column(Integer, default=0)

    project = relationship("Project")
    epic = relationship("Epic", back_populates="stories")
    sprint = relationship("Sprint", back_populates="stories")
    tasks = relationship("ProjectTask", back_populates="story")


class ProjectTask(UUIDMixin, AuditMixin, Base):
    __tablename__ = "project_tasks"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    story_id = Column(Integer, ForeignKey("project_stories.id"), nullable=True, index=True)
    sprint_id = Column(Integer, ForeignKey("project_sprints.id"), nullable=True, index=True)
    phase_id = Column(Integer, ForeignKey("project_phases.id"), nullable=True, index=True)
    parent_id = Column(Integer, ForeignKey("project_tasks.id"), nullable=True, index=True)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    title = Column(String(200), nullable=False)
    description = Column(Text)
    status = Column(String(50), default="todo", index=True)
    priority = Column(String(50), default="medium")
    type = Column(String(50), default="task")

    estimated_hours = Column(Float, default=0.0)
    actual_hours = Column(Float, default=0.0)

    start_date = Column(Date)
    due_date = Column(Date)
    completed_at = Column(DateTime(timezone=True))
    progress = Column(Float, default=0.0)

    project = relationship("Project", back_populates="tasks")
    story = relationship("Story", back_populates="tasks")
    sprint = relationship("Sprint")
    phase = relationship("ProjectPhase")
    parent = relationship("ProjectTask", remote_side=[id])
    assignee = relationship("User", foreign_keys=[assignee_id])

    checklists = relationship("TaskChecklist", back_populates="task", cascade="all, delete-orphan")
    comments = relationship("TaskComment", back_populates="task", cascade="all, delete-orphan")
    attachments = relationship("TaskAttachment", back_populates="task", cascade="all, delete-orphan")
    time_logs = relationship("TaskTimeLog", back_populates="task", cascade="all, delete-orphan")


class TaskChecklist(UUIDMixin, AuditMixin, Base):
    __tablename__ = "task_checklists"

    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("project_tasks.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    is_completed = Column(Boolean, default=False)
    sequence = Column(Integer, default=0)

    task = relationship("ProjectTask", back_populates="checklists")


class TaskComment(UUIDMixin, AuditMixin, Base):
    __tablename__ = "task_comments"

    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("project_tasks.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)

    task = relationship("ProjectTask", back_populates="comments")
    user = relationship("User", foreign_keys=[user_id])


class TaskAttachment(UUIDMixin, AuditMixin, Base):
    __tablename__ = "task_attachments"

    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("project_tasks.id"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50))
    file_size = Column(Integer)

    task = relationship("ProjectTask", back_populates="attachments")


class TaskDependency(UUIDMixin, AuditMixin, Base):
    __tablename__ = "task_dependencies"

    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("project_tasks.id"), nullable=False, index=True)
    depends_on_task_id = Column(Integer, ForeignKey("project_tasks.id"), nullable=False, index=True)
    dependency_type = Column(String(50), default="finish_to_start")

    task = relationship("ProjectTask", foreign_keys=[task_id])
    depends_on_task = relationship("ProjectTask", foreign_keys=[depends_on_task_id])


class TaskTimeLog(UUIDMixin, AuditMixin, Base):
    __tablename__ = "task_time_logs"

    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("project_tasks.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    hours = Column(Float, nullable=False)
    description = Column(Text)
    is_billable = Column(Boolean, default=True)

    task = relationship("ProjectTask", back_populates="time_logs")
    user = relationship("User", foreign_keys=[user_id])


class ProjectCalendar(UUIDMixin, AuditMixin, Base):
    __tablename__ = "project_calendars"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    event_type = Column(String(50), default="event")

    project = relationship("Project")


class ResourceAllocation(UUIDMixin, AuditMixin, Base):
    __tablename__ = "project_resource_allocations"

    id = Column(Integer, primary_key=True)
    member_id = Column(Integer, ForeignKey("project_members.id"), nullable=False, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    start_date = Column(Date)
    end_date = Column(Date)
    allocation_percentage = Column(Float, default=100.0)

    member = relationship("ProjectMember", back_populates="allocations")
    project = relationship("Project")


class ProjectBudget(UUIDMixin, AuditMixin, Base):
    __tablename__ = "project_budgets"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    period_start = Column(Date)
    period_end = Column(Date)

    project = relationship("Project")


class ProjectExpense(UUIDMixin, AuditMixin, Base):
    __tablename__ = "project_expenses"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    reported_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    expense_date = Column(Date, nullable=False)
    category = Column(String(100))
    description = Column(Text)
    status = Column(String(50), default="pending")

    project = relationship("Project")
    user = relationship("User", foreign_keys=[reported_by])


class ProjectRisk(UUIDMixin, AuditMixin, Base):
    __tablename__ = "project_risks"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    probability = Column(String(50))
    impact = Column(String(50))
    severity = Column(String(50))
    status = Column(String(50), default="open")
    mitigation_plan = Column(Text)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    project = relationship("Project")
    owner = relationship("User", foreign_keys=[owner_id])


class Issue(UUIDMixin, AuditMixin, Base):
    __tablename__ = "project_issues"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    task_id = Column(Integer, ForeignKey("project_tasks.id"), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    priority = Column(String(50), default="high")
    status = Column(String(50), default="open")
    reported_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)

    project = relationship("Project")
    task = relationship("ProjectTask")
    reporter = relationship("User", foreign_keys=[reported_by])
    assignee = relationship("User", foreign_keys=[assigned_to])


class ChangeRequest(UUIDMixin, AuditMixin, Base):
    __tablename__ = "project_change_requests"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    impact_analysis = Column(Text)
    status = Column(String(50), default="submitted")
    requested_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    project = relationship("Project")
    requester = relationship("User", foreign_keys=[requested_by])
    approver = relationship("User", foreign_keys=[approved_by])


class Meeting(UUIDMixin, AuditMixin, Base):
    __tablename__ = "project_meetings"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    agenda = Column(Text)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    location = Column(String(255))
    organizer_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    project = relationship("Project")
    organizer = relationship("User", foreign_keys=[organizer_id])
    minutes = relationship("MeetingMinutes", back_populates="meeting", uselist=False, cascade="all, delete-orphan")


class MeetingMinutes(UUIDMixin, AuditMixin, Base):
    __tablename__ = "project_meeting_minutes"

    id = Column(Integer, primary_key=True)
    meeting_id = Column(Integer, ForeignKey("project_meetings.id"), nullable=False, unique=True)
    content = Column(Text, nullable=False)
    recorded_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    meeting = relationship("Meeting", back_populates="minutes")
    recorder = relationship("User", foreign_keys=[recorded_by])


class ProjectDocument(UUIDMixin, AuditMixin, Base):
    __tablename__ = "project_documents"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50))
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    project = relationship("Project")
    uploader = relationship("User", foreign_keys=[uploaded_by])


class ProjectStatusHistory(UUIDMixin, AuditMixin, Base):
    __tablename__ = "project_status_history"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    previous_status = Column(String(50))
    new_status = Column(String(50), nullable=False)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    comments = Column(Text)

    project = relationship("Project")
    changer = relationship("User", foreign_keys=[changed_by])


class ProjectActivityLog(UUIDMixin, AuditMixin, Base):
    __tablename__ = "project_activity_logs"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100))
    entity_id = Column(Integer)
    details = Column(JSON)

    project = relationship("Project")
    user = relationship("User", foreign_keys=[user_id])
