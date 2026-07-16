import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Card, Button, Input, Select, Badge, Textarea } from "./UI";
import {
  DollarSign,
  TrendingUp,
  FileCheck2,
  Users,
  Search,
  Plus,
  RefreshCw,
  Sparkles,
  Bot,
  Loader2,
  CheckCircle,
  Truck,
  FileText,
  Percent,
  Calendar,
  MapPin,
  Mail,
  Sliders,
  ChevronRight,
  Activity
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
  Legend
} from "recharts";

export const EnterpriseSales: React.FC = () => {
  const { addLog, addNotification } = useStore();
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "quotes" | "customers" | "aiCoach">("overview");

  // State for loaded B2B data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerActs, setCustomerActs] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal toggle states
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [showAddQuote, setShowAddQuote] = useState(false);
  const [showOrderStatusModal, setShowOrderStatusModal] = useState<any>(null);

  // Form states
  const [orderForm, setOrderForm] = useState({
    orderNumber: "", currency: "USD", subtotalPrice: "", shippingAddress: "",
    sku: "", quantity: "1", price: ""
  });
  const [quoteForm, setQuoteForm] = useState({
    customerName: "", email: "", sku: "", quantity: "1", discountPercent: "0"
  });
  const [statusForm, setStatusForm] = useState("pending");

  // AI Coach States
  const [coachQuoteId, setCoachQuoteId] = useState("");
  const [coachAction, setCoachAction] = useState("followup");
  const [coachOutput, setCoachOutput] = useState<string | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch all B2B Sales Parameters
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resDash, resOrd, resQt, resCust] = await Promise.all([
        fetch("/api/v1/sales/dashboard"),
        fetch("/api/v1/sales/orders"),
        fetch("/api/v1/sales/quotes"),
        fetch("/api/v1/sales/customers")
      ]);

      const [dashJson, ordJson, qtJson, custJson] = await Promise.all([
        resDash.json(),
        resOrd.json(),
        resQt.json(),
        resCust.json()
      ]);

      if (dashJson.success) setDashboardData(dashJson.data);
      if (ordJson.success) setOrders(ordJson.data);
      if (qtJson.success) setQuotes(qtJson.data);
      if (custJson.success) setCustomers(custJson.data);

      // Default load first customer activities if present
      if (custJson.success && custJson.data.length > 0) {
        handleLoadCustomerActivities(custJson.data[0].id);
      }
    } catch (error) {
      console.error("Failed to sync B2B sales core: ", error);
      addNotification({
        title: "Sales Ledger Error",
        description: "Failed to connect to Exshopi Sales Ledger service.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleLoadCustomerActivities = async (id: number) => {
    setSelectedCustomerId(id);
    try {
      const res = await fetch(`/api/v1/sales/customers/${id}/activities`);
      const json = await res.json();
      if (json.success) setCustomerActs(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Order Submission Handlers
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!orderForm.orderNumber) errors.orderNumber = "Invoice order number is required";
    if (!orderForm.shippingAddress) errors.shippingAddress = "Shipping delivery destination is required";
    if (!orderForm.sku) errors.sku = "Select a product SKU";
    if (!orderForm.price || isNaN(Number(orderForm.price))) errors.price = "Enter product price";
    if (!orderForm.quantity || isNaN(Number(orderForm.quantity))) errors.quantity = "Enter quantity";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        orderNumber: orderForm.orderNumber,
        currency: orderForm.currency,
        subtotalPrice: parseFloat(orderForm.price) * parseInt(orderForm.quantity),
        shippingAddress: orderForm.shippingAddress,
        items: [{
          sku: orderForm.sku,
          quantity: parseInt(orderForm.quantity),
          price: parseFloat(orderForm.price)
        }]
      };

      const response = await fetch("/api/v1/sales/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "Enterprise Admin" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (data.success) {
        addNotification({
          title: "B2B Order Processed",
          description: `Logged order invoice: ${orderForm.orderNumber}`,
          type: "success"
        });
        addLog({
          method: "POST",
          endpoint: "/api/v1/sales/orders",
          status: 201,
          type: "api",
          payload,
          response: data
        });
        setShowAddOrder(false);
        setOrderForm({ orderNumber: "", currency: "USD", subtotalPrice: "", shippingAddress: "", sku: "", quantity: "1", price: "" });
        fetchAllData();
      }
    } catch (error: any) {
      addNotification({
        title: "Sales Logging Failed",
        description: error.message,
        type: "error"
      });
    }
  };

  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showOrderStatusModal) return;

    try {
      const response = await fetch(`/api/v1/sales/orders/${showOrderStatusModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-role": "Enterprise Admin" },
        body: JSON.stringify({ status: statusForm })
      });
      const data = await response.json();

      if (data.success) {
        addNotification({
          title: "Order Fulfilled",
          description: `Status for order #${showOrderStatusModal.id} updated to ${statusForm}.`,
          type: "success"
        });
        addLog({
          method: "PUT",
          endpoint: `/api/v1/sales/orders/${showOrderStatusModal.id}`,
          status: 200,
          type: "api",
          payload: { status: statusForm },
          response: data
        });
        setShowOrderStatusModal(null);
        fetchAllData();
      }
    } catch (error: any) {
      addNotification({
        title: "Lifecycle Update Failed",
        description: error.message,
        type: "error"
      });
    }
  };

  // Quote Submission Handlers
  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!quoteForm.customerName) errors.customerName = "B2B prospect name is required";
    if (!quoteForm.email) errors.email = "Client validation email is required";
    if (!quoteForm.sku) errors.sku = "Select item SKU";
    if (isNaN(Number(quoteForm.discountPercent))) errors.discountPercent = "Enter numerical discount %";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch("/api/v1/sales/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "Enterprise Admin" },
        body: JSON.stringify(quoteForm)
      });
      const data = await response.json();

      if (data.success) {
        addNotification({
          title: "B2B Proposal Created",
          description: `Contract proposal QT-${data.data.quoteNumber} issued.`,
          type: "success"
        });
        addLog({
          method: "POST",
          endpoint: "/api/v1/sales/quotes",
          status: 201,
          type: "api",
          payload: quoteForm,
          response: data
        });
        setShowAddQuote(false);
        setQuoteForm({ customerName: "", email: "", sku: "", quantity: "1", discountPercent: "0" });
        fetchAllData();
      }
    } catch (error: any) {
      addNotification({
        title: "RFQ Failure",
        description: error.message,
        type: "error"
      });
    }
  };

  const handleConvertQuoteToOrder = async (id: number, quoteNumber: string) => {
    try {
      const response = await fetch(`/api/v1/sales/quotes/${id}/convert`, {
        method: "POST",
        headers: { "x-user-role": "Enterprise Admin" }
      });
      const data = await response.json();

      if (data.success) {
        addNotification({
          title: "Contract Fully Executed",
          description: `Quote ${quoteNumber} converted completely to Paid Order.`,
          type: "success"
        });
        addLog({
          method: "POST",
          endpoint: `/api/v1/sales/quotes/${id}/convert`,
          status: 200,
          type: "api",
          response: data
        });
        fetchAllData();
      }
    } catch (error: any) {
      addNotification({
        title: "Execution Error",
        description: error.message,
        type: "error"
      });
    }
  };

  // AI Sales Outreach Coach
  const triggerAiCoach = async () => {
    if (!coachQuoteId) {
      addNotification({
        title: "Coach Parameter Missing",
        description: "Choose a B2B contract quote to trigger negotiation modeling.",
        type: "warning"
      });
      return;
    }

    setCoachLoading(true);
    setCoachOutput(null);
    try {
      const response = await fetch("/api/v1/sales/ai-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "Enterprise Admin" },
        body: JSON.stringify({ quoteId: coachQuoteId, action: coachAction })
      });
      const data = await response.json();

      if (data.success) {
        setCoachOutput(data.suggestion);
        addLog({
          method: "POST",
          endpoint: "/api/v1/sales/ai-sales",
          status: 200,
          type: "api",
          payload: { quoteId: coachQuoteId, action: coachAction },
          response: { length: data.suggestion.length }
        });
      }
    } catch (error: any) {
      addNotification({
        title: "AI Coaching Fault",
        description: error.message,
        type: "error"
      });
    } finally {
      setCoachLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || o.shippingAddress.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && o.status === statusFilter;
  });

  // Simulated chart data based on loaded orders
  const dailySalesData = orders.map(o => ({
    date: new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: o.totalPrice,
    discount: o.totalDiscount
  })).slice(0, 10);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-zinc-400 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-500" />
        <span className="text-xs uppercase tracking-wider font-mono">Loading B2B transactional logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/40 p-6 border border-zinc-800/80 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Sales OMS Ledger</h1>
            <Badge variant="accent">Revenue Desk</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            End-to-end order processing, contract quotations, customer pipelines, and Sophia AI contract negotiators.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={fetchAllData}>
            Sync
          </Button>
          <Button variant="primary" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowAddOrder(true)}>
            Draft Invoice Order
          </Button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-zinc-800/80 gap-1 overflow-x-auto pb-px">
        {[
          { id: "overview", label: "Financial Metrics", icon: <TrendingUp className="h-4 w-4" /> },
          { id: "orders", label: "Sales Orders", icon: <FileText className="h-4 w-4" /> },
          { id: "quotes", label: "RFQ Proposals", icon: <FileCheck2 className="h-4 w-4" /> },
          { id: "customers", label: "Customer Timeline", icon: <Users className="h-4 w-4" /> },
          { id: "aiCoach", label: "AI Sales Coach", icon: <Sparkles className="h-4 w-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === tab.id
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && dashboardData && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-2xs font-semibold text-zinc-500 uppercase tracking-wider">Gross Sales Invoiced</span>
                    <h3 className="text-xl font-bold text-zinc-100 mt-1">
                      ${dashboardData.grossSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xs text-emerald-400 mt-2 flex items-center gap-1 font-mono">
                  <span>● REVENUE PATHWAYS SECURED</span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-2xs font-semibold text-zinc-500 uppercase tracking-wider">Average Order Contract</span>
                    <h3 className="text-xl font-bold text-zinc-100 mt-1">
                      ${dashboardData.avgOrderValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xs text-zinc-500 mt-2 flex items-center gap-1 font-mono">
                  <span>CONVERSION PROBABILITY: {dashboardData.conversionRate}%</span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-2xs font-semibold text-zinc-500 uppercase tracking-wider">Outstanding Invoices</span>
                    <h3 className="text-xl font-bold text-zinc-100 mt-1">
                      ${dashboardData.pendingSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <Sliders className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xs text-zinc-500 mt-2 flex items-center gap-1 font-mono">
                  <span>PENDING BILLING RUNS: {dashboardData.pendingOrders}</span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-2xs font-semibold text-zinc-500 uppercase tracking-wider">B2B RFQ Pipeline</span>
                    <h3 className="text-xl font-bold text-zinc-100 mt-1">
                      ${dashboardData.quotePipelineValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xs text-amber-400 mt-2 flex items-center gap-1 font-mono">
                  <span>{dashboardData.activeQuotesCount} ACTIVE CUSTOM PROPOSALS</span>
                </div>
              </Card>
            </div>

            {/* Daily Sales Area Chart */}
            <Card className="p-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Chronological B2B Revenue Streams</h3>
                <p className="text-2xs text-zinc-500 mt-0.5">Historical breakdown of order contracts over daily settle cycles.</p>
              </div>
              <div className="h-[240px] mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailySalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 10 }} stroke="#27272a" />
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} stroke="#27272a" />
                    <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", color: "#f4f4f5" }} />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Settle Amount (USD)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === "orders" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-center bg-zinc-950/40 p-4 border border-zinc-800 rounded-xl">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter by Order Number or Destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs py-2 pl-9 pr-4 rounded-lg focus:outline-none"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs py-2 px-3 rounded-lg focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="paid">Paid</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <Card className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/30 text-3xs font-semibold uppercase tracking-wider text-zinc-400">
                    <th className="py-3 px-4">ORDER NUMBER</th>
                    <th className="py-3 px-4">LIFECYCLE STATUS</th>
                    <th className="py-3 px-4 text-right">TOTAL REVENUE</th>
                    <th className="py-3 px-4">DELIVERY ADDRESS</th>
                    <th className="py-3 px-4 font-mono">ORDERED ITEMS</th>
                    <th className="py-3 px-4">RECORDED ON</th>
                    <th className="py-3 px-4 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {filteredOrders.map((o: any) => (
                    <tr key={o.id} className="text-2xs hover:bg-zinc-900/20 text-zinc-300">
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-400">{o.orderNumber}</td>
                      <td className="py-3 px-4">
                        <Badge variant={o.status === "paid" || o.status === "completed" ? "success" : o.status === "pending" || o.status === "processing" ? "warning" : "error"}>
                          {o.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-400 font-semibold">${o.totalPrice.toLocaleString()}</td>
                      <td className="py-3 px-4 text-zinc-400 text-3xs truncate max-w-[150px]" title={o.shippingAddress}>
                        {o.shippingAddress}
                      </td>
                      <td className="py-3 px-4 text-zinc-300">
                        {o.items.map((i: any) => (
                          <div key={i.id} className="font-mono text-3xs text-zinc-400">
                            {i.sku} x {i.quantity} (${i.price.toLocaleString()})
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-500 text-3xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-7 text-2xs py-1"
                          onClick={() => {
                            setShowOrderStatusModal(o);
                            setStatusForm(o.status);
                          }}
                          icon={<Sliders className="h-3 w-3" />}
                        >
                          Lifecycle
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-zinc-600 text-2xs">
                        No invoices matches criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </motion.div>
        )}

        {activeTab === "quotes" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Custom Contract Proposals</h3>
                <p className="text-3xs text-zinc-500">Draft proposals, discount schedules, and checkout integrations.</p>
              </div>
              <Button variant="outline" size="sm" icon={<Plus className="h-3 w-3" />} onClick={() => setShowAddQuote(true)}>
                Prepare RFQ Quote
              </Button>
            </div>

            <Card className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/30 text-3xs font-semibold uppercase tracking-wider text-zinc-400">
                    <th className="py-3 px-4">QUOTE NUMBER</th>
                    <th className="py-3 px-4">B2B PROSPECT</th>
                    <th className="py-3 px-4 font-mono">SKU / DESCRIPTION</th>
                    <th className="py-3 px-4 text-right">QUANTITY</th>
                    <th className="py-3 px-4 text-right">DISCOUNT</th>
                    <th className="py-3 px-4 text-right">TOTAL QUOTE</th>
                    <th className="py-3 px-4">VALID UNTIL</th>
                    <th className="py-3 px-4 text-center">INTEGRATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {quotes.map((q: any) => (
                    <tr key={q.id} className="text-2xs hover:bg-zinc-900/20 text-zinc-300">
                      <td className="py-3 px-4 font-mono font-semibold text-zinc-400">{q.quoteNumber}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-zinc-100">{q.customerName}</div>
                        <div className="text-3xs text-zinc-500 flex items-center gap-1"><Mail className="h-2.5 w-2.5" /> {q.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-zinc-400">{q.sku}</span>
                        <div className="text-3xs text-zinc-500 truncate max-w-[150px]">{q.title}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-zinc-100">{q.quantity}</td>
                      <td className="py-3 px-4 text-right text-amber-400 font-semibold font-mono">{q.discountPercent}%</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-400 font-semibold">${q.totalPrice.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-zinc-500 text-3xs">{q.validUntil}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-1.5">
                          {q.status === "pending" ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-2xs py-1"
                                onClick={() => {
                                  setCoachQuoteId(q.id.toString());
                                  setActiveTab("aiCoach");
                                }}
                                icon={<Sparkles className="h-3 w-3 text-indigo-400" />}
                              >
                                Coach Deal
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                className="h-7 text-2xs py-1"
                                onClick={() => handleConvertQuoteToOrder(q.id, q.quoteNumber)}
                                icon={<FileCheck2 className="h-3 w-3" />}
                              >
                                Execute Contract
                              </Button>
                            </>
                          ) : (
                            <Badge variant="success">Fully Executed</Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {quotes.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-zinc-600 text-2xs">
                        No active RFQ proposals in ledger.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </motion.div>
        )}

        {activeTab === "customers" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer Directory */}
              <Card className="p-5 h-fit space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
                  <Users className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Customer Accounts</h3>
                </div>

                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {customers.map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => handleLoadCustomerActivities(c.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center ${
                        selectedCustomerId === c.id
                          ? "bg-indigo-500/5 border-indigo-500 text-indigo-400"
                          : "bg-zinc-950/40 border-zinc-850 text-zinc-400 hover:bg-zinc-900/30 hover:border-zinc-700"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-2xs text-zinc-200">{c.firstName} {c.lastName}</div>
                        <div className="text-3xs text-zinc-500 flex items-center gap-1 font-mono">
                          <Mail className="h-2.5 w-2.5" /> {c.email}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-500" />
                    </button>
                  ))}
                </div>
              </Card>

              {/* Customer Activities Timeline */}
              <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
                    <Activity className="h-5 w-5 text-indigo-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Audit Timeline Activities</h3>
                  </div>

                  <div className="mt-6 space-y-4 overflow-y-auto max-h-[300px] pr-1">
                    {customerActs.map((act: any) => (
                      <div key={act.id} className="relative pl-6 pb-2 border-l border-zinc-800 last:border-transparent">
                        <div className="absolute left-[-5px] top-1.5 h-2 w-2 rounded-full bg-indigo-500" />
                        <div className="space-y-1 bg-zinc-950/60 p-3 border border-zinc-850 rounded-xl">
                          <p className="text-2xs text-zinc-300">{act.activity}</p>
                          <span className="text-3xs font-mono text-zinc-500 flex items-center gap-1">
                            <Calendar className="h-2.5 w-2.5" /> {new Date(act.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {customerActs.length === 0 && (
                      <div className="flex flex-col items-center justify-center min-h-[150px] text-zinc-600 text-center text-2xs">
                        No active records in audited timeline files.
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === "aiCoach" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6 h-fit space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
                  <Bot className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Sophia AI Negotiator</h3>
                </div>

                <div className="space-y-4">
                  <Select
                    label="Contract Proposal Choice"
                    options={[
                      { value: "", label: "-- Choose a Quote --" },
                      ...quotes.map(q => ({ value: q.id.toString(), label: `${q.quoteNumber} - ${q.customerName}` }))
                    ]}
                    value={coachQuoteId}
                    onChange={(e) => {
                      setCoachQuoteId(e.target.value);
                      setCoachOutput(null);
                    }}
                  />

                  <Select
                    label="Target Action Scenario"
                    options={[
                      { value: "followup", label: "High-intent follow-up outreach" },
                      { value: "renegotiate", label: "Provide budget discounts & Net-15 incentives" },
                      { value: "urgency", label: "Inject supply-chain manufacturing urgency warnings" }
                    ]}
                    value={coachAction}
                    onChange={(e) => setCoachAction(e.target.value)}
                  />

                  <p className="text-3xs text-zinc-500 leading-relaxed">
                    Sophia AI generates deal renegotiations, outreach pitches and conversions checklists by calling the server-side Gemini API key.
                  </p>

                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={triggerAiCoach}
                    loading={coachLoading}
                    icon={<Sparkles className="h-4 w-4" />}
                    disabled={!coachQuoteId}
                  >
                    Generate AI Sales Outbound
                  </Button>
                </div>
              </Card>

              <Card className="lg:col-span-2 p-6 min-h-[300px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Coaching strategic breakdown</span>
                    <Badge variant="accent">Gemini 3.5 Flash Model Active</Badge>
                  </div>
                  
                  <div className="mt-4 text-zinc-300 text-2xs leading-relaxed space-y-2 whitespace-pre-line overflow-y-auto max-h-[350px]">
                    {coachOutput ? (
                      coachOutput
                    ) : coachLoading ? (
                      <div className="flex flex-col items-center justify-center min-h-[200px] text-zinc-500 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                        <span className="font-mono text-3xs uppercase tracking-wider">Sophia AI drafting contract outreach brief...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[200px] text-zinc-600 text-center space-y-2">
                        <Sparkles className="h-8 w-8 text-zinc-700" />
                        <p>Choose an active proposal contract and click 'Generate' to trigger professional sales tactics.</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </div>

      {/* Draft Invoice Order Dialog Modal */}
      <AnimatePresence>
        {showAddOrder && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg">
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Draft Custom Invoice Order</h3>
                  <button onClick={() => setShowAddOrder(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                </div>

                <form onSubmit={handleCreateOrder} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="B2B Order Number"
                      placeholder="e.g. EXS-ORD-9912"
                      value={orderForm.orderNumber}
                      onChange={(e) => setOrderForm({ ...orderForm, orderNumber: e.target.value })}
                      error={formErrors.orderNumber}
                    />
                    <Select
                      label="Target Product SKU"
                      options={[
                        { value: "", label: "-- Choose SKU --" },
                        { value: "SKU-402", label: "SKU-402 - Enterprise AI Node" },
                        { value: "SKU-501", label: "SKU-501 - Logistics Rover Core" }
                      ]}
                      value={orderForm.sku}
                      onChange={(e) => {
                        const price = e.target.value === "SKU-402" ? "4999" : "1850";
                        setOrderForm({ ...orderForm, sku: e.target.value, price });
                      }}
                      error={formErrors.sku}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Quantity"
                      value={orderForm.quantity}
                      onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                      error={formErrors.quantity}
                    />
                    <Input
                      label="Locked Price (USD)"
                      value={orderForm.price}
                      onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                      error={formErrors.price}
                    />
                    <Select
                      label="Settle Currency"
                      options={[
                        { value: "USD", label: "USD ($)" },
                        { value: "EUR", label: "EUR (€)" }
                      ]}
                      value={orderForm.currency}
                      onChange={(e) => setOrderForm({ ...orderForm, currency: e.target.value })}
                    />
                  </div>

                  <Textarea
                    label="Shipping Delivery Destination Address"
                    placeholder="e.g. 500 Airport Road, Terminal B Cargo Bay, Singapore"
                    value={orderForm.shippingAddress}
                    onChange={(e) => setOrderForm({ ...orderForm, shippingAddress: e.target.value })}
                    error={formErrors.shippingAddress}
                  />

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                    <Button variant="outline" size="sm" onClick={() => setShowAddOrder(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Log Custom Order</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Prepare RFQ Quotation Modal Dialog */}
      <AnimatePresence>
        {showAddQuote && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm">
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Prepare RFQ Custom Quote</h3>
                  <button onClick={() => setShowAddQuote(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                </div>

                <form onSubmit={handleCreateQuote} className="space-y-4">
                  <Input
                    label="B2B Lead/Company Name"
                    placeholder="e.g. Singularity Tech Corp"
                    value={quoteForm.customerName}
                    onChange={(e) => setQuoteForm({ ...quoteForm, customerName: e.target.value })}
                    error={formErrors.customerName}
                  />
                  <Input
                    label="Prospect validation Email"
                    placeholder="procurement@singularity.com"
                    value={quoteForm.email}
                    onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                    error={formErrors.email}
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Select
                        label="Product SKU"
                        options={[
                          { value: "", label: "-- Choose SKU --" },
                          { value: "SKU-402", label: "SKU-402 (Core Node)" },
                          { value: "SKU-501", label: "SKU-501 (Logistics Core)" }
                        ]}
                        value={quoteForm.sku}
                        onChange={(e) => setQuoteForm({ ...quoteForm, sku: e.target.value })}
                        error={formErrors.sku}
                      />
                    </div>
                    <Input
                      label="Quantity"
                      value={quoteForm.quantity}
                      onChange={(e) => setQuoteForm({ ...quoteForm, quantity: e.target.value })}
                    />
                  </div>

                  <Input
                    label="Contract discount percentage (%)"
                    placeholder="10"
                    value={quoteForm.discountPercent}
                    onChange={(e) => setQuoteForm({ ...quoteForm, discountPercent: e.target.value })}
                    error={formErrors.discountPercent}
                  />

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                    <Button variant="outline" size="sm" onClick={() => setShowAddQuote(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Prepare RFQ Quote</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Adjust Lifecycle status Modal Dialog */}
      <AnimatePresence>
        {showOrderStatusModal && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-xs">
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Adjust Order Lifecycle</h3>
                  <button onClick={() => setShowOrderStatusModal(null)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                </div>

                <div className="space-y-1">
                  <span className="text-3xs text-zinc-500 font-mono">ORDER INVOICE NUMBER</span>
                  <div className="font-bold text-xs text-indigo-400 font-mono">{showOrderStatusModal.orderNumber}</div>
                  <div className="text-3xs text-zinc-400 flex items-center gap-1">
                    Current status: <Badge variant="accent">{showOrderStatusModal.status}</Badge>
                  </div>
                </div>

                <form onSubmit={handleUpdateOrderStatus} className="space-y-4 border-t border-zinc-850 pt-3">
                  <Select
                    label="Update Order Status"
                    options={[
                      { value: "pending", label: "Pending" },
                      { value: "processing", label: "Processing" },
                      { value: "paid", label: "Paid" },
                      { value: "completed", label: "Completed" },
                      { value: "cancelled", label: "Cancelled" }
                    ]}
                    value={statusForm}
                    onChange={(e) => setStatusForm(e.target.value)}
                  />

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                    <Button variant="outline" size="sm" onClick={() => setShowOrderStatusModal(null)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Update Lifecycle</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
