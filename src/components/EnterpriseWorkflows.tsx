import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, Pause, Trash2, Edit2, Plus, Sparkles, AlertTriangle, 
  CheckCircle2, X, Activity, RefreshCw, ZoomIn, ZoomOut, Maximize, 
  CornerRightDown, Settings, Database, MessageSquare, Clock, HelpCircle, 
  Compass, ArrowRight, Zap, GitBranch, Terminal, ShieldAlert, Cpu, Check, 
  Briefcase, DollarSign, Calendar, Eye, Send, RotateCcw
} from "lucide-react";
import { Button, Card, Input, Textarea, Select, Badge, Dialog, Switch } from "./UI";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from "recharts";

// Interfaces matches backend
interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

interface WorkflowItem {
  id: number;
  name: string;
  description: string;
  status: "active" | "paused" | "draft";
  triggerType: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  successRate: number;
  totalExecutions: number;
  avgDuration: string;
  automationSavings: number;
}

interface ExecutionRun {
  runId: string;
  workflowId: number;
  status: "running" | "paused" | "completed" | "failed";
  startedAt: string;
  finishedAt?: string;
  triggerSource: string;
  duration: string;
  logs: { timestamp: string; nodeId: string; level: "info" | "warning" | "error"; message: string }[];
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface WorkflowStats {
  totalWorkflows: number;
  activeWorkflows: number;
  averageSuccessRate: string;
  totalSavings: string;
  executionTrends: any[];
  savingsTrends: any[];
}

export default function EnterpriseWorkflows() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "designer" | "logs">("dashboard");

  // Core Backend Data State
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Active Workflow Editor/Designer
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  // Node Dragging inside Canvas
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // AI Orchestration Panel
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiRunning, setAiRunning] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState<"generate" | "optimize" | "explain">("generate");

  // Execution Monitor
  const [executions, setExecutions] = useState<ExecutionRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<ExecutionRun | null>(null);
  const [runActionsLoading, setRunActionsLoading] = useState(false);

  // Modal / Form state
  const [createOpen, setCreateOpen] = useState(false);
  const [newWfName, setNewWfName] = useState("");
  const [newWfDesc, setNewWfDesc] = useState("");
  const [newWfTrigger, setNewWfTrigger] = useState("CRM Lead Created");

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch workflows list
      const wfRes = await fetch("/api/v1/workflows");
      const wfJson = await wfRes.json();
      if (wfJson.success) {
        setWorkflows(wfJson.data);
        if (!selectedWorkflow && wfJson.data.length > 0) {
          setSelectedWorkflow(wfJson.data[0]);
        }
      }

      // 2. Fetch stats & trends
      const statsRes = await fetch("/api/v1/workflows/analytics");
      const statsJson = await statsRes.json();
      if (statsJson.success) setStats(statsJson.data);

      // 3. Fetch templates
      const tplRes = await fetch("/api/v1/workflows/templates");
      const tplJson = await tplRes.json();
      if (tplJson.success) setTemplates(tplJson.data);

    } catch (e) {
      console.error("Failed loading workflows state:", e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Execution logs for selected workflow
  useEffect(() => {
    if (selectedWorkflow) {
      fetchExecutions(selectedWorkflow.id);
    }
  }, [selectedWorkflow]);

  const fetchExecutions = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/workflows/${id}/executions`);
      const json = await res.json();
      if (json.success) {
        setExecutions(json.data);
        if (json.data.length > 0) setSelectedRun(json.data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add a new empty node to the canvas
  const handleAddNode = (type: string) => {
    if (!selectedWorkflow) return;
    const newId = `node-${Date.now()}`;
    const labels: Record<string, string> = {
      trigger: "Custom Inbound Event",
      condition: "Value Evaluation",
      approval: "C-Suite Priority Signoff",
      action: "Slack Outreach Notification",
      delay: "Pause Execution Delay",
      ai: "Process with Gemini Flash",
      database: "Update DB Registry",
      webhook: "External System Dispatcher"
    };

    const newNode: WorkflowNode = {
      id: newId,
      type,
      label: labels[type] || "Custom Task Step",
      position: { x: 100 - panOffset.x, y: 150 - panOffset.y },
      config: {}
    };

    const updatedNodes = [...selectedWorkflow.nodes, newNode];
    handleSaveCanvas({ ...selectedWorkflow, nodes: updatedNodes });
  };

  // Connect two nodes together (Creates connection edge)
  const handleAddEdge = (sourceId: string, targetId: string) => {
    if (!selectedWorkflow || sourceId === targetId) return;
    const edgeId = `edge-${Date.now()}`;
    
    // Check if edge already exists
    if (selectedWorkflow.edges.some(e => e.source === sourceId && e.target === targetId)) return;

    const newEdge: WorkflowEdge = { id: edgeId, source: sourceId, target: targetId };
    const updatedEdges = [...selectedWorkflow.edges, newEdge];
    
    handleSaveCanvas({ ...selectedWorkflow, edges: updatedEdges });
  };

  // Delete node and its corresponding edges
  const handleDeleteNode = (nodeId: string) => {
    if (!selectedWorkflow) return;
    const updatedNodes = selectedWorkflow.nodes.filter(n => n.id !== nodeId);
    const updatedEdges = selectedWorkflow.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    
    if (selectedNode?.id === nodeId) setSelectedNode(null);

    handleSaveCanvas({
      ...selectedWorkflow,
      nodes: updatedNodes,
      edges: updatedEdges
    });
  };

  // Clear connection edge
  const handleDeleteEdge = (edgeId: string) => {
    if (!selectedWorkflow) return;
    const updatedEdges = selectedWorkflow.edges.filter(e => e.id !== edgeId);
    handleSaveCanvas({ ...selectedWorkflow, edges: updatedEdges });
  };

  // Drag node implementation
  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggedNodeId(nodeId);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId && selectedWorkflow) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      // Calculate cursor coordinates relative to canvas bounding boxes
      const x = Math.round((e.clientX - rect.left - panOffset.x) / zoomLevel);
      const y = Math.round((e.clientY - rect.top - panOffset.y) / zoomLevel);

      const updatedNodes = selectedWorkflow.nodes.map(n => {
        if (n.id === draggedNodeId) {
          return { ...n, position: { x, y } };
        }
        return n;
      });

      setSelectedWorkflow({ ...selectedWorkflow, nodes: updatedNodes });
    } else if (isDraggingCanvas) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPanOffset({ x: panOffset.x + dx, y: panOffset.y + dy });
      dragStart.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggedNodeId && selectedWorkflow) {
      // Save exact location on backend
      handleSaveCanvas(selectedWorkflow);
    }
    setDraggedNodeId(null);
    setIsDraggingCanvas(false);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      setIsDraggingCanvas(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
    }
  };

  // Save the modified layout parameters onto the in-memory backend
  const handleSaveCanvas = async (updatedWf: WorkflowItem) => {
    setSelectedWorkflow(updatedWf);
    setWorkflows(prev => prev.map(w => w.id === updatedWf.id ? updatedWf : w));

    try {
      await fetch(`/api/v1/workflows/${updatedWf.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedWf)
      });
    } catch (e) {
      console.error("Save workflow canvas failed:", e);
    }
  };

  // Toggle activation (Paused vs Active)
  const handleToggleStatus = async (wf: WorkflowItem) => {
    try {
      const res = await fetch(`/api/v1/workflows/${wf.id}/toggle`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setSelectedWorkflow(json.data);
        setWorkflows(prev => prev.map(w => w.id === wf.id ? json.data : w));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create new blank Workflow
  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName.trim()) return;
    try {
      const res = await fetch("/api/v1/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newWfName,
          description: newWfDesc,
          triggerType: newWfTrigger
        })
      });
      const json = await res.json();
      if (json.success) {
        setNewWfName("");
        setNewWfDesc("");
        setCreateOpen(false);
        setWorkflows([...workflows, json.data]);
        setSelectedWorkflow(json.data);
        setActiveTab("designer");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Instantiate standard Templates
  const handleLoadTemplate = (tpl: WorkflowTemplate) => {
    if (!selectedWorkflow) return;
    const nodesWithIds = tpl.nodes.map(n => ({
      ...n,
      id: `node-${Date.now()}-${n.id}`
    }));
    
    const edgesWithIds = tpl.edges.map(e => ({
      ...e,
      id: `edge-${Date.now()}-${e.id}`,
      source: `node-${Date.now()}-${e.source}`,
      target: `node-${Date.now()}-${e.target}`
    }));

    handleSaveCanvas({
      ...selectedWorkflow,
      nodes: nodesWithIds,
      edges: edgesWithIds
    });
  };

  // Execution actions (Retry / Abort)
  const handleExecutionAction = async (action: "retry" | "cancel") => {
    if (!selectedRun || !selectedWorkflow) return;
    try {
      setRunActionsLoading(true);
      const res = await fetch(`/api/v1/workflows/${selectedWorkflow.id}/executions/${selectedRun.runId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const json = await res.json();
      if (json.success) {
        setSelectedRun(json.data);
        setExecutions(prev => prev.map(e => e.runId === selectedRun.runId ? json.data : e));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRunActionsLoading(false);
    }
  };

  // Execute advanced AI Action (Generate, Optimize, Explain)
  const handleAIAction = async () => {
    try {
      setAiRunning(true);
      setAiOutput(null);
      const res = await fetch("/api/v1/workflows/ai-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: aiMode,
          prompt: aiPrompt,
          workflowDetails: selectedWorkflow
        })
      });
      const json = await res.json();
      if (json.success) {
        if (aiMode === "generate" && json.nodes && selectedWorkflow) {
          // Sync synthesized nodes onto the canvas instantly!
          handleSaveCanvas({
            ...selectedWorkflow,
            nodes: json.nodes,
            edges: json.edges || []
          });
          setAiOutput("### 🤖 Synthesized Process Canvas Generated!\n\nI have automatically translated your natural language instructions into the drag-and-drop nodes shown in the designer workspace.");
        } else {
          setAiOutput(json.result);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiRunning(false);
    }
  };

  // Helper colors mapping for nodes library
  const getNodeColor = (type: string) => {
    const mappings: Record<string, string> = {
      trigger: "border-indigo-500 bg-indigo-950/20 text-indigo-400",
      condition: "border-amber-500 bg-amber-950/20 text-amber-400",
      approval: "border-rose-500 bg-rose-950/20 text-rose-400",
      action: "border-emerald-500 bg-emerald-950/20 text-emerald-400",
      delay: "border-zinc-500 bg-zinc-950/20 text-zinc-400",
      ai: "border-violet-500 bg-violet-950/20 text-violet-400",
      database: "border-blue-500 bg-blue-950/20 text-blue-400",
      webhook: "border-sky-500 bg-sky-950/20 text-sky-400"
    };
    return mappings[type] || "border-zinc-700 bg-zinc-900 text-zinc-300";
  };

  const getNodeIcon = (type: string) => {
    const size = "h-4 w-4";
    const mappings: Record<string, any> = {
      trigger: <Zap className={size} />,
      condition: <GitBranch className={size} />,
      approval: <CheckCircle2 className={size} />,
      action: <Send className={size} />,
      delay: <Clock className={size} />,
      ai: <Sparkles className={size} />,
      database: <Database className={size} />,
      webhook: <Terminal className={size} />
    };
    return mappings[type] || <HelpCircle className={size} />;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 font-sans select-none">
      
      {/* Module Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-zinc-900 gap-4 bg-zinc-900/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-950/40 border border-indigo-900/30 rounded-lg text-indigo-400">
              <Compass className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Visual Workflow Orchestrator</h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">Custom nodes, real-time executors & AI pipeline optimization</p>
            </div>
          </div>
        </div>

        {/* Modular Navigation Tabs */}
        <div className="flex flex-wrap bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80 gap-0.5">
          {[
            { id: "dashboard", label: "Overview Metrics" },
            { id: "designer", label: "Visual Designer" },
            { id: "logs", label: "Live Control Room" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-2xs font-semibold rounded-lg transition-all ${
                activeTab === tab.id ? "bg-indigo-600 text-white shadow-md" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-28 bg-zinc-900 border border-zinc-800 rounded-xl" />
                ))}
              </div>
            ) : stats ? (
              <>
                {/* Stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                  <Card className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-4xs font-mono text-zinc-500 uppercase tracking-wider">Total Pipelines</p>
                      <h3 className="text-3xl font-extrabold text-white mt-1">{stats.totalWorkflows}</h3>
                      <p className="text-3xs text-indigo-400 font-semibold mt-1">
                        {stats.activeWorkflows} active loops
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center text-indigo-400">
                      <Compass className="h-5 w-5" />
                    </div>
                  </Card>

                  <Card className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-4xs font-mono text-zinc-500 uppercase tracking-wider">Execution Success</p>
                      <h3 className="text-3xl font-extrabold text-white mt-1">{stats.averageSuccessRate}</h3>
                      <p className="text-3xs text-emerald-400 font-semibold mt-1">
                        SLA Clearance Rate
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-emerald-950/40 border border-emerald-900/30 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </Card>

                  <Card className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-4xs font-mono text-zinc-500 uppercase tracking-wider">Human Resource Savings</p>
                      <h3 className="text-3xl font-extrabold text-white mt-1">{stats.totalSavings}</h3>
                      <p className="text-3xs text-zinc-500 mt-1">ROI calculated dynamically</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </Card>

                  <Card className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-4xs font-mono text-zinc-500 uppercase tracking-wider">Average Runtime</p>
                      <h3 className="text-3xl font-extrabold text-white mt-1">4.2s</h3>
                      <p className="text-3xs text-indigo-400 font-semibold mt-1">In-memory Redis Cache</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center text-indigo-400">
                      <Cpu className="h-5 w-5" />
                    </div>
                  </Card>
                </div>

                {/* Automation Spark brief */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-xl border border-indigo-500/20 bg-indigo-950/10 flex flex-col md:flex-row gap-4 items-start md:items-center text-left"
                >
                  <div className="p-2 bg-indigo-950 border border-indigo-500/30 text-indigo-400 rounded-lg shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white font-mono">Autonomous Core Agent Execution</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      All workflows execute client-side inside the Vite sandbox, triggering automated notifications and routing data pipelines instantly. You can write custom prompts to synthesize nodes on the designer workspace.
                    </p>
                  </div>
                </motion.div>

                {/* Analytical Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                  
                  {/* Daily run trends stacked bar chart */}
                  <Card className="lg:col-span-8 p-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 mb-4 font-mono">
                      <Activity className="h-4 w-4" /> Loop Executions History (Success vs Failure)
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.executionTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                          <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: 10 }} />
                          <YAxis stroke="#71717a" style={{ fontSize: 10 }} />
                          <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", color: "#f4f4f5" }} />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          <Bar dataKey="success" fill="#10b981" radius={[3, 3, 0, 0]} name="Successful Loops" />
                          <Bar dataKey="failure" fill="#f43f5e" radius={[3, 3, 0, 0]} name="Failed Nodes" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Financial savings trend line chart */}
                  <Card className="lg:col-span-4 p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 mb-4 font-mono">
                        <DollarSign className="h-4 w-4" /> Automation Savings ROI
                      </h3>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats.savingsTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: 8 }} />
                            <YAxis stroke="#71717a" style={{ fontSize: 8 }} />
                            <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", color: "#f4f4f5" }} />
                            <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" name="Savings ($)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl mt-4 text-4xs font-mono text-zinc-500 leading-relaxed text-center">
                      Average business process engineering executes loops 40x faster than corresponding human operators.
                    </div>
                  </Card>

                </div>
              </>
            ) : null}
          </div>
        )}

        {/* TAB 2: VISUAL DESIGNER */}
        {activeTab === "designer" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-stretch">
            
            {/* Left lists & node library panel */}
            <div className="lg:col-span-3 flex flex-col gap-4 text-left">
              
              {/* Select Active Pipeline */}
              <Card className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                  <span className="text-4xs font-mono uppercase text-zinc-500 tracking-wider">Active Workspace</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="p-1 px-2.5 text-4xs"
                    icon={<Plus className="h-3 w-3" />}
                    onClick={() => setCreateOpen(true)}
                  >
                    Create Pipeline
                  </Button>
                </div>

                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {workflows.map(wf => (
                    <div
                      key={wf.id}
                      onClick={() => {
                        setSelectedWorkflow(wf);
                        setSelectedNode(null);
                      }}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        selectedWorkflow?.id === wf.id
                          ? "bg-indigo-950/20 border-indigo-500/80"
                          : "bg-zinc-900 border-zinc-850 hover:border-zinc-800"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 truncate flex-1">
                        <span className="text-xs font-bold text-white truncate">{wf.name}</span>
                        <span className="text-4xs font-mono text-zinc-500">{wf.triggerType}</span>
                      </div>
                      <Badge variant={wf.status === "active" ? "accent" : "neutral"} className="text-4xs scale-90">
                        {wf.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Node Palette / Toolbox */}
              <Card className="p-4 flex flex-col gap-3">
                <span className="text-4xs font-mono uppercase text-zinc-500 tracking-widest border-b border-zinc-900 pb-2">Step Toolbox</span>
                <p className="text-4xs text-zinc-500">Click a node below to instantiate it inside the active designer canvas:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: "trigger", label: "Trigger Link" },
                    { type: "condition", label: "Condition Gate" },
                    { type: "approval", label: "CFO Approval" },
                    { type: "action", label: "Slack Notify" },
                    { type: "delay", label: "Timer Delay" },
                    { type: "ai", label: "Gemini Flash" },
                    { type: "database", label: "DB Update" },
                    { type: "webhook", label: "API Webhook" }
                  ].map(step => (
                    <button
                      key={step.type}
                      onClick={() => handleAddNode(step.type)}
                      className={`p-2 border rounded-lg text-4xs font-mono flex items-center gap-1.5 hover:border-indigo-500/40 transition-all ${getNodeColor(step.type)}`}
                    >
                      {getNodeIcon(step.type)}
                      <span>{step.label}</span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Instant template loader */}
              <Card className="p-4 flex flex-col gap-2.5">
                <span className="text-4xs font-mono uppercase text-zinc-500 tracking-widest border-b border-zinc-900 pb-2">Blueprints Directory</span>
                <div className="flex flex-col gap-2">
                  {templates.map(tpl => (
                    <div
                      key={tpl.id}
                      onClick={() => handleLoadTemplate(tpl)}
                      className="p-2 border border-zinc-850 hover:border-zinc-700 bg-zinc-900/60 rounded-lg cursor-pointer text-4xs transition-all text-left"
                    >
                      <p className="text-white font-bold">{tpl.name}</p>
                      <p className="text-zinc-500 mt-0.5 line-clamp-1">{tpl.description}</p>
                    </div>
                  ))}
                </div>
              </Card>

            </div>

            {/* Middle Drag & Drop SVG Canvas Workspace */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              
              {selectedWorkflow ? (
                <>
                  {/* Canvas Toolbar Controls */}
                  <Card className="p-3 flex justify-between items-center bg-zinc-900/80 border-zinc-800">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white font-mono">{selectedWorkflow.name}</h4>
                      <Badge variant={selectedWorkflow.status === "active" ? "accent" : "neutral"} className="scale-90">
                        {selectedWorkflow.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={selectedWorkflow.status === "active" ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
                        className="py-1 px-2.5 text-4xs"
                        onClick={() => handleToggleStatus(selectedWorkflow)}
                      >
                        {selectedWorkflow.status === "active" ? "Pause Active Engine" : "Activate Engine"}
                      </Button>

                      <div className="h-6 w-[1px] bg-zinc-800" />

                      <Button variant="ghost" size="sm" className="px-1.5" icon={<ZoomIn className="h-4 w-4 text-zinc-400" />} onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.5))} />
                      <Button variant="ghost" size="sm" className="px-1.5" icon={<ZoomOut className="h-4 w-4 text-zinc-400" />} onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.6))} />
                      <Button variant="ghost" size="sm" className="px-1.5" icon={<Maximize className="h-4 w-4 text-zinc-400" />} onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }} />
                    </div>
                  </Card>

                  {/* Intersecting Node Grid Frame */}
                  <div
                    ref={canvasRef}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseDown={handleCanvasMouseDown}
                    className="relative flex-1 min-h-[500px] border border-zinc-900 rounded-2xl bg-zinc-950 overflow-hidden cursor-grab active:cursor-grabbing"
                    style={{
                      backgroundImage: "radial-gradient(#1f1f23 1px, transparent 1px)",
                      backgroundSize: "20px 20px"
                    }}
                  >
                    {/* Visual Connection Edges (SVGs) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                      <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1 L 10 5 L 0 9 z" fill="#4f46e5" />
                        </marker>
                      </defs>

                      {selectedWorkflow.edges.map(edge => {
                        const src = selectedWorkflow.nodes.find(n => n.id === edge.source);
                        const dest = selectedWorkflow.nodes.find(n => n.id === edge.target);

                        if (!src || !dest) return null;

                        const x1 = src.position.x * zoomLevel + panOffset.x + 48; // Node centers
                        const y1 = src.position.y * zoomLevel + panOffset.y + 20;
                        const x2 = dest.position.x * zoomLevel + panOffset.x + 48;
                        const y2 = dest.position.y * zoomLevel + panOffset.y + 20;

                        // Draw clean path bezier curves
                        const dx = x2 - x1;
                        const dy = y2 - y1;
                        const cx1 = x1 + dx / 2;
                        const cy1 = y1;
                        const cx2 = x1 + dx / 2;
                        const cy2 = y2;

                        return (
                          <g key={edge.id} className="pointer-events-auto">
                            <path
                              d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                              fill="none"
                              stroke="#4f46e5"
                              strokeWidth={2}
                              strokeOpacity={0.65}
                              markerEnd="url(#arrow)"
                            />
                            {/* Circle midpoint to delete connections */}
                            <circle
                              cx={(x1 + x2) / 2}
                              cy={(y1 + y2) / 2}
                              r={6}
                              fill="#f43f5e"
                              className="opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
                              onClick={() => handleDeleteEdge(edge.id)}
                            />
                          </g>
                        );
                      })}
                    </svg>

                    {/* Nodes Array Layer */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: "0 0"
                      }}
                    >
                      {selectedWorkflow.nodes.map(node => {
                        const isSelected = selectedNode?.id === node.id;
                        return (
                          <div
                            key={node.id}
                            onMouseDown={(e) => handleNodeDragStart(e, node.id)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNode(node);
                            }}
                            className={`absolute pointer-events-auto flex items-center justify-between p-2 rounded-xl border select-none transition-all cursor-move shadow-md min-w-[120px] ${
                              isSelected
                                ? "bg-indigo-950 border-indigo-400 text-white shadow-indigo-500/10"
                                : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-200"
                            }`}
                            style={{
                              left: node.position.x,
                              top: node.position.y
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`p-1 border rounded ${getNodeColor(node.type).split(" ")[0]} bg-zinc-950/40`}>
                                {getNodeIcon(node.type)}
                              </span>
                              <span className="text-[10px] font-bold font-mono tracking-tight">{node.label}</span>
                            </div>

                            {/* Node action targets to draw edges */}
                            <div className="flex flex-col gap-1 pr-0.5">
                              {/* Create connection edge handle */}
                              <div
                                className="h-2 w-2 rounded-full bg-indigo-500 hover:bg-indigo-300 cursor-crosshair"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  setDraggedNodeId(null);
                                  // Simple connector drawer: prompt for connection
                                  const targetNodeId = prompt("Enter target Node ID to link to:", "");
                                  if (targetNodeId) handleAddEdge(node.id, targetNodeId.trim());
                                }}
                                title="Link to node"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Mini-map Overlay */}
                    <div className="absolute bottom-3 right-3 p-2 bg-zinc-900/90 border border-zinc-800 rounded-xl max-w-[120px] text-[7px] font-mono text-zinc-500 text-left">
                      <p className="text-zinc-400 font-bold border-b border-zinc-800 pb-1 mb-1">MINI MAP</p>
                      <div className="grid grid-cols-4 gap-0.5 opacity-55">
                        {selectedWorkflow.nodes.map((n, idx) => (
                          <span key={idx} className="h-1 bg-indigo-500 rounded-sm" />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-12 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
                  <Compass className="h-10 w-10 opacity-30 mb-2" />
                  <p className="text-xs font-mono">No Active Workflows In Sandbox</p>
                  <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>Create First Pipeline</Button>
                </div>
              )}
            </div>

            {/* Right Node Inspector / AI Assistant Inspector */}
            <div className="lg:col-span-3 flex flex-col gap-4 text-left">
              
              {/* Node Inspector */}
              <Card className="p-4 flex flex-col gap-3">
                <span className="text-4xs font-mono uppercase text-zinc-500 tracking-widest border-b border-zinc-900 pb-2">Properties Inspector</span>
                
                {selectedNode ? (
                  <div className="flex flex-col gap-3.5">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500">ID: {selectedNode.id}</span>
                      <Input
                        label="Step Label"
                        value={selectedNode.label}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updatedNodes = selectedWorkflow?.nodes.map(n => n.id === selectedNode.id ? { ...n, label: val } : n);
                          if (selectedWorkflow && updatedNodes) {
                            setSelectedNode({ ...selectedNode, label: val });
                            handleSaveCanvas({ ...selectedWorkflow, nodes: updatedNodes });
                          }
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                      <p className="text-[10px] font-mono text-zinc-400">Node type: <Badge variant="neutral">{selectedNode.type.toUpperCase()}</Badge></p>
                      <p className="text-[9px] text-zinc-500">Coordinates: x: {selectedNode.position.x}, y: {selectedNode.position.y}</p>
                    </div>

                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 className="h-4.5 w-4.5" />}
                      onClick={() => handleDeleteNode(selectedNode.id)}
                    >
                      Remove Step Node
                    </Button>
                  </div>
                ) : (
                  <p className="text-4xs text-zinc-500 leading-relaxed italic">
                    Click a node step on the canvas to inspect coordinates, update labels, or prune connections.
                  </p>
                )}
              </Card>

              {/* AI Workspace Copilot */}
              <Card className="p-4 flex flex-col gap-3 border border-indigo-500/20 bg-indigo-950/15">
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-2xs font-mono">
                  <Sparkles className="h-4 w-4" />
                  <span>AI CANVAS COPILOT</span>
                </div>

                <div className="flex flex-col gap-2.5">
                  <Select
                    value={aiMode}
                    onChange={(e: any) => {
                      setAiMode(e.target.value);
                      setAiOutput(null);
                    }}
                    options={[
                      { value: "generate", label: "NL to Visual Nodes" },
                      { value: "optimize", label: "Analyze Bottlenecks" },
                      { value: "explain", label: "Explain Pipeline Loop" }
                    ]}
                  />

                  {aiMode === "generate" && (
                    <Textarea
                      placeholder="e.g. Ingest lead, run sentiment analysis, route high pricing lead to Director approval otherwise log CRM Outreach"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                    />
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Zap className="h-3 w-3" />}
                    loading={aiRunning}
                    onClick={handleAIAction}
                  >
                    Execute Orchestrator
                  </Button>
                </div>

                {aiOutput && (
                  <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg text-4xs leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap font-mono text-zinc-300">
                    {aiOutput}
                  </div>
                )}
              </Card>

            </div>

          </div>
        )}

        {/* TAB 3: LIVE CONTROL ROOM */}
        {activeTab === "logs" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start text-left">
            
            {/* Executions log list */}
            <Card className="lg:col-span-5 p-4 flex flex-col gap-3.5">
              <span className="text-4xs font-mono uppercase text-zinc-500 tracking-wider border-b border-zinc-900 pb-2">Loop Executions Stream</span>
              
              {loading ? (
                <div className="h-28 bg-zinc-900 animate-pulse rounded-xl" />
              ) : executions.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 text-3xs font-mono">
                  No Execution History logged in memory.
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
                  {executions.map(run => {
                    const isSelected = selectedRun?.runId === run.runId;
                    return (
                      <div
                        key={run.runId}
                        onClick={() => setSelectedRun(run)}
                        className={`p-3 border rounded-xl cursor-pointer transition-all ${
                          isSelected ? "bg-indigo-950/20 border-indigo-500/85" : "bg-zinc-900 border-zinc-850 hover:border-zinc-800"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-bold text-white font-mono">{run.runId}</span>
                          <Badge
                            variant={
                              run.status === "completed" ? "accent" : (run.status === "failed" ? "error" : "neutral")
                            }
                            className="text-4xs scale-90"
                          >
                            {run.status}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-col gap-1 text-4xs font-mono text-zinc-400">
                          <p>Source: {run.triggerSource}</p>
                          <div className="flex justify-between text-zinc-500 pt-1 border-t border-zinc-950">
                            <span>Duration: {run.duration}</span>
                            <span>{new Date(run.startedAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Logs debugging stream console */}
            <Card className="lg:col-span-7 p-5 min-h-[420px] flex flex-col justify-between items-stretch bg-zinc-950 border-zinc-900 font-mono text-xs">
              
              {selectedRun ? (
                <div className="flex flex-col justify-between h-full items-stretch">
                  <div>
                    {/* Header console */}
                    <div className="flex justify-between items-center pb-3 border-b border-zinc-900 mb-4 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="h-4 w-4 text-indigo-400" />
                        <span className="font-bold text-white uppercase tracking-wider">Log Stream Terminal : {selectedRun.runId}</span>
                      </div>

                      {/* Manual trigger buttons */}
                      {selectedRun.status === "failed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-400 border border-emerald-900/20 text-3xs py-1"
                          icon={<RotateCcw className="h-3 w-3" />}
                          onClick={() => handleExecutionAction("retry")}
                          loading={runActionsLoading}
                        >
                          Manual Node Rerun
                        </Button>
                      )}

                      {selectedRun.status === "paused" && (
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-3xs py-1"
                            onClick={() => handleExecutionAction("retry")}
                            loading={runActionsLoading}
                          >
                            CFO Credentials Approval
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="text-3xs py-1"
                            onClick={() => handleExecutionAction("cancel")}
                            loading={runActionsLoading}
                          >
                            Abort Process
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Timeline Log */}
                    <div className="flex flex-col gap-2 max-h-96 overflow-y-auto bg-black p-3 rounded-xl border border-zinc-900">
                      {selectedRun.logs.map((log, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start text-left">
                          <span className="text-[10px] text-zinc-650 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          <span className={`text-[10px] uppercase font-bold shrink-0 w-16 ${
                            log.level === "error" ? "text-rose-500" : (log.level === "warning" ? "text-amber-500" : "text-emerald-400")
                          }`}>
                            [{log.level}]
                          </span>
                          <span className="text-[10px] text-zinc-300 leading-relaxed">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-600 italic text-center pt-4 border-t border-zinc-900 mt-6 flex justify-center items-center gap-1">
                    <Activity className="h-3.5 w-3.5 animate-pulse text-indigo-400" />
                    Listening to memory vector loop pipelines...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-zinc-600 text-center">
                  <Terminal className="h-10 w-10 opacity-30 mb-2 text-indigo-400 animate-pulse" />
                  <p className="text-xs font-mono">Control Room Console Idle</p>
                  <p className="text-[10px] text-zinc-700 mt-1 max-w-sm leading-relaxed">
                    Select an active or past execution run from the left stream to inspect step-by-step telemetry logs, review error levels, and rerun failed logic nodes.
                  </p>
                </div>
              )}

            </Card>

          </div>
        )}

      </div>

      {/* CREATION DIALOG OVERLAYS */}
      <Dialog isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Automation Pipeline">
        <form onSubmit={handleCreateWorkflow} className="flex flex-col gap-4 text-left">
          <Input
            label="Pipeline Name"
            placeholder="e.g. Enterprise CRM Outbound Synchronization"
            required
            value={newWfName}
            onChange={(e) => setNewWfName(e.target.value)}
          />

          <Textarea
            label="Brief Description"
            placeholder="Outline what core event routes are modeled in this automation loop..."
            value={newWfDesc}
            onChange={(e) => setNewWfDesc(e.target.value)}
          />

          <Select
            label="Inbound Trigger Event Source"
            value={newWfTrigger}
            onChange={(e) => setNewWfTrigger(e.target.value)}
            options={[
              { value: "CRM Lead Created", label: "CRM Inbound lead ingestion" },
              { value: "Procurement Request Created", label: "Procurement request created" },
              { value: "Support Ticket Received", label: "Standard SLA Ticket submitted" },
              { value: "Voice Portal Trigger", label: "Twilio Call transcript completed" }
            ]}
          />

          <div className="flex justify-end gap-2.5 mt-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Blank Workspace</Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}
