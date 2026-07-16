import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

export const marketingRouter = Router();

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

export interface Campaign {
  id: number;
  name: string;
  subjectLine: string;
  status: string;
  type: string;
  budget: number;
  sentCount: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  revenue: number;
  scheduledAt: string;
  bodyContent: string;
  segmentId: number;
  abTest: {
    subjectA: string;
    subjectB: string;
    clicksA: number;
    clicksB: number;
    opensA: number;
    opensB: number;
    winner: string | null;
  } | null;
}

// In-Memory Database Collections for Marketing
export let campaigns: Campaign[] = [
  {
    id: 1,
    name: "AI Workforce Revolution Product Launch Q3",
    subjectLine: "Meet your first completely autonomous CRM & sales agent team",
    status: "running", // draft, scheduled, running, completed
    type: "email", // email, sms, whatsapp, push
    budget: 5000,
    sentCount: 12500,
    openRate: 28.4,
    clickRate: 6.8,
    conversionRate: 2.1,
    revenue: 35400,
    scheduledAt: "2026-07-10T15:00:00Z",
    bodyContent: "We are thrilled to introduce Exshopi AI Workforce platform, featuring custom model fine-tuning with full-context database embeddings...",
    segmentId: 1,
    abTest: {
      subjectA: "Meet your first completely autonomous CRM & sales agent team",
      subjectB: "Double your sales pipelines with Exshopi AI Workforce",
      clicksA: 425,
      clicksB: 310,
      opensA: 1800,
      opensB: 1450,
      winner: "A"
    }
  },
  {
    id: 2,
    name: "B2B SaaS Lead Re-engagement Blast",
    subjectLine: "Did you miss our autonomous logistics integration webinars?",
    status: "completed",
    type: "email",
    budget: 1500,
    sentCount: 8400,
    openRate: 22.1,
    clickRate: 4.5,
    conversionRate: 1.2,
    revenue: 12400,
    scheduledAt: "2026-07-01T14:00:00Z",
    bodyContent: "Re-engage with Lucas AI and audit how our container packing algorithms cut standard shipping delays by 40%...",
    segmentId: 2,
    abTest: null
  },
  {
    id: 3,
    name: "Urgent Hot-Lead WhatsApp Inbound Sequence",
    subjectLine: "Let's configure your outbound sales agent model today",
    status: "scheduled",
    type: "whatsapp",
    budget: 800,
    sentCount: 0,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0,
    revenue: 0,
    scheduledAt: "2026-07-18T10:00:00Z",
    bodyContent: "Hi, I am Sophia AI from Exshopi. I noticed your team qualifying outbound parameters. Let's start...",
    segmentId: 1,
    abTest: null
  },
  {
    id: 4,
    name: "Push Alert - API Quota Exceeded Remediation",
    subjectLine: "Instantly expand your container volume disk partitions",
    status: "draft",
    type: "push",
    budget: 200,
    sentCount: 0,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0,
    revenue: 0,
    scheduledAt: "2026-07-25T12:00:00Z",
    bodyContent: "Avoid agent training crashes. Press to scale ephemeral disks to 80GB instantly.",
    segmentId: 2,
    abTest: null
  }
];

export let segments = [
  { id: 1, name: "Enterprise High-Intent Leads", type: "dynamic", memberCount: 1250, filters: "company_size > 500 AND status = 'Contacted'", tags: ["enterprise", "high-intent"] },
  { id: 2, name: "Stale Trial Sign-ups Q2", type: "static", memberCount: 3400, filters: "last_active < '2026-06-01'", tags: ["stale", "re-engage"] },
  { id: 3, name: "AI Developer Newsletter Subscribers", type: "dynamic", memberCount: 15800, filters: "subscribed_to = 'dev-weekly'", tags: ["newsletter", "developers"] }
];

export let workflows = [
  {
    id: 1,
    name: "Enterprise Outbound Nurturing Workflow",
    status: "active", // active, paused, draft
    nodes: [
      { id: "1", type: "trigger", label: "Lead Created in CRM", config: { source: "crm" } },
      { id: "2", type: "delay", label: "Wait 15 Minutes", config: { duration: 15, unit: "minutes" } },
      { id: "3", type: "condition", label: "Is Company Size > 500?", config: { field: "company_size", operator: "gt", value: 500 } },
      { id: "4", type: "action", label: "Trigger Outbound Sales Email", config: { templateId: 1 } },
      { id: "5", type: "action", label: "Assign Lead to Sophia AI Sales Agent", config: { agent: "Sophia AI" } }
    ]
  },
  {
    id: 2,
    name: "Post-Support Resolution Promo Trigger",
    status: "paused",
    nodes: [
      { id: "1", type: "trigger", label: "Ticket Resolved", config: { category: "billing" } },
      { id: "2", type: "condition", label: "Is CSAT Score = 5?", config: { score: 5 } },
      { id: "3", type: "action", label: "Send Refer-a-Friend Coupon", config: { discount: "15%" } }
    ]
  }
];

// 1. Marketing Dashboard Metrics
marketingRouter.get("/dashboard", (req: Request, res: Response) => {
  const activeCount = campaigns.filter(c => c.status === "running").length;
  const draftCount = campaigns.filter(c => c.status === "draft").length;
  const completedCount = campaigns.filter(c => c.status === "completed").length;
  const total = campaigns.length;

  // Calculate aggregated stats across completed and running campaigns
  const sentCampaigns = campaigns.filter(c => c.sentCount > 0);
  const totalSent = sentCampaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const avgOpenRate = sentCampaigns.length > 0
    ? parseFloat((sentCampaigns.reduce((sum, c) => sum + c.openRate, 0) / sentCampaigns.length).toFixed(1))
    : 25.2;
  const avgClickRate = sentCampaigns.length > 0
    ? parseFloat((sentCampaigns.reduce((sum, c) => sum + c.clickRate, 0) / sentCampaigns.length).toFixed(1))
    : 5.4;
  const avgConvRate = sentCampaigns.length > 0
    ? parseFloat((sentCampaigns.reduce((sum, c) => sum + c.conversionRate, 0) / sentCampaigns.length).toFixed(1))
    : 1.6;

  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalSpend = campaigns.reduce((sum, c) => sum + (c.status !== "draft" ? c.budget : 0), 0);
  const roi = totalSpend > 0 ? parseFloat((((totalRevenue - totalSpend) / totalSpend) * 100).toFixed(0)) : 420;

  // Audience Growth
  const audienceGrowth = [
    { month: "Jan", count: 12000, growth: 12 },
    { month: "Feb", count: 13500, growth: 15 },
    { month: "Mar", count: 14800, growth: 18 },
    { month: "Apr", count: 16500, growth: 22 },
    { month: "May", count: 18200, growth: 25 },
    { month: "Jun", count: 20450, growth: 30 }
  ];

  res.json({
    success: true,
    data: {
      activeCampaigns: activeCount,
      draftCampaigns: draftCount,
      completedCampaigns: completedCount,
      totalCampaigns: total,
      totalSent,
      avgOpenRate,
      avgClickRate,
      avgConversionRate: avgConvRate,
      totalRevenue,
      roi: `${roi}%`,
      audienceGrowth,
      aiSummary: "All outbound outreach flows healthy. Variant A of the Q3 Launch sequence continues to outperform Variant B by 22% in conversion yields. Recommend reallocating $1,500 budget from stagnant static static Q2 re-engagements."
    }
  });
});

// 2. Campaign Actions (CRUD)
marketingRouter.get("/campaigns", (req: Request, res: Response) => {
  const { type, status } = req.query;
  let filtered = [...campaigns];

  if (type && type !== "all") {
    filtered = filtered.filter(c => c.type === type);
  }
  if (status && status !== "all") {
    filtered = filtered.filter(c => c.status === status);
  }

  res.json({ success: true, data: filtered });
});

marketingRouter.post("/campaigns", (req: Request, res: Response) => {
  const { name, subjectLine, type, budget, bodyContent, segmentId, scheduledAt, abTestConfig } = req.body;
  const newId = campaigns.length + 1;

  const newCampaign = {
    id: newId,
    name,
    subjectLine: subjectLine || `Introducing new ${name}`,
    status: scheduledAt ? "scheduled" : "draft",
    type: type || "email",
    budget: parseFloat(budget) || 1000,
    sentCount: 0,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0,
    revenue: 0,
    scheduledAt: scheduledAt || new Date().toISOString(),
    bodyContent: bodyContent || "",
    segmentId: parseInt(segmentId) || 1,
    abTest: abTestConfig ? {
      subjectA: subjectLine || `Option A - ${name}`,
      subjectB: abTestConfig.subjectB || `Option B - ${name}`,
      clicksA: 0,
      clicksB: 0,
      opensA: 0,
      opensB: 0,
      winner: null
    } : null
  };

  campaigns.push(newCampaign);
  res.status(201).json({ success: true, data: newCampaign });
});

marketingRouter.get("/campaigns/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const campaign = campaigns.find(c => c.id === id);
  if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });
  res.json({ success: true, data: campaign });
});

marketingRouter.put("/campaigns/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const campaignIdx = campaigns.findIndex(c => c.id === id);
  if (campaignIdx === -1) return res.status(404).json({ success: false, message: "Campaign not found" });

  campaigns[campaignIdx] = {
    ...campaigns[campaignIdx],
    ...req.body
  };

  res.json({ success: true, data: campaigns[campaignIdx] });
});

marketingRouter.delete("/campaigns/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const idx = campaigns.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Campaign not found" });

  campaigns.splice(idx, 1);
  res.json({ success: true, message: "Campaign deleted successfully" });
});

// 3. Audience Segments
marketingRouter.get("/segments", (req: Request, res: Response) => {
  res.json({ success: true, data: segments });
});

marketingRouter.post("/segments", (req: Request, res: Response) => {
  const { name, type, filters, tags } = req.body;
  const newSegment = {
    id: segments.length + 1,
    name,
    type: type || "static",
    memberCount: Math.floor(Math.random() * 5000) + 100,
    filters: filters || "",
    tags: Array.isArray(tags) ? tags : (tags || "").split(",").map((t: string) => t.trim())
  };

  segments.push(newSegment);
  res.status(201).json({ success: true, data: newSegment });
});

// 4. Automation Workflows
marketingRouter.get("/workflows", (req: Request, res: Response) => {
  res.json({ success: true, data: workflows });
});

marketingRouter.post("/workflows", (req: Request, res: Response) => {
  const { name, nodes } = req.body;
  const newWorkflow = {
    id: workflows.length + 1,
    name,
    status: "draft",
    nodes: nodes || []
  };

  workflows.push(newWorkflow);
  res.status(201).json({ success: true, data: newWorkflow });
});

marketingRouter.post("/workflows/:id/toggle", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const workflow = workflows.find(w => w.id === id);
  if (!workflow) return res.status(404).json({ success: false, message: "Workflow not found" });

  workflow.status = workflow.status === "active" ? "paused" : "active";
  res.json({ success: true, data: workflow });
});

// 5. AI Marketing Assistant (Generate campaign copy, subject lines, A/B testing variants, segment recommendations, ROI models)
marketingRouter.post("/ai-assist", async (req: Request, res: Response) => {
  const { action, description, targetProduct, segmentName, budget } = req.body;

  if (!ai) {
    // Offline fallbacks
    let output = "";
    if (action === "generate_copy") {
      output = `Subject: Double your sales velocities with Exshopi AI outreach!

Dear Enterprise Growth Team,

Are your manual outbound outreach flows costing you potential net deals? Meet Sophia AI, the autonomous B2B Outreach Specialist from Exshopi. Sophia hooks directly into your customer databases to qualify high-intent pipelines on autopilot.

Key platform yields:
- ⚡ 100% autonomous pipeline monitoring
- 📈 +35% increase in lead response ratios
- 🛡️ Multi-session compliance protections

Deploy your first active model in 5 minutes!`;
    } else if (action === "suggest_subject") {
      output = `1. "🤖 Autonomous B2B sales agents are ready to join your pipeline" (Recommended - High Engagement)
2. "Double your high-intent pipeline conversions with Exshopi"
3. "Is your enterprise database ready for autonomous outbound agents?"
4. "Cut customer acquisition burn rates by 40% with Sophia AI"`;
    } else if (action === "suggest_audience") {
      output = `We suggest targeting high-intent organizations with:
- Company Size > 500 seats
- Multi-region inventory setups
- Industries: Retail Tech, B2B SaaS, or Cross-border Logistics`;
    } else if (action === "predict_roi") {
      output = `Predicted Campaign Yield model:
- Total Budget: $${budget || "5,000"}
- Estimated Open Rate: 26.5% - 29.8%
- Expected Conversions: 180 - 240 sales qualified deals
- Estimated Revenue Yield: $28,500 - $36,200
- Projected ROI: 470% based on active Q3 benchmark metrics`;
    }

    return res.json({ success: true, result: output });
  }

  try {
    let systemPrompt = "You are Percy AI Marketing Director, the elite growth and campaign optimization agent for Exshopi AI.";
    let userPrompt = "";

    if (action === "generate_copy") {
      userPrompt = `Generate a highly persuasive, premium-styled marketing email copy for Exshopi. 
Target Product/Feature: ${targetProduct || "Autonomous Sales Agents"}
Core campaign scope: ${description || "General platform awareness"}
Target Segment: ${segmentName || "General business partners"}

Please structure the output with:
- A compelling email subject line (using high-intent action words)
- A catchy header
- An elegant body text highlighting ROI, metrics, and automation compliance
- A strong, clear Call-to-Action (CTA)`;
    } else if (action === "suggest_subject") {
      userPrompt = `Generate 5 alternative high-converting email subject lines for the following marketing campaign description. Provide engagement rating for each:
Campaign details: ${description || "Autonomous Logistics agents webinar series"}`;
    } else if (action === "suggest_audience") {
      userPrompt = `Based on this marketing campaign objective: "${description}", suggest optimal CRM filters and attributes to construct a highly targetable dynamic customer segment. Focus on B2B SaaS, retail size, or team parameters.`;
    } else if (action === "predict_roi") {
      userPrompt = `Calculate a detailed, realistic predictive ROI model for a marketing campaign.
Campaign Goal: ${description}
Budget: $${budget || "5,000"}
Provide estimations for Open rates, Click-through rates, Lead generation count, Revenue yield, and overall ROI percentage, backing it up with high-level B2B SaaS SaaS metrics.`;
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
    console.error("Gemini marketing assist failed: ", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
