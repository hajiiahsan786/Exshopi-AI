import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Card, Button, Input, Select, Badge, Dialog, getAccentClass, getRadiusClass } from "./UI";
import {
  Building2,
  Users,
  Layers,
  TrendingUp,
  Coins,
  Briefcase,
  CheckSquare,
  Activity,
  Plus,
  RefreshCw,
  LogOut,
  LogIn,
  Key,
  ShieldCheck,
  Globe,
  Database,
  Cpu,
  FileText,
  ChevronRight,
  Sparkles,
  Command,
  Bell,
  Sun,
  Moon,
  Lock,
  ChevronDown,
  Trash2,
  Check,
  AlertTriangle,
  UserCheck,
  LayoutGrid,
  ShoppingCart,
  Factory
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DesignSystemVisualizer } from "./DesignSystemVisualizer";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { EnterpriseSecurityCenter } from "./EnterpriseSecurityCenter";
import { ExecutiveDashboard } from "./ExecutiveDashboard";
import { EnterpriseCRM } from "./EnterpriseCRM";
import { EnterpriseHR } from "./EnterpriseHR";
import { EnterpriseProcurement } from "./EnterpriseProcurement";
import { EnterpriseManufacturing } from "./EnterpriseManufacturing";
import { EnterpriseInventory } from "./EnterpriseInventory";
import { EnterpriseSales } from "./EnterpriseSales";
import { EnterpriseFinance } from "./EnterpriseFinance";
import { EnterpriseProjects } from "./EnterpriseProjects";
import EnterpriseSupport from "./EnterpriseSupport";
import EnterpriseMarketing from "./EnterpriseMarketing";
import EnterpriseDocuments from "./EnterpriseDocuments";
import EnterpriseWorkflows from "./EnterpriseWorkflows";
import { EnterpriseNotifications } from "./EnterpriseNotifications";
import { AIHeadquarters } from "./AIHeadquarters";
import { VoiceAIPlatform } from "./VoiceAIPlatform";
import { EnterpriseMarketplace } from "./EnterpriseMarketplace";
import { EnterprisePayments } from "./EnterprisePayments";
import { EnterpriseLogistics } from "./EnterpriseLogistics";
import EnterpriseAdministration from "./EnterpriseAdministration";
import { Boxes, DollarSign, Wallet, FolderKanban, LifeBuoy, Megaphone, Compass, Brain, Mic, Store, CreditCard, Truck, Sliders } from "lucide-react";
import { AIWelcomeExperience } from "./AIWelcomeExperience";

interface DashboardLayoutProps {
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ onLogout }) => {
  const {
    theme,
    setTheme,
    accentColor,
    activeView,
    setActiveView,
    sidebarOpen,
    setSidebarOpen,
    currentUser,
    setCurrentUser,
    organizations,
    setOrganizations,
    companies,
    setCompanies,
    roles,
    setRoles,
    currentCompanyId,
    setCurrentCompanyId,
    currentUserRole,
    setCurrentUserRole,
    notificationsOpen,
    setNotificationsOpen,
    notifications,
    markNotificationAsRead,
    clearNotifications,
    addNotification,
    setCommandPaletteOpen,
    setLockScreenLocked,
    setSessionExpired,
    aiPanelOpen,
    setAiPanelOpen,
    addLog
  } = useStore();

  // Local state for DB data
  const [localCompanies, setLocalCompanies] = useState<any[]>([]);
  const [localDepartments, setLocalDepartments] = useState<any[]>([]);
  const [localEmployees, setLocalEmployees] = useState<any[]>([]);
  const [localLeads, setLocalLeads] = useState<any[]>([]);
  const [localTasks, setLocalTasks] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState<"company" | "dept" | "emp" | "lead" | "task" | null>(null);

  // Forms states
  const [companyForm, setCompanyForm] = useState({ company_name: "", industry: "", business_type: "", email: "", city: "", country: "" });
  const [deptForm, setDeptForm] = useState({ name: "", code: "", budget: 50000, company_id: 1 });
  const [empForm, setEmpForm] = useState({ full_name: "", email: "", position: "", salary: 3000, department_id: 1 });
  const [leadForm, setLeadForm] = useState({ contact_name: "", email: "", phone: "", source: "Direct Web", notes: "", status: "New" });
  const [taskForm, setTaskForm] = useState({ title: "", assigned_to: "Sophia AI", priority: "Medium", due_date: "" });

  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("ex_welcome_played") !== "true";
    }
    return true;
  });

  const fetchDatabase = async () => {
    setLoadingDb(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        "X-Company-ID": currentCompanyId.toString()
      };

      const resC = await fetch("/api/v1/companies");
      const dataC = await resC.json();
      setLocalCompanies(dataC);

      const resD = await fetch("/api/v1/departments", { headers });
      const dataD = await resD.json();
      setLocalDepartments(dataD);

      const resE = await fetch("/api/v1/employees", { headers });
      const dataE = await resE.json();
      setLocalEmployees(dataE);

      const resL = await fetch("/api/v1/leads", { headers });
      const dataL = await resL.json();
      setLocalLeads(dataL);

      const resT = await fetch("/api/v1/tasks", { headers });
      const dataT = await resT.json();
      setLocalTasks(dataT);
    } catch (err) {
      console.error("Failed to fetch database: ", err);
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    fetchDatabase();
  }, [currentCompanyId]);

  useEffect(() => {
    // Fetch user organizations & metadata
    const fetchMetadata = async () => {
      try {
        const r1 = await fetch("/api/v1/organizations");
        const oData = await r1.json();
        setOrganizations(oData);

        const r2 = await fetch("/api/v1/roles");
        const roData = await r2.json();
        setRoles(roData);
      } catch (e) {
        console.error(e);
      }
    };
    fetchMetadata();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...companyForm, organization_id: 2 })
      });
      const data = await res.json();
      
      addLog({
        method: "POST",
        endpoint: "/api/v1/companies",
        status: res.status,
        type: "api",
        payload: companyForm,
        response: data
      });

      if (res.ok) {
        addNotification({
          title: "New Company Registered",
          description: `Successfully provisioned e-commerce business tenant: ${companyForm.company_name}`,
          type: "success"
        });
        fetchDatabase();
        setShowAddModal(null);
        setCompanyForm({ company_name: "", industry: "", business_type: "", email: "", city: "", country: "" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deptForm)
      });
      const data = await res.json();

      addLog({
        method: "POST",
        endpoint: "/api/v1/departments",
        status: res.status,
        type: "api",
        payload: deptForm,
        response: data
      });

      if (res.ok) {
        addNotification({
          title: "New Department Provisioned",
          description: `Successfully injected ${deptForm.name} under selected company context`,
          type: "success"
        });
        fetchDatabase();
        setShowAddModal(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empForm)
      });
      const data = await res.json();

      addLog({
        method: "POST",
        endpoint: "/api/v1/employees",
        status: res.status,
        type: "api",
        payload: empForm,
        response: data
      });

      if (res.ok) {
        addNotification({
          title: "Employee Profile Active",
          description: `Successfully registered profile for ${empForm.full_name}`,
          type: "success"
        });
        fetchDatabase();
        setShowAddModal(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadForm)
      });
      const data = await res.json();

      addLog({
        method: "POST",
        endpoint: "/api/v1/leads",
        status: res.status,
        type: "api",
        payload: leadForm,
        response: data
      });

      if (res.ok) {
        addNotification({
          title: "Sales Lead Injected",
          description: `Pipeline lead ${leadForm.contact_name} tracked successfully`,
          type: "success"
        });
        fetchDatabase();
        setShowAddModal(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskForm)
      });
      const data = await res.json();

      addLog({
        method: "POST",
        endpoint: "/api/v1/tasks",
        status: res.status,
        type: "api",
        payload: taskForm,
        response: data
      });

      if (res.ok) {
        addNotification({
          title: "Workspace Task Broadcast",
          description: `Dispatched task: ${taskForm.title} to AI queue`,
          type: "success"
        });
        fetchDatabase();
        setShowAddModal(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Switch Workspace context between Company 1 and Company 2
  const activeCompany = localCompanies.find((c) => c.id === currentCompanyId) || localCompanies[0] || { company_name: "Exshopi Labs" };

  return (
    <div className={`min-h-screen bg-zinc-950 flex flex-col font-sans select-none`}>
      {/* Enterprise AI Welcome Experience Overlay */}
      {showWelcome && (
        <AIWelcomeExperience
          onComplete={() => setShowWelcome(false)}
          localCompanies={localCompanies}
          localEmployees={localEmployees}
        />
      )}
      
      {/* Shell Layout: Sidebar and Main Panel */}
      <div className="flex flex-1 relative overflow-hidden">
        
        {/* Left Side Navigation Rail */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="border-r border-white/30 bg-white/50 backdrop-blur-2xl flex flex-col flex-shrink-0 z-30"
            >
              {/* Sidebar Header Brand */}
              <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-7 w-7 rounded-lg ${getAccentClass("bg")} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    ⚡
                  </span>
                  <div>
                    <h2 className="text-sm font-bold tracking-tight text-white font-mono leading-none">
                      EXSHOPI <span className={getAccentClass("text")}>AI</span>
                    </h2>
                    <span className="text-[10px] text-zinc-500 font-medium">FOUNDATION</span>
                  </div>
                </div>
              </div>

              {/* Company Workspace Switcher */}
              <div className="p-4 border-b border-zinc-850 relative">
                <button
                  onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-850 hover:bg-zinc-950 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="h-4.5 w-4.5 rounded bg-zinc-800 text-zinc-300 text-3xs flex items-center justify-center border border-zinc-750">
                      🏢
                    </span>
                    <span className="text-xs font-semibold text-zinc-200 truncate">{activeCompany.company_name}</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                </button>

                <AnimatePresence>
                  {workspaceDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute left-4 right-4 mt-1.5 z-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden p-1"
                    >
                      {localCompanies.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setCurrentCompanyId(c.id);
                            setWorkspaceDropdownOpen(false);
                            addLog({
                              method: "SWITCH",
                              endpoint: `/api/v1/companies/context/${c.id}`,
                              status: 200,
                              type: "security",
                              response: { activeCompany: c.company_name }
                            });
                          }}
                          className={`w-full text-left p-2 rounded-md text-xs font-medium cursor-pointer transition-colors hover:bg-zinc-950 ${
                            currentCompanyId === c.id ? `${getAccentClass("text")} bg-zinc-950/40` : "text-zinc-400"
                          }`}
                        >
                          {c.company_name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sidebar Menu Items */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <span className="text-[10px] font-bold text-zinc-500 px-2 uppercase tracking-wider block mb-3">Enterprise OS</span>
                
                <button
                  onClick={() => setActiveView("dashboard")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl font-medium cursor-pointer hover:bg-white/40 hover:scale-[1.02] transition-all shadow-sm ${
                    activeView === "dashboard"
                      ? `bg-white/60 text-indigo-600 shadow-md border border-white/50`
                      : "text-zinc-600 border border-transparent"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span>Workspace</span>
                </button>

                <button
                  onClick={() => setActiveView("sales")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl font-medium cursor-pointer hover:bg-white/40 hover:scale-[1.02] transition-all shadow-sm ${
                    activeView === "sales"
                      ? `bg-white/60 text-indigo-600 shadow-md border border-white/50`
                      : "text-zinc-600 border border-transparent"
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Sales</span>
                </button>

                <button
                  onClick={() => setActiveView("crm")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl font-medium cursor-pointer hover:bg-white/40 hover:scale-[1.02] transition-all shadow-sm ${
                    activeView === "crm"
                      ? `bg-white/60 text-indigo-600 shadow-md border border-white/50`
                      : "text-zinc-600 border border-transparent"
                  }`}
                >
                  <Briefcase className="h-4 w-4" />
                  <span>CRM</span>
                </button>

                <button
                  onClick={() => setActiveView("finance")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl font-medium cursor-pointer hover:bg-white/40 hover:scale-[1.02] transition-all shadow-sm ${
                    activeView === "finance"
                      ? `bg-white/60 text-indigo-600 shadow-md border border-white/50`
                      : "text-zinc-600 border border-transparent"
                  }`}
                >
                  <Coins className="h-4 w-4" />
                  <span>Finance</span>
                </button>

                <button
                  onClick={() => setActiveView("inventory")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl font-medium cursor-pointer hover:bg-white/40 hover:scale-[1.02] transition-all shadow-sm ${
                    activeView === "inventory"
                      ? `bg-white/60 text-indigo-600 shadow-md border border-white/50`
                      : "text-zinc-600 border border-transparent"
                  }`}
                >
                  <Boxes className="h-4 w-4" />
                  <span>Inventory</span>
                </button>

                <button
                  onClick={() => setActiveView("manufacturing")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl font-medium cursor-pointer hover:bg-white/40 hover:scale-[1.02] transition-all shadow-sm ${
                    activeView === "manufacturing"
                      ? `bg-white/60 text-indigo-600 shadow-md border border-white/50`
                      : "text-zinc-600 border border-transparent"
                  }`}
                >
                  <Factory className="h-4 w-4" />
                  <span>Manufacturing</span>
                </button>

                <button
                  onClick={() => setActiveView("marketing")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl font-medium cursor-pointer hover:bg-white/40 hover:scale-[1.02] transition-all shadow-sm ${
                    activeView === "marketing"
                      ? `bg-white/60 text-indigo-600 shadow-md border border-white/50`
                      : "text-zinc-600 border border-transparent"
                  }`}
                >
                  <Megaphone className="h-4 w-4" />
                  <span>Marketing</span>
                </button>

                <button
                  onClick={() => setActiveView("hr")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl font-medium cursor-pointer hover:bg-white/40 hover:scale-[1.02] transition-all shadow-sm ${
                    activeView === "hr"
                      ? `bg-white/60 text-indigo-600 shadow-md border border-white/50`
                      : "text-zinc-600 border border-transparent"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>HR</span>
                </button>

                <button
                  onClick={() => setActiveView("documents")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl font-medium cursor-pointer hover:bg-white/40 hover:scale-[1.02] transition-all shadow-sm ${
                    activeView === "documents"
                      ? `bg-white/60 text-indigo-600 shadow-md border border-white/50`
                      : "text-zinc-600 border border-transparent"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Documents</span>
                </button>

                <button
                  onClick={() => setActiveView("ai-workforce")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl font-medium cursor-pointer hover:bg-white/40 hover:scale-[1.02] transition-all shadow-sm ${
                    activeView === "ai-workforce"
                      ? `bg-white/60 text-indigo-600 shadow-md border border-white/50`
                      : "text-zinc-600 border border-transparent"
                  }`}
                >
                  <Brain className="h-4 w-4" />
                  <span>AI Agents</span>
                </button>

                <button
                  onClick={() => setActiveView("workflows")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl font-medium cursor-pointer hover:bg-white/40 hover:scale-[1.02] transition-all shadow-sm ${
                    activeView === "workflows"
                      ? `bg-white/60 text-indigo-600 shadow-md border border-white/50`
                      : "text-zinc-600 border border-transparent"
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  <span>Automation</span>
                </button>

                <button
                  onClick={() => setActiveView("settings")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl font-medium cursor-pointer hover:bg-white/40 hover:scale-[1.02] transition-all shadow-sm ${
                    activeView === "settings"
                      ? `bg-white/60 text-indigo-600 shadow-md border border-white/50`
                      : "text-zinc-600 border border-transparent"
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  <span>Settings</span>
                </button>
              </nav>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-zinc-850 bg-zinc-950/20 text-center">
                <Badge variant="success" className="text-3xs tracking-widest font-mono">INTEGRITY SECURE</Badge>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Core Main Panel */}
        <main className="flex-1 flex flex-col min-w-0 bg-zinc-950 relative overflow-y-auto">
          
          {/* Topbar Nav Navigation Panel */}
          <header className="h-16 border-b border-zinc-800/60 bg-zinc-900/30 backdrop-blur-md px-6 flex items-center justify-between z-20 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="lg:flex h-8 px-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                ☰
              </Button>

              {/* Breadcrumbs */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold font-mono">
                <span>PORTAL</span>
                <ChevronRight className="h-3 w-3" />
                <span className={getAccentClass("text")}>{activeView.toUpperCase()}</span>
              </div>
            </div>

            {/* Topbar Right action clusters */}
            <div className="flex items-center gap-3.5">
              
              {/* Spotlight cmd+K shortcut indicator */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-850 hover:bg-zinc-850 hover:border-zinc-700 transition-colors cursor-pointer"
              >
                <Command className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-3xs text-zinc-400 font-medium">Search actions...</span>
                <kbd className="px-1 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-3xs text-zinc-500 font-bold">⌘K</kbd>
              </button>

              {/* Theme Mode Toggle Button */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {/* Notification Center */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="h-8 w-8 rounded-lg border border-zinc-800 hover:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer relative"
                >
                  <Bell className="h-4 w-4" />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-zinc-950 animate-pulse" />
                  )}
                </button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2.5 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-40 p-1 font-sans"
                    >
                      <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/40">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Live system alerts</span>
                        <button onClick={clearNotifications} className="text-3xs text-rose-400 hover:underline">Clear all</button>
                      </div>

                      <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-2xs text-zinc-500">No active system alerts</div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => markNotificationAsRead(n.id)}
                              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                                n.read
                                  ? "bg-zinc-950/20 border-zinc-850/40"
                                  : "bg-zinc-950/80 border-zinc-800/80 hover:bg-zinc-900"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-1">
                                <span className={`text-2xs font-semibold ${n.read ? "text-zinc-500" : "text-zinc-200"}`}>{n.title}</span>
                                <span className="text-4xs text-zinc-500 shrink-0">{n.timestamp}</span>
                              </div>
                              <p className="text-3xs text-zinc-400 mt-1 leading-relaxed">{n.description}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Dropdown Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors cursor-pointer text-left"
                >
                  <div className="h-6.5 w-6.5 rounded-full overflow-hidden border border-zinc-700">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80"
                      alt="Avatar"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-zinc-300 pr-1">{currentUser?.full_name || "Ahsan"}</span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2.5 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-40 p-1.5"
                    >
                      <div className="p-3 border-b border-zinc-800/60 text-left">
                        <div className="text-xs font-bold text-zinc-100">{currentUser?.full_name || "Ahsan Haji"}</div>
                        <div className="text-3xs font-mono text-zinc-500 mt-0.5">{currentUser?.email || "hajiiahsan786@gmail.com"}</div>
                        <Badge variant="accent" className="mt-2 text-4xs">Level-3 SOC Admin</Badge>
                      </div>

                      <div className="py-1.5 space-y-0.5">
                        <button
                          onClick={() => { setLockScreenLocked(true); setUserMenuOpen(false); }}
                          className="w-full text-left px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950 rounded-lg flex items-center gap-2 cursor-pointer"
                        >
                          <Lock className="h-3.5 w-3.5" /> Lock System Screen
                        </button>
                        <button
                          onClick={() => { setSessionExpired(true); setUserMenuOpen(false); }}
                          className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg flex items-center gap-2 cursor-pointer"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" /> Force Session Expired
                        </button>
                      </div>

                      <div className="border-t border-zinc-800/60 pt-1.5">
                        <button
                          onClick={onLogout}
                          className="w-full text-left px-3 py-2 text-xs text-rose-500 hover:text-rose-400 hover:bg-zinc-950 rounded-lg flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="h-3.5 w-3.5" /> Logout Admin Session
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </header>

          {/* Core Portal Dashboard Canvas */}
          <div className="flex-1 p-6 space-y-6">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* 1. Portal Dashboard View */}
                {activeView === "dashboard" && (
                  <ExecutiveDashboard
                    localCompanies={localCompanies}
                    localDepartments={localDepartments}
                    localEmployees={localEmployees}
                    localLeads={localLeads}
                    localTasks={localTasks}
                    loadingDb={loadingDb}
                    fetchDatabase={fetchDatabase}
                    setShowAddModal={setShowAddModal}
                  />
                )}

                {/* AI Headquarters View */}
                {activeView === "ai-workforce" && <AIHeadquarters />}

                {/* Voice AI Platform View */}
                {activeView === "voice-ai" && <VoiceAIPlatform />}

                {/* Enterprise CRM View */}
                {activeView === "crm" && <EnterpriseCRM />}

                {/* Enterprise HR & Workforce View */}
                {activeView === "hr" && <EnterpriseHR />}

                {/* Enterprise Procurement View */}
                {activeView === "procurement" && <EnterpriseProcurement />}

                {/* Enterprise Manufacturing View */}
                {activeView === "manufacturing" && <EnterpriseManufacturing />}

                {/* Enterprise Inventory View */}
                {activeView === "inventory" && <EnterpriseInventory />}

                {/* Enterprise Sales & OMS View */}
                {activeView === "sales" && <EnterpriseSales />}

                {/* Enterprise Finance View */}
                {activeView === "finance" && <EnterpriseFinance />}

                {/* Enterprise Marketplace & Commerce View */}
                {activeView === "marketplace" && <EnterpriseMarketplace />}

                {/* Enterprise Payment Platform View */}
                {activeView === "payments" && <EnterprisePayments />}

                {/* Enterprise Projects View */}
                {activeView === "projects" && <EnterpriseProjects />}

                {/* Enterprise Customer Support View */}
                {activeView === "support" && <EnterpriseSupport />}

                {/* Enterprise Marketing Automation View */}
                {activeView === "marketing" && <EnterpriseMarketing />}

                {/* Enterprise Document Cloud View */}
                {activeView === "documents" && <EnterpriseDocuments />}

                {/* Visual Workflow Orchestration View */}
                {activeView === "workflows" && <EnterpriseWorkflows />}

                {/* Enterprise Notification Center View */}
                {activeView === "notifications" && <EnterpriseNotifications />}

                {/* 2. Portal Design Sandbox */}
                {activeView === "design-system" && <DesignSystemVisualizer />}

                {/* 3. Portal Advanced Analytics */}
                {activeView === "analytics" && <AnalyticsCharts />}

                {/* 4. Portal Security Center */}
                {activeView === "security" && <EnterpriseSecurityCenter />}

                {/* 5. Enterprise Logistics & Supply Chain */}
                {activeView === "logistics" && <EnterpriseLogistics />}

                {/* 6. Enterprise Administration & Settings */}
                {activeView === "settings" && <EnterpriseAdministration />}
              </motion.div>
            </AnimatePresence>

          </div>
        </main>
      </div>

      {/* Global Modals for additions */}
      {/* 1. Create Company Modal */}
      <Dialog isOpen={showAddModal === "company"} onClose={() => setShowAddModal(null)} title="Register E-Commerce Company Tenant">
        <form onSubmit={handleCreateCompany} className="space-y-4">
          <Input label="Company Name" placeholder="Exshopi AI Labs" required value={companyForm.company_name} onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Industry Vertical" placeholder="Artificial Intelligence" value={companyForm.industry} onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })} />
            <Input label="Business Type" placeholder="B2B SaaS" value={companyForm.business_type} onChange={(e) => setCompanyForm({ ...companyForm, business_type: e.target.value })} />
          </div>
          <Input label="Administrative Email" placeholder="labs@exshopi.ai" type="email" value={companyForm.email} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" placeholder="San Francisco" value={companyForm.city} onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })} />
            <Input label="Country" placeholder="United States" value={companyForm.country} onChange={(e) => setCompanyForm({ ...companyForm, country: e.target.value })} />
          </div>
          <Button variant="primary" className="w-full mt-2" type="submit">Deploy Company Tenant Profile</Button>
        </form>
      </Dialog>

      {/* 2. Create Dept Modal */}
      <Dialog isOpen={showAddModal === "dept"} onClose={() => setShowAddModal(null)} title="Provision New Department">
        <form onSubmit={handleCreateDept} className="space-y-4">
          <Input label="Department Name" placeholder="Executive Logistics and Supply Chain" required value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} />
          <Input label="Department Code" placeholder="EX-LOG" required value={deptForm.code} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })} />
          <Input label="SLA Budget Scale (USD)" placeholder="50000" type="number" required value={deptForm.budget} onChange={(e) => setDeptForm({ ...deptForm, budget: parseInt(e.target.value) })} />
          <Button variant="primary" className="w-full mt-2" type="submit">Commit Department Structure</Button>
        </form>
      </Dialog>

      {/* 3. Create Employee Modal */}
      <Dialog isOpen={showAddModal === "emp"} onClose={() => setShowAddModal(null)} title="Register Worker Profile">
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <Input label="Full Profile Name" placeholder="Sophia AI" required value={empForm.full_name} onChange={(e) => setEmpForm({ ...empForm, full_name: e.target.value })} />
          <Input label="Secure Contact Email" placeholder="sophia.sales@exshopi.ai" type="email" required value={empForm.email} onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })} />
          <Input label="Position Title" placeholder="Senior Autonomous Sales Engineer" required value={empForm.position} onChange={(e) => setEmpForm({ ...empForm, position: e.target.value })} />
          <Input label="Salary Scale (USD/mo)" placeholder="4000" type="number" required value={empForm.salary} onChange={(e) => setEmpForm({ ...empForm, salary: parseInt(e.target.value) })} />
          <Button variant="primary" className="w-full mt-2" type="submit">Authorize Worker Entry</Button>
        </form>
      </Dialog>

      {/* 4. Create Lead Modal */}
      <Dialog isOpen={showAddModal === "lead"} onClose={() => setShowAddModal(null)} title="Inject Sales Pipeline Lead">
        <form onSubmit={handleCreateLead} className="space-y-4">
          <Input label="Contact Name" placeholder="William Henderson" required value={leadForm.contact_name} onChange={(e) => setLeadForm({ ...leadForm, contact_name: e.target.value })} />
          <Input label="Email ID" placeholder="william@globaltech.com" type="email" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} />
          <Input label="Contact Phone" placeholder="+1-555-8822" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} />
          <Button variant="primary" className="w-full mt-2" type="submit">Commit Sales Lead</Button>
        </form>
      </Dialog>

      {/* 5. Create Task Modal */}
      <Dialog isOpen={showAddModal === "task"} onClose={() => setShowAddModal(null)} title="Dispatch Workspace Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input label="Task Title" placeholder="Reconcile daily settlement records for Stripe checkout" required value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
          <Input label="AI / Human Assignee" placeholder="Sophia AI (Sales Pro)" required value={taskForm.assigned_to} onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })} />
          <Button variant="primary" className="w-full mt-2" type="submit">Discharge Task to Queue</Button>
        </form>
      </Dialog>

    </div>
  );
};
