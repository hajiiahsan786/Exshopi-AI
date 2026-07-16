import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Card, Button, Input, Textarea, Select, Badge, Dialog, getAccentClass, getRadiusClass } from "./UI";
import {
  Briefcase,
  Users,
  LayoutGrid,
  Sparkles,
  TrendingUp,
  Cpu,
  FileText,
  CheckSquare,
  Activity,
  Plus,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  UserCheck,
  Search,
  Filter,
  Mail,
  Phone,
  ExternalLink,
  Calendar,
  HelpCircle,
  Check,
  Trash2,
  ArrowUpDown,
  MessageSquare,
  Clipboard,
  MoreVertical,
  Edit,
  Send,
  Download,
  BarChart2,
  Lock,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap
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

// CRM Interfaces
interface Contact {
  id: number;
  name: string;
  company_id: number;
  email: string;
  phone: string;
  role: string;
  last_contacted: string;
}

interface Opportunity {
  id: number;
  name: string;
  company_name: string;
  stage: "prospecting" | "qualification" | "proposal" | "negotiation" | "won" | "lost";
  value: number;
  probability: number;
  expected_close_date: string;
  assigned_to: string;
  notes: string;
}

interface ActivityItem {
  id: number;
  type: "call" | "meeting" | "email" | "task" | "note";
  title: string;
  date: string;
  duration?: string;
  notes: string;
  customer_name: string;
  contact_email: string;
}

interface Lead {
  id: number;
  company_id: number;
  contact_name: string;
  email: string;
  phone: string;
  status: "New" | "Contacted" | "Qualified" | "Proposal" | "Nurturing" | "Converted";
  source: string;
  notes: string;
}

interface Company {
  id: number;
  company_name: string;
  legal_name: string;
  industry: string;
  business_type: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  website: string;
  tax_number: string;
  registration_number: string;
  logo: string;
  created_at: string;
}

interface Task {
  id: number;
  title: string;
  assigned_to: string;
  status: string;
  priority: string;
  due_date: string;
}

export const EnterpriseCRM: React.FC = () => {
  const { addLog, addNotification } = useStore();

  // Primary active sub-tab: overview | customers | leads | contacts | opportunities | activities | tasks
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "customers" | "leads" | "contacts" | "opportunities" | "activities" | "tasks">("overview");

  // CRM DB States
  const [companies, setCompanies] = useState<Company[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Floating AI Suggestion Drawer
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiTargetEntity, setAiTargetEntity] = useState<{ type: string; data: any } | null>(null);

  // Modals state
  const [dialogOpen, setDialogOpen] = useState<"contact" | "opportunity" | "activity" | "lead" | null>(null);

  // Form states
  const [contactForm, setContactForm] = useState({ name: "", company_id: "1", email: "", phone: "", role: "VP of Product" });
  const [oppForm, setOppForm] = useState({ name: "", company_name: "Exshopi AI Labs", stage: "prospecting", value: "50000", probability: "20", expected_close_date: "", assigned_to: "Sophia AI (Sales Pro)", notes: "" });
  const [activityForm, setActivityForm] = useState({ type: "call" as any, title: "", duration: "15m", notes: "", customer_name: "Exshopi AI Labs", contact_email: "" });
  const [leadForm, setLeadForm] = useState({ contact_name: "", email: "", phone: "", status: "New" as any, source: "Inbound Live Demo", notes: "" });

  const radius = getRadiusClass();

  // Load database entities
  const loadCRMData = async () => {
    setLoading(true);
    try {
      const [resC, resL, resCon, resOpp, resAct, resT] = await Promise.all([
        fetch("/api/v1/companies"),
        fetch("/api/v1/leads"),
        fetch("/api/v1/crm/contacts"),
        fetch("/api/v1/crm/opportunities"),
        fetch("/api/v1/crm/activities"),
        fetch("/api/v1/tasks")
      ]);

      const [cData, lData, conData, oppData, actData, tData] = await Promise.all([
        resC.json(),
        resL.json(),
        resCon.json(),
        resOpp.json(),
        resAct.json(),
        resT.json()
      ]);

      setCompanies(cData || []);
      setLeads(lData || []);
      setContacts(conData || []);
      setOpportunities(oppData || []);
      setActivities(actData || []);
      setTasks(tData || []);
    } catch (err) {
      console.error("Failed to load CRM database entities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCRMData();
  }, []);

  // AI Insights triggers
  const triggerAISuggestion = async (action: string, entityType: string, entityData: any) => {
    setAiTargetEntity({ type: entityType, data: entityData });
    setAiDrawerOpen(true);
    setAiLoading(true);
    setAiSuggestion("");

    try {
      const res = await fetch("/api/v1/crm/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, entityType, entityData })
      });
      const data = await res.json();
      if (data.success) {
        setAiSuggestion(data.suggestion);
        addLog({
          method: "POST",
          endpoint: "/api/v1/crm/ai-suggest",
          status: 200,
          type: "api",
          response: { action, target: entityData?.contact_name || entityData?.company_name }
        });
      } else {
        setAiSuggestion("The Exshopi AI core was unable to process your analysis. Please check your credentials.");
      }
    } catch (err: any) {
      setAiSuggestion(`Connection to AI Agent Pipeline timed out: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Submit Contact
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contactForm,
          company_id: parseInt(contactForm.company_id)
        })
      });
      if (res.ok) {
        addNotification({
          title: "Contact Profile Saved",
          description: `Direct contact ${contactForm.name} added to pipeline successfully`,
          type: "success"
        });
        setDialogOpen(null);
        setContactForm({ name: "", company_id: "1", email: "", phone: "", role: "VP of Product" });
        loadCRMData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Contact
  const handleDeleteContact = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
      const res = await fetch(`/api/v1/crm/contacts/${id}`, { method: "DELETE" });
      if (res.ok) {
        addNotification({
          title: "Contact Removed",
          description: "CRM contact profile deleted successfully",
          type: "warning"
        });
        loadCRMData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Opportunity
  const handleAddOpp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/crm/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...oppForm,
          value: parseFloat(oppForm.value),
          probability: parseInt(oppForm.probability)
        })
      });
      if (res.ok) {
        addNotification({
          title: "Opportunity Initialized",
          description: `Sales deal ${oppForm.name} added to pipeline board`,
          type: "success"
        });
        setDialogOpen(null);
        setOppForm({ name: "", company_name: "Exshopi AI Labs", stage: "prospecting", value: "50000", probability: "20", expected_close_date: "", assigned_to: "Sophia AI (Sales Pro)", notes: "" });
        loadCRMData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Opportunity Stage
  const handleUpdateOppStage = async (id: number, stage: string, prob: number) => {
    try {
      const res = await fetch(`/api/v1/crm/opportunities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, probability: prob })
      });
      if (res.ok) {
        addNotification({
          title: "Pipeline Stage Altered",
          description: `Altered opportunity status to: ${stage.toUpperCase()} (${prob}% Probability)`,
          type: "success"
        });
        loadCRMData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Opportunity
  const handleDeleteOpp = async (id: number) => {
    if (!confirm("Are you sure you want to retire this opportunity?")) return;
    try {
      const res = await fetch(`/api/v1/crm/opportunities/${id}`, { method: "DELETE" });
      if (res.ok) {
        addNotification({
          title: "Opportunity Retired",
          description: "Opportunity has been removed from the pipeline system",
          type: "warning"
        });
        loadCRMData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Activity log
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/crm/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activityForm)
      });
      if (res.ok) {
        addNotification({
          title: "Interaction Activity Logged",
          description: `New activity "${activityForm.title}" registered under target timeline`,
          type: "success"
        });
        setDialogOpen(null);
        setActivityForm({ type: "call", title: "", duration: "15m", notes: "", customer_name: "Exshopi AI Labs", contact_email: "" });
        loadCRMData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Lead
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadForm)
      });
      if (res.ok) {
        addNotification({
          title: "Outbound Lead Tracked",
          description: `Successfully stored and analyzed ${leadForm.contact_name} profile`,
          type: "success"
        });
        setDialogOpen(null);
        setLeadForm({ contact_name: "", email: "", phone: "", status: "New", source: "Inbound Live Demo", notes: "" });
        loadCRMData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics calculations
  const totalLeads = leads.length;
  const activeCustomers = companies.length;
  const openDeals = opportunities.filter((o) => o.stage !== "won" && o.stage !== "lost").length;
  const pipelineValue = opportunities.reduce((acc, curr) => acc + curr.value, 0);
  const averageProbability = Math.round(
    opportunities.length > 0
      ? opportunities.reduce((acc, curr) => acc + curr.probability, 0) / opportunities.length
      : 0
  );

  // Filter lists
  const filteredCompanies = companies.filter((c) => {
    const matchesSearch = c.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = industryFilter === "all" || c.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  const filteredLeads = leads.filter((l) => {
    const matchesSearch = l.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Chart data formatting
  const funnelData = [
    { name: "1. Raw Leads", count: leads.length, val: leads.length * 10000, fill: "#4f46e5" },
    { name: "2. Prospecting", count: opportunities.filter(o => o.stage === "prospecting").length, val: opportunities.filter(o => o.stage === "prospecting").reduce((a,c) => a+c.value, 0), fill: "#6366f1" },
    { name: "3. Qualified Proposal", count: opportunities.filter(o => o.stage === "proposal").length, val: opportunities.filter(o => o.stage === "proposal").reduce((a,c) => a+c.value, 0), fill: "#8b5cf6" },
    { name: "4. In Negotiation", count: opportunities.filter(o => o.stage === "negotiation").length, val: opportunities.filter(o => o.stage === "negotiation").reduce((a,c) => a+c.value, 0), fill: "#ec4899" },
    { name: "5. Closed-Won", count: opportunities.filter(o => o.stage === "won").length, val: opportunities.filter(o => o.stage === "won").reduce((a,c) => a+c.value, 0), fill: "#10b981" }
  ];

  const industryPieData = companies.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.industry);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: curr.industry, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#06b6d4"];

  return (
    <div className="space-y-6">
      {/* Upper Module Heading and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-widest mb-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Autonomous Intelligence Suite</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Enterprise CRM Dashboard
          </h1>
          <p className="text-xs text-zinc-500 mt-1 max-w-xl font-medium">
            Manage high-intent leads, client organizations, and sales pipelines synchronized in real-time with Sophia AI Outbound Agents.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={loadCRMData} className="gap-2 text-zinc-300 font-mono text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Ledger</span>
          </Button>

          {activeSubTab === "contacts" && (
            <Button variant="primary" size="sm" onClick={() => setDialogOpen("contact")} className="gap-2 text-xs font-semibold">
              <Plus className="h-4 w-4" />
              <span>Register Contact</span>
            </Button>
          )}

          {activeSubTab === "opportunities" && (
            <Button variant="primary" size="sm" onClick={() => setDialogOpen("opportunity")} className="gap-2 text-xs font-semibold">
              <Plus className="h-4 w-4" />
              <span>Initiate Deal</span>
            </Button>
          )}

          {activeSubTab === "leads" && (
            <Button variant="primary" size="sm" onClick={() => setDialogOpen("lead")} className="gap-2 text-xs font-semibold">
              <Plus className="h-4 w-4" />
              <span>Add Raw Lead</span>
            </Button>
          )}

          {activeSubTab === "activities" && (
            <Button variant="primary" size="sm" onClick={() => setDialogOpen("activity")} className="gap-2 text-xs font-semibold">
              <Plus className="h-4 w-4" />
              <span>Log Interaction</span>
            </Button>
          )}
        </div>
      </div>

      {/* Dynamic Sub Tab Navigator */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800/30 pb-3 overflow-x-auto whitespace-nowrap">
        {[
          { id: "overview", label: "Operational Overview", icon: LayoutGrid },
          { id: "customers", label: "Client Directory", icon: Briefcase },
          { id: "leads", label: "Outbound Leads", icon: Users },
          { id: "contacts", label: "Key Personnel", icon: UserCheck },
          { id: "opportunities", label: "Pipeline Funnel", icon: TrendingUp },
          { id: "activities", label: "Interaction Ledger", icon: Activity },
          { id: "tasks", label: "AI Worker Tasks", icon: CheckSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setSearchQuery("");
                setStatusFilter("all");
                setIndustryFilter("all");
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                isActive
                  ? `${getAccentClass("text")} bg-indigo-950/20 border-indigo-500/20 shadow-sm`
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border-transparent"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Container Views with Staggered Animations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18 }}
          className="space-y-6"
        >
          {/* ======================================= */}
          {/* 1. OVERVIEW VIEW                         */}
          {/* ======================================= */}
          {activeSubTab === "overview" && (
            <div className="space-y-6">
              {/* Top Bento Stats Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: "Active Customers", value: activeCustomers, detail: "Client businesses", icon: Briefcase, color: "text-indigo-400", change: "+12% MoM" },
                  { label: "Outbound Leads", value: totalLeads, detail: "Sophia AI outreach", icon: Users, color: "text-emerald-400", change: "+45 this week" },
                  { label: "Active Pipelines", value: openDeals, detail: "Deals in negotiation", icon: TrendingUp, color: "text-violet-400", change: "80% confidence" },
                  { label: "Gross Pipeline Value", value: `$${(pipelineValue / 1000).toFixed(1)}k`, detail: "Active contract values", icon: BarChart2, color: "text-rose-400", change: "+$24,000 USD" },
                  { label: "Win Probability", value: `${averageProbability}%`, detail: "Averaged conversion likelihood", icon: Zap, color: "text-amber-400", change: "Stable high-intent" }
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={idx} className="p-5 flex flex-col justify-between hover:border-zinc-700/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-3xs font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</span>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <div className="mt-3">
                        <span className="text-xl font-black text-white font-mono">{stat.value}</span>
                        <div className="flex items-center justify-between mt-1 text-3xs font-medium">
                          <span className="text-zinc-500 truncate">{stat.detail}</span>
                          <span className={`${stat.color} font-bold font-mono`}>{stat.change}</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* CRM Charts Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <Card className="p-5 lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Pipeline Conversion Funnel
                      </h3>
                      <p className="text-3xs text-zinc-500">Gross deal value vs. process milestones</p>
                    </div>
                    <Badge variant="success">Real-Time Core Stream</Badge>
                  </div>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} />
                        <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px" }}
                          itemStyle={{ fontSize: "11px", color: "#e4e4e7" }}
                        />
                        <Bar dataKey="val" name="Gross Value ($)" radius={[4, 4, 0, 0]}>
                          {funnelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-5 lg:col-span-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Client Industry Concentration
                      </h3>
                      <p className="text-3xs text-zinc-500">Active market segments</p>
                    </div>
                  </div>
                  <div className="h-[200px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={industryPieData.length > 0 ? industryPieData : [{ name: "AI Tech", value: 10 }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {(industryPieData.length > 0 ? industryPieData : [{ name: "AI Tech", value: 10 }]).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {(industryPieData.length > 0 ? industryPieData : [{ name: "AI Tech", value: 10 }]).slice(0, 4).map((entry, index) => (
                      <div key={index} className="flex items-center gap-1.5 text-3xs text-zinc-400 font-medium truncate">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="truncate">{entry.name}</span>
                        <span className="text-zinc-600 font-mono">({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Inbound/Outbound Timeline and AI Suggestions Log */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                      <Activity className="h-4 w-4 text-indigo-400" />
                      <span>Recent Interaction Ledger</span>
                    </h3>
                    <button onClick={() => setActiveSubTab("activities")} className="text-3xs font-semibold text-indigo-400 hover:underline">
                      View Timeline
                    </button>
                  </div>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {activities.slice(0, 4).map((act, index) => (
                      <div key={index} className="flex gap-3 text-xs border-l border-zinc-800 pl-4 relative">
                        <span className="absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full bg-zinc-700 border border-zinc-950" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-200">{act.title}</span>
                            <span className="text-3xs text-zinc-500 font-mono">
                              {new Date(act.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-zinc-400 text-3xs leading-relaxed">{act.notes}</p>
                          <div className="flex items-center gap-2 text-3xs text-zinc-500 font-medium">
                            <span className="bg-zinc-800/60 px-1.5 py-0.5 rounded font-mono text-zinc-400 uppercase tracking-tight">
                              {act.type}
                            </span>
                            <span>•</span>
                            <span className="truncate">{act.customer_name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* AI Sales Agent Status & Sandbox Advice Box */}
                <Card className="p-5 space-y-4 bg-zinc-900/10 border-zinc-800/40 relative overflow-hidden">
                  <div className="absolute right-0 top-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-indigo-400" />
                      <span>Active Outbound AI Sales Agents</span>
                    </h3>
                  </div>

                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/40 border border-zinc-850">
                      <div className="flex items-center gap-3">
                        <span className="h-8 w-8 rounded bg-indigo-950/40 text-indigo-400 flex items-center justify-center font-bold text-sm">
                          S
                        </span>
                        <div>
                          <span className="text-xs font-bold text-zinc-200 block">Sophia AI (Sales Pro)</span>
                          <span className="text-3xs text-emerald-400 font-semibold flex items-center gap-1">
                            ● Executing Outbound campaign
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => triggerAISuggestion("Find highest scoring leads", "Sophia AI Campaign", { campaign_name: "Fortune 500 Outbound Launch" })} className="text-3xs px-2.5 font-semibold py-1">
                        Review Sandbox
                      </Button>
                    </div>

                    <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-3">
                      <span className="text-3xs font-bold text-zinc-500 uppercase tracking-widest block">AI CRM Director Sandbox</span>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Prompt our autonomous agent core to instantly scan lead data, optimize sales probability, or compile executive follow-ups.
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => triggerAISuggestion("Generate pipeline report and find weak deals", "Pipeline System", { opportunities })}
                          className="text-xs font-bold font-sans py-2"
                        >
                          Scan All Pipeline For Weak Deals
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* 2. CUSTOMERS VIEW                        */}
          {/* ======================================= */}
          {activeSubTab === "customers" && (
            <div className="space-y-5">
              {/* Filter Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/20 p-4 border border-zinc-800/40 rounded-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search client accounts by name, industry, or city..."
                    className="w-full bg-zinc-950 border border-zinc-850 pl-10 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 rounded-lg focus:outline-none focus:border-zinc-700 font-medium"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xs font-bold text-zinc-500 uppercase font-mono">Industry</span>
                    <select
                      value={industryFilter}
                      onChange={(e) => setIndustryFilter(e.target.value)}
                      className="bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 rounded-lg p-2 focus:outline-none font-medium"
                    >
                      <option value="all">All Industries</option>
                      <option value="Artificial Intelligence">AI Labs</option>
                      <option value="E-Commerce">E-Commerce</option>
                      <option value="Technology">General Tech</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Customers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCompanies.map((c) => (
                  <Card key={c.id} className="p-5 space-y-4 hover:border-zinc-700/60 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {c.logo ? (
                          <img src={c.logo} alt={c.company_name} className="h-10 w-10 rounded-lg object-cover border border-zinc-800" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-zinc-850 flex items-center justify-center font-bold text-zinc-300">
                            🏢
                          </div>
                        )}
                        <div>
                          <h3 className="text-sm font-extrabold text-white leading-none">
                            {c.company_name}
                          </h3>
                          <span className="text-3xs text-zinc-500 mt-1 block font-mono">
                            {c.legal_name}
                          </span>
                        </div>
                      </div>
                      <Badge variant="accent">{c.business_type}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-3xs text-zinc-400 font-medium pt-2 border-t border-zinc-850">
                      <div>
                        <span className="text-zinc-600 block uppercase font-bold">Industry</span>
                        <span>{c.industry}</span>
                      </div>
                      <div>
                        <span className="text-zinc-600 block uppercase font-bold">Tax Reference</span>
                        <span className="font-mono">{c.tax_number}</span>
                      </div>
                      <div>
                        <span className="text-zinc-600 block uppercase font-bold">Location</span>
                        <span>{c.city}, {c.country}</span>
                      </div>
                      <div>
                        <span className="text-zinc-600 block uppercase font-bold">Inbound Channel</span>
                        <span className="text-zinc-400 truncate block">{c.email}</span>
                      </div>
                    </div>

                    {/* AI & Interactive Controls */}
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-850/60 gap-3">
                      <div className="flex items-center gap-1.5 text-3xs text-zinc-500">
                        <Clock className="h-3.5 w-3.5 text-zinc-600" />
                        <span>Registered {new Date(c.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.open(c.website, "_blank")} className="text-3xs px-2.5 font-bold py-1">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>

                        <Button variant="primary" size="sm" onClick={() => triggerAISuggestion("Analyze Customer Strategic Potential", "Customer Account", c)} className="text-3xs gap-1 py-1 px-3">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>AI Strategy Profile</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* 3. LEADS VIEW                            */}
          {/* ======================================= */}
          {activeSubTab === "leads" && (
            <div className="space-y-5">
              {/* Lead Search/Filter Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/20 p-4 border border-zinc-800/40 rounded-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search raw lead entries..."
                    className="w-full bg-zinc-950 border border-zinc-850 pl-10 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xs font-bold text-zinc-500 uppercase font-mono">Status</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 rounded-lg p-2 focus:outline-none font-medium"
                    >
                      <option value="all">All Stages</option>
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Nurturing">Nurturing</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Lead rows list */}
              <div className="space-y-3.5">
                {filteredLeads.map((l) => (
                  <Card key={l.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-700/60 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-300 text-xs uppercase">
                        {l.contact_name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-white">{l.contact_name}</span>
                          <Badge variant={l.status === "New" ? "info" : l.status === "Contacted" ? "warning" : "success"}>
                            {l.status}
                          </Badge>
                        </div>
                        <p className="text-3xs text-zinc-500 mt-0.5 leading-relaxed font-medium">
                          Source: <span className="text-indigo-400 font-semibold">{l.source}</span> • Email: <span className="font-mono">{l.email}</span>
                        </p>
                      </div>
                    </div>

                    <div className="max-w-md md:text-right">
                      <p className="text-3xs text-zinc-400 leading-normal line-clamp-1 italic font-medium">
                        "{l.notes || "No outbound notes recorded"}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 md:justify-end">
                      <Button variant="outline" size="sm" onClick={() => triggerAISuggestion("Generate outbound follow up draft", "Lead Profile", l)} className="text-3xs gap-1 font-semibold py-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>AI Nurture Draft</span>
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => triggerAISuggestion("Predict Conversion Likelihood & Core Value Score", "Lead Qualification", l)}
                        className="text-3xs font-semibold py-1 px-3"
                      >
                        Qualify Score
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* 4. DIRECT CONTACTS VIEW                  */}
          {/* ======================================= */}
          {activeSubTab === "contacts" && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search personnel contact directory..."
                  className="w-full bg-zinc-950 border border-zinc-850 pl-10 pr-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 rounded-lg focus:outline-none"
                />
              </div>

              {/* Directory table */}
              <Card className="overflow-hidden border border-zinc-800/80">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-850 bg-zinc-950/40 text-zinc-500 font-bold uppercase tracking-wider font-mono">
                        <th className="p-4 text-3xs">Name</th>
                        <th className="p-4 text-3xs">Role</th>
                        <th className="p-4 text-3xs">Email</th>
                        <th className="p-4 text-3xs">Phone</th>
                        <th className="p-4 text-3xs">Last Touch</th>
                        <th className="p-4 text-3xs text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {filteredContacts.map((contact) => (
                        <tr key={contact.id} className="hover:bg-zinc-900/20 transition-colors">
                          <td className="p-4">
                            <span className="font-extrabold text-zinc-100">{contact.name}</span>
                          </td>
                          <td className="p-4">
                            <Badge variant="accent">{contact.role}</Badge>
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-zinc-400">{contact.email}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-zinc-400">{contact.phone || "-"}</span>
                          </td>
                          <td className="p-4 text-zinc-500 font-mono">
                            {contact.last_contacted}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => triggerAISuggestion("Review communications history & summarize context", "Key Personnel", contact)} className="text-3xs text-indigo-400 font-bold px-2.5 py-1">
                              AI History
                            </Button>
                            <button onClick={() => handleDeleteContact(contact.id)} className="text-zinc-600 hover:text-rose-400 transition-colors inline-block align-middle cursor-pointer">
                              <Trash2 className="h-4 w-4" />
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

          {/* ======================================= */}
          {/* 5. OPPORTUNITIES VIEW                    */}
          {/* ======================================= */}
          {activeSubTab === "opportunities" && (
            <div className="space-y-6">
              {/* Kanban Stage Pipeline Columns */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { stage: "prospecting", label: "Prospecting / Discovery", color: "border-t-indigo-500/80 bg-indigo-950/5" },
                  { stage: "proposal", label: "Proposal Submitted", color: "border-t-violet-500/80 bg-violet-950/5" },
                  { stage: "negotiation", label: "In Negotiation", color: "border-t-rose-500/80 bg-rose-950/5" },
                  { stage: "won", label: "Closed-Won Deal", color: "border-t-emerald-500/80 bg-emerald-950/5" },
                  { stage: "lost", label: "Lost Pipeline", color: "border-t-zinc-600 bg-zinc-900/5" }
                ].map((col) => {
                  const stageDeals = opportunities.filter((o) => o.stage === col.stage);
                  const stageSum = stageDeals.reduce((acc, curr) => acc + curr.value, 0);

                  return (
                    <div key={col.stage} className={`flex flex-col gap-3 p-3.5 rounded-xl border border-zinc-800/60 ${col.color}`}>
                      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                        <div>
                          <span className="text-3xs font-black text-zinc-400 uppercase font-mono tracking-widest block">
                            {col.label}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
                            {stageDeals.length} Deals • ${stageSum.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                        {stageDeals.map((opp) => (
                          <Card key={opp.id} className="p-3.5 space-y-3 hover:border-zinc-700/50 transition-colors shadow-sm bg-zinc-900/40">
                            <div>
                              <span className="text-2xs font-extrabold text-white block">{opp.name}</span>
                              <span className="text-3xs text-indigo-400 font-medium font-mono mt-0.5 block">{opp.company_name}</span>
                            </div>

                            <div className="flex items-center justify-between text-3xs pt-1">
                              <span className="font-mono font-bold text-zinc-200">${opp.value.toLocaleString()}</span>
                              <span className="bg-zinc-950 text-indigo-400 border border-zinc-800 rounded px-1 font-mono font-bold">{opp.probability}%</span>
                            </div>

                            <div className="flex items-center justify-between border-t border-zinc-850/60 pt-2 gap-2">
                              {col.stage === "prospecting" && (
                                <button onClick={() => handleUpdateOppStage(opp.id, "proposal", 60)} className="text-3xs text-zinc-400 hover:text-white flex items-center gap-0.5 font-bold cursor-pointer">
                                  <span>Submit Prop</span>
                                  <ChevronRight className="h-3 w-3" />
                                </button>
                              )}
                              {col.stage === "proposal" && (
                                <button onClick={() => handleUpdateOppStage(opp.id, "negotiation", 80)} className="text-3xs text-zinc-400 hover:text-white flex items-center gap-0.5 font-bold cursor-pointer">
                                  <span>Negotiate</span>
                                  <ChevronRight className="h-3 w-3" />
                                </button>
                              )}
                              {col.stage === "negotiation" && (
                                <div className="flex gap-2">
                                  <button onClick={() => handleUpdateOppStage(opp.id, "won", 100)} className="text-3xs text-emerald-400 font-bold cursor-pointer">
                                    Win
                                  </button>
                                  <button onClick={() => handleUpdateOppStage(opp.id, "lost", 0)} className="text-3xs text-rose-400 font-bold cursor-pointer">
                                    Lose
                                  </button>
                                </div>
                              )}
                              {col.stage === "won" && (
                                <span className="text-3xs text-emerald-400 font-bold flex items-center gap-0.5">
                                  <Check className="h-3 w-3" /> Secured
                                </span>
                              )}
                              {col.stage === "lost" && (
                                <span className="text-3xs text-zinc-500 font-bold">Retired</span>
                              )}

                              <div className="flex gap-1.5">
                                <button onClick={() => triggerAISuggestion("Analyze Deal Pipeline Health & Strategic Next Action", "Deal Opportunity", opp)} className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer inline-block align-middle">
                                  <Sparkles className="h-3 w-3" />
                                </button>
                                <button onClick={() => handleDeleteOpp(opp.id)} className="text-zinc-600 hover:text-rose-400 cursor-pointer inline-block align-middle">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* 6. ACTIVITIES LEDGER VIEW                */}
          {/* ======================================= */}
          {activeSubTab === "activities" && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="border-l-2 border-indigo-500 pl-4 space-y-6 py-2">
                {activities.map((act) => (
                  <Card key={act.id} className="p-4 space-y-3 hover:border-zinc-700/50 transition-all bg-zinc-900/30">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="h-7 w-7 rounded bg-zinc-800 flex items-center justify-center border border-zinc-750">
                          {act.type === "call" ? "📞" : act.type === "meeting" ? "👥" : act.type === "email" ? "✉️" : "📝"}
                        </span>
                        <div>
                          <h4 className="text-sm font-extrabold text-zinc-100">{act.title}</h4>
                          <span className="text-3xs text-zinc-500 font-mono block mt-0.5">
                            {new Date(act.date).toUTCString()} {act.duration ? `• Duration: ${act.duration}` : ""}
                          </span>
                        </div>
                      </div>
                      <Badge variant="neutral">{act.type}</Badge>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/40 p-3 rounded border border-zinc-850/60 font-medium">
                      {act.notes}
                    </p>

                    <div className="flex items-center justify-between border-t border-zinc-850/60 pt-2 text-3xs text-zinc-500">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-zinc-400">Recipient Account:</span>
                        <span className="text-zinc-400">{act.customer_name}</span>
                        {act.contact_email && <span className="font-mono text-zinc-600">({act.contact_email})</span>}
                      </div>

                      <Button variant="ghost" size="sm" onClick={() => triggerAISuggestion("Deconstruct communications outcome & draft response proposal", "Logged Interaction Activity", act)} className="text-3xs text-indigo-400 font-bold px-2 py-1 gap-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>AI Response Draft</span>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* 7. AI WORKER TASKS VIEW                  */}
          {/* ======================================= */}
          {activeSubTab === "tasks" && (
            <div className="space-y-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter active tasks by title or assignee..."
                  className="w-full bg-zinc-950 border border-zinc-850 pl-10 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks
                  .filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.assigned_to.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((task) => (
                    <Card key={task.id} className="p-4 flex flex-col justify-between h-36 hover:border-zinc-700/60 transition-colors">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-2xs font-extrabold text-zinc-100 line-clamp-1">{task.title}</span>
                          <Badge variant={task.priority === "High" ? "error" : "warning"}>
                            {task.priority}
                          </Badge>
                        </div>
                        <span className="text-3xs text-zinc-500 font-semibold block mt-1">
                          Due Date: {task.due_date}
                        </span>
                      </div>

                      <div className="border-t border-zinc-850/60 pt-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-3xs font-medium text-zinc-400">
                          <UserCheck className="h-3.5 w-3.5 text-indigo-400" />
                          <span>{task.assigned_to}</span>
                        </div>
                        <Badge variant="success">{task.status}</Badge>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Floating Side Drawer for AI suggestions */}
      <AnimatePresence>
        {aiDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAiDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide over block */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-lg bg-zinc-950 border-l border-zinc-800/80 shadow-2xl flex flex-col h-full z-10"
            >
              {/* Header */}
              <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded bg-indigo-950/60 flex items-center justify-center">
                    🔮
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                      Autonomous Intelligence
                    </h3>
                    <span className="text-[10px] text-zinc-500 font-semibold">Exshopi Agent Director Core</span>
                  </div>
                </div>
                <button
                  onClick={() => setAiDrawerOpen(false)}
                  className="rounded p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {aiLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                    <span className="text-xs text-zinc-500 font-mono uppercase tracking-widest font-bold">
                      Querying AI Pipeline...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Active target details banner */}
                    {aiTargetEntity && (
                      <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-lg text-3xs font-medium space-y-1">
                        <span className="text-zinc-500 block uppercase font-bold">Target Context</span>
                        <span className="text-zinc-200 block text-2xs font-extrabold">
                          {aiTargetEntity.data?.contact_name || aiTargetEntity.data?.company_name || aiTargetEntity.data?.name || "Pipeline Context"}
                        </span>
                        <span className="text-zinc-600 block">{aiTargetEntity.data?.email || aiTargetEntity.data?.website || "API Sync"}</span>
                      </div>
                    )}

                    <div className="text-xs text-zinc-300 leading-relaxed font-medium bg-zinc-900/30 border border-zinc-850/60 rounded-xl p-5 shadow-inner">
                      {/* Formatted output with fallback styling */}
                      <div className="whitespace-pre-line prose prose-invert max-w-none text-zinc-300">
                        {aiSuggestion}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer controls */}
              {!aiLoading && aiSuggestion && (
                <div className="p-4 border-t border-zinc-800 bg-zinc-900/20 flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 font-bold"
                    onClick={() => {
                      navigator.clipboard.writeText(aiSuggestion);
                      addNotification({
                        title: "Copied Outreach Template",
                        description: "AI communication outline added to clipboard",
                        type: "success"
                      });
                    }}
                  >
                    <Clipboard className="h-4 w-4" />
                    <span>Copy Draft to Clipboard</span>
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 gap-2 font-bold"
                    onClick={() => {
                      addNotification({
                        title: "AI Campaign Queued",
                        description: "Sales follow-up dispatch verified and locked",
                        type: "success"
                      });
                      setAiDrawerOpen(false);
                    }}
                  >
                    <Send className="h-4 w-4" />
                    <span>Automate Outreach</span>
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================= */}
      {/* DIALOGS / MODALS FOR ADDING CRM ENTITIES */}
      {/* ======================================= */}

      {/* 1. Register Contact Modal */}
      <Dialog isOpen={dialogOpen === "contact"} onClose={() => setDialogOpen(null)} title="Register Key Personnel">
        <form onSubmit={handleAddContact} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={contactForm.name}
            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
            placeholder="Johnathan Vance"
          />
          <Input
            label="Corporate Role"
            value={contactForm.role}
            onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
            placeholder="VP of Outbound Logistics"
          />
          <Input
            label="Email Address"
            required
            type="email"
            value={contactForm.email}
            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
            placeholder="j.vance@company.com"
          />
          <Input
            label="Phone Number"
            value={contactForm.phone}
            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
            placeholder="+1-555-0100"
          />
          <Select
            label="Belongs to Client Account"
            value={contactForm.company_id}
            onChange={(e) => setContactForm({ ...contactForm, company_id: e.target.value })}
            options={companies.map((c) => ({ value: c.id, label: c.company_name }))}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setDialogOpen(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Contact
            </Button>
          </div>
        </form>
      </Dialog>

      {/* 2. Create Opportunity Modal */}
      <Dialog isOpen={dialogOpen === "opportunity"} onClose={() => setDialogOpen(null)} title="Initiate Pipeline Deal">
        <form onSubmit={handleAddOpp} className="space-y-4">
          <Input
            label="Deal / Opportunity Name"
            required
            value={oppForm.name}
            onChange={(e) => setOppForm({ ...oppForm, name: e.target.value })}
            placeholder="API Integration Tier-3 SLA"
          />
          <Input
            label="Target Business Name"
            required
            value={oppForm.company_name}
            onChange={(e) => setOppForm({ ...oppForm, company_name: e.target.value })}
            placeholder="Apex Logistics Labs"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Estimated Deal Value ($)"
              type="number"
              value={oppForm.value}
              onChange={(e) => setOppForm({ ...oppForm, value: e.target.value })}
              placeholder="45000"
            />
            <Input
              label="Probability (%)"
              type="number"
              value={oppForm.probability}
              onChange={(e) => setOppForm({ ...oppForm, probability: e.target.value })}
              placeholder="20"
            />
          </div>
          <Input
            label="Expected Close Date"
            type="date"
            value={oppForm.expected_close_date}
            onChange={(e) => setOppForm({ ...oppForm, expected_close_date: e.target.value })}
          />
          <Textarea
            label="Strategic Deal Notes"
            value={oppForm.notes}
            onChange={(e) => setOppForm({ ...oppForm, notes: e.target.value })}
            placeholder="Customer evaluating pricing tier and automated payout mechanics..."
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setDialogOpen(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Initialize Deal
            </Button>
          </div>
        </form>
      </Dialog>

      {/* 3. Log Interaction Modal */}
      <Dialog isOpen={dialogOpen === "activity"} onClose={() => setDialogOpen(null)} title="Log Customer Interaction">
        <form onSubmit={handleAddActivity} className="space-y-4">
          <Select
            label="Interaction Medium"
            value={activityForm.type}
            onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value as any })}
            options={[
              { value: "call", label: "Discovery Call" },
              { value: "meeting", label: "Live Demo Meeting" },
              { value: "email", label: "Outbound Email Thread" },
              { value: "note", label: "System Core Note" }
            ]}
          />
          <Input
            label="Activity Summary Title"
            required
            value={activityForm.title}
            onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
            placeholder="Presented platform API and billing workflow"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration"
              value={activityForm.duration}
              onChange={(e) => setActivityForm({ ...activityForm, duration: e.target.value })}
              placeholder="30m"
            />
            <Input
              label="Contact Email"
              value={activityForm.contact_email}
              onChange={(e) => setActivityForm({ ...activityForm, contact_email: e.target.value })}
              placeholder="m.vance@corp.com"
            />
          </div>
          <Input
            label="Target Client Account"
            value={activityForm.customer_name}
            onChange={(e) => setActivityForm({ ...activityForm, customer_name: e.target.value })}
            placeholder="Exshopi AI Labs"
          />
          <Textarea
            label="Detailed Interaction Logs"
            value={activityForm.notes}
            onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
            placeholder="Discussed pricing limits, custom routing SLAs, and payment ledger integrations..."
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setDialogOpen(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Log Activity
            </Button>
          </div>
        </form>
      </Dialog>

      {/* 4. Add Lead Modal */}
      <Dialog isOpen={dialogOpen === "lead"} onClose={() => setDialogOpen(null)} title="Track Raw Pipeline Lead">
        <form onSubmit={handleAddLead} className="space-y-4">
          <Input
            label="Contact Full Name"
            required
            value={leadForm.contact_name}
            onChange={(e) => setLeadForm({ ...leadForm, contact_name: e.target.value })}
            placeholder="Eleanor Vance"
          />
          <Input
            label="Corporate Email"
            required
            type="email"
            value={leadForm.email}
            onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
            placeholder="e.vance@company.com"
          />
          <Input
            label="Phone Number"
            value={leadForm.phone}
            onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
            placeholder="+1-555-0155"
          />
          <Input
            label="Outreach Source"
            value={leadForm.source}
            onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
            placeholder="LinkedIn Outreach Blast"
          />
          <Textarea
            label="Lead Context & Notes"
            value={leadForm.notes}
            onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
            placeholder="Interested in automating outbound sales campaigns and integrating custom payment models..."
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setDialogOpen(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Register Lead
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
