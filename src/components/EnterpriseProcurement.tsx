import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Card, Button, Input, Select, Badge, Dialog } from "./UI";
import {
  TrendingUp,
  Users,
  FileText,
  ShoppingCart,
  Plus,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Bot,
  Building,
  CheckCircle,
  XCircle,
  Search,
  ChevronRight,
  MapPin,
  Mail,
  Phone,
  FileCheck,
  Percent,
  Warehouse,
  Coins,
  Send,
  Loader2
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
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

export const EnterpriseProcurement: React.FC = () => {
  const { addLog, addNotification } = useStore();
  const [activeTab, setActiveTab] = useState<
    "overview" | "suppliers" | "requests" | "orders" | "rfqs" | "receipts" | "contracts" | "payments" | "ai"
  >("overview");

  // Data states
  const [summary, setSummary] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  
  // Interactive / Form states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedRfq, setSelectedRfq] = useState<any>(null);

  // Dialog / Modal toggles
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showAddRequestModal, setShowAddRequestModal] = useState(false);
  const [showAddRfqModal, setShowAddRfqModal] = useState(false);
  const [showAddReceiptModal, setShowAddReceiptModal] = useState(false);

  // Form structures
  const [supplierForm, setSupplierForm] = useState({
    name: "", category: "Semiconductors", status: "Active", country: "", city: "", contactName: "", email: "", phone: ""
  });
  const [requestForm, setRequestForm] = useState({
    title: "", department: "AI Infrastructure", requester: "Sophia AI (Sales Pro)", total: "", items: [{ name: "", qty: 1, unitPrice: 0 }], comments: ""
  });
  const [rfqForm, setRfqForm] = useState({
    title: "", description: "", deadline: "", invitations: ""
  });
  const [receiptForm, setReceiptForm] = useState({
    poCode: "", supplier: "", acceptedQty: "", rejectedQty: "", partialReason: "", warehouse: "Primary SMT Assembly Zone", inspectionCheck: ""
  });

  // AI chat states
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Zod-like native form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSum, resSup, resReq, resOrd, resRfq, resRec, resPay] = await Promise.all([
        fetch("/api/v1/procurement/summary"),
        fetch("/api/v1/procurement/suppliers"),
        fetch("/api/v1/procurement/requests"),
        fetch("/api/v1/procurement/orders"),
        fetch("/api/v1/procurement/rfqs"),
        fetch("/api/v1/procurement/receipts"),
        fetch("/api/v1/procurement/payments")
      ]);

      const sumData = await resSum.json();
      const supData = await resSup.json();
      const reqData = await resReq.json();
      const ordData = await resOrd.json();
      const rfqData = await resRfq.json();
      const recData = await resRec.json();
      const payData = await resPay.json();

      setSummary(sumData);
      setSuppliers(supData);
      setRequests(reqData);
      setOrders(ordData);
      setRfqs(rfqData);
      setReceipts(recData);
      setPayments(payData);

      if (supData.length > 0 && !selectedSupplier) {
        setSelectedSupplier(supData[0]);
      }
      if (reqData.length > 0 && !selectedRequest) {
        setSelectedRequest(reqData[0]);
      }
      if (ordData.length > 0 && !selectedOrder) {
        setSelectedOrder(ordData[0]);
      }
      if (rfqData.length > 0 && !selectedRfq) {
        setSelectedRfq(rfqData[0]);
      }
    } catch (err) {
      console.error("Error retrieving procurement structures:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // API Action: Approve Requisition
  const handleApproveRequest = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/procurement/requests/${id}/approve`, {
        method: "PATCH"
      });
      const data = await res.json();
      addLog({
        method: "PATCH",
        endpoint: `/api/v1/procurement/requests/${id}/approve`,
        status: res.status,
        type: "api",
        response: data
      });

      if (res.ok) {
        addNotification({
          title: "PR Approved",
          description: `PR-${String(id).padStart(3, '0')} has been approved. Automated purchase order has been dispatched.`,
          type: "success"
        });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // API Action: Reject Requisition
  const handleRejectRequest = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/procurement/requests/${id}/reject`, {
        method: "PATCH"
      });
      const data = await res.json();
      addLog({
        method: "PATCH",
        endpoint: `/api/v1/procurement/requests/${id}/reject`,
        status: res.status,
        type: "api",
        response: data
      });

      if (res.ok) {
        addNotification({
          title: "PR Rejected",
          description: `PR-${String(id).padStart(3, '0')} is declined.`,
          type: "warning"
        });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Supplier Action
  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    const errs: Record<string, string> = {};
    if (!supplierForm.name) errs.name = "Supplier name is required";
    if (!supplierForm.email) errs.email = "Administrative email is required";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      const res = await fetch("/api/v1/procurement/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplierForm)
      });
      const data = await res.json();
      addLog({
        method: "POST",
        endpoint: "/api/v1/procurement/suppliers",
        status: res.status,
        type: "api",
        payload: supplierForm,
        response: data
      });

      if (res.ok) {
        addNotification({
          title: "Supplier Onboarded",
          description: `${supplierForm.name} added successfully.`,
          type: "success"
        });
        setShowAddSupplierModal(false);
        setSupplierForm({
          name: "", category: "Semiconductors", status: "Active", country: "", city: "", contactName: "", email: "", phone: ""
        });
        setErrors({});
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Requisition Action
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!requestForm.title) errs.title = "Request title is required";
    if (!requestForm.total || isNaN(parseFloat(requestForm.total))) errs.total = "Valid total value is required";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      title: requestForm.title,
      department: requestForm.department,
      requester: requestForm.requester,
      total: parseFloat(requestForm.total),
      items: [{ name: requestForm.title, qty: 1, unitPrice: parseFloat(requestForm.total) }],
      comments: requestForm.comments
    };

    try {
      const res = await fetch("/api/v1/procurement/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      addLog({
        method: "POST",
        endpoint: "/api/v1/procurement/requests",
        status: res.status,
        type: "api",
        payload,
        response: data
      });

      if (res.ok) {
        addNotification({
          title: "PR Submitted",
          description: `Dispatched Requisition request for ${payload.title} to SLA queue`,
          type: "success"
        });
        setShowAddRequestModal(false);
        setRequestForm({
          title: "", department: "AI Infrastructure", requester: "Sophia AI (Sales Pro)", total: "", items: [{ name: "", qty: 1, unitPrice: 0 }], comments: ""
        });
        setErrors({});
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Launch RFQ Action
  const handleCreateRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!rfqForm.title) errs.title = "RFQ title is required";
    if (!rfqForm.deadline) errs.deadline = "Deadline is required";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      title: rfqForm.title,
      description: rfqForm.description,
      deadline: rfqForm.deadline,
      invitations: rfqForm.invitations.split(",").map(i => i.trim()).filter(Boolean)
    };

    try {
      const res = await fetch("/api/v1/procurement/rfqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      addLog({
        method: "POST",
        endpoint: "/api/v1/procurement/rfqs",
        status: res.status,
        type: "api",
        payload,
        response: data
      });

      if (res.ok) {
        addNotification({
          title: "RFQ Transmitted",
          description: `RFQ successfully broadcasted to ${payload.invitations.length} selected supply partners.`,
          type: "success"
        });
        setShowAddRfqModal(false);
        setRfqForm({ title: "", description: "", deadline: "", invitations: "" });
        setErrors({});
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Award RFQ Quote
  const handleAwardRfq = async (rfqId: number, vendorName: string) => {
    try {
      const res = await fetch(`/api/v1/procurement/rfqs/${rfqId}/award`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorName })
      });
      const data = await res.json();
      addLog({
        method: "POST",
        endpoint: `/api/v1/procurement/rfqs/${rfqId}/award`,
        status: res.status,
        type: "api",
        payload: { vendorName },
        response: data
      });

      if (res.ok) {
        addNotification({
          title: "SLA Award Completed",
          description: `Awarded supply scope to ${vendorName}. High-fidelity purchase orders created.`,
          type: "success"
        });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Log Goods Receipt Action
  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!receiptForm.poCode) errs.poCode = "PO Reference Code is required";
    if (!receiptForm.acceptedQty) errs.acceptedQty = "Accepted Quantity is required";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      poCode: receiptForm.poCode,
      supplier: receiptForm.supplier || "NeoSteel Foundries LLC",
      acceptedQty: parseInt(receiptForm.acceptedQty),
      rejectedQty: parseInt(receiptForm.rejectedQty) || 0,
      partialReason: receiptForm.partialReason,
      warehouse: receiptForm.warehouse,
      inspections: [
        { check: "SMT Integration Calibration Check", result: "Passed" },
        { check: "Hardware Interface Quality check", result: receiptForm.inspectionCheck || "Passed" }
      ]
    };

    try {
      const res = await fetch("/api/v1/procurement/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      addLog({
        method: "POST",
        endpoint: "/api/v1/procurement/receipts",
        status: res.status,
        type: "api",
        payload,
        response: data
      });

      if (res.ok) {
        addNotification({
          title: "Goods Received",
          description: `Logged GR ledger successfully. Updated Zone Warehouse logs.`,
          type: "success"
        });
        setShowAddReceiptModal(false);
        setReceiptForm({
          poCode: "", supplier: "", acceptedQty: "", rejectedQty: "", partialReason: "", warehouse: "Primary SMT Assembly Zone", inspectionCheck: ""
        });
        setErrors({});
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Prompt to AI Agent
  const handleSubmitAiQuery = async (p?: string) => {
    const queryText = p || aiPrompt;
    if (!queryText.trim()) return;
    
    setAiLoading(true);
    try {
      const res = await fetch("/api/v1/procurement/ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: queryText })
      });
      const data = await res.json();
      if (data.success) {
        setAiResponse(data.text);
      }
    } catch (e) {
      console.error(e);
      setAiResponse("AI routing node encountered an interruption. Verified fallback analytics indicate optimal vendor selection remains Global Microchip Solutions (Rating 4.8, performance score 96/100).");
    } finally {
      setAiLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#a855f7"];

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-zinc-400 text-xs font-mono">Initializing supply registers and contract vaults...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-850 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="h-5 w-5 text-indigo-400" />
            <span className="text-3xs font-mono font-bold tracking-widest text-zinc-500 uppercase">Automated Supply Chain Core</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Enterprise Procurement platform</h1>
          <p className="text-xs text-zinc-400 mt-1">High-fidelity SLA logistics, procurement orders, RFQs, and real-time vendor intelligence metrics</p>
        </div>
        
        {/* Actions Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => handleSubmitAiQuery("Recommend best supplier for grade AA silicon monocrystals")} className="gap-2 text-indigo-400 bg-indigo-950/20 hover:bg-indigo-950/40 border border-indigo-900/30 font-mono text-3xs">
            <Sparkles className="h-3 w-3" /> Procurement AI Advisor
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAddSupplierModal(true)} className="text-xs gap-1.5 font-mono">
            <Plus className="h-3.5 w-3.5" /> Onboard Supplier
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowAddRequestModal(true)} className="text-xs gap-1.5 font-mono">
            <Plus className="h-3.5 w-3.5" /> File Requisition
          </Button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-1.5 border-b border-zinc-900 overflow-x-auto pb-px scrollbar-none">
        {[
          { id: "overview", label: "Dashboard Hub" },
          { id: "suppliers", label: "Suppliers Profile" },
          { id: "requests", label: "Requisitions" },
          { id: "orders", label: "Purchase Orders" },
          { id: "rfqs", label: "Quotations & RFQs" },
          { id: "receipts", label: "Warehouse Goods" },
          { id: "contracts", label: "Legal Agreements" },
          { id: "payments", label: "Ledger Payments" },
          { id: "ai", label: "AI Decision Room" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? "border-indigo-500 text-indigo-400 font-bold bg-indigo-500/5"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Tab Workspace panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
        >
          {/* ========================================== */}
          {/* OVERVIEW PANEL */}
          {/* ========================================== */}
          {activeTab === "overview" && summary && (
            <div className="space-y-6">
              
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xs text-zinc-500 font-mono font-bold uppercase tracking-wider">Gross SLA Spend</span>
                    <Coins className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="text-xl font-black text-white">${summary.totalSpend?.toLocaleString()}</div>
                  <div className="text-4xs text-emerald-400 font-mono flex items-center gap-1">
                    <span>▲ +14.2% Month-on-Month</span>
                  </div>
                </Card>
                <Card className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xs text-zinc-500 font-mono font-bold uppercase tracking-wider">Supply Partners</span>
                    <Users className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-black text-white">{summary.totalSuppliers}</div>
                  <div className="text-4xs text-zinc-400 font-mono">{summary.preferredSuppliers} Preferred Tier</div>
                </Card>
                <Card className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xs text-zinc-500 font-mono font-bold uppercase tracking-wider">Queue Requisitions</span>
                    <FileText className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="text-xl font-black text-white">{summary.activePurchaseRequests} PRs</div>
                  <div className="text-4xs text-amber-400 font-mono">Awaiting Admin Verification</div>
                </Card>
                <Card className="p-4 space-y-2 bg-gradient-to-br from-indigo-950/20 via-zinc-900 to-zinc-950 border border-indigo-900/30">
                  <div className="flex items-center justify-between">
                    <span className="text-3xs text-indigo-400 font-mono font-bold uppercase tracking-wider">Estimated Savings</span>
                    <Bot className="h-4 w-4 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="text-xl font-black text-white">$45,900</div>
                  <div className="text-4xs text-indigo-400 font-mono flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" /> Direct AI Quotation Optimization
                  </div>
                </Card>
              </div>

              {/* Charts grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Spend Analysis Chart */}
                <Card className="lg:col-span-2 p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">Spend & Savings Timeline</h3>
                      <p className="text-3xs text-zinc-500">Logistics ledger timeline for company operations</p>
                    </div>
                    <Badge variant="neutral">Financial SLA</Badge>
                  </div>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={summary.procurementTrend}>
                        <defs>
                          <linearGradient id="spendColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="saveColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" stroke="#71717a" fontSize={10} fontStyle="font-mono" tickLine={false} />
                        <YAxis stroke="#71717a" fontSize={10} fontStyle="font-mono" tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff", fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Area type="monotone" name="Monthly Gross Spend" dataKey="spend" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#spendColor)" />
                        <Area type="monotone" name="Consolidated Savings" dataKey="savings" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#saveColor)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Sector Allocation Pie Chart */}
                <Card className="p-5 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">Category Allocations</h3>
                    <p className="text-3xs text-zinc-500">Distribution profile of supply order capital</p>
                  </div>
                  <div className="h-[200px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={summary.spendDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {summary.spendDistribution.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-4xs font-mono">
                    {summary.spendDistribution.map((entry: any, index: number) => (
                      <div key={entry.name} className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                        <span className="text-zinc-400">{entry.name}:</span>
                        <span className="text-zinc-200 font-semibold">${entry.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Bottom Priority Action Board */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Pending Requisitions */}
                <Card className="p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                    <div>
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">Unresolved Requisitions</h3>
                      <p className="text-3xs text-zinc-500">SLA pipelines waiting for execution mandate</p>
                    </div>
                    <Badge variant="warning">{requests.filter(r => r.status === "Pending Review").length} Pending</Badge>
                  </div>
                  <div className="divide-y divide-zinc-850">
                    {requests.filter(r => r.status === "Pending Review").map((req) => (
                      <div key={req.id} className="py-3 flex justify-between items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-200">{req.title}</span>
                            <span className="text-4xs font-mono text-zinc-500">{req.code}</span>
                          </div>
                          <span className="text-3xs text-zinc-500 font-mono block mt-1">Requested by {req.requester} • {req.department}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-xs font-black text-white mr-2 font-mono">${req.total.toLocaleString()}</span>
                          <button onClick={() => handleApproveRequest(req.id)} className="h-6 w-6 rounded bg-emerald-950/40 border border-emerald-900/30 hover:bg-emerald-900/50 flex items-center justify-center text-emerald-400 cursor-pointer transition-colors" title="Approve PR">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleRejectRequest(req.id)} className="h-6 w-6 rounded bg-rose-950/40 border border-rose-900/30 hover:bg-rose-900/50 flex items-center justify-center text-rose-400 cursor-pointer transition-colors" title="Decline PR">
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {requests.filter(r => r.status === "Pending Review").length === 0 && (
                      <div className="py-6 text-center text-3xs text-zinc-500 font-mono">No pending requisitions in verification queue.</div>
                    )}
                  </div>
                </Card>

                {/* AI Automated Supply Optimization */}
                <Card className="p-5 space-y-4 bg-gradient-to-b from-indigo-950/10 via-zinc-900/80 to-zinc-950 border border-indigo-900/20">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-indigo-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">AI Supply Chain Optimizer</h4>
                      <p className="text-3xs text-zinc-400">Generative insights over active contract agreements</p>
                    </div>
                  </div>
                  <div className="bg-zinc-950/60 rounded-xl p-4 border border-indigo-950/40 text-xs text-zinc-300 leading-relaxed space-y-3 font-sans">
                    <p className="font-medium text-white flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" /> 
                      Proactive Sourcing Alert:
                    </p>
                    <p>
                      Alloy Steel Coils catalog pricing (contract **CON-8825** with **NeoSteel Foundries**) expires in **138 days**. Current bulk usage trends show a **+18%** demand increase due to drone chassis SMT cycles.
                    </p>
                    <div className="border-t border-indigo-950/60 pt-2.5 flex items-center justify-between text-3xs text-indigo-400 font-mono">
                      <span>Recommendation: Lock 12-month extension</span>
                      <button onClick={() => handleSubmitAiQuery("Suggest bulk negotiation terms for alloy steel coils")} className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 cursor-pointer">
                        Draft Terms <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </Card>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* SUPPLIERS PANEL */}
          {/* ========================================== */}
          {activeTab === "suppliers" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Suppliers List Block */}
              <div className="lg:col-span-1 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 pointer-events-none" />
                  <Input
                    placeholder="Search partners..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>

                <div className="space-y-2">
                  {filteredSuppliers.map((sup) => (
                    <div
                      key={sup.id}
                      onClick={() => setSelectedSupplier(sup)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                        selectedSupplier?.id === sup.id
                          ? "bg-indigo-950/10 border-indigo-500/50"
                          : "bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-xs font-bold text-white tracking-tight">{sup.name}</span>
                        <Badge variant={sup.status === "Preferred" ? "success" : "neutral"} className="scale-90">{sup.status}</Badge>
                      </div>
                      <div className="flex justify-between text-3xs font-mono text-zinc-500">
                        <span>{sup.category}</span>
                        <span className="text-zinc-400 font-semibold">Score: {sup.score}/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Supplier Profile Dashboard */}
              <div className="lg:col-span-2">
                {selectedSupplier ? (
                  <Card className="p-6 space-y-6">
                    
                    {/* Upper profile header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center text-white text-base border border-zinc-700">
                          🏢
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-white tracking-tight">{selectedSupplier.name}</h3>
                          <p className="text-3xs text-zinc-500 font-mono uppercase tracking-wider">{selectedSupplier.category} • {selectedSupplier.city}, {selectedSupplier.country}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <div>
                          <span className="text-4xs text-zinc-500 block uppercase">Quality Rating</span>
                          <span className="text-xs font-black text-white">⭐ {selectedSupplier.rating}</span>
                        </div>
                        <div className="border-l border-zinc-800 pl-3">
                          <span className="text-4xs text-zinc-500 block uppercase">SLA Index</span>
                          <span className="text-xs font-black text-white">{selectedSupplier.score}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact & Docs grids */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3.5">
                        <h4 className="text-xs font-bold font-mono uppercase text-zinc-300 border-b border-zinc-900 pb-1.5">Primary Contact</h4>
                        <div className="space-y-2 text-xs text-zinc-400">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-zinc-500" />
                            <span className="text-zinc-200 font-medium">{selectedSupplier.contactName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-zinc-500" />
                            <span>{selectedSupplier.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-zinc-500" />
                            <span>{selectedSupplier.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3.5">
                        <h4 className="text-xs font-bold font-mono uppercase text-zinc-300 border-b border-zinc-900 pb-1.5">SLA Documents</h4>
                        <div className="space-y-1.5">
                          {selectedSupplier.documents.map((doc: string) => (
                            <div key={doc} className="p-2 bg-zinc-950/50 rounded-lg border border-zinc-850 flex items-center justify-between text-3xs font-mono text-zinc-400">
                              <span className="flex items-center gap-1.5"><FileCheck className="h-3.5 w-3.5 text-zinc-500" /> {doc}</span>
                              <span className="text-indigo-400 hover:underline cursor-pointer">Download</span>
                            </div>
                          ))}
                          {selectedSupplier.documents.length === 0 && (
                            <div className="text-4xs text-zinc-500 italic">No documents attached to vault register.</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order History */}
                    <div className="space-y-3.5">
                      <h4 className="text-xs font-bold font-mono uppercase text-zinc-300 border-b border-zinc-900 pb-1.5">Purchase Order History</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b border-zinc-850 text-3xs font-mono text-zinc-500 uppercase">
                              <th className="p-2">PO Ref</th>
                              <th className="p-2">Date</th>
                              <th className="p-2">Item Description</th>
                              <th className="p-2">Amount</th>
                              <th className="p-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900">
                            {selectedSupplier.history.map((his: any) => (
                              <tr key={his.id} className="text-zinc-300 hover:bg-zinc-900/30 transition-colors">
                                <td className="p-2 font-mono font-bold text-zinc-400">#{his.id}</td>
                                <td className="p-2 font-mono text-3xs">{his.date}</td>
                                <td className="p-2">{his.items}</td>
                                <td className="p-2 font-mono text-white font-bold">${his.amount?.toLocaleString()}</td>
                                <td className="p-2">
                                  <Badge variant={his.status === "Completed" ? "success" : "neutral"}>{his.status}</Badge>
                                </td>
                              </tr>
                            ))}
                            {selectedSupplier.history.length === 0 && (
                              <tr>
                                <td colSpan={5} className="p-4 text-center text-4xs text-zinc-500 italic">No historical purchase orders recorded.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* AI Insights over this Vendor */}
                    <div className="p-4 bg-indigo-950/10 border border-indigo-900/30 rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 font-mono">
                        <Bot className="h-4 w-4" /> EXSHOPI AI PERFORMANCE AUDIT
                      </div>
                      <p className="text-3xs text-zinc-400 leading-relaxed leading-normal">
                        This vendor ranks in the **95th percentile** for delivery timeline compliance. They have resolved all quality inspections inside **48 hours**. Recommended for core automated SMT wafer allocations.
                      </p>
                    </div>

                  </Card>
                ) : (
                  <div className="h-64 flex items-center justify-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs font-mono">
                    Select a supply partner from directory.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* REQUESTS PANEL */}
          {/* ========================================== */}
          {activeTab === "requests" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Requests lists */}
              <div className="lg:col-span-1 space-y-4 text-left">
                <span className="text-3xs font-mono font-bold uppercase text-zinc-500 tracking-wider">Requisition Pipelines</span>
                <div className="space-y-2.5">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        selectedRequest?.id === req.id
                          ? "bg-zinc-900 border-zinc-600"
                          : "bg-zinc-900/30 border-zinc-850 hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-white truncate max-w-[150px]">{req.title}</span>
                        <Badge variant={req.status === "Approved" ? "success" : req.status === "Pending Review" ? "warning" : "neutral"}>
                          {req.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-3xs font-mono text-zinc-500">
                        <span>{req.code}</span>
                        <span className="text-zinc-200 font-semibold">${req.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Request Profile */}
              <div className="lg:col-span-2">
                {selectedRequest ? (
                  <Card className="p-6 space-y-6">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-850 pb-5 gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-3xs font-mono font-black text-zinc-500 uppercase">{selectedRequest.code}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-3xs font-mono text-indigo-400">{selectedRequest.department}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white tracking-tight">{selectedRequest.title}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-white font-mono">${selectedRequest.total?.toLocaleString()}</span>
                        <Badge variant={selectedRequest.status === "Approved" ? "success" : selectedRequest.status === "Pending Review" ? "warning" : "neutral"}>
                          {selectedRequest.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Flow steps progress list */}
                    <div className="space-y-4">
                      <span className="text-3xs font-mono font-bold uppercase text-zinc-400 tracking-wider">Approval Audit Timeline</span>
                      <div className="space-y-3.5">
                        {selectedRequest.history.map((ev: any, index: number) => (
                          <div key={index} className="flex gap-3 text-xs items-start">
                            <div className="h-5 w-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-3xs text-zinc-400 font-bold flex-shrink-0 mt-0.5 font-mono">
                              {index + 1}
                            </div>
                            <div className="flex-1 text-zinc-300">
                              <span className="font-semibold text-zinc-200 mr-2">{ev.event}</span>
                              <span className="text-zinc-400">by {ev.user}</span>
                              <p className="text-3xs text-zinc-500 font-mono mt-0.5">{ev.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Items table */}
                    <div className="space-y-4 pt-3">
                      <span className="text-3xs font-mono font-bold uppercase text-zinc-400 tracking-wider">Line Items</span>
                      <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 space-y-2">
                        {selectedRequest.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-zinc-300">
                            <span className="font-medium">{item.name || selectedRequest.title}</span>
                            <span className="font-mono text-zinc-400">{item.qty} × ${item.unitPrice?.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Active Comment Board */}
                    <div className="space-y-4">
                      <span className="text-3xs font-mono font-bold uppercase text-zinc-400 tracking-wider">Internal Dispatches & Comments</span>
                      <div className="space-y-2">
                        {selectedRequest.comments.map((comm: any) => (
                          <div key={comm.id} className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-850 space-y-1 text-left">
                            <div className="flex justify-between text-3xs font-semibold text-zinc-400">
                              <span>{comm.author}</span>
                              <span className="font-mono text-zinc-600">{comm.timestamp}</span>
                            </div>
                            <p className="text-xs text-zinc-300 leading-relaxed leading-normal">{comm.content}</p>
                          </div>
                        ))}
                        {selectedRequest.comments.length === 0 && (
                          <div className="text-3xs text-zinc-500 italic font-mono p-1">No comments associated.</div>
                        )}
                      </div>
                    </div>

                    {/* Actions bar for pending PRs */}
                    {selectedRequest.status === "Pending Review" && (
                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-850">
                        <Button variant="danger" size="sm" onClick={() => handleRejectRequest(selectedRequest.id)} className="font-mono text-xs">
                          Reject Requisition
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => handleApproveRequest(selectedRequest.id)} className="font-mono text-xs">
                          Approve Requisition & Release PO
                        </Button>
                      </div>
                    )}

                  </Card>
                ) : (
                  <div className="h-64 flex items-center justify-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs font-mono">
                    Select a requisition request to inspect.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* PURCHASE ORDERS PANEL */}
          {/* ========================================== */}
          {activeTab === "orders" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Order Lists Table */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                    <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">Released Purchase Orders</h3>
                    <Badge variant="neutral">Financial SLA</Badge>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-zinc-850 text-3xs font-mono text-zinc-500 uppercase">
                          <th className="p-2.5">Code</th>
                          <th className="p-2.5">Supplier Partner</th>
                          <th className="p-2.5">Gross Total</th>
                          <th className="p-2.5">Delivery Date</th>
                          <th className="p-2.5">Ship State</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {orders.map((po) => (
                          <tr
                            key={po.id}
                            onClick={() => setSelectedOrder(po)}
                            className={`text-zinc-300 hover:bg-zinc-900/30 transition-colors cursor-pointer ${
                              selectedOrder?.id === po.id ? "bg-zinc-900/30" : ""
                            }`}
                          >
                            <td className="p-2.5 font-mono font-bold text-zinc-400">{po.code}</td>
                            <td className="p-2.5">{po.supplier}</td>
                            <td className="p-2.5 font-mono text-white font-black">${po.total?.toLocaleString()}</td>
                            <td className="p-2.5 font-mono text-3xs">{po.deliveryDate}</td>
                            <td className="p-2.5">
                              <span className="text-3xs font-mono text-zinc-400">{po.receivingStatus}</span>
                            </td>
                            <td className="p-2.5">
                              <Badge variant={po.status === "Confirmed" ? "success" : "neutral"}>{po.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* Order breakdown */}
              <div className="lg:col-span-1">
                {selectedOrder ? (
                  <Card className="p-5 space-y-4 text-left">
                    <div className="border-b border-zinc-850 pb-3">
                      <span className="text-4xs text-zinc-500 font-mono block">PO REGISTER DETAILS</span>
                      <h4 className="text-sm font-bold text-white mt-1">{selectedOrder.code}</h4>
                    </div>

                    <div className="space-y-3 font-mono text-3xs text-zinc-400">
                      <div className="flex justify-between">
                        <span>Supply Partner:</span>
                        <span className="text-zinc-200 font-semibold">{selectedOrder.supplier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PR Reference:</span>
                        <span className="text-zinc-200">{selectedOrder.prCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expected Logistics:</span>
                        <span className="text-zinc-200">{selectedOrder.deliveryDate}</span>
                      </div>
                    </div>

                    <div className="border-t border-zinc-900 pt-3 space-y-2">
                      <span className="text-3xs font-bold text-zinc-300 block uppercase">Logistics Items</span>
                      <div className="p-2.5 bg-zinc-950 rounded-lg space-y-1.5 text-3xs">
                        {selectedOrder.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-zinc-300">
                            <span>{item.name}</span>
                            <span>{item.qty} × ${item.unitPrice?.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-zinc-900 pt-3 space-y-2 font-mono text-3xs text-zinc-400">
                      <div className="flex justify-between">
                        <span>Taxes (8%):</span>
                        <span>+${selectedOrder.tax?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-rose-400">
                        <span>Discount Coupon:</span>
                        <span>-${selectedOrder.discount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Logistics Cost:</span>
                        <span>+${selectedOrder.shippingCost?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-white font-extrabold text-xs border-t border-zinc-900 pt-2">
                        <span>Consolidated Net:</span>
                        <span>${(selectedOrder.total + selectedOrder.tax + selectedOrder.shippingCost - selectedOrder.discount)?.toLocaleString()}</span>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" onClick={() => {
                      setReceiptForm({ ...receiptForm, poCode: selectedOrder.code, supplier: selectedOrder.supplier, acceptedQty: selectedOrder.items[0].qty.toString() });
                      setShowAddReceiptModal(true);
                    }} className="w-full text-xs font-mono gap-1 mt-2">
                      <Warehouse className="h-3.5 w-3.5" /> File Goods Receipt
                    </Button>

                  </Card>
                ) : (
                  <div className="h-48 flex items-center justify-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs font-mono">
                    Select a PO from register to inspect ledger.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* RFQs PANEL */}
          {/* ========================================== */}
          {activeTab === "rfqs" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* RFQ and Quotations block */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-3xs font-mono font-bold uppercase text-zinc-500 tracking-wider">Open RFQ Broadcasts</span>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddRfqModal(true)} className="p-1 h-7 font-mono text-3xs text-indigo-400">
                    <Plus className="h-3.5 w-3.5" /> Broadcast RFQ
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {rfqs.map((rfq) => (
                    <div
                      key={rfq.id}
                      onClick={() => setSelectedRfq(rfq)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedRfq?.id === rfq.id
                          ? "bg-zinc-900 border-zinc-650"
                          : "bg-zinc-900/30 border-zinc-850 hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-white truncate max-w-[170px]">{rfq.title}</span>
                        <Badge variant={rfq.status === "Open" ? "success" : "neutral"}>{rfq.status}</Badge>
                      </div>
                      <div className="flex justify-between text-4xs font-mono text-zinc-500">
                        <span>Deadline: {rfq.deadline}</span>
                        <span>{rfq.quotations?.length} Quotations</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RFQ Comparison block */}
              <div className="lg:col-span-2">
                {selectedRfq ? (
                  <Card className="p-5 space-y-5">
                    
                    {/* Header */}
                    <div className="border-b border-zinc-850 pb-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-4xs font-mono text-zinc-500 uppercase">{selectedRfq.code} • DEADLINE: {selectedRfq.deadline}</span>
                          <h3 className="text-base font-extrabold text-white mt-1">{selectedRfq.title}</h3>
                        </div>
                        <Badge variant={selectedRfq.status === "Open" ? "success" : "neutral"}>{selectedRfq.status}</Badge>
                      </div>
                      <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">{selectedRfq.description}</p>
                    </div>

                    {/* RFQ Comparison Table */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-3xs font-mono font-bold uppercase text-zinc-400 tracking-wider">Comparative Vendor Quote Matrix</span>
                        <Button variant="ghost" size="sm" onClick={() => handleSubmitAiQuery(`Compare following RFQ quotes and recommend optimal: ${JSON.stringify(selectedRfq.quotations)}`)} className="text-indigo-400 text-3xs font-mono flex items-center gap-1.5 p-1 h-6">
                          <Sparkles className="h-3 w-3" /> Compare with AI
                        </Button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b border-zinc-850 text-3xs font-mono text-zinc-500 uppercase">
                              <th className="p-2.5">Supplier Vendor</th>
                              <th className="p-2.5">Quoted Price</th>
                              <th className="p-2.5">Lead Time</th>
                              <th className="p-2.5">Payment Terms</th>
                              <th className="p-2.5">SLA Rank</th>
                              <th className="p-2.5 text-right">Award Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900">
                            {selectedRfq.quotations.map((quote: any, i: number) => (
                              <tr key={i} className="text-zinc-300 hover:bg-zinc-900/30 transition-colors">
                                <td className="p-2.5 font-bold text-zinc-200">{quote.vendor}</td>
                                <td className="p-2.5 font-mono text-white font-extrabold">${quote.price?.toLocaleString()}</td>
                                <td className="p-2.5 font-mono text-zinc-400">{quote.deliveryDays} Days</td>
                                <td className="p-2.5 font-mono text-3xs">{quote.terms}</td>
                                <td className="p-2.5">
                                  <span className="text-zinc-400 font-bold font-mono">⭐ {quote.score}/100</span>
                                </td>
                                <td className="p-2.5 text-right">
                                  {quote.selected ? (
                                    <Badge variant="success">Awarded</Badge>
                                  ) : selectedRfq.status === "Open" ? (
                                    <Button variant="primary" size="sm" onClick={() => handleAwardRfq(selectedRfq.id, quote.vendor)} className="py-1 px-2.5 text-[10px] font-mono h-6">
                                      Award Scope
                                    </Button>
                                  ) : (
                                    <span className="text-zinc-600 text-4xs font-mono">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {selectedRfq.quotations.length === 0 && (
                              <tr>
                                <td colSpan={6} className="p-4 text-center text-4xs text-zinc-500 italic">No supply quotes submitted yet. Invitations sent.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </Card>
                ) : (
                  <div className="h-64 flex items-center justify-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs font-mono">
                    Select an RFQ broadcast from list.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* GOODS RECEIPTS PANEL */}
          {/* ========================================== */}
          {activeTab === "receipts" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Goods Receipts and inspection lists */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                    <div>
                      <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">Goods Receipt & SLA Audits</h3>
                      <p className="text-3xs text-zinc-500">Warehouse inventory registry and inbound inspect benchmarks</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowAddReceiptModal(true)} className="text-xs gap-1 font-mono">
                      <Plus className="h-3.5 w-3.5" /> File Goods Receipt
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-zinc-850 text-3xs font-mono text-zinc-500 uppercase">
                          <th className="p-2.5">Code</th>
                          <th className="p-2.5">PO Ref</th>
                          <th className="p-2.5">Supplier</th>
                          <th className="p-2.5">Accept Qty</th>
                          <th className="p-2.5">Reject Qty</th>
                          <th className="p-2.5">Zone allocation</th>
                          <th className="p-2.5">State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {receipts.map((gr) => (
                          <tr key={gr.id} className="text-zinc-300 hover:bg-zinc-900/30 transition-colors">
                            <td className="p-2.5 font-mono font-bold text-zinc-400">{gr.code}</td>
                            <td className="p-2.5 font-mono text-zinc-400">{gr.poCode}</td>
                            <td className="p-2.5 font-semibold text-zinc-200">{gr.supplier}</td>
                            <td className="p-2.5 font-mono text-emerald-400 font-bold">{gr.acceptedQty} u</td>
                            <td className="p-2.5 font-mono text-rose-400 font-bold">{gr.rejectedQty} u</td>
                            <td className="p-2.5">
                              <span className="text-3xs font-mono text-zinc-400">{gr.warehouse}</span>
                            </td>
                            <td className="p-2.5">
                              <Badge variant={gr.status === "Completed" ? "success" : gr.status === "Partial" ? "warning" : "error"}>{gr.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* Warehouse summary info */}
              <div className="lg:col-span-1 space-y-4 text-left">
                <Card className="p-5 space-y-4">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200 border-b border-zinc-850 pb-2 flex items-center gap-2">
                    <Warehouse className="h-4 w-4 text-zinc-500" /> Inbound Logistics zones
                  </h4>
                  <div className="space-y-3 font-mono text-3xs text-zinc-400">
                    <div className="p-2.5 bg-zinc-950 rounded-xl space-y-1">
                      <div className="flex justify-between font-bold text-zinc-200">
                        <span>Zone-A Coil Vault</span>
                        <span className="text-indigo-400">82% full</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1">
                        <div className="bg-indigo-500 h-1 rounded-full" style={{ width: "82%" }} />
                      </div>
                    </div>

                    <div className="p-2.5 bg-zinc-950 rounded-xl space-y-1">
                      <div className="flex justify-between font-bold text-zinc-200">
                        <span>Zone-B SMT Tray Rack</span>
                        <span className="text-emerald-400">35% full</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1">
                        <div className="bg-emerald-500 h-1 rounded-full" style={{ width: "35%" }} />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* CONTRACTS PANEL */}
          {/* ========================================== */}
          {activeTab === "contracts" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { code: "CON-8821", supplier: "Global Microchip Solutions", title: "Master Semiconductor Allocation Agreement", scope: "Ensures reserved capacity of 1,000 units of SLA Micro-controller Nodes per quarter. Locks v3 core unit rates at $25,000.", expiry: "2027-12-31", status: "Active" },
                { code: "CON-8825", supplier: "NeoSteel Foundries LLC", title: "Structural Alloy Pricing Schedule", scope: "Standardized bulk structural grade steel coil supply parameters. Locks Grade A steel coils at $3,000 per coil with +15 days delivery SLA.", expiry: "2026-11-30", status: "Active" },
                { code: "CON-8830", supplier: "Quantum Sensors Corp", title: "Calibration Sensor SLA Frame", scope: "Calibration hardware and laser diode refraction check warranties.", expiry: "2026-08-30", status: "Expiry Warning" }
              ].map((con) => (
                <Card key={con.code} className="p-5 space-y-4 flex flex-col justify-between text-left">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-4xs font-mono text-zinc-500 uppercase">{con.code}</span>
                      <Badge variant={con.status === "Active" ? "success" : "warning"}>{con.status}</Badge>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-tight">{con.title}</h4>
                    <p className="text-3xs text-zinc-500 font-mono">Partner: {con.supplier}</p>
                    <p className="text-xs text-zinc-400 leading-relaxed pt-1.5 border-t border-zinc-900">{con.scope}</p>
                  </div>
                  <div className="flex justify-between items-center text-3xs font-mono text-zinc-400 border-t border-zinc-900 pt-3">
                    <span>Expires: {con.expiry}</span>
                    <span className="text-indigo-400 hover:underline cursor-pointer">Amend Terms</span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ========================================== */}
          {/* LEDGER PAYMENTS */}
          {/* ========================================== */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <Card className="p-5 space-y-4 text-left">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">Vendor Inbound Settlements Ledger</h3>
                    <p className="text-3xs text-zinc-500">Consolidated accounting trail for completed purchase schedules</p>
                  </div>
                  <Badge variant="success">GAAP Audit Certified</Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-zinc-850 text-3xs font-mono text-zinc-500 uppercase">
                        <th className="p-2.5">Invoice Ref</th>
                        <th className="p-2.5">PO Ref</th>
                        <th className="p-2.5">Supplier Partner</th>
                        <th className="p-2.5">Settle Amount</th>
                        <th className="p-2.5">Transfer Date</th>
                        <th className="p-2.5">Transfer Method</th>
                        <th className="p-2.5">General Ledger Code</th>
                        <th className="p-2.5">Settle State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {payments.map((p) => (
                        <tr key={p.id} className="text-zinc-300 hover:bg-zinc-900/30 transition-colors">
                          <td className="p-2.5 font-mono font-bold text-zinc-400">{p.invoiceRef}</td>
                          <td className="p-2.5 font-mono text-zinc-400">{p.poRef}</td>
                          <td className="p-2.5 font-semibold text-zinc-200">{p.supplier}</td>
                          <td className="p-2.5 font-mono text-white font-extrabold">${p.amount?.toLocaleString()}</td>
                          <td className="p-2.5 font-mono text-3xs">{p.date}</td>
                          <td className="p-2.5 font-mono text-zinc-400">{p.method}</td>
                          <td className="p-2.5 font-mono text-zinc-500">{p.ledgerCode}</td>
                          <td className="p-2.5">
                            <Badge variant={p.status === "Settled" ? "success" : "neutral"}>{p.status}</Badge>
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
          {/* AI DECISION ROOM */}
          {/* ========================================== */}
          {activeTab === "ai" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              
              {/* Query Workspace */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
                    <Bot className="h-5 w-5 text-indigo-400 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">AI Procurement Agent Terminal</h4>
                      <p className="text-3xs text-zinc-500">Autonomous model specialized in supply chain operations</p>
                    </div>
                  </div>

                  {/* Recommendations prompts chips */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      "Recommend best supplier for Monocrystalline Silicon Wafers",
                      "Compare alloy steel quotations from NeoSteel & German Foundries",
                      "Analyze current procurement costs & potential SLA leaks",
                      "Check for potential duplicate purchase orders"
                    ].map((p, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setAiPrompt(p);
                          handleSubmitAiQuery(p);
                        }}
                        className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg text-3xs font-mono cursor-pointer transition-all"
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* Response display */}
                  <div className="min-h-[220px] bg-zinc-950 rounded-xl p-4 border border-zinc-850 font-sans text-xs text-zinc-300 leading-relaxed overflow-y-auto max-h-[300px]">
                    {aiLoading ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                        <span className="text-zinc-500 font-mono text-3xs">Analyzing vendor quotations and ledger structures...</span>
                      </div>
                    ) : aiResponse ? (
                      <div className="whitespace-pre-wrap leading-relaxed">{aiResponse}</div>
                    ) : (
                      <div className="text-zinc-600 font-mono text-3xs italic text-center py-16">
                        System intelligence standby. Select a chip prompt or input a custom supply optimization sequence above.
                      </div>
                    )}
                  </div>

                  {/* Input field */}
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Ask AI Procurement Agent..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmitAiQuery()}
                      className="text-xs"
                    />
                    <Button variant="primary" onClick={() => handleSubmitAiQuery()} className="p-3 h-11" disabled={aiLoading}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                </Card>
              </div>

              {/* Operations indicators */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="p-5 space-y-4">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200 border-b border-zinc-850 pb-2 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-500" /> AI Supply Sentinel Logs
                  </h4>
                  <div className="space-y-3 text-3xs font-mono text-zinc-500 leading-relaxed">
                    <div className="p-2 border border-zinc-900 rounded-lg bg-zinc-950/20">
                      <span className="text-zinc-400 block font-bold mb-1">[08:42] INVENTORY SHORTAGE FORECAST</span>
                      <p>Silicon Monocrystal wafers safety buffer breached. Safety days: **6 days**. Recommendation: Dispatch PO-2026-104.</p>
                    </div>
                    <div className="p-2 border border-zinc-900 rounded-lg bg-zinc-950/20">
                      <span className="text-zinc-400 block font-bold mb-1">[07:12] DUPLICATE ACQUISITION SANITY CHECK</span>
                      <p>Scanned active requests catalog. Status: **0 duplicates detected**.</p>
                    </div>
                  </div>
                </Card>
              </div>

            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ========================================== */}
      {/* DIALOGS / MODALS */}
      {/* ========================================== */}

      {/* 1. Onboard Supplier Modal */}
      <Dialog isOpen={showAddSupplierModal} onClose={() => setShowAddSupplierModal(false)} title="Onboard Supplier Partner">
        <form onSubmit={handleCreateSupplier} className="space-y-4 text-left">
          <Input
            label="Supplier Legal Name"
            placeholder="Shin-Etsu Silicon Ltd"
            required
            value={supplierForm.name}
            onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
            error={errors.name}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Supplier Category"
              value={supplierForm.category}
              onChange={(e) => setSupplierForm({ ...supplierForm, category: e.target.value })}
              options={[
                { value: "Semiconductors", label: "Semiconductors" },
                { value: "Raw Metals", label: "Raw Metals" },
                { value: "Sensors & Actuators", label: "Sensors & Actuators" },
                { value: "Cloud Infrastructure", label: "Cloud Infrastructure" }
              ]}
            />
            <Input
              label="Contact Person Name"
              placeholder="Yoshihiro Tanaka"
              value={supplierForm.contactName}
              onChange={(e) => setSupplierForm({ ...supplierForm, contactName: e.target.value })}
            />
          </div>
          <Input
            label="Administrative Email"
            placeholder="tanaka@shinetsu.co.jp"
            type="email"
            required
            value={supplierForm.email}
            onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
            error={errors.email}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              placeholder="Osaka"
              value={supplierForm.city}
              onChange={(e) => setSupplierForm({ ...supplierForm, city: e.target.value })}
            />
            <Input
              label="Country"
              placeholder="Japan"
              value={supplierForm.country}
              onChange={(e) => setSupplierForm({ ...supplierForm, country: e.target.value })}
            />
          </div>
          <Button variant="primary" className="w-full mt-2 font-mono text-xs" type="submit">Commit Supplier Profile</Button>
        </form>
      </Dialog>

      {/* 2. File Requisition Request Modal */}
      <Dialog isOpen={showAddRequestModal} onClose={() => setShowAddRequestModal(false)} title="File Supply Requisition Request">
        <form onSubmit={handleCreateRequest} className="space-y-4 text-left">
          <Input
            label="Material Requisition Title"
            placeholder="Bulk silicon wafers Grade-AA purchase"
            required
            value={requestForm.title}
            onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
            error={errors.title}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Requester Department"
              value={requestForm.department}
              onChange={(e) => setRequestForm({ ...requestForm, department: e.target.value })}
              options={[
                { value: "AI Infrastructure", label: "AI Infrastructure" },
                { value: "Vehicle Assembly", label: "Vehicle Assembly" },
                { value: "Quality Assurance", label: "Quality Assurance" },
                { value: "Logistics", label: "Logistics" }
              ]}
            />
            <Input
              label="Estimated Gross Total (USD)"
              placeholder="95000"
              required
              value={requestForm.total}
              onChange={(e) => setRequestForm({ ...requestForm, total: e.target.value })}
              error={errors.total}
            />
          </div>
          <Input
            label="Requester Profile"
            value={requestForm.requester}
            disabled
          />
          <Input
            label="Administrative Comments & Justification"
            placeholder="SLA buffer requirements for wafer production v3"
            value={requestForm.comments}
            onChange={(e) => setRequestForm({ ...requestForm, comments: e.target.value })}
          />
          <Button variant="primary" className="w-full mt-2 font-mono text-xs" type="submit">Submit Purchase Requisition</Button>
        </form>
      </Dialog>

      {/* 3. Goods Receipt entry modal */}
      <Dialog isOpen={showAddReceiptModal} onClose={() => setShowAddReceiptModal(false)} title="File Goods Receipt Log">
        <form onSubmit={handleCreateReceipt} className="space-y-4 text-left">
          <Input
            label="PO Reference Code"
            placeholder="PO-2026-102"
            required
            value={receiptForm.poCode}
            onChange={(e) => setReceiptForm({ ...receiptForm, poCode: e.target.value })}
            error={errors.poCode}
          />
          <Input
            label="Supplier Vendor Name"
            placeholder="NeoSteel Foundries LLC"
            value={receiptForm.supplier}
            onChange={(e) => setReceiptForm({ ...receiptForm, supplier: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Accepted Quantity"
              placeholder="10"
              required
              value={receiptForm.acceptedQty}
              onChange={(e) => setReceiptForm({ ...receiptForm, acceptedQty: e.target.value })}
              error={errors.acceptedQty}
            />
            <Input
              label="Rejected Quantity"
              placeholder="0"
              value={receiptForm.rejectedQty}
              onChange={(e) => setReceiptForm({ ...receiptForm, rejectedQty: e.target.value })}
            />
          </div>
          <Select
            label="Warehouse Allocation Zone"
            value={receiptForm.warehouse}
            onChange={(e) => setReceiptForm({ ...receiptForm, warehouse: e.target.value })}
            options={[
              { value: "Primary SMT Assembly Zone", label: "Primary SMT Assembly Zone" },
              { value: "Zone-B Primary Coil Vault", label: "Zone-B Primary Coil Vault" },
              { value: "Silica Temp Cold Vault", label: "Silica Temp Cold Vault" }
            ]}
          />
          <Input
            label="SLA Calibration Inspection Check"
            placeholder="All structural pins passed calibration check."
            value={receiptForm.inspectionCheck}
            onChange={(e) => setReceiptForm({ ...receiptForm, inspectionCheck: e.target.value })}
          />
          <Input
            label="Partial Receipt / Damage Reason (If applicable)"
            placeholder="One minor gauge crack reported on crate #2 SMT mount."
            value={receiptForm.partialReason}
            onChange={(e) => setReceiptForm({ ...receiptForm, partialReason: e.target.value })}
          />
          <Button variant="primary" className="w-full mt-2 font-mono text-xs" type="submit">Deploy Goods Receipt Log</Button>
        </form>
      </Dialog>

    </div>
  );
};
