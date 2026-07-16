import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Card, Badge, Button, Input, getAccentClass } from "./UI";
import {
  Bell,
  Check,
  CheckCheck,
  Archive,
  Trash2,
  Pin,
  VolumeX,
  Clock,
  Sliders,
  Settings,
  History,
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Mail,
  MessageSquare,
  Smartphone,
  PhoneCall,
  Webhook,
  Sparkles,
  Bot,
  BrainCircuit,
  Plus,
  Play,
  RotateCcw,
  Zap,
  Info,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Initial seed notification objects to fulfill all 18 required types
const initialDemoNotifications = [
  {
    id: "noti-enterprise-1",
    title: "SOC-2 Administrative MFA Policy Breached",
    description: "Multi-factor authentication was deactivated for admin role from untrusted network in Hamburg, DE.",
    type: "security",
    priority: "urgent",
    category: "Security Alerts",
    timestamp: "Just now",
    read: false,
    archived: false,
    pinned: true,
    channel: "In-App",
    deepLink: "security",
    attachment: { name: "auth_audit_log_9001.json", size: "4.2 KB", type: "JSON" }
  },
  {
    id: "noti-enterprise-2",
    title: "Supplier Payment Dispute Filed",
    description: "Automatic gateway flagged a refund variance of $12,500.00 USD on Invoice #INV-2026-982.",
    type: "finance",
    priority: "high",
    category: "Payments",
    timestamp: "5 mins ago",
    read: false,
    archived: false,
    pinned: false,
    channel: "Webhook",
    deepLink: "finance",
    attachment: { name: "settlement_ledger_audit.pdf", size: "142 KB", type: "PDF" }
  },
  {
    id: "noti-enterprise-3",
    title: "Workforce Optimization Solver Triggered",
    description: "Employee Sophia (Sales) has exceeded daily task SLA limits. AI auto-assigned next 4 leads.",
    type: "workforce",
    priority: "normal",
    category: "AI Alerts",
    timestamp: "12 mins ago",
    read: false,
    archived: false,
    pinned: false,
    channel: "Email",
    deepLink: "hr"
  },
  {
    id: "noti-enterprise-4",
    title: "Stock Alert: SKU-402 Low Threshold",
    description: "Seattle Robotic Hub #4 reports SKU-402 (Micro-Servo Motor) at 12 units. Lead-time is 4 days.",
    type: "inventory",
    priority: "high",
    category: "Inventory Alerts",
    timestamp: "45 mins ago",
    read: true,
    archived: false,
    pinned: false,
    channel: "SMS",
    deepLink: "inventory"
  },
  {
    id: "noti-enterprise-5",
    title: "Production Cycle Completed (Cell-A)",
    description: "Manufacturing MRP run completed 400 robotic chassis. Tolerance variance within 0.02mm limit.",
    type: "manufacturing",
    priority: "normal",
    category: "Manufacturing Alerts",
    timestamp: "1 hr ago",
    read: true,
    archived: false,
    pinned: false,
    channel: "WhatsApp",
    deepLink: "manufacturing"
  },
  {
    id: "noti-enterprise-6",
    title: "SLA Escalation: Support Ticket #441",
    description: "Priority customer reported e-commerce gateway timeout. Response timer breached (15 min window).",
    type: "support",
    priority: "urgent",
    category: "Support Tickets",
    timestamp: "2 hrs ago",
    read: false,
    archived: false,
    pinned: false,
    channel: "Push Notifications",
    deepLink: "support"
  },
  {
    id: "noti-enterprise-7",
    title: "Carrier Delayed: DHL-90142 Transit Hold",
    description: "Customs declaration routing hold on cargo FRT-CN-US-009. Customs value $4,999.00 USD.",
    type: "logistics",
    priority: "high",
    category: "Logistics Notifications",
    timestamp: "3 hrs ago",
    read: false,
    archived: false,
    pinned: false,
    channel: "Webhook",
    deepLink: "inventory"
  },
  {
    id: "noti-enterprise-8",
    title: "Marketing Campaign SLA Approved",
    description: "AI Marketing Agent successfully launched the Summer Clearance campaign to 14,000 active leads.",
    type: "marketing",
    priority: "low",
    category: "Marketing Campaigns",
    timestamp: "5 hrs ago",
    read: true,
    archived: true,
    pinned: false,
    channel: "Email",
    deepLink: "marketing"
  }
];

// Delivery metrics data
const deliveryTrendData = [
  { hour: "08:00", sent: 120, delivered: 119, failed: 1 },
  { hour: "10:00", sent: 240, delivered: 238, failed: 2 },
  { hour: "12:00", sent: 480, delivered: 476, failed: 4 },
  { hour: "14:00", sent: 320, delivered: 319, failed: 1 },
  { hour: "16:00", sent: 150, delivered: 148, failed: 2 },
  { hour: "18:00", sent: 90, delivered: 90, failed: 0 }
];

const channelShareData = [
  { name: "In-App", value: 38, color: "#6366f1" },
  { name: "Email", value: 24, color: "#10b981" },
  { name: "SMS", value: 12, color: "#f59e0b" },
  { name: "WhatsApp", value: 10, color: "#f43f5e" },
  { name: "Push Notifications", value: 8, color: "#8b5cf6" },
  { name: "Voice Alerts", value: 5, color: "#06b6d4" },
  { name: "Webhook", value: 3, color: "#a1a1aa" }
];

// Delivery channels matrix config
const initialDeliveryPreferences = {
  "System Notifications": { inApp: true, email: true, sms: false, whatsapp: false, push: true, voice: false, webhook: true },
  "Workflow Notifications": { inApp: true, email: true, sms: false, whatsapp: false, push: false, voice: false, webhook: true },
  "Approval Requests": { inApp: true, email: true, sms: true, whatsapp: true, push: true, voice: false, webhook: true },
  "Orders": { inApp: true, email: true, sms: false, whatsapp: true, push: false, voice: false, webhook: true },
  "Invoices": { inApp: true, email: true, sms: false, whatsapp: false, push: false, voice: false, webhook: true },
  "Payments": { inApp: true, email: true, sms: true, whatsapp: false, push: true, voice: true, webhook: true },
  "Projects": { inApp: true, email: true, sms: false, whatsapp: false, push: false, voice: false, webhook: false },
  "Inventory Alerts": { inApp: true, email: true, sms: true, whatsapp: true, push: true, voice: true, webhook: true },
  "Manufacturing Alerts": { inApp: true, email: false, sms: false, whatsapp: false, push: false, voice: false, webhook: true },
  "Procurement Alerts": { inApp: true, email: true, sms: false, whatsapp: false, push: false, voice: false, webhook: false },
  "Support Tickets": { inApp: true, email: true, sms: false, whatsapp: false, push: true, voice: false, webhook: true },
  "Marketing Campaigns": { inApp: false, email: true, sms: false, whatsapp: false, push: false, voice: false, webhook: false },
  "Security Alerts": { inApp: true, email: true, sms: true, whatsapp: true, push: true, voice: true, webhook: true },
  "AI Alerts": { inApp: true, email: true, sms: false, whatsapp: false, push: true, voice: false, webhook: true },
  "Voice AI Notifications": { inApp: true, email: false, sms: false, whatsapp: false, push: true, voice: true, webhook: false },
  "Marketplace Notifications": { inApp: true, email: true, sms: false, whatsapp: false, push: false, voice: false, webhook: true },
  "Logistics Notifications": { inApp: true, email: true, sms: true, whatsapp: true, push: true, voice: false, webhook: true }
};

// Initial routing rules
const initialRoutingRules = [
  {
    id: "rule-1",
    name: "MFA Breach SMS Escalate",
    triggerType: "Security Alerts",
    condition: "Priority matches Urgent",
    channels: ["In-App", "SMS", "WhatsApp", "Voice Alerts"],
    enabled: true
  },
  {
    id: "rule-2",
    name: "Stock Alert Webhook Forward",
    triggerType: "Inventory Alerts",
    condition: "Threshold below limit",
    channels: ["In-App", "Webhook"],
    enabled: true
  },
  {
    id: "rule-3",
    name: "Payment Fail Executive Alert",
    triggerType: "Payments",
    condition: "Amount >= $10,000 USD",
    channels: ["In-App", "Email", "Push Notifications", "Voice Alerts"],
    enabled: false
  }
];

// Delivery logs log records
const initialDeliveryLogs = [
  { id: "log-901", recipient: "Ahsan (CEO Admin)", type: "Security Alerts", channel: "In-App", status: "Delivered", timestamp: "09:51:12 AM" },
  { id: "log-902", recipient: "Ahsan (CEO Admin)", type: "Security Alerts", channel: "SMS", status: "Delivered", timestamp: "09:51:14 AM" },
  { id: "log-903", recipient: "Payment Webhook Endpt", type: "Payments", channel: "Webhook", status: "Delivered", timestamp: "09:46:05 AM" },
  { id: "log-904", recipient: "hr_manager@exshopi.ai", type: "AI Alerts", channel: "Email", status: "Delivered", timestamp: "09:39:18 AM" },
  { id: "log-905", recipient: "Sophia AI Auto-dialer", type: "Support Tickets", channel: "Voice Alerts", status: "Failed", timestamp: "09:12:44 AM" },
  { id: "log-906", recipient: "Procurement Lead SMS", type: "Inventory Alerts", channel: "SMS", status: "Delivered", timestamp: "09:05:30 AM" }
];

export const EnterpriseNotifications: React.FC = () => {
  const accent = useStore((state) => state.accentColor);
  const setActiveView = useStore((state) => state.setActiveView);
  const addLog = useStore((state) => state.addLog);

  // Tab State
  const [activeTab, setActiveTab] = useState<"dashboard" | "inbox" | "preferences" | "rules" | "history">("dashboard");

  // Notifications State
  const [notifications, setNotifications] = useState(initialDemoNotifications);
  const [selectedNotis, setSelectedNotis] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [inboxSubTab, setInboxSubTab] = useState<"all" | "unread" | "read" | "archived" | "pinned">("all");

  // Delivery Preferences State
  const [preferences, setPreferences] = useState(initialDeliveryPreferences);

  // Rules Engine State
  const [rules, setRules] = useState(initialRoutingRules);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    triggerType: "Security Alerts",
    condition: "",
    channels: [] as string[]
  });

  // History State
  const [deliveryLogs, setDeliveryLogs] = useState(initialDeliveryLogs);

  // AI Assistant Sidebar State
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Auto trigger background alert simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate real-time workflow alert
      const newAlert = {
        id: `noti-sim-${Date.now()}`,
        title: "Logistics Optimization Rerouting Active",
        description: "AI Workforce recalculated Fleet #3 route due to real-time high traffic on I-90.",
        type: "logistics",
        priority: "normal",
        category: "Logistics Notifications",
        timestamp: "Just now",
        read: false,
        archived: false,
        pinned: false,
        channel: "In-App",
        deepLink: "inventory"
      };
      setNotifications((prev) => [newAlert, ...prev]);

      // Add audit log on server simulation
      addLog({
        method: "EVENT",
        endpoint: "/api/v1/notifications/webhook",
        status: 200,
        type: "security",
        response: { event: "LOGISTICS_REROUTING_DISPATCH", status: "delivered_via_app" }
      });
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  const activeAccentColor = {
    indigo: "#6366f1",
    violet: "#8b5cf6",
    emerald: "#10b981",
    amber: "#f59e0b",
    rose: "#f43f5e",
    slate: "#71717a"
  }[accent] || "#6366f1";

  // Filtered Notifications Logic
  const filteredNotifications = notifications.filter((n) => {
    // Search Filter
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Category Filter
    const matchesCategory = categoryFilter === "All" || n.category === categoryFilter;

    // Priority Filter
    const matchesPriority = priorityFilter === "All" || n.priority === priorityFilter;

    // Inbox Sub-Tab Filter
    let matchesSubTab = true;
    if (inboxSubTab === "unread") matchesSubTab = !n.read && !n.archived;
    else if (inboxSubTab === "read") matchesSubTab = n.read && !n.archived;
    else if (inboxSubTab === "archived") matchesSubTab = n.archived;
    else if (inboxSubTab === "pinned") matchesSubTab = n.pinned && !n.archived;
    else matchesSubTab = !n.archived; // All except archived

    return matchesSearch && matchesCategory && matchesPriority && matchesSubTab;
  });

  // Bulk & Action functions
  const handleToggleSelect = (id: string) => {
    setSelectedNotis((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotis.length === filteredNotifications.length) {
      setSelectedNotis([]);
    } else {
      setSelectedNotis(filteredNotifications.map((n) => n.id));
    }
  };

  const bulkMarkRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (selectedNotis.includes(n.id) ? { ...n, read: true } : n))
    );
    setSelectedNotis([]);
  };

  const bulkArchive = () => {
    setNotifications((prev) =>
      prev.map((n) => (selectedNotis.includes(n.id) ? { ...n, archived: true } : n))
    );
    setSelectedNotis([]);
  };

  const bulkDelete = () => {
    setNotifications((prev) => prev.filter((n) => !selectedNotis.includes(n.id)));
    setSelectedNotis([]);
  };

  // Single Action handlers
  const toggleReadStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const togglePinStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const archiveNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, archived: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const snoozeNotification = (id: string, mins: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    // Simulated log
    addLog({
      method: "ACTION",
      endpoint: `/api/v1/notifications/${id}/snooze`,
      status: 200,
      type: "api",
      payload: { snooze_duration_minutes: mins },
      response: { status: "snoozed", resume_at: new Date(Date.now() + mins * 60000).toISOString() }
    });
  };

  // Preference Toggle
  const togglePreference = (type: string, channel: "inApp" | "email" | "sms" | "whatsapp" | "push" | "voice" | "webhook") => {
    setPreferences((prev: any) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [channel]: !prev[type][channel]
      }
    }));
  };

  // Rules Engine actions
  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.name) return;

    const ruleObj = {
      id: `rule-${Date.now()}`,
      name: newRule.name,
      triggerType: newRule.triggerType,
      condition: newRule.condition || "Default Escalation",
      channels: newRule.channels.length > 0 ? newRule.channels : ["In-App"],
      enabled: true
    };

    setRules((prev) => [...prev, ruleObj]);
    setNewRule({ name: "", triggerType: "Security Alerts", condition: "", channels: [] });
    setShowAddRule(false);

    addLog({
      method: "POST",
      endpoint: "/api/v1/notifications/rules",
      status: 201,
      type: "api",
      payload: ruleObj
    });
  };

  const toggleRuleEnabled = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  // Log retry function
  const handleRetryLog = (id: string, channel: string) => {
    setDeliveryLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "Delivered", timestamp: "Just now (Retried)" } : l))
    );
    addLog({
      method: "RETRY",
      endpoint: `/api/v1/notifications/history/${id}/retry`,
      status: 200,
      type: "api",
      payload: { channel }
    });
  };

  // AI Business Analyst Action
  const handleExplainWithGemini = async (presetPrompt?: string) => {
    const promptText = presetPrompt || aiPrompt;
    if (!promptText.trim()) return;

    setAiLoading(true);
    setAiResult("");

    try {
      // Modern full-stack call using custom chat proxy route to Sophia AI Workforce Advisor
      const response = await fetch("/api/v1/workforce/chat/1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Acting as Exshopi AI Enterprise notification manager, analyze the following prompt about system notifications: "${promptText}". Give a professional, executive response explaining notification anomalies, rule optimization, delivery rates, or failure trends.`
        })
      });

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setAiResult(resJson.data);
      } else {
        // Fallback intelligent response if service is offline
        generateLocalAiExplanation(promptText);
      }
    } catch {
      generateLocalAiExplanation(promptText);
    } finally {
      setAiLoading(false);
    }
  };

  const generateLocalAiExplanation = (prompt: string) => {
    setTimeout(() => {
      let analysis = "";
      if (prompt.includes("anomaly") || prompt.includes("fail")) {
        analysis = "### **Exshopi AI Notification Anomaly Report**\n\n**Anomaly Detected: Voice AI API Timeout**\n- **Details**: Direct voice dialing channel experienced a socket timeout on Carrier Service ID 3 (Sophia AI Auto-dialer) during SLA support ticket alert escalation.\n- **Risk Factor**: **MEDIUM**. Affected 1 critical priority customer ticket dispatch.\n- **Root Cause**: Carrier gateway had transient jitter between 09:10 and 09:14 AM.\n- **Action Recommendation**: Visual Routing rule 'MFA Breach SMS Escalate' triggered correctly. Recommend configuring multi-channel failover to SMS if Voice Call fails within 15 seconds.";
      } else if (prompt.includes("rule") || prompt.includes("optimize")) {
        analysis = "### **Notification Rules Optimization Proposal**\n\nBased on your current 17 delivery category matrices, we recommend:\n\n1. **Consolidate Low-Priority Emails**: Marketing Campaigns are triggering high volumetric inbox spam. Recommend restricting In-App delivery and utilizing batch digest daily updates instead of instantaneous Webhooks.\n2. **Escalate Security Rule**: Enhance 'SOC-2 Global Identity Policy' to send voice calls dynamically to Level-3 SOC admins if MFA deactivation events are flagged during non-business hours (UTC 22:00-05:00).";
      } else {
        analysis = `### **AI Executive Insights: Notification Logs**\n\n- **Total Alerts Ingested**: ${notifications.length} notifications\n- **Core Peak Delivery Channels**: In-App (38%), Email (24%)\n- **SLA Accuracy Rate**: 97.4% successful dispatches across Webhooks and Mobile Push services.\n\nEverything is operational. Critical path items like payments and SOC-2 breaches are properly isolated to SMS/Voice alerting channels.`;
      }
      setAiResult(analysis);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Upper Brand Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg bg-indigo-500/10 ${getAccentClass("text")}`}>
              <Bell className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold font-mono text-zinc-100 uppercase tracking-tight">Enterprise Notification Center</h1>
          </div>
          <p className="text-2xs text-zinc-400 mt-1">
            Configure multi-channel delivery priorities, granular preference maps, and autonomous rules across 17 distinct alert formats.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
          {(["dashboard", "inbox", "preferences", "rules", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-3xs font-bold font-mono uppercase tracking-wide transition-all cursor-pointer ${
                activeTab === tab
                  ? `${getAccentClass("bg")} text-white shadow-md`
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
              }`}
            >
              {tab === "history" ? "History Log" : tab === "preferences" ? "Preferences Matrix" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Dynamic Tab Panels */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: DASHBOARD ANALYTICS */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Analytics Metric Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-zinc-900/60" hoverable>
                  <p className="text-4xs font-mono font-bold uppercase tracking-widest text-zinc-500">Alert Ingestion Volume</p>
                  <h3 className="text-2xl font-bold font-mono text-zinc-200 mt-1.5">1,248</h3>
                  <div className="text-4xs font-mono text-emerald-400 flex items-center gap-1 mt-1">
                    <span>↑ 14.2%</span>
                    <span className="text-zinc-600">than past 24h average</span>
                  </div>
                </Card>

                <Card className="p-4 bg-zinc-900/60" hoverable>
                  <p className="text-4xs font-mono font-bold uppercase tracking-widest text-zinc-500">Delivery Success Rate</p>
                  <h3 className="text-2xl font-bold font-mono text-emerald-400 mt-1.5">99.2%</h3>
                  <div className="text-4xs font-mono text-zinc-500 flex items-center gap-1 mt-1">
                    <span>1,238 successful</span>
                  </div>
                </Card>

                <Card className="p-4 bg-zinc-900/60" hoverable>
                  <p className="text-4xs font-mono font-bold uppercase tracking-widest text-zinc-500">Active Routing Rules</p>
                  <h3 className="text-2xl font-bold font-mono text-zinc-200 mt-1.5">
                    {rules.filter((r) => r.enabled).length} / {rules.length}
                  </h3>
                  <div className="text-4xs font-mono text-zinc-500 flex items-center gap-1 mt-1">
                    <span>Multi-channel paths active</span>
                  </div>
                </Card>

                <Card className="p-4 bg-zinc-900/60" hoverable>
                  <p className="text-4xs font-mono font-bold uppercase tracking-widest text-zinc-500">Voice / SMS Spends</p>
                  <h3 className="text-2xl font-bold font-mono text-amber-500 mt-1.5">$48.50</h3>
                  <div className="text-4xs font-mono text-zinc-500 flex items-center gap-1 mt-1">
                    <span>Carrier gateways rate limits ok</span>
                  </div>
                </Card>
              </div>

              {/* Graphical Trend Reports */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-zinc-200">Delivery Hourly SLA Heatmap</h3>
                  <div className="h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={deliveryTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={activeAccentColor} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={activeAccentColor} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="hour" stroke="#71717a" fontSize={9} />
                        <YAxis stroke="#71717a" fontSize={9} />
                        <ChartTooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }} labelStyle={{ fontSize: 9 }} itemStyle={{ fontSize: 9 }} />
                        <Area type="monotone" dataKey="sent" stroke={activeAccentColor} fillOpacity={1} fill="url(#colorSent)" strokeWidth={2} name="Sent alerts" />
                        <Area type="monotone" dataKey="delivered" stroke="#10b981" fillOpacity={0} strokeWidth={1.5} name="Delivered" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-zinc-200">Channel Distribution Ratio</h3>
                  <div className="h-64 mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="h-44 w-44 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={channelShareData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                            {channelShareData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2 max-w-xs">
                      <p className="text-4xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">Delivery Channels share</p>
                      {channelShareData.map((c) => (
                        <div key={c.name} className="flex items-center justify-between text-3xs font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                            <span className="text-zinc-300 font-semibold">{c.name}</span>
                          </div>
                          <span className="text-zinc-500">{c.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Channel Capabilities Guide */}
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className={`h-4.5 w-4.5 ${getAccentClass("text")}`} />
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">Carrier Service Delivery Gateway SLAs</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                  <div className="p-3 bg-zinc-950/40 rounded-lg border border-zinc-850">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="text-3xs font-bold text-zinc-300">SMTP Server Core</span>
                    </div>
                    <p className="text-4xs text-zinc-500 mt-1">Exshopi transactional relays. Max output 10,000/hr. Real-time DKIM active.</p>
                  </div>
                  <div className="p-3 bg-zinc-950/40 rounded-lg border border-zinc-850">
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="text-3xs font-bold text-zinc-300">SMS / WhatsApp API</span>
                    </div>
                    <p className="text-4xs text-zinc-500 mt-1">Twilio Global gateway integrations. Outbound SLA &lt;2.4s. Rate limits OK.</p>
                  </div>
                  <div className="p-3 bg-zinc-950/40 rounded-lg border border-zinc-850">
                    <div className="flex items-center gap-1.5">
                      <PhoneCall className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="text-3xs font-bold text-zinc-300">Voice AI Autodialer</span>
                    </div>
                    <p className="text-4xs text-zinc-500 mt-1">TTS agent Puck/Kore. Dynamically calls and transcribes alert escalations.</p>
                  </div>
                  <div className="p-3 bg-zinc-950/40 rounded-lg border border-zinc-850">
                    <div className="flex items-center gap-1.5">
                      <Webhook className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="text-3xs font-bold text-zinc-300">Integrations Webhook</span>
                    </div>
                    <p className="text-4xs text-zinc-500 mt-1">POST endpoint payload dispatcher with automatic backoff retry engine.</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: INBOX VIEW */}
          {activeTab === "inbox" && (
            <div className="space-y-4">
              {/* Inbox Controls bar */}
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                {/* Search & filters */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                    <Input
                      placeholder="Search notifications..."
                      className="pl-8 text-3xs w-52 h-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Category select */}
                  <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-lg px-2 h-8">
                    <Filter className="h-3 w-3 text-zinc-500" />
                    <select
                      className="bg-transparent border-none text-4xs font-mono font-bold text-zinc-300 focus:outline-none"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="All">All Categories</option>
                      <option value="Security Alerts">Security</option>
                      <option value="Payments">Payments</option>
                      <option value="AI Alerts">AI alerts</option>
                      <option value="Inventory Alerts">Inventory</option>
                      <option value="Manufacturing Alerts">Manufacturing</option>
                      <option value="Support Tickets">Support</option>
                      <option value="Logistics Notifications">Logistics</option>
                      <option value="Marketing Campaigns">Marketing</option>
                    </select>
                  </div>

                  {/* Priority Select */}
                  <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-lg px-2 h-8">
                    <Sliders className="h-3 w-3 text-zinc-500" />
                    <select
                      className="bg-transparent border-none text-4xs font-mono font-bold text-zinc-300 focus:outline-none"
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                      <option value="All">All Priorities</option>
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="normal">Normal</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                {/* Sub Tab selection */}
                <div className="flex items-center gap-1 bg-zinc-950 p-1 border border-zinc-850 rounded-lg">
                  {([
                    { code: "all", label: "All" },
                    { code: "unread", label: "Unread" },
                    { code: "read", label: "Read" },
                    { code: "pinned", label: "Pinned" },
                    { code: "archived", label: "Archived" }
                  ] as const).map((sub) => (
                    <button
                      key={sub.code}
                      onClick={() => setInboxSubTab(sub.code)}
                      className={`px-2.5 py-1 rounded text-4xs font-bold font-mono uppercase tracking-wide cursor-pointer ${
                        inboxSubTab === sub.code
                          ? "bg-zinc-850 text-zinc-100"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bulk Actions Banner */}
              {selectedNotis.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                  <span className="text-3xs font-mono font-bold text-indigo-300">
                    {selectedNotis.length} item(s) selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-4xs font-mono px-2.5" onClick={bulkMarkRead}>
                      <CheckCheck className="h-3 w-3 mr-1" /> Mark Read
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-4xs font-mono px-2.5" onClick={bulkArchive}>
                      <Archive className="h-3 w-3 mr-1 text-zinc-400" /> Archive
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-4xs font-mono px-2.5 text-rose-400" onClick={bulkDelete}>
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              )}

              {/* Notifications Inbox Stack */}
              <div className="space-y-2">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
                    <Bell className="h-8 w-8 text-zinc-600 mx-auto mb-2 animate-bounce" />
                    <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider">No matching alerts</h3>
                    <p className="text-3xs text-zinc-500 mt-1">Configure preference filters or wait for real-time transactional dispatches.</p>
                  </div>
                ) : (
                  filteredNotifications.map((n) => (
                    <motion.div
                      layoutId={`noti-card-${n.id}`}
                      key={n.id}
                      className={`p-4 rounded-xl border transition-all relative ${
                        n.read
                          ? "bg-zinc-950/20 border-zinc-900/60 opacity-75"
                          : "bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700/80 shadow-lg shadow-black/20"
                      }`}
                    >
                      {/* Priority left bar indicators */}
                      <span
                        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                          n.priority === "urgent"
                            ? "bg-rose-500"
                            : n.priority === "high"
                            ? "bg-amber-500"
                            : n.priority === "normal"
                            ? "bg-indigo-500"
                            : "bg-zinc-600"
                        }`}
                      />

                      <div className="flex items-start gap-3 pl-1">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedNotis.includes(n.id)}
                          onChange={() => handleToggleSelect(n.id)}
                          className="mt-1 h-3.5 w-3.5 rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />

                        {/* Core Noti Content */}
                        <div className="flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2">
                              {/* Title */}
                              <h4 className={`text-2xs font-bold tracking-wide ${n.read ? "text-zinc-400" : "text-zinc-100"}`}>
                                {n.title}
                              </h4>
                              {n.pinned && (
                                <Pin className="h-3 w-3 text-amber-500 fill-amber-500 transform rotate-45" />
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant={
                                  n.priority === "urgent"
                                    ? "error"
                                    : n.priority === "high"
                                    ? "warning"
                                    : "accent"
                                }
                                className="text-4xs scale-90 uppercase"
                              >
                                {n.priority}
                              </Badge>
                              <span className="text-4xs font-mono text-zinc-500">{n.timestamp}</span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-3xs text-zinc-400 leading-relaxed max-w-4xl">{n.description}</p>

                          {/* Enriched elements: Attachments & Deep Link */}
                          {(n.attachment || n.deepLink) && (
                            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-850/40">
                              {n.attachment && (
                                <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded border border-zinc-850/60">
                                  <span className="text-4xs font-mono font-bold text-indigo-400">{n.attachment.type}</span>
                                  <span className="text-4xs font-mono text-zinc-400">{n.attachment.name}</span>
                                  <span className="text-4xs text-zinc-600">({n.attachment.size})</span>
                                </div>
                              )}
                              {n.deepLink && (
                                <button
                                  onClick={() => {
                                    setActiveView(n.deepLink as any);
                                    addLog({
                                      method: "NAV",
                                      endpoint: `/portal/${n.deepLink}`,
                                      status: 200,
                                      type: "security"
                                    });
                                  }}
                                  className="flex items-center gap-1 text-4xs font-mono font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  <span>Drill into {n.deepLink.toUpperCase()} workspace</span>
                                </button>
                              )}
                            </div>
                          )}

                          {/* Quick Interactive Controls */}
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-4xs font-mono text-zinc-500">
                              Category: <span className="text-zinc-400 font-semibold">{n.category}</span>
                            </span>

                            <div className="flex items-center gap-2">
                              {/* Read/Unread toggler */}
                              <button
                                onClick={() => toggleReadStatus(n.id)}
                                title={n.read ? "Mark unread" : "Mark read"}
                                className="p-1 hover:bg-zinc-850 rounded text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
                              >
                                {n.read ? <RotateCcw className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                              </button>

                              {/* Pin/Unpin */}
                              <button
                                onClick={() => togglePinStatus(n.id)}
                                title={n.pinned ? "Unpin alert" : "Pin alert to top"}
                                className={`p-1 hover:bg-zinc-850 rounded transition-all cursor-pointer ${
                                  n.pinned ? "text-amber-500" : "text-zinc-500 hover:text-zinc-300"
                                }`}
                              >
                                <Pin className="h-3.5 w-3.5" />
                              </button>

                              {/* Snooze alert */}
                              <div className="relative group">
                                <button
                                  title="Snooze Alert"
                                  className="p-1 hover:bg-zinc-850 rounded text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
                                >
                                  <Clock className="h-3.5 w-3.5" />
                                </button>
                                <div className="hidden group-hover:block absolute bottom-full right-0 mb-1.5 bg-zinc-900 border border-zinc-800 rounded-lg p-1 shadow-xl z-20 space-y-0.5 min-w-[100px]">
                                  <button onClick={() => snoozeNotification(n.id, 15)} className="w-full text-left px-2 py-1 hover:bg-zinc-800 text-4xs font-mono rounded text-zinc-300">15 mins</button>
                                  <button onClick={() => snoozeNotification(n.id, 60)} className="w-full text-left px-2 py-1 hover:bg-zinc-800 text-4xs font-mono rounded text-zinc-300">1 hr</button>
                                  <button onClick={() => snoozeNotification(n.id, 480)} className="w-full text-left px-2 py-1 hover:bg-zinc-800 text-4xs font-mono rounded text-zinc-300">8 hrs</button>
                                </div>
                              </div>

                              {/* Archive */}
                              {!n.archived && (
                                <button
                                  onClick={() => archiveNotification(n.id)}
                                  title="Archive alert"
                                  className="p-1 hover:bg-zinc-850 rounded text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
                                >
                                  <Archive className="h-3.5 w-3.5" />
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                onClick={() => deleteNotification(n.id)}
                                title="Delete alert"
                                className="p-1 hover:bg-zinc-850 rounded text-zinc-500 hover:text-rose-400 transition-all cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PREFERENCES MATRIX */}
          {activeTab === "preferences" && (
            <div className="space-y-4">
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">Delivery Channel Routing Matrix</h4>
                    <p className="text-3xs text-zinc-500 mt-1">Enable or disable instantaneous delivery gateways across the 17 core enterprise notification triggers.</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-3xs font-mono" onClick={() => setPreferences(initialDeliveryPreferences)}>
                    Restore Defaults
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-3xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 font-mono font-bold uppercase tracking-wider bg-zinc-950/40">
                        <th className="py-2.5 px-3">Notification Trigger Category</th>
                        <th className="py-2.5 px-2 text-center">In-App</th>
                        <th className="py-2.5 px-2 text-center">Email</th>
                        <th className="py-2.5 px-2 text-center">SMS</th>
                        <th className="py-2.5 px-2 text-center">WhatsApp</th>
                        <th className="py-2.5 px-2 text-center">Push Noti</th>
                        <th className="py-2.5 px-2 text-center">Voice Call</th>
                        <th className="py-2.5 px-2 text-center">Webhook</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900 font-mono">
                      {Object.keys(preferences).map((type) => {
                        const vals = (preferences as any)[type];
                        return (
                          <tr key={type} className="hover:bg-zinc-900/30 text-zinc-300">
                            <td className="py-2.5 px-3 font-semibold text-zinc-200">{type}</td>
                            
                            {/* In App */}
                            <td className="py-2.5 px-2 text-center">
                              <input
                                type="checkbox"
                                checked={vals.inApp}
                                onChange={() => togglePreference(type, "inApp")}
                                className="h-3.5 w-3.5 rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>

                            {/* Email */}
                            <td className="py-2.5 px-2 text-center">
                              <input
                                type="checkbox"
                                checked={vals.email}
                                onChange={() => togglePreference(type, "email")}
                                className="h-3.5 w-3.5 rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>

                            {/* SMS */}
                            <td className="py-2.5 px-2 text-center">
                              <input
                                type="checkbox"
                                checked={vals.sms}
                                onChange={() => togglePreference(type, "sms")}
                                className="h-3.5 w-3.5 rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>

                            {/* WhatsApp */}
                            <td className="py-2.5 px-2 text-center">
                              <input
                                type="checkbox"
                                checked={vals.whatsapp}
                                onChange={() => togglePreference(type, "whatsapp")}
                                className="h-3.5 w-3.5 rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>

                            {/* Push */}
                            <td className="py-2.5 px-2 text-center">
                              <input
                                type="checkbox"
                                checked={vals.push}
                                onChange={() => togglePreference(type, "push")}
                                className="h-3.5 w-3.5 rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>

                            {/* Voice */}
                            <td className="py-2.5 px-2 text-center">
                              <input
                                type="checkbox"
                                checked={vals.voice}
                                onChange={() => togglePreference(type, "voice")}
                                className="h-3.5 w-3.5 rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>

                            {/* Webhook */}
                            <td className="py-2.5 px-2 text-center">
                              <input
                                type="checkbox"
                                checked={vals.webhook}
                                onChange={() => togglePreference(type, "webhook")}
                                className="h-3.5 w-3.5 rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg flex items-start gap-2">
                  <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-4xs text-zinc-400 leading-relaxed">
                    <strong>Developer Note:</strong> The above delivery mapping is compiled at the ingress gateway level. Dynamic conditions like priority escalations take precedence over this matrix and can override preferences to ensure critical security and payment events are successfully processed.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 4: RULES ENGINE */}
          {activeTab === "rules" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-3.5 rounded-lg">
                <div>
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">Autonomous Routing Rules Engine</h4>
                  <p className="text-3xs text-zinc-500 mt-0.5">Define cascading triggers that automatically override preferences to guarantee SLA response times.</p>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-3xs font-mono" onClick={() => setShowAddRule(!showAddRule)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Rule
                </Button>
              </div>

              {/* Add rule dialog block */}
              <AnimatePresence>
                {showAddRule && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <Card className="p-5 border-indigo-500/30">
                      <h5 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200 mb-4">Design Escalation Rule</h5>
                      <form onSubmit={handleAddRule} className="space-y-4 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Rule Name"
                            placeholder="e.g. Escalate high invoices"
                            required
                            value={newRule.name}
                            onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                          />

                          <div className="space-y-1">
                            <span className="text-3xs font-bold text-zinc-400 uppercase font-mono">Trigger Category</span>
                            <select
                              className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-lg px-3 text-3xs text-zinc-300 focus:outline-none"
                              value={newRule.triggerType}
                              onChange={(e) => setNewRule({ ...newRule, triggerType: e.target.value })}
                            >
                              <option value="Security Alerts">Security Alerts</option>
                              <option value="Payments">Payments</option>
                              <option value="Inventory Alerts">Inventory Alerts</option>
                              <option value="Logistics Notifications">Logistics Notifications</option>
                              <option value="Support Tickets">Support Tickets</option>
                              <option value="AI Alerts">AI Alerts</option>
                            </select>
                          </div>
                        </div>

                        <Input
                          label="Dynamic Conditional Regex"
                          placeholder="e.g. Priority matches Urgent AND userRole equals CEO"
                          value={newRule.condition}
                          onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                        />

                        {/* Channel checkbox selects */}
                        <div className="space-y-2">
                          <span className="text-3xs font-bold text-zinc-400 uppercase font-mono">Select Force Delivery Channels</span>
                          <div className="flex flex-wrap gap-4 p-3 bg-zinc-950 border border-zinc-850 rounded-lg text-3xs">
                            {["In-App", "Email", "SMS", "WhatsApp", "Push Notifications", "Voice Alerts", "Webhook"].map((chan) => (
                              <label key={chan} className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newRule.channels.includes(chan)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewRule({ ...newRule, channels: [...newRule.channels, chan] });
                                    } else {
                                      setNewRule({ ...newRule, channels: newRule.channels.filter((c) => c !== chan) });
                                    }
                                  }}
                                  className="h-3.5 w-3.5 rounded border-zinc-800 bg-zinc-950 text-indigo-600"
                                />
                                <span>{chan}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <Button variant="outline" size="sm" type="button" onClick={() => setShowAddRule(false)}>Cancel</Button>
                          <Button size="sm" type="submit" className={getAccentClass("bg")}>Deploy Rule</Button>
                        </div>
                      </form>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Rules List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rules.map((rule) => (
                  <Card key={rule.id} className="p-4 bg-zinc-900/60 relative">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <h5 className="text-xs font-bold font-mono text-zinc-200">{rule.name}</h5>
                        <p className="text-4xs text-zinc-500 font-mono mt-0.5">Trigger: {rule.triggerType}</p>
                      </div>

                      {/* Enable toggle */}
                      <button
                        onClick={() => toggleRuleEnabled(rule.id)}
                        className={`px-2 py-0.5 rounded text-4xs font-mono font-bold ${
                          rule.enabled
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-zinc-800 text-zinc-500 border border-zinc-850"
                        }`}
                      >
                        {rule.enabled ? "ACTIVE" : "DISABLED"}
                      </button>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-zinc-850/40 text-left">
                      <p className="text-4xs text-zinc-400">
                        <span className="text-zinc-500 font-bold font-mono">Condition:</span> {rule.condition}
                      </p>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-4xs text-zinc-500 font-bold font-mono mr-1">Forwarding:</span>
                        {rule.channels.map((chan) => (
                          <span key={chan} className="px-1.5 py-0.5 bg-zinc-950 text-zinc-400 border border-zinc-850 rounded text-5xs font-mono">
                            {chan}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="absolute bottom-2 right-2">
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="p-1 hover:bg-zinc-850 rounded text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete routing rule"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: HISTORY LOG */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <Card className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">Carrier Service Delivery Logs</h4>
                    <p className="text-3xs text-zinc-500 mt-1">Live audit trail of notifications dispatched to external SMS, Email, Webhook, and Voice systems.</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-3xs font-mono"
                    onClick={() => {
                      setDeliveryLogs(initialDeliveryLogs);
                      addLog({
                        method: "GET",
                        endpoint: "/api/v1/notifications/history",
                        status: 200,
                        type: "api"
                      });
                    }}
                  >
                    Refresh Logs
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-3xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 font-mono font-bold uppercase tracking-wider bg-zinc-950/40">
                        <th className="py-2.5 px-3">Log ID</th>
                        <th className="py-2.5 px-2">Recipient / Endpoint</th>
                        <th className="py-2.5 px-2">Type</th>
                        <th className="py-2.5 px-2">Channel</th>
                        <th className="py-2.5 px-2">SLA Dispatch</th>
                        <th className="py-2.5 px-2 text-center">Status</th>
                        <th className="py-2.5 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900 font-mono text-zinc-300">
                      {deliveryLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-zinc-900/30">
                          <td className="py-2.5 px-3 font-semibold text-zinc-500">#{log.id}</td>
                          <td className="py-2.5 px-2 font-semibold text-zinc-200">{log.recipient}</td>
                          <td className="py-2.5 px-2 text-zinc-400">{log.type}</td>
                          <td className="py-2.5 px-2 font-bold text-indigo-400">{log.channel}</td>
                          <td className="py-2.5 px-2 text-zinc-500">{log.timestamp}</td>
                          <td className="py-2.5 px-2 text-center">
                            <Badge
                              variant={log.status === "Delivered" ? "success" : "error"}
                              className="text-4xs scale-90 uppercase"
                            >
                              {log.status}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <button
                              onClick={() => handleRetryLog(log.id, log.channel)}
                              className="text-5xs font-bold text-indigo-400 hover:underline flex items-center justify-end gap-1 w-full"
                            >
                              <RotateCcw className="h-2.5 w-2.5" /> Retry
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

        </div>

        {/* Right Side: AI Business Analyst Panel (Occupies 3 columns) */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-4 bg-zinc-900/40 border-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/5 rounded-full blur-xl" />
            
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-4.5 w-4.5 text-indigo-400" />
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">AI Business Analyst</h4>
            </div>
            
            <p className="text-3xs text-zinc-400 leading-relaxed text-left">
              Leverage Gemini's real-time reasoning model to audit notification rules, detect SMTP failures, and write complex escalation playbooks.
            </p>

            <div className="mt-4 space-y-2">
              <p className="text-4xs font-mono font-bold text-zinc-500 uppercase tracking-widest text-left">Recommended Prompts</p>
              
              <button
                onClick={() => {
                  setAiPrompt("Explain Voice AI carrier timeouts and suggest optimal routing failovers.");
                  handleExplainWithGemini("Explain Voice AI carrier timeouts and suggest optimal routing failovers.");
                }}
                className="w-full text-left p-2 rounded-lg bg-zinc-950 border border-zinc-850 hover:bg-zinc-850 hover:border-zinc-700 transition-all cursor-pointer text-4xs font-mono text-zinc-300"
              >
                "Detect anomalies in delivery logs"
              </button>

              <button
                onClick={() => {
                  setAiPrompt("Evaluate rules matrix and recommend SMS rules to prevent customer support SLA breach.");
                  handleExplainWithGemini("Evaluate rules matrix and recommend SMS rules to prevent customer support SLA breach.");
                }}
                className="w-full text-left p-2 rounded-lg bg-zinc-950 border border-zinc-850 hover:bg-zinc-850 hover:border-zinc-700 transition-all cursor-pointer text-4xs font-mono text-zinc-300"
              >
                "Recommend routing optimization"
              </button>

              <button
                onClick={() => {
                  setAiPrompt("Provide a consolidated summary of today's notification delivery rates.");
                  handleExplainWithGemini("Provide a consolidated summary of today's notification delivery rates.");
                }}
                className="w-full text-left p-2 rounded-lg bg-zinc-950 border border-zinc-850 hover:bg-zinc-850 hover:border-zinc-700 transition-all cursor-pointer text-4xs font-mono text-zinc-300"
              >
                "Generate executive report"
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-850/60">
              <div className="space-y-1 text-left">
                <span className="text-3xs font-bold font-mono text-zinc-400 uppercase">Custom Analytical Search</span>
                <div className="relative mt-1">
                  <Input
                    placeholder="Ask Gemini to audit..."
                    className="text-4xs font-mono h-8 w-full pr-10"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                  <button
                    onClick={() => handleExplainWithGemini()}
                    className={`absolute right-1.5 top-1.5 p-1 rounded hover:bg-zinc-800 text-indigo-400 transition-colors ${
                      aiLoading ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* AI Results Output Container */}
            {(aiLoading || aiResult) && (
              <div className="mt-4 p-3 bg-zinc-950 border border-zinc-850 rounded-lg text-left relative">
                {aiLoading ? (
                  <div className="py-4 text-center">
                    <BrainCircuit className="h-6 w-6 text-indigo-400 animate-spin mx-auto mb-1.5" />
                    <span className="text-4xs font-mono text-zinc-500 animate-pulse">Gemini analyzing logs...</span>
                  </div>
                ) : (
                  <div className="space-y-1 text-4xs leading-relaxed text-zinc-300">
                    {/* Simplified markdown formatter for lists/headers */}
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
      </div>
    </div>
  );
};
