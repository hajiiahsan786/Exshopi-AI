import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Card, Button, Input, Select, Badge, Textarea, Dialog } from "./UI";
import {
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Trash2,
  Send,
  Lock,
  Key,
  Database,
  RefreshCw,
  Clock,
  Laptop,
  Cpu,
  Fingerprint,
  CheckCircle,
  FileSearch,
  AlertOctagon,
  Eye,
  Plus,
  Zap,
  Activity,
  Award,
  Power,
  Sliders,
  ChevronRight,
  Shield
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
  Tooltip as ChartTooltip,
  Legend
} from "recharts";

interface SecuritySession {
  id: number;
  userId: number;
  ipAddress: string;
  deviceFingerprint: string;
  status: "active" | "revoked";
  createdAt: string;
  lastActiveAt: string;
}

interface ComplianceControl {
  id: string;
  section: string;
  name: string;
  description: string;
  status: "passed" | "failed" | "auditing";
}

interface ApiKeyEntity {
  id: number;
  name: string;
  apiKey: string;
  scopes: string[];
  status: string;
  createdAt: string;
}

interface SecurityAlert {
  id: number;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  ipAddress: string;
  status: "open" | "remediated";
  riskScore: number;
  createdAt: string;
}

interface SecurityIncident {
  id: number;
  title: string;
  status: "open" | "investigating" | "resolved";
  severity: "high" | "critical";
  createdAt: string;
}

export const EnterpriseSecurityCenter: React.FC = () => {
  const { logs, clearLogs, addLog, addNotification } = useStore();
  const [activeTab, setActiveTab] = useState<"overview" | "threats" | "identity" | "compliance" | "secrets" | "sandbox">("overview");
  const [loading, setLoading] = useState(true);

  // Security Entities
  const [metrics, setMetrics] = useState({
    activeSessions: 0,
    highAlerts: 0,
    unresolvedIncidents: 0,
    postureScore: 92,
    mfaEnforcementRate: 100,
    sysIntegrity: "A+ Secures"
  });
  const [sessionsList, setSessionsList] = useState<SecuritySession[]>([]);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [incidentsList, setSecurityIncidents] = useState<SecurityIncident[]>([]);
  const [alertsList, setAlertsList] = useState<SecurityAlert[]>([]);
  const [apiKeysList, setApiKeysList] = useState<ApiKeyEntity[]>([]);
  const [complianceList, setComplianceList] = useState<ComplianceControl[]>([]);
  const [trustedDevicesList, setTrustedDevicesList] = useState<any[]>([]);

  // Sandboxed API Sandbox States (From original SystemTelemetryConsole)
  const [customEndpoint, setCustomEndpoint] = useState("/api/v1/payments/gateways");
  const [customMethod, setCustomMethod] = useState<"GET" | "POST" | "DELETE">("GET");
  const [customPayload, setCustomPayload] = useState("{\n  \"providerId\": \"stripe\",\n  \"status\": \"active\"\n}");
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [responseView, setResponseView] = useState<any>(null);

  // Forms / Actions States
  const [threatType, setThreatType] = useState("impossible_travel");
  const [threatIp, setThreatIp] = useState("185.190.140.22");
  const [threatRisk, setThreatRisk] = useState("95");
  const [simulationLoading, setSimulationLoading] = useState(false);

  const [apiKeyForm, setApiKeyForm] = useState({ name: "", scopes: "payments.read,logistics.read" });
  const [secretVaultForm, setSecretVaultForm] = useState({ key: "", value: "" });

  const [showAddApiKey, setShowAddApiKey] = useState(false);
  const [showAddSecret, setShowAddSecret] = useState(false);

  // MFA verification state
  const [mfaSecret, setMfaSecret] = useState<any>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaVerified, setMfaVerified] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(false);

  const [complianceAuditReport, setComplianceAuditReport] = useState<any>(null);
  const [complianceAuditLoading, setComplianceAuditLoading] = useState(false);

  const fetchSecurityOverview = async () => {
    setLoading(true);
    try {
      const [resDash, resSessions, resEvents, resIncidents, resApiKeys, resCompliance, resDevices] = await Promise.all([
        fetch("/api/v1/security/dashboard"),
        fetch("/api/v1/security/sessions"),
        fetch("/api/v1/security/events"),
        fetch("/api/v1/security/incidents"),
        fetch("/api/v1/security/api-keys"),
        fetch("/api/v1/security/compliance"),
        fetch("/api/v1/security/devices")
      ]);

      const [dashData, sessionsData, eventsData, incidentsData, apiKeysData, complianceData, devicesData] = await Promise.all([
        resDash.json(),
        resSessions.json(),
        resEvents.json(),
        resIncidents.json(),
        resApiKeys.json(),
        resCompliance.json(),
        resDevices.json()
      ]);

      if (dashData.success) {
        setMetrics(dashData.data.metrics);
        setAlertsList(dashData.data.recentAlerts || []);
      }
      if (sessionsData.success) setSessionsList(sessionsData.data);
      if (eventsData.success) setEventsList(eventsData.data);
      if (incidentsData.success) setSecurityIncidents(incidentsData.data);
      if (apiKeysData.success) setApiKeysList(apiKeysData.data);
      if (complianceData.success) setComplianceList(complianceData.data);
      if (devicesData.success) setTrustedDevicesList(devicesData.data);

    } catch (err: any) {
      console.error(err);
      addNotification({
        title: "SOC Control Unreachable",
        description: "Failed to fetch active cyber telemetry.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityOverview();
  }, []);

  // Sandbox Live Request execution (From original telemetry console)
  const handleTestAPI = async (e: React.FormEvent) => {
    e.preventDefault();
    setSandboxLoading(true);
    setResponseView(null);
    try {
      const options: RequestInit = {
        method: customMethod,
        headers: { "Content-Type": "application/json", "x-user-role": "Enterprise Admin" }
      };
      if (customMethod !== "GET") {
        options.body = customPayload;
      }

      const res = await fetch(customEndpoint, options);
      const data = await res.json();
      
      addLog({
        method: customMethod,
        endpoint: customEndpoint,
        status: res.status,
        type: "api",
        payload: customMethod !== "GET" ? JSON.parse(customPayload) : undefined,
        response: data
      });

      setResponseView(data);
    } catch (err: any) {
      const errorLog = { error: "Failed to dispatch API action", message: err.message };
      addLog({
        method: customMethod,
        endpoint: customEndpoint,
        status: 500,
        type: "api",
        response: errorLog
      });
      setResponseView(errorLog);
    } finally {
      setSandboxLoading(false);
    }
  };

  // Threat simulation trigger
  const handleTriggerSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulationLoading(true);
    try {
      const res = await fetch("/api/v1/security/threats/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "Enterprise Admin" },
        body: JSON.stringify({
          type: threatType,
          ipAddress: threatIp,
          riskScore: parseInt(threatRisk)
        })
      });
      const data = await res.json();
      if (data.success) {
        addNotification({
          title: "Intrusion Simulator Active",
          description: `Simulated ${threatType.toUpperCase().replace("_", " ")} threat vector locked in system.`,
          type: "warning"
        });
        addLog({
          method: "POST",
          endpoint: "/api/v1/security/threats/trigger",
          status: 200,
          type: "security",
          payload: { type: threatType, ipAddress: threatIp, riskScore: threatRisk },
          response: data
        });
        fetchSecurityOverview();
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      addNotification({
        title: "Simulation Refused",
        description: err.message || "Threat simulator engine rejected call.",
        type: "error"
      });
    } finally {
      setSimulationLoading(false);
    }
  };

  // Revoke / Terminate active session
  const handleRevokeSession = async (sessionId: number) => {
    try {
      const res = await fetch(`/api/v1/security/sessions/${sessionId}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "Enterprise Admin" }
      });
      const data = await res.json();
      if (data.success) {
        addNotification({
          title: "Session Cryptographically Revoked",
          description: `Active lease lease ID ${sessionId} terminated successfully.`,
          type: "success"
        });
        addLog({
          method: "POST",
          endpoint: `/api/v1/security/sessions/${sessionId}/revoke`,
          status: 200,
          type: "security",
          response: data
        });
        fetchSecurityOverview();
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      addNotification({
        title: "Revocation Failed",
        description: err.message || "Crypto handshake failure.",
        type: "error"
      });
    }
  };

  // Generate Scoped API Key
  const handleGenerateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/security/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "Enterprise Admin" },
        body: JSON.stringify({
          name: apiKeyForm.name,
          scopes: apiKeyForm.scopes.split(",").map(s => s.trim())
        })
      });
      const data = await res.json();
      if (data.success) {
        addNotification({
          title: "Scoped API Key Created",
          description: `Key matching signature ${apiKeyForm.name} registered.`,
          type: "success"
        });
        addLog({
          method: "POST",
          endpoint: "/api/v1/security/api-keys",
          status: 201,
          type: "security",
          payload: apiKeyForm,
          response: data
        });
        setShowAddApiKey(false);
        setApiKeyForm({ name: "", scopes: "payments.read,logistics.read" });
        fetchSecurityOverview();
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      addNotification({
        title: "Key Provision Failed",
        description: err.message || "Vault generation handshake aborted.",
        type: "error"
      });
    }
  };

  // Write Secret Vault
  const handleWriteSecretVault = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/security/secrets", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "Enterprise Admin" },
        body: JSON.stringify(secretVaultForm)
      });
      const data = await res.json();
      if (data.success) {
        addNotification({
          title: "Secret Written to Vault",
          description: `Reference pointer ${secretVaultForm.key} encrypted.`,
          type: "success"
        });
        addLog({
          method: "POST",
          endpoint: "/api/v1/security/secrets",
          status: 200,
          type: "security",
          payload: { key: secretVaultForm.key },
          response: data
        });
        setShowAddSecret(false);
        setSecretVaultForm({ key: "", value: "" });
        fetchSecurityOverview();
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      addNotification({
        title: "Vault Write Rejected",
        description: err.message || "Encrypted disk write timeout.",
        type: "error"
      });
    }
  };

  // Run SOC-2 compliance scanner
  const handleRunSOC2Audit = async () => {
    setComplianceAuditLoading(true);
    setComplianceAuditReport(null);
    try {
      const res = await fetch("/api/v1/security/compliance/soc2", {
        headers: { "x-user-role": "Enterprise Admin" }
      });
      const data = await res.json();
      if (data.success) {
        setComplianceAuditReport(data.data);
        addNotification({
          title: "Compliance Auditor Executed",
          description: "Completed compliance check across CC6 and CC7 control points.",
          type: "success"
        });
        addLog({
          method: "GET",
          endpoint: "/api/v1/security/compliance/soc2",
          status: 200,
          type: "security",
          response: data.data
        });
        fetchSecurityOverview();
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      addNotification({
        title: "Auditor Aborted",
        description: err.message || "Compliance checker thread threw exception.",
        type: "error"
      });
    } finally {
      setComplianceAuditLoading(false);
    }
  };

  // MFA Setup Call
  const handleSetupMFA = async () => {
    setMfaLoading(true);
    try {
      const res = await fetch("/api/v1/security/mfa/setup", {
        method: "POST",
        headers: { "x-user-role": "Enterprise Admin" }
      });
      const data = await res.json();
      if (data.success) {
        setMfaSecret(data.data);
        addLog({
          method: "POST",
          endpoint: "/api/v1/security/mfa/setup",
          status: 200,
          type: "security",
          response: data.data
        });
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setMfaLoading(false);
    }
  };

  // Verify MFA code
  const handleVerifyMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaCode) return;
    setMfaLoading(true);
    try {
      const res = await fetch("/api/v1/security/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "Enterprise Admin" },
        body: JSON.stringify({ code: mfaCode })
      });
      const data = await res.json();
      if (data.success) {
        setMfaVerified(true);
        addNotification({
          title: "TOTP Device Enrolled",
          description: "Dual-factor vector TOTP verified successfully.",
          type: "success"
        });
        addLog({
          method: "POST",
          endpoint: "/api/v1/security/mfa/verify",
          status: 200,
          type: "security",
          response: data
        });
      } else {
        addNotification({
          title: "TOTP Mismatch",
          description: "Code signature expired or incorrect.",
          type: "error"
        });
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setMfaLoading(false);
    }
  };

  const activeMethodColor = (method: string) => {
    if (method === "GET") return "text-emerald-400 bg-emerald-950/30 border-emerald-900/20";
    if (method === "POST") return "text-indigo-400 bg-indigo-950/30 border-indigo-900/20";
    return "text-rose-400 bg-rose-950/30 border-rose-900/20";
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "critical":
        return <Badge variant="error">CRITICAL (90+)</Badge>;
      case "high":
        return <Badge variant="error">HIGH</Badge>;
      case "medium":
        return <Badge variant="warning">MEDIUM</Badge>;
      case "low":
        return <Badge variant="neutral">LOW</Badge>;
      default:
        return <Badge variant="neutral">{sev}</Badge>;
    }
  };

  // Charts
  const incidentTrend = [
    { name: "Mon", Anomalies: 2, Blocked: 24 },
    { name: "Tue", Anomalies: 4, Blocked: 35 },
    { name: "Wed", Anomalies: 1, Blocked: 29 },
    { name: "Thu", Anomalies: 8, Blocked: 48 },
    { name: "Fri", Anomalies: 3, Blocked: 52 },
    { name: "Sat", Anomalies: 0, Blocked: 15 },
    { name: "Sun", Anomalies: 2, Blocked: 21 }
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-6 rounded-2xl border border-zinc-850/65">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-600/10 rounded-xl text-rose-400 border border-rose-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Enterprise Security Center
              <Badge variant="success" className="text-2xs">SOC-2 Certified</Badge>
            </h1>
            <p className="text-xs text-zinc-400">
              Cybersecurity operations tower. Monitor real-time access logs, audit trusted devices, revoke leases, and trigger threat simulations.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={fetchSecurityOverview}>
            Sync Control Center
          </Button>
          <Button variant="danger" size="sm" icon={<ShieldAlert className="h-3.5 w-3.5" />} onClick={() => setActiveTab("threats")}>
            Intrusion Simulator
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-zinc-800/50">
        {[
          { id: "overview", label: "Security Tower", icon: <Shield className="h-4 w-4" /> },
          { id: "threats", label: `Threat Center (${metrics.highAlerts})`, icon: <ShieldAlert className="h-4 w-4" /> },
          { id: "identity", label: `Identity & Access (${metrics.activeSessions})`, icon: <Fingerprint className="h-4 w-4" /> },
          { id: "compliance", label: "Compliance Audits", icon: <FileSearch className="h-4 w-4" /> },
          { id: "secrets", label: `Enclave Key Vault (${apiKeysList.length})`, icon: <Key className="h-4 w-4" /> },
          { id: "sandbox", label: "Telemetry Sandbox", icon: <Terminal className="h-4 w-4" /> }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === t.id
                ? "bg-zinc-800 text-white border border-zinc-700/50 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center text-zinc-400 gap-2 font-mono text-xs">
          <RefreshCw className="h-4 w-4 animate-spin text-rose-400" />
          <span>Syncing cybersecurity control log hashes...</span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Metrics Matrix */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <Card className="p-4 flex flex-col justify-between">
                    <span className="text-3xs uppercase font-mono tracking-widest text-zinc-500">Security Posture Score</span>
                    <h3 className="text-2xl font-bold tracking-tight text-white mt-1">{metrics.postureScore}/100</h3>
                    <span className="text-3xs text-emerald-400 font-mono mt-2">● Grade: Strong A+</span>
                  </Card>
                  <Card className="p-4 flex flex-col justify-between">
                    <span className="text-3xs uppercase font-mono tracking-widest text-zinc-500">Active sessions</span>
                    <h3 className="text-2xl font-bold tracking-tight text-indigo-400 mt-1">{metrics.activeSessions}</h3>
                    <span className="text-3xs text-zinc-500 mt-2">Live browser leases</span>
                  </Card>
                  <Card className="p-4 flex flex-col justify-between">
                    <span className="text-3xs uppercase font-mono tracking-widest text-zinc-500">High Risk Threat Alerts</span>
                    <h3 className="text-2xl font-bold tracking-tight text-rose-400 mt-1">{metrics.highAlerts}</h3>
                    <span className="text-3xs text-zinc-500 mt-2">Unresolved vector spikes</span>
                  </Card>
                  <Card className="p-4 flex flex-col justify-between">
                    <span className="text-3xs uppercase font-mono tracking-widest text-zinc-500">Unresolved Incidents</span>
                    <h3 className="text-2xl font-bold tracking-tight text-amber-400 mt-1">{metrics.unresolvedIncidents}</h3>
                    <span className="text-3xs text-zinc-500 mt-2">In SOC investigation</span>
                  </Card>
                  <Card className="p-4 flex flex-col justify-between col-span-2 md:col-span-1">
                    <span className="text-3xs uppercase font-mono tracking-widest text-zinc-500">MFA Enrollment Rate</span>
                    <h3 className="text-2xl font-bold tracking-tight text-emerald-400 mt-1">{metrics.mfaEnforcementRate}%</h3>
                    <span className="text-3xs text-emerald-400 font-mono mt-2">Enforced globally</span>
                  </Card>
                </div>

                {/* Bento layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chart: intrusion events */}
                  <Card className="p-5 lg:col-span-2 space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">IDS Security Traffic Signals</h4>
                      <p className="text-3xs text-zinc-500">Blocked packet rates vs anomaly indicators over 7 days</p>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={incidentTrend}>
                          <defs>
                            <linearGradient id="colorAnomalies" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                          <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                          <ChartTooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }} labelStyle={{ color: "#a1a1aa" }} />
                          <Area type="monotone" dataKey="Blocked" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorBlocked)" name="Blocked Attempts" />
                          <Area type="monotone" dataKey="Anomalies" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorAnomalies)" name="IDS Anomalies" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Active threat simulation control */}
                  <Card className="p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 mb-3">
                        <ShieldAlert className="h-4 w-4 text-rose-400" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Intrusion Vector Simulator</h4>
                      </div>
                      <p className="text-3xs text-zinc-500 mb-4 leading-relaxed">
                        Execute simulated cyber-attacks to verify that the IDS, Webhook alerting, and SOC controllers auto-remediate vectors successfully.
                      </p>

                      <form onSubmit={handleTriggerSimulation} className="space-y-3 font-sans">
                        <Select
                          label="Attack Pattern Vector"
                          value={threatType}
                          onChange={(e) => setThreatType(e.target.value)}
                          options={[
                            { value: "impossible_travel", label: "Impossible Travel (Geo-velocity shift)" },
                            { value: "brute_force_login", label: "Credential stuffing (Multi-IP lockout)" },
                            { value: "ddos_api_leak", label: "DDoS rate exhaustion (API abuse)" },
                            { value: "sql_injection", label: "SQL Injection query parsing anomaly" }
                          ]}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            label="Target Agent IP"
                            value={threatIp}
                            onChange={(e) => setThreatIp(e.target.value)}
                            required
                          />
                          <Input
                            label="Severity Score"
                            type="number"
                            min="1"
                            max="100"
                            value={threatRisk}
                            onChange={(e) => setThreatRisk(e.target.value)}
                            required
                          />
                        </div>
                        <Button variant="danger" className="w-full" type="submit" loading={simulationLoading} icon={<Zap className="h-4 w-4" />}>
                          Deploy Attack Simulation
                        </Button>
                      </form>
                    </div>
                  </Card>
                </div>

                {/* Audit Checklist */}
                <Card className="p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-emerald-400" />
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Continuous Auditing compliance mapping</h4>
                        <p className="text-3xs text-zinc-500">Live indicators mapped to regulatory parameters (SOC-2, HIPAA, PCI)</p>
                      </div>
                    </div>
                    <Badge variant="success">Fully verified</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {complianceList.slice(0, 3).map((control) => (
                      <div key={control.id} className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2">
                        <div className="flex justify-between items-center font-mono">
                          <span className="text-2xs font-bold text-indigo-400">{control.id} ({control.section})</span>
                          {control.status === "passed" ? (
                            <span className="text-emerald-400 font-bold text-3xs flex items-center gap-0.5">
                              <ShieldCheck className="h-3 w-3" /> PASS
                            </span>
                          ) : (
                            <span className="text-amber-400 font-bold text-3xs flex items-center gap-0.5">
                              <ShieldAlert className="h-3 w-3" /> AUDITING
                            </span>
                          )}
                        </div>
                        <h5 className="font-semibold text-zinc-200">{control.name}</h5>
                        <p className="text-3xs text-zinc-500 leading-relaxed">{control.description}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* TAB: THREATS */}
            {activeTab === "threats" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Alerts feeds table */}
                  <Card className="p-5 lg:col-span-2 space-y-4">
                    <div className="border-b border-zinc-800 pb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">IDS Security Incident Feed</h4>
                      <p className="text-3xs text-zinc-500">Real-time alerts processed from dynamic gateway filtering</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-850 text-3xs uppercase font-mono tracking-wider text-zinc-500">
                            <th className="py-2.5 px-3">Alert Code</th>
                            <th className="py-2.5 px-3">Intrusion Vector</th>
                            <th className="py-2.5 px-3">IP Signature</th>
                            <th className="py-2.5 px-3">Risk Level</th>
                            <th className="py-2.5 px-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900 text-xs text-zinc-300 font-mono">
                          {alertsList.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-zinc-500 text-center py-6 text-2xs">No active alerts. Systems normal.</td>
                            </tr>
                          ) : (
                            alertsList.map((alert) => (
                              <tr key={alert.id} className="hover:bg-zinc-950/20 transition-all">
                                <td className="py-3 px-3 text-zinc-400">#ALT-{alert.id}</td>
                                <td className="py-3 px-3 font-semibold text-zinc-100">{alert.type.toUpperCase().replace("_", " ")}</td>
                                <td className="py-3 px-3 text-zinc-400">{alert.ipAddress}</td>
                                <td className="py-3 px-3">{getSeverityBadge(alert.severity)}</td>
                                <td className="py-3 px-3 text-right">
                                  {alert.status === "open" ? (
                                    <Badge variant="warning">OPEN INCIDENT</Badge>
                                  ) : (
                                    <Badge variant="success">REMEDIATED</Badge>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Incidents timeline log */}
                  <Card className="p-5 space-y-4">
                    <div className="border-b border-zinc-800 pb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">SOC Incident Timeline</h4>
                      <p className="text-3xs text-zinc-500">Incident escalation registry</p>
                    </div>

                    <div className="space-y-4">
                      {incidentsList.map((inc) => (
                        <div key={inc.id} className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-3xs font-mono text-zinc-500">
                            <span>ID: INC-{inc.id}</span>
                            <span>{new Date(inc.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <h5 className="text-xs font-semibold text-zinc-200">{inc.title}</h5>
                          <div className="flex justify-between items-center">
                            <span className="text-2xs uppercase text-rose-400 font-mono font-bold">{inc.severity}</span>
                            <span className="text-xs">{getSeverityBadge(inc.status)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB: IDENTITY & LEASES */}
            {activeTab === "identity" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Browser leases */}
                  <Card className="p-5 lg:col-span-2 space-y-4">
                    <div className="border-b border-zinc-800 pb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Cryptographic Browser Leases</h4>
                      <p className="text-3xs text-zinc-500">Revoke token access instantaneously to terminate stolen device access</p>
                    </div>

                    <div className="space-y-3">
                      {sessionsList.map((sess) => (
                        <div key={sess.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 flex justify-between items-center flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <Laptop className="h-5 w-5 text-indigo-400" />
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-white block">IP: {sess.ipAddress}</span>
                              <span className="text-3xs font-mono text-zinc-500 block truncate max-w-sm">{sess.deviceFingerprint}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-3xs font-mono text-zinc-500">Active since {new Date(sess.createdAt).toLocaleTimeString()}</span>
                            {sess.status === "active" ? (
                              <Button variant="danger" size="sm" icon={<Power className="h-3 w-3" />} onClick={() => handleRevokeSession(sess.id)}>
                                Kill Lease
                              </Button>
                            ) : (
                              <Badge variant="neutral">Killed</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* TOTP / MFA setup */}
                  <Card className="p-5 space-y-4">
                    <div className="border-b border-zinc-800 pb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Dual-Vector TOTP Setup</h4>
                      <p className="text-3xs text-zinc-500">Cryptographically seed multi-factor device authentication</p>
                    </div>

                    {mfaVerified ? (
                      <div className="p-6 bg-emerald-950/25 border border-emerald-900/30 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
                        <CheckCircle className="h-10 w-10 text-emerald-500" />
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider">Device Authenticated</h5>
                        <p className="text-3xs text-zinc-400">TOTP multi-factor token locked in secure vault.</p>
                      </div>
                    ) : mfaSecret ? (
                      <form onSubmit={handleVerifyMFA} className="space-y-4">
                        <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg text-center space-y-2">
                          <span className="text-2xs font-mono text-zinc-500 block">SCAN THE QR CODE SEED</span>
                          <span className="font-mono text-lg font-bold text-indigo-400 tracking-wider block">{mfaSecret.otpauthUrl}</span>
                          <span className="text-3xs text-zinc-500 block">Secret token: {mfaSecret.secret}</span>
                        </div>
                        <Input
                          label="Enter 6-Digit Verification Code"
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value)}
                          placeholder="000000"
                          required
                        />
                        <Button variant="primary" className="w-full" type="submit" loading={mfaLoading}>
                          Confirm Verification Code
                        </Button>
                      </form>
                    ) : (
                      <div className="p-6 bg-zinc-950/40 border border-zinc-850 border-dashed rounded-xl flex flex-col items-center justify-center text-center space-y-3">
                        <Fingerprint className="h-8 w-8 text-zinc-600 animate-pulse" />
                        <h5 className="text-2xs font-bold text-zinc-400 uppercase tracking-widest">Awaiting Device Enrollment</h5>
                        <Button variant="outline" size="sm" onClick={handleSetupMFA} loading={mfaLoading}>
                          Generate TOTP Secret
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            )}

            {/* TAB: COMPLIANCE AUDITS */}
            {activeTab === "compliance" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Run audit sidebar */}
                  <Card className="p-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="border-b border-zinc-800 pb-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Continuous SOC Compliance Thread</h4>
                        <p className="text-3xs text-zinc-500">Exshopi AI automated policy auditor</p>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Execute automated cyber-audits mapped to SOC-2, PCI-DSS CC6/CC7 access controls. The audit inspects MFA parameters, log encryptions, API scopes, and revoked session statuses.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-zinc-850/60">
                      <Button variant="primary" className="w-full" onClick={handleRunSOC2Audit} loading={complianceAuditLoading} icon={<FileSearch className="h-4 w-4" />}>
                        Run Compliance Audit Scanner
                      </Button>
                    </div>
                  </Card>

                  {/* Live Report card */}
                  <Card className="p-5 lg:col-span-2 space-y-4 min-h-[350px]">
                    <div className="border-b border-zinc-800 pb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Compliance Audit Report Findings</h4>
                      <p className="text-3xs text-zinc-500">Automatic PDF and ledger hash generation</p>
                    </div>

                    {complianceAuditReport ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-center space-y-1">
                            <span className="text-3xs font-mono uppercase text-zinc-500">SOC-2 Status</span>
                            <span className="text-xs font-bold text-emerald-400 block">{complianceAuditReport.findings.soc2Status}</span>
                          </div>
                          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-center space-y-1">
                            <span className="text-3xs font-mono uppercase text-zinc-500">MFA Enforced</span>
                            <span className="text-xs font-bold text-indigo-400 block">{complianceAuditReport.findings.mfaCompliance}</span>
                          </div>
                          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-center space-y-1">
                            <span className="text-3xs font-mono uppercase text-zinc-500">Controls Evaluated</span>
                            <span className="text-xs font-bold text-zinc-200 block">{complianceAuditReport.controlsEvaluated} Controls</span>
                          </div>
                        </div>

                        <div className="p-3 bg-emerald-950/15 border border-emerald-900/20 rounded-xl flex items-center gap-2 text-3xs text-emerald-400 font-mono">
                          <ShieldCheck className="h-4 w-4" />
                          <span>Ledger Signature Hash verified: {complianceAuditReport.integrityHash.substring(0, 32)}...</span>
                        </div>

                        <div className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-xl font-mono text-2xs space-y-2">
                          <span className="text-zinc-500 block uppercase font-bold">Auditor Assessment notes:</span>
                          <p className="text-zinc-300 leading-relaxed">
                            MFA configuration is certified healthy. Active API gateway tokens are restricted and scoped properly. No cryptographic session anomalies found. Posture meets SOC-2 Type II standards.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center py-16 space-y-2">
                        <FileSearch className="h-10 w-10 text-zinc-700 animate-pulse" />
                        <p className="text-2xs uppercase tracking-wider">Awaiting audit scan trigger to compile posture report...</p>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            )}

            {/* TAB: KEY & VAULT SECRETS */}
            {activeTab === "secrets" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* API Keys */}
                  <Card className="p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Enclave Scoped API Keys</h4>
                        <p className="text-3xs text-zinc-500">Scoped access tokens for workforce service routers</p>
                      </div>
                      <Button variant="outline" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowAddApiKey(true)}>
                        Create API Key
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {apiKeysList.map((key) => (
                        <div key={key.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 flex justify-between items-center font-mono text-2xs flex-wrap gap-2">
                          <div className="space-y-1">
                            <span className="text-zinc-100 font-bold block">{key.name}</span>
                            <span className="text-zinc-500 font-bold text-3xs block">{key.apiKey}</span>
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            {key.scopes.map((sc, scIdx) => (
                              <Badge key={scIdx} variant="neutral" className="text-[9px]">{sc}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Secret Enclave pointers */}
                  <Card className="p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Enclave Secrets Vault References</h4>
                          <p className="text-3xs text-zinc-500">Secure environment credentials written to HSM references</p>
                        </div>
                        <Button variant="outline" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowAddSecret(true)}>
                          Store Reference
                        </Button>
                      </div>

                      <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                        Vault references point to cryptographic enclaves hosted in our secure cloud vaults. No physical keys or secrets are stored plaintext in the local workspace.
                      </p>
                    </div>

                    <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 text-indigo-300 rounded-xl mt-6 text-3xs font-mono flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>HSM (Hardware Security Modules) certified under FIPS 140-3 Level 4.</span>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB: TELEMETRY SANDBOX (ORIGINAL FUNCTIONALITY) */}
            {activeTab === "sandbox" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sandbox API Gateway */}
                <Card className="p-6 lg:col-span-1 space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
                    <span className="p-1.5 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                      <Cpu className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">API Sandbox Gateway</h4>
                      <p className="text-3xs text-zinc-500">Dispatch live requests to Exshopi AI endpoints</p>
                    </div>
                  </div>

                  <form onSubmit={handleTestAPI} className="space-y-4 font-sans">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <Select
                          label="Method"
                          value={customMethod}
                          onChange={(e: any) => setCustomMethod(e.target.value)}
                          options={[
                            { value: "GET", label: "GET" },
                            { value: "POST", label: "POST" },
                            { value: "DELETE", label: "DELETE" }
                          ]}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          label="Endpoint / URI"
                          value={customEndpoint}
                          onChange={(e) => setCustomEndpoint(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {customMethod !== "GET" && (
                      <div className="space-y-1.5">
                        <label className="text-2xs font-semibold uppercase tracking-wider text-zinc-400">Request Body (JSON)</label>
                        <textarea
                          className="w-full bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 p-3 rounded-lg focus:outline-none min-h-[100px]"
                          value={customPayload}
                          onChange={(e) => setCustomPayload(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-850 space-y-1 text-2xs text-zinc-500 font-mono">
                      <span className="font-semibold text-zinc-400 block mb-1">🔗 Preset Enterprise Foundation Routes:</span>
                      <div className="cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => { setCustomEndpoint("/api/v1/payments/gateways"); setCustomMethod("GET"); }}>
                        • GET `/api/v1/payments/gateways`
                      </div>
                      <div className="cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => { setCustomEndpoint("/api/v1/logistics/carriers"); setCustomMethod("GET"); }}>
                        • GET `/api/v1/logistics/carriers`
                      </div>
                      <div className="cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => { setCustomEndpoint("/api/v1/security/events"); setCustomMethod("GET"); }}>
                        • GET `/api/v1/security/events`
                      </div>
                      <div className="cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => { setCustomEndpoint("/api/v1/reports"); setCustomMethod("GET"); }}>
                        • GET `/api/v1/reports`
                      </div>
                    </div>

                    <Button variant="primary" className="w-full" type="submit" loading={sandboxLoading} icon={<Send className="h-4 w-4" />}>
                      Dispatch Live Endpoint Request
                    </Button>
                  </form>

                  {responseView && (
                    <div className="space-y-1.5 pt-2 border-t border-zinc-800/60 font-mono">
                      <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400 block">Sandbox API Response Output</span>
                      <pre className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-lg text-2xs text-emerald-400 overflow-x-auto max-h-52">
                        {JSON.stringify(responseView, null, 2)}
                      </pre>
                    </div>
                  )}
                </Card>

                {/* Telemetry log terminal */}
                <Card className="p-6 lg:col-span-2 flex flex-col h-[520px]">
                  <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-zinc-950 rounded-lg border border-zinc-850 text-zinc-400 animate-pulse">
                        <Terminal className="h-4 w-4" />
                      </span>
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Live Client-Server Telemetry Logs</h4>
                        <p className="text-3xs text-zinc-500">Real-time HTTP requests, Security sensors & webhook events</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={clearLogs}>
                      Clear Buffer
                    </Button>
                  </div>

                  <div className="flex-1 bg-black/50 border border-zinc-850 rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-3.5 custom-scrollbar">
                    {logs.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-zinc-600 text-xs gap-2">
                        <Cpu className="h-4 w-4 animate-spin" />
                        <span>Awaiting workspace platform API request events...</span>
                      </div>
                    ) : (
                      logs.map((log) => (
                        <div key={log.id} className="border-b border-zinc-900 pb-3 last:border-0 last:pb-0">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-2xs mb-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-zinc-600 font-semibold">{log.timestamp}</span>
                              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${activeMethodColor(log.method)}`}>
                                {log.method}
                              </span>
                              <span className="text-zinc-300 font-medium break-all">{log.endpoint}</span>
                            </div>
                            <div>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                log.status >= 200 && log.status < 300
                                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/30"
                                  : "bg-rose-950/40 text-rose-400 border-rose-900/30"
                              }`}>
                                STATUS {log.status}
                              </span>
                            </div>
                          </div>

                          {log.payload && (
                            <div className="text-[11px] text-zinc-500 pl-4 mt-1">
                              <span className="text-zinc-600 font-semibold">Payload: </span>
                              <span className="text-zinc-400 break-all">{JSON.stringify(log.payload)}</span>
                            </div>
                          )}

                          {log.response && (
                            <div className="text-[11px] text-zinc-500 pl-4 mt-0.5">
                              <span className="text-zinc-600 font-semibold">Response: </span>
                              <span className="text-emerald-500/90 break-all">{JSON.stringify(log.response)}</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* MODAL: Create API Key */}
      <Dialog isOpen={showAddApiKey} onClose={() => setShowAddApiKey(false)} title="Create Scoped API Key">
        <form onSubmit={handleGenerateApiKey} className="space-y-4">
          <Input
            label="API Key Description Name"
            value={apiKeyForm.name}
            onChange={(e) => setApiKeyForm({ ...apiKeyForm, name: e.target.value })}
            placeholder="e.g. Third-party Logistics Integration token"
            required
          />
          <Input
            label="Scope Lists (Comma-separated)"
            value={apiKeyForm.scopes}
            onChange={(e) => setApiKeyForm({ ...apiKeyForm, scopes: e.target.value })}
            placeholder="e.g. payments.read, logistics.read, security.read"
            required
          />
          <div className="flex gap-2 justify-end pt-2 border-t border-zinc-800">
            <Button variant="outline" type="button" onClick={() => setShowAddApiKey(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Generate Cryptographic API Key</Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL: Store Vault Secret */}
      <Dialog isOpen={showAddSecret} onClose={() => setShowAddSecret(false)} title="Store Enclave Secret Pointer">
        <form onSubmit={handleWriteSecretVault} className="space-y-4">
          <Input
            label="Secret Key Tag Pointer"
            value={secretVaultForm.key}
            onChange={(e) => setSecretVaultForm({ ...secretVaultForm, key: e.target.value })}
            placeholder="e.g. STRIPE_SECRET_KEY_PROD"
            required
          />
          <Input
            label="Secret Value Payload"
            value={secretVaultForm.value}
            onChange={(e) => setSecretVaultForm({ ...secretVaultForm, value: e.target.value })}
            placeholder="Plaintext credentials to encrypt inside HSM vault"
            type="password"
            required
          />
          <div className="flex gap-2 justify-end pt-2 border-t border-zinc-800">
            <Button variant="outline" type="button" onClick={() => setShowAddSecret(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Store Credential Reference</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
