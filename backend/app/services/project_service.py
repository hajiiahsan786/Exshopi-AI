from datetime import datetime, timezone
from typing import Any, List, Dict
from sqlalchemy.orm import Session

from app.services.crm_service import CRMService
from app.repositories.project_repository import (
    ProjectRepository,
    SprintRepository,
    ProjectTaskRepository,
    ProjectRoleRepository,
    ProjectMemberRepository,
)
from app.models.project import Project, Sprint, ProjectTask, ProjectRole, ProjectMember

class ProjectRoleService(CRMService[ProjectRole]):
    repository = ProjectRoleRepository
    entity_name = "Project Role"


class ProjectService(CRMService[Project]):
    repository = ProjectRepository
    entity_name = "Project"

    @classmethod
    def get_gantt_data(cls, db: Session, project_id: int) -> Dict[str, Any]:
        """
        Retrieves project tasks, phases and milestones formatted for Gantt chart
        """
        project = cls.get(db, project_id)

        tasks_data = []
        for task in project.tasks:
            if task.start_date and task.due_date:
                tasks_data.append({
                    "id": task.id,
                    "title": task.title,
                    "start_date": task.start_date.isoformat(),
                    "end_date": task.due_date.isoformat(),
                    "progress": task.progress,
                    "parent_id": task.parent_id,
                    "phase_id": task.phase_id
                })

        return {
            "project_id": project.id,
            "project_name": project.name,
            "tasks": tasks_data,
        }

    @classmethod
    def get_project_progress(cls, db: Session, project_id: int) -> Dict[str, Any]:
        """
        Calculates project progress based on task completion
        """
        project = cls.get(db, project_id)

        total_tasks = len(project.tasks)
        if total_tasks == 0:
            return {"progress": 0.0, "total_tasks": 0, "completed_tasks": 0}

        completed_tasks = sum(1 for task in project.tasks if task.status == "completed")
        progress = (completed_tasks / total_tasks) * 100

        # Optionally update the project progress
        project.progress = progress
        db.commit()

        return {
            "progress": progress,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks
        }


class SprintService(CRMService[Sprint]):
    repository = SprintRepository
    entity_name = "Sprint"

    @classmethod
    def get_burndown_data(cls, db: Session, sprint_id: int) -> Dict[str, Any]:
        """
        Retrieves data for a sprint burndown chart
        """
        sprint = cls.get(db, sprint_id)

        # Get tasks associated with stories in this sprint
        tasks = []
        for story in sprint.stories:
            tasks.extend(story.tasks)

        total_points = sum(story.points for story in sprint.stories if story.points)
        total_hours = sum(task.estimated_hours for task in tasks)
        completed_hours = sum(task.actual_hours for task in tasks if task.status == "completed")

        return {
            "sprint_id": sprint.id,
            "sprint_name": sprint.name,
            "start_date": sprint.start_date.isoformat() if sprint.start_date else None,
            "end_date": sprint.end_date.isoformat() if sprint.end_date else None,
            "total_points": total_points,
            "total_hours": total_hours,
            "completed_hours": completed_hours
        }


class ProjectTaskService(CRMService[ProjectTask]):
    repository = ProjectTaskRepository
    entity_name = "Project Task"

    @classmethod
    def transition_status(cls, db: Session, task_id: int, new_status: str) -> ProjectTask:
        """
        Transitions a task through Kanban/Scrum workflow statuses
        """
        task = cls.get(db, task_id)
        task.status = new_status
        if new_status == "completed":
            task.completed_at = datetime.now(timezone.utc)
            task.progress = 100.0
        db.commit()
        db.refresh(task)
        return task


class ProjectMemberService(CRMService[ProjectMember]):
    repository = ProjectMemberRepository
    entity_name = "Project Member"
