import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Card, Button, Input, Select, Badge, Dialog } from "./UI";
import {
  Activity,
  Cpu,
  Layers,
  Wrench,
  AlertTriangle,
  Play,
  Pause,
  CheckCircle,
  Plus,
  Compass,
  ArrowRight,
  Sparkles,
  Bot,
  Gauge,
  Sliders,
  CheckSquare,
  FileText,
  Clock,
  Send,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar
} from "recharts";

export const EnterpriseManufacturing: React.FC = () => {
  const { addLog, addNotification } = useStore();
  const [activeTab, setActiveTab] = useState<
    "overview" | "production" | "workorders" | "bom" | "machines" | "qc" | "maintenance" | "scrap" | "ai"
  >("overview");

  // Data states
  const [summary, setSummary] = useState<any>(null);
  const [productionOrders, setProductionOrders] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [boms, setBoms] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [qualityChecks, setQualityChecks] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [scrap, setScrap] = useState<any[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  // Focus/Detail States
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [selectedWO, setSelectedWO] = useState<any>(null);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);

  // Dialog / Form toggles
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [showAddWOModal, setShowAddWOModal] = useState(false);
  const [showAddQCModal, setShowAddQCModal] = useState(false);
  const [showAddMaintModal, setShowAddMaintModal] = useState(false);

  // Forms
  const [orderForm, setOrderForm] = useState({
    productName: "", qtyRequired: "", targetDate: "", bomCode: "BOM-DRONE-V2", assignedMachine: "", assignedOperator: "Marcus AI Logistics"
  });
  const [woForm, setWoForm] = useState({
    poCode: "", operationName: "", timeExpected: "", notes: ""
  });
  const [qcForm, setQcForm] = useState({
    poCode: "", checkedQty: "", acceptedQty: "", defectType: "None", correctiveAction: "", inspector: "Sophia AI Pro"
  });
  const [maintForm, setMaintForm] = useState({
    machineName: "", type: "", scheduledDate: "", technician: "", downtimeExpected: ""
  });

  // AI chat states
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSum, resPO, resWO, resBOM, resMac, resQC, resMaint, resScrap] = await Promise.all([
        fetch("/api/v1/manufacturing/summary"),
        fetch("/api/v1/manufacturing/production-orders"),
        fetch("/api/v1/manufacturing/work-orders"),
        fetch("/api/v1/manufacturing/boms"),
        fetch("/api/v1/manufacturing/machines"),
        fetch("/api/v1/manufacturing/quality"),
        fetch("/api/v1/manufacturing/maintenance"),
        fetch("/api/v1/manufacturing/scrap")
      ]);

      const sumData = await resSum.json();
      const poData = await resPO.json();
      const woData = await resWO.json();
      const bomData = await resBOM.json();
      const macData = await resMac.json();
      const qcData = await resQC.json();
      const maintData = await resMaint.json();
      const scrapData = await resScrap.json();

      setSummary(sumData);
      setProductionOrders(poData);
      setWorkOrders(woData);
      setBoms(bomData);
      setMachines(macData);
      setQualityChecks(qcData);
      setMaintenance(maintData);
      setScrap(scrapData);

      if (poData.length > 0 && !selectedPO) setSelectedPO(poData[0]);
      if (woData.length > 0 && !selectedWO) setSelectedWO(woData[0]);
      if (macData.length > 0 && !selectedMachine) setSelectedMachine(macData[0]);

    } catch (e) {
      console.error("Error retrieving manufacturing systems data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Production Order completed quantity
  const handleUpdatePOQty = async (id: number, currentQty: number, change: number) => {
    const targetQty = Math.max(0, currentQty + change);
    try {
      const res = await fetch(`/api/v1/manufacturing/production-orders/${id}/update-quantity`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qtyCompleted: targetQty })
      });
      const data = await res.json();
      addLog({
        method: "PATCH",
        endpoint: `/api/v1/manufacturing/production-orders/${id}/update-quantity`,
        status: res.status,
        type: "api",
        payload: { qtyCompleted: targetQty },
        response: data
      });

      if (res.ok) {
        addNotification({
          title: "Production Batch Updated",
          description: `Logged completed quantity update for PO batch. Current progress is ${data.po.progress}%.`,
          type: "success"
        });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update Work Order Status (start/pause/complete)
  const handleUpdateWOStatus = async (id: number, status: string, timeActual?: number) => {
    try {
      const res = await fetch(`/api/v1/manufacturing/work-orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, timeActual })
      });
      const data = await res.json();
      addLog({
        method: "PATCH",
        endpoint: `/api/v1/manufacturing/work-orders/${id}/status`,
        status: res.status,
        type: "api",
        payload: { status, timeActual },
        response: data
      });

      if (res.ok) {
        addNotification({
          title: "Operation Status Shifted",
          description: `Work order step ${data.wo.code} changed status to ${status}.`,
          type: "info"
        });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update Machine Power/Operational Status
  const handleUpdateMachineStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/v1/manufacturing/machines/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      addLog({
        method: "PATCH",
        endpoint: `/api/v1/manufacturing/machines/${id}/status`,
        status: res.status,
        type: "security",
        payload: { status },
        response: data
      });

      if (res.ok) {
        addNotification({
          title: "Machine Command Dispatched",
          description: `${data.machine.name} status shifted to ${status} state.`,
          type: "warning"
        });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Production Order Action
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!orderForm.productName) errs.productName = "Product Name is required";
    if (!orderForm.qtyRequired || isNaN(parseInt(orderForm.qtyRequired))) errs.qtyRequired = "Valid volume is required";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      const res = await fetch("/api/v1/manufacturing/production-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderForm)
      });
      const data = await res.json();
      addLog({
        method: "POST",
        endpoint: "/api/v1/manufacturing/production-orders",
        status: res.status,
        type: "api",
        payload: orderForm,
        response: data
      });

      if (res.ok) {
        addNotification({
          title: "SLA Batch Launched",
          description: `Successfully dispatched production batch for ${orderForm.productName} to shop floor scheduling.`,
          type: "success"
        });
        setShowAddOrderModal(false);
        setOrderForm({
          productName: "", qtyRequired: "", targetDate: "", bomCode: "BOM-DRONE-V2", assignedMachine: "", assignedOperator: "Marcus AI Logistics"
        });
        setErrors({});
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Work Order step
  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!woForm.poCode) errs.poCode = "PO Reference Code is required";
    if (!woForm.operationName) errs.operationName = "Operation step is required";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      const res = await fetch("/api/v1/manufacturing/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(woForm)
      });
      const data = await res.json();
      addLog({
        method: "POST",
        endpoint: "/api/v1/manufacturing/work-orders",
        status: res.status,
        type: "api",
        payload: woForm,
        response: data
      });

      if (res.ok) {
        addNotification({
          title: "SLA Routing Added",
          description: `Injected operation step: ${woForm.operationName} into production batch ${woForm.poCode}.`,
          type: "success"
        });
        setShowAddWOModal(false);
        setWoForm({ poCode: "", operationName: "", timeExpected: "", notes: "" });
        setErrors({});
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Log Quality Inspection
  const handleCreateQuality = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!qcForm.poCode) errs.poCode = "PO Batch code is required";
    if (!qcForm.checkedQty || isNaN(parseInt(qcForm.checkedQty))) errs.checkedQty = "Volume is required";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      const res = await fetch("/api/v1/manufacturing/quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(qcForm)
      });
      const data = await res.json();
      addLog({
        method: "POST",
        endpoint: "/api/v1/manufacturing/quality",
        status: res.status,
        type: "api",
        payload: qcForm,
        response: data
      });

      if (res.ok) {
        addNotification({
          title: "QC Log Registered",
          description: `Logged inspection report. Closed validation status: ${data.quality.status}`,
          type: "success"
        });
        setShowAddQCModal(false);
        setQcForm({ poCode: "", checkedQty: "", acceptedQty: "", defectType: "None", correctiveAction: "", inspector: "Sophia AI Pro" });
        setErrors({});
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Log Maintenance Scheduled
  const handleCreateMaint = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!maintForm.machineName) errs.machineName = "Machine target is required";
    if (!maintForm.type) errs.type = "Maintenance type is required";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      const res = await fetch("/api/v1/manufacturing/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(maintForm)
      });
      const data = await res.json();
      addLog({
        method: "POST",
        endpoint: "/api/v1/manufacturing/maintenance",
        status: res.status,
        type: "api",
        payload: maintForm,
        response: data
      });

      if (res.ok) {
        addNotification({
          title: "Preventive Schedule Logged",
          description: `Registered maintenance task: ${maintForm.type} successfully.`,
          type: "success"
        });
        setShowAddMaintModal(false);
        setMaintForm({ machineName: "", type: "", scheduledDate: "", technician: "", downtimeExpected: "" });
        setErrors({});
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Interfacing with Gemini AI Scheduler
  const handleSubmitAiQuery = async (p?: string) => {
    const queryText = p || aiPrompt;
    if (!queryText.trim()) return;

    setAiLoading(true);
    try {
      const res = await fetch("/api/v1/manufacturing/ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: queryText })
      });
      const data = await res.json();
      if (data.success) {
        setAiResponse(data.text);
      }
    } catch (err) {
      console.error(err);
      setAiResponse("Shop floor telemetry connection timed out. Falls back to SRE heuristic logs:\n\n1. Move CNC operations to idle Machine Unit #3.\n2. Reorder Grade-A steel coils to avert critical safety stocks depletion.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-zinc-400 text-xs font-mono">Loading manufacturing schedules & PLC registries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-850 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-5 w-5 text-indigo-400" />
            <span className="text-3xs font-mono font-bold tracking-widest text-zinc-500 uppercase">Material Requirements Planning (MRP) Core</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Enterprise Production & Scheduling</h1>
          <p className="text-xs text-zinc-400 mt-1">High-end shop floor scheduling, Bill of Materials, Machine telemetry, and intelligent bottleneck automation</p>
        </div>
        
        {/* Actions Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => handleSubmitAiQuery("Analyze shop floor capacity bottlenecks and schedule optimizations")} className="gap-2 text-indigo-400 bg-indigo-950/20 hover:bg-indigo-950/40 border border-indigo-900/30 font-mono text-3xs">
            <Sparkles className="h-3 w-3" /> Shop Floor AI Planner
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAddQCModal(true)} className="text-xs gap-1.5 font-mono">
            <CheckSquare className="h-3.5 w-3.5" /> Log Quality check
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowAddOrderModal(true)} className="text-xs gap-1.5 font-mono">
            <Plus className="h-3.5 w-3.5" /> Dispatch Production Batch
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-zinc-900 overflow-x-auto pb-px scrollbar-none">
        {[
          { id: "overview", label: "Shop Floor Hub" },
          { id: "production", label: "Production Batches" },
          { id: "workorders", label: "Operation Routing" },
          { id: "bom", label: "Bill of Materials" },
          { id: "machines", label: "Work Centers Telemetry" },
          { id: "qc", label: "Quality Control" },
          { id: "maintenance", label: "Scheduled Service" },
          { id: "scrap", label: "Scrap & Waste Ledger" },
          { id: "ai", label: "AI Industrial Planner" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? "border-indigo-500 text-indigo-400 font-bold bg-indigo-500/5"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panels content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
        >
          {/* ========================================== */}
          {/* OVERVIEW TAB */}
          {/* ========================================== */}
          {activeTab === "overview" && summary && (
            <div className="space-y-6">
              
              {/* Telemetry Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xs text-zinc-500 font-mono font-bold uppercase tracking-wider font-mono">PLC Machines State</span>
                    <Sliders className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="text-xl font-black text-white">{summary.runningMachines} / {summary.runningMachines + summary.maintenanceMachines + 2} Running</div>
                  <div className="text-4xs text-emerald-400 font-mono flex items-center gap-1">
                    <span>⚡ Overheat parameters within safety margins</span>
                  </div>
                </Card>
                <Card className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xs text-zinc-500 font-mono font-bold uppercase tracking-wider">Capacity Load Index</span>
                    <Gauge className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-black text-white">{summary.averageUtilization}</div>
                  <div className="text-4xs text-zinc-400 font-mono">Consolidated CNC and Wave Station Load</div>
                </Card>
                <Card className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xs text-zinc-500 font-mono font-bold uppercase tracking-wider">Production Batches</span>
                    <Layers className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="text-xl font-black text-white">{summary.activeOrders} Batches</div>
                  <div className="text-4xs text-zinc-400 font-mono">{summary.activeJobs} batches processing on floor</div>
                </Card>
                <Card className="p-4 space-y-2 bg-gradient-to-br from-indigo-950/20 via-zinc-900 to-zinc-950 border border-indigo-900/30">
                  <div className="flex items-center justify-between">
                    <span className="text-3xs text-indigo-400 font-mono font-bold uppercase tracking-wider">Pass Rate Quality Index</span>
                    <Bot className="h-4 w-4 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="text-xl font-black text-white">99.1% Pass</div>
                  <div className="text-4xs text-indigo-400 font-mono flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" /> High-fidelity SMT Laser Verification passed
                  </div>
                </Card>
              </div>

              {/* Graphic charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Station performance bar chart */}
                <Card className="lg:col-span-2 p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">PLC Work Center Load Efficiency</h3>
                      <p className="text-3xs text-zinc-500">Live operational hours telemetry from plant floor controllers</p>
                    </div>
                    <Badge variant="success">Online Logs</Badge>
                  </div>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={summary.machinePerformance}>
                        <XAxis dataKey="name" stroke="#71717a" fontSize={10} fontStyle="font-mono" tickLine={false} />
                        <YAxis stroke="#71717a" fontSize={10} fontStyle="font-mono" tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff", fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar name="Efficiency Index (%)" dataKey="efficiency" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar name="Active Utilization (%)" dataKey="utilization" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Shift Target Gauge */}
                <Card className="p-5 space-y-4 text-center">
                  <div className="text-left">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">Shift SLA Progress</h3>
                    <p className="text-3xs text-zinc-500">Actual output compared to target schedules</p>
                  </div>
                  <div className="h-[200px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={summary.efficiencyTrend} margin={{ left: -10, right: 10, top: 10, bottom: 10 }}>
                        <XAxis type="number" stroke="#71717a" fontSize={10} hide />
                        <YAxis type="category" dataKey="shift" stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff", fontSize: 11 }} />
                        <Bar name="Shift Progress Rate (%)" dataKey="rate" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-x-4 text-4xs font-mono">
                    {summary.efficiencyTrend.map((sh: any, index: number) => (
                      <div key={sh.shift} className="flex items-center gap-1">
                        <span className="text-zinc-400">{sh.shift}:</span>
                        <span className="text-zinc-100 font-semibold">{sh.output}/{sh.target} u ({sh.rate}%)</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Live production statuses */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Active batches lists */}
                <Card className="p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                    <div>
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">Shop Floor Production Batches</h3>
                      <p className="text-3xs text-zinc-500">Live progression of manufactured units</p>
                    </div>
                    <Badge variant="warning">{productionOrders.filter(p => p.status === "In Progress").length} Processing</Badge>
                  </div>
                  <div className="divide-y divide-zinc-850">
                    {productionOrders.map((po) => (
                      <div key={po.id} className="py-3.5 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-white mr-1.5">{po.productName}</span>
                            <span className="text-4xs font-mono text-zinc-500">{po.code}</span>
                          </div>
                          <Badge variant={po.status === "Completed" ? "success" : po.status === "In Progress" ? "warning" : "neutral"}>
                            {po.status}
                          </Badge>
                        </div>
                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-3xs font-mono text-zinc-500">
                            <span>SLA Machine: {po.assignedMachine}</span>
                            <span>{po.qtyCompleted} / {po.qtyRequired} units completed ({po.progress}%)</span>
                          </div>
                          <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${po.progress}%` }} />
                          </div>
                        </div>
                        {/* Live actions completions */}
                        {po.status !== "Completed" && (
                          <div className="flex justify-end gap-1.5 pt-1">
                            <button onClick={() => handleUpdatePOQty(po.id, po.qtyCompleted, -5)} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded text-3xs text-zinc-400 font-mono cursor-pointer transition-all">
                              -5 units
                            </button>
                            <button onClick={() => handleUpdatePOQty(po.id, po.qtyCompleted, 5)} className="px-2 py-0.5 bg-indigo-950/40 border border-indigo-900/30 hover:bg-indigo-900/40 rounded text-3xs text-indigo-400 font-mono cursor-pointer transition-all">
                              +5 units
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* AI Automated scheduler */}
                <Card className="p-5 space-y-4 bg-gradient-to-b from-indigo-950/10 via-zinc-900/80 to-zinc-950 border border-indigo-900/20">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-indigo-400 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">AI Bottleneck Optimizer</h4>
                      <p className="text-3xs text-zinc-400">Generative shop floor capacity re-allocation</p>
                    </div>
                  </div>
                  <div className="bg-zinc-950/60 rounded-xl p-4 border border-indigo-950/40 text-xs text-zinc-300 leading-relaxed space-y-3 font-sans">
                    <p className="font-medium text-white flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                      Dynamic Work-Center Recommendation:
                    </p>
                    <p>
                      Machine Station Unit #2 is scheduled for lens calibration. Recommended strategy: Re-route active assembly routing step **SMT PCB Mount** from batch **PO-MRP-2601** to idle Station Unit #3 to avoid a **4.5 hour** line blockage.
                    </p>
                    <div className="border-t border-indigo-950/60 pt-2.5 flex items-center justify-between text-3xs text-indigo-400 font-mono">
                      <span>Mitigate bottleneck blockage risk</span>
                      <button onClick={() => handleSubmitAiQuery("Generate step-by-step route swap optimization sequence")} className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 cursor-pointer">
                        Execute Swap <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </Card>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* PRODUCTION BATCHES TAB */}
          {/* ========================================== */}
          {activeTab === "production" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Batches Table List */}
              <div className="lg:col-span-2 text-left">
                <Card className="p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                    <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">Production Batch Registry</h3>
                    <Button variant="outline" size="sm" onClick={() => setShowAddOrderModal(true)} className="text-xs gap-1 font-mono">
                      <Plus className="h-3.5 w-3.5" /> Dispatch Batch
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-zinc-850 text-3xs font-mono text-zinc-500 uppercase">
                          <th className="p-2.5">Code</th>
                          <th className="p-2.5">Product Name</th>
                          <th className="p-2.5">Vol Required</th>
                          <th className="p-2.5">Vol Completed</th>
                          <th className="p-2.5">Start Date</th>
                          <th className="p-2.5">Target Date</th>
                          <th className="p-2.5">State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {productionOrders.map((po) => (
                          <tr
                            key={po.id}
                            onClick={() => setSelectedPO(po)}
                            className={`text-zinc-300 hover:bg-zinc-900/30 transition-colors cursor-pointer ${
                              selectedPO?.id === po.id ? "bg-zinc-900/30" : ""
                            }`}
                          >
                            <td className="p-2.5 font-mono font-bold text-zinc-400">{po.code}</td>
                            <td className="p-2.5 font-semibold text-zinc-200">{po.productName}</td>
                            <td className="p-2.5 font-mono">{po.qtyRequired} u</td>
                            <td className="p-2.5 font-mono text-emerald-400 font-semibold">{po.qtyCompleted} u</td>
                            <td className="p-2.5 font-mono text-3xs">{po.startDate}</td>
                            <td className="p-2.5 font-mono text-3xs">{po.targetDate}</td>
                            <td className="p-2.5">
                              <Badge variant={po.status === "Completed" ? "success" : po.status === "In Progress" ? "warning" : "neutral"}>
                                {po.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* Detail side panel */}
              <div className="lg:col-span-1">
                {selectedPO ? (
                  <Card className="p-5 space-y-4 text-left">
                    <div className="border-b border-zinc-850 pb-3">
                      <span className="text-4xs text-zinc-500 font-mono block">BATCH SPECIFICATIONS</span>
                      <h4 className="text-sm font-bold text-white mt-1">{selectedPO.productName}</h4>
                      <span className="text-3xs text-zinc-500 font-mono block mt-0.5">Code: {selectedPO.code} • BOM: {selectedPO.bomCode}</span>
                    </div>

                    <div className="space-y-2.5 font-mono text-3xs text-zinc-400">
                      <div className="flex justify-between">
                        <span>Allocated Work Center:</span>
                        <span className="text-zinc-200 font-semibold">{selectedPO.assignedMachine}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Assigned Operator SRE:</span>
                        <span className="text-zinc-200">{selectedPO.assignedOperator}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completion Rate:</span>
                        <span className="text-zinc-200 font-bold">{selectedPO.progress}%</span>
                      </div>
                    </div>

                    {/* Work Routing Steps */}
                    <div className="border-t border-zinc-900 pt-3.5 space-y-2">
                      <span className="text-3xs font-bold text-zinc-300 block uppercase font-mono">Operations Routing Steps</span>
                      <div className="space-y-1.5">
                        {selectedPO.routing.map((step: string, idx: number) => (
                          <div key={idx} className="p-2 bg-zinc-950/60 rounded-lg border border-zinc-900 flex items-center gap-2 text-3xs text-zinc-300 font-mono">
                            <span className="h-4 w-4 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center font-bold text-zinc-500 text-[9px]">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedPO.status !== "Completed" && (
                      <div className="flex items-center gap-1.5 pt-2">
                        <Button variant="ghost" size="sm" onClick={() => handleUpdatePOQty(selectedPO.id, selectedPO.qtyCompleted, 5)} className="flex-1 text-xs font-mono">
                          Complete +5 u
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => handleUpdatePOQty(selectedPO.id, selectedPO.qtyCompleted, selectedPO.qtyRequired - selectedPO.qtyCompleted)} className="flex-1 text-xs font-mono">
                          Complete Batch
                        </Button>
                      </div>
                    )}

                  </Card>
                ) : (
                  <div className="h-48 flex items-center justify-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs font-mono">
                    Select a production order from registry.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* WORK ORDERS / ROUTING STEPS TAB */}
          {/* ========================================== */}
          {activeTab === "workorders" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              
              {/* Work Order listing */}
              <div className="lg:col-span-1 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-3xs font-mono font-bold uppercase text-zinc-500 tracking-wider">Operation routing queue</span>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddWOModal(true)} className="p-1 h-7 font-mono text-3xs text-indigo-400">
                    <Plus className="h-3.5 w-3.5" /> Inject Step
                  </Button>
                </div>

                <div className="space-y-2">
                  {workOrders.map((wo) => (
                    <div
                      key={wo.id}
                      onClick={() => setSelectedWO(wo)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        selectedWO?.id === wo.id
                          ? "bg-zinc-900 border-zinc-600"
                          : "bg-zinc-900/30 border-zinc-850 hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-white truncate max-w-[170px]">{wo.operationName}</span>
                        <Badge variant={wo.status === "Completed" ? "success" : wo.status === "In Progress" ? "warning" : "neutral"}>
                          {wo.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-4xs font-mono text-zinc-500">
                        <span>Batch Ref: {wo.poCode}</span>
                        <span>Time SLA: {wo.timeExpected}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Order Actions detail */}
              <div className="lg:col-span-2">
                {selectedWO ? (
                  <Card className="p-5 space-y-4">
                    <div className="border-b border-zinc-850 pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-4xs font-mono text-zinc-500 uppercase">{selectedWO.code} • BATCH: {selectedWO.poCode}</span>
                          <h3 className="text-base font-extrabold text-white mt-1">{selectedWO.operationName}</h3>
                        </div>
                        <Badge variant={selectedWO.status === "Completed" ? "success" : selectedWO.status === "In Progress" ? "warning" : "neutral"}>
                          {selectedWO.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-400 mt-2.5 font-mono italic">"{selectedWO.notes}"</p>
                    </div>

                    {/* Telemetry info */}
                    <div className="grid grid-cols-2 gap-4 font-mono text-3xs text-zinc-400">
                      <div className="p-3 bg-zinc-950 rounded-xl space-y-1">
                        <span>Target Duration SLA:</span>
                        <span className="text-white font-bold block text-sm mt-0.5">{selectedWO.timeExpected} Minutes</span>
                      </div>
                      <div className="p-3 bg-zinc-950 rounded-xl space-y-1">
                        <span>Actual Time Logged:</span>
                        <span className="text-indigo-400 font-bold block text-sm mt-0.5">{selectedWO.timeActual || 0} Minutes</span>
                      </div>
                    </div>

                    {/* Operational controls */}
                    <div className="border-t border-zinc-900 pt-4 flex items-center justify-end gap-2">
                      {selectedWO.status === "Pending" && (
                        <Button variant="primary" size="sm" onClick={() => handleUpdateWOStatus(selectedWO.id, "In Progress")} className="font-mono text-xs gap-1">
                          <Play className="h-3.5 w-3.5" /> Start Operation step
                        </Button>
                      )}
                      {selectedWO.status === "In Progress" && (
                        <>
                          <Button variant="secondary" size="sm" onClick={() => handleUpdateWOStatus(selectedWO.id, "Pending")} className="font-mono text-xs gap-1">
                            <Pause className="h-3.5 w-3.5" /> Pause step
                          </Button>
                          <Button variant="primary" size="sm" onClick={() => handleUpdateWOStatus(selectedWO.id, "Completed", selectedWO.timeExpected - 5)} className="font-mono text-xs gap-1">
                            <CheckCircle className="h-3.5 w-3.5" /> Discharge Completed
                          </Button>
                        </>
                      )}
                      {selectedWO.status === "Completed" && (
                        <span className="text-3xs font-mono text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" /> Step completed successfully. SRE verified logs.
                        </span>
                      )}
                    </div>

                  </Card>
                ) : (
                  <div className="h-48 flex items-center justify-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs font-mono">
                    Select an operation routing step.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* BILL OF MATERIALS (BOM) TAB */}
          {/* ========================================== */}
          {activeTab === "bom" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {boms.map((bom) => (
                <Card key={bom.code} className="p-5 space-y-4">
                  <div className="flex justify-between items-start border-b border-zinc-850 pb-3">
                    <div>
                      <span className="text-4xs font-mono text-zinc-500 uppercase">{bom.code} • VERSION: {bom.version}</span>
                      <h4 className="text-sm font-bold text-white mt-1">{bom.productName}</h4>
                    </div>
                    <Badge variant={bom.availabilityStatus === "In Stock" ? "success" : "warning"}>{bom.availabilityStatus}</Badge>
                  </div>

                  {/* Materials list */}
                  <div className="space-y-2">
                    <span className="text-3xs font-mono font-bold uppercase text-zinc-400 block tracking-wider">Required Component Assets</span>
                    <div className="divide-y divide-zinc-900">
                      {bom.materials.map((mat: any, idx: number) => (
                        <div key={idx} className="py-2 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-medium text-zinc-300">{mat.name}</span>
                            <span className="text-3xs text-zinc-500 font-mono block mt-0.5">SLA Unit Rate: ${mat.cost?.toLocaleString()}</span>
                          </div>
                          <div className="text-right font-mono text-3xs">
                            <span className="text-zinc-200 block font-bold">Qty: {mat.qty}</span>
                            <span className={mat.available > mat.qty ? "text-emerald-500" : "text-rose-500 font-semibold"}>
                              In stock: {mat.available} units
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-3xs font-mono text-zinc-400 border-t border-zinc-900 pt-3">
                    <span>Consolidated Assembly Cost:</span>
                    <span className="text-white font-black text-xs">${bom.materialCost?.toLocaleString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ========================================== */}
          {/* WORK CENTERS & MACHINES TELEMETRY TAB */}
          {/* ========================================== */}
          {activeTab === "machines" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              {machines.map((mac) => (
                <Card key={mac.id} className="p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-4xs font-mono text-zinc-500">STATION UNIT #{mac.id}</span>
                      <Badge variant={mac.status === "Running" ? "success" : mac.status === "Maintenance" ? "warning" : "error"}>
                        {mac.status}
                      </Badge>
                    </div>
                    <h4 className="text-xs font-extrabold text-white leading-tight">{mac.name}</h4>
                    
                    <div className="border-t border-zinc-900 pt-2.5 grid grid-cols-2 gap-2 text-4xs font-mono text-zinc-500">
                      <div>
                        <span>EFFICIENCY:</span>
                        <span className="text-zinc-200 block font-bold text-3xs">{mac.efficiency}</span>
                      </div>
                      <div>
                        <span>LOAD RATE:</span>
                        <span className="text-zinc-200 block font-bold text-3xs">{mac.utilization}</span>
                      </div>
                      <div className="mt-1">
                        <span>TEMPERATURE:</span>
                        <span className="text-indigo-400 block font-bold text-3xs">{mac.temperature}</span>
                      </div>
                      <div className="mt-1">
                        <span>ACTIVE BATCH:</span>
                        <span className="text-zinc-400 block truncate text-3xs">{mac.activeOrder}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-900 pt-3 flex items-center gap-1.5">
                    {mac.status !== "Offline" ? (
                      <button onClick={() => handleUpdateMachineStatus(mac.id, "Offline")} className="flex-1 py-1 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-[10px] text-rose-400 font-mono rounded cursor-pointer transition-all">
                        Power Offline
                      </button>
                    ) : (
                      <button onClick={() => handleUpdateMachineStatus(mac.id, "Running")} className="flex-1 py-1 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/30 text-[10px] text-emerald-400 font-mono rounded cursor-pointer transition-all">
                        Boot PLC Unit
                      </button>
                    )}
                    <button onClick={() => {
                      setMaintForm({ ...maintForm, machineName: mac.name, scheduledDate: new Date().toISOString().split('T')[0] });
                      setShowAddMaintModal(true);
                    }} className="flex-1 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-400 font-mono rounded cursor-pointer transition-all">
                      Service
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ========================================== */}
          {/* QUALITY CONTROL TAB */}
          {/* ========================================== */}
          {activeTab === "qc" && (
            <div className="space-y-6 text-left">
              <Card className="p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">Quality Control Logs</h3>
                    <p className="text-3xs text-zinc-500">Shop floor inspection audits and defect corrective actions</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowAddQCModal(true)} className="text-xs gap-1 font-mono">
                    <Plus className="h-3.5 w-3.5" /> Log Inspection
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-zinc-850 text-3xs font-mono text-zinc-500 uppercase">
                        <th className="p-2.5">QC Code</th>
                        <th className="p-2.5">PO Batch</th>
                        <th className="p-2.5">Units Checked</th>
                        <th className="p-2.5">Units Accepted</th>
                        <th className="p-2.5">Units Rejected</th>
                        <th className="p-2.5">Defect Description</th>
                        <th className="p-2.5">Corrective Action Taken</th>
                        <th className="p-2.5">Inspector</th>
                        <th className="p-2.5">State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {qualityChecks.map((qc) => (
                        <tr key={qc.id} className="text-zinc-300 hover:bg-zinc-900/30 transition-colors">
                          <td className="p-2.5 font-mono font-bold text-zinc-400">{qc.code}</td>
                          <td className="p-2.5 font-mono text-zinc-400">{qc.poCode}</td>
                          <td className="p-2.5 font-mono">{qc.checkedQty} u</td>
                          <td className="p-2.5 font-mono text-emerald-400 font-bold">{qc.acceptedQty} u</td>
                          <td className="p-2.5 font-mono text-rose-400 font-bold">{qc.rejectedQty} u</td>
                          <td className="p-2.5">{qc.defectType}</td>
                          <td className="p-2.5 text-3xs text-zinc-400 leading-normal max-w-[200px]">{qc.correctiveAction}</td>
                          <td className="p-2.5 font-medium text-zinc-300">{qc.inspector}</td>
                          <td className="p-2.5">
                            <Badge variant={qc.status === "Completed" || qc.status === "Closed" ? "success" : "warning"}>{qc.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ========================================== */}
          {/* MAINTENANCE TAB */}
          {/* ========================================== */}
          {activeTab === "maintenance" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              
              {/* Scheduled lists */}
              <div className="lg:col-span-2">
                <Card className="p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                    <div>
                      <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">Scheduled Preventive Service</h3>
                      <p className="text-3xs text-zinc-500">Preventative calendar to maintain machine warranties</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowAddMaintModal(true)} className="text-xs gap-1 font-mono">
                      <Plus className="h-3.5 w-3.5" /> Schedule Service
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-zinc-850 text-3xs font-mono text-zinc-500 uppercase">
                          <th className="p-2.5">Target Work Center</th>
                          <th className="p-2.5">Service Type</th>
                          <th className="p-2.5">Scheduled Date</th>
                          <th className="p-2.5">Downtime Expected</th>
                          <th className="p-2.5">SRE technician</th>
                          <th className="p-2.5">State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {maintenance.map((ma) => (
                          <tr key={ma.id} className="text-zinc-300 hover:bg-zinc-900/30 transition-colors">
                            <td className="p-2.5 font-semibold text-zinc-200">{ma.machineName}</td>
                            <td className="p-2.5 text-zinc-300">{ma.type}</td>
                            <td className="p-2.5 font-mono text-3xs">{ma.scheduledDate}</td>
                            <td className="p-2.5 font-mono">{ma.downtimeExpected} Minutes</td>
                            <td className="p-2.5 font-medium text-zinc-400">{ma.technician}</td>
                            <td className="p-2.5">
                              <Badge variant={ma.status === "Completed" ? "success" : ma.status === "In Progress" ? "warning" : "neutral"}>
                                {ma.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* Maintenance Telemetry */}
              <div className="lg:col-span-1">
                <Card className="p-5 space-y-4">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200 border-b border-zinc-850 pb-2 flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-zinc-500" /> Plant SRE Indicators
                  </h4>
                  <div className="space-y-3.5 font-mono text-3xs text-zinc-500">
                    <div className="p-2.5 border border-zinc-900 rounded-lg bg-zinc-950/20">
                      <span className="text-zinc-400 block font-bold mb-1">[PLC-LOG] OVERHEAT RISK TRIGGERS</span>
                      <p>Solder wave heat crucible wave temperature has stabilized at **215°C** (safety limit **240°C**).</p>
                    </div>
                    <div className="p-2 border border-zinc-900 rounded-lg bg-zinc-950/20">
                      <span className="text-zinc-400 block font-bold mb-1">[PLC-LOG] CNC CALIBRATION AUDIT</span>
                      <p>Station Unit #3 calibration offset registers **0.002mm** (tolerance Limit **0.005mm**).</p>
                    </div>
                  </div>
                </Card>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* SCRAP & WASTE LEDGER TAB */}
          {/* ========================================== */}
          {activeTab === "scrap" && (
            <div className="space-y-6 text-left">
              <Card className="p-5 space-y-4">
                <div className="border-b border-zinc-850 pb-3">
                  <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">Scrap & Assembly Waste Ledger</h3>
                  <p className="text-3xs text-zinc-500">Shop floor scrap materials tracing to optimize total material costs</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-zinc-850 text-3xs font-mono text-zinc-500 uppercase">
                        <th className="p-2.5">Batch Ref</th>
                        <th className="p-2.5">Material Description</th>
                        <th className="p-2.5">Scrap Quantity</th>
                        <th className="p-2.5">Reported Cause</th>
                        <th className="p-2.5">Associated Loss Value</th>
                        <th className="p-2.5">Log Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {scrap.map((sl) => (
                        <tr key={sl.id} className="text-zinc-300 hover:bg-zinc-900/30 transition-colors">
                          <td className="p-2.5 font-mono font-bold text-zinc-400">{sl.poCode}</td>
                          <td className="p-2.5 font-semibold text-zinc-200">{sl.materialName}</td>
                          <td className="p-2.5 font-mono">{sl.qty} units</td>
                          <td className="p-2.5 text-zinc-300">{sl.reason}</td>
                          <td className="p-2.5 font-mono text-rose-400 font-bold">${sl.cost?.toLocaleString()}</td>
                          <td className="p-2.5 font-mono text-3xs">{sl.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ========================================== */}
          {/* AI DECISION ROOM TAB */}
          {/* ========================================== */}
          {activeTab === "ai" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              
              {/* Query Workspace */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
                    <Bot className="h-5 w-5 text-indigo-400 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">AI Industrial MRP Agent</h4>
                      <p className="text-3xs text-zinc-500">Autonomous model specialized in shop-floor operations and capacity allocation</p>
                    </div>
                  </div>

                  {/* Recommendation prompts chips */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      "Recommend shop floor schedule optimization for active drone batches",
                      "Predict downtime risks based on current machine parameters",
                      "Analyze current material inventory safety levels in BOM",
                      "Draft corrective action parameters for Solder Bridge defect"
                    ].map((p, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setAiPrompt(p);
                          handleSubmitAiQuery(p);
                        }}
                        className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg text-3xs font-mono cursor-pointer transition-all"
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* Response display */}
                  <div className="min-h-[220px] bg-zinc-950 rounded-xl p-4 border border-zinc-850 font-sans text-xs text-zinc-300 leading-relaxed overflow-y-auto max-h-[300px]">
                    {aiLoading ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                        <span className="text-zinc-500 font-mono text-3xs">Simulating load patterns and checking safety levels...</span>
                      </div>
                    ) : aiResponse ? (
                      <div className="whitespace-pre-wrap leading-relaxed">{aiResponse}</div>
                    ) : (
                      <div className="text-zinc-600 font-mono text-3xs italic text-center py-16">
                        AI Planning Node Standby. Ask about schedule optimizations, material availability, or machine safety parameters.
                      </div>
                    )}
                  </div>

                  {/* Input field */}
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Ask AI Industrial Scheduler..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmitAiQuery()}
                      className="text-xs"
                    />
                    <Button variant="primary" onClick={() => handleSubmitAiQuery()} className="p-3 h-11" disabled={aiLoading}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                </Card>
              </div>

              {/* Operations indicators */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="p-5 space-y-4">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200 border-b border-zinc-850 pb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> Plant Safety Telemetry
                  </h4>
                  <div className="space-y-3 text-3xs font-mono text-zinc-500 leading-relaxed">
                    <div className="p-2 border border-zinc-900 rounded-lg bg-zinc-950/20">
                      <span className="text-zinc-400 block font-bold mb-1">[PLC-ALERT] STATION UNIT #4 OFFLINE</span>
                      <p>Ingress robotics has been shut down due to micro-controller response times. Buffer delayed: **1.8 hours**.</p>
                    </div>
                  </div>
                </Card>
              </div>

            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ========================================== */}
      {/* DIALOGS / MODALS */}
      {/* ========================================== */}

      {/* 1. Dispatch Production Order */}
      <Dialog isOpen={showAddOrderModal} onClose={() => setShowAddOrderModal(false)} title="Dispatch Shop Floor Batch">
        <form onSubmit={handleCreateOrder} className="space-y-4 text-left">
          <Input
            label="Product Name"
            placeholder="Autonomous Drone Chassis v2"
            required
            value={orderForm.productName}
            onChange={(e) => setOrderForm({ ...orderForm, productName: e.target.value })}
            error={errors.productName}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Volume Required (Units)"
              placeholder="50"
              required
              value={orderForm.qtyRequired}
              onChange={(e) => setOrderForm({ ...orderForm, qtyRequired: e.target.value })}
              error={errors.qtyRequired}
            />
            <Select
              label="BOM Specifications"
              value={orderForm.bomCode}
              onChange={(e) => setOrderForm({ ...orderForm, bomCode: e.target.value })}
              options={[
                { value: "BOM-DRONE-V2", label: "Autonomous Drone Chassis v2" },
                { value: "BOM-FRAME-S1", label: "AI Core Server Frame" }
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Work Center Allocation"
              value={orderForm.assignedMachine}
              onChange={(e) => setOrderForm({ ...orderForm, assignedMachine: e.target.value })}
              options={[
                { value: "Machine Unit #1 (Solder Station)", label: "Machine Unit #1 (Solder Station)" },
                { value: "Machine Unit #2 (Laser Calibrator)", label: "Machine Unit #2 (Laser Calibrator)" },
                { value: "Machine Unit #3 (Precision CNC Mill)", label: "Machine Unit #3 (Precision CNC Mill)" }
              ]}
            />
            <Input
              label="Target Completion Date"
              type="date"
              value={orderForm.targetDate}
              onChange={(e) => setOrderForm({ ...orderForm, targetDate: e.target.value })}
            />
          </div>
          <Input
            label="Operator SRE Schedulers"
            value={orderForm.assignedOperator}
            onChange={(e) => setOrderForm({ ...orderForm, assignedOperator: e.target.value })}
          />
          <Button variant="primary" className="w-full mt-2 font-mono text-xs" type="submit">Deploy Shop Floor Batch</Button>
        </form>
      </Dialog>

      {/* 2. Log Quality inspection */}
      <Dialog isOpen={showAddQCModal} onClose={() => setShowAddQCModal(false)} title="Log Quality inspection report">
        <form onSubmit={handleCreateQuality} className="space-y-4 text-left">
          <Input
            label="PO Batch Reference"
            placeholder="PO-MRP-2601"
            required
            value={qcForm.poCode}
            onChange={(e) => setQcForm({ ...qcForm, poCode: e.target.value })}
            error={errors.poCode}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Checked Qty"
              placeholder="10"
              required
              value={qcForm.checkedQty}
              onChange={(e) => setQcForm({ ...qcForm, checkedQty: e.target.value })}
              error={errors.checkedQty}
            />
            <Input
              label="Accepted Qty"
              placeholder="10"
              value={qcForm.acceptedQty}
              onChange={(e) => setQcForm({ ...qcForm, acceptedQty: e.target.value })}
            />
          </div>
          <Input
            label="Defect Description (If any)"
            placeholder="Solder wave bridges on micro pins"
            value={qcForm.defectType}
            onChange={(e) => setQcForm({ ...qcForm, defectType: e.target.value })}
          />
          <Input
            label="Corrective Action"
            placeholder="Adjust wave temperature by +2C"
            value={qcForm.correctiveAction}
            onChange={(e) => setQcForm({ ...qcForm, correctiveAction: e.target.value })}
          />
          <Input
            label="Inspector"
            value={qcForm.inspector}
            disabled
          />
          <Button variant="primary" className="w-full mt-2 font-mono text-xs" type="submit">Commit QC Inspection</Button>
        </form>
      </Dialog>

      {/* 3. Log Preventive Service Schedule */}
      <Dialog isOpen={showAddMaintModal} onClose={() => setShowAddMaintModal(false)} title="Log Preventive Maintenance service">
        <form onSubmit={handleCreateMaint} className="space-y-4 text-left">
          <Input
            label="Target Work Center Station"
            placeholder="Machine Unit #1 (Solder Station)"
            required
            value={maintForm.machineName}
            onChange={(e) => setMaintForm({ ...maintForm, machineName: e.target.value })}
            error={errors.machineName}
          />
          <Input
            label="Service & Calibration Details"
            placeholder="Align lasers & polish lenses"
            required
            value={maintForm.type}
            onChange={(e) => setMaintForm({ ...maintForm, type: e.target.value })}
            error={errors.type}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Scheduled Service Date"
              type="date"
              value={maintForm.scheduledDate}
              onChange={(e) => setMaintForm({ ...maintForm, scheduledDate: e.target.value })}
            />
            <Input
              label="Expected Downtime (Minutes)"
              placeholder="120"
              value={maintForm.downtimeExpected}
              onChange={(e) => setMaintForm({ ...maintForm, downtimeExpected: e.target.value })}
            />
          </div>
          <Input
            label="Technician SRE Team"
            placeholder="SRE Laser Team"
            value={maintForm.technician}
            onChange={(e) => setMaintForm({ ...maintForm, technician: e.target.value })}
          />
          <Button variant="primary" className="w-full mt-2 font-mono text-xs" type="submit">Commit Service Schedule</Button>
        </form>
      </Dialog>

    </div>
  );
};
