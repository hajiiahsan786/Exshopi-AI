from typing import Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.models.workflow import Workflow, WorkflowExecution, WorkflowTask, WorkflowVersion, WorkflowStep, WorkflowTransition, WorkflowCondition, WorkflowAction, WorkflowExecutionLog
from app.repositories.workflow_repository import (
    WorkflowRepository,
    WorkflowExecutionRepository,
    WorkflowTaskRepository,
    WorkflowExecutionLogRepository,
    WorkflowVersionRepository,
    WorkflowStepRepository,
    WorkflowTransitionRepository,
    WorkflowConditionRepository,
    WorkflowActionRepository
)
from app.services.crm_service import CRMService

class WorkflowService(CRMService[Workflow]):
    repository = WorkflowRepository
    entity_name = "Workflow"

class WorkflowExecutionService(CRMService[WorkflowExecution]):
    repository = WorkflowExecutionRepository
    entity_name = "Workflow Execution"

    @classmethod
    def execute_workflow(cls, db: Session, execution_id: int, user_id: int | None = None) -> WorkflowExecution:
        execution = cls.get(db, execution_id)
        if execution.status not in ["pending", "paused"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False, "message": "Execution is not pending or paused"}
            )
        execution.status = "running"
        db.commit()
        db.refresh(execution)

        cls._log_execution(db, execution.id, execution.current_step_id, "started", "running", "Execution started")

        # Start execution engine loop
        cls._run_engine(db, execution)

        return execution

    @classmethod
    def _run_engine(cls, db: Session, execution: WorkflowExecution):
        if execution.status != "running":
            return

        current_step_id = execution.current_step_id
        if not current_step_id:
            # Find the starting step of the workflow version
            version = WorkflowVersionRepository.get_by_id(db, execution.workflow_version_id)
            if not version:
                return
            first_step = WorkflowStepRepository.base_query(db).filter(
                WorkflowStep.workflow_version_id == version.id
            ).first()
            if not first_step:
                execution.status = "completed"
                db.commit()
                return
            execution.current_step_id = first_step.id
            db.commit()
            current_step_id = first_step.id

        current_step = WorkflowStepRepository.get_by_id(db, current_step_id)
        if not current_step:
             execution.status = "failed"
             db.commit()
             return

        # Execute actions for current step
        actions = WorkflowActionRepository.base_query(db).filter(
             WorkflowAction.step_id == current_step.id
        ).all()

        for action in actions:
            cls._execute_action(db, execution, current_step, action)

        # Determine next step
        transitions = WorkflowTransitionRepository.base_query(db).filter(
             WorkflowTransition.source_step_id == current_step.id
        ).all()

        if not transitions:
             execution.status = "completed"
             cls._log_execution(db, execution.id, current_step.id, "completed", "completed", "Workflow completed")
             db.commit()
             return

        # Evaluate conditions
        next_step_id = None
        for transition in transitions:
             conditions = WorkflowConditionRepository.base_query(db).filter(
                  WorkflowCondition.transition_id == transition.id
             ).all()

             # If no conditions or all conditions evaluate to true
             if not conditions or all(cls._evaluate_condition(execution.context_data, cond.rule) for cond in conditions):
                  next_step_id = transition.target_step_id
                  break

        if next_step_id:
             execution.current_step_id = next_step_id
             db.commit()
             # Continue loop
             cls._run_engine(db, execution)
        else:
             execution.status = "failed"
             cls._log_execution(db, execution.id, current_step.id, "transition_failed", "failed", "No valid transition found")
             db.commit()

    @classmethod
    def _execute_action(cls, db: Session, execution: WorkflowExecution, step: WorkflowStep, action: WorkflowAction):
        cls._log_execution(db, execution.id, step.id, "execute_action", "success", f"Executed action {action.action_type}")
        if action.action_type == "create_task":
             config = action.configuration or {}
             assigned_to = config.get("assigned_to")
             task = WorkflowTask(
                  execution_id=execution.id,
                  step_id=step.id,
                  assigned_to=assigned_to,
                  status="pending"
             )
             db.add(task)
             db.commit()

    @classmethod
    def _evaluate_condition(cls, context_data: dict[str, Any] | None, rule: dict[str, Any]) -> bool:
        if not context_data:
             return False
        field = rule.get("field")
        operator = rule.get("operator")
        value = rule.get("value")

        if not field or not operator:
             return True

        context_value = context_data.get(field)

        if operator == "equals":
             return context_value == value
        elif operator == "not_equals":
             return context_value != value
        elif operator == "greater_than":
             try:
                  return float(context_value) > float(value)
             except (ValueError, TypeError):
                  return False
        return False

    @classmethod
    def _log_execution(cls, db: Session, execution_id: int, step_id: int | None, action: str, status: str, message: str):
        log = WorkflowExecutionLog(
            execution_id=execution_id,
            step_id=step_id,
            action=action,
            status=status,
            message=message
        )
        db.add(log)
        db.commit()

    @classmethod
    def pause_workflow(cls, db: Session, execution_id: int, user_id: int | None = None) -> WorkflowExecution:
        execution = cls.get(db, execution_id)
        if execution.status != "running":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False, "message": "Only running executions can be paused"}
            )
        execution.status = "paused"
        db.commit()
        db.refresh(execution)
        cls._log_execution(db, execution.id, execution.current_step_id, "paused", "paused", "Execution paused")
        return execution

    @classmethod
    def resume_workflow(cls, db: Session, execution_id: int, user_id: int | None = None) -> WorkflowExecution:
        execution = cls.get(db, execution_id)
        if execution.status != "paused":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False, "message": "Only paused executions can be resumed"}
            )
        execution.status = "running"
        db.commit()
        db.refresh(execution)
        cls._log_execution(db, execution.id, execution.current_step_id, "resumed", "running", "Execution resumed")
        cls._run_engine(db, execution)
        return execution

    @classmethod
    def cancel_workflow(cls, db: Session, execution_id: int, user_id: int | None = None) -> WorkflowExecution:
        execution = cls.get(db, execution_id)
        execution.status = "cancelled"
        db.commit()
        db.refresh(execution)
        cls._log_execution(db, execution.id, execution.current_step_id, "cancelled", "cancelled", "Execution cancelled")
        return execution

    @classmethod
    def retry_workflow(cls, db: Session, execution_id: int, user_id: int | None = None) -> WorkflowExecution:
        execution = cls.get(db, execution_id)
        if execution.status not in ["failed", "cancelled"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False, "message": "Only failed or cancelled executions can be retried"}
            )
        execution.status = "running"
        db.commit()
        db.refresh(execution)
        cls._log_execution(db, execution.id, execution.current_step_id, "retried", "running", "Execution retried")
        cls._run_engine(db, execution)
        return execution

class WorkflowTaskService(CRMService[WorkflowTask]):
    repository = WorkflowTaskRepository
    entity_name = "Workflow Task"

    @classmethod
    def approve_task(cls, db: Session, task_id: int, user_id: int | None = None) -> WorkflowTask:
        task = cls.get(db, task_id)
        if task.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False, "message": "Only pending tasks can be approved"}
            )
        task.status = "approved"
        db.commit()
        db.refresh(task)
        # Notify execution engine to continue if blocked by this task
        execution = WorkflowExecutionService.get(db, task.execution_id)
        if execution and execution.status == "running":
             WorkflowExecutionService._run_engine(db, execution)
        return task

    @classmethod
    def reject_task(cls, db: Session, task_id: int, user_id: int | None = None) -> WorkflowTask:
        task = cls.get(db, task_id)
        if task.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False, "message": "Only pending tasks can be rejected"}
            )
        task.status = "rejected"
        db.commit()
        db.refresh(task)
        # Usually rejection fails or alters the workflow
        execution = WorkflowExecutionService.get(db, task.execution_id)
        if execution:
             execution.status = "failed"
             WorkflowExecutionService._log_execution(db, execution.id, task.step_id, "task_rejected", "failed", "Task was rejected")
             db.commit()
        return task

    @classmethod
    def delegate_task(cls, db: Session, task_id: int, target_user_id: int, user_id: int | None = None) -> WorkflowTask:
        task = cls.get(db, task_id)
        if task.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False, "message": "Only pending tasks can be delegated"}
            )
        task.assigned_to = target_user_id
        db.commit()
        db.refresh(task)
        return task

    @classmethod
    def escalate_task(cls, db: Session, task_id: int, user_id: int | None = None) -> WorkflowTask:
        task = cls.get(db, task_id)
        if task.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False, "message": "Only pending tasks can be escalated"}
            )
        task.status = "escalated"
        db.commit()
        db.refresh(task)
        return task
