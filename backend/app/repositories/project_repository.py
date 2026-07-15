from sqlalchemy.orm import Session
from app.repositories.crm_repository import CRMRepository
from app.models.project import (
    ProjectRole,
    Project,
    ProjectMember,
    ProjectPhase,
    Milestone,
    Sprint,
    Epic,
    Story,
    ProjectTask,
    TaskChecklist,
    TaskComment,
    TaskAttachment,
    TaskDependency,
    TaskTimeLog,
    ProjectCalendar,
    ResourceAllocation,
    ProjectBudget,
    ProjectExpense,
    ProjectRisk,
    Issue,
    ChangeRequest,
    Meeting,
    MeetingMinutes,
    ProjectDocument,
    ProjectStatusHistory,
    ProjectActivityLog,
)


class ProjectRoleRepository(CRMRepository[ProjectRole]):
    model = ProjectRole
    search_fields = ("name", "description")


class ProjectRepository(CRMRepository[Project]):
    model = Project
    search_fields = ("name", "code", "description")
    sortable_fields = CRMRepository.sortable_fields | {"name", "start_date", "end_date", "status", "priority"}


class ProjectMemberRepository(CRMRepository[ProjectMember]):
    model = ProjectMember
    search_fields = ()


class ProjectPhaseRepository(CRMRepository[ProjectPhase]):
    model = ProjectPhase
    search_fields = ("name", "description")


class MilestoneRepository(CRMRepository[Milestone]):
    model = Milestone
    search_fields = ("name", "description")


class SprintRepository(CRMRepository[Sprint]):
    model = Sprint
    search_fields = ("name", "goal")
    sortable_fields = CRMRepository.sortable_fields | {"start_date", "end_date", "status"}


class EpicRepository(CRMRepository[Epic]):
    model = Epic
    search_fields = ("name", "description")


class StoryRepository(CRMRepository[Story]):
    model = Story
    search_fields = ("name", "description")


class ProjectTaskRepository(CRMRepository[ProjectTask]):
    model = ProjectTask
    search_fields = ("title", "description")
    sortable_fields = CRMRepository.sortable_fields | {"start_date", "due_date", "status", "priority", "completed_at"}


class TaskChecklistRepository(CRMRepository[TaskChecklist]):
    model = TaskChecklist
    search_fields = ("title",)


class TaskCommentRepository(CRMRepository[TaskComment]):
    model = TaskComment
    search_fields = ("content",)


class TaskAttachmentRepository(CRMRepository[TaskAttachment]):
    model = TaskAttachment
    search_fields = ("file_name",)


class TaskDependencyRepository(CRMRepository[TaskDependency]):
    model = TaskDependency
    search_fields = ()


class TaskTimeLogRepository(CRMRepository[TaskTimeLog]):
    model = TaskTimeLog
    search_fields = ("description",)


class ProjectCalendarRepository(CRMRepository[ProjectCalendar]):
    model = ProjectCalendar
    search_fields = ("title", "description")


class ResourceAllocationRepository(CRMRepository[ResourceAllocation]):
    model = ResourceAllocation
    search_fields = ()


class ProjectBudgetRepository(CRMRepository[ProjectBudget]):
    model = ProjectBudget
    search_fields = ("category",)


class ProjectExpenseRepository(CRMRepository[ProjectExpense]):
    model = ProjectExpense
    search_fields = ("category", "description")


class ProjectRiskRepository(CRMRepository[ProjectRisk]):
    model = ProjectRisk
    search_fields = ("title", "description", "mitigation_plan")


class IssueRepository(CRMRepository[Issue]):
    model = Issue
    search_fields = ("title", "description")


class ChangeRequestRepository(CRMRepository[ChangeRequest]):
    model = ChangeRequest
    search_fields = ("title", "description", "impact_analysis")


class MeetingRepository(CRMRepository[Meeting]):
    model = Meeting
    search_fields = ("title", "agenda", "location")


class MeetingMinutesRepository(CRMRepository[MeetingMinutes]):
    model = MeetingMinutes
    search_fields = ("content",)


class ProjectDocumentRepository(CRMRepository[ProjectDocument]):
    model = ProjectDocument
    search_fields = ("title", "description", "file_name")


class ProjectStatusHistoryRepository(CRMRepository[ProjectStatusHistory]):
    model = ProjectStatusHistory
    search_fields = ("comments",)


class ProjectActivityLogRepository(CRMRepository[ProjectActivityLog]):
    model = ProjectActivityLog
    search_fields = ("action", "entity_type")
