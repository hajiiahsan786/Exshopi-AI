import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Card, Button, Input, Select, Badge, Textarea } from "./UI";
import {
  Boxes,
  Database,
  Warehouse,
  ArrowUpDown,
  AlertOctagon,
  Sparkles,
  Bot,
  Plus,
  Search,
  ChevronRight,
  TrendingUp,
  Sliders,
  RefreshCw,
  Loader2,
  Calendar,
  Send,
  User,
  MapPin,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";

export const EnterpriseInventory: React.FC = () => {
  const { addLog, addNotification } = useStore();
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "warehouses" | "movements" | "forecasting">("overview");

  // State for loaded data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [warehousesList, setWarehousesList] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [whFilter, setWhFilter] = useState("all");

  // Interaction / Modal states
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState<any>(null);
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [showAddMovement, setShowAddMovement] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Form states
  const [productForm, setProductForm] = useState({
    sku: "", title: "", description: "", price: "", quantity: "0", warehouseId: "1"
  });
  const [editForm, setEditForm] = useState({
    quantity: "", price: ""
  });
  const [warehouseForm, setWarehouseForm] = useState({
    name: "", location: "", capacity: ""
  });
  const [movementForm, setMovementForm] = useState({
    sku: "", type: "INBOUND", quantity: "", fromLoc: "", toLoc: ""
  });

  // AI Forecasting state
  const [aiSku, setAiSku] = useState("");
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch all inventory parameters
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resDash, resProd, resWh, resMove, resAlert] = await Promise.all([
        fetch("/api/v1/inventory/dashboard"),
        fetch("/api/v1/inventory/products"),
        fetch("/api/v1/inventory/warehouses"),
        fetch("/api/v1/inventory/movements"),
        fetch("/api/v1/inventory/alerts")
      ]);

      const [dashJson, prodJson, whJson, moveJson, alertJson] = await Promise.all([
        resDash.json(),
        resProd.json(),
        resWh.json(),
        resMove.json(),
        resAlert.json()
      ]);

      if (dashJson.success) setDashboardData(dashJson.data);
      if (prodJson.success) setProducts(prodJson.data);
      if (whJson.success) setWarehousesList(whJson.data);
      if (moveJson.success) setMovements(moveJson.data);
      if (alertJson.success) setAlerts(alertJson.data);
      
    } catch (error) {
      console.error("Failed to load inventory logs: ", error);
      addNotification({
        title: "Database Sync Error",
        description: "Failed to connect to Exshopi logistics registry.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Submit methods
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!productForm.sku) errors.sku = "SKU Code is required";
    if (!productForm.title) errors.title = "Product Title is required";
    if (!productForm.price || isNaN(Number(productForm.price))) errors.price = "Enter a valid product unit price";
    if (isNaN(Number(productForm.quantity))) errors.quantity = "Enter a valid starting quantity";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch("/api/v1/inventory/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "Enterprise Admin" },
        body: JSON.stringify(productForm)
      });
      const data = await response.json();

      if (data.success) {
        addNotification({
          title: "SKU Cataloged",
          description: `Registered SKU ${productForm.sku} successfully.`,
          type: "success"
        });
        addLog({
          method: "POST",
          endpoint: "/api/v1/inventory/products",
          status: 201,
          type: "api",
          payload: productForm,
          response: data
        });
        setShowAddProduct(false);
        setProductForm({ sku: "", title: "", description: "", price: "", quantity: "0", warehouseId: "1" });
        fetchAllData();
      } else {
        setFormErrors({ sku: data.message });
      }
    } catch (error: any) {
      addNotification({
        title: "Failed to add SKU",
        description: error.message,
        type: "error"
      });
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditProduct) return;
    
    try {
      const response = await fetch(`/api/v1/inventory/products/${showEditProduct.sku}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-role": "Enterprise Admin" },
        body: JSON.stringify(editForm)
      });
      const data = await response.json();

      if (data.success) {
        addNotification({
          title: "Inventory Stock Corrected",
          description: `Adjusted stock metrics for SKU ${showEditProduct.sku}`,
          type: "success"
        });
        addLog({
          method: "PUT",
          endpoint: `/api/v1/inventory/products/${showEditProduct.sku}`,
          status: 200,
          type: "api",
          payload: editForm,
          response: data
        });
        setShowEditProduct(null);
        fetchAllData();
      }
    } catch (error: any) {
      addNotification({
        title: "Adjustment Failed",
        description: error.message,
        type: "error"
      });
    }
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!warehouseForm.name) errors.name = "Warehouse designation is required";
    if (!warehouseForm.location) errors.location = "Geographic address is required";
    if (!warehouseForm.capacity || isNaN(Number(warehouseForm.capacity))) errors.capacity = "Define a numerical storage volume limit";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch("/api/v1/inventory/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "Enterprise Admin" },
        body: JSON.stringify(warehouseForm)
      });
      const data = await response.json();

      if (data.success) {
        addNotification({
          title: "Warehouse Added",
          description: `Provisioned node: ${warehouseForm.name}`,
          type: "success"
        });
        addLog({
          method: "POST",
          endpoint: "/api/v1/inventory/warehouses",
          status: 201,
          type: "api",
          payload: warehouseForm,
          response: data
        });
        setShowAddWarehouse(false);
        setWarehouseForm({ name: "", location: "", capacity: "" });
        fetchAllData();
      }
    } catch (error: any) {
      addNotification({
        title: "Node Creation Failed",
        description: error.message,
        type: "error"
      });
    }
  };

  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!movementForm.sku) errors.sku = "Select a product SKU";
    if (!movementForm.quantity || isNaN(Number(movementForm.quantity))) errors.quantity = "Define stock quantity count";
    if (!movementForm.fromLoc) errors.fromLoc = "Specify starting dispatch point";
    if (!movementForm.toLoc) errors.toLoc = "Specify target receipt location";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch("/api/v1/inventory/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "Enterprise Admin" },
        body: JSON.stringify(movementForm)
      });
      const data = await response.json();

      if (data.success) {
        addNotification({
          title: "Movement Logged",
          description: `Registered physical ${movementForm.type} successfully.`,
          type: "success"
        });
        addLog({
          method: "POST",
          endpoint: "/api/v1/inventory/movements",
          status: 201,
          type: "api",
          payload: movementForm,
          response: data
        });
        setShowAddMovement(false);
        setMovementForm({ sku: "", type: "INBOUND", quantity: "", fromLoc: "", toLoc: "" });
        fetchAllData();
      } else {
        setFormErrors({ quantity: data.message });
      }
    } catch (error: any) {
      addNotification({
        title: "Movement Dispatch Failed",
        description: error.message,
        type: "error"
      });
    }
  };

  // Trigger AI Forecast
  const triggerAiForecast = async () => {
    if (!aiSku) {
      addNotification({
        title: "Forecast Parameter Missing",
        description: "Choose a product SKU to analyze safety stock demands.",
        type: "warning"
      });
      return;
    }

    setAiLoading(true);
    setAiOutput(null);
    try {
      const response = await fetch("/api/v1/inventory/ai-forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "Enterprise Admin" },
        body: JSON.stringify({ sku: aiSku })
      });
      const data = await response.json();

      if (data.success) {
        setAiOutput(data.suggestion);
        addLog({
          method: "POST",
          endpoint: "/api/v1/inventory/ai-forecast",
          status: 200,
          type: "api",
          payload: { sku: aiSku },
          response: { length: data.suggestion.length }
        });
      }
    } catch (error: any) {
      addNotification({
        title: "AI Forecast Engine Timeout",
        description: error.message,
        type: "error"
      });
    } finally {
      setAiLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    if (whFilter === "all") return matchesSearch;
    return matchesSearch && p.warehouses.some((wh: any) => wh.warehouseId === parseInt(whFilter));
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-zinc-400 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-500" />
        <span className="text-xs uppercase tracking-wider font-mono">Securing logistics database integrity...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/40 p-6 border border-zinc-800/80 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="h-6 w-6 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Enterprise Inventory</h1>
            <Badge variant="accent">Logistics Core</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time stock control, multi-zone warehouse optimization, and autonomous Gemini demand forecasting.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={fetchAllData}>
            Sync
          </Button>
          <Button variant="primary" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowAddProduct(true)}>
            Catalog SKU
          </Button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-zinc-800/80 gap-1 overflow-x-auto pb-px">
        {[
          { id: "overview", label: "Executive Summary", icon: <TrendingUp className="h-4 w-4" /> },
          { id: "products", label: "SKU Catalog", icon: <Database className="h-4 w-4" /> },
          { id: "warehouses", label: "Warehouses & Zones", icon: <Warehouse className="h-4 w-4" /> },
          { id: "movements", label: "Stock Movements", icon: <ArrowUpDown className="h-4 w-4" /> },
          { id: "forecasting", label: "AI Forecast Engine", icon: <Sparkles className="h-4 w-4" /> }
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
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-2xs font-semibold text-zinc-500 uppercase tracking-wider">Total Stock Value</span>
                    <h3 className="text-xl font-bold text-zinc-100 mt-1">
                      ${dashboardData.totalValuation.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xs text-emerald-400 mt-2 flex items-center gap-1 font-mono">
                  <span>● FULL INTEGRITY VERIFIED</span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-2xs font-semibold text-zinc-500 uppercase tracking-wider">Total Unique SKUs</span>
                    <h3 className="text-xl font-bold text-zinc-100 mt-1">{dashboardData.totalItems}</h3>
                  </div>
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <Database className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xs text-zinc-500 mt-2 flex items-center gap-1 font-mono">
                  <span>ACTIVE IN MULTI-CHANNELS</span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-2xs font-semibold text-zinc-500 uppercase tracking-wider">Physical Stock / Reserved</span>
                    <h3 className="text-xl font-bold text-zinc-100 mt-1">
                      {dashboardData.stockQty} <span className="text-sm font-normal text-zinc-500">/ {dashboardData.reservedQty}</span>
                    </h3>
                  </div>
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <Boxes className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xs text-zinc-500 mt-2 flex items-center gap-1 font-mono">
                  <span>AVAILABLE QTY: {dashboardData.stockQty - dashboardData.reservedQty} UNITS</span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-2xs font-semibold text-zinc-500 uppercase tracking-wider">Storage Facility Nodes</span>
                    <h3 className="text-xl font-bold text-zinc-100 mt-1">{dashboardData.warehouseCount} Facilities</h3>
                  </div>
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <Warehouse className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xs text-amber-400 mt-2 flex items-center gap-1 font-mono">
                  <span>{dashboardData.activeAlerts} UNRESOLVED ANOMALIES</span>
                </div>
              </Card>
            </div>

            {/* Warehouse Capacity Utilizations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Regional Warehousing Utilization</h3>
                  <p className="text-2xs text-zinc-500 mt-0.5">Utilized storage volume versus general facility thresholds.</p>
                </div>
                <div className="h-[240px] mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.warehouseSummary} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 10 }} stroke="#27272a" />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} stroke="#27272a" />
                      <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", color: "#f4f4f5" }} />
                      <Bar dataKey="percentage" fill="#6366f1" radius={[4, 4, 0, 0]} name="Capacity Used (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Alert Center Panel */}
              <Card className="p-6">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                  <AlertOctagon className="h-4 w-4 text-rose-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Active Stock Outliers</h3>
                </div>
                <div className="space-y-3 mt-4 overflow-y-auto max-h-[250px] pr-1">
                  {alerts.map((al: any) => (
                    <div key={al.id} className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-2xs font-bold text-zinc-300 font-mono">{al.sku}</span>
                        <Badge variant={al.severity === "high" ? "error" : "warning"}>{al.type}</Badge>
                      </div>
                      <p className="text-2xs text-zinc-400 leading-relaxed">{al.message}</p>
                      <div className="flex justify-between text-3xs text-zinc-500 font-mono pt-1">
                        <span>CRITICAL RANGE: &lt;{al.threshold}</span>
                        <span>CURRENT: {al.current}</span>
                      </div>
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="flex flex-col items-center justify-center min-h-[150px] text-zinc-600 text-2xs">
                      No active anomalies in ERP stock logs.
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === "products" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-center bg-zinc-950/40 p-4 border border-zinc-800 rounded-xl">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter by SKU or Title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs py-2 pl-9 pr-4 rounded-lg focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <select
                  value={whFilter}
                  onChange={(e) => setWhFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs py-2 px-3 rounded-lg focus:outline-none"
                >
                  <option value="all">All Warehouses</option>
                  {warehousesList.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Table */}
            <Card className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/30 text-3xs font-semibold uppercase tracking-wider text-zinc-400">
                    <th className="py-3 px-4">SKU / ID</th>
                    <th className="py-3 px-4">Product Component</th>
                    <th className="py-3 px-4 text-right">Physical stock</th>
                    <th className="py-3 px-4 text-right">Reserved</th>
                    <th className="py-3 px-4 text-right">Available</th>
                    <th className="py-3 px-4 text-right">Price Value</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {filteredProducts.map((p: any) => (
                    <tr key={p.id} className="text-2xs hover:bg-zinc-900/20 text-zinc-300">
                      <td className="py-3 px-4 font-mono font-semibold text-zinc-400">{p.sku}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-zinc-100">{p.title}</div>
                        <div className="text-3xs text-zinc-500 truncate max-w-[220px]">{p.description}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold font-mono text-zinc-100">{p.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-500">{p.reserved}</td>
                      <td className="py-3 px-4 text-right font-mono text-indigo-400 font-semibold">{p.available}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-400 font-semibold">${p.price.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-2xs py-1"
                            onClick={() => {
                              setSelectedProduct(p);
                              setAiSku(p.sku);
                              setActiveTab("forecasting");
                            }}
                            icon={<Sparkles className="h-3 w-3 text-indigo-400" />}
                          >
                            AI Forecast
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 text-2xs py-1"
                            onClick={() => {
                              setShowEditProduct(p);
                              setEditForm({ quantity: p.quantity.toString(), price: p.price.toString() });
                            }}
                            icon={<Sliders className="h-3 w-3" />}
                          >
                            Adjust
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-zinc-600 text-2xs">
                        No product SKUs matching query found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </motion.div>
        )}

        {activeTab === "warehouses" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Fulfillment Center Topology</h3>
                <p className="text-3xs text-zinc-500">Autonomous stock bins allocation and warehouse zones map.</p>
              </div>
              <Button variant="outline" size="sm" icon={<Plus className="h-3 w-3" />} onClick={() => setShowAddWarehouse(true)}>
                Add Warehouse Node
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {warehousesList.map((wh: any) => (
                <Card key={wh.id} className="p-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-zinc-100">{wh.name}</h4>
                        <span className="text-3xs text-zinc-500 font-mono uppercase flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5 text-zinc-500" /> {wh.location}
                        </span>
                      </div>
                      <Badge variant="accent">NODE #{wh.id}</Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-3xs font-mono text-zinc-500">
                        <span>UTILITY METRICS</span>
                        <span>{wh.utilized.toLocaleString()} / {wh.capacity.toLocaleString()} BINS</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (wh.utilized / wh.capacity) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Zones & Bins */}
                    <div className="space-y-2 border-t border-zinc-800/80 pt-3">
                      <span className="text-3xs font-bold uppercase tracking-wider text-zinc-500">Facility Zones</span>
                      <div className="space-y-2">
                        {wh.zones.map((zn: any) => (
                          <div key={zn.id} className="bg-zinc-950/60 p-2 border border-zinc-850 rounded-lg">
                            <div className="flex justify-between text-3xs font-semibold text-zinc-300">
                              <span>Zone {zn.id}: {zn.name}</span>
                            </div>
                            <div className="flex gap-1.5 mt-1.5 overflow-x-auto">
                              {zn.bins.map((bn: any) => (
                                <span key={bn} className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-3xs text-zinc-500 font-mono rounded shrink-0">
                                  {bn}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-3xs font-mono text-zinc-500 border-t border-zinc-800/80 pt-3 mt-4">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {wh.manager}</span>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "movements" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Stock movements registry</h3>
                <p className="text-3xs text-zinc-500">Chronological list of stock Adjustments, Transfers and Outbounds.</p>
              </div>
              <Button variant="outline" size="sm" icon={<Plus className="h-3 w-3" />} onClick={() => setShowAddMovement(true)}>
                Record Manual Movement
              </Button>
            </div>

            <Card className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/30 text-3xs font-semibold uppercase tracking-wider text-zinc-400">
                    <th className="py-3 px-4">TIMESTAMP</th>
                    <th className="py-3 px-4">SKU / ITEM</th>
                    <th className="py-3 px-4">ACTION TYPE</th>
                    <th className="py-3 px-4 text-right">QUANTITY</th>
                    <th className="py-3 px-4">ORIGIN DISPATCH</th>
                    <th className="py-3 px-4">TARGET RECEIPT</th>
                    <th className="py-3 px-4">LOGGED BY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {movements.map((m: any) => (
                    <tr key={m.id} className="text-2xs hover:bg-zinc-900/20 text-zinc-300">
                      <td className="py-3 px-4 font-mono text-zinc-500">{new Date(m.timestamp).toLocaleTimeString()}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-zinc-100">{m.sku}</td>
                      <td className="py-3 px-4">
                        <Badge variant={m.type === "INBOUND" ? "success" : m.type === "TRANSFER" ? "accent" : m.type === "ADJUSTMENT" ? "warning" : "error"}>
                          {m.type}
                        </Badge>
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-semibold ${m.quantity > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 text-3xs truncate max-w-[150px]">{m.fromLoc}</td>
                      <td className="py-3 px-4 text-zinc-400 text-3xs truncate max-w-[150px]">{m.toLoc}</td>
                      <td className="py-3 px-4 text-zinc-500 font-mono text-3xs">{m.user}</td>
                    </tr>
                  ))}
                  {movements.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-zinc-600 text-2xs">
                        No manual stock movements logged.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </motion.div>
        )}

        {activeTab === "forecasting" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6 h-fit space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
                  <Bot className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Predictive Safety Stock</h3>
                </div>

                <div className="space-y-4">
                  <Select
                    label="Target SKU selection"
                    options={[
                      { value: "", label: "-- Choose a SKU --" },
                      ...products.map(p => ({ value: p.sku, label: `${p.sku} - ${p.title}` }))
                    ]}
                    value={aiSku}
                    onChange={(e) => {
                      setAiSku(e.target.value);
                      setAiOutput(null);
                    }}
                  />

                  <p className="text-3xs text-zinc-500 leading-relaxed">
                    Lucas AI triggers server-side Gemini predictions based on active sales velocity, supplier allocations SLA, and regional fulfillment deficits.
                  </p>

                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={triggerAiForecast}
                    loading={aiLoading}
                    icon={<Sparkles className="h-4 w-4" />}
                    disabled={!aiSku}
                  >
                    Generate AI Forecast Report
                  </Button>
                </div>
              </Card>

              <Card className="lg:col-span-2 p-6 min-h-[300px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Forecasting Analytics Output</span>
                    <Badge variant="accent">Gemini 3.5 Flash Model Active</Badge>
                  </div>
                  
                  <div className="mt-4 text-zinc-300 text-2xs leading-relaxed space-y-2 whitespace-pre-line overflow-y-auto max-h-[350px]">
                    {aiOutput ? (
                      aiOutput
                    ) : aiLoading ? (
                      <div className="flex flex-col items-center justify-center min-h-[200px] text-zinc-500 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                        <span className="font-mono text-3xs uppercase tracking-wider">Lucas AI analyzing supply chain nodes...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[200px] text-zinc-600 text-center space-y-2">
                        <Sparkles className="h-8 w-8 text-zinc-700" />
                        <p>Choose an item SKU and click 'Generate' to query dynamic safety stock forecasts.</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Product Modal Dialog */}
      <AnimatePresence>
        {showAddProduct && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg">
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Add SKU to ERP Catalog</h3>
                  <button onClick={() => setShowAddProduct(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                </div>

                <form onSubmit={handleCreateProduct} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="SKU Code"
                      placeholder="e.g. SKU-901"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      error={formErrors.sku}
                    />
                    <Input
                      label="Product Component Title"
                      placeholder="e.g. Dynamic Sensor v3"
                      value={productForm.title}
                      onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                      error={formErrors.title}
                    />
                  </div>

                  <Textarea
                    label="Item Description"
                    placeholder="Enter structural components or licensing bounds..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Price Value (USD)"
                      placeholder="1500"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      error={formErrors.price}
                    />
                    <Input
                      label="In Stock Qty"
                      placeholder="100"
                      value={productForm.quantity}
                      onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                      error={formErrors.quantity}
                    />
                    <Select
                      label="Facility Target"
                      options={[
                        { value: "1", label: "Seattle Facility #1" },
                        { value: "2", label: "Frankfurt Facility #4" }
                      ]}
                      value={productForm.warehouseId}
                      onChange={(e) => setProductForm({ ...productForm, warehouseId: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                    <Button variant="outline" size="sm" onClick={() => setShowAddProduct(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Catalog SKU</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Adjust Stock Level Modal Dialog */}
      <AnimatePresence>
        {showEditProduct && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm">
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Adjust Stock levels</h3>
                  <button onClick={() => setShowEditProduct(null)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                </div>

                <div className="space-y-1">
                  <span className="text-3xs text-zinc-500 font-mono">SELECTED SKU</span>
                  <div className="font-bold text-xs text-indigo-400 font-mono">{showEditProduct.sku}</div>
                  <div className="text-3xs text-zinc-300">{showEditProduct.title}</div>
                </div>

                <form onSubmit={handleEditProduct} className="space-y-4 border-t border-zinc-850 pt-3">
                  <Input
                    label="Current Physical stock quantity"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                  />
                  <Input
                    label="Product Unit price (USD)"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  />

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                    <Button variant="outline" size="sm" onClick={() => setShowEditProduct(null)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Adjust Stock</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Warehouse Modal Dialog */}
      <AnimatePresence>
        {showAddWarehouse && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm">
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Add Storage Facility</h3>
                  <button onClick={() => setShowAddWarehouse(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                </div>

                <form onSubmit={handleCreateWarehouse} className="space-y-4">
                  <Input
                    label="Facility Name"
                    placeholder="e.g. Singapore Assembly Hub #3"
                    value={warehouseForm.name}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                    error={formErrors.name}
                  />
                  <Input
                    label="Geographic Location"
                    placeholder="e.g. Singapore, West Coast"
                    value={warehouseForm.location}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, location: e.target.value })}
                    error={formErrors.location}
                  />
                  <Input
                    label="Facility Storage Bin Volume Limit"
                    placeholder="10000"
                    value={warehouseForm.capacity}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, capacity: e.target.value })}
                    error={formErrors.capacity}
                  />

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                    <Button variant="outline" size="sm" onClick={() => setShowAddWarehouse(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Create Node</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Record Stock Movement Modal Dialog */}
      <AnimatePresence>
        {showAddMovement && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm">
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Manual Stock Movement</h3>
                  <button onClick={() => setShowAddMovement(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                </div>

                <form onSubmit={handleCreateMovement} className="space-y-4">
                  <Select
                    label="Target Item SKU"
                    options={[
                      { value: "", label: "-- Choose SKU --" },
                      ...products.map(p => ({ value: p.sku, label: `${p.sku} - ${p.title}` }))
                    ]}
                    value={movementForm.sku}
                    onChange={(e) => setMovementForm({ ...movementForm, sku: e.target.value })}
                    error={formErrors.sku}
                  />

                  <Select
                    label="Movement Operation"
                    options={[
                      { value: "INBOUND", label: "Inbound Receipt (+)" },
                      { value: "OUTBOUND", label: "Outbound Dispatch (-)" },
                      { value: "TRANSFER", label: "Inter-Warehouse Transfer" }
                    ]}
                    value={movementForm.type}
                    onChange={(e) => setMovementForm({ ...movementForm, type: e.target.value })}
                  />

                  <Input
                    label="Stock Quantity Count"
                    placeholder="25"
                    value={movementForm.quantity}
                    onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })}
                    error={formErrors.quantity}
                  />

                  <Input
                    label="Origin Dispatch Point"
                    placeholder="e.g. Supplier: NeoSteel LLC"
                    value={movementForm.fromLoc}
                    onChange={(e) => setMovementForm({ ...movementForm, fromLoc: e.target.value })}
                    error={formErrors.fromLoc}
                  />

                  <Input
                    label="Target Receipt Destination"
                    placeholder="e.g. Seattle Fulfillment Hub #1"
                    value={movementForm.toLoc}
                    onChange={(e) => setMovementForm({ ...movementForm, toLoc: e.target.value })}
                    error={formErrors.toLoc}
                  />

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                    <Button variant="outline" size="sm" onClick={() => setShowAddMovement(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Log Movement</Button>
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
