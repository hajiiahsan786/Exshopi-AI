import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../store/useStore";
import { Card, Button, Input, Badge, Dialog } from "./UI";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Sliders,
  Play,
  Square,
  Settings,
  Info,
  Check,
  X,
  AlertTriangle,
  Plus,
  Trash2,
  Activity,
  TrendingUp,
  Clock,
  DollarSign,
  Cpu,
  Brain,
  Sparkles,
  Database,
  FileText,
  ChevronRight,
  ShieldCheck,
  Video,
  ListTodo
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
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Accent style helper
import { getAccentClass } from "./UI";

export const VoiceAIPlatform: React.FC = () => {
  const { addLog, addNotification } = useStore();

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<"session" | "telephony" | "meetings" | "analytics" | "preferences">("session");

  // Voice Session State
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);
  const [pushToTalk, setPushToTalk] = useState(false);
  
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionMessages, setSessionMessages] = useState<any[]>([]);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [waveformData, setWaveformData] = useState<number[]>(new Array(30).fill(10));

  // Call Telephony State
  const [phoneNumber, setPhoneNumber] = useState("+1-888-EXSHOPI");
  const [destinationNumber, setDestinationNumber] = useState("+1-415-555-0199");
  const [activeCall, setActiveCall] = useState<any | null>(null);
  const [callLogs, setCallLogs] = useState<any[]>([
    { id: 101, from: "+1-888-EXSHOPI", to: "+1-415-555-0199", direction: "outbound", duration: 128, status: "completed", timestamp: "Today, 06:15 AM" },
    { id: 102, from: "+1-212-555-0122", to: "+1-888-EXSHOPI", direction: "inbound", duration: 45, status: "completed", timestamp: "Yesterday, 04:30 PM" }
  ]);

  // Meeting Assistant State
  const [meetings, setMeetings] = useState<any[]>([]);
  const [meetingTitle, setMeetingTitle] = useState("Exshopi Q3 Strategic Roadmap Sync");
  const [meetingProvider, setMeetingProvider] = useState("meet");
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
  const [meetingSummary, setMeetingSummary] = useState<any | null>(null);
  const [meetingActions, setMeetingActions] = useState<any[]>([]);

  // Analytics Telemetry
  const [analyticsData, setAnalyticsData] = useState<any>({
    totalCalls: 142,
    totalMinutes: 1845,
    averageLatency: 180, // ms
    sipTrunkHealth: 99.94,
    usageCost: 124.50
  });

  // Voice Preferences
  const [microphoneSelected, setMicrophoneSelected] = useState("Default System Mic (High Def)");
  const [noiseSuppression, setNoiseSuppression] = useState(90);
  const [accentSelected, setAccentSelected] = useState("American (Neutral)");
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [voiceId, setVoiceId] = useState("exshopi-sophia-v2");

  // Waveform animation
  useEffect(() => {
    let interval: any;
    if (isRecording || isAgentSpeaking) {
      interval = setInterval(() => {
        setWaveformData(prev => prev.map(() => Math.floor(Math.random() * (isAgentSpeaking ? 50 : 35)) + 10));
      }, 100);
    } else {
      setWaveformData(new Array(30).fill(10));
    }
    return () => clearInterval(interval);
  }, [isRecording, isAgentSpeaking]);

  // Fetch initial meetings and calls from DB
  const loadVoiceData = async () => {
    try {
      const resMeetings = await fetch("/api/v1/voice/meetings");
      const dataMeetings = await resMeetings.json();
      if (dataMeetings.success && dataMeetings.data) {
        setMeetings(dataMeetings.data);
      } else {
        // Fallback robust mock meetings
        setMeetings([
          { id: 1, meetingTitle: "Exshopi Q3 Strategic Roadmap Sync", provider: "Google Meet", meetingUrl: "https://meet.google.com/abc-defg-hij", status: "completed", summaryId: 1 },
          { id: 2, meetingTitle: "Supplier Bidding & Inventory Review", provider: "Zoom", meetingUrl: "https://zoom.us/j/992819283", status: "completed" }
        ]);
      }
    } catch (e) {
      console.error("Failed to load voice database logs:", e);
    }
  };

  useEffect(() => {
    loadVoiceData();
  }, []);

  // 1. Voice Session Actions
  const handleStartSession = async () => {
    try {
      const res = await fetch("/api/v1/voice/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: 1, channel: "browser" })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSessionId(json.data.id);
        setSessionActive(true);
        setSessionMessages([
          { sender: "agent", content: "Voice synthesizer online. Exshopi SIP voice circuit successfully connected in browser. Speak your command.", timestamp: "Just now" }
        ]);
        addNotification({
          title: "Voice Session Started",
          description: "SIP secure voice circuit opened. Microphones active.",
          type: "success"
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/v1/voice/sessions/${sessionId}/end`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setSessionActive(false);
        setSessionId(null);
        setIsRecording(false);
        addNotification({
          title: "Voice Session Ended",
          description: "SIP voice circuit closed successfully.",
          type: "info"
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Process Simulated spoken voice turn
  const handleProcessVoiceInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceTranscript.trim() || !sessionId) return;

    const userText = voiceTranscript;
    setVoiceTranscript("");
    setSessionMessages(prev => [...prev, { sender: "user", content: userText, timestamp: "Just now" }]);
    setIsRecording(false);
    setIsAgentSpeaking(true);

    try {
      const res = await fetch(`/api/v1/voice/sessions/${sessionId}/input`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText })
      });
      const json = await res.json();

      addLog({
        method: "POST",
        endpoint: `/api/v1/voice/sessions/${sessionId}/input`,
        status: res.status,
        type: "api",
        payload: { text: userText },
        response: json
      });

      if (json.success && json.data) {
        setSessionMessages(prev => [
          ...prev,
          { sender: "agent", content: json.data.agentMessage.content, timestamp: "Just now" }
        ]);
        
        // Simulating Agent playback speak completed
        setTimeout(() => {
          setIsAgentSpeaking(false);
        }, 4000);
      }
    } catch (e) {
      console.error(e);
      setIsAgentSpeaking(false);
    }
  };

  // Push to talk manual triggers
  const handlePTTStart = () => {
    if (!pushToTalk || !sessionActive) return;
    setIsRecording(true);
  };

  const handlePTTEnd = () => {
    if (!pushToTalk || !sessionActive) return;
    setIsRecording(false);
    // Auto trigger simulated PTT turn
    setVoiceTranscript("Verify latest cash flow budgets for marketing ad spend.");
  };

  // 2. Call Telephony Actions
  const handleTriggerCall = async () => {
    try {
      const res = await fetch("/api/v1/voice/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: 3,
          fromNumber: phoneNumber,
          toNumber: destinationNumber,
          direction: "outbound"
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setActiveCall(json.data);
        addNotification({
          title: "SIP Outbound Call Connected",
          description: `Trunk dialed: ${destinationNumber}. Session established.`,
          type: "success"
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEndCall = async () => {
    if (!activeCall) return;
    try {
      const res = await fetch(`/api/v1/voice/calls/${activeCall.id}/end`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setCallLogs(prev => [
          {
            id: activeCall.id,
            from: activeCall.fromNumber,
            to: activeCall.toNumber,
            direction: activeCall.direction,
            duration: activeCall.duration || 65,
            status: "completed",
            timestamp: "Just now"
          },
          ...prev
        ]);
        setActiveCall(null);
        addNotification({
          title: "SIP Outbound Call Completed",
          description: "Circuit terminated cleanly.",
          type: "info"
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Meeting Assistant Actions
  const handleCreateMeeting = async () => {
    if (!meetingTitle.trim()) return;
    try {
      const mockUrl = `https://${meetingProvider === "meet" ? "meet.google.com" : "zoom.us"}/abc-${Math.random().toString(36).substring(7)}`;
      const res = await fetch("/api/v1/voice/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingTitle,
          provider: meetingProvider === "meet" ? "Google Meet" : "Zoom",
          meetingUrl: mockUrl
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setMeetings(prev => [json.data, ...prev]);
        setMeetingTitle("");
        addNotification({
          title: "Virtual Meeting Hook Active",
          description: `Listening to room session: ${json.data.meetingTitle}`,
          type: "success"
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectMeeting = async (m: any) => {
    setSelectedMeeting(m);
    setMeetingSummary(null);
    setMeetingActions([]);

    try {
      // Simulate/trigger auto-summarize of transcription
      const res = await fetch(`/api/v1/voice/meetings/${m.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcriptText: "User: Align the marketing budget parameters to compromises. Agent (Finance Fiona): Compromise of $35,000 stands. Marketing to draft ad spend projections. Strategic actions logged."
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setMeetingSummary(json.data.summary);
        setMeetingActions(json.data.actions || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-500 text-white flex items-center justify-center">
              <Mic className="h-5 w-5" />
            </span>
            Enterprise Voice AI Platform
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Secure browser-based push-to-talk voice commands, multi-trunk SIP dialers, and automated video meeting transcription summaries.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-1 bg-zinc-950 p-1.5 rounded-xl border border-zinc-850">
          {[
            { id: "session", label: "Voice Chat", icon: Mic },
            { id: "telephony", label: "SIP Dialer", icon: Phone },
            { id: "meetings", label: "Meetings Hub", icon: Video },
            { id: "analytics", label: "Usage Telemetry", icon: Activity },
            { id: "preferences", label: "Preferences", icon: Sliders }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-2xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === t.id ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. TAB DRAWERS CONTENTS */}
      <Card className="p-6 bg-zinc-900/20 border border-zinc-800/60 min-h-[450px] rounded-2xl">
        <AnimatePresence mode="wait">
          
          {/* A. VOICE CHAT PANEL */}
          {activeTab === "session" && (
            <motion.div
              key="session"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visualizer & record core buttons (5 cols) */}
                <div className="lg:col-span-5 bg-zinc-950 border border-zinc-850 rounded-2xl p-6 flex flex-col justify-between items-center text-center gap-6 min-h-[350px]">
                  <div className="space-y-1">
                    <Badge variant="accent">SECURE SIP TRUNK ON</Badge>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1">LATENCY: {analyticsData.averageLatency}ms | ENCRYPTION: TLS 1.3</p>
                  </div>

                  {/* Dynamic waveform visualizer */}
                  <div className="flex items-center gap-1 h-20 w-full justify-center">
                    {waveformData.map((h, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: `${h}%` }}
                        className={`w-1.5 rounded-full ${isAgentSpeaking ? "bg-emerald-500" : isRecording ? "bg-indigo-500" : "bg-zinc-800"}`}
                        style={{ minHeight: "6px" }}
                      />
                    ))}
                  </div>

                  {/* Dynamic central status text */}
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-zinc-200">
                      {isAgentSpeaking ? "Sophia AI Speaking..." : isRecording ? "Listening to voice input..." : sessionActive ? "Circuit Idle" : "Voice Circuit Disconnected"}
                    </h3>
                    <p className="text-4xs font-mono text-zinc-500">
                      WAKE WORD: "HEY EXSHOPI" | PTT {pushToTalk ? "ACTIVE" : "OFF"}
                    </p>
                  </div>

                  {/* Core Action triggers */}
                  <div className="flex gap-3">
                    {!sessionActive ? (
                      <Button onClick={handleStartSession} variant="primary" className="px-6 py-2.5 text-xs font-bold font-mono">
                        <Play className="h-4 w-4 mr-1.5" /> CONNECT CIRCUIT
                      </Button>
                    ) : (
                      <>
                        {pushToTalk ? (
                          <button
                            onMouseDown={handlePTTStart}
                            onMouseUp={handlePTTEnd}
                            onTouchStart={handlePTTStart}
                            onTouchEnd={handlePTTEnd}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs px-6 py-2.5 rounded-xl border border-indigo-700/60 active:scale-95 transition-all select-none"
                          >
                            HOLD TO TALK (PTT)
                          </button>
                        ) : (
                          <Button
                            onClick={() => setIsRecording(!isRecording)}
                            variant={isRecording ? "danger" : "primary"}
                            className="px-6 py-2.5 text-xs font-bold font-mono"
                          >
                            {isRecording ? <Square className="h-4 w-4 mr-1.5" /> : <Mic className="h-4 w-4 mr-1.5" />}
                            {isRecording ? "STOP RECORDING" : "STREAM VOICE"}
                          </Button>
                        )}

                        <Button onClick={handleEndSession} variant="outline" className="px-5 text-xs font-mono text-rose-400 hover:text-rose-300">
                          <PhoneOff className="h-4 w-4 mr-1.5" /> DISCONNECT
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Real-time speech to text transcript output (7 cols) */}
                <div className="lg:col-span-7 bg-zinc-950/40 border border-zinc-850 rounded-2xl p-5 flex flex-col justify-between h-[350px]">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 block border-b border-zinc-850 pb-1.5">REAL-TIME TRANSCRIPT SPEAKING LOG</span>
                  
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
                    {sessionMessages.map((m, idx) => (
                      <div key={idx} className="space-y-0.5 text-xs">
                        <span className={`font-mono text-[9px] font-bold uppercase ${m.sender === "user" ? "text-indigo-400" : "text-emerald-400"}`}>
                          [{m.sender.toUpperCase()}]
                        </span>
                        <p className="text-zinc-200 leading-relaxed bg-zinc-900/40 p-2 rounded-lg border border-zinc-850">{m.content}</p>
                      </div>
                    ))}
                    {isAgentSpeaking && (
                      <div className="text-2xs font-mono text-zinc-500 animate-pulse flex items-center gap-1">
                        <Volume2 className="h-3.5 w-3.5" /> Agent outputting generated audio stream parameter registers...
                      </div>
                    )}
                  </div>

                  {/* Manual speaking turn test simulator */}
                  {sessionActive && !pushToTalk && (
                    <form onSubmit={handleProcessVoiceInput} className="flex gap-2 border-t border-zinc-850 pt-3 mt-2">
                      <input
                        type="text"
                        value={voiceTranscript}
                        onChange={(e) => setVoiceTranscript(e.target.value)}
                        placeholder="Simulate spoken voice turn (or say: 'Verify cash flow balance')..."
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none placeholder-zinc-600"
                      />
                      <Button type="submit" variant="outline" className="px-4 text-2xs font-semibold h-10 border-zinc-800 text-indigo-400">
                        SIMULATE SPEAK
                      </Button>
                    </form>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* B. SIP TELEPHONY DIALER */}
          {activeTab === "telephony" && (
            <motion.div
              key="telephony"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Interactive SIP dialing keypad pad */}
                <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                    <Phone className="h-4 w-4 text-indigo-400" /> Outbound Call Dialing Panel
                  </h3>

                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Trunk SIP Caller ID Number</label>
                      <Input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="bg-zinc-900 border-zinc-800 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Destination Number (Client / Lead)</label>
                      <Input
                        type="text"
                        value={destinationNumber}
                        onChange={(e) => setDestinationNumber(e.target.value)}
                        className="bg-zinc-900 border-zinc-800 text-xs font-mono"
                      />
                    </div>

                    <div className="pt-2">
                      {!activeCall ? (
                        <Button onClick={handleTriggerCall} variant="primary" className="w-full py-2.5 text-xs font-bold font-mono uppercase">
                          <Phone className="h-4 w-4 mr-1.5" /> DIAL SIP CIRCUIT
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-center space-y-1">
                            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest animate-pulse">● SIP CIRCUIT CONNECTED</span>
                            <p className="text-xs text-zinc-300">Outgoing to {activeCall.toNumber}</p>
                          </div>
                          <Button onClick={handleEndCall} variant="danger" className="w-full py-2.5 text-xs font-bold font-mono uppercase">
                            <PhoneOff className="h-4 w-4 mr-1.5" /> TERMINATE CALL
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Telephony SIP logs list */}
                <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">SIP Call Logs & Audio Files</h3>
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {callLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-zinc-900 rounded-xl border border-zinc-800/80 flex justify-between items-center text-2xs">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-zinc-200">To: {log.to}</p>
                          <p className="text-zinc-500 text-3xs font-mono">{log.timestamp} | {log.duration} seconds</p>
                        </div>
                        <Badge variant="success">{log.status}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>

              </div>
            </motion.div>
          )}

          {/* C. MEETING TRANSCRIPT TRANSCRIPTION ASSISTANT */}
          {activeTab === "meetings" && (
            <motion.div
              key="meetings"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left pane: Initiate/Join virtual rooms (5 cols) */}
                <div className="lg:col-span-4 space-y-4">
                  <Card className="p-4 bg-zinc-950 border border-zinc-850 space-y-4">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Join Meeting Hook Listener</span>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-3xs font-mono font-bold text-zinc-500 uppercase">Room title</label>
                        <input
                          type="text"
                          value={meetingTitle}
                          onChange={(e) => setMeetingTitle(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-3xs font-mono font-bold text-zinc-500 uppercase">Provider Integrations</label>
                        <select
                          value={meetingProvider}
                          onChange={(e) => setMeetingProvider(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none"
                        >
                          <option value="meet">Google Meet</option>
                          <option value="zoom">Zoom</option>
                        </select>
                      </div>

                      <Button onClick={handleCreateMeeting} variant="primary" className="w-full py-2.5 text-xs font-bold font-mono uppercase">
                        <Plus className="h-3.5 w-3.5 mr-1" /> HOOK MEETING
                      </Button>
                    </div>
                  </Card>

                  {/* Joined Meetings lists */}
                  <Card className="p-4 bg-zinc-950 border border-zinc-850">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-3">CONVERGED MEETINGS LIST</span>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {meetings.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => handleSelectMeeting(m)}
                          className={`w-full text-left p-2.5 rounded-xl transition-colors border ${
                            selectedMeeting?.id === m.id
                              ? "border-indigo-500 bg-zinc-900"
                              : "border-transparent hover:bg-zinc-900/30 text-zinc-400"
                          }`}
                        >
                          <p className="text-2xs font-bold text-zinc-100 truncate">{m.meetingTitle}</p>
                          <span className="text-3xs font-mono text-zinc-500">{m.provider} | SECURE AUDITED</span>
                        </button>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Right pane: Auto Summarized transcript overview (8 cols) */}
                <div className="lg:col-span-8 bg-zinc-950 border border-zinc-850 rounded-2xl p-5 min-h-[350px] flex flex-col justify-between">
                  {selectedMeeting ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                        <div>
                          <h3 className="text-xs font-bold text-white">{selectedMeeting.meetingTitle}</h3>
                          <p className="text-4xs text-zinc-500 font-mono mt-0.5">AUTO-TRANSCRIBED BY EXSHOPI VOICE AI</p>
                        </div>
                        <Badge variant="success">Completed</Badge>
                      </div>

                      {meetingSummary ? (
                        <div className="space-y-4 text-xs">
                          <div className="space-y-1 leading-relaxed text-zinc-300">
                            <span className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">🔮 AUTONOMOUS SUMMARY</span>
                            <p className="bg-zinc-900 p-3 rounded-xl border border-zinc-850">{meetingSummary.summary_text || "The team converged on marketing compromises. Fiona (Finance) and Mila (Marketing) resolved parameters."}</p>
                          </div>

                          <div className="space-y-2">
                            <span className="font-mono text-[9px] font-bold text-amber-400 uppercase tracking-widest block">⚡ IDENTIFIED ACTION ITEMS</span>
                            <div className="space-y-1.5">
                              {meetingActions.map((act) => (
                                <div key={act.id} className="p-2.5 bg-zinc-900/50 rounded-lg border border-zinc-850 text-2xs flex items-center justify-between text-zinc-200">
                                  <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                    <span>{act.actionText}</span>
                                  </div>
                                  <Badge variant="neutral" className="font-mono">{act.status}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-10 text-2xs text-zinc-500">Formulating auto summaries and strategic actions...</div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-2">
                      <Video className="h-8 w-8 opacity-20" />
                      <p className="text-xs font-mono">Select a conversation or hooked meeting on the left to review summaries.</p>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* D. USAGE TELEMETRY */}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Voice Call frequency AreaChart */}
                <Card className="p-5 bg-zinc-950 border border-zinc-850">
                  <h3 className="text-xs font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-indigo-400" /> Hourly SIP Outbound Call Traffic (Today)
                  </h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          { hr: "08 AM", calls: 12 },
                          { hr: "10 AM", calls: 24 },
                          { hr: "12 PM", calls: 18 },
                          { hr: "02 PM", calls: 32 },
                          { hr: "04 PM", calls: 28 },
                          { hr: "06 PM", calls: 14 }
                        ]}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                      >
                        <XAxis dataKey="hr" stroke="#52525b" fontSize={9} />
                        <YAxis stroke="#52525b" fontSize={9} />
                        <Tooltip />
                        <Area type="monotone" dataKey="calls" stroke="#818cf8" fillOpacity={0.1} fill="#818cf8" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Voice latency BarChart */}
                <Card className="p-5 bg-zinc-950 border border-zinc-850">
                  <h3 className="text-xs font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-emerald-400" /> Browser Voice Latency metrics (ms)
                  </h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { channel: "Browser SDK", latency: 120 },
                          { channel: "SIP Gate trunk", latency: 185 },
                          { channel: "Twilio Voice", latency: 210 },
                          { channel: "Gemini Realtime", latency: 280 }
                        ]}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                      >
                        <XAxis dataKey="channel" stroke="#52525b" fontSize={9} />
                        <YAxis stroke="#52525b" fontSize={9} />
                        <Tooltip />
                        <Bar dataKey="latency" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

              </div>
            </motion.div>
          )}

          {/* E. PREFERENCES */}
          {activeTab === "preferences" && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Audio hardware Tuning parameters */}
                <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                    <Sliders className="h-4 w-4 text-indigo-400" /> Hardware & Suppressions tuning
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Input Microphone Hardware</label>
                      <select
                        value={microphoneSelected}
                        onChange={(e) => setMicrophoneSelected(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none"
                      >
                        <option value="Default System Mic">Default System Mic (High Def)</option>
                        <option value="External USB Interface">External USB Interface (Core Audio)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Noise Suppression Coefficient (%)</label>
                        <span className="font-mono text-zinc-400">{noiseSuppression}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={noiseSuppression}
                        onChange={(e) => setNoiseSuppression(parseInt(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  </div>
                </Card>

                {/* Accent and speed profiles tuning */}
                <Card className="p-5 bg-zinc-950 border border-zinc-850 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                    <Volume2 className="h-4 w-4 text-indigo-400" /> Synthesized playback preferences
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Playback Accent & Language profile</label>
                      <select
                        value={accentSelected}
                        onChange={(e) => setAccentSelected(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none"
                      >
                        <option value="American (Neutral)">American (Neutral)</option>
                        <option value="British (Standard)">British (Standard)</option>
                        <option value="Australian (Standard)">Australian (Standard)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Tuned playback speed multiplier (x)</label>
                        <span className="font-mono text-zinc-400">{playbackSpeed}x</span>
                      </div>
                      <select
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none"
                      >
                        <option value={0.8}>0.8x (Deliberate)</option>
                        <option value={1.0}>1.0x (Standard)</option>
                        <option value={1.2}>1.2x (Optimized speed)</option>
                      </select>
                    </div>
                  </div>
                </Card>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </Card>
    </div>
  );
};
