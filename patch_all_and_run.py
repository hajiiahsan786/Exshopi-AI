import re
with open('backend/app/models/__init__.py', 'r') as f:
    content = f.read()

import_str = """from .agent import (
    Agent,
    AgentRole,
    AgentCapability,
    AgentPermission,
    AgentMemoryProfile,
    AgentConfiguration,
    AgentConversation,
    AgentSession,
    AgentTask,
    AgentTaskQueue,
    AgentExecution,
    AgentExecutionStep,
    AgentWorkflow,
    AgentDecision,
    AgentReasoningLog,
    AgentObservation,
    AgentPlan,
    AgentGoal,
    AgentSkill,
    AgentTool,
    AgentToolPermission,
    AgentEvent,
    AgentNotification,
    AgentAuditLog,
)"""

if "from .agent import" not in content:
    content = content + "\n" + import_str

with open('backend/app/models/__init__.py', 'w') as f:
    f.write(content)

with open('backend/app/api/v1/endpoints/__init__.py', 'w') as f:
    f.write("")

# update API router
with open('backend/app/api/v1/router.py', 'r') as f:
    content = f.read()

import_pattern = r'from app\.api\.v1\.endpoints import \(\n'
content = re.sub(import_pattern, 'from app.api.v1.endpoints import (\n    agent,\n', content)

router_inclusion = """
api_router.include_router(
    agent.router,
    prefix="/agents",
    tags=["Agents"],
)

for router, prefix, tags in inventory.INVENTORY_ROUTERS:
"""
content = content.replace("for router, prefix, tags in inventory.INVENTORY_ROUTERS:", router_inclusion)

with open('backend/app/api/v1/router.py', 'w') as f:
    f.write(content)
