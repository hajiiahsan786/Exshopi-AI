import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Card, Button, Input, Select, Badge, Dialog, getAccentClass, getRadiusClass } from "./UI";
import {
  CreditCard,
  RefreshCw,
  TrendingUp,
  Activity,
  Cpu,
  Sparkles,
  Filter,
  Search,
  Globe,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  Zap,
  Download,
  Database,
  Users,
  Check,
  Play,
  Settings,
  Layers,
  BarChart2,
  DollarSign,
  Briefcase,
  ShieldAlert,
  Clock,
  Calendar,
  Lock,
  FileText,
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";
import { PaymentTransaction, PaymentIntent, SettlementBatch, PaymentReceipt, PaymentAuditLog } from "../types";

export const EnterprisePayments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "subscriptions" | "settlements" | "gateways">("overview");
  const [loading, setLoading] = useState(false);

  // Payments State
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [receipts, setReceipts] = useState<Record<number, PaymentReceipt>>({});
  const [auditLogs, setAuditLogs] = useState<PaymentAuditLog[]>([]);

  // Search/Filters
  const [txSearch, setTxSearch] = useState("");
  const [txCurrency, setTxCurrency] = useState("");
  const [txStatus, setTxStatus] = useState("");

  // Modals state
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedTxForRefund, setSelectedTxForRefund] = useState<PaymentTransaction | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("Customer request / duplicate charge");

  const [txDetailDialogOpen, setTxDetailDialogOpen] = useState(false);
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<PaymentTransaction | null>(null);

  // Connection config state
  const [selectedGatewayForConfig, setSelectedGatewayForConfig] = useState<string>("stripe");

  // AI Assistant Finance States
  const [aiWorking, setAiWorking] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [naturalQuery, setNaturalQuery] = useState("");

  // Subscriptions manual trigger state
  const [subscribing, setSubscribing] = useState(false);

  // Settlement batches in-memory simulation (mirrors db.ts)
  const [settlementBatchesList, setSettlementBatchesList] = useState<SettlementBatch[]>([
    { id: 1, accountId: 1, batchReference: "SETTLE_20260715_B1", totalGrossAmount: 4999.00, totalFeeAmount: 145.00, totalNetAmount: 4854.00, status: "closed", closedAt: "2026-07-15T08:00:00Z" }
  ]);

  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const radius = getRadiusClass();
  const accentText = getAccentClass("text");
  const accentBg = getAccentClass("bg");

  const showNotification = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // -------------------------------------------------------------
  // API SERVICE HOOKS
  // -------------------------------------------------------------
  const loadPaymentPlatformData = async () => {
    setLoading(true);
    try {
      // Fetch query list of transactions
      let url = "/api/v1/payments/transactions";
      const params = [];
      if (txCurrency) params.push(`currency=${txCurrency}`);
      if (txStatus) params.push(`status=${txStatus}`);
      if (params.length > 0) url += `?${params.join("&")}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data || []);
      }

      // Load some receipt mapping details
      if (data.data && data.data.length > 0) {
        const firstTx = data.data[0];
        const recRes = await fetch(`/api/v1/payments/receipts/${firstTx.id}`);
        const recData = await recRes.json();
        if (recData.success && recData.data) {
          setReceipts(prev => ({ ...prev, [firstTx.id]: recData.data }));
        }
      }
    } catch (err) {
      console.error("Error loading secure payments data:", err);
      showNotification("Could not retrieve FinTech clearing records.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentPlatformData();
  }, [txCurrency, txStatus]);

  // Refund Transaction post trigger
  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxForRefund) return;
    if (!refundAmount || isNaN(Number(refundAmount))) {
      showNotification("Please provide a valid numeric refund amount.", "error");
      return;
    }

    try {
      const res = await fetch(`/api/v1/payments/transactions/${selectedTxForRefund.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(refundAmount),
          reason: refundReason,
          provider: "stripe"
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Refund of $${refundAmount} approved by gateway! Refund ID #${data.data?.id}`, "success");
        setRefundDialogOpen(false);
        setRefundAmount("");
        loadPaymentPlatformData();
      } else {
        showNotification(data.message || "Failed to issue partial refund on clearing network.", "error");
      }
    } catch (err: any) {
      showNotification("clearing bridge refund connection failure.", "error");
    }
  };

  // Trigger subscription recurring billing manually
  const handleTriggerRecurringBilling = async () => {
    setSubscribing(true);
    showNotification("Executing secure CRON recurring subscription billing sweep...", "info");
    try {
      const res = await fetch("/api/v1/payments/subscriptions/trigger-recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: 1,
          amount: 499.00,
          subscriptionId: 104
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Billing successfully completed. Payment Intent ID #${data.data?.id}`, "success");
        loadPaymentPlatformData();
      } else {
        showNotification(data.message || "Subscription renewal sweep rejected by provider.", "error");
      }
    } catch (err) {
      showNotification("Renewal sweep connector failed.", "error");
    } finally {
      setSubscribing(false);
    }
  };

  // Trigger end of day reconciliation settlement
  const handleTriggerReconciliation = async () => {
    showNotification("Clearing pending funds & performing ledger reconciliation...", "info");
    try {
      const res = await fetch("/api/v1/payments/reconciliation/trigger", {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Settlement batch closed. Net deposited: $${data.data?.totalNetAmount}`, "success");
        // Update local settlement array
        if (data.data) {
          setSettlementBatchesList(prev => [data.data, ...prev]);
        }
        loadPaymentPlatformData();
      } else {
        showNotification(data.message || "Clearing settlement was rejected.", "error");
      }
    } catch (err) {
      showNotification("Clearing settlement route failed.", "error");
    }
  };

  // AI Finance Search & Failure Analysis
  const triggerAIFinanceAnalysis = (scenario: "failure" | "gateway" | "query") => {
    setAiWorking(true);
    setAiResponse("");
    setTimeout(() => {
      if (scenario === "failure") {
        setAiResponse(
          `**[Exshopi AI Finance - Gateway Failure Audit]**\n\n` +
          `• **Decline Code Summary:** 94.2% of failed transactions today were coded as \`insufficient_funds\` (decline code: 51) from European Mastercard issuers.\n` +
          `• **Partial Refund Prediction:** Predicted partial refund risk for *Standard AMR Rover* is **1.2%**, highly stable. \n` +
          `• **Failure Recovery Recommendation:** Implement **dunning sequence rule #4** (Retry after 48 hours, 3 retries max) to capture up to $14K of previously lost subscription billing.`
        );
      } else if (scenario === "gateway") {
        setAiResponse(
          `**[Exshopi AI Finance - Intelligent Routing Analytics]**\n\n` +
          `* **Stripe Connect:** Best overall US/APAC debit authorization rates (99.1%). Cost: 2.9% + $0.30.\n` +
          `* **Adyen Platforms:** Recommended gateway for European bank routes, shaving **0.65% off card processing fee structures** via local clearing routing rules.\n` +
          `* **Checkout.com:** Pre-authorized fallback for high-value node hardware orders. 3DS security challenge completed on 100% of orders above $4000.`
        );
      } else {
        const q = naturalQuery || "recent high-value settlements";
        setAiResponse(
          `**[Exshopi Natural Language Finance Search - Query Result]**\n` +
          `*Query:* "${q}"\n\n` +
          `• **Found matching record:** Transaction ID #1 (Reference: ch_99210481023)\n` +
          `  - **Amount:** $4,999.00 USD (Sale)\n` +
          `  - **Clearing account:** Exshopi Corp Standard USD\n` +
          `  - **Status:** Succeeded (Cleared on 2026-07-15 at 03:15:00 UTC)\n` +
          `  - **Receipt Number:** REC-2026-0012`
        );
      }
      setAiWorking(false);
    }, 1500);
  };

  // Filters search list
  const filteredTransactions = transactions.filter(tx => {
    return txSearch ? tx.externalReferenceId?.toLowerCase().includes(txSearch.toLowerCase()) || tx.amount.toString().includes(txSearch) : true;
  });

  // KPI math
  const grossVolume = transactions.reduce((sum, tx) => tx.status === "success" && tx.type === "sale" ? sum + Number(tx.amount) : sum, 0);
  const refundVolume = transactions.reduce((sum, tx) => tx.status === "success" && tx.type === "refund" ? sum + Number(tx.amount) : sum, 0);

  // Charts data
  const revenueTrendData = [
    { date: "07/11", stripe: 2100, paypal: 800, adyen: 1500 },
    { date: "07/12", stripe: 4500, paypal: 1200, adyen: 1900 },
    { date: "07/13", stripe: 3200, paypal: 950, adyen: 2200 },
    { date: "07/14", stripe: 5800, paypal: 1400, adyen: 2100 },
    { date: "07/15", stripe: 4999, paypal: 0, adyen: 0 }
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-2xl backdrop-blur-md max-w-md ${
              notification.type === "success"
                ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/30"
                : notification.type === "error"
                ? "bg-rose-950/90 text-rose-200 border-rose-500/30"
                : "bg-indigo-950/90 text-indigo-200 border-indigo-500/30"
            }`}
          >
            {notification.type === "success" ? (
              <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0" />
            )}
            <span className="text-xs font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-3xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/20 uppercase rounded tracking-wider">
              Clearing & FinTech Ledger
            </span>
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-2.5">
            <CreditCard className="h-6 w-6 text-emerald-500" />
            Enterprise Payment Platform
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Secure, global merchant clearing house processing transaction intents, authorizations, disputes, and subscription dunning cycles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadPaymentPlatformData}
            loading={loading}
            icon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh Ledger
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={handleTriggerReconciliation}
            icon={<Zap className="h-3.5 w-3.5 text-emerald-400" />}
          >
            Settle Open Batch
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={subscribing}
            onClick={handleTriggerRecurringBilling}
            icon={<Play className="h-3.5 w-3.5" />}
          >
            Trigger Subscription Billing
          </Button>
        </div>
      </div>

      {/* Bento Grid KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Today's Sales Revenue</span>
            <span className="text-2xl font-bold tracking-tight text-white block mt-1">
              ${(4999.00).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-3xs text-emerald-400 font-medium block mt-1">Stripe Direct Integration</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-500/10">
            <DollarSign className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Active Disputes</span>
            <span className="text-2xl font-bold tracking-tight text-white block mt-1">1</span>
            <span className="text-3xs text-rose-400 font-medium block mt-1">Chargeback ratio: 0.02%</span>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-950/60 text-rose-400 border border-rose-500/10">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Authorized Intents</span>
            <span className="text-2xl font-bold tracking-tight text-white block mt-1">
              ${(4999.00).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-3xs text-indigo-400 font-medium block mt-1">Cleared / Settling</span>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-500/10">
            <Lock className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Processed Refunds</span>
            <span className="text-2xl font-bold tracking-tight text-white block mt-1">
              ${(1000.00).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-3xs text-amber-400 font-medium block mt-1">Partial goodwill refunds</span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-500/10">
            <RefreshCw className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* AI Consulting Banner */}
      <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-r from-emerald-950/25 via-zinc-900 to-zinc-950 p-5">
        <div className="absolute right-0 top-0 h-40 w-40 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex gap-3">
            <div className="p-2 h-10 w-10 rounded-lg bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-white tracking-wide uppercase">AI FinTech Analyst</h3>
              
              {/* Natural Query Input */}
              <div className="flex items-center gap-2 max-w-md bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1">
                <Search className="h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Ask AI FinTech (e.g. Find VISA transactions)"
                  value={naturalQuery}
                  onChange={(e) => setNaturalQuery(e.target.value)}
                  className="bg-transparent text-zinc-300 placeholder-zinc-600 text-xs focus:outline-none w-full"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-1.5 py-0.5 text-4xs uppercase tracking-widest text-emerald-400"
                  onClick={() => triggerAIFinanceAnalysis("query")}
                >
                  Query
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerAIFinanceAnalysis("failure")}
              icon={<ShieldAlert className="h-3.5 w-3.5 text-rose-400" />}
            >
              Analyze Failures
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerAIFinanceAnalysis("gateway")}
              icon={<TrendingUp className="h-3.5 w-3.5 text-indigo-400" />}
            >
              Gateway Optimization
            </Button>
          </div>
        </div>

        {/* AI response box */}
        <AnimatePresence>
          {(aiWorking || aiResponse) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-zinc-800/60 overflow-hidden"
            >
              {aiWorking ? (
                <div className="flex items-center gap-2.5 py-4 text-xs text-zinc-500 font-mono">
                  <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                  Calculating clearing ledger parameters and predictions...
                </div>
              ) : (
                <div className="bg-zinc-950/60 border border-zinc-850 p-4 rounded-lg text-xs leading-relaxed font-mono text-zinc-300 whitespace-pre-wrap">
                  {aiResponse}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Tabs */}
      <div className="flex border-b border-zinc-850">
        {(["overview", "transactions", "subscriptions", "settlements", "gateways"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setAiResponse("");
            }}
            className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === tab
                ? "border-emerald-500 text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab === "overview" && "Cleared Analytics"}
            {tab === "transactions" && "Cleared Transaction Ledger"}
            {tab === "subscriptions" && "Subscription Suite"}
            {tab === "settlements" && "Settlement Batches"}
            {tab === "gateways" && "Cleared Gateways"}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
            <span className="text-xs text-zinc-500 font-mono">Auditing merchant accounts...</span>
          </div>
        ) : (
          <>
            {/* OVERVIEW PANEL */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Gateway Revenue Settlements (Area Chart) */}
                <Card className="p-5 lg:col-span-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    7-Day Settlement Clearing Trends ($ USD)
                  </h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                        <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }}
                          itemStyle={{ fontSize: 12 }}
                          labelStyle={{ color: "#a1a1aa", fontSize: 11, fontWeight: "bold" }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Area type="monotone" dataKey="stripe" stroke="#10b981" fillOpacity={0.1} fill="url(#colorStripe)" name="Stripe Connect" />
                        <Area type="monotone" dataKey="adyen" stroke="#6366f1" fillOpacity={0.05} fill="url(#colorAdyen)" name="Adyen EMEA" />
                        <defs>
                          <linearGradient id="colorStripe" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorAdyen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Gateway performance ratios */}
                <Card className="p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-indigo-400" />
                    Dispute Mitigation Statistics
                  </h3>
                  
                  <div className="space-y-4 my-2">
                    <div className="p-3 bg-zinc-950 border border-zinc-850 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-2xs font-semibold text-zinc-400">Total chargebacks value</span>
                        <span className="text-xs font-bold text-rose-400">$5,014.00</span>
                      </div>
                      <p className="text-4xs text-zinc-500">Includes dispute processing fee: $15.00 USD</p>
                    </div>

                    <div className="p-3 bg-zinc-950 border border-zinc-850 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-2xs font-semibold text-zinc-400">Merchant reserve ratio</span>
                        <span className="text-xs font-bold text-white">0.00%</span>
                      </div>
                      <p className="text-4xs text-zinc-500">Zero holds on Stripe Direct channels</p>
                    </div>

                    <div className="p-3 bg-zinc-950 border border-zinc-850 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-2xs font-semibold text-zinc-400">Active Subscriptions Count</span>
                        <span className="text-xs font-bold text-emerald-400">104 Plans</span>
                      </div>
                      <p className="text-4xs text-zinc-500">Autonomous VM renewals automated</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* TRANSACTION LEDGER PANEL */}
            {activeTab === "transactions" && (
              <div className="space-y-6">
                
                {/* Search / Filters bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      type="text"
                      placeholder="Search transaction external references..."
                      className="pl-10 text-xs py-2"
                      value={txSearch}
                      onChange={(e) => setTxSearch(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      options={[
                        { value: "", label: "All Currencies" },
                        { value: "USD", label: "USD - US Dollar" },
                        { value: "EUR", label: "EUR - Euro" }
                      ]}
                      className="text-2xs py-1.5"
                      value={txCurrency}
                      onChange={(e) => setTxCurrency(e.target.value)}
                    />
                    <Select
                      options={[
                        { value: "", label: "All Statuses" },
                        { value: "success", label: "Succeeded" },
                        { value: "failed", label: "Failed" },
                        { value: "pending", label: "Pending" }
                      ]}
                      className="text-2xs py-1.5"
                      value={txStatus}
                      onChange={(e) => setTxStatus(e.target.value)}
                    />
                  </div>
                </div>

                {/* Ledger table */}
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-950/60 border-b border-zinc-800/80 text-4xs uppercase tracking-wider font-bold text-zinc-500 font-mono">
                          <th className="p-4">Reference Key</th>
                          <th className="p-4">Account Origin</th>
                          <th className="p-4">Transaction Type</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Clearing Date</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850/60">
                        {filteredTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-zinc-900/40 text-xs text-zinc-300">
                            <td className="p-4 font-mono font-bold text-zinc-100">
                              {tx.externalReferenceId || `REF_INT_${tx.id}`}
                            </td>
                            <td className="p-4">
                              <span className="font-mono text-3xs text-emerald-400 font-bold block">
                                Exshopi Corp Standard USD
                              </span>
                              <span className="text-4xs text-zinc-500 block">ID: #{tx.accountId}</span>
                            </td>
                            <td className="p-4">
                              <Badge variant={tx.type === "sale" ? "accent" : tx.type === "refund" ? "warning" : "info"}>
                                {tx.type}
                              </Badge>
                            </td>
                            <td className="p-4 font-mono font-bold text-white">
                              {tx.currency} {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-4 font-mono text-zinc-400">
                              {tx.processedAt ? tx.processedAt.replace("T", " ").replace("Z", "") : "Pending"}
                            </td>
                            <td className="p-4">
                              <Badge variant={tx.status === "success" ? "success" : "error"}>
                                {tx.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-3xs py-1 px-2"
                                  onClick={() => {
                                    setSelectedTxForDetail(tx);
                                    setTxDetailDialogOpen(true);
                                  }}
                                  icon={<FileText className="h-3 w-3" />}
                                >
                                  Receipt
                                </Button>
                                {tx.type === "sale" && tx.status === "success" && (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    className="text-3xs py-1 px-2"
                                    onClick={() => {
                                      setSelectedTxForRefund(tx);
                                      setRefundAmount(tx.amount.toString());
                                      setRefundDialogOpen(true);
                                    }}
                                    icon={<RefreshCw className="h-3 w-3 text-rose-300" />}
                                  >
                                    Refund
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredTransactions.length === 0 && (
                          <tr>
                            <td colSpan={7} className="p-12 text-center text-zinc-500 font-mono text-xs">
                              No matching clearing transactions discovered in the ledger.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* SUBSCRIPTION SUITE */}
            {activeTab === "subscriptions" && (
              <div className="space-y-6">
                
                {/* Manual sweep trigger */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg gap-4">
                  <div>
                    <span className="text-xs font-semibold text-zinc-200 block">Subscription Recurring Billing sweeps</span>
                    <p className="text-3xs text-zinc-500 mt-0.5">Automated sweeps run hourly, clearing dunning and renewing active client virtual machine clusters.</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={subscribing}
                    onClick={handleTriggerRecurringBilling}
                    icon={<Play className="h-3.5 w-3.5" />}
                  >
                    Trigger renewal sweeps
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-5 border-zinc-800 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-sm font-bold text-white">Autonomous VM Scale Plan</h4>
                          <span className="text-4xs text-zinc-500 font-mono">PLAN ID: SUB_VM_SCALE_104</span>
                        </div>
                        <Badge variant="success">Active</Badge>
                      </div>

                      <div className="space-y-2 py-3 border-y border-zinc-850/60 my-4 text-2xs">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Total subscribed accounts:</span>
                          <span className="text-zinc-300 font-bold">104 customers</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Subscription cycle:</span>
                          <span className="text-zinc-300 font-mono">Monthly Recurring ($499.00)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Last billing sweep:</span>
                          <span className="text-zinc-300 font-mono">2026-07-15 03:15 UTC</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-3xs text-zinc-500 leading-relaxed bg-zinc-950 p-2.5 rounded border border-zinc-850/40">
                      <strong>AI Dunning Optimizer Rules:</strong> auto-reconcile with 3 retry schedules. Auto-halts container clusters after 15 calendar days of continuous credit failures.
                    </div>
                  </Card>

                  <Card className="p-5 border-zinc-800 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-sm font-bold text-white">Dedicated Voice Agent Trunk Plan</h4>
                          <span className="text-4xs text-zinc-500 font-mono">PLAN ID: SUB_SIP_TRUNK_201</span>
                        </div>
                        <Badge variant="success">Active</Badge>
                      </div>

                      <div className="space-y-2 py-3 border-y border-zinc-850/60 my-4 text-2xs">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Total subscribed accounts:</span>
                          <span className="text-zinc-300 font-bold">45 customers</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Subscription cycle:</span>
                          <span className="text-zinc-300 font-mono">Metered Usage (SWIFT clear)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Last billing sweep:</span>
                          <span className="text-zinc-300 font-mono">2026-07-15 01:10 UTC</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-3xs text-zinc-500 leading-relaxed bg-zinc-950 p-2.5 rounded border border-zinc-850/40">
                      <strong>AI Dunning Optimizer Rules:</strong> dynamic routing to PayPal gateway if Visa clearance on main Stripe pipeline experiences transient regional outages.
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* SETTLEMENT BATCHES PANEL */}
            {activeTab === "settlements" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <div>
                    <span className="text-xs text-zinc-200 font-mono font-semibold block">Merchant Clearing Settlements</span>
                    <p className="text-3xs text-zinc-500 mt-0.5">Cleared balances are processed and bundled into settlement groups prior to SWIFT bank transfers.</p>
                  </div>
                  <Button
                    variant="glass"
                    size="sm"
                    className="text-emerald-400 hover:text-emerald-300"
                    onClick={handleTriggerReconciliation}
                    icon={<Plus className="h-3.5 w-3.5" />}
                  >
                    Force Settlement Run
                  </Button>
                </div>

                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-950/60 border-b border-zinc-800/80 text-4xs uppercase tracking-wider font-bold text-zinc-500 font-mono">
                          <th className="p-4">Batch Reference</th>
                          <th className="p-4">Gross Amount</th>
                          <th className="p-4">Merchant Fee</th>
                          <th className="p-4">Net Settled Amount</th>
                          <th className="p-4">Close Timestamp</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850/60">
                        {settlementBatchesList.map((batch) => (
                          <tr key={batch.id} className="hover:bg-zinc-900/40 text-xs text-zinc-300 font-mono">
                            <td className="p-4 font-bold text-zinc-100">{batch.batchReference}</td>
                            <td className="p-4">${Number(batch.totalGrossAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-4 text-rose-400">-${Number(batch.totalFeeAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-4 text-emerald-400 font-bold">${Number(batch.totalNetAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-4 text-zinc-500">{batch.closedAt ? batch.closedAt.replace("T", " ").replace("Z", "") : "Open"}</td>
                            <td className="p-4">
                              <Badge variant={batch.status === "closed" ? "success" : "neutral"}>
                                {batch.status === "closed" ? "Deposited" : "Processing"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* GATEWAY SETTINGS PANEL */}
            {activeTab === "gateways" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Gateways checklist left side */}
                <Card className="p-4 space-y-2 border-zinc-800 h-fit">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Supported Gateways</span>
                  {[
                    { code: "stripe", name: "Stripe Connect" },
                    { code: "paypal", name: "PayPal Braintree" },
                    { code: "checkout", name: "Checkout.com Unified" },
                    { code: "adyen", name: "Adyen Platforms" },
                    { code: "apple_pay", name: "Apple Pay Tokenized" },
                    { code: "cod", name: "Cash On Delivery" }
                  ].map((g) => (
                    <button
                      key={g.code}
                      onClick={() => setSelectedGatewayForConfig(g.code)}
                      className={`w-full flex items-center justify-between p-3 rounded border text-left transition-all ${
                        selectedGatewayForConfig === g.code
                          ? "border-emerald-500 bg-emerald-950/20 text-emerald-200"
                          : "border-zinc-850 bg-zinc-950 hover:bg-zinc-900/60 text-zinc-400"
                      }`}
                    >
                      <span className="text-xs font-semibold">{g.name}</span>
                      <Badge variant="success">Active</Badge>
                    </button>
                  ))}
                </Card>

                {/* Gateway config values panel */}
                <Card className="p-5 lg:col-span-2 border-zinc-800">
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-4 mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                        {selectedGatewayForConfig.toUpperCase()} Gate Parameters
                      </h4>
                      <p className="text-3xs text-zinc-500 mt-0.5">Configuring secure environment clearance for merchant transactions.</p>
                    </div>
                    <Badge variant="accent">PROD ROUTE ACTIVE</Badge>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Gateway API Key"
                        type="password"
                        value="sk_prod_xxxxxxxxxxxxxx"
                        disabled
                        className="text-2xs font-mono"
                      />
                      <Input
                        label="Publishable client Key"
                        value="pk_prod_99210481024"
                        disabled
                        className="text-2xs font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Webhook Ingress Inbound Route"
                        value={`https://exshopi-ai.workspace.local/api/v1/payments/webhooks/${selectedGatewayForConfig}`}
                        disabled
                        className="text-2xs font-mono"
                      />
                      <Input
                        label="Webhook Secret Value"
                        type="password"
                        value="whsec_01928401924"
                        disabled
                        className="text-2xs font-mono"
                      />
                    </div>

                    <div className="border-t border-zinc-850 pt-4 flex justify-between items-center">
                      <span className="text-3xs text-zinc-500 leading-relaxed max-w-sm">
                        *Note: Gate configuration is managed securely server-side inside the .env secrets locker. Exposed browser parameters are tokenized to maintain full PCI-DSS and SOC-2 compliance.
                      </span>
                      <Button variant="outline" size="sm" className="text-2xs" disabled>
                        Rotate Secrets
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>

      {/* REFUND TRANSACTION DIALOG */}
      <Dialog
        isOpen={refundDialogOpen}
        onClose={() => setRefundDialogOpen(false)}
        title="Issue Partial / Full Clearing Refund"
        size="md"
      >
        <form onSubmit={handleProcessRefund} className="space-y-4 text-xs">
          {selectedTxForRefund && (
            <div className="p-3 bg-zinc-950 border border-zinc-850 rounded">
              <span className="text-[10px] font-bold text-zinc-500 uppercase block font-mono">Original Reference</span>
              <span className="text-xs font-bold text-white block mt-0.5">{selectedTxForRefund.externalReferenceId || `REF_INT_${selectedTxForRefund.id}`}</span>
              <p className="text-3xs text-zinc-400 mt-1">
                Amount processed: {selectedTxForRefund.currency} {Number(selectedTxForRefund.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Refund Amount ($)"
              placeholder="e.g. 1000.00"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              className="text-2xs font-mono"
            />
            <Input
              label="Reason for Refund"
              placeholder="e.g. Goodwill refund"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="text-2xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-850">
            <Button variant="ghost" size="sm" type="button" onClick={() => setRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" type="submit">
              Approve Refund Release
            </Button>
          </div>
        </form>
      </Dialog>

      {/* TRANSACTION RECEIPT DETAIL DIALOG */}
      <Dialog
        isOpen={txDetailDialogOpen}
        onClose={() => setTxDetailDialogOpen(false)}
        title="FinTech Transaction clearing Receipt"
        size="md"
      >
        {selectedTxForDetail && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-lg text-center">
              <div className="p-2 w-10 h-10 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                <Check className="h-5 w-5" />
              </div>
              <span className="text-3xs uppercase tracking-widest text-zinc-500 font-mono">Cleared Amount</span>
              <h4 className="text-xl font-bold font-mono text-white mt-1">
                {selectedTxForDetail.currency} {Number(selectedTxForDetail.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h4>
              <p className="text-3xs text-zinc-400 mt-1">Cleared: {selectedTxForDetail.processedAt}</p>
            </div>

            <div className="space-y-2 py-3 border-y border-zinc-850/60 font-mono text-3xs text-zinc-400">
              <div className="flex justify-between">
                <span>REFERENCE REF:</span>
                <span className="text-zinc-200">{selectedTxForDetail.externalReferenceId || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span>CLEARING ACCOUNT:</span>
                <span className="text-zinc-200">Exshopi Corp Standard USD</span>
              </div>
              <div className="flex justify-between">
                <span>RECEIPT NUMBER:</span>
                <span className="text-zinc-200">
                  {receipts[selectedTxForDetail.id]?.receiptNumber || "REC-2026-0012"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>RECEIPT PURPOSE:</span>
                <span className="text-zinc-200 text-right truncate max-w-[200px]">
                  {receipts[selectedTxForDetail.id]?.details || "Completed for Enterprise AI Core Node"}
                </span>
              </div>
            </div>

            <div className="text-4xs text-zinc-500 leading-relaxed bg-zinc-950 p-3 rounded border border-zinc-850/40 text-center uppercase tracking-wider">
              Securely audited via Exshopi AI FinTech Clearing House. SOC-2 & PCI-DSS compliant logs.
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setTxDetailDialogOpen(false)}>
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
