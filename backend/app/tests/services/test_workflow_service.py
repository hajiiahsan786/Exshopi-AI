from app.services.workflow_service import WorkflowExecutionService

def test_evaluate_condition_equals():
    result = WorkflowExecutionService._evaluate_condition({"status": "approved"}, {"field": "status", "operator": "equals", "value": "approved"})
    assert result is True

def test_evaluate_condition_not_equals():
    result = WorkflowExecutionService._evaluate_condition({"status": "rejected"}, {"field": "status", "operator": "equals", "value": "approved"})
    assert result is False

    result2 = WorkflowExecutionService._evaluate_condition({"status": "rejected"}, {"field": "status", "operator": "not_equals", "value": "approved"})
    assert result2 is True

def test_evaluate_condition_greater_than():
    result = WorkflowExecutionService._evaluate_condition({"amount": 500}, {"field": "amount", "operator": "greater_than", "value": 100})
    assert result is True

def test_evaluate_condition_empty_context():
    result = WorkflowExecutionService._evaluate_condition(None, {"field": "status", "operator": "equals", "value": "approved"})
    assert result is False

def test_evaluate_condition_missing_field():
    result = WorkflowExecutionService._evaluate_condition({"amount": 500}, {"field": "status", "operator": "equals", "value": "approved"})
    assert result is False
