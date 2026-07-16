import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Folder, File, FileText, Upload, Plus, Search, Star, 
  Share2, Lock, Unlock, Archive, Trash2, Eye, Download, 
  MoreVertical, Calendar, User, Tag, Layers, RefreshCw, 
  Sparkles, MessageSquare, Send, Check, Shield, AlertTriangle, 
  PlusCircle, FolderPlus, ArrowLeft, BarChart2, CheckCircle2, 
  Scale, MessageCircle, HelpCircle, FileSpreadsheet, Play, X
} from "lucide-react";
import { Button, Card, Input, Textarea, Select, Badge, Dialog, Switch } from "./UI";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

// TypeScript Interfaces matches backend structures
interface DocPermission {
  userId: string;
  fullName: string;
  role: "viewer" | "editor" | "owner";
}

interface DocVersion {
  version: number;
  fileName: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  changeLog: string;
}

interface DocComment {
  id: number;
  user: string;
  text: string;
  createdAt: string;
}

interface DocActivity {
  id: number;
  user: string;
  action: string;
  timestamp: string;
}

interface DocumentItem {
  id: number;
  name: string;
  type: string;
  size: string;
  folderId: number | null;
  isFavorite: boolean;
  isShared: boolean;
  isLocked: boolean;
  isArchived: boolean;
  isDeleted: boolean;
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
  content?: string;
}

interface FolderItem {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: string;
  createdBy: string;
  isFavorite: boolean;
}

interface DMSStats {
  totalDocuments: number;
  totalStorage: string;
  totalFolders: number;
  averageVersions: number;
  uploadTrends: any[];
  categoryShare: any[];
}

export default function EnterpriseDocuments() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "explorer" | "recent" | "favorites" | "shared" | "archive" | "trash" | "compare">("dashboard");

  // Core Data State
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [stats, setStats] = useState<DMSStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Explorer Navigation
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Details Panel State
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [shareName, setShareName] = useState("");
  const [shareRole, setShareRole] = useState<"viewer" | "editor">("viewer");

  // AI Dialog/Actions
  const [aiAction, setAiAction] = useState<"summary" | "translate" | "ocr" | "sentiment" | "risk" | "entities" | "qa">("summary");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiRunning, setAiRunning] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  // Document Comparison Screen
  const [docAId, setDocAId] = useState<string>("");
  const [docBId, setDocBId] = useState<string>("");
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [comparing, setComparing] = useState(false);

  // Upload/Create Forms
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState("pdf");
  const [newDocSize, setNewDocSize] = useState("1.2 MB");
  const [newDocCategory, setNewDocCategory] = useState("Contracts & Legal");
  const [newDocTags, setNewDocTags] = useState("");
  const [newDocContent, setNewDocContent] = useState("");

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const COLORS = ["#6366f1", "#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"];

  // Load everything
  useEffect(() => {
    fetchData();
  }, [activeTab, currentFolderId, searchQuery, selectedTag]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await fetch("/api/v1/documents/stats");
      const statsJson = await statsRes.json();
      if (statsJson.success) setStats(statsJson.data);

      // Fetch folders
      const folderParams = new URLSearchParams();
      if (currentFolderId !== null) folderParams.append("parentId", currentFolderId.toString());
      else if (activeTab === "explorer") folderParams.append("parentId", "root");
      
      const foldersRes = await fetch(`/api/v1/documents/folders?${folderParams.toString()}`);
      const foldersJson = await foldersRes.json();
      if (foldersJson.success) setFolders(foldersJson.data);

      // Fetch documents
      const docParams = new URLSearchParams();
      if (activeTab === "trash") docParams.append("isDeleted", "true");
      if (activeTab === "archive") docParams.append("isArchived", "true");
      if (activeTab === "favorites") docParams.append("isFavorite", "true");
      if (activeTab === "shared") docParams.append("isShared", "true");
      if (activeTab === "explorer" && currentFolderId !== null) docParams.append("folderId", currentFolderId.toString());
      if (activeTab === "explorer" && currentFolderId === null) docParams.append("folderId", "root");
      if (searchQuery) docParams.append("search", searchQuery);
      if (selectedTag) docParams.append("tag", selectedTag);

      const docsRes = await fetch(`/api/v1/documents?${docParams.toString()}`);
      const docsJson = await docsRes.json();
      if (docsJson.success) {
        let docs = docsJson.data;
        if (activeTab === "recent") {
          docs = [...docs].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        setDocuments(docs);
      }
    } catch (e) {
      console.error("DMS failed loading state:", e);
    } finally {
      setLoading(false);
    }
  };

  // Create Folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const res = await fetch("/api/v1/documents/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName,
          parentId: currentFolderId
        })
      });
      if (res.ok) {
        setNewFolderName("");
        setCreateFolderOpen(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Upload/Create Document
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    try {
      const res = await fetch("/api/v1/documents/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDocName,
          type: newDocType,
          size: newDocSize,
          category: newDocCategory,
          content: newDocContent,
          tags: newDocTags,
          folderId: currentFolderId
        })
      });
      if (res.ok) {
        setNewDocName("");
        setNewDocContent("");
        setNewDocTags("");
        setUploadOpen(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Lock/Unlock Document
  const handleToggleLock = async (docId: number) => {
    try {
      const res = await fetch(`/api/v1/documents/${docId}/lock`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setSelectedDoc(json.data);
        setDocuments(prev => prev.map(d => d.id === docId ? json.data : d));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Favorite toggle
  const handleToggleFavorite = async (doc: DocumentItem) => {
    try {
      const res = await fetch(`/api/v1/documents/${doc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !doc.isFavorite })
      });
      const json = await res.json();
      if (json.success) {
        if (selectedDoc?.id === doc.id) setSelectedDoc(json.data);
        setDocuments(prev => prev.map(d => d.id === doc.id ? json.data : d));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Archive toggle
  const handleToggleArchive = async (doc: DocumentItem) => {
    try {
      const res = await fetch(`/api/v1/documents/${doc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: !doc.isArchived })
      });
      const json = await res.json();
      if (json.success) {
        if (selectedDoc?.id === doc.id) setSelectedDoc(json.data);
        setDocuments(prev => prev.filter(d => d.id !== doc.id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete/Recycle action
  const handleDeleteDocument = async (doc: DocumentItem) => {
    try {
      const res = await fetch(`/api/v1/documents/${doc.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setSelectedDoc(null);
        setDocuments(prev => prev.filter(d => d.id !== doc.id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Restore action
  const handleRestoreDocument = async (docId: number) => {
    try {
      const res = await fetch(`/api/v1/documents/${docId}/restore`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add Comment submit
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedDoc) return;
    try {
      const res = await fetch(`/api/v1/documents/${selectedDoc.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newCommentText })
      });
      const json = await res.json();
      if (json.success) {
        setSelectedDoc(json.data);
        setNewCommentText("");
        setDocuments(prev => prev.map(d => d.id === selectedDoc.id ? json.data : d));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Manage Permissions
  const handleAddPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareName.trim() || !selectedDoc) return;
    try {
      const res = await fetch(`/api/v1/documents/${selectedDoc.id}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: shareName, role: shareRole })
      });
      const json = await res.json();
      if (json.success) {
        setSelectedDoc(json.data);
        setShareName("");
        setDocuments(prev => prev.map(d => d.id === selectedDoc.id ? json.data : d));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Run AI action (OCR, Summary, translate, etc)
  const handleAIAction = async () => {
    if (!selectedDoc) return;
    try {
      setAiRunning(true);
      setAiResult(null);
      const res = await fetch(`/api/v1/documents/${selectedDoc.id}/ai-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: aiAction, extraPrompt: aiPrompt })
      });
      const json = await res.json();
      if (json.success) {
        setAiResult(json.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiRunning(false);
    }
  };

  // Run comparison
  const handleCompare = async () => {
    if (!docAId || !docBId) return;
    try {
      setComparing(true);
      setComparisonResult(null);
      const res = await fetch("/api/v1/documents/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docAId, docBId })
      });
      const json = await res.json();
      if (json.success) {
        setComparisonResult(json.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setComparing(false);
    }
  };

  // Icon mapping helpers based on document type
  const getFileIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === "pdf") return <FileText className="h-5 w-5 text-rose-500" />;
    if (t === "xlsx" || t === "csv") return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
    if (t === "png" || t === "jpg") return <File className="h-5 w-5 text-blue-500" />;
    if (t === "md" || t === "txt") return <FileText className="h-5 w-5 text-indigo-400" />;
    return <File className="h-5 w-5 text-zinc-400" />;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 font-sans">
      {/* Dynamic Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-zinc-900 gap-4 bg-zinc-900/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-950/40 border border-indigo-900/30 rounded-lg text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Enterprise Document Cloud</h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">Durable storage, Version Control & OCR Copilot</p>
            </div>
          </div>
        </div>

        {/* Modular Navigation Tabs */}
        <div className="flex flex-wrap bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80 gap-0.5">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "explorer", label: "Files & Folders" },
            { id: "recent", label: "Recent" },
            { id: "favorites", label: "Favorites" },
            { id: "shared", label: "Shared" },
            { id: "archive", label: "Archive" },
            { id: "compare", label: "Comparator" },
            { id: "trash", label: "Trash" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedDoc(null);
                setComparisonResult(null);
              }}
              className={`px-3 py-1.5 text-2xs font-semibold rounded-lg transition-all ${
                activeTab === tab.id ? "bg-indigo-600 text-white shadow-md" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Container */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-28 bg-zinc-900 border border-zinc-800 rounded-xl" />
                ))}
              </div>
            ) : stats ? (
              <>
                {/* Stats Summary Panel */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-4xs font-mono text-zinc-500 uppercase tracking-wider">Total Documents</p>
                      <h3 className="text-3xl font-extrabold text-white mt-1">{stats.totalDocuments}</h3>
                      <p className="text-3xs text-indigo-400 font-semibold mt-1">
                        Across {stats.totalFolders} active folders
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center text-indigo-400">
                      <FileText className="h-5 w-5" />
                    </div>
                  </Card>

                  <Card className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-4xs font-mono text-zinc-500 uppercase tracking-wider">Cloud Storage Size</p>
                      <h3 className="text-3xl font-extrabold text-white mt-1">{stats.totalStorage}</h3>
                      <p className="text-3xs text-emerald-400 font-semibold mt-1">
                        99.9% availability index
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-emerald-950/40 border border-emerald-900/30 flex items-center justify-center text-emerald-400">
                      <Layers className="h-5 w-5" />
                    </div>
                  </Card>

                  <Card className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-4xs font-mono text-zinc-500 uppercase tracking-wider">Average Version Depth</p>
                      <h3 className="text-3xl font-extrabold text-white mt-1">{stats.averageVersions}x</h3>
                      <p className="text-3xs text-zinc-500 mt-1">Full audit trails active</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                      <RefreshCw className="h-5 w-5" />
                    </div>
                  </Card>

                  <Card className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-4xs font-mono text-zinc-500 uppercase tracking-wider">Protected Documents</p>
                      <h3 className="text-3xl font-extrabold text-white mt-1">100%</h3>
                      <p className="text-3xs text-indigo-400 font-semibold mt-1">Locked and shared securely</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center text-indigo-400">
                      <Shield className="h-5 w-5" />
                    </div>
                  </Card>
                </div>

                {/* AI Document Brief Banner */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-xl border border-indigo-500/20 bg-indigo-950/10 flex flex-col md:flex-row gap-4 items-start md:items-center text-left"
                >
                  <div className="p-2 bg-indigo-950 border border-indigo-500/30 text-indigo-400 rounded-lg shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white font-mono">DMS AI Assistant Brief</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      All strategic PDFs, XLS models, and SOP guides are indexed. You can use Spanish Translation, entity extraction, sentiment analysis, and risk audits on any file via the details inspector.
                    </p>
                  </div>
                </motion.div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Upload and Storage trends area chart */}
                  <Card className="lg:col-span-8 p-5 text-left">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 mb-4 font-mono">
                      <BarChart2 className="h-4 w-4" /> Cloud Storage Utilization & Files Uploaded
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.uploadTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorFiles" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorStorage" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                          <XAxis dataKey="month" stroke="#71717a" style={{ fontSize: 10 }} />
                          <YAxis stroke="#71717a" style={{ fontSize: 10 }} />
                          <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", color: "#f4f4f5" }} />
                          <Area type="monotone" dataKey="files" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorFiles)" name="Files" />
                          <Area type="monotone" dataKey="storage" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorStorage)" name="Storage (MB)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Share pie chart */}
                  <Card className="lg:col-span-4 p-5 text-left flex flex-col justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 mb-4 font-mono">
                      <Layers className="h-4 w-4" /> Categories
                    </h3>
                    <div className="h-48 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.categoryShare}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {stats.categoryShare.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", color: "#f4f4f5" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-1.5">
                      {stats.categoryShare.map((entry, index) => (
                        <div key={index} className="flex justify-between items-center text-xs font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-zinc-400">{entry.name}</span>
                          </div>
                          <span className="text-white font-bold">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* TAB 2, 3, 4, 5, 6, 8: EXPLORER AND FILTERED VIEWS */}
        {activeTab !== "dashboard" && activeTab !== "compare" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
            
            {/* Left explorer list */}
            <div className={`lg:col-span-8 flex flex-col gap-4 ${selectedDoc ? "hidden lg:flex" : ""}`}>
              
              {/* Header inside view */}
              <Card className="p-4 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    {currentFolderId !== null && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<ArrowLeft className="h-4 w-4" />}
                        onClick={() => setCurrentFolderId(null)}
                      >
                        Back to Root
                      </Button>
                    )}
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono">
                      {activeTab === "explorer" ? "Folder Explorer" : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Files`}
                    </h3>
                  </div>

                  {activeTab === "explorer" && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<FolderPlus className="h-4 w-4" />}
                        onClick={() => setCreateFolderOpen(true)}
                      >
                        New Folder
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Upload className="h-4 w-4" />}
                        onClick={() => setUploadOpen(true)}
                      >
                        Upload Document
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search document name or content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500/50 outline-none rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-100 font-sans"
                    />
                  </div>
                  <Select
                    value={selectedTag || "all"}
                    onChange={(e) => setSelectedTag(e.target.value === "all" ? null : e.target.value)}
                    options={[
                      { value: "all", label: "All Tags" },
                      { value: "strategic", label: "Strategic" },
                      { value: "contracts", label: "Contracts" },
                      { value: "financials", label: "Financials" },
                      { value: "training", label: "SOPs" },
                      { value: "marketing", label: "Marketing" }
                    ]}
                  />
                </div>
              </Card>

              {/* Folders List (Explorer Tab only) */}
              {activeTab === "explorer" && folders.length > 0 && (
                <div className="flex flex-col gap-2 text-left">
                  <span className="text-4xs font-mono text-zinc-500 uppercase tracking-widest pl-1">Folders</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {folders.map(folder => (
                      <div
                        key={folder.id}
                        onClick={() => setCurrentFolderId(folder.id)}
                        className="p-3.5 bg-zinc-900 border border-zinc-850 hover:border-zinc-700/80 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Folder className="h-5 w-5 text-indigo-400 fill-indigo-400/10 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-white truncate max-w-[140px]">{folder.name}</p>
                            <p className="text-4xs font-mono text-zinc-500 mt-0.5">By {folder.createdBy.split(" ")[0]}</p>
                          </div>
                        </div>
                        <Star className={`h-3.5 w-3.5 ${folder.isFavorite ? "text-amber-400 fill-amber-400/20" : "text-zinc-600"}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents Grid / List */}
              <div className="flex flex-col gap-2.5 text-left">
                <div className="flex justify-between items-center pl-1">
                  <span className="text-4xs font-mono text-zinc-500 uppercase tracking-widest">Documents</span>
                  <span className="text-4xs font-mono text-zinc-500">{documents.length} files found</span>
                </div>

                {loading ? (
                  <div className="h-28 bg-zinc-900 border border-zinc-800 animate-pulse rounded-xl" />
                ) : documents.length === 0 ? (
                  <div className="text-center p-16 border border-zinc-850 rounded-xl bg-zinc-900/10 text-zinc-500">
                    <FileText className="h-10 w-10 mx-auto opacity-35 mb-2" />
                    <p className="text-xs font-mono">No Documents Matching Criteria</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {documents.map(doc => {
                      const isSelected = selectedDoc?.id === doc.id;
                      return (
                        <div
                          key={doc.id}
                          onClick={() => {
                            setSelectedDoc(doc);
                            setAiResult(null);
                          }}
                          className={`p-4 border transition-all rounded-xl cursor-pointer flex flex-col justify-between ${
                            isSelected 
                              ? "bg-indigo-950/20 border-indigo-500/80 shadow" 
                              : "bg-zinc-900 border-zinc-850 hover:border-zinc-700/80"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-center gap-2.5">
                                {getFileIcon(doc.type)}
                                <div>
                                  <h4 className="text-xs font-bold text-white truncate max-w-[180px]">{doc.name}</h4>
                                  <p className="text-4xs font-mono text-zinc-500 mt-0.5">{doc.category}</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {doc.isLocked && <Lock className="h-3 w-3 text-amber-500" />}
                                {doc.isShared && <Share2 className="h-3 w-3 text-indigo-400" />}
                              </div>
                            </div>

                            <p className="text-3xs text-zinc-400 mt-3 leading-relaxed line-clamp-2 italic font-sans pl-1 border-l-2 border-zinc-800">
                              {doc.content ? `"${doc.content.substring(0, 100)}..."` : "No preview text available."}
                            </p>
                          </div>

                          <div className="flex justify-between items-center mt-4 pt-2.5 border-t border-zinc-950 text-4xs font-mono text-zinc-500">
                            <span>Size: {doc.size}</span>
                            <span>v{doc.currentVersion}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Detailed Inspector Panel */}
            <div className={`lg:col-span-4 flex flex-col gap-4 ${!selectedDoc ? "hidden lg:flex" : ""}`}>
              {selectedDoc ? (
                <div className="flex flex-col gap-4 text-left">
                  <Button 
                    className="self-start lg:hidden" 
                    variant="ghost" 
                    size="sm" 
                    icon={<ArrowLeft className="h-4 w-4" />}
                    onClick={() => setSelectedDoc(null)}
                  >
                    Back to List
                  </Button>

                  <Card className="p-4 flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="neutral">{selectedDoc.type.toUpperCase()}</Badge>
                          <span className="text-4xs text-zinc-500 font-mono">ID #{selectedDoc.id}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1">{selectedDoc.name}</h3>
                        <p className="text-4xs text-zinc-400 font-mono">Category: {selectedDoc.category}</p>
                      </div>

                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2"
                          icon={<Star className={`h-4 w-4 ${selectedDoc.isFavorite ? "text-amber-400 fill-amber-400/20" : "text-zinc-400"}`} />}
                          onClick={() => handleToggleFavorite(selectedDoc)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2"
                          icon={<Archive className={`h-4 w-4 ${selectedDoc.isArchived ? "text-indigo-400" : "text-zinc-400"}`} />}
                          onClick={() => handleToggleArchive(selectedDoc)}
                        />
                        {selectedDoc.isDeleted ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-emerald-400 px-2"
                            icon={<CheckCircle2 className="h-4 w-4" />}
                            onClick={() => handleRestoreDocument(selectedDoc.id)}
                          />
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-400 px-2"
                            icon={<Trash2 className="h-4 w-4" />}
                            onClick={() => handleDeleteDocument(selectedDoc)}
                          />
                        )}
                      </div>
                    </div>

                    {/* Operational Commands */}
                    <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-2 rounded-xl border border-zinc-900">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-3xs flex items-center justify-center gap-1"
                        icon={selectedDoc.isLocked ? <Unlock className="h-3 w-3 text-amber-500" /> : <Lock className="h-3 w-3 text-zinc-400" />}
                        onClick={() => handleToggleLock(selectedDoc.id)}
                      >
                        {selectedDoc.isLocked ? "Unlock Document" : "Lock Document"}
                      </Button>
                      <a
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(selectedDoc.content || "")}`}
                        download={selectedDoc.name}
                        className="text-3xs flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </a>
                    </div>

                    {/* AI Assistant panel */}
                    <div className="p-3 border border-indigo-500/20 bg-indigo-950/15 rounded-xl flex flex-col gap-3">
                      <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-2xs font-mono">
                        <Sparkles className="h-4 w-4" />
                        <span>AI CO-PILOT DIRECTOR</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        <Select
                          value={aiAction}
                          onChange={(e) => {
                            setAiAction(e.target.value as any);
                            setAiResult(null);
                          }}
                          options={[
                            { value: "summary", label: "Summarize Content" },
                            { value: "translate", label: "Translate to Spanish" },
                            { value: "ocr", label: "OCR Scan Format" },
                            { value: "sentiment", label: "Sentiment Index" },
                            { value: "risk", label: "Audit Legal Risks" },
                            { value: "entities", label: "Extract Entities" },
                            { value: "qa", label: "Q&A Custom Chat" }
                          ]}
                        />

                        {aiAction === "qa" && (
                          <Input
                            placeholder="Ask e.g. What are the liability caps?"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                          />
                        )}

                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Sparkles className="h-3 w-3" />}
                          onClick={handleAIAction}
                          loading={aiRunning}
                        >
                          Execute Analysis
                        </Button>
                      </div>

                      {aiResult && (
                        <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg text-4xs leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap font-mono text-zinc-300">
                          {aiResult}
                        </div>
                      )}
                    </div>

                    {/* Tags List */}
                    {selectedDoc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {selectedDoc.tags.map((tag, idx) => (
                          <Badge key={idx} variant="neutral" className="text-4xs uppercase">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Version History */}
                    <div className="flex flex-col gap-2">
                      <span className="text-4xs font-mono uppercase tracking-widest text-zinc-500 border-b border-zinc-900 pb-1">Version History ({selectedDoc.versions.length})</span>
                      <div className="flex flex-col gap-2.5 max-h-36 overflow-y-auto pr-1">
                        {selectedDoc.versions.map((ver, idx) => (
                          <div key={idx} className="flex justify-between items-start text-4xs font-mono p-2 bg-zinc-950 border border-zinc-900 rounded-lg">
                            <div>
                              <p className="text-zinc-300 font-bold">v{ver.version} - {ver.fileName}</p>
                              <p className="text-zinc-500 mt-0.5">{ver.changeLog}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-indigo-400">{ver.size}</p>
                              <p className="text-zinc-600 mt-0.5">{new Date(ver.uploadedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sharing / Permissions */}
                    <div className="flex flex-col gap-2">
                      <span className="text-4xs font-mono uppercase tracking-widest text-zinc-500 border-b border-zinc-900 pb-1">Access Control</span>
                      <div className="flex flex-col gap-2">
                        {selectedDoc.permissions.map((perm, idx) => (
                          <div key={idx} className="flex justify-between items-center text-4xs font-mono p-1 bg-zinc-900/50 rounded">
                            <span className="text-zinc-300">{perm.fullName}</span>
                            <Badge variant={perm.role === "owner" ? "accent" : "neutral"}>
                              {perm.role}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleAddPermission} className="flex gap-1.5 mt-1.5">
                        <input
                          type="text"
                          placeholder="Co-worker full name"
                          value={shareName}
                          onChange={(e) => setShareName(e.target.value)}
                          className="flex-1 bg-zinc-950 border border-zinc-900 outline-none p-1.5 text-4xs rounded font-sans"
                        />
                        <Select
                          value={shareRole}
                          onChange={(e: any) => setShareRole(e.target.value)}
                          className="py-1 text-4xs"
                          options={[
                            { value: "viewer", label: "Viewer" },
                            { value: "editor", label: "Editor" }
                          ]}
                        />
                        <Button variant="outline" size="sm" className="py-1.5 px-2" icon={<Plus className="h-3.5 w-3.5" />} />
                      </form>
                    </div>

                    {/* comments list */}
                    <div className="flex flex-col gap-2 border-t border-zinc-900 pt-3">
                      <span className="text-4xs font-mono uppercase tracking-widest text-zinc-500">Threaded Comments ({selectedDoc.comments.length})</span>
                      <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                        {selectedDoc.comments.map(c => (
                          <div key={c.id} className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg text-4xs">
                            <div className="flex justify-between text-zinc-500 font-mono mb-1">
                              <span className="font-bold text-zinc-300">{c.user}</span>
                              <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-zinc-400 text-left font-sans">{c.text}</p>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleAddComment} className="flex gap-1.5 mt-1.5">
                        <input
                          type="text"
                          placeholder="Type comment (supports @mentions)..."
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          className="flex-1 bg-zinc-950 border border-zinc-900 outline-none p-1.5 text-4xs rounded font-sans"
                        />
                        <Button type="submit" variant="primary" size="sm" className="p-1.5 px-3" icon={<Send className="h-3.5 w-3.5" />} />
                      </form>
                    </div>

                  </Card>
                </div>
              ) : (
                <div className="hidden lg:flex flex-col items-center justify-center h-[500px] border border-dashed border-zinc-850 rounded-xl bg-zinc-900/10 text-zinc-500 text-center p-12">
                  <FileText className="h-10 w-10 opacity-30 mb-2" />
                  <h4 className="text-xs font-bold text-zinc-400 font-mono">DMS Metadata Inspector</h4>
                  <p className="text-3xs text-zinc-600 mt-1 leading-relaxed">
                    Select a document card to manage locked parameters, trigger Spanish translations, download source code or spreadsheet briefs, and collaborate with coworkers.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 7: COMPARE SCREEN */}
        {activeTab === "compare" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
            
            {/* Compare Select Card Left */}
            <Card className="lg:col-span-5 p-5 flex flex-col gap-4">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs font-mono pb-2 border-b border-zinc-900">
                <Scale className="h-4.5 w-4.5" />
                <span>AI CONTRACT COMPARATOR</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Select
                  label="Primary Contract (Document A)"
                  value={docAId}
                  onChange={(e) => setDocAId(e.target.value)}
                  options={[
                    { value: "", label: "Select document..." },
                    ...documents.filter(d => !d.isDeleted).map(d => ({ value: d.id.toString(), label: d.name }))
                  ]}
                />

                <Select
                  label="Secondary Contract (Document B)"
                  value={docBId}
                  onChange={(e) => setDocBId(e.target.value)}
                  options={[
                    { value: "", label: "Select document..." },
                    ...documents.filter(d => !d.isDeleted).map(d => ({ value: d.id.toString(), label: d.name }))
                  ]}
                />
              </div>

              <Button
                variant="primary"
                icon={<Scale className="h-4 w-4" />}
                loading={comparing}
                onClick={handleCompare}
                disabled={!docAId || !docBId}
              >
                Perform Audit Comparison
              </Button>
            </Card>

            {/* Generated Output Card Right */}
            <Card className="lg:col-span-7 p-6 min-h-[400px] flex flex-col justify-between items-stretch">
              {comparing ? (
                <div className="flex flex-col items-center justify-center h-full py-24 text-center">
                  <div className="h-6 w-6 animate-spin border-2 border-indigo-500 border-t-transparent rounded-full mb-3" />
                  <p className="text-xs font-mono text-zinc-400">Comparing vector metadata and clauses between selected contracts...</p>
                </div>
              ) : comparisonResult ? (
                <div className="flex flex-col justify-between h-full items-stretch">
                  <div>
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5 mb-4">
                      <span className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Comparison Audit Generated
                      </span>
                      <Button size="sm" variant="ghost" className="text-4xs font-mono" onClick={() => setComparisonResult(null)}>
                        Clear Output
                      </Button>
                    </div>

                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">
                      {comparisonResult}
                    </div>
                  </div>

                  <p className="text-4xs text-zinc-500 font-mono italic text-center pt-4 border-t border-zinc-900 mt-6">
                    Comparison analysis outputs utilize localized compliance vectors. Validate critical liability claims with human legal personnel.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-zinc-500 text-center">
                  <Scale className="h-10 w-10 opacity-30 mb-2 text-indigo-400" />
                  <p className="text-xs font-mono">DMS AI Comparator Ready</p>
                  <p className="text-4xs text-zinc-600 mt-1 max-w-sm leading-relaxed">
                    Select two documents on the left and run analysis to compare clauses, track version differences, and generate compliance discrepancy briefs.
                  </p>
                </div>
              )}
            </Card>

          </div>
        )}

      </div>

      {/* OVERLAYS & DIALOGS */}
      {/* 1. Create Folder Overlay */}
      <Dialog isOpen={createFolderOpen} onClose={() => setCreateFolderOpen(false)} title="Create New Folder">
        <form onSubmit={handleCreateFolder} className="flex flex-col gap-4 text-left">
          <Input
            label="Folder Name"
            placeholder="e.g. Invoices & Billing"
            required
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <div className="flex justify-end gap-2.5 mt-2">
            <Button variant="ghost" onClick={() => setCreateFolderOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Folder</Button>
          </div>
        </form>
      </Dialog>

      {/* 2. Upload Document Overlay */}
      <Dialog isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Document Workspace">
        <form onSubmit={handleUploadDocument} className="flex flex-col gap-4 text-left">
          <Input
            label="Document Name"
            placeholder="e.g. Q3-Logistics-Agreement.pdf"
            required
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="File Format Type"
              value={newDocType}
              onChange={(e) => setNewDocType(e.target.value)}
              options={[
                { value: "pdf", label: "PDF Format" },
                { value: "docx", label: "Word Document" },
                { value: "xlsx", label: "Excel Sheet" },
                { value: "md", label: "Markdown Text" },
                { value: "json", label: "JSON Data File" },
                { value: "csv", label: "CSV Table" }
              ]}
            />
            <Input
              label="Simulated File Size"
              placeholder="e.g. 1.2 MB"
              value={newDocSize}
              onChange={(e) => setNewDocSize(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Document Classification"
              value={newDocCategory}
              onChange={(e) => setNewDocCategory(e.target.value)}
              options={[
                { value: "Contracts & Legal", label: "Contracts & Legal" },
                { value: "Financial Models", label: "Financial Models" },
                { value: "SOPs & Guides", label: "SOPs & Guides" },
                { value: "Creative Assets", label: "Creative Assets" },
                { value: "General", label: "General" }
              ]}
            />
            <Input
              label="Tags (Comma separated)"
              placeholder="e.g. core, strategy, draft"
              value={newDocTags}
              onChange={(e) => setNewDocTags(e.target.value)}
            />
          </div>

          <Textarea
            label="File Content Transcript (for OCR and Q&A)"
            placeholder="Provide core text paragraphs present inside the file..."
            value={newDocContent}
            onChange={(e) => setNewDocContent(e.target.value)}
          />

          {/* Simulated drag-and-drop region */}
          <div className="border border-dashed border-zinc-800 rounded-xl p-5 bg-zinc-950/40 text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-indigo-500/40 transition-all">
            <Upload className="h-5 w-5 text-indigo-400" />
            <p className="text-4xs text-zinc-400">Drag & Drop real documents to parse OCR parameters instantly</p>
          </div>

          <div className="flex justify-end gap-2.5 mt-2">
            <Button variant="ghost" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Compile & Upload</Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}
