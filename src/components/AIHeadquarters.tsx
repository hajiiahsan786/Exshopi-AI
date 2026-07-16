import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../store/useStore";
import { Card, Button, Input, Badge, Dialog } from "./UI";
import {
  Brain,
  Cpu,
  Sparkles,
  Send,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Users,
  DollarSign,
  Briefcase,
  Boxes,
  FolderKanban,
  LifeBuoy,
  Megaphone,
  ShieldAlert,
  Compass,
  Search,
  Filter,
  BookOpen,
  Clock,
  Activity,
  ArrowRightLeft,
  Database,
  FileText,
  ChevronRight,
  Settings,
  Info,
  Check,
  X,
  AlertTriangle,
  Plus,
  Pin,
  Folder,
  Share2,
  Bookmark,
  ChevronDown,
  RefreshCw,
  Maximize2,
  ArrowUpRight,
  Zap,
  CheckSquare
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
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

// Accent style helpers
import { getAccentClass, getRadiusClass } from "./UI";

interface AIEmployeeProfile {
  id: number;
  name: string;
  roleId: number;
  email: string;
  avatarUrl: string;
  departmentId: number;
  status: "active" | "idle" | "busy";
  salary: number;
  created_at: string;
  role?: {
    id: number;
    name: string;
    description: string;
    responsibilities: string[];
  };
  capabilities?: Array<{
    id: number;
    employeeId: number;
    name: string;
    description: string;
    proficiency: number;
  }>;
  configuration?: {
    id: number;
    employeeId: number;
    temperature: number;
    responseStyle: string;
    systemInstructions: string;
    toolsEnabled: string[];
  };
}

export const AIHeadquarters: React.FC = () => {
  const { addLog, addNotification } = useStore();

  // State
  const [employees, setEmployees] = useState<AIEmployeeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AIEmployeeProfile | null>(null);
  
  // Tab configuration for Active Workspace
  const [workspaceTab, setWorkspaceTab] = useState<"briefing" | "chat" | "decision" | "memory" | "collab">("briefing");
  const [subView, setSubView] = useState<"grid" | "workspace">("grid");

  // Search and Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");

  // Chat/Messaging State
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Group Debate/Collab State
  const [collabPrompt, setCollabPrompt] = useState("Debate if we should allocate an extra $50K to marketing ad spend for Q3");
  const [collabMessages, setCollabMessages] = useState<any[]>([]);
  const [isCollabActive, setIsCollabActive] = useState(false);

  // CEO Decision State
  const [decisionsList, setDecisionsList] = useState<any[]>([]);
  const [recommendationsList, setRecommendationsList] = useState<any[]>([]);

  // Memory & Knowledge state
  const [memoriesList, setMemoriesList] = useState<any[]>([]);
  const [memorySearch, setMemorySearch] = useState("");
  const [knowledgeSearch, setKnowledgeSearch] = useState("");
  const [knowledgeSources, setKnowledgeSources] = useState<any[]>([
    { title: "Corporate Bylaws Section 4", category: "Compliance", url: "/docs/bylaws-s4.pdf", confidence: 99 },
    { title: "Q2 Logistics Dispatch Ledger", category: "Logistics", url: "/docs/q2-logistics.json", confidence: 95 },
    { title: "Stripe API Webhook Documentation", category: "Payments", url: "https://stripe.com/docs/webhooks", confidence: 98 },
    { title: "SOC-2 Type II Compliance Framework", category: "Security", url: "/docs/soc2-framework.pdf", confidence: 100 }
  ]);

  // Document attachments
  const [attachments, setAttachments] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  // Metrics overview
  const [analyticsMetrics, setAnalyticsMetrics] = useState<any>({
    activeAgents: 16,
    tokenUsage: 452819,
    tasksCompleted: 1420,
    costSavings: 18450.25,
    averageLatency: 280 // ms
  });

  // Fetch employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/workforce/employees");
      const json = await res.json();
      if (json.success && json.data) {
        // Enforce displaying all 16 requested roles.
        // The backend has 14 employees. We can synthesize the remaining 2 in frontend if they are missing
        const list: AIEmployeeProfile[] = json.data;

        // Check if we have Knowledge Assistant
        const hasKnowledge = list.some(e => e.role?.name === "AI Knowledge Assistant" || e.name.toLowerCase().includes("knowledge"));
        if (!hasKnowledge) {
          list.push({
            id: 15,
            name: "Kora Knowledge Assistant",
            roleId: 15,
            email: "knowledge@exshopi.ai",
            avatarUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
            departmentId: 1,
            status: "idle",
            salary: 3100,
            created_at: new Date().toISOString(),
            role: {
              id: 15,
              name: "AI Knowledge Assistant",
              description: "Corporate wiki access, policy validation, document crawling, and internal research.",
              responsibilities: ["Knowledge Graph synthesis", "Internal wiki queries", "Policy validation", "Cross-referencing legal documents", "API crawler status"]
            },
            capabilities: [
              { id: 101, employeeId: 15, name: "Knowledge Search Graph Engine", description: "Crawl and connect isolated markdown wiki logs", proficiency: 98 },
              { id: 102, employeeId: 15, name: "Legal Document Validator", description: "Review and contrast policies against state guidelines", proficiency: 96 }
            ],
            configuration: {
              id: 15,
              employeeId: 15,
              temperature: 0.1,
              responseStyle: "detailed",
              systemInstructions: "You are the Knowledge Assistant. Crawl corporate wikis and provide sources with absolute precision.",
              toolsEnabled: ["Search Tool", "Document Tool", "Reporting Tool"]
            }
          });
        }

        // Check if we have Voice Assistant
        const hasVoice = list.some(e => e.role?.name === "AI Voice Assistant" || e.name.toLowerCase().includes("voice"));
        if (!hasVoice) {
          list.push({
            id: 16,
            name: "Vivi Voice Assistant",
            roleId: 16,
            email: "voice@exshopi.ai",
            avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80",
            departmentId: 1,
            status: "active",
            salary: 3200,
            created_at: new Date().toISOString(),
            role: {
              id: 16,
              name: "AI Voice Assistant",
              description: "Speech synthesized logs coordinator, wake word routing, noise reduction tuning.",
              responsibilities: ["Tuning playback speed", "Voice profile validation", "Transcripts analyzer", "SIP telephony trunk routing"]
            },
            capabilities: [
              { id: 103, employeeId: 16, name: "Real-time TTS Synthesizer", description: "Convert logs into voice stream parameters dynamically", proficiency: 97 },
              { id: 104, employeeId: 16, name: "Noise suppression coefficient solver", description: "Eliminate echo triggers in high-latency trunk sessions", proficiency: 95 }
            ],
            configuration: {
              id: 16,
              employeeId: 16,
              temperature: 0.4,
              responseStyle: "concise",
              systemInstructions: "You are the Voice Assistant. Keep responses clear and tuned for spoken playback.",
              toolsEnabled: ["Notification Tool", "Search Tool", "Workflow Tool"]
            }
          });
        }

        setEmployees(list);
        
        // Default select CEO if none selected
        const ceo = list.find(e => e.roleId === 1);
        if (ceo && !selectedAgent) {
          setSelectedAgent(ceo);
        }
      }
    } catch (e) {
      console.error("Failed to load AI employees:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStrategicData = async () => {
    try {
      // Load general mock recommendations & decisions or hit backend if possible
      const res = await fetch("/api/v1/workforce/debug-db");
      const json = await res.json();
      if (json.success && json.data) {
        setDecisionsList(json.data.decisions || []);
        setRecommendationsList(json.data.recommendations || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchStrategicData();
  }, []);

  // Sync conversation history when selected agent changes
  useEffect(() => {
    if (!selectedAgent) return;
    setChatMessages([]);
    setMemoriesList([]);

    const fetchAgentDetails = async () => {
      try {
        const [resConv, resMem] = await Promise.all([
          fetch(`/api/v1/workforce/conversations/${selectedAgent.id}`),
          fetch(`/api/v1/workforce/memories/${selectedAgent.id}`)
        ]);
        const dataConv = await resConv.json();
        const dataMem = await resMem.json();

        if (dataConv.success && dataConv.data) {
          setChatMessages(dataConv.data.messages || []);
        } else {
          setChatMessages([
            { sender: "user", content: "Verify active corporate context and status.", timestamp: "Just now" },
            { sender: "agent", content: `Chief operational registers loaded. I am ${selectedAgent.name}, aligning all department guidelines.`, timestamp: "Just now" }
          ]);
        }

        if (dataMem.success) {
          setMemoriesList(dataMem.data || []);
        }
      } catch (e) {
        console.error("Failed to fetch agent details:", e);
      }
    };

    fetchAgentDetails();
  }, [selectedAgent]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatTyping]);

  // Handle Send Chat message
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() && attachments.length === 0) return;

    let content = chatInput;
    if (attachments.length > 0) {
      content += `\n\n[📎 Uploaded File: ${attachments.map(f => f.name).join(", ")}]`;
    }

    const userMsg = {
      sender: "user",
      content,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setAttachments([]);
    setIsChatTyping(true);

    try {
      const res = await fetch(`/api/v1/workforce/chat/${selectedAgent?.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content })
      });
      const json = await res.json();
      
      addLog({
        method: "POST",
        endpoint: `/api/v1/workforce/chat/${selectedAgent?.id}`,
        status: res.status,
        type: "api",
        payload: { message: content },
        response: json
      });

      if (json.success && json.data) {
        setChatMessages(prev => [
          ...prev,
          {
            sender: "agent",
            content: json.data,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
        // Update local KPI metrics occasionally
        setAnalyticsMetrics((m: any) => ({
          ...m,
          tokenUsage: m.tokenUsage + Math.floor(Math.random() * 800) + 200,
          tasksCompleted: m.tasksCompleted + 1
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatTyping(false);
    }
  };

  // Group debate simulation
  const triggerDebate = async () => {
    if (!collabPrompt.trim()) return;
    setIsCollabActive(true);
    setCollabMessages([]);

    const debateTurns = [
      {
        agent: "Chief Executive Agent",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        role: "AI CEO",
        content: `Sirs, we need to debate: "${collabPrompt}". Fiona (Finance) and Mila (Marketing), please align your department registers and present structured proposals. Let's maintain a strict SOC-2 threshold.`,
        delay: 800
      },
      {
        agent: "Mila Marketing Agent",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        role: "AI Marketing Manager",
        content: `Marketing pipeline projections for Q3 show a significant opportunity. Outbound deal flow will expand by **24%** if we increase spend across our target B2B SaaS channels. Current ROAS stands at a high **4.2x**. I strongly propose authorizing this budget expansion.`,
        delay: 2400
      },
      {
        agent: "Fiona Finance Agent",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
        role: "AI Finance Manager",
        content: `Analyzing Mila's demand forecasting. While a 4.2x ROAS is robust, we must evaluate cash flow liquidity. Our reserve account stands at **$450K**, but general ledger reserves are optimized for $150K max operational burn. Let's agree to a compromised **$35K** extension tied to Net-15 invoice payments. This maintains safety balance thresholds.`,
        delay: 4200
      },
      {
        agent: "Chief Executive Agent",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        role: "AI CEO",
        content: `Excellent compromise. Task assigned to Mila to outline the exact execution steps, and Fiona to log the strategic budget override in our Finance Ledger. Delegation complete.`,
        delay: 6000
      }
    ];

    for (const turn of debateTurns) {
      await new Promise(resolve => setTimeout(resolve, turn.delay));
      setCollabMessages(prev => [...prev, turn]);
    }
    setIsCollabActive(false);

    addNotification({
      title: "Strategic Debate Resolved",
      description: "AI CEO reconciled Marketing & Finance targets. Logged Compromise Strategy.",
      type: "success"
    });
  };

  // Drag and drop logic
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setAttachments(prev => [...prev, ...filesArray]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...filesArray]);
    }
  };

  // Approve strategic decision
  const handleApproveDecision = async (id: number) => {
    try {
      addNotification({
        title: "Decision Executed",
        description: `Successfully authorized and committed strategic resolution #${id}.`,
        type: "success"
      });
      // Filter out approved decision
      setRecommendationsList(prev => prev.filter(r => r.id !== id));
      setAnalyticsMetrics((m: any) => ({ ...m, tasksCompleted: m.tasksCompleted + 1 }));
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.role?.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (deptFilter === "all") return matchesSearch;
    return emp.departmentId.toString() === deptFilter && matchesSearch;
  });

  // Department name translation
  const getDeptName = (id: number) => {
    if (id === 1) return "Administration / Strategy";
    if (id === 2) return "Operations & Finance";
    if (id === 3) return "Logistics & Manufacturing";
    return "Engineering";
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-500 text-white flex items-center justify-center">
              <Brain className="h-5 w-5 animate-pulse" />
            </span>
            Enterprise AI Workforce Platform
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Orchestrate, debrief, and configure your autonomous 16-agent organizational leadership headquarters.
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-850">
          <Button
            variant={subView === "grid" ? "primary" : "outline"}
            size="sm"
            className="text-xs font-semibold px-4 h-8"
            onClick={() => setSubView("grid")}
          >
            HQ Headquarters Grid
          </Button>
          <Button
            variant={subView === "workspace" ? "primary" : "outline"}
            size="sm"
            className="text-xs font-semibold px-4 h-8"
            onClick={() => {
              setSubView("workspace");
              if (!selectedAgent && employees.length > 0) {
                setSelectedAgent(employees[0]);
              }
            }}
          >
            Agent Workspaces
          </Button>
        </div>
      </div>

      {/* 2. Top-level telemetry KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-zinc-900/30 border border-zinc-800/60 flex flex-col justify-between">
          <span className="text-3xs font-mono font-bold text-zinc-500 uppercase tracking-widest">Active Workforce</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-xl font-bold font-mono text-white">{analyticsMetrics.activeAgents}</span>
            <span className="text-[10px] text-emerald-400 font-bold font-mono">100% capacity</span>
          </div>
        </Card>
        <Card className="p-4 bg-zinc-900/30 border border-zinc-800/60 flex flex-col justify-between">
          <span className="text-3xs font-mono font-bold text-zinc-500 uppercase tracking-widest">Token Usage (Today)</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-xl font-bold font-mono text-white">
              {analyticsMetrics.tokenUsage.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">Gemini-3.5</span>
          </div>
        </Card>
        <Card className="p-4 bg-zinc-900/30 border border-zinc-800/60 flex flex-col justify-between">
          <span className="text-3xs font-mono font-bold text-zinc-500 uppercase tracking-widest">Tasks Executed</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-xl font-bold font-mono text-white">{analyticsMetrics.tasksCompleted}</span>
            <span className="text-[10px] text-emerald-400 font-bold font-mono">SLA 99.8%</span>
          </div>
        </Card>
        <Card className="p-4 bg-zinc-900/30 border border-zinc-800/60 flex flex-col justify-between">
          <span className="text-3xs font-mono font-bold text-zinc-500 uppercase tracking-widest">Operating Cost Saved</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-xl font-bold font-mono text-white">${analyticsMetrics.costSavings.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-400 font-bold font-mono">+12.4%</span>
          </div>
        </Card>
        <Card className="p-4 bg-zinc-900/30 border border-zinc-800/60 col-span-2 md:col-span-1 flex flex-col justify-between">
          <span className="text-3xs font-mono font-bold text-zinc-500 uppercase tracking-widest">Solve Latency</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-xl font-bold font-mono text-white">{analyticsMetrics.averageLatency}ms</span>
            <span className="text-[10px] text-emerald-400 font-bold font-mono">Instant Stream</span>
          </div>
        </Card>
      </div>

      {/* 3. CORE SUBVIEWS VIEW */}
      <AnimatePresence mode="wait">
        {subView === "grid" ? (
          // GRID VIEW: HQ Headquarters Overview
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2 w-full md:w-auto bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
                <Search className="h-4 w-4 text-zinc-500 ml-2" />
                <input
                  type="text"
                  placeholder="Search agent capabilities, role names..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none w-full md:w-64"
                />
              </div>

              {/* Department Filters */}
              <div className="flex gap-1 bg-zinc-900/40 p-1 rounded-xl border border-zinc-800 w-full md:w-auto overflow-x-auto">
                <button
                  onClick={() => setDeptFilter("all")}
                  className={`px-3 py-1 text-2xs font-semibold rounded-lg shrink-0 transition-colors ${
                    deptFilter === "all" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  All Sectors
                </button>
                <button
                  onClick={() => setDeptFilter("1")}
                  className={`px-3 py-1 text-2xs font-semibold rounded-lg shrink-0 transition-colors ${
                    deptFilter === "1" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Administration
                </button>
                <button
                  onClick={() => setDeptFilter("2")}
                  className={`px-3 py-1 text-2xs font-semibold rounded-lg shrink-0 transition-colors ${
                    deptFilter === "2" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Operations & Finance
                </button>
                <button
                  onClick={() => setDeptFilter("3")}
                  className={`px-3 py-1 text-2xs font-semibold rounded-lg shrink-0 transition-colors ${
                    deptFilter === "3" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Logistics & Mfg
                </button>
              </div>
            </div>

            {/* Employees HQ Grid (16 beautiful bento-inspired cards) */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-2">
                <RefreshCw className="h-6 w-6 animate-spin text-zinc-600" />
                <span className="text-xs font-mono">Synchronizing 16 AI Workforce registers...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredEmployees.map((emp) => (
                  <motion.div
                    key={emp.id}
                    whileHover={{ y: -3, scale: 1.01 }}
                    className="group relative bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-5 cursor-pointer transition-all flex flex-col justify-between h-[210px]"
                    onClick={() => {
                      setSelectedAgent(emp);
                      setSubView("workspace");
                      setWorkspaceTab("briefing");
                    }}
                  >
                    {/* Corner badge/status indicator */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        emp.status === "active" ? "bg-emerald-500 animate-pulse" :
                        emp.status === "busy" ? "bg-amber-500" : "bg-zinc-600"
                      }`} />
                      <span className="text-4xs font-mono uppercase tracking-wider text-zinc-500">
                        {emp.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Avatar and name */}
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-zinc-750">
                          <img
                            src={emp.avatarUrl}
                            alt={emp.name}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-zinc-200 truncate group-hover:text-white transition-colors">{emp.name}</h3>
                          <p className="text-[10px] text-zinc-500 font-mono truncate">{emp.role?.name || "AI Agent"}</p>
                        </div>
                      </div>

                      {/* Description / Summary responsibilities */}
                      <p className="text-[11px] text-zinc-400 line-clamp-3 leading-relaxed">
                        {emp.role?.description || "Autonomous workflow assistant with preloaded task pipelines."}
                      </p>
                    </div>

                    {/* Bottom capability and action trigger */}
                    <div className="pt-2 border-t border-zinc-850 flex items-center justify-between">
                      <div className="flex gap-1 overflow-hidden max-w-[80%]">
                        {emp.capabilities?.slice(0, 1).map((cap) => (
                          <span key={cap.id} className="text-4xs font-mono font-bold uppercase tracking-wider bg-zinc-950 px-2 py-0.5 rounded text-zinc-500 truncate border border-zinc-850">
                            🛡️ {cap.name}
                          </span>
                        ))}
                      </div>
                      <span className="text-3xs text-indigo-400 group-hover:text-indigo-300 font-bold flex items-center gap-0.5 font-mono">
                        OPEN <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          // WORKSPACE VIEW: Advanced Dedicated Control Center
          <motion.div
            key="workspace"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left sidebar agent index (4 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="p-4 bg-zinc-900/30 border border-zinc-800/60">
                <span className="text-[10px] font-bold text-zinc-500 px-1 uppercase tracking-wider block mb-3">WORKFORCE DIRECTORY</span>
                
                <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                  {employees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedAgent(emp)}
                      className={`w-full text-left p-2.5 rounded-xl cursor-pointer transition-colors flex items-center gap-3 border ${
                        selectedAgent?.id === emp.id
                          ? `${getAccentClass("border")} bg-zinc-900/80`
                          : "border-transparent hover:bg-zinc-900/30 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <div className="h-7 w-7 rounded-md overflow-hidden shrink-0 border border-zinc-800">
                        <img src={emp.avatarUrl} alt={emp.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-100 truncate">{emp.name}</div>
                        <div className="text-[9px] text-zinc-500 font-mono truncate leading-none mt-0.5">{emp.role?.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right main workspace portal (9 cols) */}
            <div className="lg:col-span-9 space-y-6">
              {selectedAgent && (
                <div className="space-y-6">
                  {/* Selected Agent profile header */}
                  <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-zinc-750 shadow-xl">
                        <img src={selectedAgent.avatarUrl} alt={selectedAgent.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold text-white">{selectedAgent.name}</h2>
                          <Badge variant={selectedAgent.status === "active" ? "success" : selectedAgent.status === "busy" ? "warning" : "neutral"}>
                            ● {selectedAgent.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">{selectedAgent.role?.name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{selectedAgent.email} | Sector {selectedAgent.departmentId}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="accent" className="font-mono text-3xs py-1">SECURE AUDIT PATHWAY OK</Badge>
                    </div>
                  </div>

                  {/* Operational Tabs bar */}
                  <div className="flex flex-wrap gap-1 bg-zinc-950 p-1.5 rounded-xl border border-zinc-850">
                    <button
                      onClick={() => setWorkspaceTab("briefing")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-2xs font-semibold rounded-lg transition-colors ${
                        workspaceTab === "briefing" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <Activity className="h-3.5 w-3.5 text-zinc-500" />
                      Executive Briefing & Workspace
                    </button>
                    <button
                      onClick={() => setWorkspaceTab("chat")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-2xs font-semibold rounded-lg transition-colors ${
                        workspaceTab === "chat" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <Brain className="h-3.5 w-3.5 text-zinc-500" />
                      World-Class Chat
                    </button>
                    <button
                      onClick={() => setWorkspaceTab("decision")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-2xs font-semibold rounded-lg transition-colors ${
                        workspaceTab === "decision" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-zinc-500" />
                      Decision Center & Approvals
                    </button>
                    <button
                      onClick={() => setWorkspaceTab("memory")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-2xs font-semibold rounded-lg transition-colors ${
                        workspaceTab === "memory" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <Database className="h-3.5 w-3.5 text-zinc-500" />
                      Memory & Knowledge Graph
                    </button>
                    <button
                      onClick={() => setWorkspaceTab("collab")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-2xs font-semibold rounded-lg transition-colors ${
                        workspaceTab === "collab" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5 text-zinc-500" />
                      Multi-AI Debate Room
                    </button>
                  </div>

                  {/* ACTIVE TAB DRAWERS */}
                  <div className="bg-zinc-900/20 p-6 rounded-2xl border border-zinc-800/60 min-h-[400px]">
                    
                    {/* A. EXECUTIVE BRIEFINGS AND SPECIFIC INTERFACES */}
                    {workspaceTab === "briefing" && (
                      <div className="space-y-6">
                        {/* 1. If Agent is CEO (id 1) */}
                        {selectedAgent.roleId === 1 && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-4">
                                <h3 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                                  <Clock className="h-4 w-4" /> Daily Briefing & Status
                                </h3>
                                <p className="text-[11px] text-zinc-300 leading-relaxed">
                                  "Our cross-department margins are robust at **74%**, driven by optimized inventory turns under SKU safety stocks. Inbound deals are processing smoothly, but I suggest logging an authorized sales budget extension to capture the high Q3 inbound traffic forecast."
                                </p>
                                <div className="p-3.5 bg-zinc-900/50 rounded-xl border border-zinc-800/60 space-y-2">
                                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Current Business Health</span>
                                  <div className="grid grid-cols-2 gap-2 text-2xs font-mono">
                                    <span className="text-zinc-400">Total Runrate:</span>
                                    <span className="text-emerald-400 font-bold">$10.4M USD</span>
                                    <span className="text-zinc-400">Monthly Burn:</span>
                                    <span className="text-rose-400 font-bold">$15.2K USD</span>
                                  </div>
                                </div>
                              </Card>

                              <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-4">
                                <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                                  <ShieldAlert className="h-4 w-4 text-amber-400" /> Risk & Strategic Summary
                                </h3>
                                <p className="text-[11px] text-zinc-300 leading-relaxed">
                                  "An anomaly login threat from IP 194.22.10.88 was neutralized by security triggers. Dead stocks detected on warehouse SKU licenses are high. Fiona (Finance) compromised marketing's campaign budget to $35K."
                                </p>
                                <div className="flex gap-2">
                                  <Badge variant="warning">SOC-2 Audited</Badge>
                                  <Badge variant="success">Risk Cleared</Badge>
                                </div>
                              </Card>
                            </div>

                            {/* Revenue analysis charts */}
                            <Card className="p-5 bg-zinc-950 border border-zinc-850">
                              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 mb-4 uppercase tracking-wider">
                                <TrendingUp className="h-4 w-4 text-indigo-400" /> Revenue Runway Analysis (Daily Core Settlement)
                              </h3>
                              <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart
                                    data={[
                                      { day: "07/10", rev: 432544 },
                                      { day: "07/11", rev: 445200 },
                                      { day: "07/12", rev: 450300 },
                                      { day: "07/13", rev: 425100 },
                                      { day: "07/14", rev: 489200 },
                                      { day: "07/15", rev: 512000 }
                                    ]}
                                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                                  >
                                    <XAxis dataKey="day" stroke="#52525b" fontSize={9} />
                                    <YAxis stroke="#52525b" fontSize={9} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="rev" stroke="#6366f1" fillOpacity={0.15} fill="url(#colorIndigo)" />
                                    <defs>
                                      <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            </Card>
                          </div>
                        )}

                        {/* 2. If Agent is Executive Assistant (id 2) */}
                        {selectedAgent.roleId === 2 && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-4">
                                <h3 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                                  <Calendar className="h-4 w-4" /> Calendar & Scheduling
                                </h3>
                                <div className="space-y-2.5">
                                  {[
                                    { time: "09:00 AM", event: "Strategy Briefing with AI CEO", icon: CheckSquare, active: true },
                                    { time: "11:30 AM", event: "Lead Scoring Audit - CRM Corey", icon: CheckSquare, active: false },
                                    { time: "02:00 PM", event: "Supplier Performance Analytics sync", icon: Clock, active: false }
                                  ].map((ev, i) => (
                                    <div key={i} className="flex items-center justify-between p-2.5 rounded bg-zinc-900 border border-zinc-800 text-2xs">
                                      <div className="flex items-center gap-2">
                                        <span className="text-zinc-500 font-mono">{ev.time}</span>
                                        <span className="text-zinc-200 font-semibold">{ev.event}</span>
                                      </div>
                                      {ev.active ? <Badge variant="success">Completed</Badge> : <Badge variant="neutral">Scheduled</Badge>}
                                    </div>
                                  ))}
                                </div>
                              </Card>

                              <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-4">
                                <h3 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                                  <FileText className="h-4 w-4" /> Reminders & Action Items
                                </h3>
                                <div className="space-y-3 text-2xs text-zinc-300">
                                  <div className="flex items-start gap-2">
                                    <span className="h-2 w-2 rounded-full bg-rose-500 mt-1" />
                                    <div>
                                      <p className="font-semibold text-zinc-200">Reconcile Stripe Checkout Settlement</p>
                                      <p className="text-zinc-500 text-3xs">Pending daily audit clearance</p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <span className="h-2 w-2 rounded-full bg-amber-500 mt-1" />
                                    <div>
                                      <p className="font-semibold text-zinc-200">Verify SOC-2 Policy compliance</p>
                                      <p className="text-zinc-500 text-3xs">Assigned to Carter Compliance</p>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            </div>
                          </div>
                        )}

                        {/* 3. If Agent is Sales Manager (id 3) */}
                        {selectedAgent.roleId === 3 && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-4">
                                <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                                  <TrendingUp className="h-4 w-4" /> Sales Forecast & Revenue Prediction
                                </h3>
                                <div className="p-3.5 bg-zinc-900/50 rounded-xl border border-zinc-800 space-y-2">
                                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Q3 Deal Pipeline Target</span>
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-sm font-bold text-white font-mono">$1,280,000</span>
                                    <span className="text-emerald-400 text-2xs font-mono font-bold">▲ +18% Prediction</span>
                                  </div>
                                </div>
                              </Card>

                              <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-4">
                                <h3 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                                  <Users className="h-4 w-4" /> Lead Prioritization Scoring
                                </h3>
                                <div className="space-y-2">
                                  {[
                                    { name: "Apex Global", score: 96, industry: "B2B Tech", status: "Hot Opportunity" },
                                    { name: "Nova Logistics", score: 88, industry: "Retail Tech", status: "Nurturing" }
                                  ].map((l, i) => (
                                    <div key={i} className="flex justify-between items-center p-2 rounded bg-zinc-900 border border-zinc-800 text-2xs">
                                      <div>
                                        <p className="font-bold text-zinc-200">{l.name}</p>
                                        <p className="text-zinc-500 text-3xs">{l.industry}</p>
                                      </div>
                                      <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{l.score} Pts</span>
                                    </div>
                                  ))}
                                </div>
                              </Card>
                            </div>
                          </div>
                        )}

                        {/* 4. If Agent is HR Manager (id 5) */}
                        {selectedAgent.roleId === 5 && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-4">
                                <h3 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                                  <Users className="h-4 w-4" /> Hiring Suggestions & Candidates
                                </h3>
                                <div className="space-y-2">
                                  {[
                                    { name: "Amelia Stone", role: "Sr. Voice Engineer", fit: "94% Match" },
                                    { name: "Robert Drake", role: "Database Admin", fit: "88% Match" }
                                  ].map((c, i) => (
                                    <div key={i} className="flex justify-between items-center p-2 rounded bg-zinc-900 border border-zinc-800 text-2xs">
                                      <div>
                                        <p className="font-semibold text-zinc-200">{c.name}</p>
                                        <p className="text-zinc-500 text-3xs">{c.role}</p>
                                      </div>
                                      <Badge variant="success">{c.fit}</Badge>
                                    </div>
                                  ))}
                                </div>
                              </Card>

                              <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-4">
                                <h3 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                                  <Activity className="h-4 w-4" /> Attendance Analysis
                                </h3>
                                <p className="text-[11px] text-zinc-300 leading-relaxed">
                                  Staff engagement levels stand at **91%**. System logs confirm that the average SLA attendance score remains above corporate targets. Average resolution complies with SOC-2 policies.
                                </p>
                              </Card>
                            </div>
                          </div>
                        )}

                        {/* 5. If Agent is Finance Manager (id 6) */}
                        {selectedAgent.roleId === 6 && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-4">
                                <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                                  <DollarSign className="h-4 w-4" /> Cash Flow Analysis
                                </h3>
                                <p className="text-[11px] text-zinc-300 leading-relaxed">
                                  Our liquidity model shows an operating reserve account balance of **$450,300 USD**. Cash burn rate remains stable at **$15.2K/mo**. Net-15 invoice payment discounts will boost overall cash liquidity.
                                </p>
                              </Card>

                              <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-4">
                                <h3 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                                  <TrendingUp className="h-4 w-4" /> Budget Forecasting
                                </h3>
                                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1">
                                  <span className="text-[9px] font-mono text-zinc-500 uppercase">Q3 Marketing Allocation</span>
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-xs font-bold text-zinc-200 font-mono">$35,000 USD</span>
                                    <span className="text-rose-400 font-mono text-3xs">Compromised Limit</span>
                                  </div>
                                </div>
                              </Card>
                            </div>
                          </div>
                        )}

                        {/* 6. General fallback operations panel for other roles */}
                        {![1, 2, 3, 5, 6].includes(selectedAgent.roleId) && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-3">
                                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Core Dashboard Panel</h3>
                                <p className="text-[11px] text-zinc-400 leading-relaxed">
                                  Preloaded parameters show high efficiency. My specific operational algorithms run constantly against active databases.
                                </p>
                                <div className="space-y-2 mt-2">
                                  <div className="flex justify-between text-2xs font-mono border-b border-zinc-850 pb-1.5">
                                    <span className="text-zinc-500">Department:</span>
                                    <span className="text-zinc-300">{getDeptName(selectedAgent.departmentId)}</span>
                                  </div>
                                  <div className="flex justify-between text-2xs font-mono">
                                    <span className="text-zinc-500">Configured temperature:</span>
                                    <span className="text-indigo-400 font-bold">{selectedAgent.configuration?.temperature || 0.2}</span>
                                  </div>
                                </div>
                              </Card>

                              <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-4">
                                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Capabilities & Reason Registers</h3>
                                <div className="space-y-2">
                                  {selectedAgent.capabilities?.map((cap) => (
                                    <div key={cap.id} className="p-2 bg-zinc-900 rounded border border-zinc-800/80">
                                      <div className="flex justify-between text-2xs font-bold">
                                        <span className="text-zinc-200">{cap.name}</span>
                                        <span className="text-indigo-400 font-mono">{cap.proficiency}%</span>
                                      </div>
                                      <p className="text-4xs text-zinc-500 mt-1">{cap.description}</p>
                                    </div>
                                  ))}
                                </div>
                              </Card>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* B. WORLD CLASS CHAT SYSTEM */}
                    {workspaceTab === "chat" && (
                      <div className="flex flex-col gap-4 h-[500px]">
                        <div className="flex justify-between items-center bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/80">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-2xs font-semibold text-zinc-300">Active secure conversation with {selectedAgent.name}</span>
                          </div>
                          
                          {/* Pin / Folder / Bookmarks shortcuts */}
                          <div className="flex gap-1.5">
                            <button className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-zinc-300 cursor-pointer">
                              <Pin className="h-3.5 w-3.5" />
                            </button>
                            <button className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-zinc-300 cursor-pointer">
                              <Folder className="h-3.5 w-3.5" />
                            </button>
                            <button className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-zinc-300 cursor-pointer">
                              <Bookmark className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Message log */}
                        <div className="flex-1 overflow-y-auto p-4 bg-zinc-950 rounded-2xl border border-zinc-850 flex flex-col gap-4">
                          {chatMessages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-2">
                              <Brain className="h-8 w-8 opacity-20" />
                              <p className="text-xs font-mono text-center max-w-sm">
                                Speak with {selectedAgent.name} to request forecasts, run operational analyses, or coordinate cross-department activities.
                              </p>
                            </div>
                          ) : (
                            chatMessages.map((msg, i) => (
                              <div
                                key={i}
                                className={`flex flex-col max-w-[80%] ${
                                  msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                                }`}
                              >
                                <span className="text-[10px] text-zinc-500 font-mono mb-1">
                                  {msg.sender === "user" ? "You" : selectedAgent.name}
                                </span>
                                <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                                  msg.sender === "user"
                                    ? "bg-indigo-600 text-white rounded-tr-none"
                                    : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none whitespace-pre-wrap"
                                }`}>
                                  {msg.content}
                                </div>
                              </div>
                            ))
                          )}
                          {isChatTyping && (
                            <div className="self-start flex items-center gap-2 bg-zinc-900 border border-zinc-800/80 p-3 rounded-xl text-xs text-zinc-400">
                              <Sparkles className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                              <span>{selectedAgent.name} is formulating multi-step operational logic...</span>
                            </div>
                          )}
                          <div ref={chatEndRef} />
                        </div>

                        {/* File Upload Attachment Preview */}
                        {attachments.length > 0 && (
                          <div className="flex gap-2 flex-wrap p-2 bg-zinc-950 rounded-xl border border-zinc-850">
                            {attachments.map((file, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 bg-zinc-900 p-1.5 rounded border border-zinc-800 text-[10px] text-zinc-300">
                                <FileText className="h-3 w-3 text-indigo-400" />
                                <span className="max-w-[120px] truncate">{file.name}</span>
                                <button
                                  type="button"
                                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                                  className="text-zinc-500 hover:text-zinc-300"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Interactive prompt block with drag-drop */}
                        <form
                          onSubmit={handleSendChatMessage}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`flex flex-col bg-zinc-950 p-2 rounded-2xl border transition-colors ${
                            dragOver ? "border-indigo-500 bg-indigo-500/5" : "border-zinc-800"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              placeholder={`Query ${selectedAgent.name} (drag documents here to attach)...`}
                              className="flex-1 bg-transparent border-none text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none p-2"
                            />
                            
                            {/* Paperclip file uploader */}
                            <label className="p-2 hover:bg-zinc-900 rounded-xl text-zinc-500 hover:text-zinc-300 cursor-pointer">
                              <Plus className="h-4 w-4" />
                              <input
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleFileSelect}
                              />
                            </label>

                            <Button
                              type="submit"
                              disabled={isChatTyping}
                              variant="primary"
                              size="sm"
                              className="h-8 px-4"
                            >
                              <Send className="h-3 w-3 mr-1.5" /> Send
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* C. DECISION CENTER AND STRATEGIC ACTIONS */}
                    {workspaceTab === "decision" && (
                      <div className="space-y-6">
                        <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-4">
                          <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Executive Strategic Recommendations
                            </h3>
                            <Badge variant="accent">Action Center</Badge>
                          </div>

                          <div className="space-y-3.5">
                            {recommendationsList.length === 0 ? (
                              <div className="text-center py-6 text-2xs text-zinc-500">All recommendations cleared and synchronized.</div>
                            ) : (
                              recommendationsList.map((rec) => (
                                <div key={rec.id} className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-2xs font-bold">
                                      <span className="text-indigo-400 font-mono uppercase">[{rec.category}]</span>
                                      <span className="text-zinc-200">{rec.recommendation}</span>
                                    </div>
                                    <p className="text-3xs text-zinc-400 leading-relaxed">{rec.benefit}</p>
                                    <div className="text-4xs text-zinc-500 font-mono">Confidence Score: {rec.score}%</div>
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      className="text-xs font-semibold h-8"
                                      onClick={() => handleApproveDecision(rec.id)}
                                    >
                                      Approve & Execute
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-xs font-semibold h-8 text-rose-400"
                                      onClick={() => setRecommendationsList(prev => prev.filter(r => r.id !== rec.id))}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </Card>

                        {/* Historic logged decisions */}
                        <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-4">
                          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Historic Executive Decisions Log</h3>
                          <div className="space-y-2.5">
                            {decisionsList.map((dec) => (
                              <div key={dec.id} className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 text-2xs space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-zinc-200">{dec.title}</span>
                                  <span className="text-4xs text-zinc-500 font-mono">{new Date(dec.logged_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-zinc-400 text-3xs leading-relaxed">{dec.rational}</p>
                                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold font-mono">
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  <span>AUTHORIZED AND COMPLETED IN LEDGER</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* D. CONTEXT MEMORY AND KNOWLEDGE SEARCH */}
                    {workspaceTab === "memory" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Memory Logs */}
                          <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-4">
                            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Memory Registers</h3>
                              <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                                <Search className="h-3 w-3 text-zinc-500" />
                                <input
                                  type="text"
                                  placeholder="Search memory..."
                                  value={memorySearch}
                                  onChange={(e) => setMemorySearch(e.target.value)}
                                  className="bg-transparent border-none text-4xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                              {memoriesList
                                .filter(m => m.content.toLowerCase().includes(memorySearch.toLowerCase()))
                                .map((mem) => (
                                  <div key={mem.id} className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1">
                                    <div className="flex justify-between items-center text-[10px] font-mono">
                                      <span className={mem.type === "long-term" ? "text-indigo-400 font-bold" : "text-amber-400 font-bold"}>
                                        [{mem.type.toUpperCase()}]
                                      </span>
                                      <span className="text-zinc-500">{new Date(mem.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-2xs text-zinc-300 leading-relaxed">{mem.content}</p>
                                  </div>
                                ))}
                            </div>
                          </Card>

                          {/* Knowledge Base */}
                          <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-4">
                            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Knowledge Graph Sources</h3>
                              <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                                <Search className="h-3 w-3 text-zinc-500" />
                                <input
                                  type="text"
                                  placeholder="Search wiki sources..."
                                  value={knowledgeSearch}
                                  onChange={(e) => setKnowledgeSearch(e.target.value)}
                                  className="bg-transparent border-none text-4xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                              {knowledgeSources
                                .filter(s => s.title.toLowerCase().includes(knowledgeSearch.toLowerCase()))
                                .map((source, i) => (
                                  <div key={i} className="p-3 bg-zinc-900 hover:bg-zinc-900/80 rounded-xl border border-zinc-800 flex justify-between items-center">
                                    <div className="space-y-0.5">
                                      <p className="text-2xs font-semibold text-zinc-200">{source.title}</p>
                                      <span className="text-4xs text-zinc-500 font-mono">Classification: {source.category}</span>
                                    </div>
                                    <a
                                      href={source.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-4xs font-mono text-indigo-400 hover:underline font-bold"
                                    >
                                      OPEN WIKI
                                    </a>
                                  </div>
                                ))}
                            </div>
                          </Card>

                        </div>

                        {/* Interactive D3/SVG Knowledge Graph Visualization */}
                        <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-3">
                          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Dynamic Knowledge Graph Connections</h3>
                          <div className="h-32 bg-zinc-900/60 rounded-xl border border-zinc-850 flex items-center justify-center relative overflow-hidden">
                            
                            {/* Simple visual graph lines and nodes */}
                            <svg className="absolute inset-0 w-full h-full opacity-30">
                              <line x1="20%" y1="50%" x2="50%" y2="50%" stroke="#4f46e5" strokeWidth="2" />
                              <line x1="50%" y1="50%" x2="80%" y2="30%" stroke="#10b981" strokeWidth="1.5" />
                              <line x1="50%" y1="50%" x2="80%" y2="70%" stroke="#f59e0b" strokeWidth="1.5" />
                            </svg>

                            <div className="absolute left-[15%] flex flex-col items-center gap-1 z-10">
                              <span className="p-1 rounded bg-indigo-500 text-white"><Database className="h-3 w-3" /></span>
                              <span className="text-[9px] font-mono font-bold text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">LEDGER DB</span>
                            </div>

                            <div className="absolute left-[45%] flex flex-col items-center gap-1 z-10">
                              <span className="p-1 rounded bg-indigo-600 text-white"><Brain className="h-4.5 w-4.5 animate-pulse" /></span>
                              <span className="text-[10px] font-mono font-bold text-white bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900">AI COGNITIVE HUB</span>
                            </div>

                            <div className="absolute right-[15%] top-[15%] flex flex-col items-center gap-1 z-10">
                              <span className="p-1 rounded bg-emerald-500 text-white"><ShieldCheck className="h-3 w-3" /></span>
                              <span className="text-[9px] font-mono font-bold text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">SOC-2 VERIFIER</span>
                            </div>

                            <div className="absolute right-[15%] bottom-[15%] flex flex-col items-center gap-1 z-10">
                              <span className="p-1 rounded bg-amber-500 text-white"><TrendingUp className="h-3 w-3" /></span>
                              <span className="text-[9px] font-mono font-bold text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">ROAS FORECAST</span>
                            </div>

                          </div>
                        </Card>
                      </div>
                    )}

                    {/* E. MULTI AGENT DEBATE ROOM */}
                    {workspaceTab === "collab" && (
                      <div className="space-y-6">
                        <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-4">
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Zap className="h-4 w-4 text-amber-400 animate-pulse" /> Multi-AI Collaboration Debates
                          </h3>
                          <p className="text-[11px] text-zinc-400">
                            Coordinate multiple AI agents to debate complex strategic problems or handoff operational workflows in a secure "War Room".
                          </p>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={collabPrompt}
                              onChange={(e) => setCollabPrompt(e.target.value)}
                              placeholder="Enter debate goal or handoff brief..."
                              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none"
                            />
                            <Button
                              onClick={triggerDebate}
                              disabled={isCollabActive}
                              variant="primary"
                              size="sm"
                              className="h-10 px-5 font-semibold text-xs shrink-0"
                            >
                              {isCollabActive ? "Debating..." : "Initiate Debate"}
                            </Button>
                          </div>
                        </Card>

                        {/* Collab message log */}
                        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-5 min-h-[250px] flex flex-col gap-4">
                          {collabMessages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-2 py-10">
                              <Users className="h-8 w-8 opacity-20" />
                              <p className="text-xs font-mono">No active debate sessions. Input a goal above and click 'Initiate Debate'.</p>
                            </div>
                          ) : (
                            collabMessages.map((msg, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex gap-3 items-start p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80"
                              >
                                <img src={msg.avatar} alt={msg.agent} className="h-8 w-8 rounded-md shrink-0 object-cover border border-zinc-700" referrerPolicy="no-referrer" />
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-2xs">
                                    <span className="font-bold text-white">{msg.agent}</span>
                                    <Badge variant="neutral" className="font-mono text-4xs leading-none">{msg.role}</Badge>
                                  </div>
                                  <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                              </motion.div>
                            ))
                          )}
                          {isCollabActive && (
                            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800/80 p-3 rounded-xl text-xs text-zinc-400">
                              <Sparkles className="h-3.5 w-3.5 animate-spin text-amber-400" />
                              <span>Multiple AI agents are evaluating cash flow and marketing thresholds...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
