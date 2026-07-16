import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

export const documentsRouter = Router();

// Interfaces
export interface DocPermission {
  userId: string;
  fullName: string;
  role: "viewer" | "editor" | "owner";
}

export interface DocVersion {
  version: number;
  fileName: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  changeLog: string;
}

export interface DocComment {
  id: number;
  user: string;
  text: string;
  createdAt: string;
}

export interface DocActivity {
  id: number;
  user: string;
  action: string;
  timestamp: string;
}

export interface DocumentItem {
  id: number;
  name: string;
  type: string; // "pdf" | "docx" | "xlsx" | "pptx" | "png" | "mp4" | "mp3" | "md" | "json" | "csv" | "txt" | "code"
  size: string;
  folderId: number | null;
  isFavorite: boolean;
  isShared: boolean;
  isLocked: boolean;
  isArchived: boolean;
  isDeleted: boolean; // Recycle Bin
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  currentVersion: number;
  versions: DocVersion[];
  comments: DocComment[];
  activities: DocActivity[];
  permissions: DocPermission[];
  content?: string; // Content for preview and AI
}

export interface FolderItem {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: string;
  createdBy: string;
  isFavorite: boolean;
}

// In-memory collections
let folders: FolderItem[] = [
  { id: 1, name: "Finance & Accounts", parentId: null, createdAt: "2026-01-15T10:00:00Z", createdBy: "Ahsan Haji", isFavorite: true },
  { id: 2, name: "Customer Support Assets", parentId: null, createdAt: "2026-02-12T14:30:00Z", createdBy: "Ahsan Haji", isFavorite: false },
  { id: 3, name: "B2B Sales Outreach", parentId: null, createdAt: "2026-03-01T09:15:00Z", createdBy: "Sophia AI (Sales Pro)", isFavorite: false },
  { id: 4, name: "Marketing Campaigns", parentId: null, createdAt: "2026-03-20T11:00:00Z", createdBy: "Ahsan Haji", isFavorite: true },
  { id: 5, name: "Quarterly Reports", parentId: 1, createdAt: "2026-04-05T08:30:00Z", createdBy: "Ahsan Haji", isFavorite: false }
];

let documents: DocumentItem[] = [
  {
    id: 1,
    name: "Exshopi-Enterprise-Strategy-2026.pdf",
    type: "pdf",
    size: "1.8 MB",
    folderId: null,
    isFavorite: true,
    isShared: true,
    isLocked: false,
    isArchived: false,
    isDeleted: false,
    tags: ["strategic", "q3-planning", "board-deck"],
    category: "Strategic Planning",
    createdAt: "2026-07-01T10:00:00Z",
    updatedAt: "2026-07-10T15:30:00Z",
    createdBy: "Ahsan Haji",
    currentVersion: 2,
    versions: [
      { version: 1, fileName: "Exshopi-Strategy-Draft.pdf", size: "1.5 MB", uploadedAt: "2026-07-01T10:00:00Z", uploadedBy: "Ahsan Haji", changeLog: "Initial upload" },
      { version: 2, fileName: "Exshopi-Enterprise-Strategy-2026.pdf", size: "1.8 MB", uploadedAt: "2026-07-10T15:30:00Z", uploadedBy: "Ahsan Haji", changeLog: "Incorporated Board Feedback regarding AI Workforce projections" }
    ],
    comments: [
      { id: 1, user: "Sophia AI (Sales Pro)", text: "Outbound sales figures match Q3 forecasting model.", createdAt: "2026-07-11T09:00:00Z" },
      { id: 2, user: "Ahsan Haji", text: "@Sophia perfect, let's keep track of customer conversion metrics.", createdAt: "2026-07-11T10:30:00Z" }
    ],
    activities: [
      { id: 1, user: "Ahsan Haji", action: "Created Document", timestamp: "2026-07-01T10:00:00Z" },
      { id: 2, user: "Ahsan Haji", action: "Uploaded Version 2", timestamp: "2026-07-10T15:30:00Z" },
      { id: 3, user: "Sophia AI (Sales Pro)", action: "Viewed Document", timestamp: "2026-07-11T08:45:00Z" }
    ],
    permissions: [
      { userId: "u1", fullName: "Ahsan Haji", role: "owner" },
      { userId: "u2", fullName: "Sophia AI (Sales Pro)", role: "editor" }
    ],
    content: "EXSHOPI AI STRATEGIC OUTLOOK 2026\n===============================\nThis plan details the expansion of the World's AI Workforce platform. Exshopi AI empowers businesses to provision autonomous workforce components including Sales, Procurement, Logistics, Customer Support, and Human Resources. Key Objectives: 1. Deploy 1,000 active enterprise AI agents. 2. Scale in-memory multi-tenant workflow engines. 3. Establish cross-module automated billing flows to decrease invoice settlement durations from 30 days to less than 12 hours."
  },
  {
    id: 2,
    name: "AI-Workforce-Pricing-Models.xlsx",
    type: "xlsx",
    size: "420 KB",
    folderId: 1,
    isFavorite: false,
    isShared: false,
    isLocked: true,
    isArchived: false,
    isDeleted: false,
    tags: ["pricing", "financials", "restricted"],
    category: "Financial Models",
    createdAt: "2026-07-05T11:20:00Z",
    updatedAt: "2026-07-05T11:20:00Z",
    createdBy: "Ahsan Haji",
    currentVersion: 1,
    versions: [
      { version: 1, fileName: "AI-Workforce-Pricing-Models.xlsx", size: "420 KB", uploadedAt: "2026-07-05T11:20:00Z", uploadedBy: "Ahsan Haji", changeLog: "Initial baseline" }
    ],
    comments: [],
    activities: [
      { id: 1, user: "Ahsan Haji", action: "Created Document", timestamp: "2026-07-05T11:20:00Z" },
      { id: 2, user: "Ahsan Haji", action: "Locked Document", timestamp: "2026-07-05T11:22:00Z" }
    ],
    permissions: [
      { userId: "u1", fullName: "Ahsan Haji", role: "owner" }
    ],
    content: "Tier, Price per Hour, Max Agents, CPU Limit, Memory Limit, Analytics\nStarter, $0.50/hr, 5 agents, 1 Core, 2GB, Basic Dashboard\nEnterprise Pro, $1.80/hr, Unlimited, 4 Cores, 8GB, Multi-Agent Orchestration\nAutonomous Cluster, Custom, Unlimited, Dedicated Kubernetes, Real-time Visual Pipeline"
  },
  {
    id: 3,
    name: "Support-Agent-Training-Guide.md",
    type: "md",
    size: "45 KB",
    folderId: 2,
    isFavorite: true,
    isShared: true,
    isLocked: false,
    isArchived: false,
    isDeleted: false,
    tags: ["customer-support", "training", "markdown"],
    category: "Standard Operating Procedures",
    createdAt: "2026-07-08T09:00:00Z",
    updatedAt: "2026-07-12T14:10:00Z",
    createdBy: "Ethan AI (Support Expert)",
    currentVersion: 2,
    versions: [
      { version: 1, fileName: "Support-Agent-Guide-v1.md", size: "38 KB", uploadedAt: "2026-07-08T09:00:00Z", uploadedBy: "Ethan AI (Support Expert)", changeLog: "Created draft training layout" },
      { version: 2, fileName: "Support-Agent-Training-Guide.md", size: "45 KB", uploadedAt: "2026-07-12T14:10:00Z", uploadedBy: "Ethan AI (Support Expert)", changeLog: "Added ticket escalation threshold constraints" }
    ],
    comments: [
      { id: 1, user: "Ahsan Haji", text: "Looks excellent. Make sure the escalation path for custom integrations goes straight to technical team workflows.", createdAt: "2026-07-13T10:00:00Z" }
    ],
    activities: [
      { id: 1, user: "Ethan AI (Support Expert)", action: "Created Document", timestamp: "2026-07-08T09:00:00Z" },
      { id: 2, user: "Ethan AI (Support Expert)", action: "Uploaded Version 2", timestamp: "2026-07-12T14:10:00Z" }
    ],
    permissions: [
      { userId: "u1", fullName: "Ahsan Haji", role: "editor" },
      { userId: "u3", fullName: "Ethan AI (Support Expert)", role: "owner" }
    ],
    content: "# Tier 1 Support Agent SLA Manual\n\nThis guide covers responses to customer technical tickets:\n1. Greeting: Remain professional and state active agent designation.\n2. Ingestion: Query CRM systems to pull up recent user invoice and payment parameters.\n3. Solutions: Offer sandbox configuration rebuild if a workspace shows lag. If latency is high, trigger Automated Telemetry Logs.\n4. Escalations: Tickets unresolved within 10 minutes are redirected to Node Cluster Engineering."
  },
  {
    id: 4,
    name: "Enterprise-SLA-Agreement-Draft.docx",
    type: "docx",
    size: "1.2 MB",
    folderId: null,
    isFavorite: false,
    isShared: true,
    isLocked: false,
    isArchived: false,
    isDeleted: false,
    tags: ["contract", "sla", "legal"],
    category: "Contracts & Legal",
    createdAt: "2026-07-10T16:00:00Z",
    updatedAt: "2026-07-10T16:00:00Z",
    createdBy: "Ahsan Haji",
    currentVersion: 1,
    versions: [
      { version: 1, fileName: "Enterprise-SLA-Agreement-Draft.docx", size: "1.2 MB", uploadedAt: "2026-07-10T16:00:00Z", uploadedBy: "Ahsan Haji", changeLog: "Initial legal draft" }
    ],
    comments: [],
    activities: [],
    permissions: [],
    content: "SERVICE LEVEL AGREEMENT FOR AUTONOMOUS SYSTEMS\nThis Contract establishes the terms of service (99.99% Availability) between Exshopi AI (Provider) and Global Tech Corp (Client). High Risk Factors: Exshopi AI is not liable for downstream logistics delays where third-party transit portals (such as DHL or FedEx) show local weather-related outages. If service uptime drops below 99.9%, Client is entitled to credits calculated at 2% of the monthly billing parameters. Disputes will be governed by California State Arbitration Laws."
  },
  {
    id: 5,
    name: "Exshopi-Product-Banner.png",
    type: "png",
    size: "3.4 MB",
    folderId: 4,
    isFavorite: false,
    isShared: false,
    isLocked: false,
    isArchived: false,
    isDeleted: false,
    tags: ["banner", "marketing", "assets"],
    category: "Creative Assets",
    createdAt: "2026-07-11T11:00:00Z",
    updatedAt: "2026-07-11T11:00:00Z",
    createdBy: "Sophia AI (Sales Pro)",
    currentVersion: 1,
    versions: [
      { version: 1, fileName: "Exshopi-Product-Banner.png", size: "3.4 MB", uploadedAt: "2026-07-11T11:00:00Z", uploadedBy: "Sophia AI (Sales Pro)", changeLog: "Uploaded high-res visual banner" }
    ],
    comments: [],
    activities: [],
    permissions: [],
    content: "[IMAGE METADATA: 1920x1080 SVG Export, Slate Indigo Theme, Centered Logo 'EXSHOPI AI - The World's AI Workforce', Tech Grid Background]"
  }
];

// Helper for Gemini AI client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI in documents.ts:", err);
    return null;
  }
};

// 1. GET ALL DOCUMENTS (with search, tags, folder filters)
documentsRouter.get("/", (req: Request, res: Response) => {
  const { folderId, tag, isFavorite, isShared, isDeleted, isArchived, search } = req.query;

  let filteredDocs = documents;

  // Handles logical states first
  if (isDeleted === "true") {
    filteredDocs = filteredDocs.filter(d => d.isDeleted);
  } else {
    filteredDocs = filteredDocs.filter(d => !d.isDeleted);

    if (isArchived === "true") {
      filteredDocs = filteredDocs.filter(d => d.isArchived);
    } else {
      filteredDocs = filteredDocs.filter(d => !d.isArchived);
    }

    if (folderId) {
      if (folderId === "root") {
        filteredDocs = filteredDocs.filter(d => d.folderId === null);
      } else {
        filteredDocs = filteredDocs.filter(d => d.folderId === parseInt(folderId as string));
      }
    }

    if (isFavorite === "true") {
      filteredDocs = filteredDocs.filter(d => d.isFavorite);
    }

    if (isShared === "true") {
      filteredDocs = filteredDocs.filter(d => d.isShared);
    }

    if (tag) {
      filteredDocs = filteredDocs.filter(d => d.tags.includes(tag as string));
    }
  }

  if (search) {
    const q = (search as string).toLowerCase();
    filteredDocs = filteredDocs.filter(d => 
      d.name.toLowerCase().includes(q) || 
      (d.content && d.content.toLowerCase().includes(q)) ||
      d.category.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, data: filteredDocs });
});

// 2. GET ALL FOLDERS
documentsRouter.get("/folders", (req: Request, res: Response) => {
  const { parentId, isFavorite } = req.query;
  let filteredFolders = folders;

  if (parentId) {
    if (parentId === "root") {
      filteredFolders = filteredFolders.filter(f => f.parentId === null);
    } else {
      filteredFolders = filteredFolders.filter(f => f.parentId === parseInt(parentId as string));
    }
  }

  if (isFavorite === "true") {
    filteredFolders = filteredFolders.filter(f => f.isFavorite);
  }

  res.json({ success: true, data: filteredFolders });
});

// 3. POST - CREATE FOLDER
documentsRouter.post("/folders", (req: Request, res: Response) => {
  const { name, parentId } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "Folder name is required" });

  const newFolder: FolderItem = {
    id: folders.length + 1,
    name,
    parentId: parentId ? parseInt(parentId) : null,
    createdAt: new Date().toISOString(),
    createdBy: "Ahsan Haji",
    isFavorite: false
  };

  folders.push(newFolder);
  res.json({ success: true, data: newFolder });
});

// 4. POST - UPLOAD/CREATE DOCUMENT
documentsRouter.post("/upload", (req: Request, res: Response) => {
  const { name, type, size, folderId, category, content, tags } = req.body;
  if (!name || !type) {
    return res.status(400).json({ success: false, message: "Document name and type are required" });
  }

  const tagList = Array.isArray(tags) ? tags : (tags ? (tags as string).split(",").map(t => t.trim()) : []);

  const newDoc: DocumentItem = {
    id: documents.length + 1,
    name,
    type,
    size: size || "100 KB",
    folderId: folderId ? parseInt(folderId) : null,
    isFavorite: false,
    isShared: false,
    isLocked: false,
    isArchived: false,
    isDeleted: false,
    tags: tagList,
    category: category || "General",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "Ahsan Haji",
    currentVersion: 1,
    versions: [
      {
        version: 1,
        fileName: name,
        size: size || "100 KB",
        uploadedAt: new Date().toISOString(),
        uploadedBy: "Ahsan Haji",
        changeLog: "Initial upload via DMS Portal"
      }
    ],
    comments: [],
    activities: [
      { id: 1, user: "Ahsan Haji", action: "Created Document", timestamp: new Date().toISOString() }
    ],
    permissions: [
      { userId: "u1", fullName: "Ahsan Haji", role: "owner" }
    ],
    content: content || `This is an auto-generated mock content for ${name} files. Built on the Exshopi sandbox environment.`
  };

  documents.push(newDoc);
  res.status(201).json({ success: true, data: newDoc });
});

// 5. GET DOCUMENT STATS (Charts data)
documentsRouter.get("/stats", (req: Request, res: Response) => {
  const totalDocs = documents.filter(d => !d.isDeleted).length;
  const storageSum = documents.filter(d => !d.isDeleted).reduce((acc, d) => {
    const val = parseFloat(d.size);
    return acc + (isNaN(val) ? 0.1 : val);
  }, 0);

  // Growth / Upload rate trends
  const uploadTrends = [
    { month: "Feb", files: 12, storage: 15.2 },
    { month: "Mar", files: 18, storage: 21.4 },
    { month: "Apr", files: 25, storage: 32.8 },
    { month: "May", files: 34, storage: 45.1 },
    { month: "Jun", files: 45, storage: 62.4 },
    { month: "Jul", files: totalDocs + 40, storage: Math.round((storageSum + 80) * 10) / 10 }
  ];

  const categoryShare = [
    { name: "Legal", value: documents.filter(d => d.category.includes("Legal") || d.tags.includes("legal")).length || 1 },
    { name: "Financials", value: documents.filter(d => d.category.includes("Financial") || d.tags.includes("pricing")).length || 1 },
    { name: "SOPs & Guides", value: documents.filter(d => d.category.includes("SOP") || d.category.includes("Standard") || d.tags.includes("training")).length || 1 },
    { name: "Creative Assets", value: documents.filter(d => d.category.includes("Creative") || d.tags.includes("marketing")).length || 1 },
    { name: "General", value: 3 }
  ];

  res.json({
    success: true,
    data: {
      totalDocuments: totalDocs,
      totalStorage: `${Math.round(storageSum * 10) / 10} MB`,
      totalFolders: folders.length,
      averageVersions: 1.4,
      uploadTrends,
      categoryShare
    }
  });
});

// 6. GET DOCUMENT DETAILS BY ID
documentsRouter.get("/:id", (req: Request, res: Response) => {
  const doc = documents.find(d => d.id === parseInt(req.params.id));
  if (!doc) return res.status(404).json({ success: false, message: "Document not found" });
  res.json({ success: true, data: doc });
});

// 7. PUT - UPDATE DOCUMENT (Rename, move, categories)
documentsRouter.put("/:id", (req: Request, res: Response) => {
  const docId = parseInt(req.params.id);
  const docIdx = documents.findIndex(d => d.id === docId);
  if (docIdx === -1) return res.status(404).json({ success: false, message: "Document not found" });

  const current = documents[docIdx];
  const { name, folderId, category, tags, isFavorite, isArchived } = req.body;

  const updated: DocumentItem = {
    ...current,
    name: name !== undefined ? name : current.name,
    folderId: folderId !== undefined ? (folderId === null ? null : parseInt(folderId)) : current.folderId,
    category: category !== undefined ? category : current.category,
    tags: tags !== undefined ? (Array.isArray(tags) ? tags : tags.split(",").map((t: string) => t.trim())) : current.tags,
    isFavorite: isFavorite !== undefined ? isFavorite : current.isFavorite,
    isArchived: isArchived !== undefined ? isArchived : current.isArchived,
    updatedAt: new Date().toISOString()
  };

  if (name && name !== current.name) {
    updated.activities.push({
      id: updated.activities.length + 1,
      user: "Ahsan Haji",
      action: `Renamed file from "${current.name}" to "${name}"`,
      timestamp: new Date().toISOString()
    });
  }

  if (folderId !== undefined && folderId !== current.folderId) {
    const fName = folderId === null ? "Root" : (folders.find(f => f.id === parseInt(folderId))?.name || "another folder");
    updated.activities.push({
      id: updated.activities.length + 1,
      user: "Ahsan Haji",
      action: `Moved file to "${fName}"`,
      timestamp: new Date().toISOString()
    });
  }

  documents[docIdx] = updated;
  res.json({ success: true, data: updated });
});

// 8. POST - UPLOAD NEW VERSION
documentsRouter.post("/:id/versions", (req: Request, res: Response) => {
  const docId = parseInt(req.params.id);
  const docIdx = documents.findIndex(d => d.id === docId);
  if (docIdx === -1) return res.status(404).json({ success: false, message: "Document not found" });

  const current = documents[docIdx];
  const { fileName, size, changeLog, content } = req.body;

  const nextVer = current.currentVersion + 1;
  const newVer: DocVersion = {
    version: nextVer,
    fileName: fileName || current.name,
    size: size || current.size,
    uploadedAt: new Date().toISOString(),
    uploadedBy: "Ahsan Haji",
    changeLog: changeLog || `Uploaded version ${nextVer}`
  };

  const updated: DocumentItem = {
    ...current,
    currentVersion: nextVer,
    name: fileName || current.name,
    size: size || current.size,
    versions: [...current.versions, newVer],
    updatedAt: new Date().toISOString(),
    content: content || current.content
  };

  updated.activities.push({
    id: updated.activities.length + 1,
    user: "Ahsan Haji",
    action: `Uploaded Version ${nextVer} - ${newVer.changeLog}`,
    timestamp: new Date().toISOString()
  });

  documents[docIdx] = updated;
  res.json({ success: true, data: updated });
});

// 9. DELETE DOCUMENT (or move to recycle bin)
documentsRouter.delete("/:id", (req: Request, res: Response) => {
  const docId = parseInt(req.params.id);
  const docIdx = documents.findIndex(d => d.id === docId);
  if (docIdx === -1) return res.status(404).json({ success: false, message: "Document not found" });

  const current = documents[docIdx];

  if (current.isDeleted) {
    // Permanent deletion
    documents.splice(docIdx, 1);
    res.json({ success: true, message: "Document permanently deleted" });
  } else {
    // Soft delete / Move to recycle bin
    current.isDeleted = true;
    current.activities.push({
      id: current.activities.length + 1,
      user: "Ahsan Haji",
      action: "Moved to Recycle Bin",
      timestamp: new Date().toISOString()
    });
    res.json({ success: true, data: current });
  }
});

// 10. POST - RESTORE FROM RECYCLE BIN
documentsRouter.post("/:id/restore", (req: Request, res: Response) => {
  const docId = parseInt(req.params.id);
  const docIdx = documents.findIndex(d => d.id === docId);
  if (docIdx === -1) return res.status(404).json({ success: false, message: "Document not found" });

  const current = documents[docIdx];
  current.isDeleted = false;
  current.activities.push({
    id: current.activities.length + 1,
    user: "Ahsan Haji",
    action: "Restored from Recycle Bin",
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, data: current });
});

// 11. POST - ADD COMMENTS
documentsRouter.post("/:id/comments", (req: Request, res: Response) => {
  const docId = parseInt(req.params.id);
  const docIdx = documents.findIndex(d => d.id === docId);
  if (docIdx === -1) return res.status(404).json({ success: false, message: "Document not found" });

  const { text } = req.body;
  if (!text) return res.status(400).json({ success: false, message: "Comment content is required" });

  const current = documents[docIdx];
  const newComment: DocComment = {
    id: current.comments.length + 1,
    user: "Ahsan Haji",
    text,
    createdAt: new Date().toISOString()
  };

  current.comments.push(newComment);
  current.activities.push({
    id: current.activities.length + 1,
    user: "Ahsan Haji",
    action: `Added a comment: "${text.substring(0, 30)}..."`,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, data: current });
});

// 12. POST - LOCK/UNLOCK DOCUMENT
documentsRouter.post("/:id/lock", (req: Request, res: Response) => {
  const docId = parseInt(req.params.id);
  const docIdx = documents.findIndex(d => d.id === docId);
  if (docIdx === -1) return res.status(404).json({ success: false, message: "Document not found" });

  const current = documents[docIdx];
  current.isLocked = !current.isLocked;
  current.activities.push({
    id: current.activities.length + 1,
    user: "Ahsan Haji",
    action: current.isLocked ? "Locked Document" : "Unlocked Document",
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, data: current });
});

// 13. POST - SHARE & ACCESS PERMISSIONS
documentsRouter.post("/:id/permissions", (req: Request, res: Response) => {
  const docId = parseInt(req.params.id);
  const docIdx = documents.findIndex(d => d.id === docId);
  if (docIdx === -1) return res.status(404).json({ success: false, message: "Document not found" });

  const { fullName, role } = req.body;
  if (!fullName || !role) {
    return res.status(400).json({ success: false, message: "Full Name and Role are required" });
  }

  const current = documents[docIdx];
  const newPermission: DocPermission = {
    userId: `u-${Math.floor(Math.random() * 1000)}`,
    fullName,
    role
  };

  current.permissions.push(newPermission);
  current.isShared = true;
  current.activities.push({
    id: current.activities.length + 1,
    user: "Ahsan Haji",
    action: `Shared with ${fullName} as ${role}`,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, data: current });
});

// 14. POST - AI DOCUMENT DIRECTOR (Summaries, Translation, OCR, Sentiment, Contract, Q&A)
documentsRouter.post("/:id/ai-action", async (req: Request, res: Response) => {
  const docId = parseInt(req.params.id);
  const doc = documents.find(d => d.id === docId);
  if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

  const { action, extraPrompt } = req.body;
  const ai = getGeminiClient();

  // Baseline templates if Gemini is unavailable
  const offlinePayloads: Record<string, string> = {
    summary: `### 🤖 AI Document Summary Brief\n\n- **Document Title**: *${doc.name}*\n- **Key Subject**: Autonomous enterprise operations matching the Exshopi standard.\n- **Primary Takeaways**:\n  1. The document frames SLA standards, pricing metrics, or SOP constraints needed for agent runtime deployments.\n  2. Emphasizes operational efficiency (aiming to increase delivery speed by up to 40% and automate core manual pipelines).\n  3. Assesses core risks, payment gateways, and integration architectures.`,
    ocr: `### 🔍 OCR Vector Text Extraction Results\n\nText scanned successfully from image layout. High-confidence characters parsed below:\n\n\`\`\`text\n${doc.content || "EXSHOPI PORTAL - STANDARD METRICS - SERVICE CORRIDORS READY"}\n\`\`\``,
    sentiment: `### 🎭 Sentiment & Emotion Analysis Report\n\n- **Primary Sentiment**: **Professional / Neutral-Positive** (92% confidence index)\n- **Tone & Mood**: Highly objectives-driven, focused on accountability, enterprise security, and service guarantees.\n- **Emotion Mapping**: Low urgency, high clarity, structured around strict procedural compliance.`,
    risk: `### ⚠️ Contract Risk & Compliance Audit\n\n- **Risk Threshold Index**: **Medium-Low**\n- **Key Audits Detected**:\n  1. *Liability caps*: Third-party logistics (e.g. DHL transit delays) are safely excluded, protecting core system operators from external liabilities.\n  2. *Escalation delays*: Support tickets escalate automatically within 10 minutes, securing customer satisfaction bounds.\n  3. *Payment parameters*: Financial billing settles within 12-hour windows, which may introduce cashflow volatility if not synchronized with enterprise ledger accounts.`,
    entities: `### 🏷️ Intelligent Entity & Metadata Classification\n\n- **Persons**: Ahsan Haji, Sophia AI, Ethan AI\n- **Organizations**: Exshopi AI, Global Tech Corp, DHL, FedEx\n- **Dates**: 2026-07-01, 2026-07-10\n- **Monetary Values**: $0.50/hr, $1.80/hr, 2% of Monthly Billing\n- **Locations**: California, United States, San Francisco`,
    translate: `### 🌐 Translated Document Brief (Spanish)\n\n**Título del Documento**: *${doc.name}*\n\n**Resumen Traducido**:\nEste documento establece el modelo estratégico y las pautas operativas para la fuerza de trabajo de IA de Exshopi. El objetivo principal es expandir la automatización de flujos de trabajo empresariales y garantizar una disponibilidad del 99.99%.`
  };

  if (!ai) {
    if (action === "qa") {
      const ans = `### 💬 AI Agent Response\n\nBased on the document contents of ***${doc.name}***, here is the answer regarding your query: *"**${extraPrompt}**"*\n\n1. The system confirms that all active AI workforce components are registered in local memory indexes.\n2. Invoicing, support escalation thresholds (10-minute triggers), and pricing models (starting at $0.50/hour for basic tiers up to $1.80/hour) are governed by California regulations.\n3. Rebuilding the sandbox will resolve any latency delays you described.`;
      return res.json({ success: true, result: ans });
    }

    const result = offlinePayloads[action] || offlinePayloads.summary;
    return res.json({ success: true, result });
  }

  try {
    let prompt = "";
    if (action === "summary") {
      prompt = `Provide a comprehensive, beautifully written executive summary of the following document. Use bullet points and markdown:\n\n${doc.content}`;
    } else if (action === "translate") {
      prompt = `Translate the following document brief or content into Spanish, retaining its technical and professional tone. Return beautiful markdown:\n\n${doc.content}`;
    } else if (action === "ocr") {
      prompt = `Analyze this raw document content as if you scanned it via OCR. Clean up syntax and return the organized OCR transcript:\n\n${doc.content}`;
    } else if (action === "sentiment") {
      prompt = `Perform a deep sentiment and emotional analysis on this document content. Highlight the general tone and vocabulary style:\n\n${doc.content}`;
    } else if (action === "risk") {
      prompt = `Act as an expert Corporate Legal Auditor. Audit this contract or document for operational risks, compliance gaps, liability issues, or financial exposure. Use markdown:\n\n${doc.content}`;
    } else if (action === "entities") {
      prompt = `Extract all key entities from this document (Names, Locations, Dates, Moneys, Tech Terms, Organizations) and list them under clear categories:\n\n${doc.content}`;
    } else if (action === "qa") {
      prompt = `The user is asking a specific question: "${extraPrompt}" based on the following document context:\n\n${doc.content}\n\nAnswer the question directly, using facts from the context. If facts are not there, provide a highly logical assessment. Use markdown.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the Principal AI Document Management Architect at Exshopi. Your objective is to analyze corporate assets with extreme professional precision."
      }
    });

    res.json({ success: true, result: response.text || "AI returned empty results." });
  } catch (err: any) {
    console.error("Gemini DMS action failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 15. POST - COMPARE TWO DOCUMENTS
documentsRouter.post("/compare", async (req: Request, res: Response) => {
  const { docAId, docBId } = req.body;
  if (!docAId || !docBId) {
    return res.status(400).json({ success: false, message: "Two document IDs are required to compare" });
  }

  const docA = documents.find(d => d.id === parseInt(docAId));
  const docB = documents.find(d => d.id === parseInt(docBId));

  if (!docA || !docB) {
    return res.status(404).json({ success: false, message: "One or both documents not found" });
  }

  const ai = getGeminiClient();

  if (!ai) {
    const fallbackComparison = `### ⚖️ Document Comparison Report\n\nComparing ***${docA.name}*** vs ***${docB.name}***:\n\n- **Aesthetic / Structural Differences**:\n  - *${docA.name}* (Type: ${docA.type.toUpperCase()}, Size: ${docA.size}) serves as a ${docA.category}.\n  - *${docB.name}* (Type: ${docB.type.toUpperCase()}, Size: ${docB.size}) serves as a ${docB.category}.\n- **Content Alignment Analysis**:\n  - Both files support the general Exshopi workforce automation guidelines.\n  - Doc A contains ${docA.content?.length || 0} characters of text focusing on active parameters.\n  - Doc B contains ${docB.content?.length || 0} characters of text focusing on corresponding objectives.\n- **Divergence / Risk Matrix**:\n  - No structural contradictions detected in pricing models or security protocols.\n  - It is highly recommended to merge tags: \`${[...new Set([...docA.tags, ...docB.tags])].join(", ")}\` for cross-indexing.`;
    return res.json({ success: true, result: fallbackComparison });
  }

  try {
    const prompt = `Compare these two corporate documents in detail. Highlight key differences, similarities, version variances, policy deviations, or risk alignments:\n\nDOCUMENT A:\nName: ${docA.name}\nContent: ${docA.content}\n\nDOCUMENT B:\nName: ${docB.name}\nContent: ${docB.content}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the Principal AI Document Auditor. Provide a professional, highly detailed contract and SOP comparison report."
      }
    });

    res.json({ success: true, result: response.text });
  } catch (err: any) {
    console.error("Gemini compare failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
