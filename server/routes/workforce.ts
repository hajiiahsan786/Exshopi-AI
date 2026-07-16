import { Router, Request, Response } from "express";
import {
  employees,
  roles,
  capabilities,
  permissions,
  configurations,
  memories,
  tasks,
  conversations,
  decisions,
  recommendations,
  reports,
  analytics,
  auditLogs,
  logAudit,
  getEmployeeById
} from "../db";
import {
  generateAgentResponse,
  createTaskPlan,
  generateDomainRecommendation,
  delegateTask,
  generateDomainReport
} from "../services/engines";

export const workforceRouter = Router();

// 1. GET /api/v1/workforce/employees
workforceRouter.get("/employees", (req: Request, res: Response) => {
  const result = employees.map(emp => {
    const role = roles.find(r => r.id === emp.roleId);
    const caps = capabilities.filter(c => c.employeeId === emp.id);
    const config = configurations.find(c => c.employeeId === emp.id);
    return {
      ...emp,
      role,
      capabilities: caps,
      configuration: config
    };
  });
  res.json({ success: true, data: result });
});

// 2. GET /api/v1/workforce/roles
workforceRouter.get("/roles", (req: Request, res: Response) => {
  res.json({ success: true, data: roles });
});

// 3. GET /api/v1/workforce/configs/:empId
workforceRouter.get("/configs/:empId", (req: Request, res: Response) => {
  const empId = parseInt(req.params.empId);
  const config = configurations.find(c => c.employeeId === empId);
  if (!config) return res.status(404).json({ success: false, message: "Configuration not found" });
  res.json({ success: true, data: config });
});

// 4. POST /api/v1/workforce/configs/:empId
workforceRouter.post("/configs/:empId", (req: Request, res: Response) => {
  const empId = parseInt(req.params.empId);
  const { temperature, responseStyle, systemInstructions, toolsEnabled } = req.body;
  const index = configurations.findIndex(c => c.employeeId === empId);
  if (index === -1) return res.status(404).json({ success: false, message: "Configuration not found" });

  configurations[index] = {
    ...configurations[index],
    temperature: parseFloat(temperature) || 0.3,
    responseStyle: responseStyle || "professional",
    systemInstructions: systemInstructions || "",
    toolsEnabled: Array.isArray(toolsEnabled) ? toolsEnabled : []
  };

  logAudit(empId, "Update Configuration", `Updated agent LLM temperature to ${temperature} and style to ${responseStyle}.`, true);
  res.json({ success: true, data: configurations[index] });
});

// 5. GET /api/v1/workforce/memories/:empId
workforceRouter.get("/memories/:empId", (req: Request, res: Response) => {
  const empId = parseInt(req.params.empId);
  const result = memories.filter(m => m.employeeId === empId);
  res.json({ success: true, data: result });
});

// 6. POST /api/v1/workforce/memories/:empId
workforceRouter.post("/memories/:empId", (req: Request, res: Response) => {
  const empId = parseInt(req.params.empId);
  const { type, content } = req.body;
  if (!content) return res.status(400).json({ success: false, message: "Content is required" });

  const newMemory = {
    id: memories.length + 1,
    employeeId: empId,
    type: type === "long-term" ? ("long-term" as const) : ("short-term" as const),
    content,
    timestamp: new Date().toISOString()
  };
  memories.push(newMemory);

  logAudit(empId, "Inject Memory", `Injected new ${type} memory block into local storage context.`, true);
  res.json({ success: true, data: newMemory });
});

// 7. GET /api/v1/workforce/tasks/:empId
workforceRouter.get("/tasks/:empId", (req: Request, res: Response) => {
  const empId = parseInt(req.params.empId);
  const result = tasks.filter(t => t.employeeId === empId);
  res.json({ success: true, data: result });
});

// 8. POST /api/v1/workforce/tasks/:empId
workforceRouter.post("/tasks/:empId", (req: Request, res: Response) => {
  const empId = parseInt(req.params.empId);
  const { title, description, priority, due_date } = req.body;
  if (!title) return res.status(400).json({ success: false, message: "Title is required" });

  const newTask = {
    id: tasks.length + 1,
    employeeId: empId,
    title,
    description: description || "",
    status: "pending" as const,
    priority: (priority || "medium") as any,
    due_date: due_date || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    created_at: new Date().toISOString()
  };
  tasks.push(newTask);

  logAudit(empId, "Assigned Task", `User added new task to pipeline: "${title}".`, true);
  res.json({ success: true, data: newTask });
});

// 9. POST /api/v1/workforce/plan/:empId
workforceRouter.post("/plan/:empId", async (req: Request, res: Response) => {
  const empId = parseInt(req.params.empId);
  const { title } = req.body;
  if (!title) return res.status(400).json({ success: false, message: "Task title is required for planning" });

  try {
    const plan = await createTaskPlan(empId, title);
    res.json({ success: true, data: plan });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 10. POST /api/v1/workforce/chat/:empId
workforceRouter.post("/chat/:empId", async (req: Request, res: Response) => {
  const empId = parseInt(req.params.empId);
  const { message } = req.body;
  if (!message) return res.status(400).json({ success: false, message: "Message is required" });

  try {
    const response = await generateAgentResponse(empId, message);
    res.json({ success: true, data: response });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 11. GET /api/v1/workforce/conversations/:empId
workforceRouter.get("/conversations/:empId", (req: Request, res: Response) => {
  const empId = parseInt(req.params.empId);
  const conv = conversations.find(c => c.employeeId === empId);
  res.json({ success: true, data: conv || { messages: [] } });
});

// 12. POST /api/v1/workforce/recommend/:empId
workforceRouter.post("/recommend/:empId", (req: Request, res: Response) => {
  const empId = parseInt(req.params.empId);
  const rec = generateDomainRecommendation(empId);
  res.json({ success: true, data: rec });
});

// 13. GET /api/v1/workforce/recommendations/:empId
workforceRouter.get("/recommendations/:empId", (req: Request, res: Response) => {
  const empId = parseInt(req.params.empId);
  const recs = recommendations.filter(r => r.employeeId === empId);
  res.json({ success: true, data: recs });
});

// 14. POST /api/v1/workforce/report/:empId
workforceRouter.post("/report/:empId", async (req: Request, res: Response) => {
  const empId = parseInt(req.params.empId);
  const { title } = req.body;
  if (!title) return res.status(400).json({ success: false, message: "Report title is required" });

  try {
    const report = await generateDomainReport(empId, title);
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 15. GET /api/v1/workforce/reports/:empId
workforceRouter.get("/reports/:empId", (req: Request, res: Response) => {
  const empId = parseInt(req.params.empId);
  const reps = reports.filter(r => r.employeeId === empId);
  res.json({ success: true, data: reps });
});

// 16. GET /api/v1/workforce/analytics/:empId
workforceRouter.get("/analytics/:empId", (req: Request, res: Response) => {
  const empId = parseInt(req.params.empId);
  const result = analytics.filter(a => a.employeeId === empId);
  res.json({ success: true, data: result });
});

// 17. GET /api/v1/workforce/audit-logs/:empId
workforceRouter.get("/audit-logs/:empId", (req: Request, res: Response) => {
  const empId = parseInt(req.params.empId);
  const result = auditLogs.filter(a => a.employeeId === empId);
  res.json({ success: true, data: result });
});

// 18. POST /api/v1/workforce/delegate
workforceRouter.post("/delegate", (req: Request, res: Response) => {
  const { fromEmpId, toEmpId, title, description } = req.body;
  if (!fromEmpId || !toEmpId || !title) {
    return res.status(400).json({ success: false, message: "fromEmpId, toEmpId, and title are required" });
  }

  try {
    const result = delegateTask(parseInt(fromEmpId), parseInt(toEmpId), title, description || "");
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 19. GET /api/v1/workforce/debug-db
workforceRouter.get("/debug-db", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      employees,
      roles,
      capabilities,
      permissions,
      configurations,
      memories,
      tasks,
      conversations,
      decisions,
      recommendations,
      reports,
      analytics,
      auditLogs
    }
  });
});
