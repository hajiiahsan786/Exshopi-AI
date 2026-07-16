import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Calendar,
  AlertCircle,
  FileText,
  Activity,
  Award,
  Settings,
  Plus,
  Compass,
  ArrowRightLeft,
  ChevronRight,
  Database,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  BrainCircuit,
  MessageSquare,
  LineChart,
  RefreshCw,
  Clock,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WorkforceWorkspaceProps {
  agent: any;
  onClose: () => void;
  onRefreshAll: () => void;
  allAgents: any[];
}

export default function WorkforceWorkspace({
  agent,
  onClose,
  onRefreshAll,
  allAgents
}: WorkforceWorkspaceProps) {
  const [activeSubTab, setActiveSubTab] = useState<"chat" | "plan" | "delegate" | "report" | "memory" | "compliance" | "config">("chat");

  // Chat State
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Planning State
  const [planGoal, setPlanGoal] = useState("");
  const [currentPlanSteps, setCurrentPlanSteps] = useState<string[]>([]);
  const [isPlanningLoading, setIsPlanningLoading] = useState(false);

  // Delegation State
  const [delegateTargetId, setDelegateTargetId] = useState("");
  const [delegateTitle, setDelegateTitle] = useState("");
  const [delegateDesc, setDelegateDesc] = useState("");
  const [isDelegatingLoading, setIsDelegatingLoading] = useState(false);

  // Recommendations State
  const [recs, setRecs] = useState<any[]>([]);
  const [isRecsLoading, setIsRecsLoading] = useState(false);

  // Reports State
  const [reportTitle, setReportTitle] = useState("");
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [selectedReportContent, setSelectedReportContent] = useState<string | null>(null);

  // Memory State
  const [memoryType, setMemoryType] = useState<"short-term" | "long-term">("short-term");
  const [memoryContent, setMemoryContent] = useState("");
  const [memoriesList, setMemoriesList] = useState<any[]>([]);

  // Config State
  const [temp, setTemp] = useState(0.2);
  const [style, setStyle] = useState("professional");
  const [instructions, setInstructions] = useState("");
  const [toolsList, setToolsList] = useState<string[]>([]);
  const [isConfigSaving, setIsConfigSaving] = useState(false);

  // Audit and Analytics State
  const [audits, setAudits] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load All Tab Specific States
  useEffect(() => {
    if (!agent) return;
    fetchChatHistory();
    fetchMemories();
    fetchReports();
    fetchRecommendations();
    fetchAuditsAndMetrics();
    loadConfig();
    // Default task goal based on agent role
    setPlanGoal(`Formulate specialized performance metrics for ${agent.role?.name || "our department"}`);
    setDelegateTitle(`Execute Q3 task delegation related to ${agent.role?.name || "operations"}`);
    setReportTitle(`Strategic Q2 Performance Alignment Briefing`);
  }, [agent]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const loadConfig = async () => {
    try {
      const res = await fetch(`/api/v1/workforce/configs/${agent.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setTemp(json.data.temperature);
        setStyle(json.data.responseStyle);
        setInstructions(json.data.systemInstructions);
        setToolsList(json.data.toolsEnabled || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const res = await fetch(`/api/v1/workforce/conversations/${agent.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setChatHistory(json.data.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMemories = async () => {
    try {
      const res = await fetch(`/api/v1/workforce/memories/${agent.id}`);
      const json = await res.json();
      if (json.success) setMemoriesList(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch(`/api/v1/workforce/reports/${agent.id}`);
      const json = await res.json();
      if (json.success) setReportsList(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await fetch(`/api/v1/workforce/recommendations/${agent.id}`);
      const json = await res.json();
      if (json.success) setRecs(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAuditsAndMetrics = async () => {
    try {
      const [resAudit, resMetric] = await Promise.all([
        fetch(`/api/v1/workforce/audit-logs/${agent.id}`),
        fetch(`/api/v1/workforce/analytics/${agent.id}`)
      ]);
      const jsonAudit = await resAudit.json();
      const jsonMetric = await resMetric.json();
      if (jsonAudit.success) setAudits(jsonAudit.data);
      if (jsonMetric.success) setMetrics(jsonMetric.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { sender: "user", content: userMsg, timestamp: new Date().toISOString() }]);
    setIsChatLoading(true);

    try {
      const res = await fetch(`/api/v1/workforce/chat/${agent.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });
      const json = await res.json();
      if (json.success) {
        fetchChatHistory();
        fetchAuditsAndMetrics();
        fetchMemories();
        onRefreshAll();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleTriggerPlanning = async () => {
    if (!planGoal.trim()) return;
    setIsPlanningLoading(true);
    try {
      const res = await fetch(`/api/v1/workforce/plan/${agent.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: planGoal })
      });
      const json = await res.json();
      if (json.success) {
        setCurrentPlanSteps(json.data);
        fetchAuditsAndMetrics();
        onRefreshAll();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlanningLoading(false);
    }
  };

  const handleTriggerDelegate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delegateTargetId || !delegateTitle.trim()) return;
    setIsDelegatingLoading(true);
    try {
      const res = await fetch(`/api/v1/workforce/delegate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromEmpId: agent.id,
          toEmpId: parseInt(delegateTargetId),
          title: delegateTitle,
          description: delegateDesc
        })
      });
      const json = await res.json();
      if (json.success) {
        alert("Task delegated successfully! Logged strategic decision.");
        setDelegateTitle("");
        setDelegateDesc("");
        setDelegateTargetId("");
        fetchAuditsAndMetrics();
        onRefreshAll();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDelegatingLoading(false);
    }
  };

  const handleTriggerRecommendation = async () => {
    setIsRecsLoading(true);
    try {
      const res = await fetch(`/api/v1/workforce/recommend/${agent.id}`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        fetchRecommendations();
        fetchAuditsAndMetrics();
        onRefreshAll();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecsLoading(false);
    }
  };

  const handleTriggerReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim()) return;
    setIsReportLoading(true);
    try {
      const res = await fetch(`/api/v1/workforce/report/${agent.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: reportTitle })
      });
      const json = await res.json();
      if (json.success) {
        setReportTitle("");
        fetchReports();
        fetchAuditsAndMetrics();
        onRefreshAll();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReportLoading(false);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryContent.trim()) return;
    try {
      const res = await fetch(`/api/v1/workforce/memories/${agent.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: memoryType, content: memoryContent })
      });
      const json = await res.json();
      if (json.success) {
        setMemoryContent("");
        fetchMemories();
        fetchAuditsAndMetrics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfigSaving(true);
    try {
      const res = await fetch(`/api/v1/workforce/configs/${agent.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperature: temp,
          responseStyle: style,
          systemInstructions: instructions,
          toolsEnabled: toolsList
        })
      });
      const json = await res.json();
      if (json.success) {
        alert("Configuration saved successfully!");
        fetchAuditsAndMetrics();
        onRefreshAll();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsConfigSaving(false);
    }
  };

  const toggleTool = (tool: string) => {
    if (toolsList.includes(tool)) {
      setToolsList(toolsList.filter(t => t !== tool));
    } else {
      setToolsList([...toolsList, tool]);
    }
  };

  const otherEmployees = allAgents.filter(a => a.id !== agent.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-6 lg:col-span-8 overflow-hidden min-h-[600px]"
    >
      {/* 1. Header Profile block */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-4">
          <img
            src={agent.avatarUrl}
            alt={agent.name}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-cyan-500/20"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-sans font-bold text-white text-lg tracking-tight">{agent.name}</h2>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                agent.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse" :
                agent.status === "busy" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                "bg-slate-800 text-slate-400 border border-slate-700"
              }`}>
                ● {agent.status}
              </span>
            </div>
            <p className="text-xs text-cyan-400 font-medium mt-0.5">{agent.role?.name}</p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{agent.email}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="bg-slate-950 border border-slate-800 hover:text-white text-slate-400 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
        >
          ✕ Close Agent Hub
        </button>
      </div>

      {/* 2. Workspace Sub Tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-950/40 p-1.5 rounded-2xl border border-slate-800">
        {[
          { id: "chat", label: "Interactive Chat", icon: MessageSquare },
          { id: "plan", label: "Planning Engine", icon: BrainCircuit },
          { id: "delegate", label: "Delegation & Decisions", icon: ArrowRightLeft },
          { id: "report", label: "Executive Reports", icon: FileText },
          { id: "memory", label: "Knowledge & Memory", icon: Database },
          { id: "compliance", label: "Audit & Compliance", icon: ShieldCheck },
          { id: "config", label: "LLM Configuration", icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setSelectedReportContent(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeSubTab === tab.id
                  ? "bg-slate-800 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Panel Views */}
      <div className="flex-1 overflow-y-auto max-h-[500px] pr-1">
        <AnimatePresence mode="wait">
          {/* A. CHAT TAB */}
          {activeSubTab === "chat" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4 h-[420px]"
            >
              <div className="flex-1 bg-slate-950/80 border border-slate-800/60 rounded-2xl p-4 overflow-y-auto flex flex-col gap-3.5">
                {chatHistory.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-2">
                    <BrainCircuit className="w-8 h-8 opacity-20" />
                    <p className="text-xs text-center font-sans max-w-sm">
                      Initialize session. Speak with {agent.name} directly to request forecasts, run operational analyses, or coordinate cross-department activities.
                    </p>
                  </div>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col max-w-[80%] ${
                        msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                      }`}
                    >
                      <span className="text-[10px] text-slate-500 font-mono mb-1">
                        {msg.sender === "user" ? "You" : agent.name}
                      </span>
                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-cyan-600 text-white rounded-tr-none"
                          : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {isChatLoading && (
                  <div className="self-start flex items-center gap-2 bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs text-slate-400">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>{agent.name} is executing multi-step reasoning...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder={`Message ${agent.name}...`}
                  required
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isChatLoading}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs px-5 rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-cyan-500/10"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>
            </motion.div>
          )}

          {/* B. PLANNING ENGINE TAB */}
          {activeSubTab === "plan" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
                <h3 className="font-sans font-bold text-white text-sm flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-cyan-400" />
                  Planning Engine Gateway
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Provide an enterprise milestone or workflow target. The planning engine coordinates with the active agent's capability registers to construct a multi-step roadmap.
                </p>

                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={planGoal}
                    onChange={(e) => setPlanGoal(e.target.value)}
                    placeholder="Enter strategic milestone..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleTriggerPlanning}
                    disabled={isPlanningLoading}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 rounded-xl flex items-center gap-1 transition-all"
                  >
                    {isPlanningLoading ? "Planning..." : "Generate Roadmap"}
                  </button>
                </div>
              </div>

              {currentPlanSteps.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white font-sans uppercase tracking-wider">Formulated Roadmap Steps</span>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">READY</span>
                  </div>
                  <div className="flex flex-col gap-3 mt-1">
                    {currentPlanSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="bg-slate-900 border border-slate-800 text-cyan-400 font-mono text-xs font-bold h-6 w-6 rounded-lg flex items-center justify-center shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-xs text-slate-300 pt-0.5 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* C. DELEGATION & DECISIONS TAB */}
          {activeSubTab === "delegate" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {/* Form on left */}
              <form onSubmit={handleTriggerDelegate} className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                <h3 className="font-sans font-bold text-white text-sm flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                  Delegate Downstream Task
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Recipient AI Worker</label>
                  <select
                    value={delegateTargetId}
                    onChange={(e) => setDelegateTargetId(e.target.value)}
                    required
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Select Destination Agent --</option>
                    {otherEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role?.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Task Title</label>
                  <input
                    type="text"
                    value={delegateTitle}
                    onChange={(e) => setDelegateTitle(e.target.value)}
                    required
                    placeholder="E.g., Coordinate inventory levels report"
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Task Scope / Descriptions</label>
                  <textarea
                    value={delegateDesc}
                    onChange={(e) => setDelegateDesc(e.target.value)}
                    placeholder="Specify boundaries, target systems, or guidelines..."
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 h-20 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isDelegatingLoading}
                  className="bg-cyan-600 hover:bg-cyan-500 font-bold text-xs py-3 rounded-xl transition-all"
                >
                  {isDelegatingLoading ? "Routing..." : "Confirm Delegation"}
                </button>
              </form>

              {/* Recommendations on right */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-sans font-bold text-white text-sm flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    Strategic Recommendations
                  </h3>
                  <button
                    onClick={handleTriggerRecommendation}
                    disabled={isRecsLoading}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Trigger Engine
                  </button>
                </div>

                {recs.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-600 py-6 gap-1">
                    <Compass className="w-6 h-6 opacity-20" />
                    <p className="text-xs font-sans text-center">No recommendations computed yet. Select 'Trigger Engine' to execute real recommendation algorithms.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 overflow-y-auto max-h-[250px]">
                    {recs.map((r, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-cyan-400 font-semibold">{r.category}</span>
                          <span className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 font-bold">Score {r.score}</span>
                        </div>
                        <p className="text-xs text-slate-200 mt-1 font-semibold">{r.recommendation}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{r.benefit}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* D. EXECUTIVE REPORTS TAB */}
          {activeSubTab === "report" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              {selectedReportContent ? (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="font-sans font-bold text-white text-sm">Compiled Document Preview</h3>
                    <button
                      onClick={() => setSelectedReportContent(null)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-bold"
                    >
                      ← Back to Reports
                    </button>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-900 max-h-[300px] overflow-y-auto">
                    <pre className="text-slate-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                      {selectedReportContent}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Report Synthesizer Form */}
                  <form onSubmit={handleTriggerReport} className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                    <h3 className="font-sans font-bold text-white text-sm flex items-center gap-1.5 border-b border-slate-800 pb-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      Synthesize Strategic Report
                    </h3>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Document Title</label>
                      <input
                        type="text"
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                        required
                        placeholder="E.g., Global logistics and cost matrix"
                        className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isReportLoading}
                      className="bg-cyan-600 hover:bg-cyan-500 font-bold text-xs py-3 rounded-xl transition-all"
                    >
                      {isReportLoading ? "Compiling via LLM..." : "Synthesize PDF/Markdown"}
                    </button>
                  </form>

                  {/* Reports Archive */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
                    <h3 className="font-sans font-bold text-white text-sm border-b border-slate-800 pb-2">Reports Archive</h3>
                    {reportsList.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-600 py-6 gap-1">
                        <FileText className="w-6 h-6 opacity-20" />
                        <p className="text-xs font-sans text-center">No reports compiled yet.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[220px]">
                        {reportsList.map((rep, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedReportContent(rep.content)}
                            className="bg-slate-950 hover:bg-slate-900 border border-slate-900 p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <FileText className="w-4 h-4 text-cyan-400" />
                              <span className="text-xs text-slate-200 font-medium truncate max-w-[180px]">{rep.title}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* E. KNOWLEDGE & MEMORY TAB */}
          {activeSubTab === "memory" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {/* Memories log list */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                <h3 className="font-sans font-bold text-white text-sm border-b border-slate-800 pb-2 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-cyan-400" />
                  Context Memory registers
                </h3>

                <div className="flex flex-col gap-3 overflow-y-auto max-h-[260px]">
                  {memoriesList.map((mem, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span className={mem.type === "long-term" ? "text-cyan-400 font-bold" : "text-purple-400 font-bold"}>
                          [{mem.type.toUpperCase()}]
                        </span>
                        <span>{new Date(mem.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{mem.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inject custom memory form */}
              <form onSubmit={handleAddMemory} className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                <h3 className="font-sans font-bold text-white text-sm border-b border-slate-800 pb-2">Inject Custom Memory Block</h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Memory Storage tier</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="mtype"
                        checked={memoryType === "short-term"}
                        onChange={() => setMemoryType("short-term")}
                        className="accent-cyan-500"
                      />
                      Short-Term (Context Stack)
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="mtype"
                        checked={memoryType === "long-term"}
                        onChange={() => setMemoryType("long-term")}
                        className="accent-cyan-500"
                      />
                      Long-Term (Durable Storage)
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Memory Content</label>
                  <textarea
                    value={memoryContent}
                    onChange={(e) => setMemoryContent(e.target.value)}
                    required
                    placeholder="E.g., Authorized strategic Q3 sales budget extension of $25K."
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 h-24 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-3 rounded-xl transition-all"
                >
                  Inject into Memory Context
                </button>
              </form>
            </motion.div>
          )}

          {/* F. AUDIT & COMPLIANCE TAB */}
          {activeSubTab === "compliance" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {/* Compliance ledger */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                <h3 className="font-sans font-bold text-white text-sm border-b border-slate-800 pb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Compliance Audit Trail ledger
                </h3>

                <div className="flex flex-col gap-3 overflow-y-auto max-h-[260px]">
                  {audits.map((aud, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex flex-col gap-2">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span className="text-emerald-400 font-semibold">{aud.action}</span>
                        <span>{new Date(aud.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{aud.details}</p>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold font-mono">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>PERMISSION VERIFIED: OK</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Local KPIs and metrics */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                <h3 className="font-sans font-bold text-white text-sm border-b border-slate-800 pb-2 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                  Dynamic Agent KPI telemetry
                </h3>

                <div className="flex flex-col gap-3">
                  {metrics.map((met, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-medium">{met.metricName}</span>
                      <span className="font-mono text-xs font-bold text-cyan-400">{met.metricValue}</span>
                    </div>
                  ))}

                  {/* Operational status box */}
                  <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl flex flex-col gap-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">Governance status</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      All strategic operations mapped against GDPR privacy standards and strict SOC-2 multi-tenant corporate limits.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* G. CONFIGURATION TAB */}
          {activeSubTab === "config" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              <form onSubmit={handleSaveConfig} className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 flex flex-col gap-5">
                <h3 className="font-sans font-bold text-white text-sm flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Settings className="w-4 h-4 text-cyan-400" />
                  Customize Agent LLM Configuration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Temperature ({temp})</label>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={temp}
                      onChange={(e) => setTemp(parseFloat(e.target.value))}
                      className="accent-cyan-500 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[9px] text-slate-500 font-mono">Lower values generate deterministic corporate logic; higher values spur creative solutions.</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Response Styling</label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                    >
                      <option value="professional">Professional</option>
                      <option value="concise">Concise</option>
                      <option value="detailed">Detailed</option>
                      <option value="playful">Playful</option>
                    </select>
                  </div>

                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">System Instructions Override</label>
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 h-20"
                    />
                  </div>

                  <div className="col-span-2 flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono border-b border-slate-800 pb-1">Enabled Local Tools</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                      {[
                        "CRM Tool", "Finance Tool", "Inventory Tool", "Sales Tool",
                        "Workflow Tool", "Notification Tool", "Search Tool", "Reporting Tool"
                      ].map(tool => (
                        <label key={tool} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={toolsList.includes(tool)}
                            onChange={() => toggleTool(tool)}
                            className="accent-cyan-500 rounded"
                          />
                          {tool}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isConfigSaving}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/10"
                >
                  {isConfigSaving ? "Saving Config..." : "Save Custom Configuration"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
