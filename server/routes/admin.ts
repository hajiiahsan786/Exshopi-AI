import express, { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

export const adminRouter = express.Router();

// Initialize Gemini Client safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI client in admin:", err);
    return null;
  }
};

// ==========================================
// IN-MEMORY DATA STORE FOR ADMIN MODULES
// ==========================================

interface ModuleStatus {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
  dependencies: string[];
  version: string;
  config: Record<string, string>;
}

const modules: ModuleStatus[] = [
  { id: "crm", name: "Enterprise CRM", category: "Revenue", enabled: true, dependencies: [], version: "1.0.0", config: { default_currency: "USD", pipeline_stages: "prospecting,proposal,negotiation,won,lost" } },
  { id: "hr", name: "Enterprise HR & Workforce", category: "Workforce", enabled: true, dependencies: [], version: "1.0.0", config: { base_working_hours: "40", payroll_cycle: "monthly" } },
  { id: "procurement", name: "Enterprise Procurement", category: "Logistics", enabled: true, dependencies: ["inventory"], version: "1.0.0", config: { approval_threshold: "5000", vendor_rating_required: "true" } },
  { id: "manufacturing", name: "Enterprise Manufacturing", category: "Logistics", enabled: true, dependencies: ["inventory"], version: "1.0.0", config: { safety_margin_pct: "10", machine_monitoring: "enabled" } },
  { id: "inventory", name: "Enterprise Inventory", category: "Logistics", enabled: true, dependencies: [], version: "1.0.0", config: { stock_tracking_mode: "real-time", low_stock_alert_pct: "15" } },
  { id: "sales", name: "Sales OMS Ledger", category: "Revenue", enabled: true, dependencies: ["inventory"], version: "1.0.0", config: { tax_rate_default: "8.25", invoice_prefix: "INV-" } },
  { id: "finance", name: "Enterprise Finance", category: "Revenue", enabled: true, dependencies: [], version: "1.0.0", config: { fiscal_year_start: "01-01", tax_reporting_mode: "accrual" } },
  { id: "projects", name: "Scrum Projects", category: "Workforce", enabled: true, dependencies: [], version: "1.0.0", config: { default_sprint_weeks: "2", burndown_tracking: "enabled" } },
  { id: "support", name: "Enterprise Support", category: "Workforce", enabled: true, dependencies: [], version: "1.0.0", config: { sla_hours_tier1: "4", ticket_auto_assign: "true" } },
  { id: "marketing", name: "Marketing Automation", category: "Revenue", enabled: true, dependencies: ["crm"], version: "1.0.0", config: { tracking_pixel_enabled: "true", bounce_threshold_pct: "5" } },
  { id: "documents", name: "Enterprise Documents", category: "Core Infrastructure", enabled: true, dependencies: [], version: "1.0.0", config: { max_file_size_mb: "100", ocr_scanning: "enabled" } },
  { id: "workflows", name: "Visual Workflow Builder", category: "Core Infrastructure", enabled: true, dependencies: [], version: "1.0.0", config: { execution_timeout_sec: "300", auto_resume: "true" } },
  { id: "notifications", name: "Notification Center", category: "Core Infrastructure", enabled: true, dependencies: [], version: "1.0.0", config: { smtp_fallback: "true", slack_relay: "enabled" } },
  { id: "analytics", name: "BI & Advanced Analytics", category: "Core Infrastructure", enabled: true, dependencies: [], version: "1.0.0", config: { refresh_interval_min: "15", caching_strategy: "redis" } },
  { id: "ai-workforce", name: "AI Headquarters", category: "AI & Innovation", enabled: true, dependencies: [], version: "1.0.0", config: { default_model: "gemini-3.5-flash", max_token_limit: "8192" } },
  { id: "voice-ai", name: "Voice AI Platform", category: "AI & Innovation", enabled: true, dependencies: [], version: "1.0.0", config: { default_voice_locale: "en-US", transcription_engine: "google-live" } },
  { id: "marketplace", name: "Enterprise Marketplace", category: "Revenue", enabled: true, dependencies: [], version: "1.0.0", config: { vendor_payout_mode: "split-payment", order_sync_rate_min: "5" } },
  { id: "payments", name: "Enterprise Payments", category: "Revenue", enabled: true, dependencies: ["finance"], version: "1.0.0", config: { payment_gateway: "stripe", dynamic_3ds: "enabled" } },
  { id: "logistics", name: "Logistics & Fleet", category: "Logistics", enabled: true, dependencies: ["inventory"], version: "1.0.0", config: { routing_algorithm: "green-shortest", telematics_sync_sec: "30" } },
  { id: "security", name: "Enterprise Security", category: "Core Infrastructure", enabled: true, dependencies: [], version: "1.0.0", config: { token_expiry_min: "120", session_fingerprint: "required" } }
];

// Connected Apps / Integrations State
const integrations = [
  { id: "slack", name: "Slack Messaging Hub", category: "Connected Apps", status: "connected", syncDate: "2026-07-15T14:02:11Z", details: "Real-time AI workplace chat relay activated" },
  { id: "github", name: "GitHub Repository Auth", category: "Connected Apps", status: "connected", syncDate: "2026-07-14T22:15:00Z", details: "CI/CD deployment webhooks mapped" },
  { id: "stripe", name: "Stripe Payment Gateway", category: "Payments & Accounting", status: "connected", syncDate: "2026-07-15T13:45:00Z", details: "Webhook active on live subscription plan" },
  { id: "salesforce", name: "Salesforce CRM Link", category: "CRM / ERP Sync", status: "disconnected", syncDate: "Never", details: "Authorization scope expired or missing keys" },
  { id: "ldap", name: "Enterprise Active Directory (LDAP)", category: "Security Sync", status: "connected", syncDate: "2026-07-15T14:10:00Z", details: "SSO mapped for enterprise workspace roles" }
];

// AI Models config
const aiModels = [
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", speed: "Ultra Fast", accuracy: "Balanced", tokenLimit: "1,048,576", cost: "Low", status: "active", default: true },
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro Preview", speed: "Medium", accuracy: "High Reasoning", tokenLimit: "2,097,152", cost: "Standard", status: "active", default: false },
  { id: "gemini-3.1-flash-tts-preview", name: "Gemini Speech TTS", speed: "Real-time", accuracy: "Voice synthesis", tokenLimit: "65,536", cost: "Low", status: "active", default: false }
];

const promptTemplates = [
  { name: "Executive Summary", module: "dashboard", description: "Formats operational parameters into beautiful summaries", active: true },
  { name: "SLA Customer Agent", module: "support", description: "Configures empathy matrices and rapid ticketing resolutions", active: true },
  { name: "MRP Yield Calculator", module: "manufacturing", description: "Predicts scrap levels based on batch humidity logs", active: true }
];

// Backup history
const backups = [
  { id: "b-092", date: "2026-07-15T12:00:00Z", status: "completed", size: "4.82 GB", tablesCount: 142, trigger: "Automated (Daily)" },
  { id: "b-091", date: "2026-07-14T12:00:00Z", status: "completed", size: "4.79 GB", tablesCount: 142, trigger: "Automated (Daily)" },
  { id: "b-090", date: "2026-07-13T12:00:00Z", status: "completed", size: "4.71 GB", tablesCount: 141, trigger: "Manual (Ad-hoc)" }
];

// SMTP Settings
let smtpConfig = {
  host: "smtp.sendgrid.net",
  port: 587,
  username: "apikey",
  sender: "noreply@exshopi.ai",
  branding: "Exshopi AI Corp",
  template_header: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format"
};

// System Settings / Localisation
let localizationConfig = {
  currency: "USD",
  timezone: "America/Los_Angeles",
  language: "en-US",
  date_format: "YYYY-MM-DD",
  number_format: "US-Standard"
};

// Voice profiles
const voiceProfiles = [
  { id: "vp-01", name: "Clara (SaaS Support)", locale: "en-US", pitch: 1.05, speed: 1.0, active: true },
  { id: "vp-02", name: "Arthur (Enterprise Finance)", locale: "en-GB", pitch: 0.9, speed: 0.95, active: false }
];

// Audit History Logs
const auditLogs = [
  { id: "a-402", user: "Ahsan Haji", action: "Toggle CRM Module", timestamp: "2026-07-15T14:12:00Z", ip: "192.168.1.104", status: "Success", details: "Module enabled successfully" },
  { id: "a-401", user: "Ahsan Haji", action: "Modify SMTP Config", timestamp: "2026-07-15T13:58:12Z", ip: "192.168.1.104", status: "Success", details: "SMTP server updated to sendgrid" },
  { id: "a-400", user: "System", action: "Nightly Hot Backup", timestamp: "2026-07-15T12:00:00Z", ip: "localhost", status: "Success", details: "Full cluster snapshot b-092 compiled" },
  { id: "a-399", user: "Ahsan Haji", action: "Export System Telemetry", timestamp: "2026-07-15T11:45:22Z", ip: "192.168.1.104", status: "Success", details: "Audit timeline exported to CSV" }
];

// Licenses & Billing Plan
let billingPlan = {
  plan_name: "Exshopi Enterprise Unlimited",
  tier: "Level-3 Enterprise Tier",
  status: "Active",
  renewal_date: "2027-01-10T00:00:00Z",
  usage_users_active: 142,
  usage_users_limit: 500,
  usage_ai_credits_used: 125884,
  usage_ai_credits_limit: 1000000,
  storage_used_gb: 42.8,
  storage_limit_gb: 100
};

// ==========================================
// API ENDPOINTS
// ==========================================

// 1. Get system health summary
adminRouter.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: "Fully Operational",
      uptime: "99.986%",
      last_reboot: "2026-07-01T04:00:00Z",
      system_load: "21.4%",
      api_health: "100%",
      active_ai_engines: 18,
      storage_usage_pct: 42.8,
      license_status: "Compliance Certified",
      metrics: {
        users: { current: 142, change_pct: 12.4 },
        organizations: { current: 2, change_pct: 0 },
        storage: { current_gb: 42.8, limit_gb: 100, change_pct: 4.8 },
        licenses: { current_issued: 142, limit: 500, active_tier: "Enterprise Pro" },
        api_requests: { total: 428019, rate_per_sec: 24.5 },
        model_invocations: { total_calls: 125884, token_throughput_k: 849012 }
      }
    }
  });
});

// 2. Get modules configuration and statuses
adminRouter.get("/modules", (req: Request, res: Response) => {
  res.json({ success: true, data: modules });
});

// Update module status (Enable / Disable)
adminRouter.put("/modules/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { enabled, config } = req.body;
  const mod = modules.find(m => m.id === id);
  if (!mod) return res.status(404).json({ error: "Module not found" });

  if (enabled !== undefined) mod.enabled = enabled;
  if (config !== undefined) mod.config = { ...mod.config, ...config };

  // Log in Audit
  auditLogs.unshift({
    id: `a-${Date.now().toString().slice(-3)}`,
    user: "Ahsan Haji",
    action: `Update module ${mod.name}`,
    timestamp: new Date().toISOString(),
    ip: req.ip || "127.0.0.1",
    status: "Success",
    details: `Toggled state to ${enabled ? "ENABLED" : "DISABLED"} with metadata updates`
  });

  res.json({ success: true, data: mod });
});

// 3. Get / Update Integrations
adminRouter.get("/integrations", (req: Request, res: Response) => {
  res.json({ success: true, data: integrations });
});

adminRouter.put("/integrations/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const integration = integrations.find(i => i.id === id);
  if (!integration) return res.status(404).json({ error: "Integration not found" });

  integration.status = status;
  integration.syncDate = new Date().toISOString();

  auditLogs.unshift({
    id: `a-${Date.now().toString().slice(-3)}`,
    user: "Ahsan Haji",
    action: `Toggle Integration ${integration.name}`,
    timestamp: new Date().toISOString(),
    ip: req.ip || "127.0.0.1",
    status: "Success",
    details: `Status mutated to ${status}`
  });

  res.json({ success: true, data: integration });
});

// 4. Get / Update AI configurations
adminRouter.get("/ai-settings", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      models: aiModels,
      templates: promptTemplates,
      memoryLimitMB: 512,
      knowledgeSourcesCount: 14,
      aiUsagePolicies: "Audit all pipeline actions and require manual confirmation for payments > $1000"
    }
  });
});

// 5. Get / Update SMTP configuration
adminRouter.get("/smtp", (req: Request, res: Response) => {
  res.json({ success: true, data: smtpConfig });
});

adminRouter.put("/smtp", (req: Request, res: Response) => {
  smtpConfig = { ...smtpConfig, ...req.body };

  auditLogs.unshift({
    id: `a-${Date.now().toString().slice(-3)}`,
    user: "Ahsan Haji",
    action: "Modify SMTP Settings",
    timestamp: new Date().toISOString(),
    ip: req.ip || "127.0.0.1",
    status: "Success",
    details: `Updated SMTP host to ${smtpConfig.host}`
  });

  res.json({ success: true, message: "SMTP parameters modified successfully", data: smtpConfig });
});

// 6. Localisation & System Settings
adminRouter.get("/localization", (req: Request, res: Response) => {
  res.json({ success: true, data: localizationConfig });
});

adminRouter.put("/localization", (req: Request, res: Response) => {
  localizationConfig = { ...localizationConfig, ...req.body };
  res.json({ success: true, data: localizationConfig });
});

// 7. Voice preferences
adminRouter.get("/voice-settings", (req: Request, res: Response) => {
  res.json({ success: true, data: { profiles: voiceProfiles } });
});

// 8. Backups history & Restore Actions
adminRouter.get("/backups", (req: Request, res: Response) => {
  res.json({ success: true, data: backups });
});

adminRouter.post("/backups", (req: Request, res: Response) => {
  const newBackup = {
    id: `b-0${93 + backups.length}`,
    date: new Date().toISOString(),
    status: "completed",
    size: "4.86 GB",
    tablesCount: 142,
    trigger: "Manual (Ad-hoc)"
  };
  backups.unshift(newBackup);

  auditLogs.unshift({
    id: `a-${Date.now().toString().slice(-3)}`,
    user: "Ahsan Haji",
    action: "Create System Backup",
    timestamp: new Date().toISOString(),
    ip: req.ip || "127.0.0.1",
    status: "Success",
    details: `Snapshot compiled successfully as ${newBackup.id}`
  });

  res.json({ success: true, data: newBackup });
});

// 9. License state
adminRouter.get("/license", (req: Request, res: Response) => {
  res.json({ success: true, data: billingPlan });
});

// 10. Audit History Log
adminRouter.get("/audit", (req: Request, res: Response) => {
  res.json({ success: true, data: auditLogs });
});

// 11. AI Administrator Consultation endpoint (Natural Language Query)
adminRouter.post("/ai-consult", async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Query query is required" });

  const ai = getGeminiClient();

  if (!ai) {
    // Offline AI simulation fallback
    let simulatedResponse = "";
    const lower = query.toLowerCase();

    if (lower.includes("health") || lower.includes("status")) {
      simulatedResponse = `### 🩺 System & Platform Uptime Diagnostic Summary
All services are fully healthy. The cluster reports **99.986% uptime** across 24 localized pods.

- **🖧 Microservices status**: 20/20 active and responsive.
- **🛡️ Intrusion metrics**: 0 incidents reported in the last 72 hours.
- **⚡ Core Latency**: Standard HTTP requests are averaging **32ms** response times.
- **🔋 Recommended Action**: No hardware scaling is required today. Ensure database snapshots execute cleanly at midnight.`;
    } else if (lower.includes("security") || lower.includes("policy")) {
      simulatedResponse = `### 🛡️ Operational Security Review Recommendations
Based on active enterprise policy profiling, here is your compliance summary:

1. **🔑 API Token Expiry**: Current token expiration is **120 minutes**. We recommend reducing this to **60 minutes** for Level-3 compliance.
2. **🔌 Unused Integrations**: The *Salesforce CRM Link* integration is registered but disconnected. Disable or re-authenticate to prevent orphaned token issues.
3. **🔒 MFA Mandate**: Ensure MFA is marked mandatory for any accounts holding the **Enterprise Admin** role.`;
    } else if (lower.includes("unused") || lower.includes("module")) {
      simulatedResponse = `### 🤖 Module Engagement Analysis
An analysis of daily transaction activity logs reveals high efficiency:

- **Inactive System Detect**: *Marketing Automation* has had 0 execution jobs triggered in the last 14 days.
- **Codependency Check**: Disabling *Marketing Automation* will NOT affect any of the core logistics or payroll functions, as no other modules depend on it.
- **💡 Savings impact**: Disabling this service releases **15% processor queue capacity** for the active inventory ledger loops.`;
    } else if (lower.includes("storage") || lower.includes("limit")) {
      simulatedResponse = `### 💾 Enterprise Storage Audit
Your enterprise workspace is utilizing **42.8 GB / 100 GB (42.8%)** of SSD capacity.

- **📊 Growth Vector**: Adding roughly **240 MB** of document scans and voice logs daily.
- **⏲️ Retention Audit**: Document retention is currently set to *Indefinite*. Changing PDF archive policies to **7 years** will reclaim approximately **12.4 GB** of static storage immediately.`;
    } else {
      simulatedResponse = `### 🤖 AI Administrative Assistant Report
I have received your query: **"${query}"**

Here is your enterprise systems review:
- **🟢 Cluster integrity**: Healthy and operating within normal bounds.
- **📈 Recommendations**: 
  - Regularly verify the integrity of restore snapshot points.
  - Deactivate unused development tokens inside the integrations hub.
  - Review role permission matrices to ensure principle of least privilege.`;
    }

    return res.json({ success: true, answer: simulatedResponse });
  }

  try {
    const systemPrompt = `You are the Principal AI Systems Administrator at Exshopi AI, the world's autonomous agent workforce platform. 
Your goal is to inspect platform parameters and provide clear, highly technical, and immediately actionable solutions for the administrator (Ahsan Haji). 
The active settings are:
- Active Modules: CRM, HR, Procurement, Manufacturing, Inventory, Sales, Finance, Projects, Support, Marketing, Documents, Workflows, Notifications, Analytics, AI Workforce, Voice AI, Marketplace, Payments, Logistics, Security.
- Active Users: 142
- Connected Apps: Slack, GitHub, Stripe, LDAP. Salesforce is disconnected.
- Storage: 42.8 GB of 100 GB.
- API requests: 428,019.
- Uptime: 99.986%.

Always write in clear, highly polished Markdown. Use bold terms and scannable visual indicators (bullet lists, code blocks). Do not invent false files, keep your feedback grounded inside administrative operations.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Please consult on the following query: ${query}`,
      config: {
        systemInstruction: systemPrompt
      }
    });

    res.json({ success: true, answer: response.text || "No insights parsed from Gemini." });
  } catch (err: any) {
    console.error("AI Admin Consult failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
