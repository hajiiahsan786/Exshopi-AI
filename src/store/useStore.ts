import { create } from "zustand";

export interface Message {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  status: number;
  type: "api" | "security" | "websocket";
  payload?: any;
  response?: any;
}

export interface AppState {
  // Theme & Appearance Customization
  theme: "light" | "dark" | "system" | "oled";
  radius: "none" | "sm" | "md" | "lg" | "full";
  spacing: "compact" | "comfortable" | "spacious";
  fontFamily: "sans" | "mono" | "serif";
  accentColor: "indigo" | "violet" | "emerald" | "amber" | "rose" | "slate";
  glassmorphism: boolean;
  
  // Navigation & Shell State
  sidebarOpen: boolean;
  activeView: "dashboard" | "design-system" | "analytics" | "security" | "settings" | "crm" | "hr" | "procurement" | "manufacturing" | "inventory" | "sales" | "finance" | "projects" | "support" | "marketing" | "documents" | "workflows" | "notifications" | "ai-workforce" | "voice-ai" | "marketplace" | "payments" | "logistics";
  currentCompanyId: number;
  currentUserRole: string;
  currentUser: any | null;
  organizations: any[];
  companies: any[];
  roles: any[];

  // Interactive Overlays
  commandPaletteOpen: boolean;
  notificationsOpen: boolean;
  aiPanelOpen: boolean;
  lockScreenLocked: boolean;
  sessionExpired: boolean;

  // Notification Queue
  notifications: Array<{
    id: string;
    title: string;
    description: string;
    type: "info" | "success" | "warning" | "error";
    timestamp: string;
    read: boolean;
  }>;

  // Real-time API & Event Streams
  logs: SystemLog[];
  
  // AI assistant states
  aiMessages: Message[];
  aiModel: string;
  isAiTyping: boolean;

  // Mutations/Setters
  setTheme: (theme: "light" | "dark" | "system" | "oled") => void;
  setRadius: (radius: "none" | "sm" | "md" | "lg" | "full") => void;
  setSpacing: (spacing: "compact" | "comfortable" | "spacious") => void;
  setFontFamily: (fontFamily: "sans" | "mono" | "serif") => void;
  setAccentColor: (accentColor: "indigo" | "violet" | "emerald" | "amber" | "rose" | "slate") => void;
  setGlassmorphism: (enabled: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveView: (view: "dashboard" | "design-system" | "analytics" | "security" | "settings" | "crm" | "hr" | "procurement" | "manufacturing" | "inventory" | "sales" | "finance" | "projects" | "support" | "marketing" | "documents" | "workflows" | "notifications" | "ai-workforce" | "voice-ai" | "marketplace" | "payments" | "logistics") => void;
  setCurrentCompanyId: (id: number) => void;
  setCurrentUserRole: (role: string) => void;
  setCurrentUser: (user: any | null) => void;
  setOrganizations: (orgs: any[]) => void;
  setCompanies: (comps: any[]) => void;
  setRoles: (roles: any[]) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  setAiPanelOpen: (open: boolean) => void;
  setLockScreenLocked: (locked: boolean) => void;
  setSessionExpired: (expired: boolean) => void;
  addNotification: (noti: Omit<AppState["notifications"][0], "id" | "timestamp" | "read">) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  addLog: (log: Omit<SystemLog, "id" | "timestamp">) => void;
  clearLogs: () => void;
  addAiMessage: (msg: Omit<Message, "id" | "timestamp">) => void;
  setAiModel: (model: string) => void;
  setIsAiTyping: (typing: boolean) => void;
  clearAiMessages: () => void;
}

const getLocalStorage = (key: string, defaultValue: any) => {
  if (typeof window !== "undefined") {
    const val = localStorage.getItem(key);
    if (val !== null) {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
  }
  return defaultValue;
};

const setLocalStorage = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  }
};

export const useStore = create<AppState>((set) => ({
  theme: getLocalStorage("ex_theme", "dark") as AppState["theme"],
  radius: getLocalStorage("ex_radius", "lg") as AppState["radius"],
  spacing: getLocalStorage("ex_spacing", "comfortable") as AppState["spacing"],
  fontFamily: getLocalStorage("ex_fontFamily", "sans") as AppState["fontFamily"],
  accentColor: getLocalStorage("ex_accentColor", "indigo") as AppState["accentColor"],
  glassmorphism: getLocalStorage("ex_glassmorphism", true) === "true" || getLocalStorage("ex_glassmorphism", true) === true,
  sidebarOpen: true,
  activeView: "dashboard",
  currentCompanyId: 1,
  currentUserRole: "Enterprise Admin",
  currentUser: null,
  organizations: [],
  companies: [],
  roles: [],
  commandPaletteOpen: false,
  notificationsOpen: false,
  aiPanelOpen: false,
  lockScreenLocked: false,
  sessionExpired: false,
  notifications: [
    {
      id: "noti-1",
      title: "Security Threat Blocked",
      description: "Anomaly detector locked a brute-force login pattern from IP 194.22.10.88.",
      type: "error",
      timestamp: "Just now",
      read: false
    },
    {
      id: "noti-2",
      title: "Daily Settlement Cleared",
      description: "Reconciliation run completed successfully. Net $432,544 USD moved to primary reserve accounts.",
      type: "success",
      timestamp: "10 mins ago",
      read: false
    },
    {
      id: "noti-3",
      title: "Logistics Optimization Job Completed",
      description: "Genetic Route TSP solver saved 14.5% overall transit fuel budget across 12 vehicles.",
      type: "success",
      timestamp: "1 hr ago",
      read: true
    }
  ],
  logs: [
    {
      id: "log-initial",
      timestamp: new Date().toLocaleTimeString(),
      method: "SYSTEM",
      endpoint: "Exshopi AI Enterprise Frontend Foundation Init",
      status: 200,
      type: "security",
      response: { status: "ready", integrity: "verified", auditCheck: "SOC-2 Map Complete" }
    }
  ],
  aiMessages: [
    {
      id: "ai-initial",
      sender: "ai",
      content: "Hello Ahsan, I am your unified Exshopi AI Department Advisor. I have context over your Payments gateway, Warehouse logistics, BI Reports, and active Security session parameters. How can I help optimize your automated workforce operations today?",
      timestamp: new Date().toLocaleTimeString()
    }
  ],
  aiModel: "gemini-2.5-flash",
  isAiTyping: false,

  setTheme: (theme) => { set({ theme }); setLocalStorage("ex_theme", theme); },
  setRadius: (radius) => { set({ radius }); setLocalStorage("ex_radius", radius); },
  setSpacing: (spacing) => { set({ spacing }); setLocalStorage("ex_spacing", spacing); },
  setFontFamily: (fontFamily) => { set({ fontFamily }); setLocalStorage("ex_fontFamily", fontFamily); },
  setAccentColor: (accentColor) => { set({ accentColor }); setLocalStorage("ex_accentColor", accentColor); },
  setGlassmorphism: (glassmorphism) => { set({ glassmorphism }); setLocalStorage("ex_glassmorphism", glassmorphism); },
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setActiveView: (activeView) => set({ activeView }),
  setCurrentCompanyId: (currentCompanyId) => set({ currentCompanyId }),
  setCurrentUserRole: (currentUserRole) => set({ currentUserRole }),
  setCurrentUser: (currentUser) => set({ currentUser }),
  setOrganizations: (organizations) => set({ organizations }),
  setCompanies: (companies) => set({ companies }),
  setRoles: (roles) => set({ roles }),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  setNotificationsOpen: (notificationsOpen) => set({ notificationsOpen }),
  setAiPanelOpen: (aiPanelOpen) => set({ aiPanelOpen }),
  setLockScreenLocked: (lockScreenLocked) => set({ lockScreenLocked }),
  setSessionExpired: (sessionExpired) => set({ sessionExpired }),
  addNotification: (noti) => set((state) => ({
    notifications: [
      {
        ...noti,
        id: `noti-${Math.random().toString(36).substring(7)}`,
        timestamp: new Date().toLocaleTimeString(),
        read: false
      },
      ...state.notifications
    ]
  })),
  markNotificationAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
  })),
  clearNotifications: () => set({ notifications: [] }),
  addLog: (log) => set((state) => ({
    logs: [
      {
        ...log,
        id: `log-${Math.random().toString(36).substring(7)}`,
        timestamp: new Date().toLocaleTimeString()
      },
      ...state.logs
    ].slice(0, 50)
  })),
  clearLogs: () => set({ logs: [] }),
  addAiMessage: (msg) => set((state) => ({
    aiMessages: [
      ...state.aiMessages,
      {
        ...msg,
        id: `msg-${Math.random().toString(36).substring(7)}`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]
  })),
  setAiModel: (aiModel) => set({ aiModel }),
  setIsAiTyping: (isAiTyping) => set({ isAiTyping }),
  clearAiMessages: () => set({ aiMessages: [] })
}));
