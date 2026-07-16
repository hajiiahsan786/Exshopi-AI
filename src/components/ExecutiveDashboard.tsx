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
const DEFAULT_WIDGETS: any[] = [];

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
    <div className="space-y-12 pb-24 pt-10">
      
      {/* Universal AI Search - Central focus */}
      <div className="flex flex-col items-center justify-center max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-center text-zinc-800 dark:text-zinc-200">
          What would you like Exshopi AI to do?
        </h1>

        <div className="w-full relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[32px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-7 w-7 text-indigo-500" />
            <input
              type="text"
              placeholder="Ask Exshopi AI anything... (e.g. 'Show Company Revenue')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/70 backdrop-blur-xl border border-white/50 text-zinc-800 placeholder-zinc-400 h-20 text-xl md:text-2xl py-4 pl-16 pr-8 rounded-[32px] focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-[0_8px_32px_0_rgba(0,0,0,0.05)]"
            />
          </div>
        </div>

        {/* Animated AI Voice Area */}
        <div className="flex flex-col items-center justify-center pt-8">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 40px rgba(99,102,241,0.3)", "0 0 0px rgba(0,0,0,0)"]
            }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-24 h-24 rounded-full bg-white/50 backdrop-blur-2xl border border-white/40 flex items-center justify-center cursor-pointer shadow-lg hover:bg-white/80 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-inner">
              <Mic className="h-8 w-8" />
            </div>
          </motion.div>
          <span className="mt-4 text-sm font-medium text-zinc-500 tracking-widest uppercase">Listening...</span>
        </div>
      </div>

      {/* AI Executive Overview */}
      <div className="max-w-5xl mx-auto">
        <Card className="p-8 border-none bg-white/60 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.04)]" glass={true}>
          <div className="flex items-center gap-3 mb-6 border-b border-zinc-200/50 pb-4">
            <Sparkles className="h-6 w-6 text-indigo-500" />
            <h2 className="text-xl font-semibold text-zinc-800 tracking-tight">AI Executive Overview</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="p-5 rounded-2xl bg-white/40 border border-white/50">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Today's Revenue</p>
              <h3 className="text-2xl font-bold text-zinc-800">AED 52,350</h3>
              <Badge variant="success" className="mt-2">+12% vs Yesterday</Badge>
            </div>
            <div className="p-5 rounded-2xl bg-white/40 border border-white/50">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Orders</p>
              <h3 className="text-2xl font-bold text-zinc-800">143</h3>
              <Badge variant="success" className="mt-2">Steady</Badge>
            </div>
            <div className="p-5 rounded-2xl bg-white/40 border border-white/50">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Customers Waiting</p>
              <h3 className="text-2xl font-bold text-zinc-800">5</h3>
              <Badge variant="warning" className="mt-2">Action Required</Badge>
            </div>
            <div className="p-5 rounded-2xl bg-white/40 border border-white/50">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Invoices Pending</p>
              <h3 className="text-2xl font-bold text-zinc-800">8</h3>
              <Badge variant="neutral" className="mt-2">Scheduled</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-600 uppercase tracking-wider mb-3">AI Recommendations</h3>
            
            <div className="flex items-start gap-4 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
              <div className="mt-0.5 p-1.5 rounded-full bg-indigo-100 text-indigo-600">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-800">Increase Meta Ads budget by 15%</h4>
                <p className="text-xs text-zinc-600 mt-1">Campaign 'Summer Sale' is yielding a 4.2x ROAS. Scaling now is highly recommended.</p>
              </div>
              <Button variant="primary" size="sm" className="ml-auto mt-2">Execute</Button>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-rose-50/50 border border-rose-100">
              <div className="mt-0.5 p-1.5 rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-800">Supplier inventory running low</h4>
                <p className="text-xs text-zinc-600 mt-1">SKU-A981 is below critical threshold (12 units left). Reorder from 'TechPro' is advised.</p>
              </div>
              <Button variant="primary" size="sm" className="ml-auto mt-2">Reorder</Button>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <div className="mt-0.5 p-1.5 rounded-full bg-emerald-100 text-emerald-600">
                <UserCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-800">One customer needs follow-up</h4>
                <p className="text-xs text-zinc-600 mt-1">Enterprise Lead 'GlobalCorp' opened the proposal 3 times today.</p>
              </div>
              <Button variant="primary" size="sm" className="ml-auto mt-2">Draft Email</Button>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
};
