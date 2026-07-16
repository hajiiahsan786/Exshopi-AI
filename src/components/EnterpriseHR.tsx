import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Card, Button, Input, Badge, Dialog } from "./UI";
import {
  Users,
  Clock,
  Calendar,
  CreditCard,
  UserPlus,
  BarChart4,
  Award,
  BookOpen,
  Paperclip,
  CheckCircle,
  XCircle,
  TrendingUp,
  Cpu,
  UserCheck,
  Building,
  Mail,
  Shield,
  Activity,
  ArrowUpRight,
  FileText,
  DollarSign,
  Plus,
  RefreshCw,
  Search,
  ChevronRight,
  Sparkles,
  Phone,
  Settings,
  Brain,
  AlertTriangle,
  MapPin,
  GitFork
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";

// Helper for accent colors
import { getAccentClass, getRadiusClass } from "./UI";

export const EnterpriseHR: React.FC = () => {
  const { addLog, addNotification } = useStore();

  // Active Tab
  const [activeSubTab, setActiveSubTab] = useState<
    "overview" | "employees" | "attendance" | "leaves" | "payroll" | "recruitment" | "performance" | "assets-docs"
  >("overview");

  // Core Data State loaded from REST API
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leavesList, setLeavesList] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [training, setTraining] = useState<any[]>([]);

  // Loading indicator
  const [loading, setLoading] = useState(false);

  // Selected Employee for Detailed Profile Drawer
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [profileTab, setProfileTab] = useState<"info" | "attendance" | "payroll" | "performance" | "assets" | "ai-insights">("info");

  // Form Dialog states
  const [showApplyLeave, setShowApplyLeave] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddJob, setShowAddJob] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showScheduleInterview, setShowScheduleInterview] = useState(false);
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);

  // Forms values
  const [leaveForm, setLeaveForm] = useState({ employee_id: "", employee_name: "", type: "Vacation", start_date: "", end_date: "", reason: "" });
  const [empForm, setEmpForm] = useState({ full_name: "", email: "", position: "", salary: 3000, department_id: 1 });
  const [jobForm, setJobForm] = useState({ title: "", department: "Autonomous Sales Agents", location: "Remote", salary_range: "$120,000 - $140,000", description: "" });
  const [candForm, setCandForm] = useState({ name: "", email: "", phone: "", job_id: "", resume: "", skills: "" });
  const [intForm, setIntForm] = useState({ candidate_id: "", date: "", time: "", stage: "Technical", interviewer: "Harper HR Agent" });
  const [annForm, setAnnForm] = useState({ title: "", content: "", importance: "Normal" });

  // AI Insights State
  const [aiReportType, setAiReportType] = useState<string>("");
  const [aiReportLoading, setAiReportLoading] = useState(false);
  const [aiReportContent, setAiReportContent] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Load everything from the backend on mount
  const loadHRData = async () => {
    setLoading(true);
    try {
      const [
        resEmp, resDept, resAnn, resAtt, resLeav, resPay, resJobs, resCands, resInts, resRev, resGoals, resAssets, resDocs, resTrain
      ] = await Promise.all([
        fetch("/api/v1/employees"),
        fetch("/api/v1/departments"),
        fetch("/api/v1/hr/announcements"),
        fetch("/api/v1/hr/attendance"),
        fetch("/api/v1/hr/leaves"),
        fetch("/api/v1/hr/payroll"),
        fetch("/api/v1/hr/recruitment/jobs"),
        fetch("/api/v1/hr/recruitment/candidates"),
        fetch("/api/v1/hr/recruitment/interviews"),
        fetch("/api/v1/hr/performance/reviews"),
        fetch("/api/v1/hr/performance/goals"),
        fetch("/api/v1/hr/assets"),
        fetch("/api/v1/hr/documents"),
        fetch("/api/v1/hr/training")
      ]);

      const [
        dataEmp, dataDept, dataAnn, dataAtt, dataLeav, dataPay, dataJobs, dataCands, dataInts, dataRev, dataGoals, dataAssets, dataDocs, dataTrain
      ] = await Promise.all([
        resEmp.json(), resDept.json(), resAnn.json(), resAtt.json(), resLeav.json(), resPay.json(), resJobs.json(), resCands.json(), resInts.json(), resRev.json(), resGoals.json(), resAssets.json(), resDocs.json(), resTrain.json()
      ]);

      // Note: backend routes wrap custom HR router output in a { success: true, data: [...] } format.
      setEmployees(dataEmp);
      setDepartments(dataDept);
      setAnnouncements(dataAnn.data || []);
      setAttendance(dataAtt.data || []);
      setLeavesList(dataLeav.data || []);
      setPayroll(dataPay.data || []);
      setJobs(dataJobs.data || []);
      setCandidates(dataCands.data || []);
      setInterviews(dataInts.data || []);
      setReviews(dataRev.data || []);
      setGoals(dataGoals.data || []);
      setAssets(dataAssets.data || []);
      setDocuments(dataDocs.data || []);
      setTraining(dataTrain.data || []);

      addLog({
        method: "GET",
        endpoint: "/api/v1/hr/dashboard",
        status: 200,
        type: "api",
        response: { status: "success", employee_count: dataEmp.length }
      });
    } catch (err) {
      console.error("Failed to fetch HR module metadata", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHRData();
  }, []);

  // API Mutators
  const handleClockIn = async (employeeId: number) => {
    try {
      const res = await fetch("/api/v1/hr/attendance/clock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: employeeId })
      });
      const data = await res.json();
      if (res.ok) {
        addNotification({
          title: "Attendance Recorded",
          description: "Employee successfully clocked in for today's shifts.",
          type: "success"
        });
        loadHRData();
      } else {
        alert(data.message || "Clock-in failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClockOut = async (employeeId: number) => {
    try {
      const res = await fetch("/api/v1/hr/attendance/clock-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: employeeId })
      });
      const data = await res.json();
      if (res.ok) {
        addNotification({
          title: "Shift Completed",
          description: "Shift duration successfully calculated and logged.",
          type: "success"
        });
        loadHRData();
      } else {
        alert(data.message || "Clock-out failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const targetEmp = employees.find(emp => emp.id === parseInt(leaveForm.employee_id));
      const res = await fetch("/api/v1/hr/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leaveForm,
          employee_name: targetEmp ? targetEmp.full_name : "Employee Node"
        })
      });
      if (res.ok) {
        addNotification({
          title: "Leave Applied",
          description: "Leave request registered in the approval workflow pipeline.",
          type: "info"
        });
        setShowApplyLeave(false);
        setLeaveForm({ employee_id: "", employee_name: "", type: "Vacation", start_date: "", end_date: "", reason: "" });
        loadHRData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveLeave = async (leaveId: number, status: "Approved" | "Rejected") => {
    try {
      const res = await fetch(`/api/v1/hr/leaves/${leaveId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, approved_by: "Ahsan Haji" })
      });
      if (res.ok) {
        addNotification({
          title: `Leave ${status}`,
          description: `Leave request has been marked as ${status.toLowerCase()}`,
          type: status === "Approved" ? "success" : "warning"
        });
        loadHRData();
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
      if (res.ok) {
        addNotification({
          title: "Profile Created",
          description: `Worker ${empForm.full_name} is now registered in our active HR databases.`,
          type: "success"
        });
        setShowAddEmployee(false);
        setEmpForm({ full_name: "", email: "", position: "", salary: 3000, department_id: 1 });
        loadHRData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/hr/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(annForm)
      });
      if (res.ok) {
        addNotification({
          title: "Announcement Dispatched",
          description: "Successfully published system announcement to active dashboards.",
          type: "success"
        });
        setShowAddAnnouncement(false);
        setAnnForm({ title: "", content: "", importance: "Normal" });
        loadHRData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/hr/recruitment/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobForm)
      });
      if (res.ok) {
        addNotification({
          title: "Job Requisition Active",
          description: `Open position for "${jobForm.title}" published.`,
          type: "success"
        });
        setShowAddJob(false);
        setJobForm({ title: "", department: "Autonomous Sales Agents", location: "Remote", salary_range: "$120,000 - $140,000", description: "" });
        loadHRData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/hr/recruitment/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...candForm,
          skills: candForm.skills.split(",").map(s => s.trim())
        })
      });
      if (res.ok) {
        addNotification({
          title: "Applicant Registered",
          description: "Injected candidate profile directly into tracking pipeline.",
          type: "success"
        });
        setShowAddCandidate(false);
        setCandForm({ name: "", email: "", phone: "", job_id: "", resume: "", skills: "" });
        loadHRData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/hr/recruitment/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(intForm)
      });
      if (res.ok) {
        addNotification({
          title: "Interview Scheduled",
          description: "Assigned interview panel slot and synchronized calendar metrics.",
          type: "success"
        });
        setShowScheduleInterview(false);
        setIntForm({ candidate_id: "", date: "", time: "", stage: "Technical", interviewer: "Harper HR Agent" });
        loadHRData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePayrollStatus = async (runId: number, status: "Approved" | "Paid") => {
    try {
      const res = await fetch(`/api/v1/hr/payroll/${runId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        addNotification({
          title: "Payroll Settled",
          description: `Disbursement state shifted to: ${status}`,
          type: "success"
        });
        loadHRData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger Gemini/Heuristics AI Action
  const triggerAIAction = async (action: string, payload: any) => {
    setAiReportType(action);
    setAiReportLoading(true);
    setAiReportContent(null);
    try {
      const res = await fetch("/api/v1/hr/ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAiReportContent(data.data);
      } else {
        setAiReportContent("Error processing operational intelligence logs.");
      }
    } catch (err: any) {
      setAiReportContent(`Failure running AI workforce compiler model: ${err.message}`);
    } finally {
      setAiReportLoading(false);
    }
  };

  // Derived charts metrics
  const totalEmployees = employees.length;
  const humanCount = employees.filter(e => !e.email.includes("agent") && !e.email.includes("@exshopi.ai")).length;
  const aiAgentsCount = totalEmployees - humanCount;

  const departmentDistribution = departments.map(d => {
    const count = employees.filter(e => e.department_id === d.id).length;
    return { name: d.name, value: count || 1 };
  });

  const payrollTotals = payroll.reduce((acc, p) => {
    acc.salary += p.salary;
    acc.bonus += p.bonuses;
    acc.net += p.net_pay;
    return acc;
  }, { salary: 0, bonus: 0, net: 0 });

  const activeInterviews = interviews.filter(i => i.status === "Scheduled").length;

  return (
    <div className="space-y-6">
      
      {/* Upper Title Cluster with Glass-styled Header block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800/60 shadow-xl">
        <div className="flex items-center gap-3">
          <div className={`h-11 w-11 rounded-xl ${getAccentClass("bg")} flex items-center justify-center text-white text-lg shadow-lg shadow-indigo-500/10`}>
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Enterprise Workforce Center
              <Badge variant="accent" className="text-[9px] font-mono tracking-widest uppercase">Admin</Badge>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              Orchestrate both autonomous AI agents and human workers, manage dynamic attendance, leaves, payroll profiles, performance, and strategic recruiting rails.
            </p>
          </div>
        </div>

        {/* Global Action Cluster */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadHRData} className="gap-1.5 h-9" loading={loading}>
            <RefreshCw className="h-3.5 w-3.5" /> Sync Ledger
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowAddEmployee(true)} className="gap-1.5 h-9">
            <UserPlus className="h-3.5 w-3.5" /> Register Profile
          </Button>
        </div>
      </div>

      {/* Sub Tabs Controls Navigation */}
      <div className="flex items-center overflow-x-auto gap-1 border-b border-zinc-850 pb-px">
        {[
          { id: "overview", label: "Center Overview", icon: BarChart4 },
          { id: "employees", label: "Personnel Directory", icon: Users },
          { id: "attendance", label: "SLA Attendance", icon: Clock },
          { id: "leaves", label: "Leave Management", icon: Calendar },
          { id: "payroll", label: "Payroll Ledger", icon: CreditCard },
          { id: "recruitment", label: "Talent Acquisition", icon: UserPlus },
          { id: "performance", label: "Operational Goals", icon: Award },
          { id: "assets-docs", label: "Assets & Vault", icon: Paperclip }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold tracking-wide transition-all border-b-2 cursor-pointer shrink-0 ${
                isActive
                  ? `${getAccentClass("text")} border-indigo-500 bg-zinc-900/30`
                  : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-950/20"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub tabs contents renderer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
        >
          {/* ==================================================================== */}
          {/* 1. OVERVIEW DASHBOARD */}
          {/* ==================================================================== */}
          {activeSubTab === "overview" && (
            <div className="space-y-6">
              
              {/* Dynamic Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Workforce Size</span>
                    <h3 className="text-2xl font-extrabold text-white mt-1">{totalEmployees}</h3>
                    <p className="text-[10px] text-zinc-400 mt-1.5 flex items-center gap-1.5 font-mono">
                      <span>🤖 {aiAgentsCount} Autonomous</span> • <span>👤 {humanCount} Human</span>
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <Users className="h-5 w-5" />
                  </div>
                </Card>

                <Card className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Pending Leave Reviews</span>
                    <h3 className="text-2xl font-extrabold text-amber-400 mt-1">
                      {leavesList.filter(l => l.status === "Pending").length}
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-1.5 leading-none">Awaiting administrative decision</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                    <Calendar className="h-5 w-5" />
                  </div>
                </Card>

                <Card className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Active Job Requisitions</span>
                    <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
                      {jobs.filter(j => j.status === "Open").length}
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-1.5 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-emerald-400" /> {activeInterviews} interviews lined up
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <UserCheck className="h-5 w-5" />
                  </div>
                </Card>

                <Card className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Current Monthly Payroll Out</span>
                    <h3 className="text-2xl font-extrabold text-white mt-1">${payrollTotals.net.toLocaleString()} <span className="text-xs font-medium text-zinc-400">USD</span></h3>
                    <p className="text-[10px] text-zinc-400 mt-1.5 leading-none">Net salary + bonuses, post deductions</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
                    <CreditCard className="h-5 w-5" />
                  </div>
                </Card>
              </div>

              {/* Central Section: Charts & Ledger Announcements */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Department Distribution (Chart) */}
                <Card className="p-5 lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">Personnel Distribution Index</h3>
                      <p className="text-3xs text-zinc-500">Live allocation profile across specialized company sectors</p>
                    </div>
                    <Badge variant="neutral">Headcount Analysis</Badge>
                  </div>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                        <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46" }} />
                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                          {departmentDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#6366f1" : "#10b981"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* System Board Announcements */}
                <Card className="p-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-tight">System Notice Board</h3>
                        <p className="text-3xs text-zinc-500 font-mono">Official updates and logs</p>
                      </div>
                      <button onClick={() => setShowAddAnnouncement(true)} className="text-3xs text-indigo-400 hover:underline flex items-center gap-1 font-mono">
                        <Plus className="h-3 w-3" /> Post Notice
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {announcements.map((ann) => (
                        <div key={ann.id} className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-850 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-zinc-200">{ann.title}</span>
                            <Badge variant={ann.importance === "High" ? "error" : "neutral"} className="text-[8px] px-1 py-0 scale-90">
                              {ann.importance}
                            </Badge>
                          </div>
                          <p className="text-3xs text-zinc-400 leading-relaxed">{ann.content}</p>
                          <div className="flex justify-between text-4xs text-zinc-500 font-mono pt-1 border-t border-zinc-900">
                            <span>{ann.author}</span>
                            <span>{ann.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800">
                    <div className="p-3 bg-zinc-950 rounded-xl flex items-center justify-between border border-zinc-800">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Core CRM Pipeline</span>
                      </div>
                      <span className="text-3xs font-mono text-emerald-400 font-semibold">Active & Sync</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Lower Section: AI Turnover Prediction & Auxiliary Summary Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4.5 w-4.5 text-indigo-400" />
                      <h3 className="text-sm font-bold text-white tracking-tight">AI Personnel Turnover Analyzer</h3>
                    </div>
                    <Badge variant="accent" className="font-mono text-3xs">Predictive ML Model</Badge>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Select any employee profile to run our advanced offline or online AI turnover classifier to inspect attrition hazards, workflow balance risks, and upskilling opportunities.
                  </p>
                  <div className="flex items-center gap-2.5">
                    <select
                      className="bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-lg p-2.5 text-xs focus:outline-none flex-1 font-mono"
                      onChange={(e) => {
                        const emp = employees.find(emp => emp.id === parseInt(e.target.value));
                        if (emp) {
                          triggerAIAction("predict-turnover", { employeeData: emp });
                        }
                      }}
                    >
                      <option value="">-- Choose employee to scan attrition risk --</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.full_name || e.name} ({e.position || "Staff"})</option>
                      ))}
                    </select>
                  </div>

                  {aiReportLoading && aiReportType === "predict-turnover" && (
                    <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-850 flex items-center justify-center gap-2 text-xs text-zinc-400">
                      <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" /> Running AI workforce classifier risk metrics...
                    </div>
                  )}

                  {aiReportContent && aiReportType === "predict-turnover" && (
                    <div className="p-4 bg-zinc-950 rounded-xl border border-indigo-500/20 text-xs text-zinc-300 leading-relaxed max-h-52 overflow-y-auto font-sans shadow-inner">
                      <div className="markdown-body text-zinc-300 whitespace-pre-wrap">{aiReportContent}</div>
                    </div>
                  )}
                </Card>

                <Card className="p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4.5 w-4.5 text-emerald-400" />
                        <h3 className="text-sm font-bold text-white tracking-tight">Active AI Worker Engine Node Health</h3>
                      </div>
                      <Badge variant="success">99.98% SLA</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-850">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Response Latency</span>
                        <div className="text-base font-extrabold text-white mt-1">112ms</div>
                        <span className="text-3xs text-emerald-500">Under SLA limit (150ms)</span>
                      </div>
                      <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-850">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Scrape Outbound rate</span>
                        <div className="text-base font-extrabold text-white mt-1">1,480/hr</div>
                        <span className="text-3xs text-zinc-500">Peak performance</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-4xs text-zinc-500 leading-relaxed font-mono">
                    All AI workforce agents are executing their standard scheduled micro-tasks. Sophia AI completed 41 cold-emails in the last 15 mins.
                  </p>
                </Card>
              </div>

            </div>
          )}

          {/* ==================================================================== */}
          {/* 2. EMPLOYEES DIRECTORY */}
          {/* ==================================================================== */}
          {activeSubTab === "employees" && (
            <div className="space-y-6">
              
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-zinc-900/20 rounded-xl border border-zinc-850">
                <div className="relative w-full sm:w-80">
                  <span className="absolute left-3 top-2.5 text-zinc-500">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search personnel by name or position..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-800"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Badge variant="neutral" className="font-mono text-3xs">
                    Found {employees.filter(e => e.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || e.position?.toLowerCase().includes(searchQuery.toLowerCase())).length} Profiles
                  </Badge>
                </div>
              </div>

              {/* Employee Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees
                  .filter(emp => 
                    emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    emp.position?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(emp => {
                    const dept = departments.find(d => d.id === emp.department_id) || { name: "Management" };
                    const isAi = emp.email.includes("agent") || emp.email.includes("@exshopi.ai");
                    return (
                      <Card key={emp.id} className="p-5 flex flex-col justify-between hoverable space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-850 shrink-0">
                                <img
                                  src={emp.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                                  alt={emp.full_name}
                                  className="h-full w-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                                  {emp.full_name}
                                  {isAi && <Badge variant="accent" className="text-[8px] px-1 py-0">AI Agent</Badge>}
                                </h4>
                                <p className="text-3xs font-medium text-zinc-400 mt-0.5">{emp.position}</p>
                              </div>
                            </div>
                            <Badge variant={emp.status === "active" ? "success" : "neutral"} className="capitalize">
                              {emp.status}
                            </Badge>
                          </div>

                          <div className="space-y-2 border-t border-zinc-850 pt-3 text-2xs text-zinc-400">
                            <div className="flex items-center gap-2">
                              <Building className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                              <span>{dept.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                              <span className="truncate">{emp.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                              <span className="font-mono text-zinc-300 font-semibold">${emp.salary?.toLocaleString()}/mo scale</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-zinc-850">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-3xs font-mono py-1.5"
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setProfileTab("info");
                              setAiReportContent(null);
                            }}
                          >
                            Inspect Profile & Activity Logs <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
              </div>

            </div>
          )}

          {/* ==================================================================== */}
          {/* 3. SLA ATTENDANCE TRACKER */}
          {/* ==================================================================== */}
          {activeSubTab === "attendance" && (
            <div className="space-y-6">
              
              {/* Daily check-in controller pane */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Manual Override & Clock Control Panel */}
                <Card className="p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white tracking-tight">Active Duty Clock Panel</h3>
                    <Badge variant="neutral">Live Ingress Override</Badge>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Clock in or clock out active worker sessions instantly. This directly updates live SLA registers and calculates daily overtime thresholds.
                  </p>
                  
                  <div className="space-y-3 pt-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono block">Select Worker Target</label>
                    <select
                      id="clock-target"
                      className="w-full bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-lg p-2.5 text-xs focus:outline-none font-mono"
                    >
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.full_name || e.name} ({e.position})</option>
                      ))}
                    </select>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button
                        variant="primary"
                        className="text-xs font-mono h-10"
                        onClick={() => {
                          const val = (document.getElementById("clock-target") as HTMLSelectElement)?.value;
                          if (val) handleClockIn(parseInt(val));
                        }}
                      >
                        Clock In Shift
                      </Button>
                      <Button
                        variant="secondary"
                        className="text-xs font-mono h-10 border border-zinc-700/60"
                        onClick={() => {
                          const val = (document.getElementById("clock-target") as HTMLSelectElement)?.value;
                          if (val) handleClockOut(parseInt(val));
                        }}
                      >
                        Clock Out Shift
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Live Attendance History Board */}
                <Card className="p-5 lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">Active Shift Ledger</h3>
                      <p className="text-3xs text-zinc-500">Verified ingress and egress log timestamps</p>
                    </div>
                    <Badge variant="accent">SOC-2 Audited</Badge>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-zinc-950/60 text-zinc-400 border-b border-zinc-800">
                        <tr>
                          <th className="p-2.5 font-bold font-mono">Employee ID</th>
                          <th className="p-2.5 font-bold font-mono">Date Logged</th>
                          <th className="p-2.5 font-bold font-mono">Clock In</th>
                          <th className="p-2.5 font-bold font-mono">Clock Out</th>
                          <th className="p-2.5 font-bold font-mono">SLA Status</th>
                          <th className="p-2.5 font-bold font-mono">Overtime</th>
                          <th className="p-2.5 font-bold font-mono">Late Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850">
                        {attendance.map((rec) => {
                          const emp = employees.find(e => e.id === rec.employee_id) || { full_name: "Worker Node" };
                          return (
                            <tr key={rec.id} className="hover:bg-zinc-900/20">
                              <td className="p-2.5 font-mono text-zinc-400">
                                #{rec.employee_id} - {emp.full_name}
                              </td>
                              <td className="p-2.5 font-mono text-zinc-300">{rec.date}</td>
                              <td className="p-2.5 font-mono text-zinc-300">{rec.clock_in}</td>
                              <td className="p-2.5 font-mono text-zinc-300">{rec.clock_out || <span className="text-emerald-400 animate-pulse">● Active duty</span>}</td>
                              <td className="p-2.5">
                                <Badge variant={rec.status === "On Time" ? "success" : "warning"} className="text-3xs scale-90">
                                  {rec.status}
                                </Badge>
                              </td>
                              <td className="p-2.5 font-mono text-zinc-400">{rec.overtime > 0 ? `+${rec.overtime}h` : "—"}</td>
                              <td className="p-2.5 font-mono text-zinc-500">{rec.late_minutes > 0 ? `${rec.late_minutes} mins` : "On Time"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

            </div>
          )}

          {/* ==================================================================== */}
          {/* 4. LEAVE MANAGEMENT */}
          {/* ==================================================================== */}
          {activeSubTab === "leaves" && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center bg-zinc-900/30 p-4 border border-zinc-850 rounded-xl">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Active Leave Registry</h3>
                  <p className="text-3xs text-zinc-400 mt-0.5">Admin approval matrix and balances</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setShowApplyLeave(true)} className="gap-1 h-8 text-3xs font-mono">
                  <Plus className="h-3 w-3" /> Apply Leave Request
                </Button>
              </div>

              {/* Leave Requests Table */}
              <Card className="p-5 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-zinc-950/60 text-zinc-400 border-b border-zinc-800">
                      <tr>
                        <th className="p-2.5 font-bold font-mono">Applicant</th>
                        <th className="p-2.5 font-bold font-mono">Type</th>
                        <th className="p-2.5 font-bold font-mono">Timeline Range</th>
                        <th className="p-2.5 font-bold font-mono">Reasoning Details</th>
                        <th className="p-2.5 font-bold font-mono">Status State</th>
                        <th className="p-2.5 font-bold font-mono">Decision Admin</th>
                        <th className="p-2.5 text-right font-mono">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {leavesList.map((leave) => {
                        const emp = employees.find(e => e.id === leave.employee_id) || { full_name: leave.employee_name };
                        return (
                          <tr key={leave.id} className="hover:bg-zinc-900/20">
                            <td className="p-2.5 font-mono text-zinc-200">
                              #{leave.employee_id} - {emp.full_name}
                            </td>
                            <td className="p-2.5 font-mono text-zinc-400">{leave.type}</td>
                            <td className="p-2.5 font-mono text-zinc-300">{leave.start_date} to {leave.end_date}</td>
                            <td className="p-2.5 text-zinc-400 truncate max-w-xs">{leave.reason}</td>
                            <td className="p-2.5">
                              <Badge variant={leave.status === "Approved" ? "success" : leave.status === "Rejected" ? "error" : "warning"}>
                                {leave.status}
                              </Badge>
                            </td>
                            <td className="p-2.5 font-mono text-zinc-500">{leave.approved_by}</td>
                            <td className="p-2.5 text-right whitespace-nowrap">
                              {leave.status === "Pending" && (
                                <div className="inline-flex gap-1.5 justify-end">
                                  <button
                                    onClick={() => handleApproveLeave(leave.id, "Approved")}
                                    className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 transition-all text-3xs font-mono font-bold cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleApproveLeave(leave.id, "Rejected")}
                                    className="p-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20 transition-all text-3xs font-mono font-bold cursor-pointer"
                                  >
                                    Deny
                                  </button>
                                </div>
                              )}
                              {leave.status !== "Pending" && (
                                <span className="text-3xs text-zinc-500 font-mono italic">Decision logged</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

            </div>
          )}

          {/* ==================================================================== */}
          {/* 5. PAYROLL LEDGER */}
          {/* ==================================================================== */}
          {activeSubTab === "payroll" && (
            <div className="space-y-6">
              
              {/* Payroll stats card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-5 bg-gradient-to-br from-indigo-950/20 to-zinc-900 border border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Gross Disbursement Scale</span>
                  <div className="text-xl font-extrabold text-white mt-1">${payrollTotals.salary.toLocaleString()} USD</div>
                  <p className="text-4xs text-zinc-500 mt-2 font-mono">Sum total of base salaries before taxes</p>
                </Card>
                <Card className="p-5 bg-gradient-to-br from-indigo-950/20 to-zinc-900 border border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Total Allocation Bonuses</span>
                  <div className="text-xl font-extrabold text-indigo-400 mt-1">${payrollTotals.bonus.toLocaleString()} USD</div>
                  <p className="text-4xs text-zinc-500 mt-2 font-mono">Performance bonuses paid in Q3 run</p>
                </Card>
                <Card className="p-5 bg-gradient-to-br from-indigo-950/20 to-zinc-900 border border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Net Settlement Outflow</span>
                  <div className="text-xl font-extrabold text-emerald-400 mt-1">${payrollTotals.net.toLocaleString()} USD</div>
                  <p className="text-4xs text-zinc-500 mt-2 font-mono">Post 12% standard tax bracket deduction</p>
                </Card>
              </div>

              {/* Payroll profile grid */}
              <Card className="p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                  <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">Disbursement List</h3>
                  <Badge variant="neutral">Q3 Settlement Run</Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-zinc-950/60 text-zinc-400 border-b border-zinc-800">
                      <tr>
                        <th className="p-2.5 font-bold font-mono">Employee</th>
                        <th className="p-2.5 font-bold font-mono">Period</th>
                        <th className="p-2.5 font-bold font-mono">Base Salary</th>
                        <th className="p-2.5 font-bold font-mono">Bonuses</th>
                        <th className="p-2.5 font-bold font-mono">Deductions</th>
                        <th className="p-2.5 font-bold font-mono">12% Taxes</th>
                        <th className="p-2.5 font-bold font-mono">Net Pay</th>
                        <th className="p-2.5 font-bold font-mono">Status</th>
                        <th className="p-2.5 font-bold font-mono text-right">Operational Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {payroll.map((payRun) => (
                        <tr key={payRun.id} className="hover:bg-zinc-900/20">
                          <td className="p-2.5 font-mono text-zinc-200">{payRun.employee_name}</td>
                          <td className="p-2.5 font-mono text-zinc-400">{payRun.period}</td>
                          <td className="p-2.5 font-mono text-zinc-300">${payRun.salary?.toLocaleString()}</td>
                          <td className="p-2.5 font-mono text-emerald-400">+${payRun.bonuses?.toLocaleString()}</td>
                          <td className="p-2.5 font-mono text-rose-400">-${payRun.deductions?.toLocaleString()}</td>
                          <td className="p-2.5 font-mono text-zinc-400">-${payRun.taxes?.toLocaleString()}</td>
                          <td className="p-2.5 font-mono text-white font-bold">${payRun.net_pay?.toLocaleString()}</td>
                          <td className="p-2.5">
                            <Badge variant={payRun.status === "Paid" ? "success" : payRun.status === "Approved" ? "accent" : "neutral"}>
                              {payRun.status}
                            </Badge>
                          </td>
                          <td className="p-2.5 text-right whitespace-nowrap">
                            {payRun.status === "Draft" && (
                              <button
                                onClick={() => handleUpdatePayrollStatus(payRun.id, "Approved")}
                                className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 hover:bg-indigo-500/20 transition-all text-3xs font-mono font-bold cursor-pointer"
                              >
                                Approve Run
                              </button>
                            )}
                            {payRun.status === "Approved" && (
                              <button
                                onClick={() => handleUpdatePayrollStatus(payRun.id, "Paid")}
                                className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 transition-all text-3xs font-mono font-bold cursor-pointer animate-pulse"
                              >
                                Pay Out
                              </button>
                            )}
                            {payRun.status === "Paid" && (
                              <div className="flex justify-end items-center gap-1.5 text-4xs text-zinc-500 font-mono">
                                <span>Settled ({payRun.payment_date})</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

            </div>
          )}

          {/* ==================================================================== */}
          {/* 6. RECRUITMENT & TALENT ACQUISITION */}
          {/* ==================================================================== */}
          {activeSubTab === "recruitment" && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Active Job Openings */}
                <Card className="p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                    <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">Active Job Board</h3>
                    <button onClick={() => setShowAddJob(true)} className="text-3xs text-indigo-400 hover:underline flex items-center gap-1 font-mono cursor-pointer">
                      <Plus className="h-3 w-3" /> Add Job
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {jobs.map((job) => (
                      <div key={job.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-white leading-none">{job.title}</h4>
                            <span className="text-[10px] text-zinc-500 font-mono block mt-1">{job.department} • {job.location}</span>
                          </div>
                          <Badge variant={job.status === "Open" ? "success" : "neutral"} className="scale-90">{job.status}</Badge>
                        </div>
                        <p className="text-3xs text-zinc-400 leading-relaxed">{job.description}</p>
                        <div className="flex justify-between text-3xs text-zinc-500 font-mono border-t border-zinc-900 pt-2">
                          <span>{job.salary_range}</span>
                          <span className="text-indigo-400 font-semibold">{job.applicants_count} Applied</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Candidate Pipeline Board */}
                <Card className="p-5 lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">Candidate tracking pipeline</h3>
                      <p className="text-3xs text-zinc-500">Interact and shift applicant status</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowAddCandidate(true)} className="text-3xs text-indigo-400 hover:underline flex items-center gap-1 font-mono cursor-pointer">
                        <Plus className="h-3 w-3" /> Add Candidate
                      </button>
                      <button onClick={() => setShowScheduleInterview(true)} className="text-3xs text-emerald-400 hover:underline flex items-center gap-1 font-mono cursor-pointer">
                        <Plus className="h-3 w-3" /> Plan Interview
                      </button>
                    </div>
                  </div>

                  {/* Interview scheduled logs */}
                  <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-500/10 space-y-2.5">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider font-mono block">Upcoming Interviews Panel</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {interviews.map(i => (
                        <div key={i.id} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-850 text-2xs space-y-1">
                          <div className="flex justify-between text-white font-bold">
                            <span>{i.candidate_name}</span>
                            <Badge variant="accent" className="scale-75 origin-right">{i.stage}</Badge>
                          </div>
                          <p className="text-zinc-500 text-3xs">{i.job_title}</p>
                          <div className="flex justify-between text-3xs text-zinc-400 font-mono pt-1">
                            <span>📅 {i.date} {i.time}</span>
                            <span className="text-zinc-500">Panelist: {i.interviewer}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Applicants profiles table */}
                  <div className="overflow-x-auto pt-2">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-zinc-950/60 text-zinc-400 border-b border-zinc-800">
                        <tr>
                          <th className="p-2 font-bold font-mono">Name</th>
                          <th className="p-2 font-bold font-mono">Applied For</th>
                          <th className="p-2 font-bold font-mono">Skills</th>
                          <th className="p-2 font-bold font-mono">Pipeline Step</th>
                          <th className="p-2 font-bold font-mono text-right">AI Assistant Tools</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850">
                        {candidates.map((cand) => (
                          <tr key={cand.id} className="hover:bg-zinc-900/20">
                            <td className="p-2 font-mono text-zinc-200">
                              <div>{cand.name}</div>
                              <span className="text-4xs text-zinc-500 block">{cand.email}</span>
                            </td>
                            <td className="p-2 font-mono text-zinc-400">{cand.job_title}</td>
                            <td className="p-2 max-w-xs truncate">
                              <div className="flex flex-wrap gap-1">
                                {cand.skills.map((s: string, idx: number) => (
                                  <span key={idx} className="bg-zinc-900 text-zinc-400 rounded px-1 text-[8px] border border-zinc-800">{s}</span>
                                ))}
                              </div>
                            </td>
                            <td className="p-2">
                              <select
                                className="bg-zinc-950 text-zinc-300 border border-zinc-850 rounded p-1 text-[10px] focus:outline-none"
                                value={cand.status}
                                onChange={async (e) => {
                                  const res = await fetch(`/api/v1/hr/recruitment/candidates/${cand.id}`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ status: e.target.value })
                                  });
                                  if (res.ok) {
                                    addNotification({
                                      title: "Pipeline Updated",
                                      description: `${cand.name} shifted to ${e.target.value}`,
                                      type: "info"
                                    });
                                    loadHRData();
                                  }
                                }}
                              >
                                <option value="Applied">Applied</option>
                                <option value="Screening">Screening</option>
                                <option value="Interviewing">Interviewing</option>
                                <option value="Offer Extended">Offer Extended</option>
                                <option value="Hired">Hired</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </td>
                            <td className="p-2 text-right">
                              <button
                                onClick={() => triggerAIAction("generate-interview-questions", { candidateData: cand })}
                                className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all text-[9px] font-mono font-bold cursor-pointer inline-flex items-center gap-1"
                              >
                                <Sparkles className="h-2.5 w-2.5" /> AI Interview Rubric
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Render interview questions generation results */}
                  {aiReportType === "generate-interview-questions" && (aiReportLoading || aiReportContent) && (
                    <div className="p-4 bg-zinc-950/80 rounded-xl border border-indigo-500/20 space-y-3">
                      <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono flex items-center gap-1">
                          <Sparkles className="h-3 w-3 animate-pulse" /> AI-Generated Interview Evaluation Rubric
                        </span>
                        <button onClick={() => setAiReportContent(null)} className="text-4xs text-zinc-500 hover:underline">Dismiss</button>
                      </div>
                      {aiReportLoading ? (
                        <div className="flex items-center gap-2 text-3xs text-zinc-500">
                          <RefreshCw className="h-3 w-3 animate-spin text-indigo-400" /> Synthesizing custom engineering questions based on candidate skills...
                        </div>
                      ) : (
                        <div className="text-[11px] text-zinc-300 leading-relaxed font-sans max-h-52 overflow-y-auto whitespace-pre-wrap">
                          {aiReportContent}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </div>

            </div>
          )}

          {/* ==================================================================== */}
          {/* 7. PERFORMANCE & OPERATIONAL GOALS */}
          {/* ==================================================================== */}
          {activeSubTab === "performance" && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* SLA Goals progress panel */}
                <Card className="p-5 lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">Workforce KPI Goals</h3>
                      <p className="text-3xs text-zinc-500">Dynamic milestones mapped directly to active worker nodes</p>
                    </div>
                    <Badge variant="neutral">Progress index</Badge>
                  </div>

                  <div className="space-y-4">
                    {goals.map((g) => {
                      const emp = employees.find(e => e.id === g.employee_id) || { full_name: "Staff" };
                      return (
                        <div key={g.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 space-y-2.5">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-bold text-white">{g.title}</h4>
                              <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">Owner: {emp.full_name} • KPI: {g.kpi_metrics}</span>
                            </div>
                            <Badge variant={g.status === "Completed" ? "success" : g.status === "Delayed" ? "error" : "warning"} className="scale-90">
                              {g.status}
                            </Badge>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-4xs text-zinc-500 font-mono">
                              <span>Milestone progress</span>
                              <span>{g.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                              <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${g.progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Trigger state changes */}
                          <div className="flex justify-between items-center border-t border-zinc-900 pt-2">
                            <span className="text-4xs text-zinc-500 font-mono">Target: {g.due_date}</span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={async () => {
                                  const prog = Math.min(100, g.progress + 15);
                                  const stat = prog === 100 ? "Completed" : g.status;
                                  await fetch(`/api/v1/hr/performance/goals/${g.id}`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ progress: prog, status: stat })
                                  });
                                  loadHRData();
                                }}
                                className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 text-4xs font-mono font-bold cursor-pointer"
                              >
                                Increment +15%
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Performance reviews list */}
                <Card className="p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">H1 Strategic Performance Reviews</h3>
                      <p className="text-3xs text-zinc-500">Verified historic evaluations</p>
                    </div>
                    <Badge variant="success">Finalized</Badge>
                  </div>

                  <div className="space-y-3.5">
                    {reviews.map((r) => (
                      <div key={r.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-zinc-200">{r.employee_name}</span>
                          <span className="text-xs text-amber-400">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                        </div>
                        <p className="text-3xs text-zinc-400 leading-relaxed font-sans">"{r.feedback}"</p>
                        <div className="flex justify-between text-4xs text-zinc-500 font-mono pt-1.5 border-t border-zinc-900">
                          <span>Evaluated by {r.reviewer}</span>
                          <span>Period: {r.period}</span>
                        </div>
                        {r.promotion_recommended && (
                          <div className="mt-1.5 p-1.5 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 rounded text-4xs font-semibold uppercase tracking-wider font-mono text-center">
                            🚀 Promotion Recommended
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

            </div>
          )}

          {/* ==================================================================== */}
          {/* 8. ASSETS & DOCUMENTS VAULT */}
          {/* ==================================================================== */}
          {activeSubTab === "assets-docs" && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Assets registry */}
                <Card className="p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">Assigned Asset Registry</h3>
                      <p className="text-3xs text-zinc-500">Hardware and active licensing keys</p>
                    </div>
                    <Badge variant="neutral">Vault Inventory</Badge>
                  </div>

                  <div className="space-y-3">
                    {assets.map((asset) => (
                      <div key={asset.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs text-zinc-400 shrink-0 font-mono">
                            {asset.type === "Laptop" ? "💻" : asset.type === "Security Key" ? "🔑" : "🤖"}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{asset.asset_name}</h4>
                            <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">SN: {asset.serial_number} • Holder: {asset.employee_name}</span>
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <Badge variant="success" className="text-4xs scale-90">{asset.status}</Badge>
                          <span className="text-[9px] text-zinc-500 block mt-1">Assigned: {asset.assigned_date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Documents Vault */}
                <Card className="p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">Legal Vault</h3>
                      <p className="text-3xs text-zinc-500">Encrypted onboarding & contract documents</p>
                    </div>
                    <Badge variant="accent">IPFS Locked</Badge>
                  </div>

                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{doc.title}</h4>
                            <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">Category: {doc.category} • Target Holder: {doc.employee_name}</span>
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <a href="#" className="p-1 rounded bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 text-4xs font-mono font-bold cursor-pointer inline-block">
                            Download PDF
                          </a>
                          <span className="text-[9px] text-zinc-500 block mt-1">Uploaded: {doc.uploaded_at}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ==================================================================== */}
      {/* 9. EMPLOYEE PROFILE INSPECTOR DRAWER (Modal Dialog overlay) */}
      {/* ==================================================================== */}
      <Dialog
        isOpen={selectedEmployee !== null}
        onClose={() => setSelectedEmployee(null)}
        title={`Worker Inspection Profile: ${selectedEmployee?.full_name}`}
        size="xl"
      >
        {selectedEmployee && (
          <div className="space-y-6">
            
            {/* Header profile block */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-zinc-950 rounded-xl border border-zinc-850">
              <div className="flex items-center gap-3.5">
                <div className="h-14 w-14 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900 shrink-0">
                  <img
                    src={selectedEmployee.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                    alt={selectedEmployee.full_name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                    {selectedEmployee.full_name}
                    <Badge variant="success" className="text-4xs uppercase tracking-widest">{selectedEmployee.status}</Badge>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5 font-mono">{selectedEmployee.position}</p>
                  <span className="text-[10px] text-zinc-500 block mt-1 font-mono">Administrative SEC Registry: #{selectedEmployee.id}</span>
                </div>
              </div>

              {/* Status and core metadata */}
              <div className="flex flex-wrap gap-2.5 sm:text-right shrink-0">
                <div className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-850">
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block font-mono">Monthly Outflow scale</span>
                  <span className="text-xs font-mono font-extrabold text-zinc-200 mt-0.5 block">${selectedEmployee.salary?.toLocaleString()} USD</span>
                </div>
              </div>
            </div>

            {/* Profile Drawer Navigation */}
            <div className="flex overflow-x-auto gap-1 border-b border-zinc-850">
              {[
                { id: "info", label: "General & Emergency Contacts" },
                { id: "attendance", label: "SLA Duty Logs" },
                { id: "payroll", label: "Salary slips history" },
                { id: "performance", label: "Reviews & KPIs" },
                { id: "assets", label: "Assigned Assets & Vault" },
                { id: "ai-insights", label: "🤖 AI Assistant Coaching" }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setProfileTab(sub.id as any);
                    if (sub.id === "ai-insights" && !aiReportContent) {
                      triggerAIAction("predict-turnover", { employeeData: selectedEmployee });
                    }
                  }}
                  className={`px-3 py-2 text-3xs font-bold tracking-wide transition-colors shrink-0 uppercase border-b-2 font-mono cursor-pointer ${
                    profileTab === sub.id
                      ? `${getAccentClass("text")} border-indigo-500 bg-zinc-900/40`
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Profile Tab Renderers */}
            <div className="min-h-[220px] max-h-[380px] overflow-y-auto pr-1">
              {profileTab === "info" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-zinc-300">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-zinc-850 pb-1">Administrative Specs</h4>
                    <div className="space-y-2 font-mono">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Secure mail:</span>
                        <span className="text-zinc-200">{selectedEmployee.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">SLA Position:</span>
                        <span className="text-zinc-200">{selectedEmployee.position}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Department context:</span>
                        <span className="text-zinc-200">
                          {departments.find(d => d.id === selectedEmployee.department_id)?.name || "Autonomous Division"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Record Created:</span>
                        <span className="text-zinc-200">2026-01-14T00:00:00Z</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-zinc-850 pb-1">Emergency Operations contacts</h4>
                    <div className="space-y-2 font-mono">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Operational Backup:</span>
                        <span className="text-zinc-200">Athena EA Agent</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Secondary Node Channel:</span>
                        <span className="text-zinc-200">backup-agent@exshopi.ai</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Crisis phone:</span>
                        <span className="text-zinc-200">+1-555-0199</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Node Status check:</span>
                        <span className="text-emerald-400">All loops healthy</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {profileTab === "attendance" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-zinc-850 pb-1">Ingress shift history</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-2xs text-zinc-300">
                      <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                        <tr>
                          <th className="p-2 font-bold font-mono">Date</th>
                          <th className="p-2 font-bold font-mono">Clock In</th>
                          <th className="p-2 font-bold font-mono">Clock Out</th>
                          <th className="p-2 font-bold font-mono">SLA rating</th>
                          <th className="p-2 font-bold font-mono">Calculated Overtime</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850">
                        {attendance
                          .filter(a => a.employee_id === selectedEmployee.id)
                          .map(rec => (
                            <tr key={rec.id}>
                              <td className="p-2 font-mono">{rec.date}</td>
                              <td className="p-2 font-mono">{rec.clock_in}</td>
                              <td className="p-2 font-mono">{rec.clock_out || "Active duty"}</td>
                              <td className="p-2">
                                <Badge variant={rec.status === "On Time" ? "success" : "warning"} className="scale-75 origin-left">
                                  {rec.status}
                                </Badge>
                              </td>
                              <td className="p-2 font-mono">{rec.overtime > 0 ? `+${rec.overtime}h` : "—"}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {profileTab === "payroll" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-zinc-850 pb-1">Settled salary slips</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-2xs text-zinc-300">
                      <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                        <tr>
                          <th className="p-2 font-bold font-mono">Period</th>
                          <th className="p-2 font-bold font-mono">Base salary</th>
                          <th className="p-2 font-bold font-mono">Performance Bonus</th>
                          <th className="p-2 font-bold font-mono">Deductions</th>
                          <th className="p-2 font-bold font-mono">Net Settlement</th>
                          <th className="p-2 font-bold font-mono">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850">
                        {payroll
                          .filter(p => p.employee_id === selectedEmployee.id)
                          .map(rec => (
                            <tr key={rec.id}>
                              <td className="p-2 font-mono">{rec.period}</td>
                              <td className="p-2 font-mono">${rec.salary?.toLocaleString()}</td>
                              <td className="p-2 font-mono text-emerald-400">+${rec.bonuses?.toLocaleString()}</td>
                              <td className="p-2 font-mono text-rose-400">-${rec.deductions?.toLocaleString()}</td>
                              <td className="p-2 font-mono text-white font-bold">${rec.net_pay?.toLocaleString()}</td>
                              <td className="p-2">
                                <Badge variant={rec.status === "Paid" ? "success" : "neutral"} className="scale-75 origin-left">
                                  {rec.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {profileTab === "performance" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-zinc-300">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-zinc-850 pb-1">KPI Goals</h4>
                    {goals
                      .filter(g => g.employee_id === selectedEmployee.id)
                      .map(g => (
                        <div key={g.id} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-850 space-y-1.5 font-mono">
                          <div className="flex justify-between font-bold text-zinc-200">
                            <span>{g.title}</span>
                            <span>{g.progress}%</span>
                          </div>
                          <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${g.progress}%` }} />
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-zinc-850 pb-1">H1 Historic evaluation</h4>
                    {reviews
                      .filter(r => r.employee_id === selectedEmployee.id)
                      .map(r => (
                        <div key={r.id} className="p-3 bg-zinc-950 rounded-lg border border-zinc-850 space-y-1">
                          <div className="flex justify-between items-center text-zinc-200 font-bold">
                            <span>H1 strategic assessment</span>
                            <span className="text-amber-400 text-3xs">{"★".repeat(r.rating)}</span>
                          </div>
                          <p className="text-zinc-400 italic font-sans text-3xs mt-1">"{r.feedback}"</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {profileTab === "assets" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-zinc-300">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-zinc-850 pb-1">Active Hardware & Keys</h4>
                    {assets
                      .filter(a => a.employee_id === selectedEmployee.id)
                      .map(asset => (
                        <div key={asset.id} className="p-2 bg-zinc-950 rounded-lg border border-zinc-850 flex justify-between font-mono">
                          <div>
                            <div className="text-zinc-200 font-bold">{asset.asset_name}</div>
                            <span className="text-4xs text-zinc-500 block mt-0.5">SN: {asset.serial_number}</span>
                          </div>
                          <Badge variant="success" className="scale-75 origin-right">{asset.status}</Badge>
                        </div>
                      ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-zinc-850 pb-1">Contract Documents Vault</h4>
                    {documents
                      .filter(d => d.employee_id === selectedEmployee.id)
                      .map(doc => (
                        <div key={doc.id} className="p-2 bg-zinc-950 rounded-lg border border-zinc-850 flex justify-between font-mono">
                          <div>
                            <div className="text-zinc-200 font-bold truncate max-w-[180px]">{doc.title}</div>
                            <span className="text-4xs text-zinc-500 block mt-0.5">Category: {doc.category}</span>
                          </div>
                          <button className="text-4xs text-indigo-400 hover:underline">Download PDF</button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {profileTab === "ai-insights" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-1">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" /> AI Operational Intelligence Model
                    </h4>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => triggerAIAction("predict-turnover", { employeeData: selectedEmployee })}
                        className={`px-2 py-1 rounded text-4xs font-bold font-mono transition-colors cursor-pointer ${
                          aiReportType === "predict-turnover" ? "bg-indigo-600 text-white" : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                        }`}
                      >
                        Scan Attrition Risk
                      </button>
                      <button
                        onClick={() => triggerAIAction("suggest-training", { employeeData: selectedEmployee })}
                        className={`px-2 py-1 rounded text-4xs font-bold font-mono transition-colors cursor-pointer ${
                          aiReportType === "suggest-training" ? "bg-indigo-600 text-white" : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                        }`}
                      >
                        Upskilling Recommendations
                      </button>
                      <button
                        onClick={() => triggerAIAction("recommend-promotion", { employeeData: selectedEmployee })}
                        className={`px-2 py-1 rounded text-4xs font-bold font-mono transition-colors cursor-pointer ${
                          aiReportType === "recommend-promotion" ? "bg-indigo-600 text-white" : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                        }`}
                      >
                        Promotion Review
                      </button>
                    </div>
                  </div>

                  {aiReportLoading ? (
                    <div className="p-8 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
                      <span>Inference engine compiling active database transaction logs & scoring attributes...</span>
                    </div>
                  ) : aiReportContent ? (
                    <div className="p-4 bg-zinc-950 rounded-xl border border-indigo-500/10 text-xs text-zinc-300 leading-relaxed font-sans shadow-inner max-h-56 overflow-y-auto">
                      <div className="markdown-body text-zinc-300 whitespace-pre-wrap">{aiReportContent}</div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-zinc-500">
                      Select one of the strategic AI modules above to execute neural pipeline scans.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-850">
              <Button variant="secondary" size="sm" onClick={() => setSelectedEmployee(null)}>
                Close Profile Inspector
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ==================================================================== */}
      {/* GLOBAL HR FORMS DIALOG DIALOGS */}
      {/* ==================================================================== */}

      {/* 1. Add Employee Profile */}
      <Dialog isOpen={showAddEmployee} onClose={() => setShowAddEmployee(false)} title="Register Worker Profile Entry">
        <form onSubmit={handleCreateEmployee} className="space-y-4 font-sans">
          <Input
            label="Full Profile Name"
            placeholder="Sophia AI"
            required
            value={empForm.full_name}
            onChange={(e) => setEmpForm({ ...empForm, full_name: e.target.value })}
          />
          <Input
            label="Administrative Secure Email"
            placeholder="sophia.sales@exshopi.ai"
            type="email"
            required
            value={empForm.email}
            onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
          />
          <Input
            label="Position / Role Title"
            placeholder="Senior Autonomous Sales Engineer"
            required
            value={empForm.position}
            onChange={(e) => setEmpForm({ ...empForm, position: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Salary Scale (USD/mo)"
              placeholder="3200"
              type="number"
              required
              value={empForm.salary}
              onChange={(e) => setEmpForm({ ...empForm, salary: parseInt(e.target.value) })}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Department Context</label>
              <select
                className="bg-zinc-950 text-zinc-200 border border-zinc-850 rounded-lg p-2.5 text-xs focus:outline-none h-10 font-mono"
                value={empForm.department_id}
                onChange={(e) => setEmpForm({ ...empForm, department_id: parseInt(e.target.value) })}
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
          <Button variant="primary" className="w-full mt-2" type="submit">Commit Worker Entry</Button>
        </form>
      </Dialog>

      {/* 2. Apply Leave Request */}
      <Dialog isOpen={showApplyLeave} onClose={() => setShowApplyLeave(false)} title="Draft Leave Request">
        <form onSubmit={handleApplyLeave} className="space-y-4 font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Applicant Node</label>
              <select
                className="bg-zinc-950 text-zinc-200 border border-zinc-850 rounded-lg p-2.5 text-xs focus:outline-none h-10 font-mono"
                value={leaveForm.employee_id}
                onChange={(e) => setLeaveForm({ ...leaveForm, employee_id: e.target.value })}
                required
              >
                <option value="">-- Choose employee --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.full_name || e.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Leave Type</label>
              <select
                className="bg-zinc-950 text-zinc-200 border border-zinc-850 rounded-lg p-2.5 text-xs focus:outline-none h-10 font-mono"
                value={leaveForm.type}
                onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
              >
                <option value="Vacation">Vacation</option>
                <option value="Sick">Sick</option>
                <option value="Personal">Personal</option>
                <option value="Maternity">Maternity</option>
                <option value="Paternity">Paternity</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              required
              value={leaveForm.start_date}
              onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              required
              value={leaveForm.end_date}
              onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
            />
          </div>

          <Input
            label="Strategic Justification / Reason"
            placeholder="Annual sandbox refactoring or backup synchronization intervals."
            required
            value={leaveForm.reason}
            onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
          />

          <Button variant="primary" className="w-full mt-2" type="submit">Submit Request</Button>
        </form>
      </Dialog>

      {/* 3. Add Job Openings */}
      <Dialog isOpen={showAddJob} onClose={() => setShowAddJob(false)} title="Instate Job Requisition">
        <form onSubmit={handleCreateJob} className="space-y-4 font-sans">
          <Input
            label="Position Title"
            placeholder="Autonomous Sales Engineer II"
            required
            value={jobForm.title}
            onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Department</label>
              <select
                className="bg-zinc-950 text-zinc-200 border border-zinc-850 rounded-lg p-2.5 text-xs focus:outline-none h-10 font-mono"
                value={jobForm.department}
                onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
              >
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
            <Input
              label="Location"
              placeholder="Remote (Global) / HQ SF"
              required
              value={jobForm.location}
              onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
            />
          </div>

          <Input
            label="Expected Compensation Bracket"
            placeholder="$120k - $150k"
            required
            value={jobForm.salary_range}
            onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })}
          />

          <Input
            label="Job Description Specs"
            placeholder="Summarize key metrics, capabilities and tools needed."
            required
            value={jobForm.description}
            onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
          />

          <Button variant="primary" className="w-full mt-2" type="submit">Deploy Job Listing</Button>
        </form>
      </Dialog>

      {/* 4. Add Candidate Profile */}
      <Dialog isOpen={showAddCandidate} onClose={() => setShowAddCandidate(false)} title="Register Candidate Profile">
        <form onSubmit={handleCreateCandidate} className="space-y-4 font-sans">
          <Input
            label="Candidate Full Name"
            placeholder="Maya Sterling"
            required
            value={candForm.name}
            onChange={(e) => setCandForm({ ...candForm, name: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email ID"
              placeholder="maya@gmail.com"
              type="email"
              required
              value={candForm.email}
              onChange={(e) => setCandForm({ ...candForm, email: e.target.value })}
            />
            <Input
              label="Phone Number"
              placeholder="+1-555-8833"
              value={candForm.phone}
              onChange={(e) => setCandForm({ ...candForm, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Target Requisition</label>
              <select
                className="bg-zinc-950 text-zinc-200 border border-zinc-850 rounded-lg p-2.5 text-xs focus:outline-none h-10 font-mono"
                value={candForm.job_id}
                onChange={(e) => setCandForm({ ...candForm, job_id: e.target.value })}
                required
              >
                <option value="">-- Select job --</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>
            <Input
              label="Skills (comma separated)"
              placeholder="React, TypeScript, LLMs, Node.js"
              required
              value={candForm.skills}
              onChange={(e) => setCandForm({ ...candForm, skills: e.target.value })}
            />
          </div>

          <Input
            label="Resume Abstract"
            placeholder="Key summaries of past system achievements and background."
            required
            value={candForm.resume}
            onChange={(e) => setCandForm({ ...candForm, resume: e.target.value })}
          />

          <Button variant="primary" className="w-full mt-2" type="submit">Commit Candidate Profile</Button>
        </form>
      </Dialog>

      {/* 5. Schedule Interview Slot */}
      <Dialog isOpen={showScheduleInterview} onClose={() => setShowScheduleInterview(false)} title="Schedule Interview Slot">
        <form onSubmit={handleScheduleInterview} className="space-y-4 font-sans">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Target Candidate Profile</label>
            <select
              className="bg-zinc-950 text-zinc-200 border border-zinc-850 rounded-lg p-2.5 text-xs focus:outline-none h-10 font-mono"
              value={intForm.candidate_id}
              onChange={(e) => setIntForm({ ...intForm, candidate_id: e.target.value })}
              required
            >
              <option value="">-- Select candidate --</option>
              {candidates.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.job_title})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Interview Date"
              type="date"
              required
              value={intForm.date}
              onChange={(e) => setIntForm({ ...intForm, date: e.target.value })}
            />
            <Input
              label="Time (SLA slot)"
              placeholder="11:00 AM"
              required
              value={intForm.time}
              onChange={(e) => setIntForm({ ...intForm, time: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Interview Stage</label>
              <select
                className="bg-zinc-950 text-zinc-200 border border-zinc-850 rounded-lg p-2.5 text-xs focus:outline-none h-10 font-mono"
                value={intForm.stage}
                onChange={(e) => setIntForm({ ...intForm, stage: e.target.value })}
              >
                <option value="Technical">Technical</option>
                <option value="System Design">System Design</option>
                <option value="Cultural">Cultural</option>
                <option value="Executive Review">Executive Review</option>
              </select>
            </div>
            <Input
              label="Assign Panelist / Interviewer"
              placeholder="Harper HR Agent"
              required
              value={intForm.interviewer}
              onChange={(e) => setIntForm({ ...intForm, interviewer: e.target.value })}
            />
          </div>

          <Button variant="primary" className="w-full mt-2" type="submit">Commit Scheduled Slot</Button>
        </form>
      </Dialog>

      {/* 6. Add Announcement Board */}
      <Dialog isOpen={showAddAnnouncement} onClose={() => setShowAddAnnouncement(false)} title="Broadcast Notice Board Announcement">
        <form onSubmit={handleCreateAnnouncement} className="space-y-4 font-sans">
          <Input
            label="Announcement Title"
            placeholder="Exshopi Labs Performance Evaluation Cycle"
            required
            value={annForm.title}
            onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
          />
          <Input
            label="Detailed Notice content"
            placeholder="Specify milestones, dates and target personnel groups."
            required
            value={annForm.content}
            onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Importance Rank</label>
            <select
              className="bg-zinc-950 text-zinc-200 border border-zinc-850 rounded-lg p-2.5 text-xs focus:outline-none h-10 font-mono"
              value={annForm.importance}
              onChange={(e) => setAnnForm({ ...annForm, importance: e.target.value })}
            >
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <Button variant="primary" className="w-full mt-2" type="submit">Publish notice</Button>
        </form>
      </Dialog>

    </div>
  );
};
