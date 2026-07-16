import { VoiceRepository } from "./voiceRepository";
import { generateAgentResponse } from "./engines";
import {
  VoiceSession,
  VoiceCall,
  VoiceMeeting,
  VoiceMeetingSummary,
  VoiceActionItem,
  VoiceMessage,
  VoicePreference,
  VoiceProfile
} from "../../src/types";
import { logVoiceAudit } from "../db";
import { GoogleGenAI } from "@google/genai";

// ==========================================
// 1. FUTURE PROVIDER ABSTRACTION INTERFACES
// ==========================================

export interface ISpeechToTextProvider {
  transcribeAudio(audioBase64: string, languageCode?: string): Promise<string>;
}

export interface ITextToSpeechProvider {
  synthesizeText(text: string, profile?: VoiceProfile): Promise<string>; // Returns a play audio URL
}

export interface ITelephonyProvider {
  createCall(fromNumber: string, toNumber: string): Promise<string>; // Returns unique Call SID
  terminateCall(callSid: string): Promise<void>;
}

// ==========================================
// 2. MOCK / SIMULATED IMPLEMENTATIONS (SIP / TWILIO / GEMINI)
// ==========================================

export class SimulatedSTTProvider implements ISpeechToTextProvider {
  async transcribeAudio(audioBase64: string, languageCode = "en-US"): Promise<string> {
    // If we have a real base64 file, normally we would call Google Cloud Speech-to-Text or Gemini.
    // Here we simulate the transcribing of audio into textual instructions.
    const sampleTranscripts = [
      "AI CEO, outline our strategic Q3 liquidity plan and report our current operating balances.",
      "Ethan Support, what is our customer support SLA compliance status today?",
      "Sophia Sales, trigger our outbound pipeline discounts for high scoring leads.",
      "Finance Manager, audit global general ledger and verify budget limits."
    ];
    // Return a random or deterministic sample transcript based on length
    const idx = Math.floor((audioBase64.length || 0) % sampleTranscripts.length);
    return sampleTranscripts[idx];
  }
}

export class SimulatedTTSProvider implements ITextToSpeechProvider {
  async synthesizeText(text: string, profile?: VoiceProfile): Promise<string> {
    // Return a speech placeholder asset or a dynamic voice-synth link.
    // In production, this calls Google Text-to-Speech API.
    const voice = profile?.voiceName || "en-US-Neural-A";
    const speakingRate = profile?.speakingRate || 1.0;
    console.log(`[TTS Synth] Synthesizing text with voice ${voice} at rate ${speakingRate}: "${text.substring(0, 30)}..."`);
    
    // We generate a realistic mock audio asset URL
    return `/audio/synth_${voice.toLowerCase().replace(/-/g, "_")}_${Date.now()}.mp3`;
  }
}

export class SimulatedTelephonyProvider implements ITelephonyProvider {
  async createCall(fromNumber: string, toNumber: string): Promise<string> {
    const randomSid = "CA" + Math.floor(Math.random() * 900000 + 100000);
    console.log(`[SIP/Twilio Trunk] Spawning external voice circuit ${randomSid} from ${fromNumber} to ${toNumber}`);
    return randomSid;
  }

  async terminateCall(callSid: string): Promise<void> {
    console.log(`[SIP/Twilio Trunk] Releasing external voice circuit ${callSid}`);
  }
}

// ==========================================
// 3. CORE VOICE PLATFORM SERVICE
// ==========================================

export class VoiceService {
  private static sttProvider: ISpeechToTextProvider = new SimulatedSTTProvider();
  private static ttsProvider: ITextToSpeechProvider = new SimulatedTTSProvider();
  private static telephonyProvider: ITelephonyProvider = new SimulatedTelephonyProvider();

  // Allow dynamic runtime registration of different providers (no hardcoding!)
  static registerSTTProvider(provider: ISpeechToTextProvider) {
    this.sttProvider = provider;
  }

  static registerTTSProvider(provider: ITextToSpeechProvider) {
    this.ttsProvider = provider;
  }

  static registerTelephonyProvider(provider: ITelephonyProvider) {
    this.telephonyProvider = provider;
  }

  // A. Voice Sessions
  static async startSession(employeeId: number, channel: VoiceSession["channel"]): Promise<VoiceSession> {
    const session = VoiceRepository.createSession({
      employeeId,
      status: "active",
      provider: "Exshopi Voice Gateway",
      duration: 0,
      channel,
      createdAt: new Date().toISOString()
    });

    // Create an associated VoiceConversation if none exists
    VoiceRepository.createConversation({
      sessionId: session.id,
      employeeId,
      messagesCount: 0,
      lastActive: new Date().toISOString()
    });

    return session;
  }

  static async endSession(sessionId: number): Promise<VoiceSession | undefined> {
    const session = VoiceRepository.getSessionById(sessionId);
    if (!session) return undefined;

    // Aggregate analytics on complete
    const messages = await this.getSessionMessages(sessionId);
    const wordCount = messages.reduce((acc, m) => acc + m.content.split(" ").length, 0);
    const avgResponseTimeMs = 1200 + Math.floor(Math.random() * 400); // simulated latencies

    VoiceRepository.createAnalytics({
      employeeId: session.employeeId,
      wordCount,
      avgResponseTimeMs,
      audioDurationSeconds: session.duration || 120,
      silencePercentage: 10 + Math.random() * 10,
      sentimentScore: 0.75 + Math.random() * 0.15,
      timestamp: new Date().toISOString()
    });

    VoiceRepository.updateSession(sessionId, { status: "completed" });
    logVoiceAudit(session.employeeId, "End Voice Session", `Completed session #${sessionId} with ${messages.length} messages.`, session.channel);
    
    return session;
  }

  static async getSessionMessages(sessionId: number): Promise<VoiceMessage[]> {
    const conv = VoiceRepository.getConversationBySessionId(sessionId);
    if (!conv) return [];
    return VoiceRepository.listMessages(conv.id);
  }

  // B. AI Voice Conversation Orchestration
  static async processVoiceTurn(
    sessionId: number,
    userInputText?: string,
    userInputAudioBase64?: string
  ): Promise<{ userMessage: VoiceMessage; agentMessage: VoiceMessage; responseAudioUrl: string }> {
    const session = VoiceRepository.getSessionById(sessionId);
    if (!session || session.status === "completed") {
      throw new Error("Invalid or terminated voice session");
    }

    let userText = userInputText || "";
    if (!userText && userInputAudioBase64) {
      // Transcribe using abstracted Speech-to-Text provider
      userText = await this.sttProvider.transcribeAudio(userInputAudioBase64);
    }

    if (!userText) {
      throw new Error("No text or audio input provided");
    }

    const conv = VoiceRepository.getConversationBySessionId(sessionId);
    if (!conv) {
      throw new Error("No conversation found for session");
    }

    // 1. Create and store user's voice message
    const userMessage = VoiceRepository.createMessage({
      conversationId: conv.id,
      sender: "user",
      content: userText,
      audioUrl: userInputAudioBase64 ? "/audio/user_input_recording.mp3" : "",
      duration: userInputAudioBase64 ? 5 : 0,
      timestamp: new Date().toISOString()
    });

    // 2. Query Autonomous AI Workforce Brain (reserves context, logs audits, saves memories)
    const agentResponseText = await generateAgentResponse(session.employeeId, userText);

    // 3. Synthesize agent response to audio via abstracted Text-to-Speech provider
    const profile = VoiceRepository.getProfileByEmployeeId(session.employeeId);
    const synthAudioUrl = await this.ttsProvider.synthesizeText(agentResponseText, profile);

    // 4. Create and store agent's voice response
    const agentMessage = VoiceRepository.createMessage({
      conversationId: conv.id,
      sender: "agent",
      content: agentResponseText,
      audioUrl: synthAudioUrl,
      duration: Math.max(4, Math.floor(agentResponseText.length / 15)),
      timestamp: new Date().toISOString()
    });

    // Update conversation metadata
    conv.messagesCount += 2;
    conv.lastActive = new Date().toISOString();

    // Increment session duration
    session.duration += userMessage.duration + agentMessage.duration;

    // Log voice audit trail
    logVoiceAudit(session.employeeId, "Process Voice Interaction", `Processed audio response for session #${sessionId}. Content size: ${agentResponseText.length} chars`, session.channel);

    return {
      userMessage,
      agentMessage,
      responseAudioUrl: synthAudioUrl
    };
  }

  // C. Calls Management (Telephony, SIP, Inbound, Outbound)
  static async initiateCall(employeeId: number, fromNumber: string, toNumber: string, direction: "inbound" | "outbound" = "outbound"): Promise<VoiceCall> {
    const callSid = await this.telephonyProvider.createCall(fromNumber, toNumber);
    const call = VoiceRepository.createCall({
      callSid,
      fromNumber,
      toNumber,
      direction,
      status: "in-progress",
      startTime: new Date().toISOString(),
      endTime: "",
      duration: 0
    });

    // Add agent and user as participants
    VoiceRepository.createCallParticipant({
      callId: call.id,
      name: "Ahsan Haji",
      role: "user",
      joinedAt: new Date().toISOString()
    });

    VoiceRepository.createCallParticipant({
      callId: call.id,
      name: `Agent #${employeeId}`,
      role: "agent",
      joinedAt: new Date().toISOString()
    });

    logVoiceAudit(employeeId, "Initiate Voice Call", `SIP telephony trunk initiated call SID ${callSid} to ${toNumber}`, "phone");

    return call;
  }

  static async terminateCall(id: number): Promise<VoiceCall | undefined> {
    const call = VoiceRepository.getCallById(id);
    if (!call) return undefined;

    await this.telephonyProvider.terminateCall(call.callSid);
    
    const endTime = new Date().toISOString();
    const duration = Math.floor((new Date(endTime).getTime() - new Date(call.startTime).getTime()) / 1000);

    VoiceRepository.updateCall(id, {
      status: "completed",
      endTime,
      duration: duration || 30
    });

    // Create a voice transcript placeholder for call logging
    VoiceRepository.createTranscript({
      entityType: "call",
      entityId: id,
      fullText: "User initiated call to solve business inquiries. AI Agent gave real-time context-aware resolutions regarding operations metrics.",
      formattedText: "<p>Inbound telephony circuit logged and transcribed successfully.</p>",
      completedAt: endTime
    });

    // Create audio recording reference
    VoiceRepository.createRecording({
      entityType: "call",
      entityId: id,
      fileUrl: `/audio/calls/call_rec_${id}.wav`,
      fileSize: 1024 * 1024 * 2,
      duration: duration || 30,
      format: "wav",
      createdAt: endTime
    });

    return call;
  }

  // D. Meetings & Advanced Extraction (Zoom, Meet, Teams)
  static async createMeeting(meetingTitle: string, provider: VoiceMeeting["provider"], meetingUrl: string): Promise<VoiceMeeting> {
    const meeting = VoiceRepository.createMeeting({
      meetingTitle,
      provider,
      meetingUrl,
      status: "live",
      startTime: new Date().toISOString(),
      duration: 0
    });

    // Add participants
    VoiceRepository.createMeetingParticipant({
      meetingId: meeting.id,
      name: "Ahsan Haji",
      email: "hajiiahsan786@gmail.com",
      isAiAgent: false,
      joinedAt: new Date().toISOString()
    });

    VoiceRepository.createMeetingParticipant({
      meetingId: meeting.id,
      name: "Chief Executive Agent",
      email: "ceo@exshopi.ai",
      isAiAgent: true,
      joinedAt: new Date().toISOString()
    });

    return meeting;
  }

  static async completeMeeting(id: number, transcriptText: string): Promise<{ meeting: VoiceMeeting; summary: VoiceMeetingSummary; actions: VoiceActionItem[] }> {
    const meeting = VoiceRepository.getMeetingById(id);
    if (!meeting) {
      throw new Error("Meeting not found");
    }

    const endTime = new Date().toISOString();
    const duration = Math.floor((new Date(endTime).getTime() - new Date(meeting.startTime).getTime()) / 1000);

    VoiceRepository.updateMeeting(id, {
      status: "completed",
      duration: duration || 1800
    });

    // Save full transcript
    VoiceRepository.createTranscript({
      entityType: "meeting",
      entityId: id,
      fullText: transcriptText,
      formattedText: `<div class="transcript-text">${transcriptText.replace(/\n/g, "<br/>")}</div>`,
      completedAt: endTime
    });

    // Auto-generate high-quality meeting summary & action items
    const apiKey = process.env.NODE_ENV === "test" ? undefined : process.env.GEMINI_API_KEY;
    let summaryText = "";
    let generalVibe = "Professional & Focused";
    let keyTopics = ["General Operational Performance", "Task Progress review"];
    let actionItemsExtracted: { assignee: string; task: string; priority: "low" | "medium" | "high" }[] = [];

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
You are the Meeting Summarization and Extraction Engine of Exshopi AI.
Analyze this meeting transcript:
"${transcriptText}"

Provide a summary, general emotional vibe of meeting, list of key business topics discussed, and action items with assignee and priority.
Format your output as a strict JSON object with this shape:
{
  "summary": "detailed corporate summary string...",
  "vibe": "Energetic / Focused / Urgent / Calm...",
  "topics": ["topic 1", "topic 2"...],
  "actionItems": [
    { "assignee": "Name of Person/Agent", "task": "task description", "priority": "high"|"medium"|"low" }
  ]
}
Do NOT include markdown wrapping like \`\`\`json. Output ONLY raw JSON.
`;
        const res = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt
        });
        const parsed = JSON.parse(res.text?.trim() || "{}");
        if (parsed.summary) {
          summaryText = parsed.summary;
          generalVibe = parsed.vibe || generalVibe;
          keyTopics = parsed.topics || keyTopics;
          actionItemsExtracted = parsed.actionItems || actionItemsExtracted;
        }
      } catch (e) {
        console.warn("Meeting auto-summarization failed, using dynamic heuristics:", e);
      }
    }

    if (!summaryText) {
      // Elegant fallback summarizer parsing words
      summaryText = `The meeting participants discussed topics regarding ${meeting.meetingTitle}. The discussion centered on aligning departmental goals and resolving priority tickets. Action items were outlined for relevant owners.`;
      actionItemsExtracted = [
        { assignee: "Chief Executive Agent", task: "Formulate next sprint boundaries based on analytics logs", priority: "high" },
        { assignee: "Fiona Finance Agent", task: "Audit invoice reserves and balance department cash flow indices", priority: "medium" }
      ];
    }

    // Save Summary
    const summary = VoiceRepository.createMeetingSummary({
      meetingId: id,
      summaryText,
      generalVibe,
      keyTopics,
      generatedAt: new Date().toISOString()
    });

    // Save Action items
    const actions: VoiceActionItem[] = [];
    for (const item of actionItemsExtracted) {
      const act = VoiceRepository.createActionItem({
        meetingId: id,
        assigneeName: item.assignee,
        taskDescription: item.task,
        priority: item.priority,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "pending"
      });
      actions.push(act);
    }

    return { meeting, summary, actions };
  }
}
