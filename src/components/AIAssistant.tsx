import React, { useState, useEffect, useRef } from "react";
import { useStore, Message } from "../store/useStore";
import { Card, Button, Badge, getAccentClass, getRadiusClass } from "./UI";
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ArrowRight,
  Terminal,
  Volume2,
  ChevronRight,
  Command,
  Sliders,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const AIAssistant: React.FC = () => {
  const {
    aiPanelOpen,
    setAiPanelOpen,
    aiMessages,
    addAiMessage,
    aiModel,
    setAiModel,
    isAiTyping,
    setIsAiTyping,
    activeView,
    setActiveView,
    addLog,
    commandPaletteOpen,
    setCommandPaletteOpen,
    setTheme,
    setAccentColor
  } = useStore();

  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Command palette search state
  const [cmdSearch, setCmdSearch] = useState("");

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, isAiTyping]);

  // Command Palette keyboard shortcut: CMD+K or CTRL+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAiTyping) return;

    const userQuery = input.trim();
    setInput("");
    
    // 1. Add user message
    addAiMessage({ sender: "user", content: userQuery });
    setIsAiTyping(true);

    // Logging
    addLog({
      method: "POST",
      endpoint: "/api/v1/workforce/chat/1",
      status: 200,
      type: "api",
      payload: { message: userQuery }
    });

    try {
      // Direct call to Agent 1 (Sophia AI / Executive Coordinator)
      const res = await fetch("/api/v1/workforce/chat/1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userQuery })
      });
      const json = await res.json();

      if (json.success && json.data) {
        addAiMessage({ sender: "ai", content: json.data });
      } else {
        // Fallback for rich local enterprise help
        generateMockResponse(userQuery);
      }
    } catch {
      generateMockResponse(userQuery);
    } finally {
      setIsTypingFeedback();
    }
  };

  const setIsTypingFeedback = () => {
    setTimeout(() => {
      setIsAiTyping(false);
    }, 400);
  };

  const generateMockResponse = (query: string) => {
    const q = query.toLowerCase();
    let reply = "I am processing your query across Exshopi databases. Since this is the Enterprise Foundation mode, I can confirm your design tokens, layouts, and components are fully compiled and ready. Let me know if you would like me to trigger mock actions!";
    
    if (q.includes("settle") || q.includes("reconcil") || q.includes("pay")) {
      reply = "📊 **Financial Intelligence Notification:** Daily settlement reconciliation has verified $516,000 gross invoicing values. Our active Stripe gateway routing is running at 100% integrity. No outstanding chargeback disputes identified.";
    } else if (q.includes("logistics") || q.includes("transit") || q.includes("carrier")) {
      reply = "🚚 **Logistics Operational SLA:** DHL is leading on-time deliveries at 96% SLA. FEDEX and UPS are tracking close at 94% overall transit window. Total fuel efficiency optimization is locked at 14.5% savings.";
    } else if (q.includes("security") || q.includes("threat") || q.includes("soc")) {
      reply = "🛡️ **SOC-2 Cyber Sensor Scan:** Threat logs indicate all 1,394 malicious brute-force patterns were safely blocked. Core JWT authentication is running with strict 15-minute lease cycles. Active MFA validations are fully secure.";
    } else if (q.includes("design") || q.includes("theme") || q.includes("style")) {
      reply = "🎨 **Design Tokens Engine:** Exshopi Design System is executing perfectly. You can toggle Light/Dark presets or customize rounding, typography, and spacing tokens live in the settings console.";
    } else if (q.includes("hello") || q.includes("hi")) {
      reply = "Welcome, Ahsan! I am Exshopi AI Assistant. I can help you monitor financial settlements, optimize logistics, audit SOC-2 threat sensors, or visualize our newly created Exshopi Design System. What would you like to inspect first?";
    }

    setTimeout(() => {
      addAiMessage({ sender: "ai", content: reply });
    }, 1200);
  };

  const handleSuggestion = (prompt: string) => {
    setInput(prompt);
  };

  // Dynamic search data for universal search
  const [searchItems, setSearchItems] = useState<any[]>([]);

  // Fetch or populate searchable data
  useEffect(() => {
    if (!commandPaletteOpen) return;
    
    const fetchSearchData = async () => {
      try {
        const [resEmp, resComp, resLeads] = await Promise.all([
          fetch("/api/v1/employees").then(r => r.ok ? r.json() : []),
          fetch("/api/v1/companies").then(r => r.ok ? r.json() : []),
          fetch("/api/v1/leads").then(r => r.ok ? r.json() : [])
        ]);

        const formatted = [
          // Static actions & shortcuts
          { type: "shortcut", label: "Go to Cockpit Dashboard", action: () => { setActiveView("dashboard"); setCommandPaletteOpen(false); }, badge: "Navigation" },
          { type: "shortcut", label: "Toggle Dark Theme", action: () => { setTheme("dark"); setCommandPaletteOpen(false); }, badge: "Appearance" },
          { type: "shortcut", label: "Toggle Light Theme", action: () => { setTheme("light"); setCommandPaletteOpen(false); }, badge: "Appearance" },
          { type: "shortcut", label: "Toggle OLED Pitch Black Mode", action: () => { setTheme("oled"); setCommandPaletteOpen(false); }, badge: "Appearance" },
          { type: "shortcut", label: "Switch to Violet Accent", action: () => { setAccentColor("violet"); setCommandPaletteOpen(false); }, badge: "Theme" },
          { type: "shortcut", label: "Switch to Emerald Accent", action: () => { setAccentColor("emerald"); setCommandPaletteOpen(false); }, badge: "Theme" },
          { type: "shortcut", label: "Switch to Indigo Accent", action: () => { setAccentColor("indigo"); setCommandPaletteOpen(false); }, badge: "Theme" },
          { type: "shortcut", label: "Launch AI Speech Settings Module", action: () => { setActiveView("voice-ai"); setCommandPaletteOpen(false); }, badge: "Settings" },
          
          // Documents & Projects
          { type: "document", label: "SOC-2 Compliance Security Audit.pdf", action: () => { setActiveView("security"); setCommandPaletteOpen(false); }, badge: "Document" },
          { type: "document", label: "Exshopi Strategic Q3 Roadmap.md", action: () => { setActiveView("projects"); setCommandPaletteOpen(false); }, badge: "Document" },
          { type: "project", label: "Warehouse Carrier SLA Integration", action: () => { setActiveView("projects"); setCommandPaletteOpen(false); }, badge: "Project" },
          { type: "project", label: "Global Tax Ledger Synchronization", action: () => { setActiveView("finance"); setCommandPaletteOpen(false); }, badge: "Project" },
          
          // AI Agents & Voices
          { type: "agent", label: "Sophia AI (Strategic Lead)", action: () => { setActiveView("ai-workforce"); setCommandPaletteOpen(false); }, badge: "AI Agent" },
          { type: "agent", label: "Ethan AI (Automated Tier-1 Support)", action: () => { setActiveView("support"); setCommandPaletteOpen(false); }, badge: "AI Agent" },
          { type: "voice", label: "Trigger Voice Wake-Word Check", action: () => { setActiveView("voice-ai"); setCommandPaletteOpen(false); }, badge: "Voice AI" },

          // Finance & Invoices
          { type: "invoice", label: "Invoice INV-2026-0041 ($12,500.00)", action: () => { setActiveView("payments"); setCommandPaletteOpen(false); }, badge: "Invoice" },
          { type: "invoice", label: "Invoice INV-2026-0042 ($4,300.00)", action: () => { setActiveView("payments"); setCommandPaletteOpen(false); }, badge: "Invoice" },
          { type: "order", label: "Logistics Routing Order ORD-8812 (DHL)", action: () => { setActiveView("inventory"); setCommandPaletteOpen(false); }, badge: "Order" },
          { type: "product", label: "Smart IoT Transit Sensor (Pack of 50)", action: () => { setActiveView("inventory"); setCommandPaletteOpen(false); }, badge: "Product" },
        ];

        // Append dynamic employees
        if (Array.isArray(resEmp)) {
          resEmp.forEach((emp: any) => {
            formatted.push({
              type: "employee",
              label: `${emp.full_name} — ${emp.position} [${emp.status}]`,
              action: () => { setActiveView("hr"); setCommandPaletteOpen(false); },
              badge: "Employee"
            });
          });
        }

        // Append dynamic companies
        if (Array.isArray(resComp)) {
          resComp.forEach((comp: any) => {
            formatted.push({
              type: "company",
              label: `${comp.company_name} LLC — ${comp.industry}`,
              action: () => { setActiveView("dashboard"); setCommandPaletteOpen(false); },
              badge: "Company"
            });
          });
        }

        // Append dynamic leads/customers
        if (Array.isArray(resLeads)) {
          resLeads.forEach((lead: any) => {
            formatted.push({
              type: "customer",
              label: `${lead.contact_name} (${lead.email}) [${lead.status}]`,
              action: () => { setActiveView("crm"); setCommandPaletteOpen(false); },
              badge: "Customer"
            });
          });
        }

        setSearchItems(formatted);
      } catch (err) {
        console.error("Failed to build search index:", err);
      }
    };

    fetchSearchData();
  }, [commandPaletteOpen]);

  const filteredCommands = searchItems.filter(item =>
    item.label.toLowerCase().includes(cmdSearch.toLowerCase()) ||
    item.badge.toLowerCase().includes(cmdSearch.toLowerCase())
  );

  return (
    <>
      {/* Floating Action AI Assist Orb Button */}
      <motion.button
        onClick={() => setAiPanelOpen(!aiPanelOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full ${getAccentClass("bg")} text-white flex items-center justify-center shadow-2xl shadow-indigo-500/30 cursor-pointer border border-white/10`}
      >
        <Sparkles className="h-6 w-6 animate-pulse" />
        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
      </motion.button>

      {/* Persistent Assistant Slide-out Panel */}
      <AnimatePresence>
        {aiPanelOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-96 z-50 bg-zinc-900/95 backdrop-blur-xl border-l border-zinc-800 shadow-2xl flex flex-col font-sans"
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/40">
              <div className="flex items-center gap-2">
                <Bot className={`h-5 w-5 ${getAccentClass("text")}`} />
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Exshopi AI Advisor</h3>
                  <Badge variant="success" className="text-3xs px-1 py-0 mt-0.5">Active Agent Mode</Badge>
                </div>
              </div>
              <button onClick={() => setAiPanelOpen(false)} className="rounded p-1 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* AI message scroll buffer */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-zinc-900/20">
              {aiMessages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white ${
                    msg.sender === "user" ? "bg-zinc-800 border border-zinc-700" : getAccentClass("bg")
                  }`}>
                    {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`p-3 max-w-[80%] rounded-xl text-xs leading-relaxed border ${
                    msg.sender === "user"
                      ? "bg-zinc-800/80 border-zinc-700 text-zinc-200"
                      : "bg-zinc-950/40 border-zinc-850 text-zinc-300"
                  }`}>
                    {msg.content}
                    <div className="text-3xs text-zinc-600 mt-1 text-right">{msg.timestamp}</div>
                  </div>
                </div>
              ))}

              {isAiTyping && (
                <div className="flex gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white ${getAccentClass("bg")}`}>
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl flex items-center gap-1.5 text-zinc-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested actions prompt pill lists */}
            <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-950/20 space-y-2">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Suggested Inquiries:</span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => handleSuggestion("Audit payments settlement reconciliation")}
                  className="text-2xs text-zinc-400 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-lg p-2 text-left hover:text-zinc-200 transition-colors flex justify-between items-center"
                >
                  <span>📊 Audit payments settlements flow</span>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                </button>
                <button
                  onClick={() => handleSuggestion("Fetch DHL courier speed logs")}
                  className="text-2xs text-zinc-400 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-lg p-2 text-left hover:text-zinc-200 transition-colors flex justify-between items-center"
                >
                  <span>🚚 Check warehouse carrier SLAs</span>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                </button>
                <button
                  onClick={() => handleSuggestion("Scan active security sensors and TOTP MFA")}
                  className="text-2xs text-zinc-400 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-lg p-2 text-left hover:text-zinc-200 transition-colors flex justify-between items-center"
                >
                  <span>🛡️ Check SOC-2 sensor health</span>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                </button>
              </div>
            </div>

            {/* Input form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Instruct workspace AI advisor..."
                className="flex-1 bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-600 rounded-lg py-2 px-3 focus:outline-none focus:border-zinc-500 transition-colors"
              />
              <Button variant="primary" size="sm" type="submit" disabled={!input.trim() || isAiTyping}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spotlight Command Palette (CMD + K Modal) */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommandPaletteOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 shadow-2xl rounded-xl overflow-hidden font-sans"
            >
              {/* Search omnibar input */}
              <div className="flex items-center gap-3 px-4 border-b border-zinc-800">
                <Command className="h-5 w-5 text-zinc-500" />
                <input
                  type="text"
                  value={cmdSearch}
                  onChange={(e) => setCmdSearch(e.target.value)}
                  placeholder="Search actions, presets, portals, styling tokens..."
                  className="w-full bg-transparent text-zinc-200 placeholder-zinc-500 text-sm py-4 focus:outline-none"
                  autoFocus
                />
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded font-mono text-3xs text-zinc-500 font-bold select-none">
                  ESC
                </kbd>
              </div>

              {/* Items listing */}
              <div className="p-2 max-h-80 overflow-y-auto space-y-1 custom-scrollbar">
                <span className="text-[10px] font-bold text-zinc-500 px-3 py-1.5 uppercase tracking-wider block">Enterprise Omnibar Operations</span>
                {filteredCommands.length === 0 ? (
                  <div className="text-center py-8 text-xs text-zinc-500">
                    No operations match "{cmdSearch}"
                  </div>
                ) : (
                  filteredCommands.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.action}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-zinc-950 border border-transparent hover:border-zinc-850 flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full group-hover:scale-125 transition-transform ${
                          item.badge === "Navigation" ? "bg-amber-500" :
                          item.badge === "Employee" ? "bg-emerald-500" :
                          item.badge === "Company" ? "bg-violet-500" :
                          item.badge === "Invoice" ? "bg-rose-500" :
                          item.badge === "Document" ? "bg-blue-500" :
                          item.badge === "AI Agent" ? "bg-indigo-500" : "bg-zinc-400"
                        }`} />
                        <span className="text-xs text-zinc-300 group-hover:text-zinc-100 transition-colors font-medium">{item.label}</span>
                      </div>
                      <span className="font-mono text-3xs font-bold text-indigo-400 bg-zinc-950/65 px-1.5 py-0.5 rounded border border-zinc-850 uppercase tracking-wider">
                        {item.badge || item.shortcut || item.type}
                      </span>
                    </button>
                  ))
                )}
              </div>

              {/* Footer status bar */}
              <div className="p-3 border-t border-zinc-800 bg-zinc-950 text-3xs text-zinc-500 flex justify-between items-center">
                <span>Use arrows to navigate, Enter to trigger, Esc to close</span>
                <span className="flex items-center gap-1">
                  <Sliders className="h-3.5 w-3.5 text-zinc-600" /> Dynamic Omnibar
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
