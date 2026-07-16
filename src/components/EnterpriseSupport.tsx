import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LifeBuoy, Search, Filter, Plus, ChevronRight, MessageSquare, 
  BookOpen, Star, AlertTriangle, CheckCircle, Clock, Send, 
  Sparkles, Globe, ArrowRight, User, Mail, ShieldAlert, 
  Trash2, GitPullRequest, Split, FileText, Check, ArrowLeft,
  ThumbsUp, ThumbsDown, HelpCircle, Activity, ChevronDown
} from "lucide-react";
import { Button, Card, Input, Textarea, Select, Badge, Dialog, Tooltip } from "./UI";

interface Ticket {
  id: number;
  title: string;
  description: string;
  customerName: string;
  customerEmail: string;
  status: string;
  priority: string;
  assignedTo: string;
  category: string;
  sentiment: string;
  satisfaction: number | null;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
}

interface Message {
  id: number;
  ticketId: number;
  sender: string;
  senderName: string;
  message: string;
  timestamp: string;
  isInternalNote: boolean;
}

interface KBArticle {
  id: number;
  title: string;
  category: string;
  content: string;
  tags: string[];
  views: number;
  helpfulVotes: number;
  unhelpfulVotes: number;
  updatedAt: string;
}

interface LiveChat {
  id: number;
  customerName: string;
  customerEmail: string;
  status: string;
  typingIndicator: boolean;
  messages: Array<{ sender: string; text: string; timestamp: string }>;
}

export default function EnterpriseSupport() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "tickets" | "kb" | "chats">("dashboard");
  
  // Dashboard states
  const [metrics, setMetrics] = useState<any>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Tickets states
  const [ticketsList, setTicketsList] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<Message[]>([]);
  const [ticketMessagesLoading, setTicketMessagesLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [ticketSearch, setTicketSearch] = useState("");
  
  // New Ticket / Create Ticket State
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [newTicketDesc, setNewTicketDesc] = useState("");
  const [newTicketCustName, setNewTicketCustName] = useState("");
  const [newTicketCustEmail, setNewTicketCustEmail] = useState("");
  const [newTicketPriority, setNewTicketPriority] = useState("medium");
  const [newTicketCategory, setNewTicketCategory] = useState("technical");

  // Merge & Split Ticket States
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeSourceId, setMergeSourceId] = useState("");
  const [splitOpen, setSplitOpen] = useState(false);
  const [splitTitle, setSplitTitle] = useState("");
  const [splitDesc, setSplitDesc] = useState("");

  // Reply state
  const [replyText, setReplyText] = useState("");
  const [replyIsInternal, setReplyIsInternal] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);

  // AI Assist States
  const [aiAssistLoading, setAiAssistLoading] = useState(false);
  const [aiAssistResult, setAiAssistResult] = useState<string | null>(null);
  const [aiAssistAction, setAiAssistAction] = useState<string | null>(null);
  const [translateLang, setTranslateLang] = useState("Spanish");

  // KB States
  const [kbArticlesList, setKbArticlesList] = useState<KBArticle[]>([]);
  const [kbLoading, setKbLoading] = useState(true);
  const [kbSearch, setKbSearch] = useState("");
  const [kbCategoryFilter, setKbCategoryFilter] = useState("all");
  const [kbCreateOpen, setKbCreateOpen] = useState(false);
  const [newKbTitle, setNewKbTitle] = useState("");
  const [newKbCategory, setNewKbCategory] = useState("Technical Support");
  const [newKbContent, setNewKbContent] = useState("");
  const [newKbTags, setNewKbTags] = useState("");

  // Chats States
  const [chatSessions, setChatSessions] = useState<LiveChat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<LiveChat | null>(null);
  const [chatReplyText, setChatReplyText] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Load metrics
  const fetchMetrics = async () => {
    try {
      setMetricsLoading(true);
      const res = await fetch("/api/v1/support/dashboard");
      const json = await res.json();
      if (json.success) {
        setMetrics(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMetricsLoading(false);
    }
  };

  // Load tickets
  const fetchTickets = async () => {
    try {
      setTicketsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);
      if (ticketSearch) params.append("search", ticketSearch);

      const res = await fetch(`/api/v1/support/tickets?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setTicketsList(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTicketsLoading(false);
    }
  };

  // Load specific ticket messages
  const fetchTicketMessages = async (ticketId: number) => {
    try {
      setTicketMessagesLoading(true);
      const res = await fetch(`/api/v1/support/tickets/${ticketId}/messages`);
      const json = await res.json();
      if (json.success) {
        setTicketMessages(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTicketMessagesLoading(false);
    }
  };

  // Load KB
  const fetchKB = async () => {
    try {
      setKbLoading(true);
      const params = new URLSearchParams();
      if (kbCategoryFilter !== "all") params.append("category", kbCategoryFilter);
      if (kbSearch) params.append("search", kbSearch);

      const res = await fetch(`/api/v1/support/kb?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setKbArticlesList(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setKbLoading(false);
    }
  };

  // Load active chats
  const fetchChats = async () => {
    try {
      setChatsLoading(true);
      const res = await fetch("/api/v1/support/chats");
      const json = await res.json();
      if (json.success) {
        setChatSessions(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChatsLoading(false);
    }
  };

  // Trigger loading on tab change
  useEffect(() => {
    if (activeTab === "dashboard") fetchMetrics();
    if (activeTab === "tickets") fetchTickets();
    if (activeTab === "kb") fetchKB();
    if (activeTab === "chats") fetchChats();
  }, [activeTab]);

  // Handle ticket search & filters reload
  useEffect(() => {
    if (activeTab === "tickets") {
      fetchTickets();
    }
  }, [statusFilter, priorityFilter, ticketSearch]);

  // Handle KB search
  useEffect(() => {
    if (activeTab === "kb") {
      fetchKB();
    }
  }, [kbSearch, kbCategoryFilter]);

  // Fetch ticket details when selected
  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setAiAssistResult(null);
    setAiAssistAction(null);
    fetchTicketMessages(ticket.id);
  };

  // Submit reply message/internal note to ticket
  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    try {
      setReplyLoading(true);
      const res = await fetch(`/api/v1/support/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: replyIsInternal ? "agent" : "ai",
          senderName: replyIsInternal ? "Human Administrator" : "Ethan AI (Support Expert)",
          message: replyText,
          isInternalNote: replyIsInternal
        })
      });
      const json = await res.json();
      if (json.success) {
        setReplyText("");
        fetchTicketMessages(selectedTicket.id);
        // refresh the ticket's update date
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReplyLoading(false);
    }
  };

  // Submit Create Ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTicketTitle,
          description: newTicketDesc,
          customerName: newTicketCustName,
          customerEmail: newTicketCustEmail,
          priority: newTicketPriority,
          category: newTicketCategory
        })
      });
      const json = await res.json();
      if (json.success) {
        setCreateTicketOpen(false);
        // Clear
        setNewTicketTitle("");
        setNewTicketDesc("");
        setNewTicketCustName("");
        setNewTicketCustEmail("");
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // AI Assist calls
  const handleAIAssist = async (action: string) => {
    if (!selectedTicket) return;
    try {
      setAiAssistLoading(true);
      setAiAssistAction(action);
      setAiAssistResult(null);

      const res = await fetch(`/api/v1/support/tickets/${selectedTicket.id}/ai-assist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          language: action === "translate" ? translateLang : undefined
        })
      });
      const json = await res.json();
      if (json.success) {
        setAiAssistResult(json.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiAssistLoading(false);
    }
  };

  // Ticket Merge
  const handleMergeTickets = async () => {
    if (!selectedTicket || !mergeSourceId) return;
    try {
      const res = await fetch(`/api/v1/support/tickets/${selectedTicket.id}/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: mergeSourceId })
      });
      const json = await res.json();
      if (json.success) {
        setMergeOpen(false);
        setMergeSourceId("");
        fetchTicketMessages(selectedTicket.id);
        fetchTickets();
      } else {
        alert(json.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Ticket Split
  const handleSplitTicket = async () => {
    if (!selectedTicket || !splitTitle || !splitDesc) return;
    try {
      const res = await fetch(`/api/v1/support/tickets/${selectedTicket.id}/split`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newTitle: splitTitle, newDescription: splitDesc })
      });
      const json = await res.json();
      if (json.success) {
        setSplitOpen(false);
        setSplitTitle("");
        setSplitDesc("");
        fetchTicketMessages(selectedTicket.id);
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // KB Voting
  const handleKbVote = async (articleId: number, type: "helpful" | "unhelpful") => {
    try {
      const res = await fetch(`/api/v1/support/kb/${articleId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      const json = await res.json();
      if (json.success) {
        // Update local item
        setKbArticlesList(prev => prev.map(a => a.id === articleId ? json.data : a));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create KB Article
  const handleCreateKbArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/support/kb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newKbTitle,
          category: newKbCategory,
          content: newKbContent,
          tags: newKbTags
        })
      });
      const json = await res.json();
      if (json.success) {
        setKbCreateOpen(false);
        setNewKbTitle("");
        setNewKbContent("");
        setNewKbTags("");
        fetchKB();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Live Chat send message
  const handleSendChatMessage = async () => {
    if (!selectedChat || !chatReplyText.trim()) return;
    try {
      const res = await fetch(`/api/v1/support/chats/${selectedChat.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "ai",
          text: chatReplyText
        })
      });
      const json = await res.json();
      if (json.success) {
        setChatReplyText("");
        setSelectedChat(json.data);
        // refresh list
        fetchChats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Auto scroll live chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

  // Update Ticket Status directly
  const handleUpdateTicketStatus = async (status: string) => {
    if (!selectedTicket) return;
    try {
      const res = await fetch(`/api/v1/support/tickets/${selectedTicket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (json.success) {
        setSelectedTicket(prev => prev ? { ...prev, status } : null);
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update Ticket Priority directly
  const handleUpdateTicketPriority = async (priority: string) => {
    if (!selectedTicket) return;
    try {
      const res = await fetch(`/api/v1/support/tickets/${selectedTicket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority })
      });
      const json = await res.json();
      if (json.success) {
        setSelectedTicket(prev => prev ? { ...prev, priority } : null);
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Assign Ticket directly
  const handleUpdateTicketAssignment = async (assignedTo: string) => {
    if (!selectedTicket) return;
    try {
      const res = await fetch(`/api/v1/support/tickets/${selectedTicket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo })
      });
      const json = await res.json();
      if (json.success) {
        setSelectedTicket(prev => prev ? { ...prev, assignedTo } : null);
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100">
      {/* Module Sub-Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-zinc-900 gap-4 bg-zinc-900/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-950/40 border border-indigo-900/30 rounded-lg text-indigo-400">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Enterprise AI Support Center</h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">SLA-Driven Autonomous Customer Help Desk</p>
            </div>
          </div>
        </div>

        {/* Modular Tabs */}
        <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "dashboard" ? "bg-indigo-600 text-white shadow-md" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "tickets" ? "bg-indigo-600 text-white shadow-md" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            SLA Tickets
          </button>
          <button
            onClick={() => setActiveTab("kb")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "kb" ? "bg-indigo-600 text-white shadow-md" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab("chats")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "chats" ? "bg-indigo-600 text-white shadow-md" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Live Assist
          </button>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-6">
            {metricsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-28 bg-zinc-900 border border-zinc-800 rounded-xl" />
                ))}
              </div>
            ) : metrics ? (
              <>
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-2xs font-mono text-zinc-500 uppercase tracking-wider">Open Tickets</p>
                      <h3 className="text-3xl font-extrabold text-white mt-1">{metrics.openTickets}</h3>
                      <p className="text-2xs text-indigo-400 font-semibold mt-1 flex items-center gap-1">
                        <Activity className="h-3 w-3" /> Level-1 Queue Active
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center text-indigo-400">
                      <LifeBuoy className="h-5 w-5" />
                    </div>
                  </Card>

                  <Card className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-2xs font-mono text-zinc-500 uppercase tracking-wider">CSAT Score</p>
                      <h3 className="text-3xl font-extrabold text-white mt-1">{metrics.csat} / 5.0</h3>
                      <p className="text-2xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-emerald-400" /> Based on recent reviews
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-emerald-950/40 border border-emerald-900/30 flex items-center justify-center text-emerald-400">
                      <Star className="h-5 w-5" />
                    </div>
                  </Card>

                  <Card className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-2xs font-mono text-zinc-500 uppercase tracking-wider">Avg Response Time</p>
                      <h3 className="text-3xl font-extrabold text-white mt-1">{metrics.avgResponseTime}</h3>
                      <p className="text-2xs text-blue-400 font-semibold mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Instant AI Handshake
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-blue-950/40 border border-blue-900/30 flex items-center justify-center text-blue-400">
                      <Clock className="h-5 w-5" />
                    </div>
                  </Card>

                  <Card className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-2xs font-mono text-zinc-500 uppercase tracking-wider">SLA Status</p>
                      <h3 className="text-3xl font-extrabold text-amber-400 mt-1">{metrics.slaStatus}</h3>
                      <p className="text-2xs text-zinc-400 font-semibold mt-1 flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" /> Standard response windows
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-amber-950/40 border border-amber-900/30 flex items-center justify-center text-amber-400">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                  </Card>
                </div>

                {/* AI executive summary banner */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-xl border border-indigo-500/20 bg-indigo-950/10 flex flex-col md:flex-row gap-4 items-start md:items-center"
                >
                  <div className="p-2 bg-indigo-950 border border-indigo-500/30 text-indigo-400 rounded-lg shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">AI Support Director - Operational Brief</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{metrics.aiSummary}</p>
                  </div>
                </motion.div>

                {/* Agent Workload & Performance details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Active AI Support Agents */}
                  <Card className="p-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 mb-4 font-mono">
                      <User className="h-4 w-4" /> Autonomous Support Workforce
                    </h3>
                    <div className="flex flex-col gap-3">
                      {metrics.agentWorkload.map((agent: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 bg-zinc-950 border border-zinc-900 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-extrabold text-indigo-400">
                              {agent.name[0]}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">{agent.name}</p>
                              <p className="text-2xs text-zinc-500 font-mono">Exshopi AI Employee</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-indigo-300 font-mono">{agent.activeTickets} Active Tickets</span>
                            <div className="w-24 bg-zinc-900 h-1.5 rounded-full mt-1 overflow-hidden">
                              <div 
                                className="bg-indigo-500 h-1.5 rounded-full" 
                                style={{ width: `${Math.min(100, (agent.activeTickets / 5) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* SLA Standard Tier Response matrix */}
                  <Card className="p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 mb-4 font-mono">
                        <ShieldAlert className="h-4 w-4" /> Enterprise SLA Matrix
                      </h3>
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center text-xs font-mono p-2 bg-zinc-950 rounded-lg">
                          <span className="text-rose-400 font-bold">CRITICAL PRIORITY</span>
                          <span className="text-zinc-400">SLA: 2 Hours Resolution (100% Target)</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono p-2 bg-zinc-950 rounded-lg">
                          <span className="text-amber-400 font-bold">HIGH PRIORITY</span>
                          <span className="text-zinc-400">SLA: 8 Hours Resolution (98% Target)</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono p-2 bg-zinc-950 rounded-lg">
                          <span className="text-blue-400 font-bold">MEDIUM PRIORITY</span>
                          <span className="text-zinc-400">SLA: 24 Hours Resolution (95% Target)</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono p-2 bg-zinc-950 rounded-lg">
                          <span className="text-zinc-500 font-bold">LOW PRIORITY</span>
                          <span className="text-zinc-400">SLA: 48 Hours Resolution (90% Target)</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-2xs text-zinc-500 italic mt-4 font-mono">
                      All system compliance metrics are actively piped to Security loggers for weekly SOC-2 compliance reports.
                    </p>
                  </Card>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* TAB 2: TICKETS */}
        {activeTab === "tickets" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
            
            {/* Left Column: Tickets list */}
            <div className={`lg:col-span-5 flex flex-col gap-4 ${selectedTicket ? "hidden lg:flex" : ""}`}>
              {/* Filter controls */}
              <Card className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">Filter Tickets</h3>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    icon={<Plus className="h-3 w-3" />}
                    onClick={() => setCreateTicketOpen(true)}
                  >
                    New Ticket
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                      { value: "all", label: "All Statuses" },
                      { value: "open", label: "Open" },
                      { value: "in_progress", label: "In Progress" },
                      { value: "resolved", label: "Resolved" },
                      { value: "escalated", label: "Escalated" }
                    ]}
                  />
                  <Select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    options={[
                      { value: "all", label: "All Priorities" },
                      { value: "low", label: "Low" },
                      { value: "medium", label: "Medium" },
                      { value: "high", label: "High" },
                      { value: "critical", label: "Critical" }
                    ]}
                  />
                </div>

                <Input
                  placeholder="Search Tickets, customers, descriptive text..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
              </Card>

              {/* Tickets list */}
              <div className="flex flex-col gap-3 max-h-[550px] overflow-y-auto pr-1">
                {ticketsLoading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-zinc-900 border border-zinc-800 animate-pulse rounded-xl" />
                  ))
                ) : ticketsList.length === 0 ? (
                  <div className="text-center p-12 text-zinc-500 border border-zinc-800 rounded-xl bg-zinc-900/40">
                    <LifeBuoy className="h-10 w-10 mx-auto opacity-30 mb-2" />
                    <p className="text-xs font-mono">No Tickets Found</p>
                  </div>
                ) : (
                  ticketsList.map((ticket) => {
                    const isSelected = selectedTicket?.id === ticket.id;
                    return (
                      <div
                        key={ticket.id}
                        onClick={() => handleSelectTicket(ticket)}
                        className={`p-4 border transition-all rounded-xl cursor-pointer text-left ${
                          isSelected 
                            ? "bg-indigo-950/20 border-indigo-500/80 shadow-md" 
                            : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-2xs font-mono text-zinc-500">#{ticket.id}</span>
                          <div className="flex gap-1.5 shrink-0">
                            <Badge variant={
                              ticket.priority === "critical" ? "error" : 
                              ticket.priority === "high" ? "warning" : 
                              ticket.priority === "medium" ? "info" : "neutral"
                            }>
                              {ticket.priority}
                            </Badge>
                            <Badge variant={
                              ticket.status === "open" ? "accent" : 
                              ticket.status === "in_progress" ? "warning" : 
                              ticket.status === "resolved" ? "success" : "error"
                            }>
                              {ticket.status}
                            </Badge>
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-white mt-1.5 truncate">{ticket.title}</h4>
                        <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">{ticket.description}</p>
                        
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-950 text-2xs text-zinc-500 font-mono">
                          <span className="truncate">{ticket.customerName}</span>
                          <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Ticket details / Conversation / AI Workspace */}
            <div className={`lg:col-span-7 flex flex-col gap-4 ${!selectedTicket ? "hidden lg:flex" : ""}`}>
              {selectedTicket ? (
                <div className="flex flex-col gap-4 text-left">
                  {/* Back button on Mobile */}
                  <Button 
                    className="self-start lg:hidden mb-1" 
                    variant="ghost" 
                    size="sm" 
                    icon={<ArrowLeft className="h-4 w-4" />}
                    onClick={() => setSelectedTicket(null)}
                  >
                    Back to Ticket List
                  </Button>

                  {/* Header info */}
                  <Card className="p-5 flex flex-col gap-4">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-indigo-400 font-extrabold">Ticket #{selectedTicket.id}</span>
                          <span className="text-xs text-zinc-500 font-mono">• {selectedTicket.category.toUpperCase()}</span>
                        </div>
                        <h2 className="text-lg font-bold text-white mt-1 leading-tight">{selectedTicket.title}</h2>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="h-5 w-5 rounded-full bg-zinc-800 flex items-center justify-center text-3xs font-bold text-zinc-400">
                            {selectedTicket.customerName[0]}
                          </div>
                          <p className="text-xs font-mono text-zinc-400">
                            {selectedTicket.customerName} <span className="text-zinc-600">({selectedTicket.customerEmail})</span>
                          </p>
                        </div>
                      </div>

                      {/* Rapid controls */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <div className="flex gap-2">
                          <Select
                            className="text-xs py-1"
                            value={selectedTicket.status}
                            onChange={(e) => handleUpdateTicketStatus(e.target.value)}
                            options={[
                              { value: "open", label: "Open" },
                              { value: "in_progress", label: "In Progress" },
                              { value: "resolved", label: "Resolved" },
                              { value: "escalated", label: "Escalated" }
                            ]}
                          />
                          <Select
                            className="text-xs py-1"
                            value={selectedTicket.priority}
                            onChange={(e) => handleUpdateTicketPriority(e.target.value)}
                            options={[
                              { value: "low", label: "Low" },
                              { value: "medium", label: "Medium" },
                              { value: "high", label: "High" },
                              { value: "critical", label: "Critical" }
                            ]}
                          />
                        </div>
                        <Select
                          className="text-xs py-1"
                          value={selectedTicket.assignedTo}
                          onChange={(e) => handleUpdateTicketAssignment(e.target.value)}
                          options={[
                            { value: "Ethan AI (Support Expert)", label: "Ethan AI" },
                            { value: "Lucas AI (Logistic Bot)", label: "Lucas AI" },
                            { value: "Sophia AI (Sales Pro)", label: "Sophia AI" },
                            { value: "Human Administrator", label: "Human Admin" }
                          ]}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 bg-zinc-950 p-4 border border-zinc-900 rounded-xl leading-relaxed">
                      {selectedTicket.description}
                    </p>

                    {/* Ticket Actions: Merge / Split */}
                    <div className="flex gap-2 justify-end border-t border-zinc-800/80 pt-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        icon={<GitPullRequest className="h-3.5 w-3.5" />}
                        onClick={() => setMergeOpen(true)}
                      >
                        Merge Ticket
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        icon={<Split className="h-3.5 w-3.5" />}
                        onClick={() => setSplitOpen(true)}
                      >
                        Split Task
                      </Button>
                    </div>
                  </Card>

                  {/* AI Support Copilot Panel */}
                  <Card className="p-4 border-indigo-500/20 bg-indigo-950/5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs font-mono">
                        <Sparkles className="h-4 w-4" />
                        <span>AI SUPPORT COPILOT</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          className="text-2xs py-0.5 bg-zinc-950/80"
                          value={translateLang}
                          onChange={(e) => setTranslateLang(e.target.value)}
                          options={[
                            { value: "Spanish", label: "Spanish" },
                            { value: "French", label: "French" },
                            { value: "German", label: "German" },
                            { value: "Japanese", label: "Japanese" }
                          ]}
                        />
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-2xs py-1"
                          onClick={() => handleAIAssist("translate")}
                        >
                          Translate
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <Button size="sm" variant="glass" className="text-2xs font-mono" onClick={() => handleAIAssist("summarize")}>
                        Summarize
                      </Button>
                      <Button size="sm" variant="glass" className="text-2xs font-mono" onClick={() => handleAIAssist("suggest_reply")}>
                        Draft Reply
                      </Button>
                      <Button size="sm" variant="glass" className="text-2xs font-mono" onClick={() => handleAIAssist("classify")}>
                        Sentiment & Classify
                      </Button>
                      <Button size="sm" variant="glass" className="text-2xs font-mono" onClick={() => handleAIAssist("recommend_article")}>
                        Match Article
                      </Button>
                    </div>

                    <AnimatePresence>
                      {aiAssistLoading && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 bg-zinc-950 p-4 border border-zinc-900 rounded-xl text-center"
                        >
                          <div className="inline-block h-4 w-4 animate-spin border-2 border-indigo-500 border-t-transparent rounded-full mr-2" />
                          <span className="text-xs text-zinc-400 font-mono">AI Director generating insights...</span>
                        </motion.div>
                      )}

                      {!aiAssistLoading && aiAssistResult && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 bg-zinc-950 border border-indigo-500/15 p-4 rounded-xl text-left"
                        >
                          <div className="flex justify-between items-center border-b border-zinc-900 pb-2 mb-2">
                            <span className="text-3xs font-mono text-zinc-500 uppercase tracking-wider">AI Suggestions ({aiAssistAction})</span>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-2xs"
                              onClick={() => {
                                if (aiAssistAction === "suggest_reply") {
                                  setReplyText(aiAssistResult);
                                } else {
                                  setAiAssistResult(null);
                                }
                              }}
                            >
                              {aiAssistAction === "suggest_reply" ? "Apply to Editor" : "Dismiss"}
                            </Button>
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">{aiAssistResult}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>

                  {/* Thread Timeline & Messages */}
                  <Card className="p-4 flex flex-col gap-4 max-h-[350px] overflow-y-auto">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4" /> Ticket Communication Timeline
                    </h3>

                    {ticketMessagesLoading ? (
                      <div className="space-y-3">
                        <div className="h-10 bg-zinc-950 rounded-xl animate-pulse" />
                        <div className="h-14 bg-zinc-950 rounded-xl animate-pulse" />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {ticketMessages.map((msg) => {
                          const isInternal = msg.isInternalNote;
                          return (
                            <div 
                              key={msg.id} 
                              className={`p-3.5 border rounded-xl flex flex-col gap-1 ${
                                isInternal 
                                  ? "bg-amber-950/20 border-amber-900/30 text-amber-100" 
                                  : msg.sender === "customer" 
                                    ? "bg-zinc-950 border-zinc-900 text-zinc-300" 
                                    : "bg-indigo-950/10 border-indigo-900/20 text-indigo-100"
                              }`}
                            >
                              <div className="flex justify-between items-center text-3xs font-mono text-zinc-500">
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-zinc-300">{msg.senderName}</span>
                                  {isInternal && <span className="bg-amber-900/60 text-amber-200 px-1 py-0.2 rounded font-semibold text-4xs uppercase tracking-wider">Internal Note</span>}
                                </div>
                                <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-xs leading-relaxed mt-1 whitespace-pre-wrap">{msg.message}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>

                  {/* Response Editor */}
                  <Card className="p-4 flex flex-col gap-3">
                    <Textarea
                      placeholder={replyIsInternal ? "Draft private internal audit notes..." : "Respond directly to the customer ticket..."}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />

                    <div className="flex justify-between items-center">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={replyIsInternal}
                          onChange={(e) => setReplyIsInternal(e.target.checked)}
                          className="rounded bg-zinc-950 border-zinc-800 text-indigo-600 focus:ring-0"
                        />
                        <span className="text-xs font-semibold text-zinc-400 font-mono">Mark as Private Internal Note</span>
                      </label>

                      <Button
                        variant="primary"
                        icon={<Send className="h-4 w-4" />}
                        loading={replyLoading}
                        onClick={handleSendReply}
                        disabled={!replyText.trim()}
                      >
                        Send Communication
                      </Button>
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="hidden lg:flex flex-col items-center justify-center h-[500px] border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10 text-zinc-500 text-center p-12">
                  <LifeBuoy className="h-12 w-12 opacity-35 mb-3 animate-pulse" />
                  <h3 className="text-sm font-bold text-zinc-400 font-mono">Enterprise Support Center</h3>
                  <p className="text-xs text-zinc-500 mt-1">Select an active ticket from the left panel to begin SLA triaging or activate AI support copiloting.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: KNOWLEDGE BASE */}
        {activeTab === "kb" && (
          <div className="flex flex-col gap-6">
            {/* Search and control bar */}
            <Card className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 w-full md:max-w-md">
                <Input
                  placeholder="Search articles, keywords, tags..."
                  value={kbSearch}
                  onChange={(e) => setKbSearch(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <Select
                  value={kbCategoryFilter}
                  onChange={(e) => setKbCategoryFilter(e.target.value)}
                  options={[
                    { value: "all", label: "All Categories" },
                    { value: "Technical Support", label: "Technical Support" },
                    { value: "Billing & Subscriptions", label: "Billing & Subscriptions" },
                    { value: "Developer Documentation", label: "Developer Documentation" }
                  ]}
                />
                <Button 
                  variant="primary" 
                  icon={<Plus className="h-4 w-4" />}
                  onClick={() => setKbCreateOpen(true)}
                  className="shrink-0"
                >
                  Create Article
                </Button>
              </div>
            </Card>

            {/* Articles Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {kbLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-zinc-900 border border-zinc-800 animate-pulse rounded-xl" />
                ))
              ) : kbArticlesList.length === 0 ? (
                <div className="col-span-3 text-center p-12 border border-zinc-800 bg-zinc-900/35 text-zinc-500 rounded-xl">
                  <BookOpen className="h-10 w-10 mx-auto opacity-30 mb-2" />
                  <p className="text-xs font-mono">No Knowledge Base Articles Found</p>
                </div>
              ) : (
                kbArticlesList.map((art) => (
                  <Card key={art.id} className="p-5 flex flex-col justify-between text-left h-full border border-zinc-800 hover:border-zinc-700 transition-all">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-3xs font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900 text-zinc-400">{art.category}</span>
                        <span className="text-3xs font-mono text-zinc-500">{art.views} Views</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-2 leading-tight">{art.title}</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 mb-4">{art.content}</p>
                    </div>

                    <div className="pt-3 border-t border-zinc-950 flex justify-between items-center">
                      {/* Tags */}
                      <div className="flex gap-1 overflow-hidden">
                        {art.tags.slice(0, 2).map((t, idx) => (
                          <Badge key={idx} variant="neutral" className="text-4xs py-0">
                            {t}
                          </Badge>
                        ))}
                      </div>

                      {/* Vote Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 font-mono text-3xs">
                        <button 
                          onClick={() => handleKbVote(art.id, "helpful")}
                          className="p-1 hover:bg-zinc-800 hover:text-white rounded flex items-center gap-1 text-zinc-500"
                        >
                          <ThumbsUp className="h-3 w-3 text-emerald-400" /> {art.helpfulVotes}
                        </button>
                        <button 
                          onClick={() => handleKbVote(art.id, "unhelpful")}
                          className="p-1 hover:bg-zinc-800 hover:text-white rounded flex items-center gap-1 text-zinc-500"
                        >
                          <ThumbsDown className="h-3 w-3 text-rose-400" /> {art.unhelpfulVotes}
                        </button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CHATS */}
        {activeTab === "chats" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[550px] items-stretch">
            
            {/* Left Column: Chat Sessions */}
            <Card className="lg:col-span-4 p-4 flex flex-col gap-4 overflow-y-auto">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5 border-b border-zinc-900 pb-2 mb-2">
                <MessageSquare className="h-4 w-4" /> Live Customer Channels
              </h3>

              {chatsLoading ? (
                <div className="h-20 bg-zinc-900 rounded-xl animate-pulse" />
              ) : chatSessions.length === 0 ? (
                <p className="text-xs text-zinc-500 font-mono">No active channels.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {chatSessions.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                        selectedChat?.id === chat.id 
                          ? "bg-indigo-950/25 border-indigo-500/80" 
                          : "bg-zinc-950 border-zinc-900 hover:border-zinc-800"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-white">{chat.customerName}</span>
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-3xs text-zinc-500 font-mono">active</span>
                        </div>
                      </div>
                      <p className="text-2xs text-zinc-400 truncate mt-1">
                        {chat.messages[chat.messages.length - 1]?.text}
                      </p>
                      {chat.typingIndicator && (
                        <p className="text-4xs font-mono text-indigo-400 mt-1 animate-pulse">Typing...</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Right Column: Chat Console */}
            <Card className="lg:col-span-8 flex flex-col justify-between items-stretch">
              {selectedChat ? (
                <div className="flex flex-col justify-between h-full items-stretch">
                  {/* Chat Subheader */}
                  <div className="p-4 border-b border-zinc-900 flex justify-between items-center text-left bg-zinc-950/40">
                    <div>
                      <h4 className="text-xs font-bold text-white">{selectedChat.customerName}</h4>
                      <p className="text-3xs text-zinc-500 font-mono">{selectedChat.customerEmail}</p>
                    </div>
                    <Badge variant="success">Connected</Badge>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-h-[350px]">
                    {selectedChat.messages.map((m, idx) => {
                      const isCustomer = m.sender === "customer";
                      return (
                        <div 
                          key={idx} 
                          className={`max-w-[75%] p-3.5 rounded-xl text-xs leading-relaxed text-left ${
                            isCustomer 
                              ? "bg-zinc-950 border border-zinc-900 self-start text-zinc-300 rounded-tl-none" 
                              : "bg-indigo-600 self-end text-white rounded-tr-none"
                          }`}
                        >
                          <p>{m.text}</p>
                          <span className="text-4xs font-mono opacity-55 block text-right mt-1.5">{new Date(m.timestamp).toLocaleTimeString()}</span>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick canned replies / Quick actions */}
                  <div className="px-4 py-2 border-t border-zinc-900 bg-zinc-950/20 flex gap-2 overflow-x-auto text-left">
                    <button 
                      onClick={() => setChatReplyText("Hello! Thank you for connecting with Exshopi Support. Let me query your organization database records.")}
                      className="text-3xs font-mono px-2.5 py-1.5 border border-zinc-800 bg-zinc-950 rounded-lg text-zinc-400 hover:text-white shrink-0"
                    >
                      👋 Greet customer
                    </button>
                    <button 
                      onClick={() => setChatReplyText("Let me assign this query to Sophia AI so she can coordinate your active sales pipelines.")}
                      className="text-3xs font-mono px-2.5 py-1.5 border border-zinc-800 bg-zinc-950 rounded-lg text-zinc-400 hover:text-white shrink-0"
                    >
                      🤖 Route to Sophia AI
                    </button>
                    <button 
                      onClick={() => setChatReplyText("Could you please paste the specific billing invoice reference ID so we can verify duplicate charges?")}
                      className="text-3xs font-mono px-2.5 py-1.5 border border-zinc-800 bg-zinc-950 rounded-lg text-zinc-400 hover:text-white shrink-0"
                    >
                      💳 Request Invoice ID
                    </button>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-zinc-900 bg-zinc-950/40 flex gap-2">
                    <Input
                      placeholder="Type live support reply..."
                      value={chatReplyText}
                      onChange={(e) => setChatReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                    />
                    <Button variant="primary" icon={<Send className="h-4 w-4" />} onClick={handleSendChatMessage} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-center p-12">
                  <MessageSquare className="h-10 w-10 opacity-30 mb-2" />
                  <p className="text-xs font-mono">Select a Live Chat Session</p>
                </div>
              )}
            </Card>
          </div>
        )}

      </div>

      {/* ===================================== */}
      {/* DIALOGS & OVERLAYS */}
      {/* ===================================== */}

      {/* 1. Create Ticket Modal */}
      <Dialog isOpen={createTicketOpen} onClose={() => setCreateTicketOpen(false)} title="Create Support Ticket">
        <form onSubmit={handleCreateTicket} className="flex flex-col gap-4 text-left">
          <Input 
            label="Customer Name" 
            required 
            value={newTicketCustName} 
            onChange={(e) => setNewTicketCustName(e.target.value)} 
          />
          <Input 
            label="Customer Email" 
            type="email" 
            required 
            value={newTicketCustEmail} 
            onChange={(e) => setNewTicketCustEmail(e.target.value)} 
          />
          <Input 
            label="Ticket Subject / Title" 
            required 
            value={newTicketTitle} 
            onChange={(e) => setNewTicketTitle(e.target.value)} 
          />
          <Textarea 
            label="Full Issue Description" 
            required 
            value={newTicketDesc} 
            onChange={(e) => setNewTicketDesc(e.target.value)} 
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority"
              value={newTicketPriority}
              onChange={(e) => setNewTicketPriority(e.target.value)}
              options={[
                { value: "low", label: "Low (48hr SLA)" },
                { value: "medium", label: "Medium (24hr SLA)" },
                { value: "high", label: "High (8hr SLA)" },
                { value: "critical", label: "Critical (2hr SLA)" }
              ]}
            />
            <Select
              label="Category"
              value={newTicketCategory}
              onChange={(e) => setNewTicketCategory(e.target.value)}
              options={[
                { value: "billing", label: "Billing / Licensing" },
                { value: "technical", label: "Technical Support" },
                { value: "product_inquiry", label: "Product Inquiry" }
              ]}
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-zinc-900 pt-4 mt-2">
            <Button type="button" variant="ghost" onClick={() => setCreateTicketOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create SLA Ticket</Button>
          </div>
        </form>
      </Dialog>

      {/* 2. Merge Ticket Modal */}
      <Dialog isOpen={mergeOpen} onClose={() => setMergeOpen(false)} title="Merge Support Tickets">
        <div className="flex flex-col gap-4 text-left">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Merge all communication threads and notes of a duplicate ticket into this ticket. The duplicate ticket will be marked as resolved and flagged with a merge annotation.
          </p>
          <Input
            label="Source Ticket ID (Duplicate)"
            type="number"
            required
            placeholder="e.g. 3"
            value={mergeSourceId}
            onChange={(e) => setMergeSourceId(e.target.value)}
          />
          <div className="flex justify-end gap-2 border-t border-zinc-900 pt-4">
            <Button variant="ghost" onClick={() => setMergeOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleMergeTickets}>Confirm Merge</Button>
          </div>
        </div>
      </Dialog>

      {/* 3. Split Ticket Modal */}
      <Dialog isOpen={splitOpen} onClose={() => setSplitOpen(false)} title="Split Support Ticket Task">
        <div className="flex flex-col gap-4 text-left">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Split off an unaligned technical issue or task from this ticket into a completely brand new ticket. A system trace note will link both tickets together.
          </p>
          <Input
            label="New Ticket Title"
            required
            placeholder="e.g. Ephemeral cluster storage space scaleup"
            value={splitTitle}
            onChange={(e) => setSplitTitle(e.target.value)}
          />
          <Textarea
            label="Task Description"
            required
            placeholder="Provide context for the newly split ticket..."
            value={splitDesc}
            onChange={(e) => setSplitDesc(e.target.value)}
          />
          <div className="flex justify-end gap-2 border-t border-zinc-900 pt-4">
            <Button variant="ghost" onClick={() => setSplitOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSplitTicket}>Split Off Task</Button>
          </div>
        </div>
      </Dialog>

      {/* 4. Create KB Article Modal */}
      <Dialog isOpen={kbCreateOpen} onClose={() => setKbCreateOpen(false)} title="Add Knowledge Base Article">
        <form onSubmit={handleCreateKbArticle} className="flex flex-col gap-4 text-left">
          <Input
            label="Article Title"
            required
            placeholder="How to deploy Sophia AI to external Slack channels"
            value={newKbTitle}
            onChange={(e) => setNewKbTitle(e.target.value)}
          />
          <Select
            label="Category"
            value={newKbCategory}
            onChange={(e) => setNewKbCategory(e.target.value)}
            options={[
              { value: "Technical Support", label: "Technical Support" },
              { value: "Billing & Subscriptions", label: "Billing & Subscriptions" },
              { value: "Developer Documentation", label: "Developer Documentation" }
            ]}
          />
          <Textarea
            label="Article Body Content"
            required
            value={newKbContent}
            onChange={(e) => setNewKbContent(e.target.value)}
          />
          <Input
            label="Tags (Comma Separated)"
            placeholder="api, slack, integration"
            value={newKbTags}
            onChange={(e) => setNewKbTags(e.target.value)}
          />
          <div className="flex justify-end gap-2 border-t border-zinc-900 pt-4">
            <Button type="button" variant="ghost" onClick={() => setKbCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Publish Article</Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}
