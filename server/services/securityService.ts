import {
  securityPolicies,
  securityRules,
  securityEvents,
  securityAlerts,
  securityIncidents,
  securityAudits,
  securitySessions,
  trustedDevices,
  loginHistories,
  riskAssessments,
  threatDetections,
  apiKeys,
  apiKeyScopes,
  secretReferences,
  encryptionKeyReferences,
  complianceReports,
  complianceControls,
  complianceAudits
} from "../db";
import {
  SecuritySession,
  TrustedDevice,
  APIKey,
  SecurityIncident,
  SecurityEvent,
  SecurityRule
} from "../../src/types";

export class SecurityService {
  private static mockTotpSecrets = new Map<number, string>(); // userId -> secret

  // A. Multi-Factor Authentication (MFA) & TOTP
  static setupMfaTotp(userId: number): { secret: string; qrCodePlaceholder: string } {
    const secret = `JBSWY3DPEHPK3PXP_MOCK_${userId}`;
    this.mockTotpSecrets.set(userId, secret);

    // Record setup event
    securityEvents.push({
      id: securityEvents.length + 1,
      eventType: "MFA_SETUP_INITIATED",
      severity: "low",
      ipAddress: "127.0.0.1",
      details: `Initialized MFA TOTP enrollment for user #${userId}`,
      timestamp: new Date().toISOString()
    });

    return {
      secret,
      qrCodePlaceholder: `otpauth://totp/ExshopiAI:admin?secret=${secret}&issuer=ExshopiAI`
    };
  }

  static verifyMfaTotp(userId: number, code: string): boolean {
    // Standard simulation of correct code
    if (code === "000000" || code.length === 6) {
      securityEvents.push({
        id: securityEvents.length + 1,
        eventType: "MFA_VERIFIED_SUCCESS",
        severity: "low",
        ipAddress: "127.0.0.1",
        details: `Successful MFA TOTP validation for user #${userId}`,
        timestamp: new Date().toISOString()
      });
      return true;
    }
    return false;
  }

  // B. Trusted Device & Active Session Management
  static createSecureSession(userId: number, ipAddress: string, deviceFingerprint: string): SecuritySession {
    // Enforce concurrent session limit policy
    const activeUserSessions = securitySessions.filter(s => s.userId === userId && s.status === "active");
    if (activeUserSessions.length >= 5) {
      // Auto-revoke oldest session
      const oldest = activeUserSessions.sort((a, b) => a.id - b.id)[0];
      if (oldest) oldest.status = "revoked";
    }

    const nextId = securitySessions.length + 1;
    const sessionToken = `sec_tok_${Math.floor(Math.random() * 90000000 + 10000000)}`;

    const session: SecuritySession = {
      id: nextId,
      userId,
      sessionToken,
      deviceFingerprint,
      ipAddress,
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(), // 2 hours expiration
      mfaVerified: true,
      status: "active"
    };

    securitySessions.push(session);

    loginHistories.push({
      id: loginHistories.length + 1,
      userId,
      status: "success",
      ipAddress,
      deviceFingerprint,
      timestamp: new Date().toISOString()
    });

    return session;
  }

  static revokeSession(tokenId: number): void {
    const s = securitySessions.find(sess => sess.id === tokenId);
    if (s) {
      s.status = "revoked";
    }
  }

  static registerTrustedDevice(userId: number, deviceFingerprint: string, name: string): TrustedDevice {
    const nextId = trustedDevices.length + 1;
    const device: TrustedDevice = {
      id: nextId,
      userId,
      deviceFingerprint,
      deviceName: name,
      verifiedAt: new Date().toISOString()
    };
    trustedDevices.push(device);
    return device;
  }

  // C. API Key Manager with Scopes
  static generateApiKey(keyName: string, scopes: string[]): APIKey {
    const nextId = apiKeys.length + 1;
    const keyVal = `ex_api_${Math.floor(Math.random() * 90000000 + 10000000)}`;
    const apiKeyHash = `sha256_hash_${keyVal.substring(0, 10)}`;

    const key: APIKey = {
      id: nextId,
      keyName,
      apiKeyHash,
      scopeJson: JSON.stringify(scopes),
      status: "active",
      expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()
    };

    apiKeys.push(key);

    scopes.forEach(sc => {
      apiKeyScopes.push({
        id: apiKeyScopes.length + 1,
        apiKeyId: key.id,
        scope: sc
      });
    });

    return key;
  }

  // D. Secrets Management & Vault Reference Encryption
  static writeSecretReference(key: string, value: string): void {
    const existing = secretReferences.find(s => s.secretKey === key);
    if (existing) {
      existing.secretHash = `vault_sha256_${value.length}_masked`;
      existing.updatedAt = new Date().toISOString();
    } else {
      secretReferences.push({
        id: secretReferences.length + 1,
        secretKey: key,
        secretHash: `vault_sha256_${value.length}_masked`,
        updatedAt: new Date().toISOString()
      });
    }
  }

  // E. Dynamic Threat Rules & Incident Timelines
  static triggerSecurityThreat(type: "brute_force" | "impossible_travel" | "api_abuse", ipAddress: string, riskScore: number): SecurityEvent {
    const nextEventId = securityEvents.length + 1;

    const event: SecurityEvent = {
      id: nextEventId,
      eventType: `THREAT_DETECTED_${type.toUpperCase()}`,
      severity: riskScore >= 80 ? "critical" : "high",
      ipAddress,
      details: `Threat signature match: ${type}. Assessed threat risk index: ${riskScore}`,
      timestamp: new Date().toISOString()
    };

    securityEvents.push(event);

    // Auto-alert
    securityAlerts.push({
      id: securityAlerts.length + 1,
      eventId: event.id,
      message: `CRITICAL SEC ALERT: Anomaly detector triggered ${type} signature.`,
      status: "unread",
      timestamp: new Date().toISOString()
    });

    // Spawn Incident for investigation
    const incident: SecurityIncident = {
      id: securityIncidents.length + 1,
      title: `Investigate Threat signature (${type})`,
      status: "open",
      severity: riskScore >= 80 ? "critical" : "high",
      timelineJson: JSON.stringify([{ time: new Date().toISOString(), log: "Incident automatically opened by Threat Detection Engine." }]),
      createdAt: new Date().toISOString()
    };
    securityIncidents.push(incident);

    return event;
  }

  // F. Compliance Audits Mappings
  static runSOC2ComplianceAudit(): { score: number; controlsPassedCount: number; controlsFailedCount: number } {
    const controls = complianceControls.filter(c => c.framework === "SOC2" || c.framework === "PCI-DSS");
    const passed = controls.filter(c => c.status === "passed").length;
    const failed = controls.filter(c => c.status === "failed").length;
    const score = Math.round((passed / controls.length) * 100) || 100;

    return {
      score,
      controlsPassedCount: passed,
      controlsFailedCount: failed
    };
  }
}
