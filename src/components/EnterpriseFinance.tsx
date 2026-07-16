import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Card, Button, Input, Select, Badge } from "./UI";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Plus,
  RefreshCw,
  Sparkles,
  Bot,
  Loader2,
  FileText,
  Percent,
  Calendar,
  Building2,
  Sliders,
  ChevronRight,
  Activity,
  ArrowRightLeft,
  FileSpreadsheet,
  PiggyBank,
  AlertTriangle,
  Scale,
  Landmark,
  ShieldAlert,
  Search,
  CheckCircle2
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

export const EnterpriseFinance: React.FC = () => {
  const { addLog, addNotification } = useStore();
  const [activeTab, setActiveTab] = useState<"overview" | "ledger" | "receivables" | "budgets" | "assets" | "aiAdvisor">("overview");

  // Core Finance State
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [invoicesList, setInvoicesList] = useState<any[]>([]);
  const [billsList, setBillsList] = useState<any[]>([]);
  const [expensesList, setExpensesList] = useState<any[]>([]);
  const [budgetsList, setBudgetsList] = useState<any[]>([]);
  const [assetsList, setAssetsList] = useState<any[]>([]);
  const [reconciliationsList, setReconciliationsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Form Visibility
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddJournal, setShowAddJournal] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [showAddBill, setShowAddBill] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showReconcile, setShowReconcile] = useState(false);

  // Forms State
  const [accountForm, setAccountForm] = useState({ code: "", name: "", category: "Asset", type: "Bank", balance: "" });
  const [journalForm, setJournalForm] = useState({ description: "", debitCode: "", creditCode: "", amount: "", ref: "" });
  const [invoiceForm, setInvoiceForm] = useState({ clientName: "", email: "", subtotal: "", dueDate: "" });
  const [billForm, setBillForm] = useState({ vendorName: "", category: "API Services", amount: "", dueDate: "" });
  const [budgetForm, setBudgetForm] = useState({ department: "", code: "", allocated: "", period: "Q3 2026" });
  const [expenseForm, setExpenseForm] = useState({ description: "", category: "API Services", amount: "", costCenter: "R&D" });
  const [assetForm, setAssetForm] = useState({ name: "", sku: "", cost: "", depRatePercent: "10" });
  const [reconcileForm, setReconcileForm] = useState({ statementBalance: "" });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Search & Filter
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [arStatusFilter, setArStatusFilter] = useState("all");
  const [apStatusFilter, setApStatusFilter] = useState("all");

  // AI Advisor States
  const [advisorAction, setAdvisorAction] = useState("audit");
  const [advisorQuery, setAdvisorQuery] = useState("");
  const [advisorOutput, setAdvisorOutput] = useState<string | null>(null);
  const [advisorLoading, setAdvisorLoading] = useState(false);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const [resDash, resAcc, resLed, resInv, resBill, resExp, resBud, resAsst, resRec] = await Promise.all([
        fetch("/api/v1/finance/dashboard"),
        fetch("/api/v1/finance/accounts"),
        fetch("/api/v1/finance/ledger"),
        fetch("/api/v1/finance/invoices"),
        fetch("/api/v1/finance/bills"),
        fetch("/api/v1/finance/expenses"),
        fetch("/api/v1/finance/budgets"),
        fetch("/api/v1/finance/assets"),
        fetch("/api/v1/finance/reconciliations")
      ]);

      const [dashJson, accJson, ledJson, invJson, billJson, expJson, budJson, asstJson, recJson] = await Promise.all([
        resDash.json(),
        resAcc.json(),
        resLed.json(),
        resInv.json(),
        resBill.json(),
        resExp.json(),
        resBud.json(),
        resAsst.json(),
        resRec.json()
      ]);

      if (dashJson.success) setDashboardMetrics(dashJson.data);
      if (accJson.success) setAccounts(accJson.data);
      if (ledJson.success) setLedger(ledJson.data);
      if (invJson.success) setInvoicesList(invJson.data);
      if (billJson.success) setBillsList(billJson.data);
      if (expJson.success) setExpensesList(expJson.data);
      if (budJson.success) setBudgetsList(budJson.data);
      if (asstJson.success) setAssetsList(asstJson.data);
      if (recJson.success) setReconciliationsList(recJson.data);

    } catch (e) {
      console.error("Finance Sync Fail: ", e);
      addNotification({
        title: "Finance Sync Error",
        description: "Failed to connect to Exshopi Ledger services.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  // Post dynamic forms
  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!accountForm.code) errors.code = "GL Code required";
    if (!accountForm.name) errors.name = "Account Name required";
    if (!accountForm.balance || isNaN(Number(accountForm.balance))) errors.balance = "Enter numerical initial balance";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch("/api/v1/finance/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountForm)
      });
      const data = await response.json();
      if (data.success) {
        addNotification({ title: "Account Created", description: `Added GL account ${accountForm.code} - ${accountForm.name}`, type: "success" });
        addLog({ method: "POST", endpoint: "/api/v1/finance/accounts", status: 201, type: "api", payload: accountForm, response: data });
        setShowAddAccount(false);
        setAccountForm({ code: "", name: "", category: "Asset", type: "Bank", balance: "" });
        fetchFinanceData();
      } else {
        addNotification({ title: "Account Error", description: data.message, type: "error" });
      }
    } catch (err: any) {
      addNotification({ title: "API Failure", description: err.message, type: "error" });
    }
  };

  const handleAddJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!journalForm.description) errors.description = "Entry description is required";
    if (!journalForm.debitCode) errors.debitCode = "Target debit account required";
    if (!journalForm.creditCode) errors.creditCode = "Target credit account required";
    if (journalForm.debitCode === journalForm.creditCode) errors.creditCode = "Debit and credit accounts must be distinct";
    if (!journalForm.amount || isNaN(Number(journalForm.amount)) || Number(journalForm.amount) <= 0) errors.amount = "Enter valid positive amount";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch("/api/v1/finance/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(journalForm)
      });
      const data = await response.json();
      if (data.success) {
        addNotification({ title: "Journal Entry Posted", description: `Drafted allocation JV ref: ${data.data.ref}`, type: "success" });
        addLog({ method: "POST", endpoint: "/api/v1/finance/ledger", status: 201, type: "api", payload: journalForm, response: data });
        setShowAddJournal(false);
        setJournalForm({ description: "", debitCode: "", creditCode: "", amount: "", ref: "" });
        fetchFinanceData();
      } else {
        addNotification({ title: "Posting Error", description: data.message, type: "error" });
      }
    } catch (err: any) {
      addNotification({ title: "Posting Failure", description: err.message, type: "error" });
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!invoiceForm.clientName) errors.clientName = "Client Name is required";
    if (!invoiceForm.email) errors.email = "Client billing email required";
    if (!invoiceForm.subtotal || isNaN(Number(invoiceForm.subtotal))) errors.subtotal = "Enter numerical subtotal amount";
    if (!invoiceForm.dueDate) errors.dueDate = "Settle limit date required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch("/api/v1/finance/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceForm)
      });
      const data = await response.json();
      if (data.success) {
        addNotification({ title: "Client Invoice Issued", description: `Prepared invoice for ${invoiceForm.clientName}`, type: "success" });
        addLog({ method: "POST", endpoint: "/api/v1/finance/invoices", status: 201, type: "api", payload: invoiceForm, response: data });
        setShowAddInvoice(false);
        setInvoiceForm({ clientName: "", email: "", subtotal: "", dueDate: "" });
        fetchFinanceData();
      }
    } catch (err: any) {
      addNotification({ title: "Invoice Failure", description: err.message, type: "error" });
    }
  };

  const handleUpdateInvoiceStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/v1/finance/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        addNotification({ title: "Invoice Ledger Settle", description: `Invoice #${id} updated to ${status}`, type: "success" });
        fetchFinanceData();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!billForm.vendorName) errors.vendorName = "Vendor Name required";
    if (!billForm.amount || isNaN(Number(billForm.amount))) errors.amount = "Enter numerical amount";
    if (!billForm.dueDate) errors.dueDate = "Bill due date required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch("/api/v1/finance/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billForm)
      });
      const data = await response.json();
      if (data.success) {
        addNotification({ title: "Vendor Bill Recorded", description: `Logged payables bill from ${billForm.vendorName}`, type: "success" });
        addLog({ method: "POST", endpoint: "/api/v1/finance/bills", status: 201, type: "api", payload: billForm, response: data });
        setShowAddBill(false);
        setBillForm({ vendorName: "", category: "API Services", amount: "", dueDate: "" });
        fetchFinanceData();
      }
    } catch (err: any) {
      addNotification({ title: "Bill Log Failure", description: err.message, type: "error" });
    }
  };

  const handleUpdateBillStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/v1/finance/bills/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        addNotification({ title: "Bill Ledger Paid", description: `Bill #${id} marked ${status}`, type: "success" });
        fetchFinanceData();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!budgetForm.department) errors.department = "Department choice is required";
    if (!budgetForm.code) errors.code = "Department ledger code is required";
    if (!budgetForm.allocated || isNaN(Number(budgetForm.allocated))) errors.allocated = "Enter numerical allocation";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch("/api/v1/finance/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budgetForm)
      });
      const data = await response.json();
      if (data.success) {
        addNotification({ title: "Budget Planning Locked", description: `Established Q3 budget code: ${budgetForm.code}`, type: "success" });
        setShowAddBudget(false);
        setBudgetForm({ department: "", code: "", allocated: "", period: "Q3 2026" });
        fetchFinanceData();
      }
    } catch (err: any) {
      addNotification({ title: "Budget Failure", description: err.message, type: "error" });
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!expenseForm.description) errors.description = "Expense description is required";
    if (!expenseForm.amount || isNaN(Number(expenseForm.amount))) errors.amount = "Enter expense cost";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch("/api/v1/finance/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseForm)
      });
      const data = await response.json();
      if (data.success) {
        addNotification({ title: "Ledger Expense Charged", description: `Billed $${expenseForm.amount} against ${expenseForm.costCenter}`, type: "success" });
        addLog({ method: "POST", endpoint: "/api/v1/finance/expenses", status: 201, type: "api", payload: expenseForm, response: data });
        setShowAddExpense(false);
        setExpenseForm({ description: "", category: "API Services", amount: "", costCenter: "R&D" });
        fetchFinanceData();
      }
    } catch (err: any) {
      addNotification({ title: "Expense failure", description: err.message, type: "error" });
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!assetForm.name) errors.name = "Asset descriptor is required";
    if (!assetForm.sku) errors.sku = "Internal asset SKU required";
    if (!assetForm.cost || isNaN(Number(assetForm.cost))) errors.cost = "Enter asset cost valuation";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch("/api/v1/finance/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assetForm)
      });
      const data = await response.json();
      if (data.success) {
        addNotification({ title: "Fixed Asset Registered", description: `Added asset ${assetForm.sku} to ledger`, type: "success" });
        setShowAddAsset(false);
        setAssetForm({ name: "", sku: "", cost: "", depRatePercent: "10" });
        fetchFinanceData();
      }
    } catch (err: any) {
      addNotification({ title: "Asset Failure", description: err.message, type: "error" });
    }
  };

  const handleBankReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconcileForm.statementBalance || isNaN(Number(reconcileForm.statementBalance))) {
      addNotification({ title: "Verification Required", description: "Enter valid statement balance from statement sheets", type: "warning" });
      return;
    }

    try {
      const response = await fetch("/api/v1/finance/reconciliations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reconcileForm)
      });
      const data = await response.json();
      if (data.success) {
        const variance = data.data.variance;
        if (variance === 0) {
          addNotification({ title: "Statement Balanced", description: "Ledger books match banking sheets perfectly. Book balanced.", type: "success" });
        } else {
          addNotification({ title: "Variance Warning", description: `Reconciliation recorded. Variance detected: $${variance.toLocaleString()}`, type: "warning" });
        }
        setShowReconcile(false);
        setReconcileForm({ statementBalance: "" });
        fetchFinanceData();
      }
    } catch (err: any) {
      addNotification({ title: "Reconciliation Failure", description: err.message, type: "error" });
    }
  };

  const triggerAiAdvisor = async () => {
    setAdvisorLoading(true);
    setAdvisorOutput(null);
    try {
      const response = await fetch("/api/v1/finance/ai-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: advisorAction, query: advisorQuery })
      });
      const data = await response.json();
      if (data.success) {
        setAdvisorOutput(data.advice);
        addLog({
          method: "POST",
          endpoint: "/api/v1/finance/ai-advisor",
          status: 200,
          type: "api",
          payload: { action: advisorAction, query: advisorQuery },
          response: { textLength: data.advice.length }
        });
      }
    } catch (e: any) {
      addNotification({ title: "Fiona AI Offline", description: e.message, type: "error" });
    } finally {
      setAdvisorLoading(false);
    }
  };

  // Filters & Searching
  const filteredLedger = ledger.filter(l => {
    const term = ledgerSearch.toLowerCase();
    return l.description.toLowerCase().includes(term) || l.debitCode.includes(term) || l.creditCode.includes(term) || l.ref.toLowerCase().includes(term);
  });

  const filteredInvoices = invoicesList.filter(i => {
    if (arStatusFilter === "all") return true;
    return i.status === arStatusFilter;
  });

  const filteredBills = billsList.filter(b => {
    if (apStatusFilter === "all") return true;
    return b.status === apStatusFilter;
  });

  // Recharts structured metrics
  const budgetChartData = budgetsList.map(b => ({
    name: b.code,
    Allocated: b.allocated,
    Spent: b.actual,
    Available: Math.max(0, b.allocated - b.actual)
  }));

  const invoiceAgingData = [
    { name: "Current", amount: invoicesList.filter(i => i.status === "unpaid").reduce((sum, i) => sum + i.total, 0) },
    { name: "Overdue", amount: invoicesList.filter(i => i.status === "overdue").reduce((sum, i) => sum + i.total, 0) },
    { name: "Settle Block", amount: 4500 }
  ];

  const COLORS = ["#6366f1", "#f59e0b", "#f43f5e"];

  if (loading && !dashboardMetrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-zinc-400 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-500" />
        <span className="text-xs uppercase tracking-wider font-mono">Synchronizing Financial Registers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/40 p-6 border border-zinc-800/80 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Fiona Accounting & General Ledger</h1>
            <Badge variant="success">Fiona AI Financial Officer</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Standard double-entry accounts bookkeeping, accounts receivable/payable, asset depreciation ledger, and automated Fiona AI forecasting.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={fetchFinanceData}>
            Sync Registers
          </Button>
          <Button variant="outline" size="sm" icon={<CheckCircle2 className="h-3.5 w-3.5" />} onClick={() => setShowReconcile(true)}>
            Reconcile Sheets
          </Button>
          <Button variant="primary" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowAddJournal(true)}>
            Record Journal Entry
          </Button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-zinc-800/80 gap-1 overflow-x-auto pb-px">
        {[
          { id: "overview", label: "Financial Metrics", icon: <TrendingUp className="h-4 w-4" /> },
          { id: "ledger", label: "General Ledger", icon: <Scale className="h-4 w-4" /> },
          { id: "receivables", label: "Receivable / Payable", icon: <ArrowRightLeft className="h-4 w-4" /> },
          { id: "budgets", label: "Budgets & Costs", icon: <PiggyBank className="h-4 w-4" /> },
          { id: "assets", label: "Ledger Assets", icon: <Building2 className="h-4 w-4" /> },
          { id: "aiAdvisor", label: "AI Finance Advisor", icon: <Sparkles className="h-4 w-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              if (tab.id === "aiAdvisor" && !advisorOutput) triggerAiAdvisor();
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === tab.id
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
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
        {activeTab === "overview" && dashboardMetrics && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Cash & Cash Equivalents</span>
                    <h3 className="text-xl font-bold text-zinc-100 mt-1">
                      ${dashboardMetrics.cashInBank.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <Landmark className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1 font-mono">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>Perfect Liquidity Reserved</span>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Accounts Receivable (A/R)</span>
                    <h3 className="text-xl font-bold text-zinc-100 mt-1">
                      ${dashboardMetrics.outstandingReceivables.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-[10px] text-amber-400 mt-2 flex items-center gap-1 font-mono">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{invoicesList.filter(i => i.status === "overdue").length} Past Due Invoices</span>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Accounts Payable (A/P)</span>
                    <h3 className="text-xl font-bold text-zinc-100 mt-1">
                      ${dashboardMetrics.outstandingPayables.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-[10px] text-zinc-500 mt-2 flex items-center gap-1 font-mono">
                  <span>UNPAID BILL RUNS: {billsList.filter(b => b.status === "unpaid").length}</span>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Operating Profit Margin</span>
                    <h3 className="text-xl font-bold text-zinc-100 mt-1">
                      {dashboardMetrics.profitMargin}%
                    </h3>
                  </div>
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <Percent className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1 font-mono">
                  <span>NET PROFIT: ${dashboardMetrics.netProfit.toLocaleString()}</span>
                </div>
              </Card>
            </div>

            {/* Split Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Budgets Vs Spend Bar chart */}
              <Card className="lg:col-span-2 p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Department Q3 Budget Allocation vs Actual Spend</h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Real-time expense variance tracking against organizational bounds.</p>
                  </div>
                  <Badge variant="accent">Overall Usage: {dashboardMetrics.overallBudgetUsagePercent}%</Badge>
                </div>
                <div className="h-[250px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 10 }} stroke="#27272a" />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} stroke="#27272a" />
                      <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", color: "#f4f4f5" }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="Allocated" fill="#18181b" stroke="#3f3f46" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Spent" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Outstanding Receivables Aging Pie Chart */}
              <Card className="p-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Outstanding Receivables Aging</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Liquidity aging matrix breakdown.</p>
                </div>
                <div className="h-[200px] mt-6 flex justify-center items-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={invoiceAgingData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="amount"
                      >
                        {invoiceAgingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => `$${v.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Total aging</span>
                    <span className="text-sm font-extrabold text-zinc-100">${dashboardMetrics.outstandingReceivables.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  {invoiceAgingData.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === "ledger" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart of Accounts */}
              <Card className="p-5 h-fit space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                  <div className="flex items-center gap-1.5">
                    <Scale className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Chart of Accounts</h3>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-2xs py-1 px-2" onClick={() => setShowAddAccount(true)}>
                    + COA Account
                  </Button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {accounts.map(acc => (
                    <div key={acc.code} className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl flex justify-between items-center">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-zinc-500">{acc.code}</span>
                          <span className="text-xs font-semibold text-zinc-200">{acc.name}</span>
                        </div>
                        <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500">{acc.category} — {acc.type}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-400">${acc.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* General Ledger Transactions */}
              <Card className="lg:col-span-2 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-850 pb-3">
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Journal Audit Trail</h3>
                  </div>
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search description, accounts..."
                      value={ledgerSearch}
                      onChange={(e) => setLedgerSearch(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-2xs py-1.5 pl-8 pr-3 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/30 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                        <th className="py-2 px-3">DATE</th>
                        <th className="py-2 px-3">DESCRIPTION</th>
                        <th className="py-2 px-3 font-mono text-center">DEBIT / CREDIT (GL)</th>
                        <th className="py-2 px-3 text-right">AMOUNT</th>
                        <th className="py-2 px-3 font-mono text-right">REF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {filteredLedger.map((item) => (
                        <tr key={item.id} className="text-2xs hover:bg-zinc-900/10 text-zinc-300">
                          <td className="py-3 px-3 font-mono text-zinc-500 text-[10px]">{item.date}</td>
                          <td className="py-3 px-3 font-medium text-zinc-100">{item.description}</td>
                          <td className="py-3 px-3 text-center">
                            <div className="inline-flex items-center gap-1.5 font-mono text-[10px]">
                              <span className="text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-1 rounded font-bold">Dr {item.debitCode}</span>
                              <span className="text-zinc-500">→</span>
                              <span className="text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-1 rounded font-bold">Cr {item.creditCode}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">${item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                          <td className="py-3 px-3 text-right font-mono text-zinc-500 text-[10px]">{item.ref}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === "receivables" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Accounts Receivable (Invoices) */}
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Accounts Receivable (Client Invoices)</h3>
                    <p className="text-[10px] text-zinc-500">Track client payments and collect receivables.</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-2xs py-1" onClick={() => setShowAddInvoice(true)}>
                    + Issue Invoice
                  </Button>
                </div>

                <div className="flex gap-2 justify-end mb-2">
                  <select
                    value={arStatusFilter}
                    onChange={(e) => setArStatusFilter(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 text-zinc-400 text-[10px] py-1 px-2 rounded-lg"
                  >
                    <option value="all">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {filteredInvoices.map(inv => (
                    <div key={inv.id} className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl flex justify-between items-center text-2xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-indigo-400 font-semibold">{inv.invoiceNumber}</span>
                          <span className="font-semibold text-zinc-200">{inv.clientName}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-2">
                          <span>DUE: {inv.dueDate}</span>
                          <span>●</span>
                          <span>{inv.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono">
                          <div className="font-bold text-zinc-100">${inv.total.toLocaleString()}</div>
                          <div className="text-[10px] text-zinc-500">VAT: ${inv.tax.toLocaleString()}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant={inv.status === "paid" ? "success" : inv.status === "overdue" ? "error" : "warning"}>
                            {inv.status}
                          </Badge>
                          {inv.status !== "paid" && (
                            <button
                              onClick={() => handleUpdateInvoiceStatus(inv.id, "paid")}
                              className="text-[9px] text-emerald-400 hover:underline font-mono text-right"
                            >
                              Pay Invoice
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Accounts Payable (Bills) */}
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Accounts Payable (Vendor Bills)</h3>
                    <p className="text-[10px] text-zinc-500">Log invoices from compute providers, hardware leases, and facilities.</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-2xs py-1" onClick={() => setShowAddBill(true)}>
                    + Log Vendor Bill
                  </Button>
                </div>

                <div className="flex gap-2 justify-end mb-2">
                  <select
                    value={apStatusFilter}
                    onChange={(e) => setApStatusFilter(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 text-zinc-400 text-[10px] py-1 px-2 rounded-lg"
                  >
                    <option value="all">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {filteredBills.map(b => (
                    <div key={b.id} className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl flex justify-between items-center text-2xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-amber-500 font-semibold">{b.billNumber}</span>
                          <span className="font-semibold text-zinc-200">{b.vendorName}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-2">
                          <span>DUE: {b.dueDate}</span>
                          <span>●</span>
                          <span>Category: {b.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-zinc-100">${b.amount.toLocaleString()}</span>
                        <div className="flex flex-col gap-1">
                          <Badge variant={b.status === "paid" ? "success" : b.status === "overdue" ? "error" : "warning"}>
                            {b.status}
                          </Badge>
                          {b.status !== "paid" && (
                            <button
                              onClick={() => handleUpdateBillStatus(b.id, "paid")}
                              className="text-[9px] text-emerald-400 hover:underline font-mono text-right"
                            >
                              Settle Bill
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === "budgets" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Budgets Tracker Table */}
              <Card className="lg:col-span-2 p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Department Q3 Operational Budgets</h3>
                    <p className="text-[10px] text-zinc-500">Track allocations, spent parameters, and variance safety tags.</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-2xs py-1" onClick={() => setShowAddBudget(true)}>
                    + Budget Target
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/30 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                        <th className="py-2.5 px-3">DEPARTMENT CODE</th>
                        <th className="py-2.5 px-3">NAME</th>
                        <th className="py-2.5 px-3 text-right">ALLOCATED BUDGET</th>
                        <th className="py-2.5 px-3 text-right">ACTUAL SPENT</th>
                        <th className="py-2.5 px-3 text-right">VARIANCE</th>
                        <th className="py-2.5 px-3 text-center">SAFETY STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {budgetsList.map(b => {
                        const variance = b.allocated - b.actual;
                        return (
                          <tr key={b.id} className="text-2xs hover:bg-zinc-900/10 text-zinc-300">
                            <td className="py-3 px-3 font-mono font-semibold text-indigo-400">{b.code}</td>
                            <td className="py-3 px-3 font-semibold text-zinc-100">{b.department}</td>
                            <td className="py-3 px-3 text-right font-mono text-zinc-400">${b.allocated.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">${b.actual.toLocaleString()}</td>
                            <td className={`py-3 px-3 text-right font-mono ${variance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              ${variance.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <Badge variant={b.status === "active" ? "success" : "warning"}>
                                {b.status === "active" ? "Under Cap" : "Near Cap"}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Expenses Logger Cost Centers */}
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Expense Allocator</h3>
                    <p className="text-[10px] text-zinc-500">Directly post and charge costs to cost center budgets.</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-2xs py-1" onClick={() => setShowAddExpense(true)}>
                    + Post Expense
                  </Button>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {expensesList.map(exp => (
                    <div key={exp.id} className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl flex justify-between items-start text-2xs">
                      <div className="space-y-1">
                        <div className="font-semibold text-zinc-200">{exp.description}</div>
                        <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5">
                          <span>{exp.date}</span>
                          <span>•</span>
                          <span>CC: {exp.costCenter}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-rose-400">-${exp.amount.toFixed(2)}</div>
                        <span className="text-[9px] text-zinc-500 font-mono uppercase">{exp.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === "assets" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Assets and Depreciation Schedules */}
              <Card className="lg:col-span-2 p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Corporate Assets & Depreciation Registry</h3>
                    <p className="text-[10px] text-zinc-500">Amortization scheduler for GPU compute architectures and factories machinery.</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-2xs py-1" onClick={() => setShowAddAsset(true)}>
                    + Register Asset
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/30 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                        <th className="py-2.5 px-3">ASSET SKU</th>
                        <th className="py-2.5 px-3">DESCRIPTION</th>
                        <th className="py-2.5 px-3 text-right">ORIGINAL COST</th>
                        <th className="py-2.5 px-3 text-right">YTD DEPRECIATION</th>
                        <th className="py-2.5 px-3 text-right">NET BOOK VALUE</th>
                        <th className="py-2.5 px-3 text-center">METHOD (RATE)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {assetsList.map(as => (
                        <tr key={as.id} className="text-2xs hover:bg-zinc-900/10 text-zinc-300">
                          <td className="py-3 px-3 font-mono font-semibold text-zinc-400">{as.sku}</td>
                          <td className="py-3 px-3 font-semibold text-zinc-100">{as.name}</td>
                          <td className="py-3 px-3 text-right font-mono">${as.cost.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-mono text-rose-400">${as.depYTD.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">${as.currentVal.toLocaleString()}</td>
                          <td className="py-3 px-3 text-center font-mono text-zinc-500 text-[10px]">{as.depMethod} ({as.depRatePercent}%)</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Sales Tax Holds and Compliance */}
              <Card className="p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-3">
                    <ShieldAlert className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Taxes Hold & Compliance</h3>
                  </div>

                  <div className="mt-4 space-y-4 text-2xs text-zinc-400">
                    <div className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-zinc-300">Sales Tax Hold Balance</span>
                        <span className="font-mono font-bold text-emerald-400">$4,500.00</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: "25%" }} />
                      </div>
                      <p className="text-[10px] text-zinc-500">Auto-allocated holding on Shopify sales invoices. Fully reconciled.</p>
                    </div>

                    <div className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-zinc-300">IRS Form 1099 Allocations</span>
                        <span className="font-mono font-bold text-zinc-500">Compliant</span>
                      </div>
                      <p className="text-[10px] text-zinc-500">Autonomous contractors and AI worker pay sheets processed completely with SOC-2 policies.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[10px] font-mono text-emerald-400/90 leading-relaxed">
                  ● IRS 2026 AUDIT COMPLIANCE PASS SECURED
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === "aiAdvisor" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6 h-fit space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
                  <Bot className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Fiona Financial Advisor</h3>
                </div>

                <div className="space-y-4">
                  <Select
                    label="Analytical Focus Action"
                    options={[
                      { value: "audit", label: "Consolidated Financial Audit & Runway" },
                      { value: "anomaly", label: "GPU Cloud Billing & Expense Anomalies" },
                      { value: "variance", label: "Fine-Tuning Budgets Variance Projections" }
                    ]}
                    value={advisorAction}
                    onChange={(e) => {
                      setAdvisorAction(e.target.value);
                      setAdvisorOutput(null);
                    }}
                  />

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Ask Natural Language Query</label>
                    <input
                      type="text"
                      placeholder="e.g. Predict if Q3 budgets will overflow..."
                      value={advisorQuery}
                      onChange={(e) => setAdvisorQuery(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs py-2 px-3 rounded-lg focus:outline-none"
                    />
                  </div>

                  <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                    Fiona AI triggers advanced runway modeling, GPU COGS depreciation checks, and invoice aging analysis using the server Gemini key.
                  </p>

                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={triggerAiAdvisor}
                    loading={advisorLoading}
                    icon={<Sparkles className="h-4 w-4" />}
                  >
                    Analyze Financial Runway
                  </Button>
                </div>
              </Card>

              <Card className="lg:col-span-2 p-6 min-h-[350px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">Fiona Strategic Treasury Analysis</span>
                    <Badge variant="accent">Gemini 3.5 Flash Active</Badge>
                  </div>
                  
                  <div className="mt-4 text-zinc-300 text-2xs leading-relaxed space-y-2 whitespace-pre-line overflow-y-auto max-h-[380px] font-mono">
                    {advisorOutput ? (
                      advisorOutput
                    ) : advisorLoading ? (
                      <div className="flex flex-col items-center justify-center min-h-[220px] text-zinc-500 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                        <span className="font-mono text-[10px] uppercase tracking-wider">Fiona AI audit algorithms computing treasury forecasts...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[220px] text-zinc-600 text-center space-y-2">
                        <Sparkles className="h-8 w-8 text-zinc-700" />
                        <p>Configure financial parameters and click 'Analyze' to generate AI treasury audits.</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </div>

      {/* MODAL DIALOGS */}

      {/* 1. Add COA Account Modal */}
      <AnimatePresence>
        {showAddAccount && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm">
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Register General Ledger Account</h3>
                  <button onClick={() => setShowAddAccount(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                </div>

                <form onSubmit={handleAddAccount} className="space-y-4 text-2xs">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="GL Code (Unique)"
                      placeholder="e.g. 1015"
                      value={accountForm.code}
                      onChange={(e) => setAccountForm({ ...accountForm, code: e.target.value })}
                      error={formErrors.code}
                    />
                    <Input
                      label="Initial Balance (USD)"
                      placeholder="0.00"
                      value={accountForm.balance}
                      onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })}
                      error={formErrors.balance}
                    />
                  </div>

                  <Input
                    label="Account Name"
                    placeholder="e.g. Chase Operating Reserve"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                    error={formErrors.name}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="Category"
                      options={[
                        { value: "Asset", label: "Asset" },
                        { value: "Liability", label: "Liability" },
                        { value: "Equity", label: "Equity" },
                        { value: "Revenue", label: "Revenue" },
                        { value: "Expense", label: "Expense" }
                      ]}
                      value={accountForm.category}
                      onChange={(e) => setAccountForm({ ...accountForm, category: e.target.value })}
                    />
                    <Select
                      label="Type"
                      options={[
                        { value: "Bank", label: "Bank Account" },
                        { value: "Receivables", label: "Receivables" },
                        { value: "Payables", label: "Payables" },
                        { value: "Fixed Asset", label: "Fixed Asset" },
                        { value: "Revenue", label: "Revenue" },
                        { value: "Operating Expense", label: "Operating Expense" },
                        { value: "COGS", label: "COGS Expense" }
                      ]}
                      value={accountForm.type}
                      onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                    <Button variant="outline" size="sm" onClick={() => setShowAddAccount(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Create Ledger COA</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Record Journal Entry Modal */}
      <AnimatePresence>
        {showAddJournal && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm">
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Post Double-Entry Journal Entry</h3>
                  <button onClick={() => setShowAddJournal(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                </div>

                <form onSubmit={handleAddJournal} className="space-y-4 text-2xs">
                  <Input
                    label="Debit GL Account (Increase asset/expense)"
                    placeholder="e.g. 1010"
                    value={journalForm.debitCode}
                    onChange={(e) => setJournalForm({ ...journalForm, debitCode: e.target.value })}
                    error={formErrors.debitCode}
                  />

                  <Input
                    label="Credit GL Account (Increase liability/revenue)"
                    placeholder="e.g. 4000"
                    value={journalForm.creditCode}
                    onChange={(e) => setJournalForm({ ...journalForm, creditCode: e.target.value })}
                    error={formErrors.creditCode}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Amount (USD)"
                      placeholder="100.00"
                      value={journalForm.amount}
                      onChange={(e) => setJournalForm({ ...journalForm, amount: e.target.value })}
                      error={formErrors.amount}
                    />
                    <Input
                      label="Reference (Optional)"
                      placeholder="JV-9901"
                      value={journalForm.ref}
                      onChange={(e) => setJournalForm({ ...journalForm, ref: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Ledger Description</label>
                    <textarea
                      placeholder="Describe the nature of this double-entry allocation..."
                      value={journalForm.description}
                      onChange={(e) => setJournalForm({ ...journalForm, description: e.target.value })}
                      rows={2}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs py-2 px-3 rounded-lg focus:outline-none"
                    />
                    {formErrors.description && <span className="text-[10px] text-rose-400">{formErrors.description}</span>}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                    <Button variant="outline" size="sm" onClick={() => setShowAddJournal(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Post Journal Allocation</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Issue Client Invoice Modal */}
      <AnimatePresence>
        {showAddInvoice && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm">
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Draft Customer Invoice</h3>
                  <button onClick={() => setShowAddInvoice(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                </div>

                <form onSubmit={handleCreateInvoice} className="space-y-4 text-2xs">
                  <Input
                    label="B2B Customer Client Name"
                    placeholder="e.g. Quantum Corp"
                    value={invoiceForm.clientName}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, clientName: e.target.value })}
                    error={formErrors.clientName}
                  />

                  <Input
                    label="Client Billing Email"
                    placeholder="finance@quantum.com"
                    value={invoiceForm.email}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, email: e.target.value })}
                    error={formErrors.email}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Subtotal (USD)"
                      placeholder="5000.00"
                      value={invoiceForm.subtotal}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, subtotal: e.target.value })}
                      error={formErrors.subtotal}
                    />
                    <Input
                      label="Due Settle Date"
                      type="date"
                      value={invoiceForm.dueDate}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                      error={formErrors.dueDate}
                    />
                  </div>

                  <p className="text-[10px] text-zinc-500 font-mono">
                    Note: General Sales tax hold of 15% will automatically accrue and post to sales tax liability.
                  </p>

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                    <Button variant="outline" size="sm" onClick={() => setShowAddInvoice(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Issue Client Invoice</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Log Vendor Bill Modal */}
      <AnimatePresence>
        {showAddBill && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm">
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Log Vendor Bill</h3>
                  <button onClick={() => setShowAddBill(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                </div>

                <form onSubmit={handleCreateBill} className="space-y-4 text-2xs">
                  <Input
                    label="Vendor Name"
                    placeholder="e.g. AWS Core Services"
                    value={billForm.vendorName}
                    onChange={(e) => setBillForm({ ...billForm, vendorName: e.target.value })}
                    error={formErrors.vendorName}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Amount (USD)"
                      placeholder="15000"
                      value={billForm.amount}
                      onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                      error={formErrors.amount}
                    />
                    <Input
                      label="Bill Due Date"
                      type="date"
                      value={billForm.dueDate}
                      onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
                      error={formErrors.dueDate}
                    />
                  </div>

                  <Select
                    label="Cost Category"
                    options={[
                      { value: "API Services", label: "API Services" },
                      { value: "Fixed Asset", label: "Fixed Asset" },
                      { value: "Operating Expense", label: "Operating Expense" },
                      { value: "Hardware Lease", label: "Hardware Lease" }
                    ]}
                    value={billForm.category}
                    onChange={(e) => setBillForm({ ...billForm, category: e.target.value })}
                  />

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                    <Button variant="outline" size="sm" onClick={() => setShowAddBill(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Log Vendor Bill</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Budget Target Modal */}
      <AnimatePresence>
        {showAddBudget && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm">
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Establish Budget Target</h3>
                  <button onClick={() => setShowAddBudget(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                </div>

                <form onSubmit={handleCreateBudget} className="space-y-4 text-2xs">
                  <Input
                    label="Department / Cost Center Name"
                    placeholder="e.g. Sales Outreach"
                    value={budgetForm.department}
                    onChange={(e) => setBudgetForm({ ...budgetForm, department: e.target.value })}
                    error={formErrors.department}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Ledger Code"
                      placeholder="DEPT-ASA"
                      value={budgetForm.code}
                      onChange={(e) => setBudgetForm({ ...budgetForm, code: e.target.value })}
                      error={formErrors.code}
                    />
                    <Input
                      label="Allocated Q3 Budget (USD)"
                      placeholder="150000"
                      value={budgetForm.allocated}
                      onChange={(e) => setBudgetForm({ ...budgetForm, allocated: e.target.value })}
                      error={formErrors.allocated}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                    <Button variant="outline" size="sm" onClick={() => setShowAddBudget(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Lock Budget Target</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Post Expense Modal */}
      <AnimatePresence>
        {showAddExpense && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm">
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Charge Cost to Center</h3>
                  <button onClick={() => setShowAddExpense(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                </div>

                <form onSubmit={handleCreateExpense} className="space-y-4 text-2xs">
                  <Input
                    label="Expense Description"
                    placeholder="e.g. GPT-4 API tokens draw"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    error={formErrors.description}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Expense Cost (USD)"
                      placeholder="120.50"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      error={formErrors.amount}
                    />
                    <Select
                      label="Cost Center"
                      options={budgetsList.map(b => ({ value: b.code, label: `${b.code} - ${b.department}` }))}
                      value={expenseForm.costCenter}
                      onChange={(e) => setExpenseForm({ ...expenseForm, costCenter: e.target.value })}
                    />
                  </div>

                  <Select
                    label="Expense Category"
                    options={[
                      { value: "API Services", label: "API Services" },
                      { value: "Compute Expenses", label: "Compute Expenses" },
                      { value: "Facilities", label: "Facilities" },
                      { value: "SaaS Tools", label: "SaaS Tools" }
                    ]}
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  />

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                    <Button variant="outline" size="sm" onClick={() => setShowAddExpense(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Post Expense Cost</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Register Asset Modal */}
      <AnimatePresence>
        {showAddAsset && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm">
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Register Fixed Asset</h3>
                  <button onClick={() => setShowAddAsset(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                </div>

                <form onSubmit={handleCreateAsset} className="space-y-4 text-2xs">
                  <Input
                    label="Asset Name Description"
                    placeholder="e.g. H100 Server Node"
                    value={assetForm.name}
                    onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                    error={formErrors.name}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Internal Inventory SKU"
                      placeholder="DGX-H100"
                      value={assetForm.sku}
                      onChange={(e) => setAssetForm({ ...assetForm, sku: e.target.value })}
                      error={formErrors.sku}
                    />
                    <Input
                      label="Original Cost (USD)"
                      placeholder="180000"
                      value={assetForm.cost}
                      onChange={(e) => setAssetForm({ ...assetForm, cost: e.target.value })}
                      error={formErrors.cost}
                    />
                  </div>

                  <Select
                    label="Amortization Straight Line Rate"
                    options={[
                      { value: "5", label: "5% annual depreciation" },
                      { value: "10", label: "10% annual depreciation" },
                      { value: "15", label: "15% annual depreciation" },
                      { value: "20", label: "20% annual depreciation" }
                    ]}
                    value={assetForm.depRatePercent}
                    onChange={(e) => setAssetForm({ ...assetForm, depRatePercent: e.target.value })}
                  />

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                    <Button variant="outline" size="sm" onClick={() => setShowAddAsset(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Register Asset</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. Reconcile Sheets Modal */}
      <AnimatePresence>
        {showReconcile && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm">
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Reconcile Chase Bank Statement Sheets</h3>
                  <button onClick={() => setShowReconcile(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 font-mono">GL OPERATING BOOK VALUE</span>
                  <div className="font-bold text-sm text-emerald-400 font-mono">
                    ${((accounts.find(a => a.code === "1010")?.balance || 450300.22)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <form onSubmit={handleBankReconcile} className="space-y-4 border-t border-zinc-850 pt-3">
                  <Input
                    label="Bank Statement Ending Balance"
                    placeholder="e.g. 450300.22"
                    value={reconcileForm.statementBalance}
                    onChange={(e) => setReconcileForm({ ...reconcileForm, statementBalance: e.target.value })}
                  />

                  <p className="text-[10px] text-zinc-500 font-mono">
                    Audit algorithm checks statement balances against book registers. Reconcile records are permanently logged in compliance files.
                  </p>

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                    <Button variant="outline" size="sm" onClick={() => setShowReconcile(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Execute Reconciliation Audit</Button>
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
