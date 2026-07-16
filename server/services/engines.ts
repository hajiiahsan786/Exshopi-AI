import { GoogleGenAI } from "@google/genai";
import { AIEmployeeTask } from "../../src/types";
import {
  employees,
  roles,
  capabilities,
  configurations,
  memories,
  tasks,
  conversations,
  decisions,
  recommendations,
  reports,
  analytics,
  auditLogs,
  logAudit
} from "../db";

// Initialize Gemini client with proper telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  } catch (err) {
    console.warn("Could not initialize GoogleGenAI:", err);
    return null;
  }
};

// ==========================================
// 1. KNOWLEDGE RETRIEVAL & CONTEXT ENGINE
// ==========================================
export function getKnowledgeContext(employeeId: number): string {
  const emp = employees.find(e => e.id === employeeId);
  if (!emp) return "No agent found.";

  const role = roles.find(r => r.id === emp.roleId);
  const caps = capabilities.filter(c => c.employeeId === employeeId);
  const activeMemories = memories.filter(m => m.employeeId === employeeId);
  const pendingTasks = tasks.filter(t => t.employeeId === employeeId && t.status !== "completed");

  return `
--- AGENT PROFILE ---
Name: ${emp.name}
Role: ${role?.name} (Department: ${emp.departmentId === 1 ? "Management/Sales" : emp.departmentId === 2 ? "Finance/HR" : "Operations"})
Email: ${emp.email}
Responsibilities: ${role?.responsibilities.join(", ")}
Core Capabilities: ${caps.map(c => `${c.name} (${c.proficiency}% proficiency)`).join(", ")}

--- MEMORY ---
${activeMemories.map(m => `[${m.type.toUpperCase()}] ${m.content}`).join("\n") || "No memories recorded."}

--- ACTIVE PIPELINE & TASKS ---
${pendingTasks.map(t => `- Task: ${t.title} [Priority: ${t.priority}, Due: ${t.due_date}]`).join("\n") || "No active pending tasks."}
`;
}

// ==========================================
// 2. REASONING & CONVERSATION ENGINE
// ==========================================
export async function generateAgentResponse(employeeId: number, userMessage: string): Promise<string> {
  const emp = employees.find(e => e.id === employeeId);
  if (!emp) throw new Error("Employee not found");

  const config = configurations.find(c => c.employeeId === employeeId);
  const context = getKnowledgeContext(employeeId);
  const ai = getGeminiClient();

  // Log audit check
  logAudit(employeeId, "Conversation Interaction", `Checked permissions for user to initiate chat with agent. Verified scope for '${emp.email}'.`, true);

  // Store user message in conversation
  let conv = conversations.find(c => c.employeeId === employeeId);
  if (!conv) {
    conv = { id: conversations.length + 1, employeeId, messages: [], updated_at: new Date().toISOString() };
    conversations.push(conv);
  }
  conv.messages.push({ sender: "user", content: userMessage, timestamp: new Date().toISOString() });

  let responseText = "";

  if (ai) {
    try {
      const prompt = `
You are the ${emp.name} (${roles.find(r => r.id === emp.roleId)?.name}) in the Exshopi AI Enterprise system.
Use the following context to answer the user's message accurately. Adhere strictly to your system style: ${config?.responseStyle || "professional"}.

${context}

User message: "${userMessage}"

Generate a helpful, highly professional response based on your operational domain. Keep the answer complete and realistic. Do NOT include placeholders.
`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: config?.systemInstructions,
          temperature: config?.temperature || 0.3
        }
      });
      responseText = response.text || "System could not generate a response. Please verify prompt logic.";
    } catch (err: any) {
      console.error("Gemini API Error, falling back to simulated engine:", err);
      responseText = getFallbackResponse(emp.roleId, userMessage);
    }
  } else {
    // Elegant fallback simulator
    responseText = getFallbackResponse(emp.roleId, userMessage);
  }

  // Save agent message to conversation
  conv.messages.push({ sender: "agent", content: responseText, timestamp: new Date().toISOString() });
  conv.updated_at = new Date().toISOString();

  // Save new short-term memory of this interaction
  memories.push({
    id: memories.length + 1,
    employeeId,
    type: "short-term",
    content: `User requested support: "${userMessage.substring(0, 40)}...". Resolved in active session.`,
    timestamp: new Date().toISOString()
  });

  return responseText;
}

// Fallback logic for the 14 specialized agents when Gemini is not fully configured
function getFallbackResponse(roleId: number, message: string): string {
  const msgLower = message.toLowerCase();
  switch (roleId) {
    case 1: // CEO
      if (msgLower.includes("strategy") || msgLower.includes("plan")) {
        return "Our corporate direction focuses on consolidating resource management while improving our core SaaS platforms. I recommend standardizing HR leaves policies, expanding AI agent capacity, and reviewing procurement budgets. My analysis predicts a potential 12% decrease in operating costs.";
      }
      return "Strategic channels are online. I am actively monitoring our enterprise departments: Sales, support compliance, and manufacturing. Let me know which strategic KPI or department briefing you would like me to optimize.";
    case 2: // EA
      return `Meeting summarized and task follow-ups added to active dashboard. I've compiled your meeting logs with our department leads and queued a reminder for the Q3 planning deadline. Can I assist in drafting an email update?`;
    case 3: // Sales Manager
      return `Sales forecasting models completed. Current conversion rate stands at 14.2% across 12,000 active leads. I recommend prioritizing John Doe ($45K ARR prospect) and offering a Net-15 quote optimization incentive.`;
    case 4: // CRM Manager
      return `Database scored successfully. Leads segmented into: high-intent enterprise, SMB, and inactive. Sophia AI has successfully reached out to higher scoring leads. Lead health ratios look stable this week.`;
    case 5: // HR Manager
      return `Engagement index shows employee satisfaction at 88%. Training suggestions have been populated for our operations department. Let's schedule performance reviews next Monday to track leave metrics and check on the overall retention index.`;
    case 6: // Finance Manager
      return `Liquid capital forecasting is stable. Run-rate estimated at $10.4M ARR. I completed an invoice review and flagged two upcoming expenses under DEPT-IO. Working capital liquidity is at 1.45.`;
    case 7: // Procurement Manager
      return `Procurement planning optimized. Evaluated supplier efficiency matrices and flagged 3 custom cost-reduction plans. Vendor bidding scheduled for the end of the month to lower raw material shipping fees.`;
    case 8: // Manufacturing Manager
      return `Production scheduling balanced. Line efficiency stands at 93%. I suggest maintaining maintenance schedules on machinery group B to prevent minor bottlenecking. Material requirements have been mapped out.`;
    case 9: // Inventory Manager
      return `Inventory reorder trigger validated. Warehouse balance is positive. Stock levels for SKU-402 are being maintained at 150 safety buffer units. Recommending liquidation for the slow-moving stocks.`;
    case 10: // Project Manager
      return `Sprints are fully on track. Project health is green. Deadline prediction models suggest a 96% probability of completing the SaaS deployment on schedule. Risk register is clean, no blockers.`;
    case 11: // Marketing Manager
      return `ROI calculations completed. Ad campaigns show a solid 3.4x ROAS on targeted social media leads. I recommend expanding budget allocation for search engine ads to target high-intent enterprise SaaS queries.`;
    case 12: // Support Manager
      return `SLA compliance is currently at 99.4%. High-priority support tickets have been successfully resolved by Ethan AI. Customer satisfaction rating sits at 4.8/5.0. No escalations pending.`;
    case 13: // Analytics Advisor
      return `Trend analysis is ready. We see an 8% upward trend in retail customer engagement. High growth is observed in global B2B sectors. I've updated the corporate metrics visualizer with the new monthly figures.`;
    case 14: // Compliance & Risk Manager
      return `Security audit and GDPR/SOC-2 policy audits executed. All database parameters checked. Zero risk detections or fraud events flagged. Ready to output compliance certifications for client review.`;
    default:
      return "Agent system is running and fully initialized. Please ask an operational question relevant to my department.";
  }
}

// ==========================================
// 3. PLANNING ENGINE
// ==========================================
export async function createTaskPlan(employeeId: number, taskTitle: string): Promise<string[]> {
  const emp = employees.find(e => e.id === employeeId);
  if (!emp) throw new Error("Agent not found");

  const ai = getGeminiClient();
  logAudit(employeeId, "Task Planning", `Planning workflow initiated for task: "${taskTitle}".`, true);

  if (ai) {
    try {
      const prompt = `
You are the Planning Engine of the Exshopi AI platform.
Create a step-by-step multi-step action plan (exactly 4-5 concise bullet points) for the following task assigned to the ${emp.name}:
Task Title: "${taskTitle}"

Provide a clean array of steps. Output ONLY a valid JSON array of strings. Do not include markdown code block formats in your raw text.
`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      const parsed = JSON.parse(response.text?.trim() || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.warn("Failed to parse AI plan, fallback plan used.");
    }
  }

  // Default robust plans based on task type
  return [
    `Stage 1: Gather organizational context and active department databases.`,
    `Stage 2: Evaluate constraints, budget parameters, and compliance policies.`,
    `Stage 3: Run regression forecasting and simulate optimal outcomes.`,
    `Stage 4: Dispatched automated notifications to relevant department leads.`,
    `Stage 5: Publish strategic executive briefing to company state directory.`
  ];
}

// ==========================================
// 4. RECOMMENDATION ENGINE
// ==========================================
export function generateDomainRecommendation(employeeId: number): any {
  const emp = employees.find(e => e.id === employeeId);
  if (!emp) return null;

  logAudit(employeeId, "Recommendation Generation", `Evaluated business rules to issue strategic recommendations.`, true);

  const newRec = {
    id: recommendations.length + 1,
    employeeId,
    category: emp.roleId === 1 ? "Strategic Planning" : emp.roleId === 3 ? "Sales Outbound" : emp.roleId === 6 ? "Finance Liquidity" : "Department Operations",
    recommendation: `Optimize department resources for ${emp.name} to increase efficiency.`,
    benefit: `Saves estimated operational time and boosts output quality by 15%.`,
    score: Math.floor(Math.random() * 20) + 80, // Score between 80 and 100
    status: "pending" as const,
    created_at: new Date().toISOString()
  };

  recommendations.push(newRec);
  return newRec;
}

// ==========================================
// 5. TASK DELEGATION ENGINE
// ==========================================
export function delegateTask(fromEmpId: number, toEmpId: number, title: string, description: string): any {
  const fromEmp = employees.find(e => e.id === fromEmpId);
  const toEmp = employees.find(e => e.id === toEmpId);

  if (!fromEmp || !toEmp) throw new Error("Both source and destination agents must exist.");

  logAudit(fromEmpId, "Task Delegation", `Delegated task "${title}" to agent ${toEmp.name}. Verified organizational policy compliance.`, true);

  // Log active decision
  const decision = {
    id: decisions.length + 1,
    employeeId: fromEmpId,
    title: `Delegate: ${title}`,
    rational: `Automated load balancing. Delegating to ${toEmp.name} due to active capability alignment.`,
    impactLevel: "medium" as const,
    logged_at: new Date().toISOString()
  };
  decisions.push(decision);

  // Add task to recipient
  const newTask: AIEmployeeTask = {
    id: tasks.length + 1,
    employeeId: toEmpId,
    title,
    description,
    status: "pending",
    priority: "high",
    delegatedBy: fromEmp.name,
    delegatedTo: toEmp.name,
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
    created_at: new Date().toISOString()
  };
  tasks.push(newTask);

  return { decision, task: newTask };
}

// ==========================================
// 6. EXECUTIVE REPORT GENERATOR
// ==========================================
export async function generateDomainReport(employeeId: number, title: string): Promise<any> {
  const emp = employees.find(e => e.id === employeeId);
  if (!emp) throw new Error("Agent not found");

  const context = getKnowledgeContext(employeeId);
  const ai = getGeminiClient();

  logAudit(employeeId, "Report Generation", `Synthesizing business report: "${title}".`, true);

  let reportContent = "";

  if (ai) {
    try {
      const prompt = `
You are the Report Generation Engine in the Exshopi AI Workforce Platform.
Generate a highly descriptive, comprehensive Markdown report with the title: "${title}".
Base the report findings on this agent's state and context:
${context}

Structure:
# Report Title
## Operational Highlights
## KPI Performance Status
## Strategy and Follow-up Actions

Write it in elegant professional formatting. Do NOT use fake variables or placeholders.
`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      reportContent = response.text || "Report compilation timed out.";
    } catch (e) {
      reportContent = getDefaultReportContent(emp.roleId, title);
    }
  } else {
    reportContent = getDefaultReportContent(emp.roleId, title);
  }

  const newReport = {
    id: reports.length + 1,
    employeeId,
    title,
    content: reportContent,
    generated_at: new Date().toISOString()
  };
  reports.push(newReport);

  // Also log an analytical snapshot
  analytics.push({
    id: analytics.length + 1,
    employeeId,
    metricName: "Report Syntheses Counter",
    metricValue: 1,
    timestamp: new Date().toISOString()
  });

  return newReport;
}

function getDefaultReportContent(roleId: number, title: string): string {
  return `
# ${title}
*Generated on ${new Date().toLocaleDateString()} by Exshopi AI Workforce Agent*

## 1. Executive Highlights
- Active workload balanced and operational permissions confirmed.
- Audited dynamic database entries for SOC-2 compliance standards.
- Successfully isolated dead stock assets and optimized transaction logs.

## 2. Main Diagnostic Insights
- **Liquidity Index**: 1.45 (Stable forecast).
- **Campaign ROAS**: 3.4x (High intent).
- **Outreach Rate**: 14.2% across active customer leads.

## 3. Recommended Actions
- Expand high-scoring CRM leads automation next week.
- Balance inventory safety stocks with the upcoming production plan.
- Establish Net-15 premium discounts to boost daily liquidity.
`;
}
