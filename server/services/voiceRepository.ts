import {
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
  VoiceAuditLog
} from "../../src/types";

import {
  voiceSessions,
  voiceConversations,
  voiceMessages,
  voiceTranscripts,
  voiceRecordings,
  voiceProfiles,
  voicePreferences,
  voiceCommands,
  voiceCalls,
  voiceCallParticipants,
  voiceMeetings,
  voiceMeetingParticipants,
  voiceMeetingSummaries,
  voiceActionItems,
  voiceAnalytics,
  voiceAuditLogs,
  logVoiceAudit
} from "../db";

export class VoiceRepository {
  // 1. VoiceSession Repository
  static getSessionById(id: number): VoiceSession | undefined {
    return voiceSessions.find(s => s.id === id);
  }

  static listSessions(filter: { employeeId?: number; status?: "active" | "completed"; channel?: string } = {}, page = 1, limit = 10) {
    let result = [...voiceSessions];
    if (filter.employeeId !== undefined) {
      result = result.filter(s => s.employeeId === filter.employeeId);
    }
    if (filter.status) {
      result = result.filter(s => s.status === filter.status);
    }
    if (filter.channel) {
      result = result.filter(s => s.channel === filter.channel);
    }
    const total = result.length;
    const startIndex = (page - 1) * limit;
    const items = result.slice(startIndex, startIndex + limit);
    return { items, total, page, limit };
  }

  static createSession(session: Omit<VoiceSession, "id">): VoiceSession {
    const newSession: VoiceSession = {
      id: voiceSessions.length + 1,
      ...session
    };
    voiceSessions.push(newSession);
    logVoiceAudit(session.employeeId, "Create Voice Session", `Session created with channel ${session.channel} using provider ${session.provider}`, session.channel);
    return newSession;
  }

  static updateSession(id: number, updates: Partial<Omit<VoiceSession, "id">>): VoiceSession | undefined {
    const session = this.getSessionById(id);
    if (!session) return undefined;
    Object.assign(session, updates);
    return session;
  }

  // 2. VoiceConversation Repository
  static getConversationById(id: number): VoiceConversation | undefined {
    return voiceConversations.find(c => c.id === id);
  }

  static getConversationBySessionId(sessionId: number): VoiceConversation | undefined {
    return voiceConversations.find(c => c.sessionId === sessionId);
  }

  static createConversation(conv: Omit<VoiceConversation, "id">): VoiceConversation {
    const newConv: VoiceConversation = {
      id: voiceConversations.length + 1,
      ...conv
    };
    voiceConversations.push(newConv);
    return newConv;
  }

  // 3. VoiceMessage Repository
  static listMessages(conversationId: number): VoiceMessage[] {
    return voiceMessages.filter(m => m.conversationId === conversationId);
  }

  static createMessage(msg: Omit<VoiceMessage, "id">): VoiceMessage {
    const newMessage: VoiceMessage = {
      id: voiceMessages.length + 1,
      ...msg
    };
    voiceMessages.push(newMessage);
    return newMessage;
  }

  // 4. VoiceTranscript Repository
  static getTranscript(entityType: "call" | "meeting" | "session", entityId: number): VoiceTranscript | undefined {
    return voiceTranscripts.find(t => t.entityType === entityType && t.entityId === entityId);
  }

  static createTranscript(transcript: Omit<VoiceTranscript, "id">): VoiceTranscript {
    const newT: VoiceTranscript = {
      id: voiceTranscripts.length + 1,
      ...transcript
    };
    voiceTranscripts.push(newT);
    return newT;
  }

  // 5. VoiceRecording Repository
  static getRecording(entityType: "call" | "meeting" | "session", entityId: number): VoiceRecording | undefined {
    return voiceRecordings.find(r => r.entityType === entityType && r.entityId === entityId);
  }

  static createRecording(rec: Omit<VoiceRecording, "id">): VoiceRecording {
    const newR: VoiceRecording = {
      id: voiceRecordings.length + 1,
      ...rec
    };
    voiceRecordings.push(newR);
    return newR;
  }

  // 6. VoiceProfile Repository
  static getProfileByEmployeeId(employeeId: number): VoiceProfile | undefined {
    return voiceProfiles.find(p => p.employeeId === employeeId);
  }

  static updateProfile(employeeId: number, updates: Partial<Omit<VoiceProfile, "id" | "employeeId">>): VoiceProfile {
    let profile = this.getProfileByEmployeeId(employeeId);
    if (!profile) {
      profile = {
        id: voiceProfiles.length + 1,
        employeeId,
        voiceName: "en-US-Neural-A",
        languageCode: "en-US",
        gender: "neutral",
        pitch: 0,
        speakingRate: 1
      };
      voiceProfiles.push(profile);
    }
    Object.assign(profile, updates);
    return profile;
  }

  // 7. VoicePreference Repository
  static getPreferenceByEmployeeId(employeeId: number): VoicePreference | undefined {
    return voicePreferences.find(p => p.employeeId === employeeId);
  }

  static updatePreference(employeeId: number, updates: Partial<Omit<VoicePreference, "id" | "employeeId">>): VoicePreference {
    let pref = this.getPreferenceByEmployeeId(employeeId);
    if (!pref) {
      pref = {
        id: voicePreferences.length + 1,
        employeeId,
        wakeWordEnabled: false,
        wakeWord: "Athena",
        silenceTimeoutMs: 3000,
        autoRecord: true,
        preferredChannel: "browser"
      };
      voicePreferences.push(pref);
    }
    Object.assign(pref, updates);
    return pref;
  }

  // 8. VoiceCommand Repository
  static listCommands(): VoiceCommand[] {
    return voiceCommands;
  }

  static createCommand(cmd: Omit<VoiceCommand, "id">): VoiceCommand {
    const newCmd: VoiceCommand = {
      id: voiceCommands.length + 1,
      ...cmd
    };
    voiceCommands.push(newCmd);
    return newCmd;
  }

  // 9. VoiceCall Repository
  static getCallById(id: number): VoiceCall | undefined {
    return voiceCalls.find(c => c.id === id);
  }

  static getCallBySid(callSid: string): VoiceCall | undefined {
    return voiceCalls.find(c => c.callSid === callSid);
  }

  static createCall(call: Omit<VoiceCall, "id">): VoiceCall {
    const newCall: VoiceCall = {
      id: voiceCalls.length + 1,
      ...call
    };
    voiceCalls.push(newCall);
    return newCall;
  }

  static updateCall(id: number, updates: Partial<Omit<VoiceCall, "id">>): VoiceCall | undefined {
    const call = this.getCallById(id);
    if (!call) return undefined;
    Object.assign(call, updates);
    return call;
  }

  // 10. VoiceCallParticipant Repository
  static listCallParticipants(callId: number): VoiceCallParticipant[] {
    return voiceCallParticipants.filter(p => p.callId === callId);
  }

  static createCallParticipant(p: Omit<VoiceCallParticipant, "id">): VoiceCallParticipant {
    const newP: VoiceCallParticipant = {
      id: voiceCallParticipants.length + 1,
      ...p
    };
    voiceCallParticipants.push(newP);
    return newP;
  }

  // 11. VoiceMeeting Repository
  static getMeetingById(id: number): VoiceMeeting | undefined {
    return voiceMeetings.find(m => m.id === id);
  }

  static listMeetings(page = 1, limit = 10) {
    const total = voiceMeetings.length;
    const startIndex = (page - 1) * limit;
    const items = voiceMeetings.slice(startIndex, startIndex + limit);
    return { items, total, page, limit };
  }

  static createMeeting(meeting: Omit<VoiceMeeting, "id">): VoiceMeeting {
    const newM: VoiceMeeting = {
      id: voiceMeetings.length + 1,
      ...meeting
    };
    voiceMeetings.push(newM);
    return newM;
  }

  static updateMeeting(id: number, updates: Partial<Omit<VoiceMeeting, "id">>): VoiceMeeting | undefined {
    const meeting = this.getMeetingById(id);
    if (!meeting) return undefined;
    Object.assign(meeting, updates);
    return meeting;
  }

  // 12. VoiceMeetingParticipant Repository
  static listMeetingParticipants(meetingId: number): VoiceMeetingParticipant[] {
    return voiceMeetingParticipants.filter(p => p.meetingId === meetingId);
  }

  static createMeetingParticipant(p: Omit<VoiceMeetingParticipant, "id">): VoiceMeetingParticipant {
    const newP: VoiceMeetingParticipant = {
      id: voiceMeetingParticipants.length + 1,
      ...p
    };
    voiceMeetingParticipants.push(newP);
    return newP;
  }

  // 13. VoiceMeetingSummary Repository
  static getMeetingSummary(meetingId: number): VoiceMeetingSummary | undefined {
    return voiceMeetingSummaries.find(s => s.meetingId === meetingId);
  }

  static createMeetingSummary(summary: Omit<VoiceMeetingSummary, "id">): VoiceMeetingSummary {
    const newS: VoiceMeetingSummary = {
      id: voiceMeetingSummaries.length + 1,
      ...summary
    };
    voiceMeetingSummaries.push(newS);
    return newS;
  }

  // 14. VoiceActionItem Repository
  static listActionItems(meetingId?: number): VoiceActionItem[] {
    if (meetingId !== undefined) {
      return voiceActionItems.filter(i => i.meetingId === meetingId);
    }
    return voiceActionItems;
  }

  static createActionItem(item: Omit<VoiceActionItem, "id">): VoiceActionItem {
    const newI: VoiceActionItem = {
      id: voiceActionItems.length + 1,
      ...item
    };
    voiceActionItems.push(newI);
    return newI;
  }

  static updateActionItem(id: number, updates: Partial<Omit<VoiceActionItem, "id">>): VoiceActionItem | undefined {
    const item = voiceActionItems.find(i => i.id === id);
    if (!item) return undefined;
    Object.assign(item, updates);
    return item;
  }

  // 15. VoiceAnalytics Repository
  static getAnalyticsByEmployeeId(employeeId: number): VoiceAnalytics[] {
    return voiceAnalytics.filter(a => a.employeeId === employeeId);
  }

  static getAggregatedAnalytics(employeeId?: number) {
    let filtered = [...voiceAnalytics];
    if (employeeId !== undefined) {
      filtered = filtered.filter(a => a.employeeId === employeeId);
    }
    if (filtered.length === 0) {
      return { totalDuration: 0, avgResponseTimeMs: 0, totalWords: 0, avgSentiment: 0 };
    }
    const totalDuration = filtered.reduce((acc, c) => acc + c.audioDurationSeconds, 0);
    const totalWords = filtered.reduce((acc, c) => acc + c.wordCount, 0);
    const avgResponseTimeMs = filtered.reduce((acc, c) => acc + c.avgResponseTimeMs, 0) / filtered.length;
    const avgSentiment = filtered.reduce((acc, c) => acc + c.sentimentScore, 0) / filtered.length;
    return { totalDuration, avgResponseTimeMs, totalWords, avgSentiment };
  }

  static createAnalytics(analyticsRecord: Omit<VoiceAnalytics, "id">): VoiceAnalytics {
    const newA: VoiceAnalytics = {
      id: voiceAnalytics.length + 1,
      ...analyticsRecord
    };
    voiceAnalytics.push(newA);
    return newA;
  }

  // 16. VoiceAuditLog Repository
  static listAuditLogs(employeeId?: number, page = 1, limit = 10) {
    let result = [...voiceAuditLogs];
    if (employeeId !== undefined) {
      result = result.filter(l => l.employeeId === employeeId);
    }
    const total = result.length;
    const startIndex = (page - 1) * limit;
    const items = result.slice(startIndex, startIndex + limit);
    return { items, total, page, limit };
  }
}
