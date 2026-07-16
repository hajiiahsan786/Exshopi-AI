import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Card, Button, Input, Select, Badge } from "./UI";
import {
  FolderKanban,
  CheckSquare,
  Milestone,
  Calendar,
  Clock,
  AlertTriangle,
  Bot,
  Sparkles,
  Plus,
  RefreshCw,
  Loader2,
  Users,
  Timer,
  Play,
  CheckCircle,
  TrendingUp,
  LayoutGrid,
  ShieldAlert,
  Search,
  UserCheck,
  ChevronRight,
  PlusCircle,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell
} from "recharts";

export const EnterpriseProjects: React.FC = () => {
  const { addLog, addNotification } = useStore();
  const [activeTab, setActiveTab] = useState<"portfolio" | "kanban" | "gantt" | "workload" | "timesheets" | "aiScrum">("portfolio");

  // Core Projects State
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [timeLogsList, setTimeLogsList] = useState<any[]>([]);
  const [resourcesList, setResourcesList] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [activeMilestones, setActiveMilestones] = useState<any[]>([]);
  const [activeSprints, setActiveSprints] = useState<any[]>([]);
  const [activeRisks, setActiveRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Visibility
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);
  const [showAddRisk, setShowAddRisk] = useState(false);

  // Form States
  const [projectForm, setProjectForm] = useState({ name: "", description: "", priority: "medium", budget: "", endDate: "" });
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "medium", assignee: "Sophia AI (Sales Pro)", estimateHrs: "", dueDate: "", sprintId: "" });
  const [timeLogForm, setTimeLogForm] = useState({ taskId: "", employee: "Percy Project Agent", hours: "", description: "" });
  const [riskForm, setRiskForm] = useState({ title: "", description: "", probability: "medium", impact: "medium", mitigation: "" });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filters & Searching
  const [taskSearch, setTaskSearch] = useState("");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("all");

  // AI Assistant States
  const [advisorAction, setAdvisorAction] = useState("predictions");
  const [advisorQuery, setAdvisorQuery] = useState("");
  const [advisorOutput, setAdvisorOutput] = useState<string | null>(null);
  const [advisorLoading, setAdvisorLoading] = useState(false);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const [resDash, resPrj, resLogs, resRes] = await Promise.all([
        fetch("/api/v1/projects/dashboard"),
        fetch("/api/v1/projects"),
        fetch("/api/v1/projects/time-logs"),
        fetch("/api/v1/projects/resources")
      ]);

      const [dashJson, prjJson, logsJson, resJson] = await Promise.all([
        resDash.json(),
        resPrj.json(),
        resLogs.json(),
        resRes.json()
      ]);

      if (dashJson.success) setDashboardMetrics(dashJson.data);
      if (prjJson.success) setProjectsList(prjJson.data);
      if (logsJson.success) setTimeLogsList(logsJson.data);
      if (resJson.success) setResourcesList(resJson.data);

      // Default load project sub-resources for selectedProjectId
      if (selectedProjectId) {
        await fetchProjectSubResources(selectedProjectId);
      }

    } catch (e) {
      console.error("Project Sync Fail: ", e);
      addNotification({
        title: "Project Sync Error",
        description: "Failed to connect to Exshopi Project Workspace APIs.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectSubResources = async (projId: number) => {
    try {
      const [resTasks, resMiles, resSprints, resRisks] = await Promise.all([
        fetch(`/api/v1/projects/${projId}/tasks`),
        fetch(`/api/v1/projects/${projId}/milestones`),
        fetch(`/api/v1/projects/${projId}/sprints`),
        fetch(`/api/v1/projects/${projId}/risks`)
      ]);

      const [tasksJson, milesJson, sprintsJson, risksJson] = await Promise.all([
        resTasks.json(),
        resMiles.json(),
        resSprints.json(),
        resRisks.json()
      ]);

      if (tasksJson.success) setTasksList(tasksJson.data);
      if (milesJson.success) setActiveMilestones(milesJson.data);
      if (sprintsJson.success) setActiveSprints(sprintsJson.data);
      if (risksJson.success) setActiveRisks(risksJson.data);

    } catch (err) {
      console.error("Sub-resource retrieval fail: ", err);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectSubResources(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Project Post Operations
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!projectForm.name) errors.name = "Project name required";
    if (!projectForm.description) errors.description = "Scope description is required";
    if (!projectForm.endDate) errors.endDate = "Target end date required";
    if (!projectForm.budget || isNaN(Number(projectForm.budget))) errors.budget = "Enter a numeric budget";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch("/api/v1/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectForm)
      });
      const data = await response.json();
      if (data.success) {
        addNotification({ title: "Project Initialized", description: `Created project: ${projectForm.name}`, type: "success" });
        addLog({ method: "POST", endpoint: "/api/v1/projects", status: 201, type: "api", payload: projectForm, response: data });
        setShowAddProject(false);
        setProjectForm({ name: "", description: "", priority: "medium", budget: "", endDate: "" });
        fetchProjectData();
      }
    } catch (err: any) {
      addNotification({ title: "API failure", description: err.message, type: "error" });
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!taskForm.title) errors.title = "Task title is required";
    if (!taskForm.description) errors.description = "Task description required";
    if (!taskForm.dueDate) errors.dueDate = "Settle target due date required";
    if (!taskForm.estimateHrs || isNaN(Number(taskForm.estimateHrs))) errors.estimateHrs = "Enter numeric estimated hours";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch(`/api/v1/projects/${selectedProjectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskForm)
      });
      const data = await response.json();
      if (data.success) {
        addNotification({ title: "Sprint Task Added", description: `Added backlog item: ${taskForm.title}`, type: "success" });
        addLog({ method: "POST", endpoint: `/api/v1/projects/${selectedProjectId}/tasks`, status: 201, type: "api", payload: taskForm, response: data });
        setShowAddTask(false);
        setTaskForm({ title: "", description: "", priority: "medium", assignee: "Sophia AI (Sales Pro)", estimateHrs: "", dueDate: "", sprintId: "" });
        fetchProjectSubResources(selectedProjectId);
      }
    } catch (err: any) {
      addNotification({ title: "Task Failure", description: err.message, type: "error" });
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, status: string) => {
    try {
      const response = await fetch(`/api/v1/projects/${selectedProjectId}/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        addNotification({ title: "Kanban Updated", description: `Moved task to ${status}`, type: "success" });
        fetchProjectSubResources(selectedProjectId);
        fetchProjectData(); // reload progress on overview metrics
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostTimeLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!timeLogForm.taskId) errors.taskId = "Select target task";
    if (!timeLogForm.hours || isNaN(Number(timeLogForm.hours))) errors.hours = "Enter numeric hours";
    if (!timeLogForm.description) errors.description = "What was accomplished description required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch("/api/v1/projects/time-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(timeLogForm)
      });
      const data = await response.json();
      if (data.success) {
        addNotification({ title: "Timesheet Logged", description: `Clocked ${timeLogForm.hours} hours. Timesheet pending approval.`, type: "success" });
        addLog({ method: "POST", endpoint: "/api/v1/projects/time-logs", status: 201, type: "api", payload: timeLogForm, response: data });
        setShowAddLog(false);
        setTimeLogForm({ taskId: "", employee: "Percy Project Agent", hours: "", description: "" });
        fetchProjectData();
      }
    } catch (err: any) {
      addNotification({ title: "Timesheet error", description: err.message, type: "error" });
    }
  };

  const handleApproveTimeLog = async (id: number) => {
    try {
      const response = await fetch(`/api/v1/projects/time-logs/${id}/approve`, {
        method: "PUT"
      });
      const data = await response.json();
      if (data.success) {
        addNotification({ title: "Timesheet Approved", description: `Logged hours successfully credited to billable payroll.`, type: "success" });
        fetchProjectData();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleAddRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!riskForm.title) errors.title = "Risk descriptor is required";
    if (!riskForm.description) errors.description = "Risk details required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch(`/api/v1/projects/${selectedProjectId}/risks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(riskForm)
      });
      const data = await response.json();
      if (data.success) {
        addNotification({ title: "Risk Logged", description: `Appended risk matrix parameters.`, type: "success" });
        setShowAddRisk(false);
        setRiskForm({ title: "", description: "", probability: "medium", impact: "medium", mitigation: "" });
        fetchProjectSubResources(selectedProjectId);
      }
    } catch (err: any) {
      addNotification({ title: "Risk Failure", description: err.message, type: "error" });
    }
  };

  const triggerAiAdvisor = async () => {
    setAdvisorLoading(true);
    setAdvisorOutput(null);
    try {
      const response = await fetch("/api/v1/projects/ai-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: advisorAction, query: advisorQuery })
      });
      const data = await response.json();
      if (data.success) {
        setAdvisorOutput(data.prediction);
        addLog({
          method: "POST",
          endpoint: "/api/v1/projects/ai-advisor",
          status: 200,
          type: "api",
          payload: { action: advisorAction, query: advisorQuery },
          response: { textLength: data.prediction.length }
        });
      }
    } catch (e: any) {
      addNotification({ title: "Percy AI Offline", description: e.message, type: "error" });
    } finally {
      setAdvisorLoading(false);
    }
  };

  // Filters for Sprint Tasks
  const filteredTasks = tasksList.filter(t => {
    const term = taskSearch.toLowerCase();
    const matchesSearch = t.title.toLowerCase().includes(term) || t.assignee.toLowerCase().includes(term);
    const matchesPriority = taskPriorityFilter === "all" ? true : t.priority === taskPriorityFilter;
    return matchesSearch && matchesPriority;
  });

  // Recharts capacity bars
  const capacityChartData = resourcesList.map(r => ({
    name: r.employee.split(" ")[0],
    Allocated: r.allocatedHours,
    Capacity: r.capacityHours
  }));

  const selectedProj = projectsList.find(p => p.id === selectedProjectId);

  if (loading && !dashboardMetrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-zinc-400 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-500" />
        <span className="text-xs uppercase tracking-wider font-mono">Synchronizing Sprints Backlog...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/40 p-6 border border-zinc-800/80 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Percy Scrum Boards & Projects</h1>
            <Badge variant="accent">Percy AI Scrum Master</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Dynamic Gantt dependencies tracking, backlog sprints planning, timesheet logging approvals, and Percy AI scrum slip predictions.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={fetchProjectData}>
            Sync Sprints
          </Button>
          <Button variant="outline" size="sm" icon={<Timer className="h-3.5 w-3.5" />} onClick={() => setShowAddLog(true)}>
            Record Timesheet
          </Button>
          <Button variant="primary" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowAddProject(true)}>
            Initialize Project
          </Button>
        </div>
      </div>

      {/* Target Project Selector Dropdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-950/40 p-4 border border-zinc-900 rounded-xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider shrink-0 font-mono">Active Target:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs py-1.5 px-3 rounded-lg focus:outline-none w-full sm:w-64 font-semibold"
          >
            {projectsList.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.progress}% Complete)
              </option>
            ))}
          </select>
        </div>
        {selectedProj && (
          <div className="flex items-center gap-3 text-2xs text-zinc-400 font-mono">
            <span>BUDGET: <strong className="text-zinc-200">${selectedProj.budget.toLocaleString()}</strong></span>
            <span>•</span>
            <span>SPENT: <strong className="text-zinc-200">${selectedProj.actualSpend.toLocaleString()}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              HEALTH: 
              <Badge variant={selectedProj.health === "healthy" ? "success" : "warning"}>{selectedProj.health}</Badge>
            </span>
          </div>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-zinc-800/80 gap-1 overflow-x-auto pb-px">
        {[
          { id: "portfolio", label: "Portfolio Board", icon: <LayoutGrid className="h-4 w-4" /> },
          { id: "kanban", label: "Kanban Tasks", icon: <CheckSquare className="h-4 w-4" /> },
          { id: "gantt", label: "Gantt Timeline", icon: <Calendar className="h-4 w-4" /> },
          { id: "workload", label: "Team Workload", icon: <Users className="h-4 w-4" /> },
          { id: "timesheets", label: "Timesheet Logs", icon: <Clock className="h-4 w-4" /> },
          { id: "aiScrum", label: "AI Scrum Master", icon: <Sparkles className="h-4 w-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              if (tab.id === "aiScrum" && !advisorOutput) triggerAiAdvisor();
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === tab.id
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[400px]">
        {activeTab === "portfolio" && selectedProj && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Active Portfolio</span>
                    <h3 className="text-xl font-bold text-zinc-100 mt-1">
                      {dashboardMetrics?.activeProjects || 0} / {dashboardMetrics?.totalProjects || 0}
                    </h3>
                  </div>
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-[10px] text-indigo-400 mt-2 flex items-center gap-1 font-mono">
                  <span>Timelines fully committed</span>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Commitment Progress</span>
                    <h3 className="text-xl font-bold text-zinc-100 mt-1">
                      {selectedProj.progress}%
                    </h3>
                  </div>
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="w-full bg-zinc-900 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${selectedProj.progress}%` }} />
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Burn Rate Cost Variance</span>
                    <h3 className="text-xl font-bold text-zinc-100 mt-1">
                      ${selectedProj.actualSpend.toLocaleString()}
                    </h3>
                  </div>
                  <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-[10px] text-zinc-500 mt-2 font-mono">
                  BUDGET CEILING: ${selectedProj.budget.toLocaleString()}
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Active Portfolio Risks</span>
                    <h3 className="text-xl font-bold text-zinc-100 mt-1">
                      {activeRisks.filter(r => r.status === "active").length} Logs
                    </h3>
                  </div>
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-[10px] text-amber-400 mt-2 flex items-center gap-1 font-mono">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{activeRisks.filter(r => r.impact === "high" && r.status === "active").length} High Impact Risks</span>
                </div>
              </Card>
            </div>

            {/* Split Sprints & Milestones */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sprints backlog timeline */}
              <Card className="lg:col-span-2 p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Active Sprint Iterations</h3>
                    <p className="text-[10px] text-zinc-500">Agile sprints and release commitments schedules.</p>
                  </div>
                  <Badge variant="accent">Q3 Sprints Schedule</Badge>
                </div>

                <div className="space-y-3">
                  {activeSprints.map(sp => (
                    <div key={sp.id} className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-2xs">
                      <div>
                        <span className="font-semibold text-zinc-200 block">{sp.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">TIMELINE: {sp.startDate} to {sp.endDate}</span>
                      </div>
                      <Badge variant={sp.status === "completed" ? "success" : sp.status === "active" ? "accent" : "neutral"}>
                        {sp.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Milestones checklists */}
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-3">
                  <Milestone className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Project Milestones</h3>
                </div>

                <div className="space-y-4">
                  {activeMilestones.map(mil => (
                    <div key={mil.id} className="flex items-start gap-2.5 text-2xs">
                      <div className={`p-1 rounded mt-0.5 ${mil.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>
                        <CheckCircle className="h-3.5 w-3.5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className={`font-semibold block ${mil.status === "completed" ? "text-zinc-400 line-through" : "text-zinc-200"}`}>
                          {mil.title}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">DUE TARGET: {mil.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === "kanban" && selectedProj && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Search & Backlog Creation */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-zinc-950/40 p-4 border border-zinc-900 rounded-xl">
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search sprint tasks, assignees..."
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 text-zinc-200 text-2xs py-1.5 pl-8 pr-3 rounded-lg focus:outline-none"
                  />
                </div>
                <select
                  value={taskPriorityFilter}
                  onChange={(e) => setTaskPriorityFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-850 text-zinc-400 text-2xs py-1.5 px-3 rounded-lg"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
              <Button variant="outline" size="sm" icon={<PlusCircle className="h-3.5 w-3.5" />} className="w-full sm:w-auto" onClick={() => setShowAddTask(true)}>
                Add Sprint Task
              </Button>
            </div>

            {/* Kanban Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {["todo", "in_progress", "review", "completed"].map((col) => {
                const colTasks = filteredTasks.filter(t => t.status === col);
                return (
                  <div key={col} className="bg-zinc-950/20 border border-zinc-900 p-4 rounded-2xl space-y-4 min-h-[400px]">
                    <div className="flex justify-between items-center border-b border-zinc-850 pb-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                        {col === "todo" ? "Sprint Backlog" : col === "in_progress" ? "In Flight" : col === "review" ? "AI Audit Review" : "Completed"}
                      </span>
                      <Badge variant="neutral">{colTasks.length}</Badge>
                    </div>

                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                      {colTasks.map(task => (
                        <Card key={task.id} className="p-4 space-y-3 cursor-grab hover:border-zinc-700/50">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-semibold text-zinc-200 leading-snug">{task.title}</h4>
                            <Badge variant={task.priority === "high" ? "error" : task.priority === "medium" ? "warning" : "neutral"}>
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-zinc-400 leading-relaxed">{task.description}</p>
                          
                          <div className="border-t border-zinc-850/50 pt-2.5 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                            <span>Assigned: <strong className="text-zinc-300">{task.assignee.split(" ")[0]}</strong></span>
                            <span>Est: {task.estimateHrs}h / Logged: {task.loggedHrs}h</span>
                          </div>

                          {/* Quick drag/click controls */}
                          <div className="flex justify-end gap-1 pt-1 border-t border-zinc-850/30">
                            {col !== "todo" && (
                              <button
                                onClick={() => handleUpdateTaskStatus(task.id, col === "in_progress" ? "todo" : col === "review" ? "in_progress" : "review")}
                                className="text-[9px] hover:underline text-zinc-500"
                              >
                                🡠 Back
                              </button>
                            )}
                            {col !== "completed" && (
                              <button
                                onClick={() => handleUpdateTaskStatus(task.id, col === "todo" ? "in_progress" : col === "in_progress" ? "review" : "completed")}
                                className="text-[9px] hover:underline text-indigo-400 font-bold ml-2"
                              >
                                Move Next 🡢
                              </button>
                            )}
                          </div>
                        </Card>
                      ))}

                      {colTasks.length === 0 && (
                        <div className="text-center py-8 text-zinc-600 text-[10px] font-mono">
                          Column Empty
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === "gantt" && selectedProj && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Custom Interactive Gantt Plot */}
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Sprint Tasks Gantt Schedule Chart</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Visual timeline of core milestones and dependencies tracking.</p>
              </div>

              <div className="space-y-4 border border-zinc-900 p-4 rounded-xl overflow-x-auto">
                {tasksList.map((task, index) => {
                  // Simulate start offset and duration percentages for visual timeline
                  const startOffsetPercent = 10 + (index * 12) % 40;
                  const durationPercent = 20 + (task.estimateHrs * 2) % 40;
                  
                  return (
                    <div key={task.id} className="grid grid-cols-12 gap-2 items-center text-2xs min-w-[650px] py-1 border-b border-zinc-900/30">
                      <div className="col-span-3 font-semibold text-zinc-200 truncate">
                        {task.title}
                      </div>
                      <div className="col-span-2 font-mono text-zinc-500 truncate">
                        {task.assignee.split(" ")[0]} ({task.dueDate})
                      </div>
                      <div className="col-span-7 bg-zinc-950 h-7 rounded-lg overflow-hidden relative flex items-center pr-3">
                        <div
                          className="absolute h-4 rounded-md flex items-center px-2 text-[9px] font-bold text-white shadow-md font-mono"
                          style={{
                            left: `${startOffsetPercent}%`,
                            width: `${durationPercent}%`,
                            backgroundColor: task.status === "completed" ? "#10b981" : task.status === "review" ? "#6366f1" : task.status === "in_progress" ? "#f59e0b" : "#27272a",
                            border: task.status === "todo" ? "1px solid #3f3f46" : "none"
                          }}
                        >
                          <span className="truncate">{task.estimateHrs} hrs</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex gap-4 justify-center text-[9px] font-mono text-zinc-500 pt-2">
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded bg-zinc-700 border border-zinc-600" /><span>Backlog (Todo)</span></div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded bg-amber-500" /><span>In Progress</span></div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded bg-indigo-500" /><span>Review Stage</span></div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded bg-emerald-500" /><span>Completed</span></div>
              </div>
            </Card>

            {/* Risk Mitigation Register */}
            <Card className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Project Risk Register</h3>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-2xs py-1" onClick={() => setShowAddRisk(true)}>
                  + Log Project Risk
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeRisks.map(risk => (
                  <div key={risk.id} className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-2 text-2xs">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-semibold text-zinc-200 leading-snug">{risk.title}</h4>
                      <Badge variant={risk.impact === "high" ? "error" : "warning"}>
                        Impact: {risk.impact}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-zinc-400">{risk.description}</p>
                    <div className="pt-2 border-t border-zinc-900 flex justify-between items-center">
                      <span className="font-mono text-[9px] text-zinc-500 uppercase">PROBABILITY: {risk.probability}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Mitigation: {risk.mitigation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === "workload" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Resource Capacity Chart */}
              <Card className="lg:col-span-2 p-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Team Capacity Allocation vs Maximum Ceiling</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Audit developer availability constraints to prevent burn-out slips.</p>
                </div>

                <div className="h-[250px] mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={capacityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 10 }} stroke="#27272a" />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} stroke="#27272a" />
                      <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46" }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="Allocated" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Capacity" fill="#18181b" stroke="#3f3f46" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Resource List Detail */}
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-3">
                  <Users className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Resource Registry</h3>
                </div>

                <div className="space-y-3">
                  {resourcesList.map(res => {
                    const usagePercent = Math.round((res.allocatedHours / res.capacityHours) * 100);
                    return (
                      <div key={res.id} className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-2 text-2xs">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-zinc-200 block">{res.employee}</span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">{res.title}</span>
                          </div>
                          <Badge variant={usagePercent > 85 ? "error" : "success"}>
                            {usagePercent}% Load
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                            <span>Committed: {res.allocatedHours} hrs</span>
                            <span>Max Cap: {res.capacityHours} hrs</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${usagePercent > 85 ? "bg-rose-500" : "bg-indigo-500"}`}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === "timesheets" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Timesheets List */}
            <Card className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Team Billable Timesheet Registry</h3>
                  <p className="text-[10px] text-zinc-500">Clock timesheet records, audit active sprint times, and approve payroll logs.</p>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-2xs py-1" onClick={() => setShowAddLog(true)}>
                  + Log Timesheet Hours
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/30 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      <th className="py-2.5 px-3">CLOCK DATE</th>
                      <th className="py-2.5 px-3">TEAM MEMBER</th>
                      <th className="py-2.5 px-3">ACCOMPLISHED WORK DETAILS</th>
                      <th className="py-2.5 px-3 text-right">HOURS</th>
                      <th className="py-2.5 px-3 text-center">TYPE</th>
                      <th className="py-2.5 px-3 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {timeLogsList.map(log => (
                      <tr key={log.id} className="text-2xs hover:bg-zinc-900/10 text-zinc-300">
                        <td className="py-3 px-3 font-mono text-zinc-500 text-[10px]">{log.loggedAt.split("T")[0]}</td>
                        <td className="py-3 px-3 font-semibold text-zinc-200">{log.employee}</td>
                        <td className="py-3 px-3 text-zinc-400 font-medium">{log.description}</td>
                        <td className="py-3 px-3 text-right font-mono text-zinc-100 font-bold">{log.hours} hrs</td>
                        <td className="py-3 px-3 text-center font-mono text-zinc-500 text-[10px]">Billable</td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Badge variant={log.status === "approved" ? "success" : "warning"}>
                              {log.status}
                            </Badge>
                            {log.status !== "approved" && (
                              <button
                                onClick={() => handleApproveTimeLog(log.id)}
                                className="text-[10px] text-emerald-400 hover:underline font-mono"
                              >
                                Approve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === "aiScrum" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Query config */}
              <Card className="p-6 h-fit space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
                  <Bot className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Percy Scrum Director</h3>
                </div>

                <div className="space-y-4">
                  <Select
                    label="Agile Scrum Analytical Action"
                    options={[
                      { value: "predictions", label: "Delay Predictions & Critical Path slips" },
                      { value: "workload", label: "Developer Resource Cap Overload Alert" },
                      { value: "reallocate", label: "Auto-reallocate Sprint capacity" }
                    ]}
                    value={advisorAction}
                    onChange={(e) => {
                      setAdvisorAction(e.target.value);
                      setAdvisorOutput(null);
                    }}
                  />

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Sprint NL Query</label>
                    <input
                      type="text"
                      placeholder="e.g. Will Lucas AI delay Sprint 2 sync..."
                      value={advisorQuery}
                      onChange={(e) => setAdvisorQuery(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs py-2 px-3 rounded-lg focus:outline-none"
                    />
                  </div>

                  <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                    Percy AI audits remaining sprint backlogs, developer hour capacities, and customs delays to calculate slips via the server Gemini key.
                  </p>

                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={triggerAiAdvisor}
                    loading={advisorLoading}
                    icon={<Sparkles className="h-4 w-4" />}
                  >
                    Analyze Critical Path Slips
                  </Button>
                </div>
              </Card>

              {/* AI Forecast output */}
              <Card className="lg:col-span-2 p-6 min-h-[350px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">Percy Sprint Delay Risk brief</span>
                    <Badge variant="accent">Gemini 3.5 Flash Active</Badge>
                  </div>

                  <div className="mt-4 text-zinc-300 text-2xs leading-relaxed space-y-2 whitespace-pre-line overflow-y-auto max-h-[380px] font-mono">
                    {advisorOutput ? (
                      advisorOutput
                    ) : advisorLoading ? (
                      <div className="flex flex-col items-center justify-center min-h-[220px] text-zinc-500 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                        <span className="font-mono text-[10px] uppercase tracking-wider">Percy AI SCRUM algorithms computing backlog delays...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[220px] text-zinc-600 text-center space-y-2">
                        <Sparkles className="h-8 w-8 text-zinc-700" />
                        <p>Adjust scrum parameters and click 'Analyze' to compute predictive delay parameters.</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </div>

      {/* MODAL DIALOGS */}

      {/* 1. Initialize Project Modal */}
      <AnimatePresence>
        {showAddProject && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm">
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Initialize Project</h3>
                  <button onClick={() => setShowAddProject(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                </div>

                <form onSubmit={handleAddProject} className="space-y-4 text-2xs">
                  <Input
                    label="Project Name"
                    placeholder="e.g. Seattle Warehouse Robotics Expansion"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    error={formErrors.name}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Q3 Allocation Budget (USD)"
                      placeholder="e.g. 75000"
                      value={projectForm.budget}
                      onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                      error={formErrors.budget}
                    />
                    <Input
                      label="Target End Date"
                      type="date"
                      value={projectForm.endDate}
                      onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                      error={formErrors.endDate}
                    />
                  </div>

                  <Select
                    label="Portfolio Priority"
                    options={[
                      { value: "low", label: "Low Priority" },
                      { value: "medium", label: "Medium Priority" },
                      { value: "high", label: "High Priority" }
                    ]}
                    value={projectForm.priority}
                    onChange={(e) => setProjectForm({ ...projectForm, priority: e.target.value })}
                  />

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Scope Statement Description</label>
                    <textarea
                      placeholder="Enter the comprehensive deliverables and scope statement details..."
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      rows={2}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs py-2 px-3 rounded-lg focus:outline-none"
                    />
                    {formErrors.description && <span className="text-[10px] text-rose-400">{formErrors.description}</span>}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                    <Button variant="outline" size="sm" onClick={() => setShowAddProject(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Initialize Project</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Add Sprint Task Modal */}
      <AnimatePresence>
        {showAddTask && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm">
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Add Sprint Task</h3>
                  <button onClick={() => setShowAddTask(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                </div>

                <form onSubmit={handleAddTask} className="space-y-4 text-2xs">
                  <Input
                    label="Task Title"
                    placeholder="e.g. Audit SOC-2 database parameters"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    error={formErrors.title}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Estimated Hours"
                      placeholder="e.g. 16"
                      value={taskForm.estimateHrs}
                      onChange={(e) => setTaskForm({ ...taskForm, estimateHrs: e.target.value })}
                      error={formErrors.estimateHrs}
                    />
                    <Input
                      label="Task Due Date"
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      error={formErrors.dueDate}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="Sprint Iteration"
                      options={[
                        { value: "", label: "No Sprint Iteration" },
                        ...activeSprints.map(s => ({ value: String(s.id), label: s.name }))
                      ]}
                      value={taskForm.sprintId}
                      onChange={(e) => setTaskForm({ ...taskForm, sprintId: e.target.value })}
                    />
                    <Select
                      label="Assignee"
                      options={resourcesList.map(r => ({ value: r.employee, label: r.employee.split(" ")[0] }))}
                      value={taskForm.assignee}
                      onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                    />
                  </div>

                  <Select
                    label="Task Priority"
                    options={[
                      { value: "low", label: "Low Priority" },
                      { value: "medium", label: "Medium Priority" },
                      { value: "high", label: "High Priority" }
                    ]}
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  />

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Task Scope Description</label>
                    <textarea
                      placeholder="Provide precise execution guidelines for the assigned worker..."
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      rows={2}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs py-2 px-3 rounded-lg focus:outline-none"
                    />
                    {formErrors.description && <span className="text-[10px] text-rose-400">{formErrors.description}</span>}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                    <Button variant="outline" size="sm" onClick={() => setShowAddTask(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Commit Sprint Task</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Record Timesheet Modal */}
      <AnimatePresence>
        {showAddLog && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm">
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Log Timesheet Hours</h3>
                  <button onClick={() => setShowAddLog(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                </div>

                <form onSubmit={handlePostTimeLog} className="space-y-4 text-2xs">
                  <Select
                    label="Task Reference"
                    options={[
                      { value: "", label: "Select project task..." },
                      ...tasksList.map(t => ({ value: String(t.id), label: `${t.title} (${t.assignee.split(" ")[0]})` }))
                    ]}
                    value={timeLogForm.taskId}
                    onChange={(e) => setTimeLogForm({ ...timeLogForm, taskId: e.target.value })}
                    error={formErrors.taskId}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Clocked Hours"
                      placeholder="e.g. 8"
                      value={timeLogForm.hours}
                      onChange={(e) => setTimeLogForm({ ...timeLogForm, hours: e.target.value })}
                      error={formErrors.hours}
                    />
                    <Select
                      label="Reporting Resource"
                      options={resourcesList.map(r => ({ value: r.employee, label: r.employee }))}
                      value={timeLogForm.employee}
                      onChange={(e) => setTimeLogForm({ ...timeLogForm, employee: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Completed Work Details</label>
                    <textarea
                      placeholder="Describe precise sprint objectives achieved during this timesheet stretch..."
                      value={timeLogForm.description}
                      onChange={(e) => setTimeLogForm({ ...timeLogForm, description: e.target.value })}
                      rows={2}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs py-2 px-3 rounded-lg focus:outline-none"
                    />
                    {formErrors.description && <span className="text-[10px] text-rose-400">{formErrors.description}</span>}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                    <Button variant="outline" size="sm" onClick={() => setShowAddLog(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Log Sprint Hours</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Log Project Risk Modal */}
      <AnimatePresence>
        {showAddRisk && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm">
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Log Project Risk</h3>
                  <button onClick={() => setShowAddRisk(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                </div>

                <form onSubmit={handleAddRisk} className="space-y-4 text-2xs">
                  <Input
                    label="Risk Title"
                    placeholder="e.g. AWS Instance Exhaustion"
                    value={riskForm.title}
                    onChange={(e) => setRiskForm({ ...riskForm, title: e.target.value })}
                    error={formErrors.title}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="Probability"
                      options={[
                        { value: "low", label: "Low Probability" },
                        { value: "medium", label: "Medium Probability" },
                        { value: "high", label: "High Probability" }
                      ]}
                      value={riskForm.probability}
                      onChange={(e) => setRiskForm({ ...riskForm, probability: e.target.value })}
                    />
                    <Select
                      label="Impact Matrix"
                      options={[
                        { value: "low", label: "Low Impact" },
                        { value: "medium", label: "Medium Impact" },
                        { value: "high", label: "High Impact" }
                      ]}
                      value={riskForm.impact}
                      onChange={(e) => setRiskForm({ ...riskForm, impact: e.target.value })}
                    />
                  </div>

                  <Input
                    label="Active Mitigation Plan"
                    placeholder="e.g. Reserve instances in secondary AWS zone US-West"
                    value={riskForm.mitigation}
                    onChange={(e) => setRiskForm({ ...riskForm, mitigation: e.target.value })}
                  />

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Risk Details</label>
                    <textarea
                      placeholder="Describe the structural variables creating risk..."
                      value={riskForm.description}
                      onChange={(e) => setRiskForm({ ...riskForm, description: e.target.value })}
                      rows={2}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs py-2 px-3 rounded-lg focus:outline-none"
                    />
                    {formErrors.description && <span className="text-[10px] text-rose-400">{formErrors.description}</span>}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                    <Button variant="outline" size="sm" onClick={() => setShowAddRisk(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Log Risk Matrix</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
