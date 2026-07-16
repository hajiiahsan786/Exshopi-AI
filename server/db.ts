import {
  AIEmployee,
  AIEmployeeRole,
  AIEmployeeCapability,
  AIEmployeePermission,
  AIEmployeeConfiguration,
  AIEmployeeMemory,
  AIEmployeeTask,
  AIEmployeeConversation,
  AIEmployeeDecision,
  AIEmployeeRecommendation,
  AIEmployeeReport,
  AIEmployeeAnalytics,
  AIEmployeeAuditLog,
  VoiceSession,
  VoiceConversation,
  VoiceMessage,
  VoiceTranscript,
  VoiceRecording,
  VoiceProfile,
  VoicePreference,
  VoiceCommand,
  VoiceCall,
  VoiceCallParticipant,
  VoiceMeeting,
  VoiceMeetingParticipant,
  VoiceMeetingSummary,
  VoiceActionItem,
  VoiceAnalytics,
  VoiceAuditLog,
  MarketplaceProvider,
  MarketplaceAccount,
  MarketplaceStore,
  MarketplaceCredential,
  MarketplaceRegion,
  MarketplaceProduct,
  MarketplaceCategory,
  MarketplaceOrder,
  MarketplaceOrderItem,
  MarketplaceCustomer,
  MarketplaceInventory,
  MarketplacePrice,
  MarketplaceShipment,
  MarketplaceReturn,
  MarketplaceSyncJob,
  MarketplaceWebhook,
  MarketplaceEvent,
  MarketplaceLog,
  MarketplaceAuditLog,

  // Payments
  PaymentProvider,
  PaymentGateway,
  PaymentAccount,
  MerchantAccount,
  PaymentMethod,
  PaymentMethodToken,
  PaymentIntent,
  PaymentTransaction,
  PaymentAuthorization,
  PaymentCapture,
  PaymentRefund,
  PartialRefund,
  PaymentDispute,
  Chargeback,
  PaymentSettlement,
  SettlementBatch,
  PaymentWebhook,
  PaymentEvent,
  PaymentInvoice,
  PaymentReceipt,
  PaymentAuditLog,

  // Logistics
  LogisticsProvider,
  Carrier,
  CarrierService,
  WarehouseZone,
  WarehouseBin,
  FulfillmentCenter,
  Shipment,
  ShipmentPackage,
  ShipmentItem,
  ShipmentLabel,
  ShipmentTracking,
  DeliveryRoute,
  DeliveryStop,
  Fleet,
  Vehicle,
  Driver,
  DriverAssignment,
  DispatchOrder,
  RouteOptimizationJob,
  PickupRequest,
  DeliveryConfirmation,
  ProofOfDelivery,
  ReturnShipment,
  ReverseLogistics,
  CustomsDeclaration,
  FreightOrder,
  FreightCost,
  TransportationOrder,
  SupplyChainNode,
  SupplyChainRoute,
  InventoryTransit,
  ShipmentException,
  LogisticsWebhook,
  LogisticsAuditLog,

  // Reporting
  Report,
  ReportCategory,
  ReportTemplate,
  ReportFolder,
  ReportSection,
  ReportWidget,
  ReportParameter,
  ReportFilter,
  ReportQuery,
  ReportSchedule,
  ReportExecution,
  ReportHistory,
  ReportSnapshot,
  ReportSubscription,
  ReportRecipient,
  ReportExport,
  ReportAttachment,
  ReportBookmark,
  ReportFavorite,
  DashboardReport,
  ReportPermission,
  ReportAuditLog,

  // Security
  SecurityPolicy,
  SecurityRule,
  SecurityEvent,
  SecurityAlert,
  SecurityIncident,
  SecurityAudit,
  SecuritySession,
  TrustedDevice,
  LoginHistory,
  RiskAssessment,
  ThreatDetection,
  APIKey,
  APIKeyScope,
  SecretReference,
  EncryptionKeyReference,
  ComplianceReport,
  ComplianceControl,
  ComplianceAudit
} from "../src/types";

// Setup database tables with high-fidelity seed data
export const roles: AIEmployeeRole[] = [
  { id: 1, name: "AI CEO", description: "Company overview, strategic planning, business analysis, and department coordination.", responsibilities: ["Company overview", "Strategic planning", "Business analysis", "KPI monitoring", "Department coordination", "Executive reports", "Business recommendations", "Goal tracking", "Cross-department optimization"] },
  { id: 2, name: "AI Executive Assistant", description: "Calendar coordination, meetings management, executive briefings, email drafts, and summaries.", responsibilities: ["Calendar", "Meetings", "Executive briefings", "Task reminders", "Email assistance", "Document summaries", "Meeting summaries", "Follow-ups", "Natural language commands"] },
  { id: 3, name: "AI Sales Manager", description: "Sales forecasting, pipeline analysis, deal health checks, and revenue forecasting.", responsibilities: ["Sales forecasting", "Pipeline analysis", "Quote optimization", "Revenue forecasting", "Deal prioritization", "Sales recommendations", "Sales reports"] },
  { id: 4, name: "AI CRM Manager", description: "Lead scoring, customer segmentation, opportunity management, and relationship health metrics.", responsibilities: ["Lead scoring", "Customer segmentation", "Opportunity management", "Customer health", "Follow-up automation", "Relationship insights"] },
  { id: 5, name: "AI HR Manager", description: "Hiring suggestions, attendance insight tracker, leaves analysis, and performance coaching.", responsibilities: ["Hiring recommendations", "Attendance insights", "Leave analysis", "Performance reviews", "Training suggestions", "Payroll analytics", "Employee engagement"] },
  { id: 6, name: "AI Finance Manager", description: "Cash flow optimization, budget reviews, expense auditing, and financial reporting.", responsibilities: ["Cash flow analysis", "Budget analysis", "Expense monitoring", "Revenue analysis", "Profit analysis", "Invoice review", "Financial forecasting"] },
  { id: 7, name: "AI Procurement Manager", description: "Purchase pipeline optimization, vendor rankings, cost reduction plans, and bidding.", responsibilities: ["Purchase optimization", "Supplier evaluation", "Cost reduction", "Purchase planning", "Vendor recommendations"] },
  { id: 8, name: "AI Manufacturing Manager", description: "Production line balancing, machine utilization insights, and capacity tracking.", responsibilities: ["Production optimization", "Machine utilization", "Capacity planning", "Quality insights", "Material planning", "Production scheduling"] },
  { id: 9, name: "AI Inventory Manager", description: "Warehouse levels balance, stock replenishment alerts, and dead stock analysis.", responsibilities: ["Inventory optimization", "Reorder recommendations", "Warehouse balancing", "Demand forecasting", "Dead stock detection"] },
  { id: 10, name: "AI Project Manager", description: "Agile sprints, tasks priority, deadline predictions, and resource risk mappings.", responsibilities: ["Project health", "Task prioritization", "Deadline prediction", "Risk analysis", "Resource allocation"] },
  { id: 11, name: "AI Marketing Manager", description: "Social media marketing campaigns, customer targeting, and ROI monitoring.", responsibilities: ["Campaign optimization", "Lead generation", "ROI analysis", "Customer targeting", "Marketing recommendations"] },
  { id: 12, name: "AI Customer Support Manager", description: "Ticket priorities, SLA status monitor, satisfaction score alerts, and answer drafts.", responsibilities: ["Ticket prioritization", "SLA monitoring", "Customer satisfaction", "Knowledge suggestions", "Escalation recommendations"] },
  { id: 13, name: "AI Analytics Advisor", description: "KPI exploration, business dashboards, executive briefings, and analytics questions.", responsibilities: ["Business dashboards", "Trend analysis", "Forecasting", "Executive summaries", "KPI explanations", "Natural language analytics"] },
  { id: 14, name: "AI Compliance & Risk Manager", description: "Policy checking, risk identification, fraud tracing, and security recommendation logs.", responsibilities: ["Compliance monitoring", "Policy enforcement", "Risk detection", "Fraud detection", "Audit analysis", "Security recommendations"] }
];

export const employees: AIEmployee[] = [
  { id: 1, name: "Chief Executive Agent", roleId: 1, email: "ceo@exshopi.ai", avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", departmentId: 1, status: "active", salary: 5000, created_at: "2026-01-10T00:00:00Z" },
  { id: 2, name: "Athena Executive Assistant", roleId: 2, email: "assistant@exshopi.ai", avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80", departmentId: 1, status: "idle", salary: 3000, created_at: "2026-01-11T00:00:00Z" },
  { id: 3, name: "Sophia Sales Agent", roleId: 3, email: "sales@exshopi.ai", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", departmentId: 1, status: "busy", salary: 4000, created_at: "2026-01-12T00:00:00Z" },
  { id: 4, name: "Corey CRM Agent", roleId: 4, email: "crm@exshopi.ai", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", departmentId: 1, status: "active", salary: 3500, created_at: "2026-01-13T00:00:00Z" },
  { id: 5, name: "Harper HR Agent", roleId: 5, email: "hr@exshopi.ai", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", departmentId: 2, status: "idle", salary: 3200, created_at: "2026-01-14T00:00:00Z" },
  { id: 6, name: "Fiona Finance Agent", roleId: 6, email: "finance@exshopi.ai", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80", departmentId: 2, status: "active", salary: 4500, created_at: "2026-01-15T00:00:00Z" },
  { id: 7, name: "Peter Procurement Agent", roleId: 7, email: "procurement@exshopi.ai", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80", departmentId: 2, status: "idle", salary: 3400, created_at: "2026-01-16T00:00:00Z" },
  { id: 8, name: "Magnus Manufacturing Agent", roleId: 8, email: "manufacturing@exshopi.ai", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", departmentId: 3, status: "active", salary: 3800, created_at: "2026-01-17T00:00:00Z" },
  { id: 9, name: "Lucas Inventory Agent", roleId: 9, email: "inventory@exshopi.ai", avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80", departmentId: 3, status: "idle", salary: 3100, created_at: "2026-01-18T00:00:00Z" },
  { id: 10, name: "Percy Project Agent", roleId: 10, email: "project@exshopi.ai", avatarUrl: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150&auto=format&fit=crop&q=80", departmentId: 1, status: "busy", salary: 3600, created_at: "2026-01-19T00:00:00Z" },
  { id: 11, name: "Mila Marketing Agent", roleId: 11, email: "marketing@exshopi.ai", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", departmentId: 1, status: "active", salary: 3300, created_at: "2026-01-20T00:00:00Z" },
  { id: 12, name: "Ethan Support Agent", roleId: 12, email: "support@exshopi.ai", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80", departmentId: 2, status: "active", salary: 2800, created_at: "2026-01-21T00:00:00Z" },
  { id: 13, name: "Alice Analytics Agent", roleId: 13, email: "analytics@exshopi.ai", avatarUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80", departmentId: 1, status: "idle", salary: 4200, created_at: "2026-01-22T00:00:00Z" },
  { id: 14, name: "Carter Compliance Agent", roleId: 14, email: "compliance@exshopi.ai", avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80", departmentId: 1, status: "active", salary: 4600, created_at: "2026-01-23T00:00:00Z" }
];

export const capabilities: AIEmployeeCapability[] = [
  // CEO
  { id: 1, employeeId: 1, name: "Corporate Strategy formulation", description: "Draft multi-year growth programs & market forecasts", proficiency: 98 },
  { id: 2, employeeId: 1, name: "Department Alignment Orchestrator", description: "Optimize workflows and KPIs across all managers", proficiency: 96 },
  // Executive Assistant
  { id: 3, employeeId: 2, name: "Briefing summaries", description: "Synthesize hundreds of business logs into clean summaries", proficiency: 99 },
  { id: 4, employeeId: 2, name: "Context & Task Reminders", description: "Track active deadlines and follow ups", proficiency: 97 },
  // Sales
  { id: 5, employeeId: 3, name: "Sales Pipeline Forecasting", description: "Predict dynamic deal closure probabilities", proficiency: 94 },
  { id: 6, employeeId: 3, name: "Revenue optimization algorithms", description: "Formulate optimal discount parameters", proficiency: 92 },
  // CRM
  { id: 7, employeeId: 4, name: "Lead Score Modeling", description: "Analyze customer signals to assign lead health rankings", proficiency: 95 },
  // HR
  { id: 8, employeeId: 5, name: "Staff Engagement Insights", description: "Analyze metrics to gauge retention risk levels", proficiency: 91 },
  // Finance
  { id: 9, employeeId: 6, name: "Liquidity Planning Engine", description: "Predict daily balances and operational cash flows", proficiency: 97 },
  // Procurement
  { id: 10, employeeId: 7, name: "Supplier Performance Analytics", description: "Grade vendor efficiency & deliverability matrixes", proficiency: 92 },
  // Manufacturing
  { id: 11, employeeId: 8, name: "OEE Utilization Optimizer", description: "Analyze sensor loops to detect system bottlenecks", proficiency: 93 },
  // Inventory
  { id: 12, employeeId: 9, name: "Demand forecasting index", description: "Safety stock and dead stock analyzer", proficiency: 96 },
  // Project Manager
  { id: 13, employeeId: 10, name: "Slipped-schedule Prediction", description: "Analyze burn downs to flag slipping delivery items", proficiency: 94 },
  // Marketing Manager
  { id: 14, employeeId: 11, name: "Ad Spend Attribution Analytics", description: "Calculate optimal ROAS across multi-tier channels", proficiency: 95 },
  // Support Manager
  { id: 15, employeeId: 12, name: "Escalation Routing Classifier", description: "Route priority cases before SLA triggers occur", proficiency: 98 },
  // Analytics
  { id: 16, employeeId: 13, name: "Anomaly discovery algorithms", description: "Automatically isolate spikes or valleys in sales logs", proficiency: 97 },
  // Compliance
  { id: 17, employeeId: 14, name: "Regulatory Compliance Audit", description: "Audit ledger trails to enforce GDPR, SOC-2 compliance", proficiency: 99 }
];

export const permissions: AIEmployeePermission[] = [
  { id: 1, roleId: 1, permission: "org:read_all", description: "Full read access to all system metadata" },
  { id: 2, roleId: 1, permission: "org:write_all", description: "Full write access to corporate definitions" },
  { id: 3, roleId: 1, permission: "finance:audit", description: "Audit global general ledger systems" },
  { id: 4, roleId: 3, permission: "crm:write_leads", description: "Modify pipeline lead records" },
  { id: 5, roleId: 6, permission: "finance:write_invoice", description: "Generate valid company invoice logs" },
  { id: 6, roleId: 9, permission: "inventory:reorder", description: "Trigger stock replenishment orders" },
  { id: 7, roleId: 14, permission: "compliance:audit_logs", description: "Review audit-trail ledgers" }
];

export const configurations: AIEmployeeConfiguration[] = employees.map((emp, index) => ({
  id: index + 1,
  employeeId: emp.id,
  temperature: 0.2,
  responseStyle: "professional",
  systemInstructions: `You are the ${roles.find(r => r.id === emp.roleId)?.name} in our Enterprise AI Workforce. Support your specialized responsibilities with absolute accuracy, deep reasoning, and clear, structured proposals. Keep in mind company guidelines.`,
  toolsEnabled: [
    "CRM Tool",
    "Finance Tool",
    "Inventory Tool",
    "Sales Tool",
    "Workflow Tool",
    "Notification Tool",
    "Search Tool",
    "Reporting Tool",
    "Document Tool",
    "Analytics Tool"
  ]
}));

export const memories: AIEmployeeMemory[] = [
  { id: 1, employeeId: 1, type: "long-term", content: "Active annual revenue target is $12M with a current run-rate of $10.4M.", timestamp: "2026-07-10T12:00:00Z" },
  { id: 2, employeeId: 3, type: "short-term", content: "Negotiating enterprise pilot license with John Doe at john@targetcompany.com.", timestamp: "2026-07-14T09:15:00Z" },
  { id: 3, employeeId: 6, type: "long-term", content: "Approved budget limit of $150K for DEPT-ASA (Autonomous Sales Agents).", timestamp: "2026-07-11T16:40:00Z" }
];

export const tasks: AIEmployeeTask[] = [
  { id: 1, employeeId: 1, title: "Formulate Q3 Growth Plan", description: "Analyze cross-department KPIs to draft executive strategy recommendations.", status: "planning", priority: "critical", due_date: "2026-07-25", created_at: "2026-07-15T01:00:00Z" },
  { id: 2, employeeId: 3, title: "Optimize Discount Guidelines", description: "Review active pipeline quotes to reduce discount leaks and boost average deal sizes.", status: "in-progress", priority: "high", due_date: "2026-07-18", created_at: "2026-07-15T02:30:00Z" },
  { id: 3, employeeId: 9, title: "Isolate Dead Stock on SKU-402", description: "Safety inventory on warehouse 2 is high. Review demand forecasts.", status: "completed", priority: "medium", due_date: "2026-07-14", created_at: "2026-07-13T09:00:00Z" }
];

export const conversations: AIEmployeeConversation[] = employees.map((emp, index) => ({
  id: index + 1,
  employeeId: emp.id,
  messages: [
    { sender: "user", content: `Hello! Please verify your active state and report your current status.`, timestamp: "2026-07-15T07:30:00Z" },
    { sender: "agent", content: `Greeting secured. This is ${emp.name} reporting. Systems are online and fully aligned to optimize our enterprise operations. Ready to execute my assigned functions.`, timestamp: "2026-07-15T07:30:15Z" }
  ],
  updated_at: "2026-07-15T07:30:15Z"
}));

export const decisions: AIEmployeeDecision[] = [
  { id: 1, employeeId: 1, title: "Authorize Q3 Sales Budget Extension", rational: "Increased Q3 sales quota requires expanding CRM and Sales Agent resource limits. Approved extra $25K.", impactLevel: "high", logged_at: "2026-07-15T05:00:00Z" },
  { id: 2, employeeId: 9, title: "Automated SKU Reorder Triggered", rational: "SKU 'ASE-V2-LICENSE' fell below safety buffer threshold. Triggered order of 150 units to supplier.", impactLevel: "medium", logged_at: "2026-07-14T23:30:00Z" }
];

export const recommendations: AIEmployeeRecommendation[] = [
  { id: 1, employeeId: 1, category: "Strategic planning", recommendation: "Consolidate double support channels to save 12% in operations overhead.", benefit: "Saves $4,500/mo and routes cases faster.", score: 92, status: "pending", created_at: "2026-07-15T06:12:00Z" },
  { id: 2, employeeId: 6, category: "Cash flow analysis", recommendation: "Incentivize Net-15 invoice payments with a 1.5% premium discount.", benefit: "Boosts working capital liquidity ratio by 18%.", score: 88, status: "pending", created_at: "2026-07-15T04:20:00Z" }
];

export const reports: AIEmployeeReport[] = [
  { id: 1, employeeId: 1, title: "Q2 Executive Performance Summary", content: "# Q2 Performance Report\n**Global Tech Corp / Exshopi AI**\n\n## Financial Health\n- Actual Revenue: $2,840,000 (Target: $2.5M)\n- Gross Margin: 74%\n\n## Agent Performance\n- Sales Agent outreach: 12,000 targeted leads, 14% response rate.\n- Customer Support SLA: 99.4% resolution compliance under Ethan AI.", generated_at: "2026-07-14T18:00:00Z" }
];

export const analytics: AIEmployeeAnalytics[] = [
  { id: 1, employeeId: 1, metricName: "Operational Efficiency Score", metricValue: 94.6, timestamp: "2026-07-15T07:00:00Z" },
  { id: 2, employeeId: 3, metricName: "Outbound Lead Conversion Rate", metricValue: 14.2, timestamp: "2026-07-15T07:00:00Z" },
  { id: 3, employeeId: 12, metricName: "Customer Support SLA Compliance", metricValue: 99.4, timestamp: "2026-07-15T07:00:00Z" }
];

export const auditLogs: AIEmployeeAuditLog[] = [
  { id: 1, employeeId: 1, action: "Strategic Plan Formulation", details: "AI CEO checked user permissions 'org:read_all' and successfully synthesized the organizational KPI summary.", permissionChecked: true, timestamp: "2026-07-15T07:00:00Z" }
];

// Helper database functions to execute REST requests
export function getEmployeeById(id: number) {
  return employees.find(e => e.id === id);
}

export function logAudit(employeeId: number, action: string, details: string, permissionChecked: boolean = true) {
  const newLog: AIEmployeeAuditLog = {
    id: auditLogs.length + 1,
    employeeId,
    action,
    details,
    permissionChecked,
    timestamp: new Date().toISOString()
  };
  auditLogs.push(newLog);
  return newLog;
}

// ==========================================
// ENTERPRISE VOICE AI PLATFORM DATABASE STATE
// ==========================================

export const voiceSessions: VoiceSession[] = [
  { id: 1, employeeId: 1, status: "completed", provider: "Gemini Voice API", duration: 185, channel: "browser", createdAt: "2026-07-15T01:10:00Z" },
  { id: 2, employeeId: 2, status: "active", provider: "SIP Gate trunk", duration: 42, channel: "sip", createdAt: "2026-07-15T07:45:00Z" },
  { id: 3, employeeId: 3, status: "completed", provider: "Twilio voice", duration: 120, channel: "phone", createdAt: "2026-07-15T05:30:00Z" }
];

export const voiceConversations: VoiceConversation[] = [
  { id: 1, sessionId: 1, employeeId: 1, messagesCount: 2, lastActive: "2026-07-15T01:13:00Z" },
  { id: 2, sessionId: 2, employeeId: 2, messagesCount: 1, lastActive: "2026-07-15T07:45:42Z" },
  { id: 3, sessionId: 3, employeeId: 3, messagesCount: 2, lastActive: "2026-07-15T05:32:00Z" }
];

export const voiceMessages: VoiceMessage[] = [
  { id: 1, conversationId: 1, sender: "user", content: "AI CEO, generate a strategic synthesis of our sales performance and department metrics.", audioUrl: "/audio/simulated_recording_1.mp3", duration: 6, timestamp: "2026-07-15T01:10:15Z" },
  { id: 2, conversationId: 1, sender: "agent", content: "Request authorized. Based on our multi-department database status, our operating revenue run-rate remains robust. I've initiated an audit of global invoices.", audioUrl: "/audio/ceo_speech_1.mp3", duration: 14, timestamp: "2026-07-15T01:11:00Z" },
  { id: 3, conversationId: 2, sender: "user", content: "Help me find John Doe's contact card, Sophia Sales has some pending updates for him.", audioUrl: "/audio/simulated_recording_2.mp3", duration: 4, timestamp: "2026-07-15T07:45:10Z" },
  { id: 4, conversationId: 3, sender: "user", content: "Trigger the outbound sales quote incentive for our e-commerce pipeline.", audioUrl: "/audio/simulated_recording_3.mp3", duration: 5, timestamp: "2026-07-15T05:30:10Z" },
  { id: 5, conversationId: 3, sender: "agent", content: "Understood. The outbound pipeline incentive is now active. Net-15 premium discounts are flagged for high-interest prospects.", audioUrl: "/audio/sales_speech_3.mp3", duration: 11, timestamp: "2026-07-15T05:31:00Z" }
];

export const voiceTranscripts: VoiceTranscript[] = [
  { id: 1, entityType: "session", entityId: 1, fullText: "User: AI CEO, generate a strategic synthesis of our sales performance and department metrics. Agent: Request authorized. Based on our multi-department database status, our operating revenue run-rate remains robust. I've initiated an audit of global invoices.", formattedText: "<p><strong>User:</strong> AI CEO, generate a strategic synthesis of our sales performance and department metrics.</p><p><strong>Agent (AI CEO):</strong> Request authorized. Based on our multi-department database status, our operating revenue run-rate remains robust. I've initiated an audit of global invoices.</p>", completedAt: "2026-07-15T01:13:00Z" },
  { id: 2, entityType: "call", entityId: 1, fullText: "Customer support inbound check for SKU safety stocks.", formattedText: "<p>Inbound customer support inquiry solved successfully by support expert.</p>", completedAt: "2026-07-15T06:15:00Z" }
];

export const voiceRecordings: VoiceRecording[] = [
  { id: 1, entityType: "session", entityId: 1, fileUrl: "/audio/sessions/session_1.mp3", fileSize: 1048576, duration: 185, format: "mp3", createdAt: "2026-07-15T01:13:05Z" },
  { id: 2, entityType: "call", entityId: 1, fileUrl: "/audio/calls/call_1.wav", fileSize: 4096000, duration: 128, format: "wav", createdAt: "2026-07-15T06:15:10Z" }
];

// Custom high-fidelity voice profiles for the 14 AI employees
export const voiceProfiles: VoiceProfile[] = [
  { id: 1, employeeId: 1, voiceName: "en-US-Journey-F", languageCode: "en-US", gender: "female", pitch: 0.0, speakingRate: 1.02 },
  { id: 2, employeeId: 2, voiceName: "en-US-Neural-B", languageCode: "en-US", gender: "female", pitch: -0.1, speakingRate: 1.05 },
  { id: 3, employeeId: 3, voiceName: "en-GB-Wavenet-A", languageCode: "en-GB", gender: "female", pitch: 0.1, speakingRate: 1.0 },
  { id: 4, employeeId: 4, voiceName: "en-US-Neural-D", languageCode: "en-US", gender: "male", pitch: -0.2, speakingRate: 1.0 },
  { id: 5, employeeId: 5, voiceName: "en-US-Wavenet-C", languageCode: "en-US", gender: "female", pitch: 0.2, speakingRate: 1.0 },
  { id: 6, employeeId: 6, voiceName: "en-AU-Neural-A", languageCode: "en-AU", gender: "female", pitch: 0.0, speakingRate: 0.98 },
  { id: 7, employeeId: 7, voiceName: "en-US-Neural-E", languageCode: "en-US", gender: "male", pitch: -0.1, speakingRate: 1.03 },
  { id: 8, employeeId: 8, voiceName: "en-US-Neural-J", languageCode: "en-US", gender: "male", pitch: -0.3, speakingRate: 0.95 },
  { id: 9, employeeId: 9, voiceName: "en-GB-Neural-B", languageCode: "en-GB", gender: "male", pitch: 0.0, speakingRate: 1.05 },
  { id: 10, employeeId: 10, voiceName: "en-US-Neural-G", languageCode: "en-US", gender: "male", pitch: -0.05, speakingRate: 1.0 },
  { id: 11, employeeId: 11, voiceName: "en-US-Neural-H", languageCode: "en-US", gender: "female", pitch: 0.15, speakingRate: 1.08 },
  { id: 12, employeeId: 12, voiceName: "en-US-Neural-F", languageCode: "en-US", gender: "male", pitch: -0.15, speakingRate: 1.0 },
  { id: 13, employeeId: 13, voiceName: "en-US-Neural-A", languageCode: "en-US", gender: "female", pitch: 0.05, speakingRate: 1.0 },
  { id: 14, employeeId: 14, voiceName: "en-US-Journey-M", languageCode: "en-US", gender: "male", pitch: -0.25, speakingRate: 0.97 }
];

export const voicePreferences: VoicePreference[] = employees.map((emp, index) => ({
  id: index + 1,
  employeeId: emp.id,
  wakeWordEnabled: emp.id <= 3, // Enable wake word for CEO, EA, Sales
  wakeWord: emp.id === 1 ? "Hey Chief" : emp.id === 2 ? "Athena" : "Sophia",
  silenceTimeoutMs: 2500,
  autoRecord: true,
  preferredChannel: emp.id === 1 ? "browser" : emp.id === 3 ? "phone" : "internal"
}));

export const voiceCommands: VoiceCommand[] = [
  { id: 1, commandPattern: "generate (strategic|growth) plan", actionType: "ceo_plan", description: "Formulate Q3 cross-department strategic recommendations", minConfidence: 0.8 },
  { id: 2, commandPattern: "audit (ledger|expenses|invoice)", actionType: "finance_audit", description: "Enforce SOC-2 guidelines and inspect double budget reserves", minConfidence: 0.85 },
  { id: 3, commandPattern: "optimize (discount|quotes)", actionType: "sales_optimize", description: "Calculate optimal Net-15 quote factors for active pipeline leads", minConfidence: 0.75 },
  { id: 4, commandPattern: "summarize (meeting|call|notes)", actionType: "ea_summarize", description: "Extract topics, timeline and action items from voice transcription", minConfidence: 0.8 }
];

export const voiceCalls: VoiceCall[] = [
  { id: 1, callSid: "CA-TWILIO-882190", fromNumber: "+15550199", toNumber: "+1800249675", direction: "inbound", status: "completed", startTime: "2026-07-15T06:13:00Z", endTime: "2026-07-15T06:15:08Z", duration: 128 },
  { id: 2, callSid: "CA-SIP-110294", fromNumber: "sip:agent@exshopi.ai", toNumber: "sip:lead@velocity.com", direction: "outbound", status: "ringing", startTime: "2026-07-15T07:49:00Z", endTime: "", duration: 0 }
];

export const voiceCallParticipants: VoiceCallParticipant[] = [
  { id: 1, callId: 1, name: "Ahsan Haji", role: "user", joinedAt: "2026-07-15T06:13:00Z" },
  { id: 2, callId: 1, name: "Ethan Support Agent", role: "agent", joinedAt: "2026-07-15T06:13:05Z" }
];

export const voiceMeetings: VoiceMeeting[] = [
  { id: 1, meetingTitle: "Weekly Strategic Ingress", provider: "google_meet", meetingUrl: "https://meet.google.com/exshopi-weekly-strategic", status: "completed", startTime: "2026-07-15T02:00:00Z", duration: 1800 },
  { id: 2, meetingTitle: "Daily Standup", provider: "zoom", meetingUrl: "https://zoom.us/j/99821034", status: "live", startTime: "2026-07-15T07:30:00Z", duration: 1200 }
];

export const voiceMeetingParticipants: VoiceMeetingParticipant[] = [
  { id: 1, meetingId: 1, name: "Ahsan Haji", email: "hajiiahsan786@gmail.com", isAiAgent: false, joinedAt: "2026-07-15T02:00:00Z" },
  { id: 2, meetingId: 1, name: "Chief Executive Agent", email: "ceo@exshopi.ai", isAiAgent: true, joinedAt: "2026-07-15T02:00:10Z" },
  { id: 3, meetingId: 1, name: "Fiona Finance Agent", email: "finance@exshopi.ai", isAiAgent: true, joinedAt: "2026-07-15T02:01:00Z" }
];

export const voiceMeetingSummaries: VoiceMeetingSummary[] = [
  {
    id: 1,
    meetingId: 1,
    summaryText: "During the Weekly Strategic Ingress, the Chief Executive Agent summarized the Q3 sales plan, highlighting the target of $12M ARR. Fiona Finance Agent reported stable cash flow projection of $10.4M ARR and discussed budget extensions. Action items were assigned to establishNet-15 premium discounts.",
    generalVibe: "Optimistic & Decisive",
    keyTopics: ["Q3 ARR Targets", "Budget Extension Approval", "Invoice Audit Process", "Net-15 discounts"],
    generatedAt: "2026-07-15T02:32:00Z"
  }
];

export const voiceActionItems: VoiceActionItem[] = [
  { id: 1, meetingId: 1, assigneeName: "Fiona Finance Agent", taskDescription: "Review budget balances and allocate extra $25K reserve to CRM outbound campaigns", priority: "high", dueDate: "2026-07-18", status: "created" },
  { id: 2, meetingId: 1, assigneeName: "Athena Executive Assistant", taskDescription: "Draft follow-up emails and schedule Q3 planning meetings with departments", priority: "medium", dueDate: "2026-07-16", status: "pending" }
];

export const voiceAnalytics: VoiceAnalytics[] = [
  { id: 1, employeeId: 1, wordCount: 412, avgResponseTimeMs: 1450, audioDurationSeconds: 185, silencePercentage: 12.5, sentimentScore: 0.85, timestamp: "2026-07-15T01:13:30Z" },
  { id: 2, employeeId: 2, wordCount: 180, avgResponseTimeMs: 1100, audioDurationSeconds: 42, silencePercentage: 8.0, sentimentScore: 0.9, timestamp: "2026-07-15T07:46:00Z" },
  { id: 3, employeeId: 3, wordCount: 320, avgResponseTimeMs: 1620, audioDurationSeconds: 120, silencePercentage: 15.2, sentimentScore: 0.72, timestamp: "2026-07-15T05:31:30Z" }
];

export const voiceAuditLogs: VoiceAuditLog[] = [
  { id: 1, employeeId: 1, action: "Start Voice Session", details: "Initiated secure browser session with voice profile en-US-Journey-F", channel: "browser", permissionChecked: true, ipAddress: "127.0.0.1", timestamp: "2026-07-15T01:10:00Z" },
  { id: 2, employeeId: 2, action: "Inbound Call Connected", details: "Received inbound SIP trunk route and validated SOC-2 permissions", channel: "sip", permissionChecked: true, ipAddress: "10.0.4.15", timestamp: "2026-07-15T07:45:00Z" }
];

export function logVoiceAudit(employeeId: number, action: string, details: string, channel: string, permissionChecked: boolean = true) {
  const newLog: VoiceAuditLog = {
    id: voiceAuditLogs.length + 1,
    employeeId,
    action,
    details,
    channel,
    permissionChecked,
    ipAddress: "127.0.0.1",
    timestamp: new Date().toISOString()
  };
  voiceAuditLogs.push(newLog);
  return newLog;
}

// ==========================================================
// ENTERPRISE MARKETPLACE & COMMERCE DATABASE COLLECTIONS
// ==========================================================

export const marketplaceProviders: MarketplaceProvider[] = [
  { id: 1, code: "shopify", name: "Shopify", status: "active", supportedFeatures: ["product_sync", "inventory_sync", "price_sync", "order_import", "order_export", "customer_sync", "shipment_sync", "return_sync"] },
  { id: 2, code: "woocommerce", name: "WooCommerce", status: "active", supportedFeatures: ["product_sync", "inventory_sync", "price_sync", "order_import", "order_export", "customer_sync", "shipment_sync", "return_sync"] },
  { id: 3, code: "magento", name: "Magento", status: "active", supportedFeatures: ["product_sync", "inventory_sync", "price_sync", "order_import", "order_export", "customer_sync", "shipment_sync", "return_sync"] },
  { id: 4, code: "bigcommerce", name: "BigCommerce", status: "active", supportedFeatures: ["product_sync", "inventory_sync", "price_sync", "order_import", "order_export", "customer_sync", "shipment_sync", "return_sync"] },
  { id: 5, code: "amazon", name: "Amazon Marketplace", status: "active", supportedFeatures: ["product_sync", "inventory_sync", "price_sync", "order_import", "order_export", "customer_sync", "shipment_sync", "return_sync"] },
  { id: 6, code: "ebay", name: "eBay", status: "active", supportedFeatures: ["product_sync", "inventory_sync", "price_sync", "order_import", "order_export", "customer_sync", "shipment_sync", "return_sync"] },
  { id: 7, code: "walmart", name: "Walmart Marketplace", status: "active", supportedFeatures: ["product_sync", "inventory_sync", "price_sync", "order_import", "order_export", "customer_sync", "shipment_sync", "return_sync"] },
  { id: 8, code: "etsy", name: "Etsy", status: "active", supportedFeatures: ["product_sync", "inventory_sync", "price_sync", "order_import", "order_export", "customer_sync", "shipment_sync", "return_sync"] },
  { id: 9, code: "tiktok_shop", name: "TikTok Shop", status: "active", supportedFeatures: ["product_sync", "inventory_sync", "price_sync", "order_import", "order_export", "customer_sync", "shipment_sync", "return_sync"] },
  { id: 10, code: "meta_commerce", name: "Meta Commerce", status: "active", supportedFeatures: ["product_sync", "inventory_sync", "price_sync", "order_import", "order_export", "customer_sync", "shipment_sync", "return_sync"] },
  { id: 11, code: "google_merchant", name: "Google Merchant Center", status: "active", supportedFeatures: ["product_sync", "inventory_sync", "price_sync"] },
  { id: 12, code: "google_shopping", name: "Google Shopping", status: "active", supportedFeatures: ["product_sync", "inventory_sync", "price_sync", "order_import"] },
  { id: 13, code: "noon", name: "Noon", status: "active", supportedFeatures: ["product_sync", "inventory_sync", "price_sync", "order_import", "order_export", "customer_sync", "shipment_sync", "return_sync"] },
  { id: 14, code: "trendyol", name: "Trendyol", status: "active", supportedFeatures: ["product_sync", "inventory_sync", "price_sync", "order_import", "order_export", "customer_sync", "shipment_sync", "return_sync"] },
  { id: 15, code: "lazada", name: "Lazada", status: "active", supportedFeatures: ["product_sync", "inventory_sync", "price_sync", "order_import", "order_export", "customer_sync", "shipment_sync", "return_sync"] },
  { id: 16, code: "shopee", name: "Shopee", status: "active", supportedFeatures: ["product_sync", "inventory_sync", "price_sync", "order_import", "order_export", "customer_sync", "shipment_sync", "return_sync"] },
  { id: 17, code: "aliexpress", name: "AliExpress", status: "active", supportedFeatures: ["product_sync", "inventory_sync", "price_sync", "order_import", "order_export", "customer_sync", "shipment_sync", "return_sync"] },
  { id: 18, code: "alibaba", name: "Alibaba", status: "active", supportedFeatures: ["product_sync", "inventory_sync", "price_sync", "order_import", "order_export", "customer_sync", "shipment_sync", "return_sync"] },
  { id: 19, code: "opencart", name: "OpenCart", status: "active", supportedFeatures: ["product_sync", "inventory_sync", "price_sync", "order_import", "order_export", "customer_sync", "shipment_sync", "return_sync"] },
  { id: 20, code: "prestashop", name: "PrestaShop", status: "active", supportedFeatures: ["product_sync", "inventory_sync", "price_sync", "order_import", "order_export", "customer_sync", "shipment_sync", "return_sync"] }
];

export const marketplaceAccounts: MarketplaceAccount[] = [
  { id: 1, providerId: 1, name: "Exshopi Global Shopify US", status: "connected", createdAt: "2026-07-15T01:00:00Z", updatedAt: "2026-07-15T01:00:00Z" },
  { id: 2, providerId: 5, name: "Exshopi Amazon Seller Central EU", status: "connected", createdAt: "2026-07-15T02:00:00Z", updatedAt: "2026-07-15T02:00:00Z" }
];

export const marketplaceStores: MarketplaceStore[] = [
  { id: 1, accountId: 1, storeName: "Exshopi USA", storeUrl: "https://exshopi-usa.myshopify.com", regionCode: "US", status: "active", currency: "USD" },
  { id: 2, accountId: 2, storeName: "Exshopi Germany", storeUrl: "https://sellercentral-europe.amazon.com/store/exgermany", regionCode: "DE", status: "active", currency: "EUR" }
];

export const marketplaceCredentials: MarketplaceCredential[] = [
  { id: 1, accountId: 1, credentialKey: "accessToken", credentialValue: "shpat_xxxxxxxxxxxxxxxxxxxxxxxxxx" },
  { id: 2, accountId: 1, credentialKey: "shopDomain", credentialValue: "exshopi-usa.myshopify.com" },
  { id: 3, accountId: 2, credentialKey: "sellerId", credentialValue: "AMZN_SELLER_120934" },
  { id: 4, accountId: 2, credentialKey: "awsAccessKeyId", credentialValue: "AKIAIOSFODNN7EXAMPLE" }
];

export const marketplaceRegions: MarketplaceRegion[] = [
  { id: 1, providerId: 1, regionCode: "US", regionName: "United States (North America)", endpointUrl: "https://exshopi-usa.myshopify.com/admin/api/2026-07" },
  { id: 2, providerId: 5, regionCode: "EU", regionName: "Europe (Seller Central)", endpointUrl: "https://sellingpartnerapi-eu.amazon.com" }
];

export const marketplaceProducts: MarketplaceProduct[] = [
  { id: 1, storeId: 1, externalProductId: "prod_shp_990112", sku: "SKU-402", title: "Enterprise AI Core Node (Autonomous Server)", description: "High-performance hardware node pre-installed with Exshopi Autonomous VM core engine. Built-in security and local neural caching.", status: "published", createdAt: "2026-07-15T01:05:00Z", updatedAt: "2026-07-15T01:05:00Z" },
  { id: 2, storeId: 1, externalProductId: "prod_shp_221094", sku: "SKU-501", title: "Standard Robotic Logistics Rover Module", description: "AMR-compatible smart sensory routing node for automated warehouse balancing operations.", status: "published", createdAt: "2026-07-15T01:10:00Z", updatedAt: "2026-07-15T01:10:00Z" },
  { id: 3, storeId: 2, externalProductId: "prod_amz_772109", sku: "SKU-402", title: "Enterprise AI Core Node (Europe Edition)", description: "EU-compliant secure server node configured with local SOC-2 and GDPR compliance models.", status: "published", createdAt: "2026-07-15T02:05:00Z", updatedAt: "2026-07-15T02:05:00Z" }
];

export const marketplaceCategories: MarketplaceCategory[] = [
  { id: 1, storeId: 1, externalCategoryId: "cat_shp_331", name: "AI Hardware Components" },
  { id: 2, storeId: 1, externalCategoryId: "cat_shp_332", name: "Autonomous Systems", parentCategoryId: "cat_shp_331" }
];

export const marketplaceOrders: MarketplaceOrder[] = [
  { id: 1, storeId: 1, externalOrderId: "ord_shp_882940", orderNumber: "SHPFY-2026-1001", status: "paid", currency: "USD", totalPrice: 4999.00, subtotalPrice: 4999.00, totalTax: 0.00, totalDiscount: 0.00, shippingAddress: "120 Pine Street, Seattle, WA, 98101, USA", createdAt: "2026-07-15T03:00:00Z", updatedAt: "2026-07-15T03:15:00Z" },
  { id: 2, storeId: 2, externalOrderId: "ord_amz_992104", orderNumber: "AMZN-EU-440291", status: "pending", currency: "EUR", totalPrice: 5120.00, subtotalPrice: 5120.00, totalTax: 817.50, totalDiscount: 100.00, shippingAddress: "Heine-Strasse 14, Berlin, 10115, DE", createdAt: "2026-07-15T04:20:00Z", updatedAt: "2026-07-15T04:20:00Z" }
];

export const marketplaceOrderItems: MarketplaceOrderItem[] = [
  { id: 1, orderId: 1, externalItemId: "item_shp_1", sku: "SKU-402", title: "Enterprise AI Core Node (Autonomous Server)", quantity: 1, price: 4999.00, totalDiscount: 0.00 },
  { id: 2, orderId: 2, externalItemId: "item_amz_1", sku: "SKU-402", title: "Enterprise AI Core Node (Europe Edition)", quantity: 1, price: 5220.00, totalDiscount: 100.00 }
];

export const marketplaceCustomers: MarketplaceCustomer[] = [
  { id: 1, storeId: 1, externalCustomerId: "cust_shp_99104", email: "johndoe@targetcompany.com", firstName: "John", lastName: "Doe", phone: "+15550143", createdAt: "2026-07-15T01:02:00Z" },
  { id: 2, storeId: 2, externalCustomerId: "cust_amz_88291", email: "h.muller@velotech.de", firstName: "Hans", lastName: "Müller", phone: "+4930129384", createdAt: "2026-07-15T02:02:00Z" }
];

export const marketplaceInventories: MarketplaceInventory[] = [
  { id: 1, storeId: 1, sku: "SKU-402", quantity: 45, reservedQuantity: 2, locationId: "loc_shp_primary", updatedAt: "2026-07-15T01:05:00Z" },
  { id: 2, storeId: 1, sku: "SKU-501", quantity: 120, reservedQuantity: 5, locationId: "loc_shp_primary", updatedAt: "2026-07-15T01:10:00Z" },
  { id: 3, storeId: 2, sku: "SKU-402", quantity: 22, reservedQuantity: 1, locationId: "loc_amz_eu_west", updatedAt: "2026-07-15T02:05:00Z" }
];

export const marketplacePrices: MarketplacePrice[] = [
  { id: 1, storeId: 1, sku: "SKU-402", price: 4999.00, compareAtPrice: 5499.00, currency: "USD", updatedAt: "2026-07-15T01:05:00Z" },
  { id: 2, storeId: 1, sku: "SKU-501", price: 1850.00, compareAtPrice: 1999.00, currency: "USD", updatedAt: "2026-07-15T01:10:00Z" },
  { id: 3, storeId: 2, sku: "SKU-402", price: 5220.00, compareAtPrice: 5400.00, currency: "EUR", updatedAt: "2026-07-15T02:05:00Z" }
];

export const marketplaceShipments: MarketplaceShipment[] = [
  { id: 1, orderId: 1, externalShipmentId: "shp_shp_440192", trackingNumber: "1Z999AA10123456784", carrier: "UPS", status: "delivered", shippedAt: "2026-07-15T03:30:00Z" }
];

export const marketplaceReturns: MarketplaceReturn[] = [
  { id: 1, orderId: 1, externalReturnId: "ret_shp_220194", status: "refunded", reason: "Customer duplicate ordering under test account", refundAmount: 4999.00, createdAt: "2026-07-15T05:00:00Z" }
];

export const marketplaceSyncJobs: MarketplaceSyncJob[] = [
  { id: 1, storeId: 1, syncType: "order", status: "completed", recordsProcessed: 1, errorMessage: undefined, scheduledAt: "2026-07-15T03:10:00Z", startedAt: "2026-07-15T03:10:02Z", completedAt: "2026-07-15T03:11:00Z" },
  { id: 2, storeId: 2, syncType: "inventory", status: "pending", recordsProcessed: 0, errorMessage: undefined, scheduledAt: "2026-07-15T08:15:00Z" }
];

export const marketplaceWebhooks: MarketplaceWebhook[] = [
  { id: 1, storeId: 1, topic: "order.created", webhookUrl: "https://exshopi-ai.workspace.local/api/v1/marketplaces/webhooks/shopify", externalWebhookId: "wh_shp_882910", status: "active" },
  { id: 2, storeId: 1, topic: "product.updated", webhookUrl: "https://exshopi-ai.workspace.local/api/v1/marketplaces/webhooks/shopify", externalWebhookId: "wh_shp_882911", status: "active" }
];

export const marketplaceEvents: MarketplaceEvent[] = [
  { id: 1, storeId: 1, topic: "order.created", payload: "{\"id\":\"ord_shp_882940\",\"total_price\":\"4999.00\"}", status: "processed", errorMessage: undefined, createdAt: "2026-07-15T03:00:00Z" }
];

export const marketplaceLogs: MarketplaceLog[] = [
  { id: 1, storeId: 1, level: "info", message: "Successfully connected to Shopify API endpoints for Exshopi USA store", details: "Rate limit: 40req/sec, API version: 2026-07", timestamp: "2026-07-15T01:00:10Z" }
];

export const marketplaceAuditLogs: MarketplaceAuditLog[] = [
  { id: 1, employeeId: 1, action: "Connect Marketplace Provider", details: "Chief Executive Agent authorized brand integration for Shopify USA under credential sequence ID #1", permissionChecked: true, timestamp: "2026-07-15T01:00:00Z" }
];

export function logMarketplaceAudit(employeeId: number, action: string, details: string, permissionChecked: boolean = true) {
  const newLog: MarketplaceAuditLog = {
    id: marketplaceAuditLogs.length + 1,
    employeeId,
    action,
    details,
    permissionChecked,
    timestamp: new Date().toISOString()
  };
  marketplaceAuditLogs.push(newLog);
  return newLog;
}

// ==========================================================
// ENTERPRISE PAYMENT INTEGRATION COLLECTIONS & SEED DATA
// ==========================================================

export const paymentProviders: PaymentProvider[] = [
  { id: 1, code: "stripe", name: "Stripe Connect", status: "active", supportedFeatures: ["intent", "auth", "capture", "refund", "subscription", "tokenization"] },
  { id: 2, code: "paypal", name: "PayPal Braintree", status: "active", supportedFeatures: ["intent", "sale", "refund", "subscription"] },
  { id: 3, code: "checkout", name: "Checkout.com Unified", status: "active", supportedFeatures: ["intent", "auth", "capture", "refund", "3ds"] },
  { id: 4, code: "adyen", name: "Adyen Platforms", status: "active", supportedFeatures: ["intent", "auth", "capture", "refund", "settlement"] },
  { id: 5, code: "square", name: "Square Payments", status: "active", supportedFeatures: ["intent", "sale", "refund", "hardware"] },
  { id: 6, code: "razorpay", name: "Razorpay Standard", status: "active", supportedFeatures: ["intent", "sale", "refund", "subscription"] },
  { id: 7, code: "paytabs", name: "PayTabs Regional", status: "active", supportedFeatures: ["intent", "sale", "refund"] },
  { id: 8, code: "telr", name: "Telr Payment Gateway", status: "active", supportedFeatures: ["intent", "sale", "refund"] },
  { id: 9, code: "network_intl", name: "Network International", status: "active", supportedFeatures: ["intent", "auth", "capture", "refund"] },
  { id: 10, code: "amazon_pay_services", name: "Amazon Payment Services", status: "active", supportedFeatures: ["intent", "auth", "capture", "refund"] },
  { id: 11, code: "apple_pay", name: "Apple Pay Tokenized", status: "active", supportedFeatures: ["tokenization", "sale"] },
  { id: 12, code: "google_pay", name: "Google Pay API", status: "active", supportedFeatures: ["tokenization", "sale"] },
  { id: 13, code: "visa", name: "Visa Direct", status: "active", supportedFeatures: ["payout", "settlement"] },
  { id: 14, code: "mastercard", name: "Mastercard Send", status: "active", supportedFeatures: ["payout", "settlement"] },
  { id: 15, code: "amex", name: "American Express Gateway", status: "active", supportedFeatures: ["intent", "auth", "capture"] },
  { id: 16, code: "unionpay", name: "UnionPay SecurePay", status: "active", supportedFeatures: ["intent", "sale"] },
  { id: 17, code: "bank_transfer", name: "SWIFT/SEPA Bank Transfer", status: "active", supportedFeatures: ["reconciliation"] },
  { id: 18, code: "cod", name: "Cash On Delivery", status: "active", supportedFeatures: ["manual_reconciliation"] },
  { id: 19, code: "wallet_payments", name: "Digital Wallets", status: "active", supportedFeatures: ["wallet_transfer"] }
];

export const paymentGateways: PaymentGateway[] = [
  { id: 1, providerId: 1, gatewayName: "Stripe Production Trunk", environment: "production", status: "active" },
  { id: 2, providerId: 2, gatewayName: "PayPal Sandboxed Gateway", environment: "sandbox", status: "active" }
];

export const paymentAccounts: PaymentAccount[] = [
  { id: 1, gatewayId: 1, merchantId: "acct_1029481", accountName: "Exshopi Corp Standard USD", currency: "USD", status: "active" },
  { id: 2, gatewayId: 1, merchantId: "acct_9901124", accountName: "Exshopi Europe EUR", currency: "EUR", status: "active" }
];

export const merchantAccounts: MerchantAccount[] = [
  { id: 1, accountId: 1, corporateName: "Exshopi Inc.", countryCode: "US", settlementBankRouting: "121000248", settlementBankAccount: "******9981" },
  { id: 2, accountId: 2, corporateName: "Exshopi GmbH", countryCode: "DE", settlementBankRouting: "DB99000", settlementBankAccount: "******2104" }
];

export const paymentMethods: PaymentMethod[] = [
  { id: 1, accountId: 1, type: "card", brand: "visa", last4: "4242", expiryMonth: 12, expiryYear: 2028, isDefault: true, status: "active" },
  { id: 2, accountId: 1, type: "wallet", brand: "apple_pay", isDefault: false, status: "active" }
];

export const paymentMethodTokens: PaymentMethodToken[] = [
  { id: 1, paymentMethodId: 1, tokenValue: "tok_1N984A09121", vaultedAt: "2026-07-15T01:00:00Z" }
];

export const paymentIntents: PaymentIntent[] = [
  { id: 1, storeId: 1, orderId: 1, amount: 4999.00, currency: "USD", status: "succeeded", clientSecret: "pi_3N289_secret_0128", paymentMethodId: 1, metadata: "{\"billing_name\":\"John Doe\"}" }
];

export const paymentTransactions: PaymentTransaction[] = [
  { id: 1, intentId: 1, accountId: 1, type: "sale", amount: 4999.00, currency: "USD", status: "success", externalReferenceId: "ch_99210481023", processedAt: "2026-07-15T03:15:00Z" }
];

export const paymentAuthorizations: PaymentAuthorization[] = [
  { id: 1, intentId: 1, amount: 4999.00, currency: "USD", status: "captured", authorizedAt: "2026-07-15T03:10:00Z", expiresAt: "2026-07-22T03:10:00Z", authCode: "AUTH-88291" }
];

export const paymentCaptures: PaymentCapture[] = [
  { id: 1, authorizationId: 1, amount: 4999.00, currency: "USD", status: "succeeded", capturedAt: "2026-07-15T03:15:00Z", transactionId: 1 }
];

export const paymentRefunds: PaymentRefund[] = [
  { id: 1, transactionId: 1, amount: 1000.00, currency: "USD", reason: "Goodwill partial refund", status: "succeeded", refundedAt: "2026-07-15T06:00:00Z" }
];

export const partialRefunds: PartialRefund[] = [
  { id: 1, refundId: 1, lineItemId: 1, amount: 1000.00, status: "succeeded" }
];

export const paymentDisputes: PaymentDispute[] = [
  { id: 1, transactionId: 1, externalDisputeId: "dp_2209148", reason: "unrecognized_charge", amount: 4999.00, currency: "USD", status: "under_review", evidenceSubmitted: "{\"invoice_matched\": true}", createdAt: "2026-07-15T07:00:00Z" }
];

export const chargebacks: Chargeback[] = [
  { id: 1, disputeId: 1, feeAmount: 15.00, totalDebitedAmount: 5014.00, debitedAt: "2026-07-15T07:15:00Z" }
];

export const settlementBatches: SettlementBatch[] = [
  { id: 1, accountId: 1, batchReference: "SETTLE_20260715_B1", totalGrossAmount: 4999.00, totalFeeAmount: 145.00, totalNetAmount: 4854.00, status: "closed", closedAt: "2026-07-15T08:00:00Z" }
];

export const paymentSettlements: PaymentSettlement[] = [
  { id: 1, batchId: 1, transactionId: 1, grossAmount: 4999.00, feeAmount: 145.00, netAmount: 4854.00, status: "settled", settledAt: "2026-07-15T08:00:00Z" }
];

export const paymentWebhooks: PaymentWebhook[] = [
  { id: 1, providerCode: "stripe", webhookUrl: "https://exshopi-ai.workspace.local/api/v1/payments/webhooks/stripe", secret: "whsec_xxxxxxxxxxxxx", status: "active" }
];

export const paymentEvents: PaymentEvent[] = [
  { id: 1, webhookId: 1, eventType: "payment_intent.succeeded", payload: "{\"id\":\"pi_3N289\",\"amount\":499900}", status: "processed", createdAt: "2026-07-15T03:15:00Z" }
];

export const paymentInvoices: PaymentInvoice[] = [
  { id: 1, orderId: 1, invoiceNumber: "INV-2026-9001", totalAmount: 4999.00, currency: "USD", status: "paid", dueDate: "2026-07-30", createdAt: "2026-07-15T03:00:00Z" }
];

export const paymentReceipts: PaymentReceipt[] = [
  { id: 1, transactionId: 1, receiptNumber: "REC-2026-0012", issuedAt: "2026-07-15T03:15:10Z", details: "Payment completed for Enterprise AI Core Node" }
];

export const paymentAuditLogs: PaymentAuditLog[] = [
  { id: 1, employeeId: 1, action: "Authorize Core Node Purchase", details: "Approved stripe payment intent setup for $4999.00 USD", timestamp: "2026-07-15T03:10:00Z" }
];

export function logPaymentAudit(employeeId: number, action: string, details: string) {
  const newLog: PaymentAuditLog = {
    id: paymentAuditLogs.length + 1,
    employeeId,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  paymentAuditLogs.push(newLog);
  return newLog;
}


// ==========================================================
// ENTERPRISE LOGISTICS & SUPPLY CHAIN COLLECTIONS & SEED DATA
// ==========================================================

export const logisticsProviders: LogisticsProvider[] = [
  { id: 1, code: "dhl", name: "DHL Express World Wide", status: "active" },
  { id: 2, code: "fedex", name: "FedEx Express", status: "active" },
  { id: 3, code: "ups", name: "UPS Logistics", status: "active" }
];

export const carriers: Carrier[] = [
  { id: 1, providerId: 1, name: "DHL Express", trackingTemplateUrl: "https://www.dhl.com/en/express/tracking.html?AWB={{trackingNumber}}", status: "active" },
  { id: 2, providerId: 2, name: "FedEx Ground", trackingTemplateUrl: "https://www.fedex.com/fedextrack/?tracknumbers={{trackingNumber}}", status: "active" }
];

export const carrierServices: CarrierService[] = [
  { id: 1, carrierId: 1, serviceName: "DHL Worldwide Express", transitTimeDays: 2, baseCost: 45.00 },
  { id: 2, carrierId: 2, serviceName: "FedEx Standard Ground", transitTimeDays: 5, baseCost: 15.00 }
];

export const warehouseZones: WarehouseZone[] = [
  { id: 1, warehouseId: 1, zoneName: "High Security Storage Rack A", zoneCode: "SEC-A" },
  { id: 2, warehouseId: 1, zoneName: "Robotic Fulfillment Aisle 2", zoneCode: "ROBO-2" }
];

export const warehouseBins: WarehouseBin[] = [
  { id: 1, zoneId: 1, binCode: "BIN-A1-04", maxCapacity: 50 },
  { id: 2, zoneId: 2, binCode: "BIN-R2-90", maxCapacity: 120 }
];

export const fulfillmentCenters: FulfillmentCenter[] = [
  { id: 1, name: "Seattle Robotic Hub #4", locationAddress: "400 Terminal Way, Seattle, WA", capacitySqFt: 250000, status: "active" },
  { id: 2, name: "Frankfurt Euro-Central Hub", locationAddress: "CargoCity South Building 4, Frankfurt, DE", capacitySqFt: 300000, status: "active" }
];

export const shipments: Shipment[] = [
  { id: 1, orderId: 1, warehouseId: 1, carrierServiceId: 1, trackingNumber: "DHL99281048", shipmentNumber: "SHP-2026-8001", status: "delivered", originAddress: "400 Terminal Way, Seattle, WA", destinationAddress: "120 Pine Street, Seattle, WA, 98101, USA", estimatedDeliveryDate: "2026-07-17", shippedAt: "2026-07-15T03:30:00Z", deliveredAt: "2026-07-15T10:00:00Z" }
];

export const shipmentPackages: ShipmentPackage[] = [
  { id: 1, shipmentId: 1, weightLbs: 22.4, lengthInches: 18, widthInches: 14, heightInches: 12, packageType: "medium_box" }
];

export const shipmentItems: ShipmentItem[] = [
  { id: 1, shipmentId: 1, sku: "SKU-402", quantity: 1, weightLbs: 22.4 }
];

export const shipmentLabels: ShipmentLabel[] = [
  { id: 1, shipmentId: 1, labelFormat: "pdf", base64Data: "JVBERi0xLjQKJ...[MOCK BASE64 LABEL DATA]...", createdAt: "2026-07-15T03:20:00Z" }
];

export const shipmentTrackings: ShipmentTracking[] = [
  { id: 1, shipmentId: 1, location: "Seattle Hub #4", status: "packed", description: "Shipment packaged securely and labeled.", timestamp: "2026-07-15T03:20:00Z" },
  { id: 2, shipmentId: 1, location: "Seattle Sorting Facility", status: "in_transit", description: "Package arrived at carrier sort facility", timestamp: "2026-07-15T05:00:00Z" },
  { id: 3, shipmentId: 1, location: "120 Pine Street, Seattle, WA", status: "delivered", description: "Delivered. Signature: John Doe.", timestamp: "2026-07-15T10:00:00Z" }
];

export const fleets: Fleet[] = [
  { id: 1, fleetName: "Pacific Northwest Local Fleet", region: "WA-OR", status: "active" }
];

export const vehicles: Vehicle[] = [
  { id: 1, fleetId: 1, makeModel: "Mercedes Sprinter EV Cargo", licensePlate: "EXSH-EV01", weightCapacityLbs: 3500, volumeCapacityCuFt: 400, status: "available" }
];

export const drivers: Driver[] = [
  { id: 1, name: "Marcus Fletcher", licenseNumber: "DL-WA-99210", phoneNumber: "+15550219", status: "available" }
];

export const driverAssignments: DriverAssignment[] = [
  { id: 1, vehicleId: 1, driverId: 1, assignedAt: "2026-07-15T02:00:00Z" }
];

export const deliveryRoutes: DeliveryRoute[] = [
  { id: 1, fleetId: 1, routeName: "Seattle Downtown morning express", status: "completed", plannedDistanceMiles: 18.5, actualDistanceMiles: 19.2, estimatedDurationMinutes: 120, actualDurationMinutes: 132 }
];

export const deliveryStops: DeliveryStop[] = [
  { id: 1, routeId: 1, shipmentId: 1, stopSequence: 1, status: "completed", estimatedArrival: "2026-07-15T09:30:00Z", actualArrival: "2026-07-15T10:00:00Z" }
];

export const dispatchOrders: DispatchOrder[] = [
  { id: 1, routeId: 1, dispatchedAt: "2026-07-15T08:00:00Z", status: "completed" }
];

export const routeOptimizationJobs: RouteOptimizationJob[] = [
  { id: 1, fleetId: 1, status: "completed", stopCount: 15, optimizedRouteDetails: "{\"total_saving_miles\": 4.2}", completedAt: "2026-07-15T07:45:00Z" }
];

export const pickupRequests: PickupRequest[] = [
  { id: 1, warehouseId: 1, carrierId: 1, pickupTime: "2026-07-15T15:00:00Z", status: "completed" }
];

export const deliveryConfirmations: DeliveryConfirmation[] = [
  { id: 1, shipmentId: 1, confirmedBy: "John Doe", signatureBase64: "iVBORw0KGgoAAAANSUhEUg...", confirmedAt: "2026-07-15T10:00:00Z" }
];

export const proofOfDeliveries: ProofOfDelivery[] = [
  { id: 1, confirmationId: 1, notes: "Left on front desk with signature validation." }
];

export const returnShipments: ReturnShipment[] = [
  { id: 1, originalShipmentId: 1, returnReason: "Upgraded to Rack Edition", status: "restocked", createdAt: "2026-07-15T12:00:00Z" }
];

export const reverseLogistics: ReverseLogistics[] = [
  { id: 1, returnShipmentId: 1, disposition: "restock", inspectedBy: "Inventory Agent Bob", inspectionDetails: "Unopened original seal. Flawless state.", resolvedAt: "2026-07-15T13:00:00Z" }
];

export const customsDeclarations: CustomsDeclaration[] = [
  { id: 1, shipmentId: 1, declarationNumber: "CUST-99210-USA", customsValue: 4999.00, tariffCode: "8471.50.01", status: "cleared" }
];

export const freightOrders: FreightOrder[] = [
  { id: 1, freightNumber: "FRT-CN-US-009", shipper: "Maersk Line", vesselFlight: "Maersk McKinney Moller", containerId: "MRSK-9901423", status: "discharged" }
];

export const freightCosts: FreightCost[] = [
  { id: 1, freightOrderId: 1, costCategory: "ocean_freight", amount: 1500.00, currency: "USD" }
];

export const transportationOrders: TransportationOrder[] = [
  { id: 1, shipmentId: 1, transportType: "road", estimatedCost: 12.50, actualCost: 12.50 }
];

export const supplyChainNodes: SupplyChainNode[] = [
  { id: 1, name: "Seattle Robotic Factory", type: "factory", latitude: 47.6062, longitude: -122.3321 },
  { id: 2, name: "Seattle Robotic Hub #4", type: "warehouse", latitude: 47.5900, longitude: -122.3200 }
];

export const supplyChainRoutes: SupplyChainRoute[] = [
  { id: 1, originNodeId: 1, destinationNodeId: 2, distanceMiles: 1.8, averageTransitHours: 0.15 }
];

export const inventoryTransits: InventoryTransit[] = [
  { id: 1, originWarehouseId: 1, destinationWarehouseId: 2, sku: "SKU-402", quantity: 15, status: "received", shippedAt: "2026-07-15T01:00:00Z", receivedAt: "2026-07-15T02:30:00Z" }
];

export const shipmentExceptions: ShipmentException[] = [
  { id: 1, shipmentId: 1, exceptionCode: "ROUTING_HOLD", resolved: true, notes: "Address corrected from suite B to ground floor.", createdAt: "2026-07-15T04:15:00Z" }
];

export const logisticsWebhooks: LogisticsWebhook[] = [
  { id: 1, carrierId: 1, webhookUrl: "https://exshopi-ai.workspace.local/api/v1/logistics/webhooks/dhl", status: "active" }
];

export const logisticsAuditLogs: LogisticsAuditLog[] = [
  { id: 1, employeeId: 1, action: "Dispatch Shipment", details: "Dispatched shipment SHP-2026-8001 via DHL Express Service ID 1", timestamp: "2026-07-15T03:30:00Z" }
];

export function logLogisticsAudit(employeeId: number, action: string, details: string) {
  const newLog: LogisticsAuditLog = {
    id: logisticsAuditLogs.length + 1,
    employeeId,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  logisticsAuditLogs.push(newLog);
  return newLog;
}


// ==========================================================
// ENTERPRISE ADVANCED REPORTING COLLECTIONS & SEED DATA
// ==========================================================

export const reportCategories: ReportCategory[] = [
  { id: 1, name: "Financial Audits", code: "financial" },
  { id: 2, name: "Sales & Marketplace Trends", code: "sales" },
  { id: 3, name: "Logistics Operations", code: "logistics" },
  { id: 4, name: "AI Workforce Performance", code: "workforce" }
];

export const reportFolders: ReportFolder[] = [
  { id: 1, name: "Corporate Exec Summaries" },
  { id: 2, name: "Operational Logistics" }
];

export const advancedReports: Report[] = [
  { id: 1, categoryId: 1, folderId: 1, title: "Executive Revenue and Invoicing Audit", description: "Comprehensive audit showing order volumes, payment settlements, and cash balance reconciliations.", type: "financial", layoutJson: "{\"grid\": \"bento\"}", isCustom: false, createdAt: "2026-07-15T01:00:00Z", updatedAt: "2026-07-15T01:00:00Z" },
  { id: 2, categoryId: 3, folderId: 2, title: "Shipment Transit Efficiency & Exception Report", description: "Details carrier transit times, delivered rates, and outstanding delivery exception statuses.", type: "logistics", layoutJson: "{\"grid\": \"split\"}", isCustom: false, createdAt: "2026-07-15T01:05:00Z", updatedAt: "2026-07-15T01:05:00Z" }
];

export const reportTemplates: ReportTemplate[] = [
  { id: 1, name: "Standard Bento Layout", description: "A compact grids layout perfect for executive summaries.", layoutJson: "{\"type\":\"bento\",\"columns\":3}" }
];

export const reportSections: ReportSection[] = [
  { id: 1, reportId: 1, title: "Consolidated Revenue Breakdown", sortOrder: 1 },
  { id: 2, reportId: 1, title: "Outstanding Accounts & Disputes", sortOrder: 2 }
];

export const reportWidgets: ReportWidget[] = [
  { id: 1, sectionId: 1, type: "kpi", title: "Total Monthly Revenue", configJson: "{\"metric\":\"sum\",\"field\":\"totalPrice\",\"suffix\":\"USD\"}", sortOrder: 1 },
  { id: 2, sectionId: 1, type: "chart", title: "Daily Sales by Marketplace Store", configJson: "{\"chartType\":\"bar\",\"xAxis\":\"date\",\"yAxis\":\"sales\"}", sortOrder: 2 }
];

export const reportParameters: ReportParameter[] = [
  { id: 1, reportId: 1, name: "startDate", dataType: "date", defaultValue: "2026-07-01" },
  { id: 2, reportId: 1, name: "endDate", dataType: "date", defaultValue: "2026-07-31" }
];

export const reportFilters: ReportFilter[] = [
  { id: 1, reportId: 1, fieldName: "status", operator: "equals", filterValue: "paid" }
];

export const reportQueries: ReportQuery[] = [
  { id: 1, reportId: 1, sqlStatement: "SELECT SUM(total_price) FROM marketplace_orders WHERE status = 'paid';", timeoutSeconds: 30 }
];

export const reportSchedules: ReportSchedule[] = [
  { id: 1, reportId: 1, frequency: "daily", nextRunAt: "2026-07-16T00:00:00Z", status: "active" }
];

export const reportExecutions: ReportExecution[] = [
  { id: 1, reportId: 1, triggeredBy: "schedule_1", status: "completed", durationMs: 450, executedAt: "2026-07-15T00:00:15Z" }
];

export const reportHistories: ReportHistory[] = [
  { id: 1, reportId: 1, filePath: "/var/reports/rep_1_20260715.pdf", format: "pdf", generatedAt: "2026-07-15T00:00:15Z" }
];

export const reportSnapshots: ReportSnapshot[] = [
  { id: 1, reportId: 1, dataSnapshotJson: "{\"totalRevenue\": 4999.00, \"activeDisputes\": 1}", snapshotAt: "2026-07-15T00:00:15Z" }
];

export const reportSubscriptions: ReportSubscription[] = [
  { id: 1, reportId: 1, subscriberEmail: "hajiiahsan786@gmail.com", format: "pdf" }
];

export const reportRecipients: ReportRecipient[] = [
  { id: 1, subscriptionId: 1, recipientName: "Ahsan Haji", recipientEmail: "hajiiahsan786@gmail.com" }
];

export const reportExports: ReportExport[] = [
  { id: 1, executionId: 1, exportFormat: "pdf", fileSize: 104523, downloadUrl: "/api/v1/reports/exports/download/1" }
];

export const reportAttachments: ReportAttachment[] = [
  { id: 1, exportId: 1, fileName: "revenue_audit_20260715.pdf" }
];

export const reportBookmarks: ReportBookmark[] = [
  { id: 1, reportId: 1, userId: 1, bookmarkName: "Target USA View", paramsJson: "{\"startDate\":\"2026-07-01\"}" }
];

export const reportFavorites: ReportFavorite[] = [
  { id: 1, reportId: 1, userId: 1 }
];

export const dashboardReports: DashboardReport[] = [
  { id: 1, reportId: 1, positionX: 0, positionY: 0, width: 6, height: 4 }
];

export const reportPermissions: ReportPermission[] = [
  { id: 1, reportId: 1, roleName: "AI CEO", canRead: true, canEdit: true, canExport: true, canShare: true },
  { id: 2, reportId: 1, roleName: "AI Sales Manager", canRead: true, canEdit: false, canExport: true, canShare: false }
];

export const reportAuditLogs: ReportAuditLog[] = [
  { id: 1, employeeId: 1, action: "Generate Report", details: "Generated Executive Revenue and Invoicing Audit report snapshot", timestamp: "2026-07-15T03:00:00Z" }
];

export function logReportAudit(employeeId: number, action: string, details: string) {
  const newLog: ReportAuditLog = {
    id: reportAuditLogs.length + 1,
    employeeId,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  reportAuditLogs.push(newLog);
  return newLog;
}


// ==========================================================
// ENTERPRISE SECURITY HARDENING COLLECTIONS & SEED DATA
// ==========================================================

export const securityPolicies: SecurityPolicy[] = [
  { id: 1, policyName: "SOC-2 Global Identity Policy", description: "Enforces multi-factor TOTP requirements, session expirations, and strict API access logging.", status: "enabled" },
  { id: 2, policyName: "IP Geofence Restriction Rule", description: "Secures administrative routes within certified corporate ranges.", status: "enabled" }
];

export const securityRules: SecurityRule[] = [
  { id: 1, policyId: 1, ruleName: "Session Inactivity Timeout", ruleType: "concurrent_session_limit", ruleValue: "5", status: "enabled" },
  { id: 2, policyId: 2, ruleName: "Local Ingress Firewall Block", ruleType: "ip_block", ruleValue: "192.168.100.22", status: "enabled" }
];

export const securityEvents: SecurityEvent[] = [
  { id: 1, eventType: "MFA_ENABLED", severity: "low", ipAddress: "127.0.0.1", details: "MFA TOTP successfully initialized for user #1", timestamp: "2026-07-15T01:00:00Z" }
];

export const securityAlerts: SecurityAlert[] = [
  { id: 1, eventId: 1, message: "MFA successfully registered for tenant administrator.", status: "unread", timestamp: "2026-07-15T01:00:10Z" }
];

export const securityIncidents: SecurityIncident[] = [
  { id: 1, title: "Brute Force Threshold Trigger on API Ingress", status: "mitigated", severity: "medium", assignedToEmployeeId: 1, timelineJson: "[]", createdAt: "2026-07-15T05:00:00Z" }
];

export const securityAudits: SecurityAudit[] = [
  { id: 1, employeeId: 1, action: "Rotate Encryption Master Keys", ipAddress: "127.0.0.1", details: "Rotated master encryption reference key for payment table data.", timestamp: "2026-07-15T02:00:00Z" }
];

export const securitySessions: SecuritySession[] = [
  { id: 1, userId: 1, sessionToken: "sess_9910412849", deviceFingerprint: "chrome_win_11_seattle", ipAddress: "127.0.0.1", expiresAt: "2026-07-15T18:14:30Z", mfaVerified: true, status: "active" }
];

export const trustedDevices: TrustedDevice[] = [
  { id: 1, userId: 1, deviceFingerprint: "chrome_win_11_seattle", deviceName: "CEO Primary Desktop Workstation", verifiedAt: "2026-07-15T01:00:00Z" }
];

export const loginHistories: LoginHistory[] = [
  { id: 1, userId: 1, status: "success", ipAddress: "127.0.0.1", deviceFingerprint: "chrome_win_11_seattle", timestamp: "2026-07-15T01:00:00Z" }
];

export const riskAssessments: RiskAssessment[] = [
  { id: 1, assessedAt: "2026-07-15T08:00:00Z", overallRiskScore: 12, detailsJson: "{\"ipGeofence\": \"passed\", \"mfaEnforceRatio\": 1.0, \"activeThreats\": 0}" }
];

export const threatDetections: ThreatDetection[] = [
  { id: 1, threatType: "brute_force", status: "blocked", ipAddress: "192.168.100.22", riskScore: 88, detectedAt: "2026-07-15T04:55:00Z" }
];

export const apiKeys: APIKey[] = [
  { id: 1, keyName: "Global ERP Analytics Ingestion Key", apiKeyHash: "sha256_xxxxxxxxxxxxxxxxxxxxxxxxxx", scopeJson: "[\"payments.create\", \"logistics.read\", \"reports.read\"]", status: "active", expiresAt: "2027-07-15T00:00:00Z" }
];

export const apiKeyScopes: APIKeyScope[] = [
  { id: 1, apiKeyId: 1, scope: "payments.create" },
  { id: 2, apiKeyId: 1, scope: "logistics.read" },
  { id: 3, apiKeyId: 1, scope: "reports.read" }
];

export const secretReferences: SecretReference[] = [
  { id: 1, secretKey: "STRIPE_SECRET_KEY", secretHash: "sha256_stripe_vault_encrypted_ref", updatedAt: "2026-07-15T01:00:00Z" }
];

export const encryptionKeyReferences: EncryptionKeyReference[] = [
  { id: 1, keyAlias: "pci_card_data_key", algorithm: "AES-256-GCM", rotatedAt: "2026-07-15T02:00:00Z" }
];

export const complianceReports: ComplianceReport[] = [
  { id: 1, framework: "PCI-DSS", score: 100, status: "compliant", generatedAt: "2026-07-15T07:30:00Z" },
  { id: 2, framework: "SOC2", score: 98, status: "compliant", generatedAt: "2026-07-15T07:45:00Z" }
];

export const complianceControls: ComplianceControl[] = [
  { id: 1, framework: "PCI-DSS", controlCode: "PCI-REQ-3.4", title: "Render PAN unreadable anywhere it is stored using strong cryptography.", status: "passed" },
  { id: 2, framework: "SOC2", controlCode: "SOC2-CC-6.1", title: "The entity authorizes, modifies, or terminates logical access to system components.", status: "passed" }
];

export const complianceAudits: ComplianceAudit[] = [
  { id: 1, complianceReportId: 1, inspectedBy: "External QSA Lead Auditor", findings: "All customer transaction payloads are correctly tokenized. Master encryption keys securely stored inside state reference manager.", auditedAt: "2026-07-15T07:30:00Z" }
];


