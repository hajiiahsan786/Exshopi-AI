import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

export const supportRouter = Router();

// Secure AI Client initialization
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// In-Memory Database Collections for Support
export let tickets = [
  {
    id: 1,
    title: "Billing Discrepancy on Q2 Enterprise License Invoice #1221",
    description: "Our accounting team noted we were double-billed for the Lucas AI Inventory Coordinator seats. We only ran 1 active agent but were billed for 2.",
    customerName: "Sarah Jenkins",
    customerEmail: "sjenkins@apextech.com",
    status: "open", // open, pending, resolved, escalated
    priority: "high", // low, medium, high, critical
    assignedTo: "Ethan AI (Support Expert)",
    category: "billing", // billing, technical, product_inquiry
    sentiment: "negative",
    satisfaction: null,
    createdAt: "2026-07-14T08:30:00Z",
    updatedAt: "2026-07-15T09:12:00Z",
    slaDeadline: "2026-07-15T16:30:00Z"
  },
  {
    id: 2,
    title: "Docker Provisioning Fail on Outbound Agent Node 4",
    description: "The custom fine-tuning pipeline crashed with error 'No space left on device' when running the Outbound Agent training scripts. Please expand our container disk quota.",
    customerName: "Michael Chang",
    customerEmail: "mchang@datacore.io",
    status: "in_progress",
    priority: "critical",
    assignedTo: "Lucas AI (Logistic Bot)",
    category: "technical",
    sentiment: "neutral",
    satisfaction: null,
    createdAt: "2026-07-15T04:15:00Z",
    updatedAt: "2026-07-15T09:20:00Z",
    slaDeadline: "2026-07-15T10:15:00Z"
  },
  {
    id: 3,
    title: "Inquiry Regarding API Rate Limits for Workforce Sync",
    description: "We are building an internal HR sync workflow using the /api/v1/workforce endpoints. What are the rate limits for the concurrent workforce queries?",
    customerName: "Devin Vance",
    customerEmail: "devin@saascorp.org",
    status: "resolved",
    priority: "low",
    assignedTo: "Sophia AI (Sales Pro)",
    category: "product_inquiry",
    sentiment: "positive",
    satisfaction: 5,
    createdAt: "2026-07-13T10:00:00Z",
    updatedAt: "2026-07-14T11:45:00Z",
    slaDeadline: "2026-07-16T10:00:00Z"
  }
];

export let messages = [
  {
    id: 1,
    ticketId: 1,
    sender: "customer",
    senderName: "Sarah Jenkins",
    message: "Hi support, we were billed twice for Lucas AI seat allocation. Kindly check invoice #1221.",
    timestamp: "2026-07-14T08:30:00Z",
    isInternalNote: false
  },
  {
    id: 2,
    ticketId: 1,
    sender: "ai",
    senderName: "Ethan AI (Support Expert)",
    message: "Hello Sarah, I am analyzing your seat allocations. I can see Invoice #1221 indicates 2 seats. Let me review the provisioning records to verify actual active hours.",
    timestamp: "2026-07-14T08:35:00Z",
    isInternalNote: false
  },
  {
    id: 3,
    ticketId: 1,
    sender: "agent",
    senderName: "Fiona Finance Agent",
    message: "Reviewed the logs. Lucas AI was provisioned on June 10 but was terminated on June 12 due to idling, then re-provisioned June 20. The billing system counted it as two separate active licenses because of UUID changes.",
    timestamp: "2026-07-15T09:00:00Z",
    isInternalNote: true
  }
];

export let kbArticles = [
  {
    id: 1,
    title: "Understanding AI Agent Seat Licensing & Billing",
    category: "Billing & Subscriptions",
    content: "Exshopi AI bills on an active-usage model. Seats are calculated based on hours spent in 'active' and 'busy' states during the billing cycle. If an agent is terminated and re-provisioned, the UUID changes, but the system merges the billable hours if both sessions belong to the same organizational department.",
    tags: ["billing", "licenses", "seats"],
    views: 124,
    helpfulVotes: 18,
    unhelpfulVotes: 1,
    updatedAt: "2026-06-20T10:00:00Z"
  },
  {
    id: 2,
    title: "Resolving Container Disk Quota Errors",
    category: "Technical Support",
    content: "When running Docker agent fine-tuning, the workspace requires at least 40GB of ephemeral storage. If you hit 'No space left on device', go to your Cluster Settings panel and click 'Expand Ephemeral Quota'. This will automatically re-allocate disk space from your department's shared storage pool.",
    tags: ["docker", "technical", "disk"],
    views: 89,
    helpfulVotes: 12,
    unhelpfulVotes: 0,
    updatedAt: "2026-07-10T12:00:00Z"
  },
  {
    id: 3,
    title: "Concurrence Limits on Workforce API Querying",
    category: "Developer Documentation",
    content: "The Exshopi Enterprise Workforce API enforces a rate limit of 100 requests per minute per organization domain. For background sync loops, we recommend batching operations via our bulk endpoints or using Webhooks for real-time employee state updates.",
    tags: ["api", "workforce", "developer"],
    views: 45,
    helpfulVotes: 7,
    unhelpfulVotes: 0,
    updatedAt: "2026-07-12T14:30:00Z"
  }
];

export let liveChats = [
  {
    id: 1,
    customerName: "Alex Rivera",
    customerEmail: "arivera@designhub.co",
    status: "active",
    typingIndicator: false,
    messages: [
      { sender: "customer", text: "Hello! Quick question on custom prompt sizes.", timestamp: "2026-07-15T09:25:00Z" },
      { sender: "ai", text: "Hi Alex! Exshopi AI support here. Our current prompt token limit per message is 32k for general outbound agents, and 1M for full-context document analysis. What are you building today?", timestamp: "2026-07-15T09:26:00Z" },
      { sender: "customer", text: "Perfect, we need to ingest some long CSV logs. That helps a lot!", timestamp: "2026-07-15T09:28:00Z" }
    ]
  },
  {
    id: 2,
    customerName: "Jane Doe",
    customerEmail: "jane@retailgiant.com",
    status: "active",
    typingIndicator: true,
    messages: [
      { sender: "customer", text: "Is there a webhook for order delivery tracking sync?", timestamp: "2026-07-15T09:30:00Z" }
    ]
  }
];

// 1. Support Dashboard Metrics
supportRouter.get("/dashboard", (req: Request, res: Response) => {
  const openCount = tickets.filter(t => t.status === "open").length;
  const pendingCount = tickets.filter(t => t.status === "pending" || t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved").length;
  const escalatedCount = tickets.filter(t => t.status === "escalated").length;
  const total = tickets.length;

  // Calculate SLA status
  const now = new Date();
  const slaPassedCount = tickets.filter(t => t.status !== "resolved" && new Date(t.slaDeadline) < now).length;

  // Average response / resolution times (simulated)
  const avgResponseMin = 4.2;
  const avgResolutionHrs = 2.8;

  // CSAT Score Calculation
  const ratedTickets = tickets.filter(t => t.satisfaction !== null);
  const avgCsat = ratedTickets.length > 0 
    ? parseFloat((ratedTickets.reduce((sum, t) => sum + (t.satisfaction || 0), 0) / ratedTickets.length).toFixed(1))
    : 4.8;

  // Agent Workload
  const agentWorkload = [
    { name: "Ethan AI", activeTickets: tickets.filter(t => t.assignedTo.includes("Ethan AI") && t.status !== "resolved").length },
    { name: "Lucas AI", activeTickets: tickets.filter(t => t.assignedTo.includes("Lucas AI") && t.status !== "resolved").length },
    { name: "Sophia AI", activeTickets: tickets.filter(t => t.assignedTo.includes("Sophia AI") && t.status !== "resolved").length }
  ];

  res.json({
    success: true,
    data: {
      openTickets: openCount,
      pendingTickets: pendingCount,
      resolvedToday: resolvedCount,
      escalatedTickets: escalatedCount,
      totalTickets: total,
      avgResponseTime: `${avgResponseMin} mins`,
      avgResolutionTime: `${avgResolutionHrs} hrs`,
      slaStatus: slaPassedCount > 0 ? `${slaPassedCount} Breached` : "100% Compliant",
      csat: avgCsat,
      agentWorkload,
      aiSummary: "Autonomous Support Center operational. Ethan AI successfully processed 82% of incoming level-1 inquiries. No high priority escalations detected in the last 4 hours."
    }
  });
});

// 2. Ticket Actions
supportRouter.get("/tickets", (req: Request, res: Response) => {
  const { status, priority, search } = req.query;
  let filtered = [...tickets];

  if (status && status !== "all") {
    filtered = filtered.filter(t => t.status === status);
  }
  if (priority && priority !== "all") {
    filtered = filtered.filter(t => t.priority === priority);
  }
  if (search) {
    const s = (search as string).toLowerCase();
    filtered = filtered.filter(t => 
      t.title.toLowerCase().includes(s) || 
      t.customerName.toLowerCase().includes(s) || 
      t.customerEmail.toLowerCase().includes(s) || 
      t.description.toLowerCase().includes(s)
    );
  }

  res.json({ success: true, data: filtered });
});

supportRouter.post("/tickets", (req: Request, res: Response) => {
  const { title, description, customerName, customerEmail, priority, category } = req.body;
  const newId = tickets.length + 1;
  const now = new Date();
  const deadline = new Date(now.getTime() + (priority === "critical" ? 2 * 3600 * 1000 : priority === "high" ? 8 * 3600 * 1000 : 24 * 3600 * 1000));

  const newTicket = {
    id: newId,
    title,
    description,
    customerName,
    customerEmail,
    status: "open",
    priority: priority || "medium",
    assignedTo: "Ethan AI (Support Expert)",
    category: category || "general",
    sentiment: "neutral",
    satisfaction: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    slaDeadline: deadline.toISOString()
  };

  tickets.push(newTicket);

  // Insert seed initial message
  messages.push({
    id: messages.length + 1,
    ticketId: newId,
    sender: "customer",
    senderName: customerName,
    message: description,
    timestamp: now.toISOString(),
    isInternalNote: false
  });

  res.status(201).json({ success: true, data: newTicket });
});

supportRouter.get("/tickets/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });
  res.json({ success: true, data: ticket });
});

supportRouter.put("/tickets/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const ticketIdx = tickets.findIndex(t => t.id === id);
  if (ticketIdx === -1) return res.status(404).json({ success: false, message: "Ticket not found" });

  tickets[ticketIdx] = {
    ...tickets[ticketIdx],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  res.json({ success: true, data: tickets[ticketIdx] });
});

// Messages and Internal Notes
supportRouter.get("/tickets/:id/messages", (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id);
  const ticketMsgs = messages.filter(m => m.ticketId === ticketId);
  res.json({ success: true, data: ticketMsgs });
});

supportRouter.post("/tickets/:id/messages", (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id);
  const { sender, senderName, message, isInternalNote } = req.body;

  const newMsg = {
    id: messages.length + 1,
    ticketId,
    sender: sender || "agent",
    senderName: senderName || "System Operator",
    message,
    timestamp: new Date().toISOString(),
    isInternalNote: !!isInternalNote
  };

  messages.push(newMsg);

  // update ticket update time
  const ticket = tickets.find(t => t.id === ticketId);
  if (ticket) ticket.updatedAt = new Date().toISOString();

  res.status(201).json({ success: true, data: newMsg });
});

// Merge tickets
supportRouter.post("/tickets/:id/merge", (req: Request, res: Response) => {
  const targetId = parseInt(req.params.id);
  const { sourceId } = req.body;

  const target = tickets.find(t => t.id === targetId);
  const source = tickets.find(t => t.id === parseInt(sourceId));

  if (!target || !source) {
    return res.status(404).json({ success: false, message: "Target or Source ticket not found" });
  }

  // Merge messages
  messages.forEach(m => {
    if (m.ticketId === source.id) {
      m.ticketId = target.id;
    }
  });

  // Append merge notation
  messages.push({
    id: messages.length + 1,
    ticketId: target.id,
    sender: "system",
    senderName: "System Automation",
    message: `=== Ticket #${source.id} merged into this ticket ===\nOriginal Title: ${source.title}\nDescription: ${source.description}`,
    timestamp: new Date().toISOString(),
    isInternalNote: true
  });

  // Close source ticket
  source.status = "resolved";
  source.title = `[MERGED into #${target.id}] ${source.title}`;

  res.json({ success: true, message: `Ticket #${source.id} successfully merged into #${target.id}` });
});

// Split ticket
supportRouter.post("/tickets/:id/split", (req: Request, res: Response) => {
  const parentId = parseInt(req.params.id);
  const { newTitle, newDescription } = req.body;

  const parent = tickets.find(t => t.id === parentId);
  if (!parent) return res.status(404).json({ success: false, message: "Parent ticket not found" });

  const newId = tickets.length + 1;
  const newTicket = {
    id: newId,
    title: `[SPLIT from #${parentId}] ${newTitle}`,
    description: newDescription,
    customerName: parent.customerName,
    customerEmail: parent.customerEmail,
    status: "open",
    priority: parent.priority,
    assignedTo: parent.assignedTo,
    category: parent.category,
    sentiment: "neutral",
    satisfaction: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slaDeadline: parent.slaDeadline
  };

  tickets.push(newTicket);

  messages.push({
    id: messages.length + 1,
    ticketId: parentId,
    sender: "system",
    senderName: "System Automation",
    message: `Split off task into separate Ticket #${newId}: ${newTitle}`,
    timestamp: new Date().toISOString(),
    isInternalNote: true
  });

  messages.push({
    id: messages.length + 1,
    ticketId: newId,
    sender: "system",
    senderName: "System Automation",
    message: `Initialized via split from Ticket #${parentId}`,
    timestamp: new Date().toISOString(),
    isInternalNote: false
  });

  res.status(201).json({ success: true, data: newTicket });
});

// 3. Knowledge Base
supportRouter.get("/kb", (req: Request, res: Response) => {
  const { search, category } = req.query;
  let filtered = [...kbArticles];

  if (category && category !== "all") {
    filtered = filtered.filter(a => a.category === category);
  }
  if (search) {
    const s = (search as string).toLowerCase();
    filtered = filtered.filter(a => 
      a.title.toLowerCase().includes(s) || 
      a.content.toLowerCase().includes(s) || 
      a.tags.some(t => t.toLowerCase().includes(s))
    );
  }

  res.json({ success: true, data: filtered });
});

supportRouter.post("/kb", (req: Request, res: Response) => {
  const { title, category, content, tags } = req.body;
  const newArticle = {
    id: kbArticles.length + 1,
    title,
    category,
    content,
    tags: Array.isArray(tags) ? tags : (tags || "").split(",").map((t: string) => t.trim()),
    views: 0,
    helpfulVotes: 0,
    unhelpfulVotes: 0,
    updatedAt: new Date().toISOString()
  };

  kbArticles.push(newArticle);
  res.status(201).json({ success: true, data: newArticle });
});

supportRouter.post("/kb/:id/vote", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { type } = req.body; // helpful or unhelpful
  const article = kbArticles.find(a => a.id === id);

  if (!article) return res.status(404).json({ success: false, message: "Article not found" });

  if (type === "helpful") {
    article.helpfulVotes += 1;
  } else {
    article.unhelpfulVotes += 1;
  }

  res.json({ success: true, data: article });
});

// 4. Live Customer Chats
supportRouter.get("/chats", (req: Request, res: Response) => {
  res.json({ success: true, data: liveChats });
});

supportRouter.post("/chats", (req: Request, res: Response) => {
  const { customerName, customerEmail, initialMessage } = req.body;
  const newChat = {
    id: liveChats.length + 1,
    customerName,
    customerEmail: customerEmail || "anonymous@exshopi.ai",
    status: "active",
    typingIndicator: false,
    messages: [
      { sender: "customer", text: initialMessage, timestamp: new Date().toISOString() }
    ]
  };

  liveChats.push(newChat);
  res.status(201).json({ success: true, data: newChat });
});

supportRouter.post("/chats/:id/messages", (req: Request, res: Response) => {
  const chatId = parseInt(req.params.id);
  const { sender, text } = req.body;
  const chat = liveChats.find(c => c.id === chatId);

  if (!chat) return res.status(404).json({ success: false, message: "Chat session not found" });

  chat.messages.push({
    sender: sender || "agent",
    text,
    timestamp: new Date().toISOString()
  });

  // Turn off typing indicator once message is received
  if (sender === "customer") {
    chat.typingIndicator = false;
  }

  res.json({ success: true, data: chat });
});

// 5. AI Support Assistant (Ticket Summarization, Translation, Sentiment Audit, Priority Predictor, Auto-replies)
supportRouter.post("/tickets/:id/ai-assist", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { action, language } = req.body; // summarize, suggest_reply, recommend_article, classify, translate

  const ticket = tickets.find(t => t.id === id);
  if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

  const ticketMessages = messages.filter(m => m.ticketId === id);
  const contextText = `Ticket Title: ${ticket.title}
Ticket Description: ${ticket.description}
Thread Messages:
${ticketMessages.map(m => `[${m.senderName} (${m.sender})]: ${m.message}`).join("\n")}
`;

  if (!ai) {
    // Offline / Mock fallbacks
    let output = "";
    if (action === "summarize") {
      output = `The customer is complaining about seat double-billing on Q2 Enterprise license Invoice #1221. They claim they were charged for 2 seats instead of 1. Tier-1 agent investigated and noted that due to UUID resets, the agent was cataloged twice.`;
    } else if (action === "suggest_reply") {
      output = `Dear Sarah Jenkins,\n\nThank you for reaching out to Exshopi AI Customer Support. We have audited your Lucas AI seat provisioning history. You are indeed correct that a session reset on June 12 resulted in duplicate license registration codes. We have initiated a billing adjustment of $2,800 to credit your account on your upcoming cycle. Let us know if you need any additional assistance.\n\nWarm regards,\nEthan AI (Support Expert)`;
    } else if (action === "recommend_article") {
      output = `We recommend showing the customer Article: "Understanding AI Agent Seat Licensing & Billing" (ID #1). This outlines our exact multi-session licensing policies.`;
    } else if (action === "classify") {
      output = `Category: Billing / Licensing.\nPriority: High.\nSentiment: Negative.`;
    } else if (action === "translate") {
      output = `[Translated to ${language || "Spanish"}]: Estimada Sarah Jenkins, gracias por contactar al soporte de Exshopi AI. Hemos auditado su historial de licencias de Lucas AI...`;
    }

    return res.json({ success: true, result: output });
  }

  try {
    let systemPrompt = "You are Percy AI Support Director, the elite autonomous customer experience agent for Exshopi AI.";
    let userPrompt = "";

    if (action === "summarize") {
      userPrompt = `Please summarize this support ticket ticket thread comprehensively but concisely, highlighting the core issue, customer mood, current status, and proposed solution:\n\n${contextText}`;
    } else if (action === "suggest_reply") {
      userPrompt = `Suggest a complete, highly professional, polite email response to this customer thread. Directly solve their issue or offer high-intent options. Do not include mock fields, make it complete and ready to send:\n\n${contextText}`;
    } else if (action === "recommend_article") {
      userPrompt = `Based on this support ticket details, recommend which Knowledge Base articles are most relevant. Format as a scannable recommendation:\n\n${contextText}\n\nExisting articles for reference:\n${JSON.stringify(kbArticles)}`;
    } else if (action === "classify") {
      userPrompt = `Analyze this customer support ticket context and output four clear attributes:
1. Category classification (billing, technical, or product inquiry)
2. Priority level prediction (low, medium, high, critical)
3. Sentiment score (positive, neutral, negative)
4. Specific escalation recommendation\n\n${contextText}`;
    } else if (action === "translate") {
      userPrompt = `Translate the following support thread or the latest customer response completely into the language '${language || "Spanish"}', keeping the tone highly professional:\n\n${contextText}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt
      }
    });

    res.json({ success: true, result: response.text });
  } catch (err: any) {
    console.error("Gemini support assist failed: ", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
