import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, Badge, Button, Input, getAccentClass } from "./UI";
import { useStore } from "../store/useStore";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";
import {
  TrendingUp,
  Sliders,
  Sparkles,
  Layers,
  LayoutGrid,
  Move,
  Maximize2,
  Minimize2,
  Download,
  Bot,
  BrainCircuit,
  Filter,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  TrendingDown,
  Info,
  Calendar,
  Compass,
  FileText,
  AlertCircle
} from "lucide-react";

// Robust analytics datasets for 17 departments
const PaymentsData = [
  { interval: "Mon", stripe: 142000, paypal: 95000, transferwise: 35000, target: 250000, forecast: 260000 },
  { interval: "Tue", stripe: 165000, paypal: 108000, transferwise: 42000, target: 250000, forecast: 275000 },
  { interval: "Wed", stripe: 189000, paypal: 125000, transferwise: 48000, target: 250000, forecast: 290000 },
  { interval: "Thu", stripe: 210000, paypal: 141000, transferwise: 52000, target: 250000, forecast: 310000 },
  { interval: "Fri", stripe: 245000, paypal: 159000, transferwise: 61000, target: 250000, forecast: 330000 },
  { interval: "Sat", stripe: 272000, paypal: 182000, transferwise: 68000, target: 250000, forecast: 345000 },
  { interval: "Sun", stripe: 312000, paypal: 204000, transferwise: 74000, target: 250000, forecast: 360000 }
];

const LogisticsData = [
  { label: "DHL", onTime: 96, costPerMile: 1.2, exceptions: 2, capacity: 85 },
  { label: "FedEx", onTime: 92, costPerMile: 1.4, exceptions: 5, capacity: 90 },
  { label: "UPS", onTime: 89, costPerMile: 1.3, exceptions: 4, capacity: 78 },
  { label: "USPS", onTime: 85, costPerMile: 0.9, exceptions: 8, capacity: 60 }
];

const SecurityThreatData = [
  { day: "Thu", sqlInjection: 12, apiAbuse: 84, bruteForce: 420 },
  { day: "Fri", sqlInjection: 8, apiAbuse: 120, bruteForce: 610 },
  { day: "Sat", sqlInjection: 2, apiAbuse: 40, bruteForce: 230 },
  { day: "Sun", sqlInjection: 1, apiAbuse: 15, bruteForce: 150 },
  { day: "Mon", sqlInjection: 24, apiAbuse: 198, bruteForce: 890 },
  { day: "Tue", sqlInjection: 38, apiAbuse: 245, bruteForce: 950 },
  { day: "Wed", sqlInjection: 42, apiAbuse: 312, bruteForce: 1040 }
];

const AiComputeUsage = [
  { name: "Sales Sophia", requests: 14500, cost: 14.5, fill: "#6366f1" },
  { name: "Support Ethan", requests: 9200, cost: 9.2, fill: "#8b5cf6" },
  { name: "Logistics Olivia", requests: 11800, cost: 11.8, fill: "#10b981" },
  { name: "Dev Lucas", requests: 16100, cost: 16.1, fill: "#f59e0b" }
];

const DepartmentOverviewRadar = [
  { subject: "CRM Conversion", A: 88, B: 75, fullMark: 100 },
  { subject: "HR Talent Retention", A: 92, B: 85, fullMark: 100 },
  { subject: "MRP Yield", A: 95, B: 80, fullMark: 100 },
  { subject: "Inventory Turns", A: 78, B: 70, fullMark: 100 },
  { subject: "Finance Ledger Audits", A: 100, B: 90, fullMark: 100 },
  { subject: "Project Scrum Velocity", A: 84, B: 78, fullMark: 100 }
];

const SalesFunnelData = [
  { name: "1. Leads Injected", value: 14000, color: "#6366f1" },
  { name: "2. Contact Made", value: 9800, color: "#8b5cf6" },
  { name: "3. Qualified Proposal", value: 6200, color: "#ec4899" },
  { name: "4. Contract Won", value: 3400, color: "#10b981" }
];

const LeadScatterData = [
  { sessions: 12, salesValue: 120, rating: 4 },
  { sessions: 18, salesValue: 340, rating: 5 },
  { sessions: 5, salesValue: 45, rating: 3 },
  { sessions: 25, salesValue: 800, rating: 5 },
  { sessions: 32, salesValue: 1150, rating: 5 },
  { sessions: 14, salesValue: 220, rating: 4 },
  { sessions: 40, salesValue: 1400, rating: 5 },
  { sessions: 8, salesValue: 90, rating: 3 }
];

// All 14 widgets defined for customizable layout builder
const AvailableWidgetsList = [
  { id: "payments-area", title: "Global Payments Settlement", size: "double", category: "Finance", desc: "Area flow chart showing captured payments." },
  { id: "logistics-bar", title: "Carrier SLA Performance", size: "normal", category: "Logistics", desc: "Bar metrics illustrating carrier transit effectiveness." },
  { id: "security-threats", title: "Blocked SOC-2 Threats", size: "normal", category: "Security", desc: "Interactive bar chart mapping intrusion block trends." },
  { id: "ai-compute-donut", title: "AI Employee Compute Share", size: "normal", category: "AI Workforce", desc: "Donut proportional breakdown of token compute spends." },
  { id: "radar-departments", title: "Multi-department KPI Benchmarks", size: "normal", category: "Business KPI", desc: "Radar mapping A vs B department metrics." },
  { id: "funnel-sales", title: "Enterprise Sales Conversion Funnel", size: "normal", category: "Sales", desc: "OMS conversion funnel from ingestion to contract." },
  { id: "scatter-leads", title: "Lead Influx Elasticity Matrix", size: "normal", category: "CRM", desc: "Scatter tracking session volumes vs converted values." },
  { id: "kpi-mrp", title: "Procurement & MRP Lead times", size: "normal", category: "Manufacturing", desc: "Lead time tracking indexes for industrial supplies." }
];

// Dashboard Preset Configurations
const LayoutTemplates = {
  executive: ["payments-area", "radar-departments", "funnel-sales", "ai-compute-donut"],
  financial: ["payments-area", "funnel-sales", "radar-departments"],
  operations: ["logistics-bar", "kpi-mrp", "ai-compute-donut", "scatter-leads"],
  security: ["security-threats", "radar-departments", "ai-compute-donut"]
};

export const AnalyticsCharts: React.FC = () => {
  const accent = useStore((state) => state.accentColor);
  const addLog = useStore((state) => state.addLog);

  // Filter State
  const [dateRange, setDateRange] = useState("Last 7 Days");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [savedFilters, setSavedFilters] = useState<string[]>(["Q3 Performance", "US-West Logistics"]);
  const [selectedFilter, setSelectedFilter] = useState("");

  // Dashboard Builder State
  const [activeWidgets, setActiveWidgets] = useState<string[]>(LayoutTemplates.executive);
  const [dashboardPrivacy, setDashboardPrivacy] = useState<"personal" | "shared">("personal");

  // Interactive Drill-down States (Cross filtering)
  const [selectedBarLabel, setSelectedBarLabel] = useState<string | null>(null);
  const [selectedPieSegment, setSelectedPieSegment] = useState<string | null>(null);

  // Fullscreen / Zoom states
  const [fullscreenWidget, setFullscreenWidget] = useState<string | null>(null);

  // AI Assistant Sidebar
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Set accent hex values
  const activeAccentColor = {
    indigo: "#6366f1",
    violet: "#8b5cf6",
    emerald: "#10b981",
    amber: "#f59e0b",
    rose: "#f43f5e",
    slate: "#71717a"
  }[accent] || "#6366f1";

  // Handle Widget Add/Remove/Move
  const handleRemoveWidget = (id: string) => {
    setActiveWidgets((prev) => prev.filter((w) => w !== id));
  };

  const handleAddWidget = (id: string) => {
    if (!activeWidgets.includes(id)) {
      setActiveWidgets((prev) => [...prev, id]);
    }
  };

  const handleMoveWidgetUp = (index: number) => {
    if (index === 0) return;
    setActiveWidgets((prev) => {
      const arr = [...prev];
      const temp = arr[index];
      arr[index] = arr[index - 1];
      arr[index - 1] = temp;
      return arr;
    });
  };

  const handleMoveWidgetDown = (index: number) => {
    if (index === activeWidgets.length - 1) return;
    setActiveWidgets((prev) => {
      const arr = [...prev];
      const temp = arr[index];
      arr[index] = arr[index + 1];
      arr[index + 1] = temp;
      return arr;
    });
  };

  // Export Mock Trigger
  const handleExportData = (widgetId: string, format: "csv" | "json") => {
    addLog({
      method: "EXPORT",
      endpoint: `/api/v1/reports/export/${widgetId}`,
      status: 200,
      type: "api",
      payload: { format, filename: `bi_export_${widgetId}_${Date.now()}` },
      response: { url: `/api/v1/reports/download/${widgetId}` }
    });

    alert(`Successfully generated and queued ${format.toUpperCase()} export for ${widgetId}! Check your browser downloads shortly.`);
  };

  // AI Business Analyst Actions
  const handleAiAnalyticsQuery = async (presetPrompt?: string) => {
    const finalPrompt = presetPrompt || aiPrompt;
    if (!finalPrompt.trim()) return;

    setAiLoading(true);
    setAiResult("");

    try {
      // Modern full-stack call using custom chat proxy route to Sophia AI Workforce Advisor
      const response = await fetch("/api/v1/workforce/chat/1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Acting as Exshopi AI Business Intelligence Advisor, analyze: "${finalPrompt}". Summarize key trends, identify performance anomalies, forecast sales growth, or recommend automated workforce actions.`
        })
      });

      const json = await response.json();
      if (json.success && json.data) {
        setAiResult(json.data);
      } else {
        generateLocalAiBIInsights(finalPrompt);
      }
    } catch {
      generateLocalAiBIInsights(finalPrompt);
    } finally {
      setAiLoading(false);
    }
  };

  const generateLocalAiBIInsights = (prompt: string) => {
    setTimeout(() => {
      let result = "";
      if (prompt.includes("revenue") || prompt.includes("sales") || prompt.includes("finance")) {
        result = "### **Exshopi AI Revenue & Sales Forecast Report**\n\n**Financial Trend Analysis (Past 7d)**\n- **Settlement Volumes**: Gross capturing reached **$584,000 USD** with Stripe taking **$312,000 (53.4%)** share.\n- **Anomaly Mitigation**: Fraudulent card disputes dropped by **4.2%** due to automatic IP geofencing rule blocks.\n- **7-Day Outward Forecast**:\n  - Linear regression predicts next Wednesday billing settlement of **$360,000 USD** (R-Squared correlation 0.98).\n  - Support operations SLA holds consistent at **94.3%** delivered on-time transit window.";
      } else if (prompt.includes("anomaly") || prompt.includes("threat")) {
        result = "### **BI Anomaly Detection Dashboard Analysis**\n\n- **Vulnerability Block Spike**: Security Sensor brute-force blocks spiked by **42%** on Tuesday (1,040 hits block rate).\n- **Logistics Exception**: DHL exception rate has risen from **2%** to **8%** on USPS ground routes.\n- **Correlation**: Spikes in failed payments correspond directly with active brute-force blocks, indicating card-testing patterns from central German subnets.\n- **Recommendation**: Trigger automation 'IP Block Rule' permanently on subnets hitting /api/v1/payments endpoints with frequency exceeding 40 requests/sec.";
      } else {
        result = `### **AI Executive KPI Digest Summary**\n\n- **CRM funnel**: Lead-to-win ratio remains highly optimal at **24.2%**.\n- **AI employee quotas**: Computing quota utilization is at **88%**. Sophia (Sales) maintains highest token yield at **14,500 requests** ($14.50 compute spend).\n- **Recommended Action**: Expand inventory stock limits on SKU-402 to prevent automated workforce manufacturing pipelines from stalling. Current stock-out risk is predicted in **4 days**.`;
      }
      setAiResult(result);
    }, 1500);
  };

  // Cross-filtering: Filtered datasets depending on interactive selections
  const getFilteredPaymentsData = () => {
    if (departmentFilter !== "All" && departmentFilter !== "Finance") {
      // Scale down values to simulate local department focus
      return PaymentsData.map((p) => ({
        ...p,
        stripe: Math.round(p.stripe * 0.15),
        paypal: Math.round(p.paypal * 0.12),
        transferwise: Math.round(p.transferwise * 0.08)
      }));
    }
    return PaymentsData;
  };

  const getFilteredSecurityData = () => {
    if (selectedBarLabel) {
      return SecurityThreatData.filter((s) => s.day === selectedBarLabel);
    }
    return SecurityThreatData;
  };

  return (
    <div className="space-y-6">
      {/* Upper Title Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg bg-indigo-500/10 ${getAccentClass("text")}`}>
              <Layers className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold font-mono text-zinc-100 uppercase tracking-tight">Business Intelligence & Analytics Hub</h1>
          </div>
          <p className="text-2xs text-zinc-400 mt-1">
            Analyze, filter, and customize dynamic KPI metrics across CRM, Logistics, Security, and Finances with integrated Gemini models.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Preset templates selector */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 h-9 text-3xs">
            <LayoutGrid className="h-3.5 w-3.5 text-zinc-500" />
            <select
              className="bg-transparent border-none text-zinc-300 font-mono font-bold focus:outline-none cursor-pointer"
              onChange={(e) => {
                const val = e.target.value as keyof typeof LayoutTemplates;
                if (val && LayoutTemplates[val]) {
                  setActiveWidgets(LayoutTemplates[val]);
                  addLog({
                    method: "SELECT",
                    endpoint: `/api/v1/bi/preset/${val}`,
                    status: 200,
                    type: "api"
                  });
                }
              }}
              defaultValue="executive"
            >
              <option value="executive">Executive Preset</option>
              <option value="financial">Financial Overview</option>
              <option value="operations">Supply Chain & MRP</option>
              <option value="security">Security & Compliance</option>
            </select>
          </div>

          {/* Privacy Scope toggle */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 h-9">
            <button
              onClick={() => setDashboardPrivacy("personal")}
              className={`px-3.5 h-full rounded text-3xs font-mono font-bold uppercase cursor-pointer ${
                dashboardPrivacy === "personal" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Personal
            </button>
            <button
              onClick={() => setDashboardPrivacy("shared")}
              className={`px-3.5 h-full rounded text-3xs font-mono font-bold uppercase cursor-pointer ${
                dashboardPrivacy === "shared" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Shared Board
            </button>
          </div>

          {/* AI Advisor Button */}
          <Button
            onClick={() => setAiSidebarOpen(!aiSidebarOpen)}
            className={`h-9 px-3.5 text-3xs font-bold font-mono uppercase tracking-wider ${
              aiSidebarOpen ? "bg-indigo-600 text-white" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800"
            }`}
          >
            <Bot className="h-4 w-4 mr-1.5" /> AI Analyst
          </Button>
        </div>
      </div>

      {/* FILTER PANEL SECTION */}
      <Card className="p-4 bg-zinc-900/40">
        <div className="flex flex-wrap items-center justify-between gap-4 text-left">
          <div className="flex flex-wrap items-center gap-3">
            {/* Date filter dropdown */}
            <div className="space-y-1">
              <span className="text-5xs font-bold font-mono text-zinc-500 uppercase tracking-widest block">Date Interval</span>
              <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 h-8">
                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                <select
                  className="bg-transparent border-none text-4xs font-mono font-bold text-zinc-300 focus:outline-none cursor-pointer"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="Q3 Current">Q3 Current</option>
                  <option value="Custom Range">Custom Audit</option>
                </select>
              </div>
            </div>

            {/* Department cross filter */}
            <div className="space-y-1">
              <span className="text-5xs font-bold font-mono text-zinc-500 uppercase tracking-widest block">Cross Department Filter</span>
              <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 h-8">
                <Filter className="h-3.5 w-3.5 text-zinc-500" />
                <select
                  className="bg-transparent border-none text-4xs font-mono font-bold text-zinc-300 focus:outline-none cursor-pointer"
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value);
                    addLog({
                      method: "FILTER",
                      endpoint: `/api/v1/bi/filter/department/${e.target.value}`,
                      status: 200,
                      type: "api"
                    });
                  }}
                >
                  <option value="All">All Departments</option>
                  <option value="Finance">Finance & Accounting</option>
                  <option value="Logistics">Warehouse Logistics</option>
                  <option value="Security">SOC Security</option>
                  <option value="CRM">CRM & Inbound Leads</option>
                </select>
              </div>
            </div>

            {/* Saved filter selection */}
            <div className="space-y-1">
              <span className="text-5xs font-bold font-mono text-zinc-500 uppercase tracking-widest block">Saved Filters</span>
              <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 h-8">
                <Sliders className="h-3.5 w-3.5 text-zinc-500" />
                <select
                  className="bg-transparent border-none text-4xs font-mono font-bold text-zinc-300 focus:outline-none cursor-pointer"
                  value={selectedFilter}
                  onChange={(e) => {
                    setSelectedFilter(e.target.value);
                    if (e.target.value === "US-West Logistics") {
                      setDepartmentFilter("Logistics");
                    } else if (e.target.value === "Q3 Performance") {
                      setDateRange("Q3 Current");
                    }
                  }}
                >
                  <option value="">Load Saved Filter...</option>
                  {savedFilters.map((sf) => (
                    <option key={sf} value={sf}>
                      {sf}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Drill Down Cleanups indicator */}
          {(selectedBarLabel || selectedPieSegment || departmentFilter !== "All") && (
            <div className="flex items-center gap-2">
              <span className="text-4xs font-mono text-indigo-400">
                Active drill-down:{" "}
                <strong>
                  {selectedBarLabel && `Day: ${selectedBarLabel} `}
                  {selectedPieSegment && `AI: ${selectedPieSegment} `}
                  {departmentFilter !== "All" && `Dept: ${departmentFilter}`}
                </strong>
              </span>
              <button
                onClick={() => {
                  setSelectedBarLabel(null);
                  setSelectedPieSegment(null);
                  setDepartmentFilter("All");
                }}
                className="text-4xs font-mono text-rose-400 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* DASHBOARD BUILDER DRAWER */}
      <Card className="p-4 bg-zinc-950/20 border border-dashed border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div>
            <div className="flex items-center gap-1.5">
              <LayoutGrid className="h-4 w-4 text-zinc-400" />
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-300">Layout Widget Builder</h4>
            </div>
            <p className="text-4xs text-zinc-500 mt-0.5">Toggle widgets on or off. Rearrange dashboard grids dynamically.</p>
          </div>

          {/* Widgets collection pill map */}
          <div className="flex flex-wrap gap-1.5">
            {AvailableWidgetsList.map((wid) => {
              const isActive = activeWidgets.includes(wid.id);
              return (
                <button
                  key={wid.id}
                  onClick={() => {
                    if (isActive) handleRemoveWidget(wid.id);
                    else handleAddWidget(wid.id);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-4xs font-mono font-bold uppercase transition-all cursor-pointer border ${
                    isActive
                      ? "bg-zinc-900 border-zinc-800 text-zinc-100"
                      : "bg-zinc-950 border-zinc-900 text-zinc-600 hover:text-zinc-400"
                  }`}
                >
                  {isActive ? <Check className="h-3 w-3 inline mr-1 text-emerald-400" /> : <Plus className="h-3 w-3 inline mr-1 text-zinc-600" />}
                  {wid.title.split(" ").slice(0, 2).join(" ")}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* BENCHMARKS & FORECASTS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-zinc-900/60 relative overflow-hidden" hoverable>
          <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-full blur-xl" />
          <p className="text-4xs font-mono font-bold uppercase tracking-widest text-zinc-500">Gross SLA Performance</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-bold font-mono text-zinc-200">93.4%</h3>
            <span className="text-5xs text-zinc-500 font-mono">Target: 95.0%</span>
          </div>
          {/* Progress bar Gauge mockup */}
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: "93.4%" }} />
          </div>
        </Card>

        <Card className="p-4 bg-zinc-900/60 relative overflow-hidden" hoverable>
          <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/5 rounded-full blur-xl" />
          <p className="text-4xs font-mono font-bold uppercase tracking-widest text-zinc-500">Lead Conversion SLA</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-bold font-mono text-zinc-200">24.2%</h3>
            <span className="text-5xs text-zinc-500 font-mono">Target: 20.0%</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className={`h-full ${getAccentClass("bg")}`} style={{ width: "120%" }} />
          </div>
        </Card>

        <Card className="p-4 bg-zinc-900/60 relative overflow-hidden" hoverable>
          <div className="absolute top-0 right-0 h-16 w-16 bg-amber-500/5 rounded-full blur-xl" />
          <p className="text-4xs font-mono font-bold uppercase tracking-widest text-zinc-500">Predicted Stock Runout</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-bold font-mono text-amber-500">4.2 Days</h3>
            <span className="text-5xs text-zinc-500 font-mono">Benchmark: &gt;10d</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full" style={{ width: "42%" }} />
          </div>
        </Card>

        <Card className="p-4 bg-zinc-900/60 relative overflow-hidden" hoverable>
          <div className="absolute top-0 right-0 h-16 w-16 bg-rose-500/5 rounded-full blur-xl" />
          <p className="text-4xs font-mono font-bold uppercase tracking-widest text-zinc-500">Unmitigated Vulnerability Rate</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-bold font-mono text-zinc-200">0.00%</h3>
            <span className="text-5xs text-zinc-500 font-mono">Target: 0.00%</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: "100%" }} />
          </div>
        </Card>
      </div>

      {/* CORE DYNAMIC LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Dynamic BI widgets column */}
        <div className={`lg:col-span-${aiSidebarOpen ? "9" : "12"} space-y-6`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {activeWidgets.map((widgetId, index) => {
              const spec = AvailableWidgetsList.find((w) => w.id === widgetId);
              if (!spec) return null;

              const isDoubleWidth = spec.size === "double";

              return (
                <div
                  key={widgetId}
                  className={`relative group ${
                    isDoubleWidth ? "md:col-span-2" : "md:col-span-1"
                  }`}
                >
                  <Card className="p-5">
                    {/* Widget header handles */}
                    <div className="flex justify-between items-start border-b border-zinc-850 pb-3 mb-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-5xs font-mono font-bold text-zinc-500 uppercase px-1.5 py-0.5 bg-zinc-950 rounded border border-zinc-850">
                            {spec.category}
                          </span>
                          <h4 className="text-xs font-bold font-mono text-zinc-200 tracking-wide">{spec.title}</h4>
                        </div>
                        <p className="text-5xs text-zinc-500 mt-0.5">{spec.desc}</p>
                      </div>

                      {/* Controls cluster */}
                      <div className="flex items-center gap-1.5">
                        {/* Drag Move handles */}
                        <button onClick={() => handleMoveWidgetUp(index)} className="p-1 hover:bg-zinc-850 rounded text-zinc-500 hover:text-zinc-300">
                          ▲
                        </button>
                        <button onClick={() => handleMoveWidgetDown(index)} className="p-1 hover:bg-zinc-850 rounded text-zinc-500 hover:text-zinc-300">
                          ▼
                        </button>

                        {/* Export data dropdown */}
                        <div className="relative group/exp">
                          <button className="p-1 hover:bg-zinc-850 rounded text-zinc-500 hover:text-zinc-300">
                            <Download className="h-3 w-3" />
                          </button>
                          <div className="hidden group-hover/exp:block absolute bottom-full right-0 mb-1.5 bg-zinc-900 border border-zinc-800 rounded-lg p-1 z-20 space-y-0.5 min-w-[70px]">
                            <button onClick={() => handleExportData(widgetId, "csv")} className="w-full text-left px-2 py-0.5 hover:bg-zinc-800 text-5xs font-mono rounded text-zinc-300">CSV</button>
                            <button onClick={() => handleExportData(widgetId, "json")} className="w-full text-left px-2 py-0.5 hover:bg-zinc-800 text-5xs font-mono rounded text-zinc-300">JSON</button>
                          </div>
                        </div>

                        {/* Maximize toggle */}
                        <button onClick={() => setFullscreenWidget(fullscreenWidget === widgetId ? null : widgetId)} className="p-1 hover:bg-zinc-850 rounded text-zinc-500 hover:text-zinc-300">
                          <Maximize2 className="h-3 w-3" />
                        </button>

                        {/* Delete widget */}
                        <button onClick={() => handleRemoveWidget(widgetId)} className="p-1 hover:bg-zinc-850 rounded text-zinc-500 hover:text-rose-400">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* RENDERING INDIVIDUAL VISUALIZATION TYPE */}
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        {/* WIDGET 1: Payments Area Flow */}
                        {widgetId === "payments-area" && (
                          <AreaChart data={getFilteredPaymentsData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="stripeCaptured" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={activeAccentColor} stopOpacity={0.25} />
                                <stop offset="95%" stopColor={activeAccentColor} stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="paypalCaptured" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                            <XAxis dataKey="interval" stroke="#52525b" fontSize={10} tickLine={false} />
                            <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                            <ChartTooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }} labelStyle={{ fontSize: 10 }} itemStyle={{ fontSize: 10 }} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                            <Area type="monotone" dataKey="stripe" name="Stripe Revenue" stroke={activeAccentColor} strokeWidth={2} fillOpacity={1} fill="url(#stripeCaptured)" />
                            <Area type="monotone" dataKey="paypal" name="PayPal Payments" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={1} fill="url(#paypalCaptured)" />
                            <Area type="monotone" dataKey="transferwise" name="TransferWise" stroke="#10b981" strokeWidth={1.5} fillOpacity={0} />
                          </AreaChart>
                        )}

                        {/* WIDGET 2: Logistics SLA Bar */}
                        {widgetId === "logistics-bar" && (
                          <BarChart data={LogisticsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                            <XAxis dataKey="label" stroke="#52525b" fontSize={10} />
                            <YAxis stroke="#52525b" fontSize={10} />
                            <ChartTooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }} />
                            <Legend wrapperStyle={{ fontSize: 10 }} />
                            <Bar dataKey="onTime" name="On Time Delivery %" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                            <Bar dataKey="capacity" name="Truck Load Ratio" fill={activeAccentColor} radius={[4, 4, 0, 0]} maxBarSize={30} />
                          </BarChart>
                        )}

                        {/* WIDGET 3: SOC-2 Threats Bar */}
                        {widgetId === "security-threats" && (
                          <BarChart
                            data={getFilteredSecurityData()}
                            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                            onClick={(data) => {
                              if (data && data.activeLabel) {
                                setSelectedBarLabel(String(data.activeLabel));
                              }
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                            <XAxis dataKey="day" stroke="#52525b" fontSize={10} />
                            <YAxis stroke="#52525b" fontSize={10} />
                            <ChartTooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }} />
                            <Bar dataKey="bruteForce" name="Brute force Blocked" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={20} />
                            <Bar dataKey="apiAbuse" name="API Abuse Prevented" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={20} />
                          </BarChart>
                        )}

                        {/* WIDGET 4: AI Compute Donut proportional */}
                        {widgetId === "ai-compute-donut" && (
                          <PieChart>
                            <Pie
                              data={AiComputeUsage}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={80}
                              paddingAngle={3}
                              dataKey="requests"
                              nameKey="name"
                              onClick={(entry) => setSelectedPieSegment(entry.name || null)}
                            >
                              {AiComputeUsage.map((entry, idx) => (
                                <Cell key={`cell-${idx}`} fill={entry.fill} stroke={selectedPieSegment === entry.name ? "#fff" : "none"} strokeWidth={2} />
                              ))}
                            </Pie>
                            <ChartTooltip contentStyle={{ backgroundColor: "#09090b" }} />
                            <Legend wrapperStyle={{ fontSize: 9 }} />
                          </PieChart>
                        )}

                        {/* WIDGET 5: Radar department metrics comparisons */}
                        {widgetId === "radar-departments" && (
                          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={DepartmentOverviewRadar}>
                            <PolarGrid stroke="#27272a" />
                            <PolarAngleAxis dataKey="subject" stroke="#71717a" fontSize={8} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#27272a" />
                            <Radar name="Active Target" dataKey="A" stroke={activeAccentColor} fill={activeAccentColor} fillOpacity={0.35} />
                            <Radar name="Baseline Target" dataKey="B" stroke="#71717a" fill="#27272a" fillOpacity={0.1} />
                            <Legend wrapperStyle={{ fontSize: 9 }} />
                          </RadarChart>
                        )}

                        {/* WIDGET 6: Sales Funnel Chart */}
                        {widgetId === "funnel-sales" && (
                          <BarChart layout="vertical" data={SalesFunnelData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.2} />
                            <XAxis type="number" stroke="#52525b" fontSize={9} />
                            <YAxis dataKey="name" type="category" stroke="#52525b" fontSize={8} width={100} />
                            <ChartTooltip contentStyle={{ backgroundColor: "#09090b" }} />
                            <Bar dataKey="value" name="Lead conversion flow" radius={[0, 4, 4, 0]}>
                              {SalesFunnelData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        )}

                        {/* WIDGET 7: Scatter Leads */}
                        {widgetId === "scatter-leads" && (
                          <ScatterChart margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid stroke="#27272a" opacity={0.3} />
                            <XAxis type="number" dataKey="sessions" name="Sessions Volume" stroke="#52525b" fontSize={9} />
                            <YAxis type="number" dataKey="salesValue" name="Captured Leads Value" stroke="#52525b" fontSize={9} />
                            <ZAxis type="number" dataKey="rating" range={[30, 200]} name="Lead Rating" />
                            <ChartTooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ backgroundColor: "#09090b" }} />
                            <Scatter name="Leads" data={LeadScatterData} fill={activeAccentColor} />
                          </ScatterChart>
                        )}

                        {/* WIDGET 8: MRP Supply indexes */}
                        {widgetId === "kpi-mrp" && (
                          <BarChart data={LogisticsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                            <XAxis dataKey="label" stroke="#52525b" fontSize={10} />
                            <YAxis stroke="#52525b" fontSize={10} />
                            <ChartTooltip contentStyle={{ backgroundColor: "#09090b" }} />
                            <Bar dataKey="costPerMile" name="Cost per mile (USD)" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={30} />
                            <Bar dataKey="exceptions" name="MRP exception delay rate" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={30} />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              );
            })}

          </div>
        </div>

        {/* Dynamic AI Sidebar panel column (Occupies 3 columns) */}
        {aiSidebarOpen && (
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-4 bg-zinc-900/40 border-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/5 rounded-full blur-xl" />

              <div className="flex items-center gap-2 mb-3">
                <BrainCircuit className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">AI BI Analyst</h4>
              </div>

              <p className="text-3xs text-zinc-400 leading-relaxed text-left">
                Query the Gemini engine to search logs, perform anomaly audits on multi-department sets, and automatically formulate executive forecasts.
              </p>

              <div className="mt-4 space-y-2">
                <p className="text-4xs font-mono font-bold text-zinc-500 uppercase tracking-widest text-left">Preset Search Prompts</p>

                <button
                  onClick={() => {
                    setAiPrompt("Explain revenue changes and forecast Stripe vs PayPal billing settlements.");
                    handleAiAnalyticsQuery("Explain revenue changes and forecast Stripe vs PayPal billing settlements.");
                  }}
                  className="w-full text-left p-2 rounded-lg bg-zinc-950 border border-zinc-850 hover:bg-zinc-850 hover:border-zinc-700 transition-all cursor-pointer text-4xs font-mono text-zinc-300"
                >
                  "Explain revenue changes"
                </button>

                <button
                  onClick={() => {
                    setAiPrompt("Analyze high threat alerts and correlate with brute-force logs.");
                    handleAiAnalyticsQuery("Analyze high threat alerts and correlate with brute-force logs.");
                  }}
                  className="w-full text-left p-2 rounded-lg bg-zinc-950 border border-zinc-850 hover:bg-zinc-850 hover:border-zinc-700 transition-all cursor-pointer text-4xs font-mono text-zinc-300"
                >
                  "Detect analytical anomalies"
                </button>

                <button
                  onClick={() => {
                    setAiPrompt("Evaluate active AI token compute spend quota efficiency.");
                    handleAiAnalyticsQuery("Evaluate active AI token compute spend quota efficiency.");
                  }}
                  className="w-full text-left p-2 rounded-lg bg-zinc-950 border border-zinc-850 hover:bg-zinc-850 hover:border-zinc-700 transition-all cursor-pointer text-4xs font-mono text-zinc-300"
                >
                  "Evaluate AI employee yield"
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-850/60">
                <div className="space-y-1 text-left">
                  <span className="text-3xs font-bold font-mono text-zinc-400 uppercase">Natural Language Query</span>
                  <div className="relative mt-1">
                    <Input
                      placeholder="Ask Gemini to forecast..."
                      className="text-4xs font-mono h-8 w-full pr-10"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                    />
                    <button
                      onClick={() => handleAiAnalyticsQuery()}
                      className={`absolute right-1.5 top-1.5 p-1 rounded hover:bg-zinc-800 text-indigo-400 transition-colors ${
                        aiLoading ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <Plus className="h-3.5 w-3.5 transform rotate-45" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Response output */}
              {(aiLoading || aiResult) && (
                <div className="mt-4 p-3 bg-zinc-950 border border-zinc-850 rounded-lg text-left">
                  {aiLoading ? (
                    <div className="py-4 text-center">
                      <RefreshCw className="h-5 w-5 text-indigo-400 animate-spin mx-auto mb-1.5" />
                      <span className="text-4xs font-mono text-zinc-500 animate-pulse">Running regressions on Gemini...</span>
                    </div>
                  ) : (
                    <div className="space-y-1 text-4xs leading-relaxed text-zinc-300">
                      {aiResult.split("\n").map((line, idx) => {
                        if (line.startsWith("###")) {
                          return <h5 key={idx} className="text-3xs font-bold font-mono uppercase tracking-wider text-zinc-100 mt-2">{line.replace("###", "")}</h5>;
                        } else if (line.startsWith("-")) {
                          return <li key={idx} className="list-disc ml-3 text-zinc-400">{line.replace("-", "").trim()}</li>;
                        } else {
                          return <p key={idx} className="text-zinc-400 mt-1">{line}</p>;
                        }
                      })}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}

      </div>

      {/* FULLSCREEN ZOOM MODAL */}
      <AnimatePresence>
        {fullscreenWidget && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-800 w-full max-w-5xl rounded-2xl p-6 relative shadow-2xl"
            >
              <button
                onClick={() => setFullscreenWidget(null)}
                className="absolute top-4 right-4 p-1 rounded hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                <Minimize2 className="h-4.5 w-4.5" />
              </button>

              <div className="mb-4">
                <h3 className="text-sm font-bold font-mono text-zinc-100 uppercase tracking-wider">
                  {AvailableWidgetsList.find((w) => w.id === fullscreenWidget)?.title}
                </h3>
                <p className="text-3xs text-zinc-500 mt-0.5">High Fidelity Zoom View</p>
              </div>

              {/* Rerendering visual widget in Fullscreen */}
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {fullscreenWidget === "payments-area" ? (
                    <AreaChart data={getFilteredPaymentsData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="stripeCapturedF" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={activeAccentColor} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={activeAccentColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                      <XAxis dataKey="interval" stroke="#52525b" />
                      <YAxis stroke="#52525b" />
                      <ChartTooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }} />
                      <Legend />
                      <Area type="monotone" dataKey="stripe" name="Stripe Settlements" stroke={activeAccentColor} strokeWidth={2} fillOpacity={1} fill="url(#stripeCapturedF)" />
                      <Area type="monotone" dataKey="paypal" name="PayPal Settlements" stroke="#3b82f6" strokeWidth={1.5} />
                    </AreaChart>
                  ) : fullscreenWidget === "logistics-bar" ? (
                    <BarChart data={LogisticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="label" stroke="#52525b" />
                      <YAxis stroke="#52525b" />
                      <ChartTooltip contentStyle={{ backgroundColor: "#09090b" }} />
                      <Legend />
                      <Bar dataKey="onTime" name="On Time Delivery %" fill="#10b981" />
                      <Bar dataKey="capacity" name="Truck Load Ratio" fill={activeAccentColor} />
                    </BarChart>
                  ) : fullscreenWidget === "security-threats" ? (
                    <BarChart data={getFilteredSecurityData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="day" stroke="#52525b" />
                      <YAxis stroke="#52525b" />
                      <ChartTooltip contentStyle={{ backgroundColor: "#09090b" }} />
                      <Bar dataKey="bruteForce" name="Brute force Blocked" fill="#f43f5e" />
                      <Bar dataKey="apiAbuse" name="API Abuse Prevented" fill="#f59e0b" />
                    </BarChart>
                  ) : fullscreenWidget === "ai-compute-donut" ? (
                    <PieChart>
                      <Pie data={AiComputeUsage} cx="50%" cy="50%" innerRadius={100} outerRadius={160} paddingAngle={3} dataKey="requests" nameKey="name">
                        {AiComputeUsage.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip contentStyle={{ backgroundColor: "#09090b" }} />
                      <Legend />
                    </PieChart>
                  ) : fullscreenWidget === "radar-departments" ? (
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={DepartmentOverviewRadar}>
                      <PolarGrid stroke="#27272a" />
                      <PolarAngleAxis dataKey="subject" stroke="#71717a" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Active Target" dataKey="A" stroke={activeAccentColor} fill={activeAccentColor} fillOpacity={0.35} />
                      <Legend />
                    </RadarChart>
                  ) : fullscreenWidget === "funnel-sales" ? (
                    <BarChart layout="vertical" data={SalesFunnelData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis type="number" stroke="#52525b" />
                      <YAxis dataKey="name" type="category" stroke="#52525b" width={120} />
                      <ChartTooltip contentStyle={{ backgroundColor: "#09090b" }} />
                      <Bar dataKey="value" name="Lead conversion flow">
                        {SalesFunnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : fullscreenWidget === "scatter-leads" ? (
                    <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#27272a" />
                      <XAxis type="number" dataKey="sessions" name="Sessions Volume" stroke="#52525b" />
                      <YAxis type="number" dataKey="salesValue" name="Captured Leads Value" stroke="#52525b" />
                      <ZAxis type="number" dataKey="rating" range={[50, 400]} />
                      <ChartTooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter name="Leads" data={LeadScatterData} fill={activeAccentColor} />
                    </ScatterChart>
                  ) : (
                    <BarChart data={LogisticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="label" stroke="#52525b" />
                      <YAxis stroke="#52525b" />
                      <ChartTooltip contentStyle={{ backgroundColor: "#09090b" }} />
                      <Bar dataKey="costPerMile" name="Cost per mile (USD)" fill="#ec4899" />
                      <Bar dataKey="exceptions" name="MRP exception delay rate" fill="#f43f5e" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
