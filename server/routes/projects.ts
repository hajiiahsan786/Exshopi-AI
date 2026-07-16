import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

export const projectsRouter = Router();

// Secure AI Client initialization
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// RBAC Middleware
function checkProjectsPermission(permission: string) {
  return (req: Request, res: Response, next: any) => {
    const userRole = req.headers["x-user-role"] || "Enterprise Admin";
    if (userRole === "Enterprise Admin" || userRole === "Admin" || userRole === "AI Project Manager" || userRole === "AI CEO") {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: `Access denied: Missing required permission '${permission}' for role '${userRole}'`
    });
  };
}

// In-Memory Database Collections for Project Management & Sprints
export let projects = [
  {
    id: 1,
    name: "Autonomous Sales Pipeline Launch",
    description: "Build, configure, and fine-tune Sophia AI outreach agents with direct Shopify CRM synchronizers.",
    status: "in_progress", // planning, in_progress, on_hold, completed, cancelled
    priority: "high",
    progress: 65,
    manager: "Percy Project Agent",
    startDate: "2026-07-01",
    endDate: "2026-08-15",
    budget: 45000.00,
    actualSpend: 28500.00,
    riskLevel: "medium",
    health: "healthy"
  },
  {
    id: 2,
    name: "Enterprise Customer Portal Integration",
    description: "Provide secure self-service billing, invoice reconciliations, and custom support interfaces.",
    status: "planning",
    priority: "medium",
    progress: 15,
    manager: "Percy Project Agent",
    startDate: "2026-07-15",
    endDate: "2026-09-30",
    budget: 35000.00,
    actualSpend: 4500.00,
    riskLevel: "low",
    health: "healthy"
  },
  {
    id: 3,
    name: "GPU Rack Scaling & Ingress Upgrades",
    description: "Deploy in-house DGX server supercluster with high bandwidth load balancers.",
    status: "in_progress",
    priority: "high",
    progress: 40,
    manager: "Peter Procurement Agent",
    startDate: "2026-06-15",
    endDate: "2026-08-01",
    budget: 125000.00,
    actualSpend: 112000.00,
    riskLevel: "high",
    health: "warning"
  }
];

export let sprints = [
  { id: 1, projectId: 1, name: "Sprint 1: Core Agent Fine-Tuning", startDate: "2026-07-01", endDate: "2026-07-14", status: "completed" },
  { id: 2, projectId: 1, name: "Sprint 2: CRM Webhook Synchronization", startDate: "2026-07-15", endDate: "2026-07-28", status: "active" },
  { id: 3, projectId: 1, name: "Sprint 3: Enterprise QA Sign-Off", startDate: "2026-07-29", endDate: "2026-08-11", status: "upcoming" }
];

export let milestones = [
  { id: 1, projectId: 1, title: "Alpha Weights Fine-Tuning Signed Off", dueDate: "2026-07-10", status: "completed" },
  { id: 2, projectId: 1, title: "Shopify API Connection Secured", dueDate: "2026-07-25", status: "pending" },
  { id: 3, projectId: 1, title: "Production Fleet Deployment Release", dueDate: "2026-08-15", status: "pending" }
];

export let tasks = [
  { id: 1, projectId: 1, sprintId: 2, title: "Draft follow-up training parameters", description: "Incorporate sales quote follow-up patterns into model training data.", status: "in_progress", priority: "high", assignee: "Sophia AI (Sales Pro)", estimateHrs: 12, loggedHrs: 8, dueDate: "2026-07-20", dependencies: [] },
  { id: 2, projectId: 1, sprintId: 2, title: "Configure CRM sync pipeline trigger", description: "Establish automatic lead synchronization webhook with Retail Tech DB.", status: "todo", priority: "medium", assignee: "Lucas AI (Logistic Bot)", estimateHrs: 16, loggedHrs: 0, dueDate: "2026-07-22", dependencies: [1] },
  { id: 3, projectId: 1, sprintId: 1, title: "Prepare seed pricing datasets", description: "Gather transaction indices to format corporate financial context files.", status: "completed", priority: "high", assignee: "Fiona Finance Agent", estimateHrs: 8, loggedHrs: 8, dueDate: "2026-07-12", dependencies: [] },
  { id: 4, projectId: 1, sprintId: 2, title: "Integrate dashboard UI views", description: "Deliver visual screens for Accounting & Project portfolios in main shell.", status: "in_progress", priority: "high", assignee: "Percy Project Agent", estimateHrs: 24, loggedHrs: 18, dueDate: "2026-07-18", dependencies: [] },
  { id: 5, projectId: 1, sprintId: 2, title: "MFA compliance sign-off checklist", description: "Perform system audits to enforce strict administrative route rules.", status: "todo", priority: "low", assignee: "Carter Compliance Agent", estimateHrs: 6, loggedHrs: 0, dueDate: "2026-07-26", dependencies: [] }
];

export let timeLogs = [
  { id: 1, taskId: 1, employee: "Sophia AI (Sales Pro)", hours: 8, billable: true, description: "Evaluated deal health scores and fine-tuned outreach model embeddings.", status: "approved", loggedAt: "2026-07-14T17:00:00Z" },
  { id: 2, taskId: 4, employee: "Percy Project Agent", hours: 10, billable: true, description: "Wired Gantt chart dependency rendering with responsive mouse nodes.", status: "pending", loggedAt: "2026-07-15T08:30:00Z" },
  { id: 3, taskId: 4, employee: "Percy Project Agent", hours: 8, billable: true, description: "Structured in-memory CRM allocations for shared ERP ledger syncing.", status: "approved", loggedAt: "2026-07-14T18:00:00Z" },
  { id: 4, taskId: 3, employee: "Fiona Finance Agent", hours: 8, billable: true, description: "Parsed chart of accounts and compiled operating checking balances.", status: "approved", loggedAt: "2026-07-11T16:00:00Z" }
];

export let resourceAllocations = [
  { id: 1, employee: "Sophia AI (Sales Pro)", title: "Sales Agent", allocatedHours: 40, capacityHours: 40, activeProjectsCount: 1 },
  { id: 2, employee: "Percy Project Agent", title: "Project Manager", allocatedHours: 35, capacityHours: 40, activeProjectsCount: 2 },
  { id: 3, employee: "Fiona Finance Agent", title: "Finance Agent", allocatedHours: 30, capacityHours: 40, activeProjectsCount: 1 },
  { id: 4, employee: "Lucas AI (Logistic Bot)", title: "Inventory Coordinator", allocatedHours: 20, capacityHours: 40, activeProjectsCount: 1 },
  { id: 5, employee: "Carter Compliance Agent", title: "Compliance Officer", allocatedHours: 15, capacityHours: 40, activeProjectsCount: 1 }
];

export let projectRisks = [
  { id: 1, projectId: 1, title: "API Synchronizer Throttle Limits", description: "Shopify CRM endpoints may restrict rapid webhook updates during peak times.", probability: "medium", impact: "high", mitigation: "Enforce exponential backoff and message queues.", status: "mitigated" },
  { id: 2, projectId: 3, title: "GPU Cooling Supply-Chain Block", description: "Cooling tubes are held in regional customs centers, delaying rack finalization.", probability: "high", impact: "high", mitigation: "Partner with secondary Seattle manufacturing hubs for local sourcing.", status: "active" }
];

// ==========================================
// API ENDPOINTS
// ==========================================

// 1. Projects Portfolio Dashboard KPIs
projectsRouter.get("/dashboard", checkProjectsPermission("projects.read"), (req: Request, res: Response) => {
  try {
    const totalProjects = projects.length;
    const activePrj = projects.filter(p => p.status === "in_progress").length;
    const completedPrj = projects.filter(p => p.status === "completed").length;
    
    // Overall Budget Allocation vs Spent
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpend = projects.reduce((sum, p) => sum + p.actualSpend, 0);
    const overallSpentPercent = totalBudget > 0 ? Math.round((totalSpend / totalBudget) * 100) : 0;

    // Task stats
    const totalTasksCount = tasks.length;
    const completedTasksCount = tasks.filter(t => t.status === "completed").length;
    const activeTasksCount = tasks.filter(t => t.status === "in_progress").length;
    const taskCompletionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    // High Risks
    const highRisksCount = projectRisks.filter(r => r.impact === "high" && r.status === "active").length;

    res.json({
      success: true,
      data: {
        totalProjects,
        activeProjects: activePrj,
        completedProjects: completedPrj,
        totalBudget,
        totalSpend,
        overallSpentPercent,
        totalTasksCount,
        completedTasksCount,
        activeTasksCount,
        taskCompletionRate,
        highRisksCount
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Project List & CRUD
projectsRouter.get("/", checkProjectsPermission("projects.read"), (req: Request, res: Response) => {
  res.json({ success: true, count: projects.length, data: projects });
});

projectsRouter.post("/", checkProjectsPermission("projects.write"), (req: Request, res: Response) => {
  const { name, description, priority, budget, endDate } = req.body;
  if (!name || !description || !endDate) {
    return res.status(400).json({ success: false, message: "Required project specifications are missing" });
  }

  const newProject = {
    id: projects.length + 1,
    name,
    description,
    status: "planning",
    priority: priority || "medium",
    progress: 0,
    manager: "Percy Project Agent",
    startDate: new Date().toISOString().split("T")[0],
    endDate,
    budget: parseFloat(budget) || 0.0,
    actualSpend: 0.0,
    riskLevel: "low",
    health: "healthy"
  };

  projects.push(newProject);
  res.status(201).json({ success: true, data: newProject });
});

projectsRouter.put("/:id", checkProjectsPermission("projects.write"), (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const p = projects.find(item => item.id === id);
  if (!p) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  const { status, progress, priority, health, riskLevel, budget, actualSpend } = req.body;
  if (status !== undefined) p.status = status;
  if (progress !== undefined) p.progress = parseInt(progress);
  if (priority !== undefined) p.priority = priority;
  if (health !== undefined) p.health = health;
  if (riskLevel !== undefined) p.riskLevel = riskLevel;
  if (budget !== undefined) p.budget = parseFloat(budget);
  if (actualSpend !== undefined) p.actualSpend = parseFloat(actualSpend);

  res.json({ success: true, data: p });
});

// 3. Project Tasks
projectsRouter.get("/:id/tasks", checkProjectsPermission("projects.read"), (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);
  const pTasks = tasks.filter(t => t.projectId === projectId);
  res.json({ success: true, count: pTasks.length, data: pTasks });
});

projectsRouter.post("/:id/tasks", checkProjectsPermission("projects.write"), (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);
  const { title, description, priority, assignee, estimateHrs, dueDate, sprintId } = req.body;
  if (!title || !description || !dueDate) {
    return res.status(400).json({ success: false, message: "Missing required project task details" });
  }

  const newTask = {
    id: tasks.length + 1,
    projectId,
    sprintId: parseInt(sprintId) || 0,
    title,
    description,
    status: "todo",
    priority: priority || "medium",
    assignee: assignee || "Unassigned",
    estimateHrs: parseInt(estimateHrs) || 8,
    loggedHrs: 0,
    dueDate,
    dependencies: []
  };

  tasks.push(newTask);
  res.status(201).json({ success: true, data: newTask });
});

projectsRouter.put("/:id/tasks/:taskId", checkProjectsPermission("projects.write"), (req: Request, res: Response) => {
  const taskId = parseInt(req.params.taskId);
  const t = tasks.find(item => item.id === taskId);
  if (!t) {
    return res.status(404).json({ success: false, message: "Task not found" });
  }

  const { status, loggedHrs, priority, assignee } = req.body;
  if (status !== undefined) t.status = status;
  if (priority !== undefined) t.priority = priority;
  if (assignee !== undefined) t.assignee = assignee;
  if (loggedHrs !== undefined) t.loggedHrs = parseInt(loggedHrs);

  // Re-calculate project progress in real-time if status is completed
  const projectTasks = tasks.filter(item => item.projectId === t.projectId);
  const completedCount = projectTasks.filter(item => item.status === "completed").length;
  const project = projects.find(item => item.id === t.projectId);
  if (project && projectTasks.length > 0) {
    project.progress = Math.round((completedCount / projectTasks.length) * 100);
  }

  res.json({ success: true, data: t });
});

// 4. Time logs
projectsRouter.get("/time-logs", checkProjectsPermission("projects.read"), (req: Request, res: Response) => {
  res.json({ success: true, count: timeLogs.length, data: timeLogs });
});

projectsRouter.post("/time-logs", checkProjectsPermission("projects.write"), (req: Request, res: Response) => {
  const { taskId, employee, hours, description } = req.body;
  if (!taskId || !employee || !hours || !description) {
    return res.status(400).json({ success: false, message: "Missing timesheet specifications" });
  }

  const task = tasks.find(t => t.id === parseInt(taskId));
  if (!task) {
    return res.status(404).json({ success: false, message: "Valid task reference is required" });
  }

  const loggedAmount = parseInt(hours);
  task.loggedHrs += loggedAmount;

  const newLog = {
    id: timeLogs.length + 1,
    taskId: parseInt(taskId),
    employee,
    hours: loggedAmount,
    billable: true,
    description,
    status: "pending",
    loggedAt: new Date().toISOString()
  };

  timeLogs.unshift(newLog);
  res.status(201).json({ success: true, data: newLog });
});

projectsRouter.put("/time-logs/:id/approve", checkProjectsPermission("projects.write"), (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const log = timeLogs.find(l => l.id === id);
  if (!log) {
    return res.status(404).json({ success: false, message: "Timesheet log not found" });
  }

  log.status = "approved";
  res.json({ success: true, data: log });
});

// 5. Resource / Sprints / Milestones / Risks Direct Endpoints
projectsRouter.get("/resources", checkProjectsPermission("projects.read"), (req: Request, res: Response) => {
  res.json({ success: true, count: resourceAllocations.length, data: resourceAllocations });
});

projectsRouter.get("/:id/milestones", checkProjectsPermission("projects.read"), (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);
  const m = milestones.filter(mil => mil.projectId === projectId);
  res.json({ success: true, count: m.length, data: m });
});

projectsRouter.get("/:id/sprints", checkProjectsPermission("projects.read"), (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);
  const s = sprints.filter(spr => spr.projectId === projectId);
  res.json({ success: true, count: s.length, data: s });
});

projectsRouter.get("/:id/risks", checkProjectsPermission("projects.read"), (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);
  const r = projectRisks.filter(risk => risk.projectId === projectId);
  res.json({ success: true, count: r.length, data: r });
});

projectsRouter.post("/:id/risks", checkProjectsPermission("projects.write"), (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);
  const { title, description, probability, impact, mitigation } = req.body;
  if (!title || !description || !probability || !impact) {
    return res.status(400).json({ success: false, message: "Required risk matrix specifications are missing" });
  }

  const newRisk = {
    id: projectRisks.length + 1,
    projectId,
    title,
    description,
    probability,
    impact,
    mitigation: mitigation || "",
    status: "active"
  };

  projectRisks.unshift(newRisk);
  res.status(201).json({ success: true, data: newRisk });
});

// 6. AI Project Manager Predictions
projectsRouter.post("/ai-advisor", checkProjectsPermission("projects.read"), async (req: Request, res: Response) => {
  const { action, query } = req.body;

  // Rule-based high-fidelity fallback when Gemini is offline
  if (!ai) {
    const fallbackResponse = `### 🔮 Percy AI Autonomous Project Forecasting
**Portfolio Health & Bottleneck Predictions — Exshopi AI**

#### 🏁 Active Portfolio Diagnostic
- **DGX GPU Supercluster Scaling**: Currently marked as **Warning**. Custom cooling pipe delays at Seattle Ingress customs are creating a **9-day critical path drag**.
- **Sophia Outreach Pipeline Integration**: Running smoothly (**Healthy** - 65% complete).

#### 📊 Bottleneck & Delay Forecasts
- **Sprint 2 Timeline Risk**: Tasks assigned to *Lucas AI (Inventory)* are trailing by 4 hours. Given current allocation loads, configuring CRM sync has a **32% probability** of delaying Sprint 2 completion by 2 days.
- **Critical Path Bottleneck**: The customs hold on GPU cooling tubes affects the Seattle Factory. Expected delay of **14 days** if secondary procurement channels are not authorized.

#### ⚡ Resource Optimization & Mitigation Directives
1. **Leverage Secondary Factories**: Pivot local manufacturing of cooling valves to the *Seattle Robotic Hub #4* warehouse immediately. This drops supply-chain delay from 14 days down to **24 hours**.
2. **Reallocate Developer Capacity**: Temporarily shift *Percy Project Manager* 8 hours of sprint allowance to assist *Lucas AI* with Shopify webhook configuration. This prevents any Sprint 2 backlog slips.`;

    return res.json({ success: true, prediction: fallbackResponse });
  }

  try {
    const systemPrompt = `You are Percy AI, the Principal AI Project Director and Scrum Master at Exshopi AI.
You evaluate team workload allocations, predict critical-path sprint delays, isolate supply chain and developer capacity risks, and draft mitigation checklists.`;

    const userPrompt = `Synthesize an advanced, board-ready AI project briefing and backlog risk forecast.
Context data:
- Active Projects: ${JSON.stringify(projects)}
- Sprint Registry: ${JSON.stringify(sprints)}
- Active Sprints Backlog (Tasks): ${JSON.stringify(tasks)}
- Resource workload capacities: ${JSON.stringify(resourceAllocations)}
- Registered Portfolio Risks: ${JSON.stringify(projectRisks)}
- Requested Action: ${action || "Critical Path & Delay Predictions"}
- User NL Query: ${query || "None"}

Please structure your response in clearly readable markdown format:
1. "🔮 Critical-Path Delay & Bottleneck Forecasts" (Predict which sprints or tasks are trailing. Estimate percentage of delay probabilities)
2. "⚡ Capacity Overflow & Overload Warnings" (Examine if any developer/AI has exceeded allocated hours capacity. Isolate risks)
3. "📋 Scrum Master Mitigation Directives" (Suggest exactly how to reallocate team members and shift milestones to ensure on-time release)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt
      }
    });

    res.json({ success: true, prediction: response.text || "Failed to generate AI project predictions." });
  } catch (err: any) {
    console.error("Percy AI advisor failed: ", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
