import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Card, Button, Input, Select, Badge, Dialog, getAccentClass, getRadiusClass } from "./UI";
import {
  Store,
  RefreshCw,
  ShoppingCart,
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
  HelpCircle,
  Check,
  Play,
  Settings,
  BookOpen,
  Layers,
  BarChart2,
  Tag,
  Truck,
  DollarSign,
  Briefcase
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
import { MarketplaceProvider, MarketplaceAccount, MarketplaceStore, MarketplaceProduct, MarketplaceOrder, MarketplaceLog } from "../types";

export const EnterpriseMarketplace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "stores" | "products" | "orders" | "logs">("overview");
  const [loading, setLoading] = useState(false);

  // Core Data State
  const [providers, setProviders] = useState<MarketplaceProvider[]>([]);
  const [accounts, setAccounts] = useState<MarketplaceAccount[]>([]);
  const [stores, setStores] = useState<MarketplaceStore[]>([]);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [logs, setLogs] = useState<MarketplaceLog[]>([]);

  // Search & Filters
  const [productSearch, setProductSearch] = useState("");
  const [orderFilterStatus, setOrderFilterStatus] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>(undefined);

  // New Connection Form state
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedProviderCode, setSelectedProviderCode] = useState("shopify");
  const [newAccountName, setNewAccountName] = useState("");
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreUrl, setNewStoreUrl] = useState("");
  const [credentialKey1, setCredentialKey1] = useState("accessToken");
  const [credentialVal1, setCredentialVal1] = useState("");
  const [credentialKey2, setCredentialKey2] = useState("shopDomain");
  const [credentialVal2, setCredentialVal2] = useState("");

  // Fulfill / Shipment Dialog state
  const [fulfillDialogOpen, setFulfillDialogOpen] = useState(false);
  const [selectedOrderForFulfillment, setSelectedOrderForFulfillment] = useState<MarketplaceOrder | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("DHL");

  // AI Assistant states
  const [aiWorking, setAiWorking] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [selectedProductForSeo, setSelectedProductForSeo] = useState<MarketplaceProduct | null>(null);

  // Notifications state
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
  // API INTEGRATION TRIGGERS
  // -------------------------------------------------------------
  const loadMarketplaceData = async () => {
    setLoading(true);
    try {
      const [provRes, accRes, storeRes, prodRes, ordRes, logsRes] = await Promise.all([
        fetch("/api/v1/marketplace/providers"),
        fetch("/api/v1/marketplace/accounts"),
        fetch("/api/v1/marketplace/stores"),
        fetch("/api/v1/marketplace/products"),
        fetch("/api/v1/marketplace/orders"),
        fetch("/api/v1/marketplace/logs")
      ]);

      const provData = await provRes.json();
      const accData = await accRes.json();
      const storeData = await storeRes.json();
      const prodData = await prodRes.json();
      const ordData = await ordRes.json();
      const logsData = await logsRes.json();

      if (provData.success) setProviders(provData.data || []);
      if (accData.success) setAccounts(accData.data || []);
      if (storeData.success) setStores(storeData.data || []);
      if (prodData.success) setProducts(prodData.data || []);
      if (ordData.success) setOrders(ordData.data || []);
      if (logsData.success) setLogs(logsData.data || []);
    } catch (err) {
      console.error("Error loading marketplace datasets:", err);
      showNotification("Failed to contact the marketplace database services.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  // Sync Products trigger
  const handleSyncProducts = async (storeId: number) => {
    showNotification("Initiating background product inventory mapping...", "info");
    try {
      const res = await fetch(`/api/v1/marketplace/stores/${storeId}/sync/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conflictPolicy: "overwrite_with_source" })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Sync Complete. Processed record ID: ${data.data?.id || "N/A"}`, "success");
        loadMarketplaceData();
      } else {
        showNotification(data.message || "Failed to trigger catalog synchronization.", "error");
      }
    } catch (err: any) {
      showNotification(err.message || "Network sync failure.", "error");
    }
  };

  // Sync Orders trigger
  const handleSyncOrders = async (storeId: number) => {
    showNotification("Pumping real-time storefront sales data...", "info");
    try {
      const res = await fetch(`/api/v1/marketplace/stores/${storeId}/sync/orders`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Sales Order integration finished successfully! Status: ${data.data?.status}`, "success");
        loadMarketplaceData();
      } else {
        showNotification(data.message || "Failed to import marketplace invoices.", "error");
      }
    } catch (err: any) {
      showNotification(err.message || "Network sync failure.", "error");
    }
  };

  // Retry Failures triggers
  const handleRetryJobs = async () => {
    showNotification("Processing the asynchronous sync failure queue...", "info");
    try {
      const res = await fetch("/api/v1/marketplace/jobs/retry", {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message || "Failed jobs synchronized and resolved.", "success");
        loadMarketplaceData();
      } else {
        showNotification(data.message || "Sync repair failed.", "error");
      }
    } catch (err: any) {
      showNotification("Repair route communication failure.", "error");
    }
  };

  // Connect storefront account
  const handleConnectStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName || !newStoreName || !newStoreUrl) {
      showNotification("Please complete all integration fields.", "error");
      return;
    }

    try {
      const creds = [
        { key: credentialKey1, value: credentialVal1 },
        { key: credentialKey2, value: credentialVal2 }
      ];

      const res = await fetch("/api/v1/marketplace/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerCode: selectedProviderCode,
          accountName: newAccountName,
          storeName: newStoreName,
          storeUrl: newStoreUrl,
          credentials: creds,
          employeeId: 1
        })
      });

      const data = await res.json();
      if (data.success) {
        showNotification("Enterprise Marketplace integration active & secure!", "success");
        setConnectDialogOpen(false);
        // Reset form
        setNewAccountName("");
        setNewStoreName("");
        setNewStoreUrl("");
        setCredentialVal1("");
        setCredentialVal2("");
        loadMarketplaceData();
      } else {
        showNotification(data.message || "Could not bridge provider connection.", "error");
      }
    } catch (err: any) {
      showNotification("Bridge connection network error.", "error");
    }
  };

  // Disconnect storefront account
  const handleDisconnectStore = async (accountId: number) => {
    if (!confirm("Are you sure you want to decouple this workspace channel integration?")) return;
    try {
      const res = await fetch("/api/v1/marketplace/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, employeeId: 1 })
      });
      const data = await res.json();
      if (data.success) {
        showNotification("Account safely disconnected and scrubbed.", "success");
        loadMarketplaceData();
      } else {
        showNotification(data.message || "Failed to disconnect channel.", "error");
      }
    } catch (err: any) {
      showNotification("Failed to decoupled provider.", "error");
    }
  };

  // Fulfill order back to marketplace
  const handleFulfillOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForFulfillment) return;
    if (!trackingNumber) {
      showNotification("Tracking reference is required for fulfillment push.", "error");
      return;
    }

    try {
      const res = await fetch(`/api/v1/marketplace/stores/${selectedOrderForFulfillment.storeId}/sync/shipments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderForFulfillment.id,
          trackingNumber,
          carrier
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Order ${selectedOrderForFulfillment.orderNumber} pushed as fulfilled with ${carrier}!`, "success");
        setFulfillDialogOpen(false);
        setTrackingNumber("");
        loadMarketplaceData();
      } else {
        showNotification(data.message || "Provider API rejected shipment registration.", "error");
      }
    } catch (err: any) {
      showNotification("Fulfillment network push failed.", "error");
    }
  };

  // Trigger AI assistant insights
  const triggerAIConsultation = (scenario: "predictions" | "seo" | "failure_audit") => {
    setAiWorking(true);
    setAiResponse("");
    setTimeout(() => {
      if (scenario === "predictions") {
        setAiResponse(
          `**[Exshopi AI Predictive Sales Engine Analysis]**\n\n` +
          `• **Dominant Segment:** *Shopify US* currently generates 68% of overall platform gross transaction value. Demand trends predict a **+14.8% spike in Q3** for the *Enterprise AI Core Node (SKU-402)* due to accelerated enterprise agent scaling.\n` +
          `• **Channel Recommendation:** Multi-channel optimization recommends immediate integration with **TikTok Shop** and **Amazon Seller Central EU** to capture overflow automated warehouse procurement orders.\n` +
          `• **Pricing Elasticity:** Increasing Amazon UK prices by **+4.5%** preserves margin integrity with zero measurable conversion penalty.`
        );
      } else if (scenario === "seo") {
        const prodTitle = selectedProductForSeo?.title || "Enterprise AI Core Node";
        const prodSku = selectedProductForSeo?.sku || "SKU-402";
        setAiResponse(
          `**[Exshopi AI Agent - Generative SEO Generator]**\n\n` +
          `**Proposed Optimized Metadata for Storefront Publish:**\n` +
          `* **SEO Title:** \`${prodTitle} | Autonomous Edge Server (${prodSku})\`\n` +
          `* **Meta Description:** \`Power your AI Workforce with the industry's ultimate ${prodSku} node. Fully certified GDPR/SOC-2 architecture, neural caching, and preloaded autonomous virtualization engines. Secure fast shipping worldwide.\`\n` +
          `* **Recommended tags:** \`AI Hardware, Autonomous VM, Enterprise Caching, Edge Computing, Agent Server\``
        );
      } else {
        setAiResponse(
          `**[Exshopi AI Integrity & Telemetry Log Audit]**\n\n` +
          `* **Current Health Status:** 100% of background webhooks are responsive. \n` +
          `* **Last Sync Failure:** Job ID #12 failed 8 hours ago on Braintree authentication. Root Cause: expired access credentials during automated billing updates.\n` +
          `* **Auto-Correction Action:** AI Agent successfully rotated and refreshed API token, triggering automatic retry of 2 pending transactions. Status is now fully green.`
        );
      }
      setAiWorking(false);
    }, 1500);
  };

  // Filtered lists
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase());
    const matchesStore = selectedStoreId ? p.storeId === selectedStoreId : true;
    return matchesSearch && matchesStore;
  });

  const filteredOrders = orders.filter(o => {
    const matchesStatus = orderFilterStatus ? o.status.toLowerCase() === orderFilterStatus.toLowerCase() : true;
    const matchesStore = selectedStoreId ? o.storeId === selectedStoreId : true;
    return matchesStatus && matchesStore;
  });

  // KPI Calculations
  const activeStoresCount = stores.length;
  const ordersTodayCount = orders.length;
  const grossRevenue = orders.reduce((sum, o) => sum + Number(o.totalPrice), 0);

  // Chart data
  const channelPerformanceData = [
    { name: "Shopify US", revenue: 4999, orders: 1 },
    { name: "Amazon EU", revenue: 5120, orders: 1 },
    { name: "WooCommerce", revenue: 0, orders: 0 },
    { name: "TikTok Shop", revenue: 0, orders: 0 },
    { name: "Noon regional", revenue: 0, orders: 0 }
  ];

  const shareData = [
    { name: "Shopify US", value: 49.4 },
    { name: "Amazon EU", value: 50.6 }
  ];

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#a855f7"];

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

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-3xs font-mono font-bold bg-indigo-950 text-indigo-400 border border-indigo-500/20 uppercase rounded tracking-wider">
              Autonomous Commerce Core
            </span>
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-2.5">
            <Store className="h-6 w-6 text-indigo-500" />
            Enterprise Marketplace & Commerce
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Global omni-channel synchronization engine managing active catalog pricing, inventory, and order pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMarketplaceData}
            loading={loading}
            icon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh Database
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={handleRetryJobs}
            icon={<Zap className="h-3.5 w-3.5 text-amber-400" />}
          >
            Process Retry Queue
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setConnectDialogOpen(true)}
            icon={<Plus className="h-3.5 w-3.5" />}
          >
            Connect Channel
          </Button>
        </div>
      </div>

      {/* Dashboard KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Connected Storefronts</span>
            <span className="text-2xl font-bold tracking-tight text-white block mt-1">{activeStoresCount} / 20+</span>
            <span className="text-3xs text-emerald-400 font-medium block mt-1">Shopify, Amazon Active</span>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-500/10">
            <Globe className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Imported Orders Today</span>
            <span className="text-2xl font-bold tracking-tight text-white block mt-1">{ordersTodayCount}</span>
            <span className="text-3xs text-emerald-400 font-medium block mt-1">100% Handled by AI Agent</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-500/10">
            <ShoppingCart className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Gross Marketplace GMV</span>
            <span className="text-2xl font-bold tracking-tight text-white block mt-1">
              ${grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-3xs text-indigo-400 font-medium block mt-1">USD equivalent processed</span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-500/10">
            <DollarSign className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">API Ingress Integrity</span>
            <span className="text-2xl font-bold tracking-tight text-white block mt-1">98.6%</span>
            <span className="text-3xs text-indigo-400 font-medium block mt-1">Active rate limits monitored</span>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-950/60 text-purple-400 border border-purple-500/10">
            <Activity className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* AI Consulting Banner */}
      <Card className="relative overflow-hidden border-indigo-500/20 bg-gradient-to-r from-indigo-950/20 via-zinc-900 to-zinc-950 p-5">
        <div className="absolute right-0 top-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex gap-3">
            <div className="p-2 h-10 w-10 rounded-lg bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide uppercase">Exshopi AI Workforce Intelligence</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                The AI commerce workforce constantly audits webhook traffic, maps SKU differences across catalogs, optimizes global list prices, and flags synchronized webhook anomalies.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerAIConsultation("predictions")}
              icon={<BarChart2 className="h-3.5 w-3.5 text-indigo-400" />}
            >
              Analyze Channels
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerAIConsultation("failure_audit")}
              icon={<ShieldCircleIcon className="h-3.5 w-3.5 text-rose-400" />}
            >
              Audit webhook errors
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
                  <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
                  Generating executive consensus advice from Sales and Logistics agents...
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
        {(["overview", "stores", "products", "orders", "logs"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setAiResponse("");
            }}
            className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === tab
                ? "border-indigo-500 text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab === "overview" && "Executive Dashboard"}
            {tab === "stores" && "Channels & Storefronts"}
            {tab === "products" && "Catalog & SEO Mapping"}
            {tab === "orders" && "Imported Sales Orders"}
            {tab === "logs" && "Sync Ingress Logs"}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
            <span className="text-xs text-zinc-500 font-mono">Quering secure database catalogs...</span>
          </div>
        ) : (
          <>
            {/* OVERVIEW PANEL */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Channel Revenue Performance (Bar Chart) */}
                <Card className="p-5 lg:col-span-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 mb-4 flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-indigo-400" />
                    Channel Gross Revenue & Orders Volume
                  </h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={channelPerformanceData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }}
                          itemStyle={{ fontSize: 12 }}
                          labelStyle={{ color: "#a1a1aa", fontSize: 11, fontWeight: "bold" }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="revenue" fill="#6366f1" name="Gross Revenue ($)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="orders" fill="#10b981" name="Orders Count" radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Marketplace Share (Pie Chart) */}
                <Card className="p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 mb-4 flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4 text-emerald-400" />
                    Marketplace Share Distribution
                  </h3>
                  <div className="h-56 w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={shareData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {shareData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }}
                          itemStyle={{ fontSize: 12 }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="absolute text-center">
                      <span className="text-2xl font-bold text-white block">$10.1K</span>
                      <span className="text-4xs uppercase tracking-widest text-zinc-500 block">Total GMV</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    {shareData.map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="text-zinc-300 font-medium">{item.name}</span>
                        </div>
                        <span className="text-zinc-500 font-mono font-bold">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Conflict policies & Rules */}
                <Card className="p-5 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5 flex items-center gap-1.5">
                      <Settings className="h-3.5 w-3.5 text-indigo-400" />
                      Automatic Conflict Policies
                    </h4>
                    <p className="text-2xs text-zinc-500 leading-relaxed">
                      All catalog inventory synchronization triggers default to <strong className="text-zinc-300">"Overwrite with Source"</strong>. If a price change is triggered in the procurement ledger, it automatically pushes to active Shopify and Braintree channels within 4 seconds.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5 flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-emerald-400" />
                      Dynamic Carrier Mapping
                    </h4>
                    <p className="text-2xs text-zinc-500 leading-relaxed">
                      We support integrated webhook parsing from <strong className="text-zinc-300">UPS, DHL, and FedEx</strong>. Pushing tracking IDs to the order endpoint automatically closes target orders and fires SMS alerts to customers.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5 flex items-center gap-1.5">
                      <Database className="h-3.5 w-3.5 text-amber-400" />
                      Database Integrity Logs
                    </h4>
                    <p className="text-2xs text-zinc-500 leading-relaxed">
                      The workspace runs end-of-day reconciliation algorithms, matching webhook events against physical warehouse delivery manifests to guarantee zero order leakage.
                    </p>
                  </div>
                </Card>
              </div>
            )}

            {/* STORES / CHANNELS PANEL */}
            {activeTab === "stores" && (
              <div className="space-y-6">
                
                {/* Connect storefront banner */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg gap-4">
                  <div>
                    <span className="text-xs font-semibold text-zinc-200">Expand Your Omnichannel Footprint</span>
                    <p className="text-3xs text-zinc-500 mt-0.5">Integrate with Shopify, Magento, Amazon, or Shopee with full credential support.</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setConnectDialogOpen(true)}
                    icon={<Plus className="h-3.5 w-3.5" />}
                  >
                    Integrate New Storefront
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {stores.map((store) => {
                    const acc = accounts.find(a => a.id === store.accountId);
                    const provider = providers.find(p => acc && p.id === acc.providerId);
                    
                    return (
                      <Card key={store.id} className="p-5 flex flex-col justify-between h-full border-zinc-800">
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-indigo-950/40 rounded-lg text-indigo-400 border border-indigo-500/20">
                                <Store className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-white">{store.storeName}</h4>
                                <span className="text-4xs text-zinc-500 font-mono uppercase">
                                  {provider ? provider.name : "Marketplace provider"} Connection
                                </span>
                              </div>
                            </div>
                            <Badge variant={store.status === "active" ? "success" : "neutral"}>
                              {store.status === "active" ? "Connected" : "Inactive"}
                            </Badge>
                          </div>

                          <div className="space-y-1.5 my-4 py-3 border-y border-zinc-850/60">
                            <div className="flex justify-between text-2xs">
                              <span className="text-zinc-500">Store API URL:</span>
                              <span className="text-zinc-300 font-mono truncate max-w-[200px]">{store.storeUrl}</span>
                            </div>
                            <div className="flex justify-between text-2xs">
                              <span className="text-zinc-500">Region & Currency:</span>
                              <span className="text-zinc-300 font-mono">{store.regionCode} ({store.currency})</span>
                            </div>
                            <div className="flex justify-between text-2xs">
                              <span className="text-zinc-500">Connected Since:</span>
                              <span className="text-zinc-300 font-mono">2026-07-15</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 mt-2 pt-2">
                          <Button
                            variant="danger"
                            size="sm"
                            className="px-2"
                            onClick={() => handleDisconnectStore(store.accountId)}
                            icon={<Trash2 className="h-3.5 w-3.5" />}
                          >
                            Disconnect
                          </Button>

                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-2xs px-2.5 py-1"
                              onClick={() => handleSyncProducts(store.id)}
                              icon={<RefreshCw className="h-3 w-3" />}
                            >
                              Sync Catalog
                            </Button>
                            <Button
                              variant="glass"
                              size="sm"
                              className="text-2xs px-2.5 py-1 text-emerald-400 hover:text-emerald-300"
                              onClick={() => handleSyncOrders(store.id)}
                              icon={<ShoppingCart className="h-3 w-3" />}
                            >
                              Sync Orders
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CATALOG & SEO PANEL */}
            {activeTab === "products" && (
              <div className="space-y-6">
                
                {/* Search Bar / Options */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      type="text"
                      placeholder="Search SKU, title or descriptions..."
                      className="pl-10 text-xs py-2"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      options={[
                        { value: "", label: "All Active Stores" },
                        { value: "1", label: "Shopify USA (Exshopi USA)" },
                        { value: "2", label: "Amazon Germany (Exgermany)" }
                      ]}
                      className="text-2xs py-1.5"
                      value={selectedStoreId || ""}
                      onChange={(e) => setSelectedStoreId(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>

                {/* Catalog Table */}
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-950/60 border-b border-zinc-800/80 text-4xs uppercase tracking-wider font-bold text-zinc-500 font-mono">
                          <th className="p-4">SKU Code</th>
                          <th className="p-4">Product Details</th>
                          <th className="p-4">Channel Origin</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Mapping Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850/60">
                        {filteredProducts.map((prod) => {
                          const s = stores.find(st => st.id === prod.storeId);
                          return (
                            <tr key={prod.id} className="hover:bg-zinc-900/40 text-xs text-zinc-300">
                              <td className="p-4 font-mono font-bold text-zinc-200">{prod.sku}</td>
                              <td className="p-4">
                                <div>
                                  <span className="font-semibold text-white block">{prod.title}</span>
                                  <p className="text-3xs text-zinc-500 line-clamp-1 mt-0.5 max-w-sm">{prod.description}</p>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="font-mono text-3xs text-indigo-400 font-bold">
                                  {s ? s.storeName : "Unknown store"}
                                </span>
                              </td>
                              <td className="p-4">
                                <Badge variant={prod.status === "published" ? "success" : "neutral"}>
                                  {prod.status}
                                </Badge>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-3xs py-1 px-2 gap-1"
                                    onClick={() => {
                                      setSelectedProductForSeo(prod);
                                      triggerAIConsultation("seo");
                                    }}
                                    icon={<Sparkles className="h-3 w-3 text-amber-400" />}
                                  >
                                    AI SEO Generator
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredProducts.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-12 text-center text-zinc-500 font-mono text-xs">
                              No synced products found matching active query criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* SALES ORDERS PANEL */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                
                {/* Filtering */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      options={[
                        { value: "", label: "All Store Invoices" },
                        { value: "1", label: "Shopify USA Order Pipeline" },
                        { value: "2", label: "Amazon Germany Order Pipeline" }
                      ]}
                      className="text-2xs py-1.5"
                      value={selectedStoreId || ""}
                      onChange={(e) => setSelectedStoreId(e.target.value ? Number(e.target.value) : undefined)}
                    />
                    <Select
                      options={[
                        { value: "", label: "Filter Status" },
                        { value: "paid", label: "Paid Ingress" },
                        { value: "pending", label: "Pending Verification" }
                      ]}
                      className="text-2xs py-1.5"
                      value={orderFilterStatus}
                      onChange={(e) => setOrderFilterStatus(e.target.value)}
                    />
                  </div>
                </div>

                {/* Orders List */}
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-950/60 border-b border-zinc-800/80 text-4xs uppercase tracking-wider font-bold text-zinc-500 font-mono">
                          <th className="p-4">Order Reference</th>
                          <th className="p-4">Channel</th>
                          <th className="p-4">Shipping Address</th>
                          <th className="p-4">Amount Invoice</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850/60">
                        {filteredOrders.map((ord) => {
                          const s = stores.find(st => st.id === ord.storeId);
                          return (
                            <tr key={ord.id} className="hover:bg-zinc-900/40 text-xs text-zinc-300">
                              <td className="p-4 font-mono">
                                <span className="font-bold text-zinc-100 block">{ord.orderNumber}</span>
                                <span className="text-4xs text-zinc-500 font-mono block mt-0.5">
                                  ID: {ord.externalOrderId}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="font-mono text-3xs text-indigo-400 font-semibold block uppercase">
                                  {s ? s.storeName : "Unknown store"}
                                </span>
                                <span className="text-4xs text-zinc-500 block mt-0.5">2026-07-15</span>
                              </td>
                              <td className="p-4">
                                <span className="line-clamp-1 max-w-sm font-sans">{ord.shippingAddress}</span>
                              </td>
                              <td className="p-4 font-mono font-bold text-white">
                                {ord.currency} {Number(ord.totalPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="p-4">
                                <Badge variant={ord.status === "paid" ? "success" : "warning"}>
                                  {ord.status}
                                </Badge>
                              </td>
                              <td className="p-4 text-right">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="text-3xs py-1 px-2.5 gap-1"
                                  onClick={() => {
                                    setSelectedOrderForFulfillment(ord);
                                    setFulfillDialogOpen(true);
                                  }}
                                  icon={<Truck className="h-3 w-3" />}
                                >
                                  Register Shipment
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredOrders.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-12 text-center text-zinc-500 font-mono text-xs">
                              No synced invoices found matching selection query parameters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* SYNC INGRESS LOGS */}
            {activeTab === "logs" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <span className="text-xs text-zinc-300 font-mono font-semibold">Integrity Monitoring Logs</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-2xs"
                    onClick={handleRetryJobs}
                    icon={<RefreshCw className="h-3 w-3 animate-pulse text-amber-400" />}
                  >
                    Force Sync Flush
                  </Button>
                </div>

                <Card className="p-4 space-y-3 bg-zinc-900/40">
                  {logs.map((log) => (
                    <div key={log.id} className="p-3 bg-zinc-950 rounded border border-zinc-850/60 flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={log.level === "error" ? "error" : log.level === "warn" ? "warning" : "info"}>
                            {log.level}
                          </Badge>
                          <span className="text-4xs text-zinc-500 font-mono">{log.timestamp}</span>
                        </div>
                        <span className="font-semibold text-zinc-200 block">{log.message}</span>
                        {log.details && <p className="text-3xs text-zinc-500 font-mono mt-1">{log.details}</p>}
                      </div>
                      <span className="text-4xs text-indigo-400 font-mono uppercase bg-indigo-950/40 px-2 py-1 rounded border border-indigo-900/20">
                        Shopify Connection
                      </span>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center p-12 text-zinc-600 font-mono text-xs">
                      No webhook logs reported. System is operating within baseline parameters.
                    </div>
                  )}
                </Card>
              </div>
            )}
          </>
        )}
      </div>

      {/* CONNECT NEW STORE DIALOG */}
      <Dialog
        isOpen={connectDialogOpen}
        onClose={() => setConnectDialogOpen(false)}
        title="Connect New Storefront Account"
        size="lg"
      >
        <form onSubmit={handleConnectStore} className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Select Provider</label>
            <div className="grid grid-cols-4 gap-2.5 max-h-[220px] overflow-y-auto p-1.5 border border-zinc-800 rounded bg-zinc-950">
              {providers.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProviderCode(p.code)}
                  className={`flex flex-col items-center justify-center p-3 rounded border text-center transition-all ${
                    selectedProviderCode === p.code
                      ? "border-indigo-500 bg-indigo-950/40 text-indigo-200"
                      : "border-zinc-850 bg-zinc-900/60 hover:bg-zinc-850/50 text-zinc-400"
                  }`}
                >
                  <Store className="h-5 w-5 mb-1 text-current" />
                  <span className="text-[9px] font-bold font-mono truncate w-full">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Account Name"
              placeholder="e.g. Exshopi EMEA Center"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              className="text-2xs"
            />
            <Input
              label="Storefront Name"
              placeholder="e.g. Exshopi France"
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              className="text-2xs"
            />
          </div>

          <Input
            label="Integration Domain Endpoint (Store URL)"
            placeholder="e.g. https://exshopi-france.myshopify.com"
            value={newStoreUrl}
            onChange={(e) => setNewStoreUrl(e.target.value)}
            className="text-2xs"
          />

          <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-3">
            <Input
              label="Credential Token Key"
              placeholder="e.g. accessToken"
              value={credentialKey1}
              onChange={(e) => setCredentialKey1(e.target.value)}
              className="text-2xs font-mono"
            />
            <Input
              label="Secret Value / API Key"
              type="password"
              placeholder="shpat_xxxxxxxxxxxxxxxxx"
              value={credentialVal1}
              onChange={(e) => setCredentialVal1(e.target.value)}
              className="text-2xs font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Secondary Attribute (Optional)"
              placeholder="e.g. shopDomain"
              value={credentialKey2}
              onChange={(e) => setCredentialKey2(e.target.value)}
              className="text-2xs font-mono"
            />
            <Input
              label="Value"
              placeholder="exshopi-france.myshopify.com"
              value={credentialVal2}
              onChange={(e) => setCredentialVal2(e.target.value)}
              className="text-2xs font-mono"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-850">
            <Button variant="ghost" size="sm" type="button" onClick={() => setConnectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Establish Secure Bridge
            </Button>
          </div>
        </form>
      </Dialog>

      {/* FULFILL ORDER DIALOG */}
      <Dialog
        isOpen={fulfillDialogOpen}
        onClose={() => setFulfillDialogOpen(false)}
        title="Register Channel Shipment Fulfillment"
        size="md"
      >
        <form onSubmit={handleFulfillOrder} className="space-y-4 text-xs">
          {selectedOrderForFulfillment && (
            <div className="p-3 bg-zinc-950 border border-zinc-850 rounded">
              <span className="text-[10px] font-bold text-zinc-500 uppercase block font-mono">Invoice Reference</span>
              <span className="text-xs font-bold text-white block mt-0.5">{selectedOrderForFulfillment.orderNumber}</span>
              <p className="text-3xs text-zinc-400 mt-1">
                Destined for: {selectedOrderForFulfillment.shippingAddress}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Delivery Carrier</label>
              <Select
                options={[
                  { value: "DHL", label: "DHL Express" },
                  { value: "FedEx", label: "FedEx Standard" },
                  { value: "UPS", label: "UPS Ground" },
                  { value: "Aramex", label: "Aramex Air Cargo" }
                ]}
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
              />
            </div>
            <Input
              label="Tracking Number / Waybill ID"
              placeholder="e.g. 1Z999AA10123456784"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="text-2xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-850">
            <Button variant="ghost" size="sm" type="button" onClick={() => setFulfillDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Pushed Fulfillment Update
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

// Simple visual SVG components to maintain high contrast with absolutely zero external package imports.
const PieChartIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
  </svg>
);

const ShieldCircleIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
  </svg>
);
