import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "../store/useStore";
import { Card, Button, Badge, Input, Dialog, getAccentClass, getRadiusClass } from "./UI";
import {
  Sparkles,
  TrendingUp,
  Truck,
  ShieldCheck,
  BrainCircuit,
  Settings,
  MoveUp,
  MoveDown,
  Minimize2,
  Maximize2,
  PlusSquare,
  Search,
  Command,
  Mic,
  MicOff,
  ChevronRight,
  Database,
  Building2,
  Users,
  Layers,
  CheckSquare,
  Bell,
  RefreshCw,
  Clock,
  ArrowRight,
  Sparkle,
  Zap,
  Check,
  AlertTriangle,
  HelpCircle,
  FileText,
  Activity
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer
} from "recharts";

// Default layouts of the configurable widgets
const DEFAULT_WIDGETS = [
  { id: "rev", title: "Captured Invoices", size: "normal", collapsed: false, accent: "indigo", metricType: "revenue" },
  { id: "log", title: "Logistics SLA", size: "normal", collapsed: false, accent: "emerald", metricType: "sla" },
  { id: "sec", title: "Mitigated Threats", size: "normal", collapsed: false, accent: "rose", metricType: "threats" },
  { id: "ai", title: "AI Employee Count", size: "normal", collapsed: false, accent: "violet", metricType: "agents" },
  { id: "chart", title: "Operations Flow Analysis", size: "wide", collapsed: false, accent: "indigo", metricType: "cashflow" },
  { id: "tasks", title: "Workspace Tasks Pipeline", size: "wide", collapsed: false, accent: "violet", metricType: "tasks" },
  { id: "decisions", title: "Strategic Autonomous Decisions", size: "normal", collapsed: false, accent: "amber", metricType: "decisions" }
];

interface ExecutiveDashboardProps {
  localCompanies: any[];
  localDepartments: any[];
  localEmployees: any[];
  localLeads: any[];
  localTasks: any[];
  loadingDb: boolean;
  fetchDatabase: () => Promise<void>;
  setShowAddModal: (modal: "company" | "dept" | "emp" | "lead" | "task" | null) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  localCompanies,
  localDepartments,
  localEmployees,
  localLeads,
  localTasks,
  loadingDb,
  fetchDatabase,
  setShowAddModal
}) => {
  const {
    accentColor,
    currentUserRole,
    setAiPanelOpen,
    addAiMessage,
    addLog,
    logs
  } = useStore();

  // Widget states (loaded from localStorage if exists, else defaults)
  const [widgets, setWidgets] = useState<typeof DEFAULT_WIDGETS>(() => {
    const saved = localStorage.getItem("exshopi_dashboard_widgets");
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });

  // Clock state
  const [currentTime, setCurrentTime] = useState("");

  // Spotlight search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ type: string; name: string; detail: string }[]>([]);

  // Voice AI micro state
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "processing">("idle");
  const [voiceText, setVoiceText] = useState("");

  // AI CEO strategic brief modal state
  const [showBriefModal, setShowBriefModal] = useState(false);

  // Widget settings configuration state
  const [configuringWidgetId, setConfiguringWidgetId] = useState<string | null>(null);
  const [tempWidgetTitle, setTempWidgetTitle] = useState("");
  const [tempWidgetAccent, setTempWidgetAccent] = useState("");

  // Filter for activity center logs
  const [activityFilter, setActivityFilter] = useState<"all" | "api" | "security" | "system">("all");

  // Save widgets configuration to localStorage
  useEffect(() => {
    localStorage.setItem("exshopi_dashboard_widgets", JSON.stringify(widgets));
  }, [widgets]);

  // Live Clock effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        }) + " UTC"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Spotlight Global Search filters
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: typeof searchResults = [];

    // Search Employees
    localEmployees.forEach((emp) => {
      if (emp.full_name?.toLowerCase().includes(query) || emp.position?.toLowerCase().includes(query)) {
        results.push({
          type: "Worker",
          name: emp.full_name,
          detail: `${emp.position} • $${emp.salary?.toLocaleString()}/mo`
        });
      }
    });

    // Search Tasks
    localTasks.forEach((task) => {
      if (task.title?.toLowerCase().includes(query) || task.assigned_to?.toLowerCase().includes(query)) {
        results.push({
          type: "Task",
          name: task.title,
          detail: `Assigned: ${task.assigned_to} • Priority: ${task.priority}`
        });
      }
    });

    // Search Departments
    localDepartments.forEach((dept) => {
      if (dept.name?.toLowerCase().includes(query) || dept.code?.toLowerCase().includes(query)) {
        results.push({
          type: "Department",
          name: dept.name,
          detail: `Code: ${dept.code} • Budget: $${dept.budget?.toLocaleString()}`
        });
      }
    });

    // Search Companies
    localCompanies.forEach((comp) => {
      if (comp.company_name?.toLowerCase().includes(query) || comp.industry?.toLowerCase().includes(query)) {
        results.push({
          type: "Company",
          name: comp.company_name,
          detail: `${comp.industry} • ${comp.city}, ${comp.country}`
        });
      }
    });

    setSearchResults(results.slice(0, 6));
  }, [searchQuery, localEmployees, localTasks, localDepartments, localCompanies]);

  // Handle widget movement (re-ordering)
  const moveWidget = (id: string, direction: "up" | "down") => {
    const idx = widgets.findIndex((w) => w.id === id);
    if (idx === -1) return;
    const newWidgets = [...widgets];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= widgets.length) return;

    // Swap elements
    const temp = newWidgets[idx];
    newWidgets[idx] = newWidgets[targetIdx];
    newWidgets[targetIdx] = temp;
    setWidgets(newWidgets);

    addLog({
      method: "SYSTEM",
      endpoint: `Widget Rearranged: ${id} to ${targetIdx}`,
      status: 200,
      type: "websocket",
      response: { widgetsOrder: newWidgets.map((w) => w.id) }
    });
  };

  // Toggle widget size (resizable normal <-> wide)
  const toggleWidgetSize = (id: string) => {
    setWidgets(
      widgets.map((w) => (w.id === id ? { ...w, size: w.size === "normal" ? "wide" : "normal" } : w))
    );
  };

  // Toggle widget collapse
  const toggleWidgetCollapse = (id: string) => {
    setWidgets(
      widgets.map((w) => (w.id === id ? { ...w, collapsed: !w.collapsed } : w))
    );
  };

  // Open widget configuration dialog
  const configureWidget = (id: string, title: string, accent: string) => {
    setConfiguringWidgetId(id);
    setTempWidgetTitle(title);
    setTempWidgetAccent(accent);
  };

  // Save widget customization
  const saveWidgetConfig = () => {
    setWidgets(
      widgets.map((w) =>
        w.id === configuringWidgetId
          ? { ...w, title: tempWidgetTitle, accent: tempWidgetAccent }
          : w
      )
    );
    setConfiguringWidgetId(null);
  };

  // Handle Voice AI microphone action
  const handleVoiceAI = () => {
    if (voiceState !== "idle") {
      setVoiceState("idle");
      setVoiceText("");
      return;
    }

    setVoiceState("listening");
    setVoiceText("Listening for directive...");

    // Simulated Speech-to-text typing effect
    setTimeout(() => {
      setVoiceState("processing");
      setVoiceText("Processing dynamic audio stream...");
      
      const fullText = "Chief Agent, dispatch logistics reorder loop and output Q3 strategic review briefing.";
      let index = 0;
      const interval = setInterval(() => {
        setVoiceText((prev) => fullText.substring(0, index + 1));
        index++;
        if (index >= fullText.length) {
          clearInterval(interval);
          
          // Complete processing
          setTimeout(() => {
            setVoiceState("idle");
            
            // Auto open AI sidebar & inject message
            setAiPanelOpen(true);
            addAiMessage({
              sender: "user",
              content: `Voice Dispatch: "${fullText}"`
            });
            
            addLog({
              method: "VOICE",
              endpoint: "/api/v1/workforce/voice-commands",
              status: 200,
              type: "websocket",
              payload: { phrase: fullText, confidence: 0.98 }
            });

            // Trigger visual system notification
            useStore.getState().addNotification({
              title: "Voice Directive Dispatched",
              description: `Vocal command parsed with 98% confidence. AI Advisor is compiling recommendations.`,
              type: "success"
            });
          }, 800);
        }
      }, 35);
    }, 1800);
  };

  // Dynamic Chart Accent Colors mapping
  const getThemeColor = (acc: string) => {
    const mappings: Record<string, string> = {
      indigo: "#6366f1",
      violet: "#8b5cf6",
      emerald: "#10b981",
      amber: "#f59e0b",
      rose: "#f43f5e",
      slate: "#71717a"
    };
    return mappings[acc] || mappings.indigo;
  };

  const getBorderAccent = (acc: string) => {
    const mappings: Record<string, string> = {
      indigo: "border-indigo-500/20 shadow-indigo-500/5",
      violet: "border-violet-500/20 shadow-violet-500/5",
      emerald: "border-emerald-500/20 shadow-emerald-500/5",
      amber: "border-amber-500/20 shadow-amber-500/5",
      rose: "border-rose-500/20 shadow-rose-500/5",
      slate: "border-zinc-500/20 shadow-zinc-500/5"
    };
    return mappings[acc] || "border-indigo-500/20";
  };

  // Filtered system logs for activity center
  const filteredLogs = logs.filter((l) => {
    if (activityFilter === "all") return true;
    if (activityFilter === "api") return l.type === "api";
    if (activityFilter === "security") return l.type === "security";
    if (activityFilter === "system") return l.type === "websocket" || l.method === "SYSTEM";
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Search and Voice Header Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Spotlight Style Search Input */}
        <div className="lg:col-span-8 relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Spotlight global search... (Workers, tasks, departments, or files)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs py-3 pl-11 pr-16 rounded-xl focus:outline-none focus:border-zinc-750 focus:ring-1 focus:ring-zinc-800 transition-all shadow-lg"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-[9px] text-zinc-500 font-bold font-mono">⌘K</kbd>
            </div>
          </div>

          {/* Floating Search Results */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 right-0 mt-2 bg-zinc-900/95 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-40 p-1.5 backdrop-blur-md"
              >
                <div className="p-2 border-b border-zinc-800/40 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Search Results</span>
                  <button onClick={() => setSearchQuery("")} className="text-[10px] text-zinc-400 hover:underline">Dismiss</button>
                </div>
                <div className="py-1 space-y-0.5">
                  {searchResults.map((res, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 text-xs rounded-lg hover:bg-zinc-850/60 transition-colors flex justify-between items-center cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-200">{res.name}</span>
                        <span className="text-3xs text-zinc-400 mt-0.5">{res.detail}</span>
                      </div>
                      <Badge variant="accent" className="text-[9px] scale-90">{res.type}</Badge>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live Clock & Quick Refresh */}
        <div className="lg:col-span-4 flex items-center justify-end gap-3.5">
          <Card className="px-4 py-2.5 flex items-center gap-2 bg-zinc-900 border-zinc-850" glass={false}>
            <Clock className="h-4 w-4 text-zinc-500" />
            <span className="text-xs font-mono font-semibold text-zinc-400 tracking-wide">{currentTime || "00:00:00 UTC"}</span>
          </Card>
          
          <Button
            variant="outline"
            size="sm"
            className="h-9.5 rounded-xl border border-zinc-800 hover:bg-zinc-900/60 font-semibold"
            icon={<RefreshCw className={`h-3.5 w-3.5 ${loadingDb ? "animate-spin text-zinc-300" : "text-zinc-500"}`} />}
            onClick={fetchDatabase}
            disabled={loadingDb}
          >
            Sync Ledger
          </Button>
        </div>
      </div>

      {/* Welcome Banner & Company Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Executive Welcome Banner */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-r from-zinc-900/60 via-zinc-900/30 to-transparent border border-zinc-800/80 relative overflow-hidden flex flex-col justify-between min-h-[13rem] h-auto gap-4 shadow-lg">
          <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="accent">Global Autonomous Workspace</Badge>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2 mt-3 tracking-tight">
              Welcome Back, Ahsan <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
            </h1>
            <p className="text-xs text-zinc-400 max-w-xl mt-1.5 leading-relaxed">
              Exshopi AI core operations are performing perfectly. Automated workforce pipelines are active with 100% SLA compliance. Security threats mitigated successfully.
            </p>
          </div>

          <div className="flex items-center gap-4 border-t border-zinc-850/60 pt-4 mt-2">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">AUTHORIZED ROLE</span>
              <span className="text-xs font-semibold text-zinc-300 mt-0.5">{currentUserRole}</span>
            </div>
            <div className="h-6 w-px bg-zinc-800/60" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">ACTIVE ENVIRONMENT</span>
              <span className="text-xs font-mono font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                ● EX-SECURE-PROD
              </span>
            </div>
          </div>
        </div>

        {/* Company Health Score Gauge */}
        <Card className="p-5 flex flex-col justify-between border-zinc-800/80 shadow-md relative overflow-hidden min-h-[13rem] h-auto gap-4">
          <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">Company Health Rating</span>
            <Badge variant="success">Excellent</Badge>
          </div>

          <div className="flex items-center gap-5 my-1.5">
            {/* SVG Circular Meter */}
            <div className="relative h-20 w-20 flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-zinc-800/40"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: "96, 100" }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="text-emerald-500"
                  strokeWidth="3.5"
                  strokeDasharray="96, 100"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold font-mono text-zinc-100">96</span>
                <span className="text-[8px] text-zinc-500 font-bold -mt-1 font-mono">/100</span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                <span>SLA Compliance: <strong className="text-zinc-200">99.4%</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                <span>Uptime: <strong className="text-zinc-200">100%</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Fin-Liquidity: <strong className="text-zinc-200">A+ Stable</strong></span>
              </div>
            </div>
          </div>

          <div className="text-3xs text-zinc-500 border-t border-zinc-850/60 pt-2 flex items-center gap-1 font-semibold">
            <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
            Integrity score certified under real-time SOC-2 active agents audit.
          </div>
        </Card>
      </div>

      {/* AI CEO Summary & Voice Entry Point */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* AI CEO Strategic Summary Briefing */}
        <div className="lg:col-span-8">
          <Card className="p-5 border-zinc-800/80 relative overflow-hidden flex flex-col justify-between min-h-[14rem] h-auto gap-4" hoverable>
            <div className="absolute top-0 right-0 h-32 w-32 bg-violet-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-850/60">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-indigo-400 animate-pulse" />
                <span className="text-2xs font-bold uppercase tracking-wider text-zinc-300">Chief Executive Agent Briefing</span>
              </div>
              <Badge variant="accent" className="text-[9px]">Strategic Directive</Badge>
            </div>

            <div className="my-3 flex gap-4 items-start">
              <div className="h-11 w-11 rounded-xl overflow-hidden border border-zinc-800 flex-shrink-0 bg-zinc-950/40 p-0.5">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                  alt="AI CEO"
                  className="h-full w-full object-cover rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">CHIEF EXECUTIVE AGENT</span>
                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  &ldquo;Our Q3 sales runway is stable at $10.4M. SOP vectors indicate the largest operational bottle-neck is DHL carrier speed SLA drop. Approved Net-15 invoice incentives to optimize working capital.&rdquo;
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-850/60 pt-3">
              <span className="text-3xs text-zinc-500 font-semibold uppercase tracking-wider">SECURE DIRECTIVE ID: CEA-Q3-09</span>
              <Button
                variant="primary"
                size="sm"
                className="h-8 text-2xs uppercase font-bold tracking-wider px-3"
                icon={<FileText className="h-3 w-3" />}
                onClick={() => setShowBriefModal(true)}
              >
                Compile Daily Strategic Review
              </Button>
            </div>
          </Card>
        </div>

        {/* Voice AI Operator Command Entry Point */}
        <div className="lg:col-span-4">
          <Card className="p-5 border-zinc-800/80 flex flex-col justify-between min-h-[14rem] h-auto gap-4 relative overflow-hidden text-center bg-zinc-900/20">
            <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex flex-col items-center">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">Voice AI Operations Desk</span>
              <p className="text-[10px] text-zinc-500 mt-0.5">Vocalized strategic operations controller</p>
            </div>

            {/* Micro Orb */}
            <div className="flex flex-col items-center justify-center my-2">
              <motion.button
                onClick={handleVoiceAI}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`h-16 w-16 rounded-full flex items-center justify-center border relative cursor-pointer shadow-xl ${
                  voiceState === "listening"
                    ? "bg-rose-950/50 border-rose-500 text-rose-400 animate-pulse shadow-rose-950/40"
                    : voiceState === "processing"
                    ? "bg-indigo-950/50 border-indigo-500 text-indigo-400 shadow-indigo-950/40"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {voiceState === "listening" ? (
                  <Mic className="h-6 w-6 animate-pulse" />
                ) : voiceState === "processing" ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}

                {/* Animated Spectrum Lines (only while listening) */}
                {voiceState === "listening" && (
                  <div className="absolute -bottom-2 flex gap-0.5 justify-center">
                    <span className="h-3 w-0.5 bg-rose-500 rounded animate-bounce [animation-duration:0.6s]" />
                    <span className="h-5 w-0.5 bg-rose-500 rounded animate-bounce [animation-delay:0.1s] [animation-duration:0.4s]" />
                    <span className="h-4 w-0.5 bg-rose-500 rounded animate-bounce [animation-delay:0.2s] [animation-duration:0.7s]" />
                    <span className="h-2 w-0.5 bg-rose-500 rounded animate-bounce [animation-delay:0.3s] [animation-duration:0.5s]" />
                  </div>
                )}
              </motion.button>

              <span className="text-3xs font-semibold text-zinc-400 uppercase tracking-widest mt-3.5 font-mono">
                {voiceState === "idle" ? "TAP MICROPHONE TO BROADCAST" : voiceState.toUpperCase()}
              </span>
            </div>

            {/* Voice Speech to text preview */}
            <div className="h-10 bg-zinc-950 border border-zinc-850/80 rounded-xl px-3 flex items-center justify-center text-center">
              <span className={`text-[10px] leading-relaxed line-clamp-2 ${voiceState === "idle" ? "text-zinc-500 italic" : "text-zinc-200"}`}>
                {voiceText || "No voice broadcast currently active."}
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Movable, Resizable, Collapsible Dashboard Bento-Grid Widgets */}
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60 mb-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Custom Workspace Control Room</h3>
            <p className="text-3xs text-zinc-500 mt-0.5">Drag/Re-order or scale dynamic cards below. Custom layouts persist in local storage.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-2xs font-semibold h-8 rounded-lg border border-zinc-850"
            icon={<Settings className="h-3.5 w-3.5" />}
            onClick={() => {
              setWidgets(DEFAULT_WIDGETS);
              localStorage.removeItem("exshopi_dashboard_widgets");
              addLog({
                method: "SYSTEM",
                endpoint: "Reset widget configurations to defaults",
                status: 200,
                type: "websocket"
              });
            }}
          >
            Reset Bento Layout
          </Button>
        </div>

        {/* Dynamic Widget Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {widgets.map((widget, index) => {
            const isWide = widget.size === "wide";
            const borderAccent = getBorderAccent(widget.accent);
            const graphAccent = getThemeColor(widget.accent);

            return (
              <div
                key={widget.id}
                className={`transition-all duration-300 ${
                  isWide ? "md:col-span-2 lg:col-span-2" : "md:col-span-1 lg:col-span-1"
                }`}
              >
                <Card className={`border ${borderAccent} h-full flex flex-col justify-between`} glass={true}>
                  
                  {/* Widget Header Controls */}
                  <div className="flex justify-between items-center bg-zinc-950/30 px-4.5 py-3 border-b border-zinc-850/60 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-zinc-950 border border-zinc-850">
                        {widget.metricType === "revenue" && <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />}
                        {widget.metricType === "sla" && <Truck className="h-3.5 w-3.5 text-emerald-400" />}
                        {widget.metricType === "threats" && <ShieldCheck className="h-3.5 w-3.5 text-rose-400" />}
                        {widget.metricType === "agents" && <BrainCircuit className="h-3.5 w-3.5 text-violet-400" />}
                        {widget.metricType === "cashflow" && <Activity className="h-3.5 w-3.5 text-indigo-400" />}
                        {widget.metricType === "tasks" && <CheckSquare className="h-3.5 w-3.5 text-violet-400" />}
                        {widget.metricType === "decisions" && <Sparkle className="h-3.5 w-3.5 text-amber-400 animate-pulse" />}
                      </span>
                      <span className="text-2xs font-bold text-zinc-300 uppercase tracking-wider">{widget.title}</span>
                    </div>

                    {/* Controls cluster */}
                    <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                      {/* Move Up */}
                      {index > 0 && (
                        <button
                          onClick={() => moveWidget(widget.id, "up")}
                          className="p-1 rounded hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200"
                        >
                          <MoveUp className="h-3 w-3" />
                        </button>
                      )}
                      {/* Move Down */}
                      {index < widgets.length - 1 && (
                        <button
                          onClick={() => moveWidget(widget.id, "down")}
                          className="p-1 rounded hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200"
                        >
                          <MoveDown className="h-3 w-3" />
                        </button>
                      )}
                      {/* Expand/Contract (Size) */}
                      <button
                        onClick={() => toggleWidgetSize(widget.id)}
                        className="p-1 rounded hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200"
                      >
                        {isWide ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                      </button>
                      {/* Settings config button */}
                      <button
                        onClick={() => configureWidget(widget.id, widget.title, widget.accent)}
                        className="p-1 rounded hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200"
                      >
                        <Settings className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Widget Body */}
                  <AnimatePresence initial={false}>
                    {!widget.collapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4.5 flex-1 flex flex-col justify-between"
                      >
                        {/* 1. Revenue Static Widget */}
                        {widget.metricType === "revenue" && (
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <span className="text-3xs font-semibold text-zinc-500 uppercase tracking-widest font-mono">NET RECOVERED FUNDS</span>
                              <h3 className="text-2xl font-bold font-mono text-zinc-100">$516,000.00</h3>
                              <p className="text-emerald-400 text-3xs font-medium flex items-center gap-1">
                                ↑ 12.4% <span className="text-zinc-500 font-normal">SLA settlement target clear</span>
                              </p>
                            </div>
                            <div className="text-[10px] text-zinc-400 leading-relaxed font-sans bg-zinc-950/40 border border-zinc-850 p-2.5 rounded-lg">
                              <strong>Stripe Checkout</strong> reconciled 100% compliant. Next auto disbursement batch fires in 4 hours.
                            </div>
                          </div>
                        )}

                        {/* 2. SLA Tracker Widget */}
                        {widget.metricType === "sla" && (
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <span className="text-3xs font-semibold text-zinc-500 uppercase tracking-widest font-mono">COURIER DISPATCH SLA</span>
                              <h3 className="text-2xl font-bold font-mono text-zinc-100">94.3%</h3>
                              <p className="text-emerald-400 text-3xs font-medium flex items-center gap-1">
                                ↑ 1.8% <span className="text-zinc-500 font-normal">average transit turnaround speed</span>
                              </p>
                            </div>
                            <div className="text-[10px] text-zinc-400 leading-relaxed font-sans bg-zinc-950/40 border border-zinc-850 p-2.5 rounded-lg">
                              <strong>DHL genetic routing engine</strong> computed 14% overall savings in fuel costs across active warehouse corridors.
                            </div>
                          </div>
                        )}

                        {/* 3. Mitigated Threats */}
                        {widget.metricType === "threats" && (
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <span className="text-3xs font-semibold text-zinc-500 uppercase tracking-widest font-mono">MITIGATED SYSTEM EXPLOITS</span>
                              <h3 className="text-2xl font-bold font-mono text-zinc-100">1,394</h3>
                              <p className="text-rose-400 text-3xs font-medium flex items-center gap-1">
                                ↑ 42% <span className="text-zinc-500 font-normal">firewall block active rate</span>
                              </p>
                            </div>
                            <div className="text-[10px] text-zinc-400 leading-relaxed font-sans bg-rose-950/10 border border-rose-950/20 p-2.5 rounded-lg">
                              <strong>TOTP / API anomaly sensors</strong> active. Blacklisted 14 IP nodes tracing malicious payload requests.
                            </div>
                          </div>
                        )}

                        {/* 4. Active AI Employees */}
                        {widget.metricType === "agents" && (
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <span className="text-3xs font-semibold text-zinc-500 uppercase tracking-widest font-mono">AUTONOMOUS ORB AGENTS</span>
                              <h3 className="text-2xl font-bold font-mono text-zinc-100">{localEmployees.length} Active</h3>
                              <p className="text-indigo-400 text-3xs font-medium flex items-center gap-1">
                                100% Active <span className="text-zinc-500 font-normal">SLA network health OK</span>
                              </p>
                            </div>
                            <div className="text-[10px] text-zinc-400 leading-relaxed font-sans bg-zinc-950/40 border border-zinc-850 p-2.5 rounded-lg">
                              <strong>Sophia AI Coordinator</strong> successfully balancing sales queries and lead prioritization channels.
                            </div>
                          </div>
                        )}

                        {/* 5. Custom Chart Widget */}
                        {widget.metricType === "cashflow" && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Dynamic Settlement Streams</span>
                                <p className="text-3xs text-zinc-400">Captures relative Stripe vs PayPal processing flows</p>
                              </div>
                              <Badge variant="success">API Operational</Badge>
                            </div>
                            
                            {/* Recharts chart */}
                            <div className="h-32 w-full mt-2 font-mono text-[9px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[
                                  { date: "Jul 09", stripe: 142000, paypal: 95000 },
                                  { date: "Jul 10", stripe: 165000, paypal: 108000 },
                                  { date: "Jul 11", stripe: 189000, paypal: 125000 },
                                  { date: "Jul 12", stripe: 210000, paypal: 141000 },
                                  { date: "Jul 13", stripe: 245000, paypal: 159000 },
                                  { date: "Jul 14", stripe: 272000, paypal: 182000 },
                                  { date: "Jul 15", stripe: 312000, paypal: 204000 }
                                ]}>
                                  <defs>
                                    <linearGradient id="colorStripe" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor={graphAccent} stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor={graphAccent} stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                                  <XAxis dataKey="date" stroke="#52525b" fontSize={8} tickLine={false} />
                                  <YAxis stroke="#52525b" fontSize={8} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                                  <ChartTooltip
                                    contentStyle={{ background: "#09090b", borderColor: "#27272a", fontSize: "9px" }}
                                    labelStyle={{ color: "#a1a1aa" }}
                                  />
                                  <Area type="monotone" dataKey="stripe" stroke={graphAccent} fillOpacity={1} fill="url(#colorStripe)" strokeWidth={1.5} />
                                  <Area type="monotone" dataKey="paypal" stroke="#52525b" fillOpacity={0} strokeWidth={1.2} />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                        {/* 6. Tasks Pipeline */}
                        {widget.metricType === "tasks" && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Dispatched Sprints Pipeline</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6.5 text-[10px] px-2"
                                icon={<PlusSquare className="h-3 w-3" />}
                                onClick={() => setShowAddModal("task")}
                              >
                                Dispatch Task
                              </Button>
                            </div>

                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                              {localTasks.length === 0 ? (
                                <div className="text-center py-6 text-3xs text-zinc-500 font-mono">No active tasks in system queue</div>
                              ) : (
                                localTasks.map((task) => (
                                  <div
                                    key={task.id}
                                    className="p-2 rounded-lg bg-zinc-950/40 border border-zinc-850/80 hover:border-zinc-800 transition-colors flex justify-between items-center"
                                  >
                                    <div className="flex flex-col min-w-0 pr-2">
                                      <span className="text-2xs font-semibold text-zinc-200 truncate">{task.title}</span>
                                      <span className="text-[9px] text-zinc-400 mt-0.5">Assignee: {task.assigned_to}</span>
                                    </div>
                                    <Badge variant={task.priority === "High" || task.priority === "critical" ? "error" : "info"} className="scale-90 select-none">
                                      {task.priority}
                                    </Badge>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}

                        {/* 7. Decisions List */}
                        {widget.metricType === "decisions" && (
                          <div className="space-y-3">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono block">Autonomous Decisions logs</span>
                            <div className="space-y-2 max-h-36 overflow-y-auto pr-1 text-xs">
                              <div className="p-2.5 rounded-lg bg-zinc-950/50 border border-amber-950/25 relative">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-3xs font-bold text-amber-400 uppercase tracking-wider font-mono">CRM Scale approved</span>
                                  <span className="text-4xs text-zinc-500">10 mins ago</span>
                                </div>
                                <p className="text-3xs text-zinc-300 leading-relaxed">
                                  Authorized Q3 Sales Budget expansion. Approved +$25K CRM resources allocation.
                                </p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-zinc-950/50 border border-zinc-850 relative">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-3xs font-bold text-zinc-400 uppercase tracking-wider font-mono">SKU Auto replenishment</span>
                                  <span className="text-4xs text-zinc-500">1 hr ago</span>
                                </div>
                                <p className="text-3xs text-zinc-300 leading-relaxed">
                                  Triggered order of 150 units of license licenses to supplier as stock fell below buffer threshold.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Panel & System Activity Logs Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Quick Launchpad Actions */}
        <div className="lg:col-span-4">
          <Card className="p-5 border-zinc-800/80 flex flex-col justify-between min-h-[20rem] h-auto gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="pb-3 border-b border-zinc-850/60">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Administrative Launchpad</h3>
              <p className="text-3xs text-zinc-500 mt-0.5">Deploy or provision resources instantly on system database</p>
            </div>

            <div className="my-4 grid grid-cols-2 gap-3.5">
              <Button
                variant="outline"
                className="py-3 px-3 rounded-xl border border-zinc-850 hover:bg-zinc-900 flex flex-col gap-1 items-start text-left"
                onClick={() => setShowAddModal("company")}
              >
                <span className="text-indigo-400 font-bold text-lg leading-none">+</span>
                <span className="text-3xs font-bold uppercase tracking-wider text-zinc-400 font-mono">Add Company</span>
              </Button>

              <Button
                variant="outline"
                className="py-3 px-3 rounded-xl border border-zinc-850 hover:bg-zinc-900 flex flex-col gap-1 items-start text-left"
                onClick={() => setShowAddModal("dept")}
              >
                <span className="text-emerald-400 font-bold text-lg leading-none">+</span>
                <span className="text-3xs font-bold uppercase tracking-wider text-zinc-400 font-mono">New Department</span>
              </Button>

              <Button
                variant="outline"
                className="py-3 px-3 rounded-xl border border-zinc-850 hover:bg-zinc-900 flex flex-col gap-1 items-start text-left"
                onClick={() => setShowAddModal("emp")}
              >
                <span className="text-violet-400 font-bold text-lg leading-none">+</span>
                <span className="text-3xs font-bold uppercase tracking-wider text-zinc-400 font-mono">Register Worker</span>
              </Button>

              <Button
                variant="outline"
                className="py-3 px-3 rounded-xl border border-zinc-850 hover:bg-zinc-900 flex flex-col gap-1 items-start text-left"
                onClick={() => setShowAddModal("lead")}
              >
                <span className="text-amber-400 font-bold text-lg leading-none">+</span>
                <span className="text-3xs font-bold uppercase tracking-wider text-zinc-400 font-mono">Add Sales Lead</span>
              </Button>
            </div>

            <Button
              variant="primary"
              className="w-full h-10 rounded-xl text-2xs uppercase tracking-wider font-bold"
              icon={<Sparkles className="h-3.5 w-3.5 text-amber-400" />}
              onClick={() => setAiPanelOpen(true)}
            >
              Consult AI Advisor Panel
            </Button>
          </Card>
        </div>

        {/* System Activity Center & Live Audit Trails */}
        <div className="lg:col-span-8">
          <Card className="p-5 border-zinc-800/80 flex flex-col justify-between min-h-[20rem] h-auto gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex justify-between items-center pb-3 border-b border-zinc-850/60 flex-shrink-0">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Telemetry Activity Center</h3>
                <p className="text-3xs text-zinc-500 mt-0.5">Real-time event audits and security alerts tracker</p>
              </div>

              {/* Filtering Toggles */}
              <div className="flex gap-1 bg-zinc-950 p-1 border border-zinc-850 rounded-lg">
                <button
                  onClick={() => setActivityFilter("all")}
                  className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider font-mono ${
                    activityFilter === "all" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActivityFilter("api")}
                  className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider font-mono ${
                    activityFilter === "api" ? "bg-indigo-950/50 text-indigo-400 border border-indigo-900/10" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  API
                </button>
                <button
                  onClick={() => setActivityFilter("security")}
                  className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider font-mono ${
                    activityFilter === "security" ? "bg-rose-950/50 text-rose-400 border border-rose-900/10" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Security
                </button>
                <button
                  onClick={() => setActivityFilter("system")}
                  className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider font-mono ${
                    activityFilter === "system" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  System
                </button>
              </div>
            </div>

            {/* List Buffer */}
            <div className="my-3 flex-1 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-2xs text-zinc-500 font-mono">No matching audit events active</div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2 rounded-lg bg-zinc-950/40 border border-zinc-850/60 hover:bg-zinc-950/80 transition-colors flex justify-between items-center"
                  >
                    <div className="flex gap-3 items-center min-w-0">
                      <span className="font-mono text-[9px] bg-zinc-900 px-1.5 py-0.5 border border-zinc-800 text-zinc-500 font-semibold uppercase rounded-md">
                        {log.method}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-2xs font-semibold text-zinc-300 truncate">{log.endpoint}</span>
                        {log.response?.details || log.response?.auditCheck ? (
                          <span className="text-[9px] text-zinc-500 truncate mt-0.5">
                            {log.response?.details || log.response?.auditCheck}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    
                    <div className="flex gap-2.5 items-center shrink-0">
                      <span className="text-[9px] font-mono font-semibold text-zinc-500">{log.timestamp}</span>
                      <span className={`h-1.5 w-1.5 rounded-full ${log.status === 200 ? "bg-emerald-500" : "bg-rose-500"}`} />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="text-[10px] text-zinc-500 font-semibold border-t border-zinc-850/60 pt-2 flex justify-between items-center uppercase font-mono flex-shrink-0">
              <span>Total ledger records monitored: {filteredLogs.length}</span>
              <span>Integrity Verified</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Global Ledger Database records list (Collapsible segment) */}
      <Card className="p-5 border-zinc-800/80">
        <details className="group">
          <summary className="flex justify-between items-center cursor-pointer list-none select-none">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-zinc-400 group-open:rotate-90 transition-transform" />
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Browse Raw Ledger Database collections</span>
            </div>
            <div className="flex items-center gap-2 text-3xs font-semibold text-zinc-500 uppercase tracking-wider">
              <span>Click to Expand</span>
              <ChevronRight className="h-4 w-4 group-open:rotate-90 transition-transform" />
            </div>
          </summary>

          <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-6 pt-4 border-t border-zinc-850/60 animate-fadeIn">
            {/* Companies Card */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-zinc-400" />
                  <span className="text-xs font-bold text-zinc-300">Registered Companies ({localCompanies.length})</span>
                </div>
                <Button variant="outline" size="sm" icon={<PlusSquare className="h-3.5 w-3.5 text-zinc-500" />} onClick={() => setShowAddModal("company")} />
              </div>

              <div className="overflow-x-auto max-h-52 border border-zinc-850/80 rounded-xl">
                <table className="w-full text-left text-xs text-zinc-400 font-sans">
                  <thead className="bg-zinc-950/80">
                    <tr className="border-b border-zinc-850 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold font-mono">
                      <th className="py-2.5 px-3">Legal Name</th>
                      <th>Vertical</th>
                      <th>Region</th>
                      <th className="text-right px-3">Tax Identification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localCompanies.map((c) => (
                      <tr key={c.id} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900/30 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-zinc-300">{c.company_name}</td>
                        <td>{c.industry}</td>
                        <td>{c.city}, {c.country}</td>
                        <td className="text-right px-3 font-mono text-2xs">{c.tax_number || "TAX-8831"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Departments Card */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-zinc-400" />
                  <span className="text-xs font-bold text-zinc-300">Active Departments ({localDepartments.length})</span>
                </div>
                <Button variant="outline" size="sm" icon={<PlusSquare className="h-3.5 w-3.5 text-zinc-500" />} onClick={() => setShowAddModal("dept")} />
              </div>

              <div className="overflow-x-auto max-h-52 border border-zinc-850/80 rounded-xl">
                <table className="w-full text-left text-xs text-zinc-400 font-sans">
                  <thead className="bg-zinc-950/80">
                    <tr className="border-b border-zinc-850 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold font-mono">
                      <th className="py-2.5 px-3">Dept Code</th>
                      <th>Department Title</th>
                      <th className="text-right px-3">SLA Budget Limit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localDepartments.map((d) => (
                      <tr key={d.id} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900/30 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-2xs text-zinc-400">{d.code}</td>
                        <td className="text-zinc-300">{d.name}</td>
                        <td className="text-right px-3 font-mono font-medium text-emerald-400">${d.budget?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Employees Card */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-zinc-400" />
                  <span className="text-xs font-bold text-zinc-300">Registered Worker Profiles ({localEmployees.length})</span>
                </div>
                <Button variant="outline" size="sm" icon={<PlusSquare className="h-3.5 w-3.5 text-zinc-500" />} onClick={() => setShowAddModal("emp")} />
              </div>

              <div className="overflow-x-auto max-h-52 border border-zinc-850/80 rounded-xl">
                <table className="w-full text-left text-xs text-zinc-400 font-sans">
                  <thead className="bg-zinc-950/80">
                    <tr className="border-b border-zinc-850 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold font-mono">
                      <th className="py-2.5 px-3">Worker Name</th>
                      <th>Specialized Position</th>
                      <th>Uptime Status</th>
                      <th className="text-right px-3">Salary Resource Scale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localEmployees.map((e) => (
                      <tr key={e.id} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900/30 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-zinc-300">{e.full_name}</td>
                        <td>{e.position}</td>
                        <td>
                          <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${e.status === "Active" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                          {e.status}
                        </td>
                        <td className="text-right px-3 font-mono text-zinc-300">${e.salary?.toLocaleString()}/mo</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active Leads Pipeline Card */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-zinc-400" />
                  <span className="text-xs font-bold text-zinc-300">CRM Sales Pipeline Leads ({localLeads.length})</span>
                </div>
                <Button variant="outline" size="sm" icon={<PlusSquare className="h-3.5 w-3.5 text-zinc-500" />} onClick={() => setShowAddModal("lead")} />
              </div>

              <div className="overflow-x-auto max-h-52 border border-zinc-850/80 rounded-xl">
                <table className="w-full text-left text-xs text-zinc-400 font-sans">
                  <thead className="bg-zinc-950/80">
                    <tr className="border-b border-zinc-850 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold font-mono">
                      <th className="py-2.5 px-3">Contact Person</th>
                      <th>Email ID</th>
                      <th>Leads Source</th>
                      <th className="text-right px-3">Funnel Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localLeads.map((l) => (
                      <tr key={l.id} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900/30 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-zinc-300">{l.contact_name}</td>
                        <td>{l.email}</td>
                        <td>{l.source}</td>
                        <td className="text-right px-3 text-amber-400 uppercase font-mono text-2xs font-bold">{l.status || "New"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </details>
      </Card>

      {/* 1. Widget Settings Customization dialog */}
      <Dialog isOpen={configuringWidgetId !== null} onClose={() => setConfiguringWidgetId(null)} title="Customize Widget Profile">
        <div className="space-y-4 font-sans text-sm">
          <Input label="Widget Display Title" value={tempWidgetTitle} onChange={(e) => setTempWidgetTitle(e.target.value)} />
          
          {/* Custom Accents selectors */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Widget Accent Theme Color</span>
            <div className="grid grid-cols-6 gap-2">
              {["indigo", "violet", "emerald", "amber", "rose", "slate"].map((c) => (
                <button
                  key={c}
                  onClick={() => setTempWidgetAccent(c)}
                  className={`py-2 px-1 rounded-lg border text-2xs capitalize font-semibold transition-colors ${
                    tempWidgetAccent === c
                      ? "bg-zinc-800 border-indigo-500 text-zinc-200"
                      : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <Button variant="primary" className="w-full mt-2" onClick={saveWidgetConfig}>Commit Widget Changes</Button>
        </div>
      </Dialog>

      {/* 2. Chief Agent Strategic Brief Modal */}
      <Dialog isOpen={showBriefModal} onClose={() => setShowBriefModal(false)} title="Autonomous Enterprise Directive Summary" size="lg">
        <div className="space-y-4 font-sans text-xs leading-relaxed text-zinc-300 max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-4 rounded-xl bg-indigo-950/15 border border-indigo-950/40 text-zinc-300">
            <div className="flex justify-between items-center pb-2.5 border-b border-indigo-950/30 mb-2.5">
              <span className="text-3xs font-mono font-bold tracking-wider text-indigo-400 uppercase">OFFICIAL CLOUD TRANSMISSION</span>
              <span className="text-3xs text-zinc-500">SECURE SOC-2 PROTOCOL</span>
            </div>
            
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-1.5 tracking-tight font-sans">
              Autonomous Enterprise Directive: Q3 Global Program <Sparkles className="h-4 w-4 text-amber-400" />
            </h2>
            <p className="text-3xs text-zinc-400 mt-0.5">Issued under signature of Chief Executive Agent v1.2</p>
          </div>

          <div className="space-y-3 font-sans">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">1. Current Business Posture</h3>
            <p className="text-zinc-300">
              Active annual net target stands at **$12M** with a verified run-rate performance of **$10.4M**. Gross processing profit margins are stable at 74%. Inherent working capital liquidity has increased by 18% as of Jul 15.
            </p>

            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">2. Strategic Directives</h3>
            <div className="space-y-2 pl-3">
              <div className="flex gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <p>
                  <strong className="text-zinc-200">Payments Reconciliation:</strong> Sophia AI is instructed to execute complete ledger audit operations across all pending PayPal settlement streams to identify potential discount and routing leakage.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <p>
                  <strong className="text-zinc-200">Logistics Routing:</strong> Lucas AI has been dispatched to establish real-time genetic TSP calculations across the primary warehouse grid to secure at least 14.5% in freight fuel reductions.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <p>
                  <strong className="text-zinc-200">Cybersecurity Tracing:</strong> Carter Compliance AI is actively blacklisting identified threat source IPs (such as 194.22.10.88) attempting telemetry penetration queries.
                </p>
              </div>
            </div>

            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">3. Compliance Metrics</h3>
            <p className="text-zinc-300">
              All active data transfers, ledger operations, and worker salary scales are audited and verified compliant under current SOC-2 standard controls. Workspace integrity is certified secure.
            </p>
          </div>

          <div className="flex justify-end pt-3 border-t border-zinc-850/60">
            <Button variant="secondary" className="h-8 px-4" onClick={() => setShowBriefModal(false)}>Close Summary</Button>
          </div>
        </div>
      </Dialog>

    </div>
  );
};
