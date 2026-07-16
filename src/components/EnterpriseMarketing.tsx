import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Megaphone, Search, Filter, Plus, ChevronRight, Mail, 
  MessageCircle, Bell, BarChart2, Users, Play, Pause, 
  Trash2, Sparkles, Send, RefreshCw, Layers, CheckCircle, 
  PlusCircle, Sliders, DollarSign, Calendar, TrendingUp, AlertCircle, ArrowLeft
} from "lucide-react";
import { Button, Card, Input, Textarea, Select, Badge, Dialog, Switch } from "./UI";

interface Campaign {
  id: number;
  name: string;
  subjectLine: string;
  status: string;
  type: string;
  budget: number;
  sentCount: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  revenue: number;
  scheduledAt: string;
  bodyContent: string;
  segmentId: number;
  abTest: {
    subjectA: string;
    subjectB: string;
    clicksA: number;
    clicksB: number;
    opensA: number;
    opensB: number;
    winner: string | null;
  } | null;
}

interface Segment {
  id: number;
  name: string;
  type: string;
  memberCount: number;
  filters: string;
  tags: string[];
}

interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  config: any;
}

interface Workflow {
  id: number;
  name: string;
  status: string;
  nodes: WorkflowNode[];
}

export default function EnterpriseMarketing() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "campaigns" | "audience" | "automation" | "ai">("dashboard");

  // Dashboard state
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Campaigns state
  const [campaignsList, setCampaignsList] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create Campaign State
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
  const [newCampName, setNewCampName] = useState("");
  const [newCampSubject, setNewCampSubject] = useState("");
  const [newCampType, setNewCampType] = useState("email");
  const [newCampBudget, setNewCampBudget] = useState("1000");
  const [newCampContent, setNewCampContent] = useState("");
  const [newCampSegment, setNewCampSegment] = useState("1");
  const [newCampSched, setNewCampSched] = useState("");
  const [enableAbTest, setEnableAbTest] = useState(false);
  const [abSubjectB, setAbSubjectB] = useState("");

  // Audience State
  const [segmentsList, setSegmentsList] = useState<Segment[]>([]);
  const [segmentsLoading, setSegmentsLoading] = useState(true);
  const [createSegmentOpen, setCreateSegmentOpen] = useState(false);
  const [newSegName, setNewSegName] = useState("");
  const [newSegType, setNewSegType] = useState("dynamic");
  const [newSegFilters, setNewSegFilters] = useState("");
  const [newSegTags, setNewSegTags] = useState("");

  // Automation State
  const [workflowsList, setWorkflowsList] = useState<Workflow[]>([]);
  const [workflowsLoading, setWorkflowsLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [newWorkflowOpen, setNewWorkflowOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");

  // AI Assistant panel states
  const [aiProductDesc, setAiProductDesc] = useState("");
  const [aiCampaignBudget, setAiCampaignBudget] = useState("5000");
  const [aiAction, setAiAction] = useState<"generate_copy" | "suggest_subject" | "suggest_audience" | "predict_roi">("generate_copy");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  // Load metrics
  const fetchDashboardMetrics = async () => {
    try {
      setDashboardLoading(true);
      const res = await fetch("/api/v1/marketing/dashboard");
      const json = await res.json();
      if (json.success) {
        setDashboardMetrics(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDashboardLoading(false);
    }
  };

  // Load campaigns
  const fetchCampaigns = async () => {
    try {
      setCampaignsLoading(true);
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`/api/v1/marketing/campaigns?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setCampaignsList(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCampaignsLoading(false);
    }
  };

  // Load Audience
  const fetchSegments = async () => {
    try {
      setSegmentsLoading(true);
      const res = await fetch("/api/v1/marketing/segments");
      const json = await res.json();
      if (json.success) {
        setSegmentsList(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSegmentsLoading(false);
    }
  };

  // Load Workflows
  const fetchWorkflows = async () => {
    try {
      setWorkflowsLoading(true);
      const res = await fetch("/api/v1/marketing/workflows");
      const json = await res.json();
      if (json.success) {
        setWorkflowsList(json.data);
        if (json.data.length > 0 && !selectedWorkflow) {
          setSelectedWorkflow(json.data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWorkflowsLoading(false);
    }
  };

  // Sync fetches to tabs
  useEffect(() => {
    if (activeTab === "dashboard") fetchDashboardMetrics();
    if (activeTab === "campaigns") fetchCampaigns();
    if (activeTab === "audience") fetchSegments();
    if (activeTab === "automation") fetchWorkflows();
  }, [activeTab]);

  // Campaign filter re-trigger
  useEffect(() => {
    if (activeTab === "campaigns") {
      fetchCampaigns();
    }
  }, [typeFilter, statusFilter]);

  // Create Campaign submit
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCampName,
          subjectLine: newCampSubject,
          type: newCampType,
          budget: parseFloat(newCampBudget),
          bodyContent: newCampContent,
          segmentId: parseInt(newCampSegment),
          scheduledAt: newCampSched || undefined,
          abTestConfig: enableAbTest ? { subjectB: abSubjectB } : null
        })
      });
      const json = await res.json();
      if (json.success) {
        setCreateCampaignOpen(false);
        // Reset
        setNewCampName("");
        setNewCampSubject("");
        setNewCampContent("");
        setEnableAbTest(false);
        setAbSubjectB("");
        fetchCampaigns();
        fetchDashboardMetrics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = async (campaignId: number) => {
    if (!confirm("Are you sure you want to delete this marketing campaign?")) return;
    try {
      const res = await fetch(`/api/v1/marketing/campaigns/${campaignId}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        setSelectedCampaign(null);
        fetchCampaigns();
        fetchDashboardMetrics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Segment submit
  const handleCreateSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/marketing/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSegName,
          type: newSegType,
          filters: newSegFilters,
          tags: newSegTags
        })
      });
      const json = await res.json();
      if (json.success) {
        setCreateSegmentOpen(false);
        setNewSegName("");
        setNewSegFilters("");
        setNewSegTags("");
        fetchSegments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Workflow submit
  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/marketing/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newWorkflowName,
          nodes: [
            { id: "1", type: "trigger", label: "Campaign Joined / Opt-In", config: {} },
            { id: "2", type: "action", label: "Send Automated Welcome Push", config: {} }
          ]
        })
      });
      const json = await res.json();
      if (json.success) {
        setNewWorkflowOpen(false);
        setNewWorkflowName("");
        fetchWorkflows();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Workflow status
  const handleToggleWorkflow = async (wfId: number) => {
    try {
      const res = await fetch(`/api/v1/marketing/workflows/${wfId}/toggle`, {
        method: "POST"
      });
      const json = await res.json();
      if (json.success) {
        setWorkflowsList(prev => prev.map(w => w.id === wfId ? json.data : w));
        if (selectedWorkflow?.id === wfId) {
          setSelectedWorkflow(json.data);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // AI Assistant triggers
  const handleAIRequest = async () => {
    if (!aiProductDesc.trim()) return;
    try {
      setAiLoading(true);
      setAiResult(null);

      const res = await fetch("/api/v1/marketing/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: aiAction,
          description: aiProductDesc,
          budget: parseFloat(aiCampaignBudget),
          targetProduct: "Exshopi Autonomous Agents",
          segmentName: "Enterprise SaaS decision makers"
        })
      });
      const json = await res.json();
      if (json.success) {
        setAiResult(json.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-zinc-900 gap-4 bg-zinc-900/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-950/40 border border-indigo-900/30 rounded-lg text-indigo-400">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Enterprise Marketing & Outreach</h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">Campaign Orchestration & Conversions Portal</p>
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
            onClick={() => setActiveTab("campaigns")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "campaigns" ? "bg-indigo-600 text-white shadow-md" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab("audience")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "audience" ? "bg-indigo-600 text-white shadow-md" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Audiences
          </button>
          <button
            onClick={() => setActiveTab("automation")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "automation" ? "bg-indigo-600 text-white shadow-md" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Automation
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "ai" ? "bg-indigo-600 text-white shadow-md" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            AI Copywriter
          </button>
        </div>
      </div>

      {/* Main workspace container */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-6">
            {dashboardLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-28 bg-zinc-900 border border-zinc-800 rounded-xl" />
                ))}
              </div>
            ) : dashboardMetrics ? (
              <>
                {/* Metric Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-2xs font-mono text-zinc-500 uppercase tracking-wider">Growth Revenue</p>
                      <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">${dashboardMetrics.totalRevenue.toLocaleString()}</h3>
                      <p className="text-2xs text-zinc-400 mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-emerald-400" /> Derived from dynamic leads
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-emerald-950/40 border border-emerald-900/30 flex items-center justify-center text-emerald-400">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </Card>

                  <Card className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-2xs font-mono text-zinc-500 uppercase tracking-wider">Calculated ROI</p>
                      <h3 className="text-3xl font-extrabold text-white mt-1">{dashboardMetrics.roi}</h3>
                      <p className="text-2xs text-indigo-400 font-semibold mt-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> High Yield Outreach
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center text-indigo-400">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </Card>

                  <Card className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-2xs font-mono text-zinc-500 uppercase tracking-wider">Average Open Rate</p>
                      <h3 className="text-3xl font-extrabold text-white mt-1">{dashboardMetrics.avgOpenRate}%</h3>
                      <p className="text-2xs text-blue-400 font-semibold mt-1">
                        Click-through: {dashboardMetrics.avgClickRate}%
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-blue-950/40 border border-blue-900/30 flex items-center justify-center text-blue-400">
                      <Mail className="h-5 w-5" />
                    </div>
                  </Card>

                  <Card className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-2xs font-mono text-zinc-500 uppercase tracking-wider">Outreach Reach</p>
                      <h3 className="text-3xl font-extrabold text-white mt-1">{(dashboardMetrics.totalSent).toLocaleString()}</h3>
                      <p className="text-2xs text-zinc-400 mt-1">
                        Conversion: {dashboardMetrics.avgConversionRate}%
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                      <Users className="h-5 w-5" />
                    </div>
                  </Card>
                </div>

                {/* AI Marketing Brief */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-xl border border-indigo-500/20 bg-indigo-950/10 flex flex-col md:flex-row gap-4 items-start md:items-center text-left"
                >
                  <div className="p-2 bg-indigo-950 border border-indigo-500/30 text-indigo-400 rounded-lg shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white font-mono">AI Marketing Copilot - Outreach Analytics Brief</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{dashboardMetrics.aiSummary}</p>
                  </div>
                </motion.div>

                {/* Growth visual charts / tables mapping */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Audience growth trends */}
                  <Card className="p-5 text-left">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 mb-4 font-mono">
                      <Users className="h-4 w-4" /> Audience Database Growth
                    </h3>
                    <div className="space-y-3">
                      {dashboardMetrics.audienceGrowth.map((g: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-900 rounded-xl">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-zinc-400 w-8">{g.month}</span>
                            <span className="text-xs font-mono text-zinc-200">{(g.count).toLocaleString()} subscribers</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-400">+{g.growth}% MoM</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Campaign Funnel performance breakdown */}
                  <Card className="p-5 text-left flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 mb-4 font-mono">
                        <BarChart2 className="h-4 w-4" /> B2B Funnel Performance Yields
                      </h3>
                      <div className="space-y-4 pt-2">
                        <div>
                          <div className="flex justify-between text-xs font-mono mb-1">
                            <span>1. Sent / Delivered</span>
                            <span>100% ({(dashboardMetrics.totalSent).toLocaleString()})</span>
                          </div>
                          <div className="h-2 bg-zinc-950 rounded-full overflow-hidden">
                            <div className="bg-zinc-600 h-2 rounded-full" style={{ width: "100%" }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-mono mb-1">
                            <span>2. Recipient Open Rate</span>
                            <span>{dashboardMetrics.avgOpenRate}%</span>
                          </div>
                          <div className="h-2 bg-zinc-950 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${dashboardMetrics.avgOpenRate}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-mono mb-1">
                            <span>3. Link Click-Through (CTR)</span>
                            <span>{dashboardMetrics.avgClickRate}%</span>
                          </div>
                          <div className="h-2 bg-zinc-950 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${dashboardMetrics.avgClickRate * 2}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-mono mb-1">
                            <span>4. CRM Conversion to Deal</span>
                            <span>{dashboardMetrics.avgConversionRate}%</span>
                          </div>
                          <div className="h-2 bg-zinc-950 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${dashboardMetrics.avgConversionRate * 10}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* TAB 2: CAMPAIGNS */}
        {activeTab === "campaigns" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
            
            {/* Left side: Campaigns list */}
            <div className={`lg:col-span-5 flex flex-col gap-4 ${selectedCampaign ? "hidden lg:flex" : ""}`}>
              <Card className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">Campaign Manager</h3>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    icon={<Plus className="h-3 w-3" />}
                    onClick={() => setCreateCampaignOpen(true)}
                  >
                    New Campaign
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    options={[
                      { value: "all", label: "All Types" },
                      { value: "email", label: "Email" },
                      { value: "sms", label: "SMS" },
                      { value: "whatsapp", label: "WhatsApp" },
                      { value: "push", label: "Push Notification" }
                    ]}
                  />
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                      { value: "all", label: "All Statuses" },
                      { value: "draft", label: "Draft" },
                      { value: "scheduled", label: "Scheduled" },
                      { value: "running", label: "Running" },
                      { value: "completed", label: "Completed" }
                    ]}
                  />
                </div>
              </Card>

              {/* List */}
              <div className="flex flex-col gap-3 max-h-[550px] overflow-y-auto pr-1">
                {campaignsLoading ? (
                  [1, 2].map((i) => (
                    <div key={i} className="h-24 bg-zinc-900 border border-zinc-800 animate-pulse rounded-xl" />
                  ))
                ) : campaignsList.length === 0 ? (
                  <div className="text-center p-12 border border-zinc-850 rounded-xl bg-zinc-900/40 text-zinc-500">
                    <Megaphone className="h-10 w-10 mx-auto opacity-35 mb-2" />
                    <p className="text-xs font-mono">No Campaigns Configured</p>
                  </div>
                ) : (
                  campaignsList.map((camp) => {
                    const isSelected = selectedCampaign?.id === camp.id;
                    return (
                      <div
                        key={camp.id}
                        onClick={() => setSelectedCampaign(camp)}
                        className={`p-4 border transition-all rounded-xl cursor-pointer text-left ${
                          isSelected 
                            ? "bg-indigo-950/20 border-indigo-500/80 shadow-md" 
                            : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-2xs font-mono text-zinc-500">#{camp.id}</span>
                          <div className="flex gap-1.5 shrink-0">
                            <Badge variant="neutral">{camp.type}</Badge>
                            <Badge variant={
                              camp.status === "completed" ? "success" : 
                              camp.status === "running" ? "accent" : 
                              camp.status === "scheduled" ? "warning" : "neutral"
                            }>
                              {camp.status}
                            </Badge>
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-white mt-1.5 truncate">{camp.name}</h4>
                        <p className="text-2xs text-zinc-400 font-mono mt-1">Subject: "{camp.subjectLine}"</p>

                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-950 text-2xs text-zinc-500 font-mono">
                          <span>Budget: ${camp.budget}</span>
                          {camp.sentCount > 0 && <span>Sent: {camp.sentCount.toLocaleString()}</span>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right side: Detailed analytics and message preview */}
            <div className={`lg:col-span-7 flex flex-col gap-4 ${!selectedCampaign ? "hidden lg:flex" : ""}`}>
              {selectedCampaign ? (
                <div className="flex flex-col gap-4 text-left">
                  {/* Back on Mobile */}
                  <Button 
                    className="self-start lg:hidden mb-1" 
                    variant="ghost" 
                    size="sm" 
                    icon={<ArrowLeft className="h-4 w-4" />}
                    onClick={() => setSelectedCampaign(null)}
                  >
                    Back to Campaigns
                  </Button>

                  <Card className="p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="accent">{selectedCampaign.type.toUpperCase()}</Badge>
                          <span className="text-2xs text-zinc-500 font-mono">ID #{selectedCampaign.id}</span>
                        </div>
                        <h2 className="text-lg font-bold text-white mt-1.5">{selectedCampaign.name}</h2>
                        <p className="text-xs text-zinc-400 mt-1 font-mono">Subject: "{selectedCampaign.subjectLine}"</p>
                      </div>

                      <Button 
                        variant="danger" 
                        size="sm" 
                        icon={<Trash2 className="h-3.5 w-3.5" />}
                        onClick={() => handleDeleteCampaign(selectedCampaign.id)}
                      >
                        Delete Campaign
                      </Button>
                    </div>

                    {/* Funnel Metrics Grid */}
                    {selectedCampaign.sentCount > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950 p-4 border border-zinc-900 rounded-xl font-mono text-center">
                        <div>
                          <p className="text-4xs text-zinc-500 uppercase tracking-wider">Delivered</p>
                          <p className="text-sm font-extrabold text-white mt-1">{selectedCampaign.sentCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-4xs text-zinc-500 uppercase tracking-wider">Open Rate</p>
                          <p className="text-sm font-extrabold text-indigo-400 mt-1">{selectedCampaign.openRate}%</p>
                        </div>
                        <div>
                          <p className="text-4xs text-zinc-500 uppercase tracking-wider">Click Rate</p>
                          <p className="text-sm font-extrabold text-blue-400 mt-1">{selectedCampaign.clickRate}%</p>
                        </div>
                        <div>
                          <p className="text-4xs text-zinc-500 uppercase tracking-wider">Revenue Gained</p>
                          <p className="text-sm font-extrabold text-emerald-400 mt-1">${selectedCampaign.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    )}

                    {/* A/B Test Variant indicators */}
                    {selectedCampaign.abTest && (
                      <div className="p-4 rounded-xl border border-indigo-500/10 bg-indigo-950/5">
                        <div className="flex items-center gap-1 text-indigo-400 font-bold text-xs font-mono mb-3">
                          <Sliders className="h-3.5 w-3.5" />
                          <span>ACTIVE A/B SUBJECT TEST REPORT</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900">
                            <span className="text-4xs font-bold text-zinc-500 block">VARIANT A (Winner)</span>
                            <p className="text-white mt-1.5 italic">"{selectedCampaign.abTest.subjectA}"</p>
                            <div className="flex justify-between text-3xs text-zinc-400 mt-3 border-t border-zinc-900 pt-2">
                              <span>Opens: {selectedCampaign.abTest.opensA}</span>
                              <span>Clicks: {selectedCampaign.abTest.clicksA}</span>
                            </div>
                          </div>

                          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900">
                            <span className="text-4xs font-bold text-zinc-500 block">VARIANT B</span>
                            <p className="text-white mt-1.5 italic">"{selectedCampaign.abTest.subjectB}"</p>
                            <div className="flex justify-between text-3xs text-zinc-400 mt-3 border-t border-zinc-900 pt-2">
                              <span>Opens: {selectedCampaign.abTest.opensB}</span>
                              <span>Clicks: {selectedCampaign.abTest.clicksB}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Campaign Body Editor Preview */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-2xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Message / Outreach Copy Preview</label>
                      <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">
                        {selectedCampaign.bodyContent}
                      </div>
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="hidden lg:flex flex-col items-center justify-center h-[500px] border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10 text-zinc-500 text-center p-12">
                  <Megaphone className="h-12 w-12 opacity-30 mb-3" />
                  <h3 className="text-sm font-bold text-zinc-400 font-mono">Marketing Campaign Console</h3>
                  <p className="text-xs text-zinc-500 mt-1">Select an active B2B campaign to view delivery details, open rates, A/B winner analyses, or edit scheduled parameters.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: AUDIENCES */}
        {activeTab === "audience" && (
          <div className="flex flex-col gap-6">
            <Card className="p-4 flex justify-between items-center text-left">
              <div>
                <h3 className="text-sm font-bold text-white">Target Audiences & Segments</h3>
                <p className="text-2xs text-zinc-400 font-mono mt-0.5">Define CRM queries for autonomous campaign targets</p>
              </div>
              <Button 
                variant="primary" 
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setCreateSegmentOpen(true)}
              >
                Create Segment
              </Button>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {segmentsLoading ? (
                <div className="h-40 bg-zinc-900 border border-zinc-800 animate-pulse rounded-xl" />
              ) : (
                segmentsList.map((seg) => (
                  <Card key={seg.id} className="p-5 flex flex-col justify-between text-left border border-zinc-800 hover:border-zinc-700 transition-all h-full">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-4xs font-mono uppercase tracking-wider bg-zinc-950 px-2 py-0.5 border border-zinc-900 rounded text-zinc-400">{seg.type}</span>
                        <span className="text-2xs font-bold text-white">{seg.memberCount.toLocaleString()} members</span>
                      </div>

                      <h4 className="text-sm font-bold text-white mb-2">{seg.name}</h4>
                      
                      {seg.filters && (
                        <div className="p-2.5 bg-zinc-950 border border-zinc-900 rounded-lg text-3xs font-mono text-zinc-400 mb-4 truncate">
                          Filter: <span className="text-indigo-400 font-bold">{seg.filters}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1.5 pt-3 border-t border-zinc-950 overflow-hidden shrink-0">
                      {seg.tags.map((t, idx) => (
                        <Badge key={idx} variant="neutral" className="text-4xs py-0">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: AUTOMATION */}
        {activeTab === "automation" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-[550px]">
            {/* Workflows Left */}
            <Card className="lg:col-span-4 p-4 flex flex-col gap-4 overflow-y-auto">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                  <Layers className="h-4 w-4" /> Workflow Triggers
                </h3>
                <Button 
                  size="sm" 
                  variant="outline" 
                  icon={<Plus className="h-3 w-3" />}
                  onClick={() => setNewWorkflowOpen(true)}
                />
              </div>

              {workflowsLoading ? (
                <div className="h-20 bg-zinc-900 rounded-xl animate-pulse" />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {workflowsList.map((wf) => (
                    <div
                      key={wf.id}
                      onClick={() => setSelectedWorkflow(wf)}
                      className={`p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                        selectedWorkflow?.id === wf.id 
                          ? "bg-indigo-950/25 border-indigo-500/80 shadow" 
                          : "bg-zinc-950 border-zinc-900 hover:border-zinc-800"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">{wf.name}</span>
                        <Badge variant={wf.status === "active" ? "success" : "neutral"}>
                          {wf.status}
                        </Badge>
                      </div>
                      <p className="text-3xs font-mono text-zinc-500 mt-1">{wf.nodes.length} Automation Steps</p>

                      <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-zinc-900">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-3xs py-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleWorkflow(wf.id);
                          }}
                        >
                          {wf.status === "active" ? "Pause" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Workflow Step Canvas Right */}
            <Card className="lg:col-span-8 p-6 flex flex-col justify-between items-stretch">
              {selectedWorkflow ? (
                <div className="flex flex-col h-full text-left justify-between items-stretch">
                  <div>
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-5">
                      <div>
                        <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">{selectedWorkflow.name}</h4>
                        <span className="text-3xs text-zinc-500 font-mono">Interactive Node Canvas Sequence</span>
                      </div>
                      <Badge variant={selectedWorkflow.status === "active" ? "success" : "neutral"}>
                        Status: {selectedWorkflow.status.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Nodes Step Sequence */}
                    <div className="flex flex-col items-center gap-4 py-4 max-h-[350px] overflow-y-auto">
                      {selectedWorkflow.nodes.map((node, idx) => (
                        <React.Fragment key={node.id}>
                          {idx > 0 && (
                            <div className="h-6 w-0.5 bg-zinc-800 border border-dashed border-zinc-800/60" />
                          )}
                          <div className={`p-3.5 border rounded-xl flex items-center justify-between w-full max-w-md ${
                            node.type === "trigger" 
                              ? "bg-emerald-950/15 border-emerald-500/30 text-emerald-300" 
                              : node.type === "condition"
                                ? "bg-amber-950/15 border-amber-500/30 text-amber-300"
                                : "bg-zinc-950 border-zinc-900 text-zinc-300"
                          }`}>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-3xs bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400">{idx + 1}</span>
                              <div>
                                <p className="text-xs font-bold">{node.label}</p>
                                <p className="text-4xs uppercase tracking-wider font-semibold opacity-60 mt-0.5 font-mono">{node.type}</p>
                              </div>
                            </div>

                            <span className="text-3xs font-mono opacity-50">config matched</span>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <p className="text-4xs text-zinc-500 italic text-center font-mono border-t border-zinc-900 pt-4 mt-4">
                    Nodes represent event triggers matching CRM status. Integrations compile in the sandbox during operational executions.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                  <p className="text-xs font-mono">Select a Workflow sequence to visualize</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 5: AI CENTER */}
        {activeTab === "ai" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Input Workspace Panel Left */}
            <Card className="lg:col-span-5 p-5 text-left flex flex-col gap-4">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs font-mono pb-2 border-b border-zinc-900">
                <Sparkles className="h-4.5 w-4.5" />
                <span>AI MARKETING DIRECTOR PANEL</span>
              </div>

              <Textarea
                label="Product description or campaign brief"
                placeholder="Write what feature, agent, or webinar you'd like to promote (e.g., Q3 Webinar Series promoting Lucas AI logistics optimization engines to e-commerce startups)..."
                value={aiProductDesc}
                onChange={(e) => setAiProductDesc(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Target Campaign Budget ($)"
                  type="number"
                  value={aiCampaignBudget}
                  onChange={(e) => setAiCampaignBudget(e.target.value)}
                />
                <Select
                  label="Strategic AI Action"
                  value={aiAction}
                  onChange={(e) => setAiAction(e.target.value as any)}
                  options={[
                    { value: "generate_copy", label: "Write Email Copy" },
                    { value: "suggest_subject", label: "Suggest Subject Lines" },
                    { value: "suggest_audience", label: "Build Audience Segment" },
                    { value: "predict_roi", label: "Predict ROI Model" }
                  ]}
                />
              </div>

              <Button
                variant="primary"
                icon={<Sparkles className="h-4 w-4" />}
                loading={aiLoading}
                onClick={handleAIRequest}
                disabled={!aiProductDesc.trim()}
              >
                Synthesize Strategy
              </Button>
            </Card>

            {/* Generated Outputs Panel Right */}
            <Card className="lg:col-span-7 p-6 text-left min-h-[400px] flex flex-col justify-between items-stretch">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                  <div className="h-6 w-6 animate-spin border-2 border-indigo-500 border-t-transparent rounded-full mb-3" />
                  <p className="text-xs font-mono text-zinc-400">Marketing Director compiling copy, segment structures, and predictive yields...</p>
                </div>
              ) : aiResult ? (
                <div className="flex flex-col justify-between h-full items-stretch">
                  <div>
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5 mb-4">
                      <span className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-emerald-400" /> Synthesized Outcome Match
                      </span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-2xs font-mono"
                        onClick={() => {
                          if (aiAction === "generate_copy") {
                            setNewCampContent(aiResult);
                            setNewCampName("AI-Generated Strategic Campaign");
                            setActiveTab("campaigns");
                            setCreateCampaignOpen(true);
                          } else if (aiAction === "suggest_audience") {
                            setNewSegFilters(aiResult.slice(0, 100));
                            setNewSegName("AI-Suggested CRM Dynamic list");
                            setActiveTab("audience");
                            setCreateSegmentOpen(true);
                          } else {
                            setAiResult(null);
                          }
                        }}
                      >
                        {aiAction === "generate_copy" ? "Create Campaign with Copy" : aiAction === "suggest_audience" ? "Create Segment" : "Clear Output"}
                      </Button>
                    </div>

                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">
                      {aiResult}
                    </div>
                  </div>

                  <p className="text-4xs text-zinc-500 font-mono italic text-center pt-4 border-t border-zinc-900 mt-6">
                    Outputs utilize zero-shot fine-tuning pipelines. Double-check links or budget parameters before active deployment.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-zinc-500 text-center">
                  <Sparkles className="h-10 w-10 opacity-30 mb-2 animate-pulse text-indigo-400" />
                  <p className="text-xs font-mono">AI Marketing Console Ready</p>
                  <p className="text-2xs text-zinc-600 mt-1 max-w-sm leading-relaxed">Provide details of your target outreach on the left and select an action to draft high-converting copy, ROI indices, or dynamic rules.</p>
                </div>
              )}
            </Card>

          </div>
        )}

      </div>

      {/* ===================================== */}
      {/* OVERLAYS & DIALOGS */}
      {/* ===================================== */}

      {/* 1. Create Campaign Dialog */}
      <Dialog isOpen={createCampaignOpen} onClose={() => setCreateCampaignOpen(false)} title="Orchestrate Marketing Campaign">
        <form onSubmit={handleCreateCampaign} className="flex flex-col gap-4 text-left">
          <Input
            label="Campaign Name"
            required
            value={newCampName}
            onChange={(e) => setNewCampName(e.target.value)}
          />
          <Input
            label="Subject Line (Primary)"
            required
            placeholder="Introduce high-impact benefit..."
            value={newCampSubject}
            onChange={(e) => setNewCampSubject(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Delivery Channel"
              value={newCampType}
              onChange={(e) => setNewCampType(e.target.value)}
              options={[
                { value: "email", label: "Email Campaign" },
                { value: "sms", label: "SMS Sequence" },
                { value: "whatsapp", label: "WhatsApp Direct" },
                { value: "push", label: "Mobile Push Alert" }
              ]}
            />
            <Input
              label="Dedicated Budget ($)"
              type="number"
              value={newCampBudget}
              onChange={(e) => setNewCampBudget(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Target Segment List"
              value={newCampSegment}
              onChange={(e) => setNewCampSegment(e.target.value)}
              options={[
                { value: "1", label: "Enterprise High-Intent Leads" },
                { value: "2", label: "Stale Trial Sign-ups Q2" },
                { value: "3", label: "AI Developer Newsletter" }
              ]}
            />
            <Input
              label="Schedule Send Date / Time (Optional)"
              type="datetime-local"
              value={newCampSched}
              onChange={(e) => setNewCampSched(e.target.value)}
            />
          </div>

          <Textarea
            label="Message Body Copy Content"
            required
            placeholder="Write full message body or HTML copy..."
            value={newCampContent}
            onChange={(e) => setNewCampContent(e.target.value)}
          />

          {/* Toggle A/B testing option */}
          <div className="border-t border-zinc-900 pt-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enableAbTest}
                onChange={(e) => setEnableAbTest(e.target.checked)}
                className="rounded bg-zinc-950 border-zinc-800 text-indigo-600 focus:ring-0"
              />
              <span className="text-xs font-bold text-zinc-400 font-mono">Enable Split A/B Subject Line Test</span>
            </label>

            {enableAbTest && (
              <div className="mt-3">
                <Input
                  label="Alternative Subject Line (Variant B)"
                  required={enableAbTest}
                  placeholder="Variant subject to test click-yield rates..."
                  value={abSubjectB}
                  onChange={(e) => setAbSubjectB(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-zinc-900 pt-4 mt-2">
            <Button type="button" variant="ghost" onClick={() => setCreateCampaignOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Launch outreach</Button>
          </div>
        </form>
      </Dialog>

      {/* 2. Create Audience Segment Dialog */}
      <Dialog isOpen={createSegmentOpen} onClose={() => setCreateSegmentOpen(false)} title="Create Customer Segment">
        <form onSubmit={handleCreateSegment} className="flex flex-col gap-4 text-left">
          <Input
            label="Segment Name"
            required
            placeholder="e.g. Inbound E-Commerce Partners"
            value={newSegName}
            onChange={(e) => setNewSegName(e.target.value)}
          />
          <Select
            label="Segment Membership Type"
            value={newSegType}
            onChange={(e) => setNewSegType(e.target.value)}
            options={[
              { value: "dynamic", label: "Dynamic (SQL Filter Driven)" },
              { value: "static", label: "Static (Fixed Subscriber List)" }
            ]}
          />
          <Input
            label="CRM Query Filters"
            placeholder="e.g. industry = 'E-Commerce' AND country = 'United States'"
            value={newSegFilters}
            onChange={(e) => setNewSegFilters(e.target.value)}
          />
          <Input
            label="Segment Tags (Comma Separated)"
            placeholder="e-commerce, outbound, local-delivery"
            value={newSegTags}
            onChange={(e) => setNewSegTags(e.target.value)}
          />
          <div className="flex justify-end gap-2 border-t border-zinc-900 pt-4 mt-2">
            <Button type="button" variant="ghost" onClick={() => setCreateSegmentOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Compile Segment</Button>
          </div>
        </form>
      </Dialog>

      {/* 3. Create Automation Workflow Dialog */}
      <Dialog isOpen={newWorkflowOpen} onClose={() => setNewWorkflowOpen(false)} title="Create Workflow Automation">
        <form onSubmit={handleCreateWorkflow} className="flex flex-col gap-4 text-left">
          <Input
            label="Automation Workflow Name"
            required
            placeholder="e.g. Post-Sale Retention Sequence"
            value={newWorkflowName}
            onChange={(e) => setNewWorkflowName(e.target.value)}
          />
          <div className="flex justify-end gap-2 border-t border-zinc-900 pt-4 mt-2">
            <Button type="button" variant="ghost" onClick={() => setNewWorkflowOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Initialize Workflow</Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}
