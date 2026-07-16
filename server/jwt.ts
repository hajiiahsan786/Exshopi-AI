import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "exshopi_super_secure_enterprise_key_2026_salt";

function base64UrlEncode(obj: any): string {
  return Buffer.from(JSON.stringify(obj))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): any {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return JSON.parse(Buffer.from(base64, "base64").toString("utf8"));
}

export interface JWTPayload {
  userId: number;
  email: string;
  roleId: number;
  companyId: number;
  deviceInfo?: string;
  exp?: number;
}

export function generateAccessToken(payload: Omit<JWTPayload, "exp">): string {
  const header = { alg: "HS256", typ: "JWT" };
  // Access token expires in 15 minutes (900 seconds)
  const exp = Math.floor(Date.now() / 1000) + 900;
  const fullPayload = { ...payload, exp };
  
  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(fullPayload);
  
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");
    
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function generateRefreshToken(): string {
  // Generate a cryptographically secure random token for refresh
  return crypto.randomBytes(40).toString("hex");
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64url");
      
    if (signature !== expectedSignature) return null;
    
    const payload = base64UrlDecode(encodedPayload) as JWTPayload;
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Expired
    }
    
    return payload;
  } catch (err) {
    return null;
  }
}
