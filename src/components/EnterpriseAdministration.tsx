import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Card, Button, Input, Select, Badge, Textarea, Dialog, getAccentClass, getRadiusClass } from "./UI";
import {
  Sliders,
  Activity,
  Building2,
  Users,
  Shield,
  Cpu,
  Mail,
  Mic,
  Database,
  Key,
  RefreshCw,
  Play,
  Check,
  X,
  Search,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Lock,
  Settings,
  Globe,
  Layers,
  AlertCircle,
  Plus,
  Download,
  Upload,
  SlidersHorizontal,
  History,
  CheckSquare,
  ShieldAlert,
  ChevronRight,
  Menu,
  Terminal,
  Volume2,
  Zap,
  BookOpen
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
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

// ==========================================
// COMPONENT IMPLEMENTATION
// ==========================================

export default function EnterpriseAdministration() {
  const accentColor = useStore((state) => state.accentColor);
  const theme = useStore((state) => state.theme);
  const addNotification = useStore((state) => state.addNotification);
  const addLog = useStore((state) => state.addLog);

  // Core administrative sub-tab state
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "organization"
    | "users"
    | "modules"
    | "integrations"
    | "ai"
    | "email"
    | "voice"
    | "storage"
    | "billing"
    | "audit"
    | "ai-consult"
  >("overview");

  // Local data states fetched from real admin router
  const [healthData, setHealthData] = useState<any>(null);
  const [modulesList, setModulesList] = useState<any[]>([]);
  const [integrationsList, setIntegrationsList] = useState<any[]>([]);
  const [aiSettings, setAiSettings] = useState<any>(null);
  const [smtpSettings, setSmtpSettings] = useState<any>(null);
  const [localizationSettings, setLocalizationSettings] = useState<any>(null);
  const [backupsList, setBackupsList] = useState<any[]>([]);
  const [licenseData, setLicenseData] = useState<any>(null);
  const [auditHistory, setAuditHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Matrix and Forms edit states
  const [usersList, setUsersList] = useState<any[]>([]);
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [consultingLoading, setConsultingLoading] = useState(false);

  // Editing structures
  const [showSMTPModal, setShowSMTPModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ full_name: "", email: "", position: "", salary: "3500" });
  const [backupRunning, setBackupRunning] = useState(false);

  // Selected system parameters
  const [smtpForm, setSmtpForm] = useState<any>({ host: "", port: 587, username: "", sender: "" });

  // 1. Fetch data on mount
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [
        rHealth,
        rModules,
        rIntegrations,
        rAi,
        rSmtp,
        rLocal,
        rBackups,
        rLicense,
        rAudit,
        rUsers,
        rRoles
      ] = await Promise.all([
        fetch("/api/v1/admin/health").then((r) => r.json()),
        fetch("/api/v1/admin/modules").then((r) => r.json()),
        fetch("/api/v1/admin/integrations").then((r) => r.json()),
        fetch("/api/v1/admin/ai-settings").then((r) => r.json()),
        fetch("/api/v1/admin/smtp").then((r) => r.json()),
        fetch("/api/v1/admin/localization").then((r) => r.json()),
        fetch("/api/v1/admin/backups").then((r) => r.json()),
        fetch("/api/v1/admin/license").then((r) => r.json()),
        fetch("/api/v1/admin/audit").then((r) => r.json()),
        fetch("/api/v1/employees").then((r) => r.json()), // Users are represented as employees
        fetch("/api/v1/roles").then((r) => r.json())
      ]);

      if (rHealth.success) setHealthData(rHealth.data);
      if (rModules.success) setModulesList(rModules.data);
      if (rIntegrations.success) setIntegrationsList(rIntegrations.data);
      if (rAi.success) setAiSettings(rAi.data);
      if (rSmtp.success) {
        setSmtpSettings(rSmtp.data);
        setSmtpForm(rSmtp.data);
      }
      if (rLocal.success) setLocalizationSettings(rLocal.data);
      if (rBackups.success) setBackupsList(rBackups.data);
      if (rLicense.success) setLicenseData(rLicense.data);
      if (rAudit.success) setAuditHistory(rAudit.data);
      setUsersList(rUsers || []);
      setRolesList(rRoles || []);
    } catch (err) {
      console.error("Error loading administrative matrices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // 2. Action to toggle modules
  const handleToggleModule = async (moduleId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/v1/admin/modules/${moduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !currentStatus })
      });
      const result = await res.json();
      if (result.success) {
        setModulesList((prev) =>
          prev.map((m) => (m.id === moduleId ? { ...m, enabled: !currentStatus } : m))
        );
        addNotification({
          title: "Module Configuration Altered",
          description: `${result.data.name} is now ${result.data.enabled ? "Enabled" : "Disabled"}.`,
          type: "success"
        });
        addLog({
          method: "PUT",
          endpoint: `/api/v1/admin/modules/${moduleId}`,
          status: 200,
          type: "api"
        });
        // Reload audit trail
        const rAudit = await fetch("/api/v1/admin/audit").then((r) => r.json());
        if (rAudit.success) setAuditHistory(rAudit.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Action to toggle integrations
  const handleToggleIntegration = async (integrationId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "connected" ? "disconnected" : "connected";
    try {
      const res = await fetch(`/api/v1/admin/integrations/${integrationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      const result = await res.json();
      if (result.success) {
        setIntegrationsList((prev) =>
          prev.map((i) => (i.id === integrationId ? { ...i, status: nextStatus, syncDate: new Date().toISOString() } : i))
        );
        addNotification({
          title: "Integration Link Updated",
          description: `${result.data.name} state changed to ${nextStatus.toUpperCase()}.`,
          type: "success"
        });
        // Reload audit trail
        const rAudit = await fetch("/api/v1/admin/audit").then((r) => r.json());
        if (rAudit.success) setAuditHistory(rAudit.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Save SMTP Details
  const handleSaveSMTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/admin/smtp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smtpForm)
      });
      const result = await res.json();
      if (result.success) {
        setSmtpSettings(result.data);
        setShowSMTPModal(false);
        addNotification({
          title: "SMTP Service Parameters Active",
          description: `Outbound gateway routed through ${result.data.host}`,
          type: "success"
        });
        // Reload audit
        const rAudit = await fetch("/api/v1/admin/audit").then((r) => r.json());
        if (rAudit.success) setAuditHistory(rAudit.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Trigger Snapshot Backup
  const handleTriggerBackup = async () => {
    setBackupRunning(true);
    try {
      const res = await fetch("/api/v1/admin/backups", { method: "POST" });
      const result = await res.json();
      if (result.success) {
        setBackupsList((prev) => [result.data, ...prev]);
        addNotification({
          title: "Hot System Cluster Snapshot Created",
          description: `Snapshot ${result.data.id} finalized successfully (${result.data.size})`,
          type: "success"
        });
        // Reload audit
        const rAudit = await fetch("/api/v1/admin/audit").then((r) => r.json());
        if (rAudit.success) setAuditHistory(rAudit.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBackupRunning(false);
    }
  };

  // 6. Invite / Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: userForm.full_name,
          email: userForm.email,
          position: userForm.position,
          salary: parseFloat(userForm.salary)
        })
      });
      if (res.ok) {
        const newUser = await res.json();
        setUsersList((prev) => [...prev, newUser]);
        setShowUserModal(false);
        setUserForm({ full_name: "", email: "", position: "", salary: "3500" });
        addNotification({
          title: "User Profile Active",
          description: `Successfully provisioned credentials and role maps for ${newUser.full_name}.`,
          type: "success"
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Deactivate user toggle
  const handleToggleUserStatus = (userId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
    );
    addNotification({
      title: "User Operational Matrix Switched",
      description: `User status altered to ${nextStatus.toUpperCase()}`,
      type: "info"
    });
  };

  // 8. Ask AI Administrative Assistant
  const handleAskAIConsultant = async (preloadedQuery?: string) => {
    const targetQuery = preloadedQuery || aiQuery;
    if (!targetQuery.trim()) return;

    if (!preloadedQuery) setAiQuery("");
    setConsultingLoading(true);
    setAiAnswer("");

    try {
      const res = await fetch("/api/v1/admin/ai-consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: targetQuery })
      });
      const data = await res.json();
      if (data.success) {
        setAiAnswer(data.answer);
      }
    } catch (err) {
      console.error("AI consult failed:", err);
      setAiAnswer("### ❌ Error occurred\nUnable to reach server-side Gemini core. Ensure process env is stable.");
    } finally {
      setConsultingLoading(false);
    }
  };

  // Export tables as mock JSON download
  const handleBulkExport = (type: string) => {
    const targetData = type === "users" ? usersList : auditHistory;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(targetData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `exshopi_${type}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addNotification({
      title: "Secure Encrypted Export Compiled",
      description: `Telemetry records for ${type} compiled and exported to file explorer`,
      type: "success"
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-zinc-400 font-mono tracking-widest">DECRYPTING SYSTEM CLUSTER METADATA...</span>
      </div>
    );
  }

  // Filtered Users
  const filteredUsers = usersList.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* 1. Header Hero Banner */}
      <div className="p-6 rounded-2xl border border-zinc-850 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className={`h-5 w-5 ${getAccentClass("text")}`} />
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Enterprise Administration & Settings Center</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Manage global clusters, workspace companies, role allocation tables, connected integrations, model templates, and security audits.
          </p>
        </div>

        {/* Global Action Cluster */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => handleAskAIConsultant("Summarize platform health.")} className="gap-1.5 text-xs text-indigo-400 border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10">
            <Sparkles className="h-3 w-3" /> System Summary
          </Button>
          <Button variant="outline" size="sm" onClick={fetchAdminData} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Synchronize Matrix
          </Button>
        </div>
      </div>

      {/* 2. Main layout grid with settings navigation on left, and content container on right */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        
        {/* Navigation Sidebar Drawer */}
        <div className="xl:col-span-1 space-y-1">
          <span className="text-[10px] font-mono font-bold text-zinc-600 px-3 uppercase tracking-widest block mb-2">Systems Hub</span>
          
          {[
            { id: "overview", label: "Control Center", icon: Activity },
            { id: "organization", label: "Companies & Nodes", icon: Building2 },
            { id: "users", label: "Users & Roles", icon: Users },
            { id: "modules", label: "Module Status", icon: Layers },
            { id: "integrations", label: "Integrations Hub", icon: Key },
            { id: "ai", label: "AI Models", icon: Cpu },
            { id: "email", label: "SMTP Email", icon: Mail },
            { id: "voice", label: "Voice Controls", icon: Mic },
            { id: "storage", label: "Storage & Snapshots", icon: Database },
            { id: "billing", label: "Billing & Plans", icon: Zap },
            { id: "audit", label: "Audit Timeline", icon: History },
            { id: "ai-consult", label: "Principal AI Admin", icon: Sparkles }
          ].map((item) => {
            const IconComp = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  if (item.id === "ai-consult" && !aiAnswer) {
                    handleAskAIConsultant("Provide a general administrative overview and recommendation summary.");
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-xl font-medium cursor-pointer transition-all ${
                  isSelected
                    ? `${getAccentClass("bg")} text-white font-semibold shadow-lg shadow-indigo-600/5`
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                }`}
              >
                <IconComp className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Core Settings content */}
        <div className="xl:col-span-4 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* ========================================== */}
              {/* OVERVIEW SUB-TAB                           */}
              {/* ========================================== */}
              {activeTab === "overview" && healthData && (
                <div className="space-y-6">
                  
                  {/* Real-time Status Card row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4 flex flex-col justify-between">
                      <span className="text-3xs text-zinc-500 font-mono font-bold uppercase tracking-wider">PLATFORM STATUS</span>
                      <div className="flex items-baseline justify-between mt-2">
                        <span className="text-sm lg:text-base font-bold text-emerald-400">{healthData.status}</span>
                        <Badge variant="success" className="text-4xs">LIVE</Badge>
                      </div>
                    </Card>

                    <Card className="p-4 flex flex-col justify-between">
                      <span className="text-3xs text-zinc-500 font-mono font-bold uppercase tracking-wider">CLUSTER UPTIME</span>
                      <div className="flex items-baseline justify-between mt-2">
                        <span className="text-lg lg:text-xl font-bold font-mono text-zinc-100">{healthData.uptime}</span>
                        <span className="text-4xs text-zinc-500 font-mono">30D avg</span>
                      </div>
                    </Card>

                    <Card className="p-4 flex flex-col justify-between">
                      <span className="text-3xs text-zinc-500 font-mono font-bold uppercase tracking-wider">ACTIVE AGENTS</span>
                      <div className="flex items-baseline justify-between mt-2">
                        <span className="text-lg lg:text-xl font-bold font-mono text-indigo-400">{healthData.active_ai_engines}</span>
                        <span className="text-4xs text-emerald-500 font-mono">100% OK</span>
                      </div>
                    </Card>

                    <Card className="p-4 flex flex-col justify-between">
                      <span className="text-3xs text-zinc-500 font-mono font-bold uppercase tracking-wider">STORAGE UTILIZATION</span>
                      <div className="flex items-baseline justify-between mt-2">
                        <span className="text-lg lg:text-xl font-bold font-mono text-amber-500">{healthData.storage_usage_pct}%</span>
                        <span className="text-4xs text-zinc-500 font-mono">42.8 GB / 100G</span>
                      </div>
                    </Card>
                  </div>

                  {/* Operational Telemetry Chart and Metrics */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold text-zinc-200">System API & Model Invocations</h3>
                          <p className="text-4xs text-zinc-500 font-mono mt-0.5">Real-time model traffic throughput over past hours</p>
                        </div>
                        <Badge variant="accent" className="font-mono text-3xs">TRAFFIC OK</Badge>
                      </div>

                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={[
                              { hour: "08:00", apis: 1420, models: 800 },
                              { hour: "10:00", apis: 2850, models: 1450 },
                              { hour: "12:00", apis: 3900, models: 2200 },
                              { hour: "14:00", apis: 3100, models: 1980 },
                              { hour: "16:00", apis: 4200, models: 2580 },
                              { hour: "18:00", apis: 3500, models: 2100 }
                            ]}
                          >
                            <XAxis dataKey="hour" stroke="#3f3f46" fontSize={9} />
                            <YAxis stroke="#3f3f46" fontSize={9} />
                            <RechartsTooltip contentStyle={{ background: "#18181b", borderColor: "#27272a", fontSize: 11 }} />
                            <Area type="monotone" dataKey="apis" stroke="#6366f1" fillOpacity={0.1} fill="rgba(99, 102, 241, 0.1)" name="API Requests" />
                            <Area type="monotone" dataKey="models" stroke="#10b981" fillOpacity={0.1} fill="rgba(16, 185, 129, 0.1)" name="AI Calls" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    {/* Quick Admin Health Card */}
                    <Card className="p-5 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-200">License & Compliance</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-400">Plan Tier</span>
                            <span className="text-xs font-semibold text-zinc-200 font-mono">{healthData.metrics.licenses.active_tier}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-400">User Licenses Issued</span>
                            <span className="text-xs font-semibold text-zinc-200 font-mono">142 / 500</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-400">Total API Traffic</span>
                            <span className="text-xs font-semibold text-zinc-200 font-mono">428.0k</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-400">Model Tokens Sum</span>
                            <span className="text-xs font-semibold text-indigo-400 font-mono">849M tokens</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-zinc-850 mt-4 flex items-center justify-between text-4xs font-mono text-zinc-500">
                        <span>CLUSTER IP: 10.128.4.11</span>
                        <span>SOC AUDITED: YES</span>
                      </div>
                    </Card>
                  </div>

                  {/* Recommendations */}
                  <Card className="p-5 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                      <Sparkles className="h-4 w-4" />
                      <span>AI Administrator Insights & Action Required</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      All core enterprise payroll, inventory ledgers, and logistics channels are operational. However, our heuristics detect that your **Salesforce CRM Link** is currently disconnected. This is blocking autonomous sync matrices for inbound customer deals.
                    </p>
                    <div className="flex gap-2 mt-1">
                      <Button variant="glass" size="sm" onClick={() => setActiveTab("integrations")} className="text-3xs px-2.5 py-1 text-zinc-200">
                        Resolve Integration
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleAskAIConsultant("Recommend security settings.")} className="text-3xs px-2.5 py-1 text-zinc-500">
                        Audit Security Policy
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* ========================================== */}
              {/* COMPANIES & NODES SUB-TAB                  */}
              {/* ========================================== */}
              {activeTab === "organization" && (
                <div className="space-y-6">
                  <Card className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-200">Company Tenants & Branches</h3>
                        <p className="text-3xs text-zinc-500 font-mono mt-0.5">Active enterprise companies hosted in this cloud workspace</p>
                      </div>
                      <Badge variant="success" className="font-mono text-3xs">2 ACTIVE COMPANIES</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/20 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg overflow-hidden border border-zinc-850 bg-zinc-950 flex items-center justify-center font-bold text-indigo-400 font-mono">
                            E1
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-200">Exshopi AI Labs</h4>
                            <p className="text-4xs text-zinc-500 mt-0.5 font-mono">San Francisco, USA | B2B SaaS</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-3xs font-mono pt-2 border-t border-zinc-900">
                          <div>
                            <span className="text-zinc-500 block">TIME ZONE</span>
                            <span className="text-zinc-300">America/Los_Angeles</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">CURRENCY</span>
                            <span className="text-zinc-300">USD ($)</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/20 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg overflow-hidden border border-zinc-850 bg-zinc-950 flex items-center justify-center font-bold text-emerald-400 font-mono">
                            E2
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-200">Exshopi Retail Tech</h4>
                            <p className="text-4xs text-zinc-500 mt-0.5 font-mono">New York, USA | Logistics</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-3xs font-mono pt-2 border-t border-zinc-900">
                          <div>
                            <span className="text-zinc-500 block">TIME ZONE</span>
                            <span className="text-zinc-300">America/New_York</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">CURRENCY</span>
                            <span className="text-zinc-300">USD ($)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Localization settings form */}
                  <Card className="p-5 space-y-4">
                    <h3 className="text-xs font-bold text-zinc-200">Workspace Regional Settings</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Select
                        label="Global Currency"
                        value={localizationSettings?.currency || "USD"}
                        onChange={(e) => setLocalizationSettings({ ...localizationSettings, currency: e.target.value })}
                        options={[
                          { value: "USD", label: "USD ($) United States" },
                          { value: "EUR", label: "EUR (€) Eurozone" },
                          { value: "GBP", label: "GBP (£) United Kingdom" }
                        ]}
                      />
                      <Select
                        label="Default Timezone"
                        value={localizationSettings?.timezone || "America/Los_Angeles"}
                        onChange={(e) => setLocalizationSettings({ ...localizationSettings, timezone: e.target.value })}
                        options={[
                          { value: "America/Los_Angeles", label: "America/Los_Angeles (PST)" },
                          { value: "America/New_York", label: "America/New_York (EST)" },
                          { value: "Europe/London", label: "Europe/London (GMT)" }
                        ]}
                      />
                      <Select
                        label="Language Profile"
                        value={localizationSettings?.language || "en-US"}
                        onChange={(e) => setLocalizationSettings({ ...localizationSettings, language: e.target.value })}
                        options={[
                          { value: "en-US", label: "English (United States)" },
                          { value: "en-GB", label: "English (United Kingdom)" },
                          { value: "de-DE", label: "Deutsch (Germany)" }
                        ]}
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button variant="primary" size="sm" onClick={() => addNotification({ title: "Regional Settings Saved", description: "Default localization matrices are updated", type: "success" })}>
                        Save Global Locales
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* ========================================== */}
              {/* USERS & ROLES SUB-TAB                      */}
              {/* ========================================== */}
              {activeTab === "users" && (
                <div className="space-y-6">
                  <Card className="p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-200">Credentialed Users & AI Agent Identities</h3>
                        <p className="text-3xs text-zinc-500 font-mono mt-0.5">Invite enterprise operators or register autonomous agents</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Input placeholder="Search user index..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon={<Search className="h-3.5 w-3.5" />} className="w-48 sm:w-64" />
                        <Button variant="primary" size="sm" onClick={() => setShowUserModal(true)} className="gap-1.5">
                          <Plus className="h-3.5 w-3.5" /> Invite
                        </Button>
                      </div>
                    </div>

                    {/* Virtualized/Detailed Table of users */}
                    <div className="border border-zinc-850 rounded-xl overflow-hidden bg-zinc-950/20">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-850 bg-zinc-900/40 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                            <th className="p-3 pl-4">Full Identity</th>
                            <th className="p-3">Assigned Role & Pos</th>
                            <th className="p-3">Payroll Allocation</th>
                            <th className="p-3">Compliance Status</th>
                            <th className="p-3 text-right pr-4">Matrix Override</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900 text-xs text-zinc-300">
                          {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-zinc-900/30">
                              <td className="p-3 pl-4">
                                <div className="font-semibold text-zinc-200">{user.full_name}</div>
                                <div className="text-4xs text-zinc-500 font-mono mt-0.5">{user.email}</div>
                              </td>
                              <td className="p-3">
                                <div className="font-mono text-[11px] text-indigo-400">{user.position}</div>
                              </td>
                              <td className="p-3 font-mono text-zinc-400">
                                ${user.salary?.toLocaleString()}/mo
                              </td>
                              <td className="p-3">
                                <Badge variant={user.status === "active" ? "success" : "neutral"} className="text-4xs">
                                  {user.status?.toUpperCase() || "ACTIVE"}
                                </Badge>
                              </td>
                              <td className="p-3 text-right pr-4">
                                <Button variant="ghost" size="sm" onClick={() => handleToggleUserStatus(user.id, user.status || "active")} className="text-4xs h-7 px-2 hover:bg-zinc-900 text-zinc-400">
                                  {user.status === "inactive" ? "Activate" : "Deactivate"}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-4xs font-mono text-zinc-500">SHOWING {filteredUsers.length} MEMBERS</span>
                      <Button variant="secondary" size="sm" onClick={() => handleBulkExport("users")} className="gap-1.5 text-3xs">
                        <Download className="h-3.5 w-3.5" /> Export Data Indices
                      </Button>
                    </div>
                  </Card>

                  {/* Interactive Permissions matrix */}
                  <Card className="p-5 space-y-4">
                    <h3 className="text-xs font-bold text-zinc-200">Interactive Security Roles Permission Matrix</h3>
                    <div className="border border-zinc-850 rounded-xl overflow-hidden bg-zinc-950/20">
                      <table className="w-full text-left border-collapse font-mono text-3xs">
                        <thead>
                          <tr className="border-b border-zinc-850 bg-zinc-900/40 text-zinc-500 uppercase">
                            <th className="p-3 pl-4">System Scope Permission</th>
                            <th className="p-3 text-center">Enterprise Admin</th>
                            <th className="p-3 text-center">Dept Manager</th>
                            <th className="p-3 text-center">AI Employee</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900 text-zinc-300">
                          {[
                            { permission: "companies:create", desc: "Provision new company/tenant accounts", roles: [true, false, false] },
                            { permission: "billing:modify", desc: "Alter SLA subscriptions and payment routes", roles: [true, false, false] },
                            { permission: "leads:view", desc: "View inbound sales conversion pipelines", roles: [true, true, true] },
                            { permission: "employees:modify", desc: "Hire or suspend physical/AI employees", roles: [true, true, false] },
                            { permission: "backups:trigger", desc: "Trigger full snapshot backups on db clusters", roles: [true, false, false] }
                          ].map((row, idx) => (
                            <tr key={idx} className="hover:bg-zinc-900/30">
                              <td className="p-3 pl-4">
                                <div className="font-semibold text-zinc-200">{row.permission}</div>
                                <div className="text-4xs text-zinc-500 mt-0.5">{row.desc}</div>
                              </td>
                              <td className="p-3 text-center">
                                <CheckSquare className={`h-4 w-4 mx-auto ${row.roles[0] ? "text-emerald-500" : "text-zinc-700"}`} />
                              </td>
                              <td className="p-3 text-center">
                                <CheckSquare className={`h-4 w-4 mx-auto ${row.roles[1] ? "text-emerald-500" : "text-zinc-700"}`} />
                              </td>
                              <td className="p-3 text-center">
                                <CheckSquare className={`h-4 w-4 mx-auto ${row.roles[2] ? "text-emerald-500" : "text-zinc-700"}`} />
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
              {/* MODULE MANAGEMENT SUB-TAB                  */}
              {/* ========================================== */}
              {activeTab === "modules" && (
                <div className="space-y-6">
                  <Card className="p-5 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-200">Modular Cluster Orchestration</h3>
                      <p className="text-3xs text-zinc-500 font-mono mt-0.5">Toggle runtime availability for the 20 core microservices</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {modulesList.map((mod) => (
                        <div key={mod.id} className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/20 flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-zinc-200">{mod.name}</h4>
                              <Badge variant="neutral" className="font-mono text-4xs">v{mod.version}</Badge>
                            </div>
                            <p className="text-4xs text-zinc-500 font-mono">CATEGORY: {mod.category.toUpperCase()}</p>
                            
                            {mod.dependencies.length > 0 && (
                              <div className="text-5xs text-indigo-400 font-mono pt-1">
                                DEPENDS ON: {mod.dependencies.join(", ").toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-4xs font-mono font-bold ${mod.enabled ? "text-emerald-400 animate-pulse" : "text-zinc-500"}`}>
                              {mod.enabled ? "ACTIVE" : "INACTIVE"}
                            </span>
                            <button
                              onClick={() => handleToggleModule(mod.id, mod.enabled)}
                              className="cursor-pointer transition-transform duration-100 hover:scale-105"
                            >
                              <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${mod.enabled ? "bg-emerald-500" : "bg-zinc-800"}`}>
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${mod.enabled ? "translate-x-4" : "translate-x-0"}`} />
                              </div>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* ========================================== */}
              {/* INTEGRATIONS HUB                           */}
              {/* ========================================== */}
              {activeTab === "integrations" && (
                <div className="space-y-6">
                  <Card className="p-5 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-200">Third-Party Gateway Connections</h3>
                      <p className="text-3xs text-zinc-500 font-mono mt-0.5">Authorizations, developer SSO keys, and event-driven webhooks</p>
                    </div>

                    <div className="space-y-3">
                      {integrationsList.map((app) => (
                        <div key={app.id} className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-zinc-200">{app.name}</h4>
                              <Badge variant="neutral" className="font-mono text-4xs">{app.category}</Badge>
                            </div>
                            <p className="text-xs text-zinc-400">{app.details}</p>
                            <span className="text-5xs font-mono text-zinc-500 block">LAST SYNCED: {app.syncDate}</span>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <Badge variant={app.status === "connected" ? "success" : "neutral"} className="font-mono text-4xs">
                              {app.status.toUpperCase()}
                            </Badge>

                            <Button variant={app.status === "connected" ? "outline" : "primary"} size="sm" onClick={() => handleToggleIntegration(app.id, app.status)} className="text-4xs h-8">
                              {app.status === "connected" ? "Disconnect" : "Connect"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* ========================================== */}
              {/* AI MODELS CONFIG                           */}
              {/* ========================================== */}
              {activeTab === "ai" && aiSettings && (
                <div className="space-y-6">
                  <Card className="p-5 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-200">Active Inference Engine Models</h3>
                      <p className="text-3xs text-zinc-500 font-mono mt-0.5">Configure cognitive capabilities for the AI workforce platform</p>
                    </div>

                    <div className="space-y-3">
                      {aiSettings.models.map((model: any) => (
                        <div key={model.id} className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-zinc-200">{model.name}</h4>
                              {model.default && <Badge variant="accent" className="font-mono text-4xs">DEFAULT ENGINE</Badge>}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 pt-1.5 text-4xs font-mono text-zinc-500">
                              <div>SPEED: <span className="text-zinc-300">{model.speed}</span></div>
                              <div>PRECISION: <span className="text-zinc-300">{model.accuracy}</span></div>
                              <div>TOKEN WINDOW: <span className="text-indigo-400">{model.tokenLimit}</span></div>
                              <div>COMPUTE COST: <span className="text-zinc-300">{model.cost}</span></div>
                            </div>
                          </div>

                          <Badge variant="success" className="font-mono text-4xs self-start sm:self-center">MODEL ACTIVE</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Prompt Library */}
                  <Card className="p-5 space-y-4">
                    <h3 className="text-xs font-bold text-zinc-200">Cognitive Prompt Templates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {aiSettings.templates.map((tpl: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/10 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-200">{tpl.name}</span>
                            <Badge variant="accent" className="font-mono text-5xs">{tpl.module.toUpperCase()}</Badge>
                          </div>
                          <p className="text-4xs text-zinc-400 leading-relaxed">{tpl.description}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* ========================================== */}
              {/* SMTP MAIL SETTINGS                         */}
              {/* ========================================== */}
              {activeTab === "email" && smtpSettings && (
                <div className="space-y-6">
                  <Card className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-200">Outbound Mail Servers (SMTP)</h3>
                        <p className="text-3xs text-zinc-500 font-mono mt-0.5">Configure transaction emails and customer support templates</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setShowSMTPModal(true)} className="gap-1.5 text-xs">
                        Alter SMTP Parameters
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/10 space-y-2 text-xs">
                        <span className="text-4xs font-mono font-bold text-zinc-500 block">SERVER PROTOCOLS</span>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-zinc-400">SMTP Host:</span>
                            <span className="font-mono text-zinc-200 font-semibold">{smtpSettings.host}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">SMTP Port:</span>
                            <span className="font-mono text-zinc-200">{smtpSettings.port}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">TLS Security:</span>
                            <span className="text-emerald-400">Enabled (TLS/SSL)</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/10 space-y-2 text-xs">
                        <span className="text-4xs font-mono font-bold text-zinc-500 block">SENDER DETAILS</span>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Sender Name:</span>
                            <span className="text-zinc-200">{smtpSettings.branding}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">System Mail:</span>
                            <span className="font-mono text-zinc-200">{smtpSettings.sender}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Status:</span>
                            <Badge variant="success" className="text-5xs">CONNECTED</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* ========================================== */}
              {/* VOICE AI SETTINGS                          */}
              {/* ========================================== */}
              {activeTab === "voice" && (
                <div className="space-y-6">
                  <Card className="p-5 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-200">Synthesis Voice Profiles</h3>
                      <p className="text-3xs text-zinc-500 font-mono mt-0.5">Define phoneme variables for real-time speech synthesis</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { id: "vp-01", name: "Clara (SaaS Support)", locale: "en-US", pitch: "1.05", speed: "1.0x", active: true },
                        { id: "vp-02", name: "Arthur (Enterprise Finance)", locale: "en-GB", pitch: "0.90", speed: "0.9x", active: false }
                      ].map((vp) => (
                        <div key={vp.id} className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/10 flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Volume2 className="h-4 w-4 text-emerald-400" />
                              <span className="text-xs font-bold text-zinc-200">{vp.name}</span>
                              {vp.active && <Badge variant="success" className="font-mono text-4xs">ACTIVE VOICE</Badge>}
                            </div>
                            <p className="text-4xs text-zinc-500 font-mono">LOCALE: {vp.locale} | pitch: {vp.pitch} | speed: {vp.speed}</p>
                          </div>

                          <Button variant={vp.active ? "secondary" : "outline"} size="sm" onClick={() => addNotification({ title: "Voice Profile Loaded", description: `${vp.name} is now the default synthesizer`, type: "success" })} className="text-3xs h-8">
                            Select
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* ========================================== */}
              {/* STORAGE & SNAPSHOTS                        */}
              {/* ========================================== */}
              {activeTab === "storage" && (
                <div className="space-y-6">
                  
                  {/* Backup execution */}
                  <Card className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-200">Database snapshot backups</h3>
                        <p className="text-3xs text-zinc-500 font-mono mt-0.5">Recover clusters to consistent historic points</p>
                      </div>

                      <Button variant="primary" size="sm" onClick={handleTriggerBackup} loading={backupRunning} className="gap-1.5 text-xs">
                        <Database className="h-3.5 w-3.5" /> Execute Snapshot Run
                      </Button>
                    </div>

                    {/* Backups List */}
                    <div className="border border-zinc-850 rounded-xl overflow-hidden bg-zinc-950/20">
                      <table className="w-full text-left border-collapse font-mono text-3xs">
                        <thead>
                          <tr className="border-b border-zinc-850 bg-zinc-900/40 text-zinc-500 uppercase">
                            <th className="p-3 pl-4">Snapshot ID</th>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">Data size</th>
                            <th className="p-3">Tables index</th>
                            <th className="p-3">Trigger Mode</th>
                            <th className="p-3 text-right pr-4">Snapshot Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900 text-zinc-300">
                          {backupsList.map((bk) => (
                            <tr key={bk.id} className="hover:bg-zinc-900/30">
                              <td className="p-3 pl-4 font-bold text-indigo-400">{bk.id}</td>
                              <td className="p-3">{new Date(bk.date).toLocaleString()}</td>
                              <td className="p-3">{bk.size}</td>
                              <td className="p-3">{bk.tablesCount} tables</td>
                              <td className="p-3">{bk.trigger}</td>
                              <td className="p-3 text-right pr-4">
                                <Button variant="outline" size="sm" onClick={() => addNotification({ title: "Rollback Initiated", description: `Reverting system cluster state to snapshot ${bk.id}`, type: "warning" })} className="text-[9px] h-6 px-1.5 border-zinc-800">
                                  Rollback
                                </Button>
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
              {/* BILLING PLANS                              */}
              {/* ========================================== */}
              {activeTab === "billing" && licenseData && (
                <div className="space-y-6">
                  <Card className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-200">License Subscriptions & Billing Plan</h3>
                        <p className="text-3xs text-zinc-500 font-mono mt-0.5">Overview of active software plans and operational quotas</p>
                      </div>
                      <Badge variant="accent" className="font-mono text-3xs">{licenseData.plan_name}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/10 space-y-1">
                        <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase block">BILLING TIER</span>
                        <div className="text-sm font-bold text-zinc-200">{licenseData.tier}</div>
                        <span className="text-5xs text-emerald-400 font-mono block pt-1">RENEWS ON: {new Date(licenseData.renewal_date).toLocaleDateString()}</span>
                      </div>

                      <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/10 space-y-1">
                        <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase block">USER LICENSE CAPACITY</span>
                        <div className="text-sm font-bold text-zinc-200 font-mono">{licenseData.usage_users_active} / {licenseData.usage_users_limit}</div>
                        <div className="w-full h-1 bg-zinc-900 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${(licenseData.usage_users_active / licenseData.usage_users_limit) * 100}%` }} />
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/10 space-y-1">
                        <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase block">AI INFERENCE LIMITS</span>
                        <div className="text-sm font-bold text-zinc-200 font-mono">{licenseData.usage_ai_credits_used.toLocaleString()} / {licenseData.usage_ai_credits_limit.toLocaleString()}</div>
                        <div className="w-full h-1 bg-zinc-900 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${(licenseData.usage_ai_credits_used / licenseData.usage_ai_credits_limit) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* ========================================== */}
              {/* AUDIT HISTORY TRAIL                        */}
              {/* ========================================== */}
              {activeTab === "audit" && (
                <div className="space-y-6">
                  <Card className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-200">System audit configuration changes</h3>
                        <p className="text-3xs text-zinc-500 font-mono mt-0.5">Chronological index of secure administrative mutations</p>
                      </div>

                      <Button variant="outline" size="sm" onClick={() => handleBulkExport("audit")} className="gap-1.5 text-xs">
                        <Download className="h-3.5 w-3.5" /> Export Audit Log Indices
                      </Button>
                    </div>

                    <div className="border border-zinc-850 rounded-xl overflow-hidden bg-zinc-950/20">
                      <table className="w-full text-left border-collapse font-mono text-3xs">
                        <thead>
                          <tr className="border-b border-zinc-850 bg-zinc-900/40 text-zinc-500 uppercase">
                            <th className="p-3 pl-4">Operator</th>
                            <th className="p-3">Action Type</th>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">Host Node IP</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right pr-4">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900 text-zinc-300">
                          {auditHistory.map((audit) => (
                            <tr key={audit.id} className="hover:bg-zinc-900/30">
                              <td className="p-3 pl-4 font-bold text-zinc-200">{audit.user}</td>
                              <td className="p-3 text-indigo-400">{audit.action}</td>
                              <td className="p-3">{new Date(audit.timestamp).toLocaleString()}</td>
                              <td className="p-3">{audit.ip}</td>
                              <td className="p-3">
                                <span className="text-emerald-400 font-bold">{audit.status}</span>
                              </td>
                              <td className="p-3 text-right pr-4 text-zinc-400">{audit.details}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* ========================================== */}
              {/* AI ADMINISTRATOR CONSULTATION              */}
              {/* ========================================== */}
              {activeTab === "ai-consult" && (
                <div className="space-y-6">
                  
                  {/* Assistant Header */}
                  <Card className="p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
                      <div>
                        <h3 className="text-xs font-bold text-zinc-200">Principal AI Systems Administrator</h3>
                        <p className="text-3xs text-zinc-500 font-mono mt-0.5">Offline-capable neural supervisor trained on Exshopi architecture</p>
                      </div>
                    </div>

                    {/* Pre-canned Prompts Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                      {[
                        { title: "Summarize platform health.", query: "Summarize platform health and microservice pod status." },
                        { title: "Recommend security settings.", query: "Recommend security settings to secure API access keys." },
                        { title: "Detect unused modules.", query: "Detect unused modules and calculate CPU release." },
                        { title: "Analyze storage usage.", query: "Analyze storage usage and document archiving options." }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAskAIConsultant(item.query)}
                          className="p-3 rounded-xl border border-zinc-850 bg-zinc-900/20 hover:bg-zinc-900/50 text-left cursor-pointer transition-all hover:border-indigo-500/30 group"
                        >
                          <span className="text-xs font-bold text-zinc-300 group-hover:text-zinc-100">{item.title}</span>
                          <span className="text-[10px] text-zinc-500 block mt-1">Request diagnostic report →</span>
                        </button>
                      ))}
                    </div>
                  </Card>

                  {/* Conversation Console */}
                  <Card className="p-5 space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Inquire on cluster telemetry, module engagement, and retention policies..."
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAskAIConsultant()}
                        className="flex-1"
                      />
                      <Button variant="primary" onClick={() => handleAskAIConsultant()} loading={consultingLoading}>
                        Consult AI Core
                      </Button>
                    </div>

                    {/* AI Answer Terminal Output */}
                    {(aiAnswer || consultingLoading) && (
                      <div className="p-5 rounded-xl border border-zinc-850 bg-zinc-950 font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed relative overflow-hidden">
                        
                        <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] text-zinc-600">
                          <Terminal className="h-3 w-3" />
                          <span>SECURE DECRYPTED TERMINAL</span>
                        </div>

                        {consultingLoading ? (
                          <div className="flex items-center gap-2 text-zinc-500">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Computing parameters and model telemetry...</span>
                          </div>
                        ) : (
                          <div className="prose prose-invert max-w-none text-zinc-300">
                            {aiAnswer}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL SYSTEM                               */}
      {/* ========================================== */}

      {/* 1. SMTP Modify Modal */}
      <Dialog isOpen={showSMTPModal} onClose={() => setShowSMTPModal(false)} title="Configure Mail Gateway">
        <form onSubmit={handleSaveSMTP} className="space-y-4 mt-2">
          <Input label="SMTP Server Host" required value={smtpForm.host} onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="SMTP Port" required type="number" value={smtpForm.port} onChange={(e) => setSmtpForm({ ...smtpForm, port: parseInt(e.target.value) || 587 })} />
            <Input label="Sender Brand" value={smtpForm.branding} onChange={(e) => setSmtpForm({ ...smtpForm, branding: e.target.value })} />
          </div>
          <Input label="Authenticated User" value={smtpForm.username} onChange={(e) => setSmtpForm({ ...smtpForm, username: e.target.value })} />
          <Input label="Default Sender Mail" type="email" value={smtpForm.sender} onChange={(e) => setSmtpForm({ ...smtpForm, sender: e.target.value })} />
          
          <Button variant="primary" className="w-full mt-2" type="submit">Activate Mail Gateway</Button>
        </form>
      </Dialog>

      {/* 2. Invite User Modal */}
      <Dialog isOpen={showUserModal} onClose={() => setShowUserModal(false)} title="Invite User or Register AI Agent">
        <form onSubmit={handleCreateUser} className="space-y-4 mt-2">
          <Input label="Full Identity Name" required placeholder="Marcus Finch" value={userForm.full_name} onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })} />
          <Input label="Enterprise Email" required type="email" placeholder="m.finch@exshopi.ai" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Designation / Position" placeholder="Sales Director AI" value={userForm.position} onChange={(e) => setUserForm({ ...userForm, position: e.target.value })} />
            <Input label="Salary Allocation ($)" type="number" placeholder="4500" value={userForm.salary} onChange={(e) => setUserForm({ ...userForm, salary: e.target.value })} />
          </div>
          <Button variant="primary" className="w-full mt-2" type="submit">Invite operator to workspace</Button>
        </form>
      </Dialog>

    </div>
  );
}
