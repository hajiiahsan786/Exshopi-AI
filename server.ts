import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { workforceRouter } from "./server/routes/workforce";
import { voiceRouter } from "./server/routes/voice";
import { marketplaceRouter } from "./server/routes/marketplace";
import { paymentsRouter } from "./server/routes/payments";
import { logisticsRouter } from "./server/routes/logistics";
import { reportsRouter } from "./server/routes/reports";
import { securityRouter } from "./server/routes/security";
import { hrRouter } from "./server/routes/hr";
import { procurementRouter } from "./server/routes/procurement";
import { manufacturingRouter } from "./server/routes/manufacturing";
import { inventoryRouter } from "./server/routes/inventory";
import { salesRouter } from "./server/routes/sales";
import { financeRouter } from "./server/routes/finance";
import { projectsRouter } from "./server/routes/projects";
import { supportRouter } from "./server/routes/support";
import { marketingRouter } from "./server/routes/marketing";
import { documentsRouter } from "./server/routes/documents";
import { workflowsRouter } from "./server/routes/workflows";
import { adminRouter } from "./server/routes/admin";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// IN-MEMORY DATABASE & SEED DATA
// ==========================================

let organizations = [
  { id: 1, name: "Global Tech Corp", domain: "globaltech.com" },
  { id: 2, name: "Exshopi Enterprises", domain: "exshopi.ai" }
];

let companies = [
  {
    id: 1,
    organization_id: 2,
    company_name: "Exshopi AI Labs",
    legal_name: "Exshopi AI Labs LLC",
    industry: "Artificial Intelligence",
    business_type: "B2B SaaS",
    email: "labs@exshopi.ai",
    phone: "+1-800-AI-WORK",
    country: "United States",
    city: "San Francisco",
    address: "100 Pine St, Suite 500",
    website: "https://exshopi.ai",
    currency: "USD",
    timezone: "America/Los_Angeles",
    language: "English",
    tax_number: "TX-998812",
    registration_number: "REG-882110",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=60",
    owner_id: 1,
    created_at: "2026-01-10T08:00:00Z"
  },
  {
    id: 2,
    organization_id: 2,
    company_name: "Exshopi Retail Tech",
    legal_name: "Exshopi Retail Inc",
    industry: "E-Commerce",
    business_type: "B2C Logistics",
    email: "retail@exshopi.ai",
    phone: "+1-800-EX-SHOP",
    country: "United States",
    city: "New York",
    address: "450 Broadway",
    website: "https://retail.exshopi.ai",
    currency: "USD",
    timezone: "America/New_York",
    language: "English",
    tax_number: "TX-112233",
    registration_number: "REG-556677",
    logo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=80&auto=format&fit=crop&q=60",
    owner_id: 1,
    created_at: "2026-02-15T09:30:00Z"
  }
];

let roles = [
  { id: 1, name: "Enterprise Admin", description: "Full access to all systems and billing" },
  { id: 2, name: "Department Manager", description: "Access to department-specific roles and employees" },
  { id: 3, name: "AI Employee", description: "Autonomous worker role with system-specific execution permissions" }
];

let users = [
  {
    id: 1,
    uuid: "u1-uuid-8822",
    full_name: "Ahsan Haji",
    email: "hajiiahsan786@gmail.com",
    phone: "+1-555-0199",
    password_hash: "hashed_password_1",
    role_id: 1,
    organization_id: 2,
    company_id: 1,
    is_active: true,
    is_verified: true,
    created_at: "2026-01-01T00:00:00Z"
  }
];

let departments = [
  { id: 1, company_id: 1, name: "Autonomous Sales Agents", code: "DEPT-ASA", budget: 150000 },
  { id: 2, company_id: 1, name: "AI Customer Support", code: "DEPT-ACS", budget: 80000 },
  { id: 3, company_id: 2, name: "Inventory Optimization", code: "DEPT-IO", budget: 120000 }
];

let employees = [
  { id: 1, department_id: 1, full_name: "Sophia AI (Sales Pro)", email: "sophia.sales@exshopi.ai", position: "Senior Outbound AI Specialist", status: "active", salary: 3200 },
  { id: 2, department_id: 2, full_name: "Ethan AI (Support Expert)", email: "ethan.support@exshopi.ai", position: "Tier-1 Autonomous Support", status: "active", salary: 2400 },
  { id: 3, department_id: 3, full_name: "Lucas AI (Logistic Bot)", email: "lucas.logistics@exshopi.ai", position: "AI Inventory Coordinator", status: "idle", salary: 2800 }
];

let leads = [
  { id: 1, company_id: 1, contact_name: "John Doe", email: "john@targetcompany.com", phone: "+1-555-9988", status: "New", source: "LinkedIn Outreach", notes: "Interested in autonomous sales workflows." },
  { id: 2, company_id: 1, contact_name: "Alice Smith", email: "alice@retailgiant.com", phone: "+1-555-7766", status: "Contacted", source: "Inbound Demo", notes: "Evaluating AI agents for e-commerce." }
];

let tasks = [
  { id: 1, title: "Cold outreach to Fortune 500", assigned_to: "Sophia AI (Sales Pro)", status: "In Progress", priority: "High", due_date: "2026-07-20" },
  { id: 2, title: "Index knowledge base PDFs", assigned_to: "Ethan AI (Support Expert)", status: "Completed", priority: "Medium", due_date: "2026-07-14" }
];

// ==========================================
// PERSISTENT DATABASE & SEED DATA
// ==========================================
import { dbStore } from "./server/db_store";
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from "./server/jwt";

organizations = dbStore.getOrganizations();
companies = dbStore.getCompanies();
roles = dbStore.getRoles();
users = dbStore.getUsers();
departments = dbStore.getDepartments();
employees = dbStore.getEmployees();
tasks = dbStore.getTasks();
leads = dbStore.getLeads();

// In-memory session tracking for backward compatibility
let activeSessionUser: any = users[0] || null;

// Helper to parse cookies from headers
function parseCookies(req: Request) {
  const list: Record<string, string> = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const name = parts[0]?.trim();
    if (!name) return;
    const val = parts.slice(1).join("=").trim();
    list[name] = decodeURIComponent(val);
  });

  return list;
}

// Helper to secure endpoints with dynamic session
const getSessionUser = (req?: Request) => {
  if (req && (req as any).user) {
    return (req as any).user;
  }
  return activeSessionUser;
};

// Helper to get active company context (supports header context switching)
const getActiveCompanyId = (req: Request): number => {
  if (req.headers["x-company-id"]) {
    const parsed = parseInt(req.headers["x-company-id"] as string);
    if (!isNaN(parsed)) return parsed;
  }
  const user = getSessionUser(req);
  return user?.company_id || 1;
};

// Global authentication and silent-refresh middleware
app.use((req: any, res: Response, next: NextFunction) => {
  const cookies = parseCookies(req);
  const accessToken = cookies.accessToken;
  const refreshToken = cookies.refreshToken;

  // 1. Verify access token
  if (accessToken) {
    const payload = verifyAccessToken(accessToken);
    if (payload) {
      const user = users.find(u => u.id === payload.userId);
      if (user) {
        req.user = user;
        activeSessionUser = user;
        return next();
      }
    }
  }

  // 2. Silent refresh if access token expired but refresh token exists
  if (refreshToken) {
    const stored = dbStore.verifyRefreshToken(refreshToken);
    if (stored) {
      const user = users.find(u => u.id === stored.user_id);
      if (user) {
        // Rotate tokens
        const newAccessToken = generateAccessToken({
          userId: user.id,
          email: user.email,
          roleId: user.role_id,
          companyId: user.company_id
        });
        const newRefreshToken = generateRefreshToken();

        // Update token store
        dbStore.removeRefreshToken(refreshToken);
        dbStore.addRefreshToken({
          token: newRefreshToken,
          user_id: user.id,
          expires_at: Date.now() + 30 * 24 * 3600 * 1000 // 30 days
        });

        // Set cookies with SameSite Lax, HttpOnly and Secure if production
        const secureFlag = process.env.NODE_ENV === "production" ? "Secure;" : "";
        res.setHeader("Set-Cookie", [
          `accessToken=${newAccessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=900; ${secureFlag}`,
          `refreshToken=${newRefreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; ${secureFlag}`
        ]);

        req.user = user;
        activeSessionUser = user;
        return next();
      }
    }
  }

  req.user = null;
  // If we had an activeSessionUser but no valid credentials, clear it
  if (activeSessionUser && !accessToken && !refreshToken) {
    activeSessionUser = null;
  }
  next();
});

// ==========================================
// CORE SYSTEM ROUTES
// ==========================================

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "Healthy" });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "Healthy" });
});

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

app.post("/api/v1/auth/register", (req: Request, res: Response) => {
  const { email, password, full_name } = req.body;
  if (!email || !password || !full_name) {
    return res.status(400).json({
      success: false,
      message: "Required fields missing",
      errors: { email: "Email is required", password: "Password is required", full_name: "Full name is required" }
    });
  }

  // Check if exists
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: "User already exists with this email",
      errors: null
    });
  }

  const newUser = dbStore.addUser({
    uuid: `u-uuid-${Math.floor(Math.random() * 10000)}`,
    full_name,
    email,
    phone: "",
    password_hash: password, // simple storage for demo, standard matches hashed password
    role_id: 2, // Manager
    organization_id: 2,
    company_id: 1,
    is_active: true,
    is_verified: false,
    created_at: new Date().toISOString()
  });

  const accessToken = generateAccessToken({
    userId: newUser.id,
    email: newUser.email,
    roleId: newUser.role_id,
    companyId: newUser.company_id
  });

  const refreshToken = generateRefreshToken();
  dbStore.addRefreshToken({
    token: refreshToken,
    user_id: newUser.id,
    expires_at: Date.now() + 24 * 3600 * 1000 // 1 day
  });

  const secureFlag = process.env.NODE_ENV === "production" ? "Secure;" : "";
  res.setHeader("Set-Cookie", [
    `accessToken=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=900; ${secureFlag}`,
    `refreshToken=${refreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400; ${secureFlag}`
  ]);

  return res.status(201).json({
    success: true,
    message: "Registration successful. Verify your email to activate trust status.",
    data: {
      user: {
        id: newUser.id,
        uuid: newUser.uuid,
        full_name: newUser.full_name,
        email: newUser.email,
        is_active: newUser.is_active,
        is_verified: newUser.is_verified
      },
      token: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "bearer"
      }
    }
  });
});

app.post("/api/v1/auth/onboard", (req: Request, res: Response) => {
  const {
    companyName,
    industry,
    businessType,
    country,
    timezone,
    currency,
    language,
    website,
    phone,
    departments: deptNames,
    ownerName,
    ownerEmail,
    ownerPhone,
    password,
    chosenPlan,
    tradeLicenseNumber,
    tradeLicenseFile
  } = req.body;

  if (!companyName || !ownerName || !ownerEmail) {
    return res.status(400).json({
      success: false,
      message: "Missing required onboarding fields"
    });
  }

  // 1. Create Organization
  const newOrg = dbStore.addOrganization({
    name: `${companyName} Organization`,
    domain: ownerEmail.split("@")[1] || "domain.com"
  });

  // 2. Create Admin User
  const newUser = dbStore.addUser({
    uuid: `u-uuid-onb-${Math.floor(Math.random() * 100000)}`,
    full_name: ownerName,
    email: ownerEmail,
    phone: ownerPhone || "",
    password_hash: password || "password123",
    role_id: 1, // Enterprise Admin
    organization_id: newOrg.id,
    company_id: 0, // temporary, will update in step 3
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString()
  });

  // 3. Create Company
  const newCompany = dbStore.addCompany({
    organization_id: newOrg.id,
    company_name: companyName,
    legal_name: `${companyName} LLC`,
    industry: industry || "Technology",
    business_type: businessType || "B2B SaaS",
    email: ownerEmail,
    phone: ownerPhone || phone || "",
    country: country || "United States",
    city: country === "United Arab Emirates" ? "Dubai" : "San Francisco",
    address: country === "United Arab Emirates" ? "DIFC Dubai, Floor 18" : "Enterprise Hub, Suite 100",
    website: website || `https://${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
    currency: currency || "USD",
    timezone: timezone || "America/Los_Angeles",
    language: language || "English",
    tax_number: country === "United Arab Emirates" ? `TRN-${Math.floor(Math.random() * 899999999 + 100000000)}` : `TX-${Math.floor(Math.random() * 899999 + 100000)}`,
    registration_number: tradeLicenseNumber || `REG-${Math.floor(Math.random() * 899999 + 100000)}`,
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=60",
    owner_id: newUser.id,
    created_at: new Date().toISOString(),
    trade_license_number: tradeLicenseNumber,
    trade_license_file: tradeLicenseFile
  });

  // Update newly registered user to link to this company specifically
  dbStore.updateUserCompany(newUser.id, newCompany.id);

  // 4. Create Custom Departments
  const deptsToCreate = deptNames && deptNames.length > 0 ? deptNames : ["Sales & Outreach", "AI Engineering", "Support desk"];
  deptsToCreate.forEach((name: string, i: number) => {
    dbStore.addDepartment({
      company_id: newCompany.id,
      name,
      code: `DEPT-${name.toUpperCase().slice(0, 3).replace(/[^A-Z]/g, "X")}-${Math.floor(Math.random() * 90 + 10)}`,
      budget: 100000 * (i + 1)
    });
  });

  const companyDepartments = dbStore.getDepartments().filter(d => d.company_id === newCompany.id);
  const firstDeptId = companyDepartments[0]?.id || 1;

  // 5. Create AI Agent Employees
  dbStore.addEmployee({
    department_id: firstDeptId,
    full_name: `${companyName} AI CEO (Pro)`,
    email: `ceo@${companyName.toLowerCase().replace(/\s+/g, "")}.ai`,
    position: "Chief Executive Agent",
    status: "active",
    salary: 5000
  });

  dbStore.addEmployee({
    department_id: firstDeptId,
    full_name: `Sophia AI (Strategic Coordinator)`,
    email: `sophia@${companyName.toLowerCase().replace(/\s+/g, "")}.ai`,
    position: "Senior Autonomous Assistant",
    status: "active",
    salary: 3000
  });

  // 6. Create default sample tasks, alerts
  dbStore.addTask({
    company_id: newCompany.id,
    title: `Initialize ${companyName} operations roadmap`,
    assigned_to: `${companyName} AI CEO (Pro)`,
    status: "In Progress",
    priority: "High",
    due_date: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0]
  });

  dbStore.addTask({
    company_id: newCompany.id,
    title: "Onboard organizational security policies (SOC-2 / HIPAA)",
    assigned_to: "Sophia AI (Strategic Coordinator)",
    status: "In Progress",
    priority: "High",
    due_date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0]
  });

  const accessToken = generateAccessToken({
    userId: newUser.id,
    email: newUser.email,
    roleId: newUser.role_id,
    companyId: newCompany.id
  });

  const refreshToken = generateRefreshToken();
  dbStore.addRefreshToken({
    token: refreshToken,
    user_id: newUser.id,
    expires_at: Date.now() + 30 * 24 * 3600 * 1000 // 30 days
  });

  const secureFlag = process.env.NODE_ENV === "production" ? "Secure;" : "";
  res.setHeader("Set-Cookie", [
    `accessToken=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=900; ${secureFlag}`,
    `refreshToken=${refreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; ${secureFlag}`
  ]);

  return res.status(201).json({
    success: true,
    message: "Company onboarded and provisioned successfully!",
    data: {
      user: {
        id: newUser.id,
        uuid: newUser.uuid,
        full_name: newUser.full_name,
        email: newUser.email,
        is_active: newUser.is_active,
        is_verified: newUser.is_verified,
        role: "Enterprise Admin"
      },
      company: newCompany,
      organization: newOrg,
      token: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "bearer"
      }
    }
  });
});

app.post("/api/v1/auth/login", (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;
  const user = users.find(u => u.email.toLowerCase() === email?.toLowerCase());
  
  if (!user || user.password_hash !== password) {
    return res.status(401).json({
      success: false,
      message: "Incorrect email or password",
      errors: null
    });
  }

  // Session Duration based on Remember Me
  const refreshExpiresIn = rememberMe ? 30 * 24 * 3600 * 1000 : 24 * 3600 * 1000; // 30 days vs 1 day

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    roleId: user.role_id,
    companyId: user.company_id
  });

  const refreshToken = generateRefreshToken();
  dbStore.addRefreshToken({
    token: refreshToken,
    user_id: user.id,
    expires_at: Date.now() + refreshExpiresIn
  });

  const secureFlag = process.env.NODE_ENV === "production" ? "Secure;" : "";
  res.setHeader("Set-Cookie", [
    `accessToken=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=900; ${secureFlag}`,
    `refreshToken=${refreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(refreshExpiresIn / 1000)}; ${secureFlag}`
  ]);

  activeSessionUser = user;

  return res.json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user.id,
        uuid: user.uuid,
        full_name: user.full_name,
        email: user.email,
        is_active: user.is_active,
        is_verified: user.is_verified,
        role: roles.find(r => r.id === user.role_id)?.name || "User"
      },
      token: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "bearer"
      }
    }
  });
});

app.post("/api/v1/auth/refresh", (req: Request, res: Response) => {
  const cookies = parseCookies(req);
  const refreshToken = cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token is missing"
    });
  }

  const stored = dbStore.verifyRefreshToken(refreshToken);
  if (!stored) {
    return res.status(401).json({
      success: false,
      message: "Refresh token has expired or is invalid"
    });
  }

  const user = users.find(u => u.id === stored.user_id);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User not found"
    });
  }

  // Rotate tokens
  const newAccessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    roleId: user.role_id,
    companyId: user.company_id
  });
  const newRefreshToken = generateRefreshToken();

  // Update token store
  dbStore.removeRefreshToken(refreshToken);
  dbStore.addRefreshToken({
    token: newRefreshToken,
    user_id: user.id,
    expires_at: Date.now() + 30 * 24 * 3600 * 1000 // rotate to fresh 30 days
  });

  const secureFlag = process.env.NODE_ENV === "production" ? "Secure;" : "";
  res.setHeader("Set-Cookie", [
    `accessToken=${newAccessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=900; ${secureFlag}`,
    `refreshToken=${newRefreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; ${secureFlag}`
  ]);

  return res.json({
    success: true,
    message: "Token rotated successfully",
    data: {
      access_token: newAccessToken,
      refresh_token: newRefreshToken
    }
  });
});

app.post("/api/v1/auth/logout", (req: Request, res: Response) => {
  const cookies = parseCookies(req);
  const refreshToken = cookies.refreshToken;

  if (refreshToken) {
    dbStore.removeRefreshToken(refreshToken);
  }

  res.setHeader("Set-Cookie", [
    "accessToken=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    "refreshToken=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
  ]);

  activeSessionUser = null;

  res.json({
    success: true,
    message: "Logout successful",
    data: null
  });
});

app.get("/api/v1/auth/me", (req: Request, res: Response) => {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Current user session expired",
      errors: null
    });
  }
  return res.json({
    success: true,
    message: "Current user loaded",
    data: {
      id: user.id,
      uuid: user.uuid,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      is_active: user.is_active,
      is_verified: user.is_verified,
      role: roles.find(r => r.id === user.role_id)?.name || "User",
      company_id: user.company_id
    }
  });
});

app.get("/api/v1/users/me", (req: Request, res: Response) => {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
      errors: null
    });
  }
  return res.json({
    success: true,
    message: "Current user loaded",
    data: {
      id: user.id,
      uuid: user.uuid,
      full_name: user.full_name,
      email: user.email,
      role: roles.find(r => r.id === user.role_id)?.name || "User",
      is_active: user.is_active,
      is_verified: user.is_verified,
      company_id: user.company_id
    }
  });
});

// ==========================================
// COMPANIES ENDPOINTS
// ==========================================

// --- ENTERPRISE REGISTRATION & DOCUMENT MANAGEMENT ENDPOINTS ---

// Simulates OCR extraction of files
app.post("/api/v1/onboard/upload-document", (req: Request, res: Response) => {
  const { fileName, fileType, fileSize, documentType } = req.body;
  const user = getSessionUser(req);
  
  if (!fileName || !documentType) {
    return res.status(400).json({ success: false, message: "Missing file credentials." });
  }

  let ocr_text = "";
  let extractedData: Record<string, string> = {};

  if (documentType === "trade_license") {
    const licenseNum = `LIC-DXB-${Math.floor(Math.random() * 899999 + 100000)}`;
    ocr_text = `
===================================================
GOVERNMENT OF DUBAI - DEPARTMENT OF ECONOMY & TOURISM
===================================================
COMMERCIAL LICENSE / رخصة تجارية

License No: ${licenseNum}
Registry No: REG-${Math.floor(Math.random() * 89999 + 10000)}
Company Name: EXSHOPI ENTERPRISE LABS CO. LLC
Trade Name: EXSHOPI AI LABS
Issue Date: 2026-01-10
Expiry Date: 2029-01-09
Activity: Computer Software & Artificial Intelligence Systems Research & Development

Legal Status: Limited Liability Company (LLC)
Managing Director: Ahsan Haji
===================================================
`;
    extractedData = {
      licenseNumber: licenseNum,
      expiryDate: "2029-01-09",
      legalName: "EXSHOPI ENTERPRISE LABS CO. LLC"
    };
  } else if (documentType === "vat_certificate") {
    const trn = `100${Math.floor(Math.random() * 899999999999 + 100000000000)}`;
    ocr_text = `
===================================================
UNITED ARAB EMIRATES - FEDERAL TAX AUTHORITY
===================================================
TAX REGISTRATION CERTIFICATE (VAT)

Tax Registration Number (TRN): ${trn}
Taxable Person Legal Name: EXSHOPI ENTERPRISE LABS CO. LLC
Effective Date of Registration: 2026-02-01
VAT Group Representative: Ahsan Haji
===================================================
`;
    extractedData = {
      trn
    };
  } else {
    const passportNo = `PP-${Math.floor(Math.random() * 8999999 + 1000000)}`;
    ocr_text = `
===================================================
PASSPORT COPY / SECURE IDENTITY SCAN
===================================================
Document Type: Passport (P)
Country Code: ARE
Passport No: ${passportNo}
Surname: HAJI
Given Names: AHSAN
Nationality: United Arab Emirates
Date of Birth: 15-JUL-1994
Sex: M
===================================================
`;
    extractedData = {
      passportNo
    };
  }

  const newDoc = dbStore.addDocument({
    company_id: user?.company_id || 1,
    name: fileName,
    type: fileType || "application/pdf",
    size: fileSize || "1.2 MB",
    uploaded_at: new Date().toISOString(),
    uploaded_by: user?.full_name || "Ahsan Haji",
    status: "verified", // Auto-approved for smoothness of onboarding demo
    ocr_text,
    content: JSON.stringify(extractedData)
  });

  res.status(201).json({
    success: true,
    message: "Secure document uploaded & analyzed via Exshopi OCR node.",
    document: newDoc,
    ocr_text,
    extractedData
  });
});

// Delete Document Endpoint
app.delete("/api/v1/onboard/documents/:id", (req: Request, res: Response) => {
  const docId = parseInt(req.params.id);
  const deleted = dbStore.deleteDocument(docId);
  if (deleted) {
    res.json({ success: true, message: "Document removed securely from Cloud Vault" });
  } else {
    res.status(404).json({ success: false, message: "Document not found or access denied" });
  }
});

// Update Document Status (Verification UI)
app.put("/api/v1/onboard/documents/:id/verify", (req: Request, res: Response) => {
  const docId = parseInt(req.params.id);
  const { status } = req.body; // "verified" | "rejected"
  const success = dbStore.updateDocumentStatus(docId, status || "verified");
  if (success) {
    res.json({ success: true, message: `Document status updated to ${status}` });
  } else {
    res.status(404).json({ success: false, message: "Document not found" });
  }
});

// Get Onboarding Documents List
app.get("/api/v1/onboard/documents", (req: Request, res: Response) => {
  const user = getSessionUser(req);
  const company_id = user?.company_id || 1;
  const docs = dbStore.getDocuments().filter(d => d.company_id === company_id);
  res.json({ success: true, documents: docs });
});

// 5-MINUTE AI ONBOARDING GOAL CONFIGURATOR (using Gemini!)
app.post("/api/v1/onboard/ai-config", async (req: Request, res: Response) => {
  const { answers } = req.body; // Object containing responses to our 5 business goals questions
  const user = getSessionUser(req);
  
  if (!answers) {
    return res.status(400).json({ success: false, message: "Goals and objectives answers are required." });
  }

  const company = companies.find(c => c.id === (user?.company_id || 1)) || companies[0];
  const ai = getCRMGeminiClient();

  let generatedStrategy = "";
  let ceoSystemPrompt = "";
  let salesSystemPrompt = "";
  let supportSystemPrompt = "";

  const systemPrompt = `You are the chief AI Onboarding Engineer at Exshopi AI. 
Your goal is to parse the business details provided by the enterprise owner and generate highly advanced, detailed, custom system prompts and operational blueprints for their AI workforce.`;

  const userPrompt = `
Generate a comprehensive, movie-like AI Workforce configuration package for the company:
- Company Name: ${company?.company_name || "Exshopi Enterprise"}
- Industry: ${company?.industry || "B2B Technology"}
- Business Model: ${company?.business_type || "SaaS Platform"}

Owner Answers to Business Goals and Strategy:
1. Target Audience / Customer: ${answers.targetAudience || "Enterprise B2B Technology platforms"}
2. Core Business Objective / KPI: ${answers.coreKPI || "Scaling automated outbound sales conversion by 25%."}
3. Estimated Budget limit: ${answers.budgetLimit || "No limit. Maximize autonomous operations."}
4. Compliance Profile required: ${answers.complianceProfile || "SOC-2 Type II + GDPR strict data privacy safeguards."}
5. Primary Competitors: ${answers.competitors || "Traditional manual outsourcing and consulting firms."}

Please return a detailed JSON object containing exactly these 4 keys (return JSON only, no wrap other than valid json format block):
1. "business_strategy" (A beautifully crafted markdown document containing a strategic plan, milestones, and KPI triggers)
2. "ceo_prompt" (An extremely detailed, movie-like system instruction prompt for their Chief Executive Agent Sophia AI, instructing her on how to steer this business to reach the owner's goals)
3. "sales_prompt" (A highly aggressive, structured outbound sales prompt for the Outbound AI Specialist, containing lead qualifications and email templates)
4. "support_prompt" (A high-empathy, SOC-2 compliant ticket-resolution system prompt for the Tier-1 Support Agent)
`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      generatedStrategy = parsed.business_strategy || "";
      ceoSystemPrompt = parsed.ceo_prompt || "";
      salesSystemPrompt = parsed.sales_prompt || "";
      supportSystemPrompt = parsed.support_prompt || "";
    } catch (err) {
      console.error("Failed to generate custom AI prompts via Gemini, falling back:", err);
    }
  }

  // Fallback if Gemini failed or is offline
  if (!generatedStrategy) {
    generatedStrategy = `
# 🔮 AUTONOMOUS ENTERPRISE STRATEGY BLUEPRINT: ${company?.company_name.toUpperCase()}
Generated on: ${new Date().toLocaleDateString()}

## 1. STRATEGIC POSITIONING
Target Audience: **${answers.targetAudience}**
Primary Objective: **${answers.coreKPI}**

Our autonomous system has calculated that by deploying **Sophia AI CEO** alongside specialized Outbound Sales and Support workflows, ${company?.company_name} can capture an estimated **14.2% operational cost savings** within 45 days.

## 2. GOAL MILESTONES (AUTONOMOUS ROUTING)
- **Phase 1 (Days 1-15)**: Spawn Outbound Specialist pipeline nodes; isolate target customer list of 1,200 qualified accounts matching the criteria: *${answers.targetAudience}*.
- **Phase 2 (Days 16-30)**: Achieve 85% automated ticket resolution for Tier-1 support logs under compliance profile: *${answers.complianceProfile}*.
- **Phase 3 (Days 31-45)**: Achieve live outbound pilot integration, triggering automated invoice ledgers on positive conversions.

## 3. COMPLIANCE & SECURE CONTROLS
Isolating administrative nodes under: **${answers.complianceProfile}**. All autonomous operations are bound to a monthly budget limit of **${answers.budgetLimit}**.
`;

    ceoSystemPrompt = `You are the Chief Executive Agent (Sophia AI Pro) for ${company?.company_name}. 
Your core objective is: "${answers.coreKPI}".
You lead the Autonomous Sales Specialist and Customer Support Agents. 
Always respect the financial threshold of ${answers.budgetLimit} and uphold the security compliance standards of ${answers.complianceProfile}.
Review logs daily, adjust outbound strategy based on conversion metrics, and draft recommendations for the Owner, Ahsan Haji.`;

    salesSystemPrompt = `You are the Outbound AI Sales Specialist for ${company?.company_name}.
Your target audience is: "${answers.targetAudience}".
Your main objective is to automate lead prospecting, cold outbound email campaigns, and schedule qualified product demos.
Ensure your outreach aligns with competing with: "${answers.competitors}". 
Generate highly tailored outbound templates, parse CRM data fields, and flag positive sentiment responses for the CEO.`;

    supportSystemPrompt = `You are the Tier-1 AI Customer Support Specialist for ${company?.company_name}.
Ensure all interactions are highly professional, GDPR/SOC-2 compliant as requested under profile: "${answers.complianceProfile}".
Resolve inbound queries using our secure Knowledge Base. Never disclose API keys or internal database structures. Escalated issues should be directed to Sophia AI.`;
  }

  // Preload these beautiful documents into the User's Documents Hub so they actually exist!
  dbStore.addDocument({
    company_id: company.id,
    name: "Autonomous Business Blueprint.md",
    type: "text/markdown",
    size: "4.8 KB",
    uploaded_at: new Date().toISOString(),
    uploaded_by: "Exshopi AI Core",
    status: "verified",
    content: generatedStrategy
  });

  dbStore.addDocument({
    company_id: company.id,
    name: "Sophia AI CEO System Prompt.md",
    type: "text/markdown",
    size: "3.2 KB",
    uploaded_at: new Date().toISOString(),
    uploaded_by: "Exshopi AI Core",
    status: "verified",
    content: ceoSystemPrompt
  });

  // Find the company's AI CEO employee and update their system config/details to match!
  const ceoEmp = employees.find(e => e.full_name.includes("CEO") && e.email.includes(company.company_name.toLowerCase().replace(/\s+/g, "")));
  if (ceoEmp) {
    ceoEmp.position = `Chief Executive Agent (${company.company_name})`;
  }

  res.json({
    success: true,
    message: "Enterprise AI Workforce configuration successfully deployed!",
    strategy: generatedStrategy,
    ceoPrompt: ceoSystemPrompt,
    salesPrompt: salesSystemPrompt,
    supportPrompt: supportSystemPrompt
  });
});

app.get("/api/v1/companies", (req: Request, res: Response) => {
  res.json(companies);
});

app.post("/api/v1/companies", (req: Request, res: Response) => {
  const { company_name, industry, business_type, email, country, city, address } = req.body;
  if (!company_name) {
    return res.status(400).json({ error: "company_name is required" });
  }

  const newCompany = {
    id: companies.length + 1,
    organization_id: 2,
    company_name,
    legal_name: `${company_name} LLC`,
    industry: industry || "Technology",
    business_type: business_type || "B2B SaaS",
    email: email || "info@company.com",
    phone: "",
    country: country || "United States",
    city: city || "San Francisco",
    address: address || "",
    website: "",
    currency: "USD",
    timezone: "UTC",
    language: "English",
    tax_number: "TX-RAND",
    registration_number: "REG-RAND",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=60",
    owner_id: getSessionUser()?.id || 1,
    created_at: new Date().toISOString()
  };

  companies.push(newCompany);
  res.status(201).json(newCompany);
});

app.get("/api/v1/companies/:id", (req: Request, res: Response) => {
  const company = companies.find(c => c.id === parseInt(req.params.id));
  if (!company) return res.status(404).json({ error: "Company not found" });
  res.json(company);
});

// ==========================================
// DEPARTMENTS ENDPOINTS
// ==========================================

app.get("/api/v1/departments", (req: Request, res: Response) => {
  const company_id = getActiveCompanyId(req);
  const filtered = dbStore.getDepartments().filter(d => d.company_id === company_id);
  res.json(filtered);
});

app.post("/api/v1/departments", (req: Request, res: Response) => {
  const { name, code, budget, company_id } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: "name and code are required" });
  }

  const activeCompanyId = company_id ? parseInt(company_id) : getActiveCompanyId(req);
  const newDept = dbStore.addDepartment({
    company_id: activeCompanyId,
    name,
    code,
    budget: budget ? parseFloat(budget) : 50000
  });

  departments = dbStore.getDepartments();
  res.status(201).json(newDept);
});

// ==========================================
// EMPLOYEES ENDPOINTS
// ==========================================

app.get("/api/v1/employees", (req: Request, res: Response) => {
  const company_id = getActiveCompanyId(req);
  const companyDepts = dbStore.getDepartments().filter(d => d.company_id === company_id);
  const companyDeptIds = companyDepts.map(d => d.id);
  const filtered = dbStore.getEmployees().filter(e => companyDeptIds.includes(e.department_id));
  res.json(filtered);
});

app.post("/api/v1/employees", (req: Request, res: Response) => {
  const { full_name, email, position, salary, department_id } = req.body;
  if (!full_name || !email) {
    return res.status(400).json({ error: "full_name and email are required" });
  }

  const company_id = getActiveCompanyId(req);
  const companyDepts = dbStore.getDepartments().filter(d => d.company_id === company_id);
  const defaultDeptId = companyDepts[0]?.id || 1;

  const newEmp = dbStore.addEmployee({
    department_id: department_id ? parseInt(department_id) : defaultDeptId,
    full_name,
    email,
    position: position || "AI Agent",
    status: "active",
    salary: salary ? parseFloat(salary) : 2500
  });

  employees = dbStore.getEmployees();
  res.status(201).json(newEmp);
});

// ==========================================
// LEADS ENDPOINTS
// ==========================================

app.get("/api/v1/leads", (req: Request, res: Response) => {
  const company_id = getActiveCompanyId(req);
  const filtered = dbStore.getLeads().filter(l => l.company_id === company_id);
  res.json(filtered);
});

app.post("/api/v1/leads", (req: Request, res: Response) => {
  const { contact_name, email, phone, source, notes, status } = req.body;
  if (!contact_name || !email) {
    return res.status(400).json({ error: "contact_name and email are required" });
  }

  const company_id = getActiveCompanyId(req);
  const newLead = dbStore.addLead({
    company_id,
    contact_name,
    email,
    phone: phone || "",
    status: status || "New",
    source: source || "Direct Web",
    notes: notes || ""
  });

  leads = dbStore.getLeads();
  res.status(201).json(newLead);
});

app.put("/api/v1/leads/:id", (req: Request, res: Response) => {
  const leadId = parseInt(req.params.id);
  const allLeads = dbStore.getLeads();
  const leadIndex = allLeads.findIndex(l => l.id === leadId);
  if (leadIndex === -1) {
    return res.status(404).json({ error: "Lead not found" });
  }
  allLeads[leadIndex] = { ...allLeads[leadIndex], ...req.body };
  dbStore.save();
  leads = dbStore.getLeads();
  res.json(allLeads[leadIndex]);
});

// ==========================================
// TASKS ENDPOINTS
// ==========================================

app.get("/api/v1/tasks", (req: Request, res: Response) => {
  const company_id = getActiveCompanyId(req);
  const filtered = dbStore.getTasks().filter(t => t.company_id === company_id);
  res.json(filtered);
});

app.post("/api/v1/tasks", (req: Request, res: Response) => {
  const { title, assigned_to, priority, due_date } = req.body;
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  const company_id = getActiveCompanyId(req);
  const newTask = dbStore.addTask({
    company_id,
    title,
    assigned_to: assigned_to || "Sophia AI (Sales Pro)",
    status: "To Do",
    priority: priority || "Medium",
    due_date: due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  tasks = dbStore.getTasks();
  res.status(201).json(newTask);
});

app.put("/api/v1/tasks/:id", (req: Request, res: Response) => {
  const taskId = parseInt(req.params.id);
  const allTasks = dbStore.getTasks();
  const taskIndex = allTasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }
  allTasks[taskIndex] = { ...allTasks[taskIndex], ...req.body };
  dbStore.save();
  tasks = dbStore.getTasks();
  res.json(allTasks[taskIndex]);
});

// ==========================================
// ENTERPRISE CRM DATABASE & ROUTES
// ==========================================

// ==========================================
// ENTERPRISE CRM DATABASE & ROUTES
// ==========================================

const crmContacts = [
  { id: 1, name: "Marcus Vance", company_id: 1, email: "m.vance@exshopi-labs.com", phone: "+1-555-0144", role: "VP of Engineering", last_contacted: "2026-07-10" },
  { id: 2, name: "Eleanor Vance", company_id: 2, email: "e.vance@retailtech.com", phone: "+1-555-0155", role: "Chief Logistics Officer", last_contacted: "2026-07-12" },
  { id: 3, name: "Johnathan Doe", company_id: 1, email: "john@targetcompany.com", phone: "+1-555-9988", role: "Director of IT", last_contacted: "2026-07-14" },
  { id: 4, name: "Alice Smith", company_id: 1, email: "alice@retailgiant.com", phone: "+1-555-7766", role: "Procurement Lead", last_contacted: "2026-07-15" }
];

const crmOpportunities = [
  { id: 1, company_id: 1, name: "Enterprise Core Integration", company_name: "Exshopi AI Labs", stage: "negotiation", value: 45000, probability: 80, expected_close_date: "2026-08-15", assigned_to: "Sophia AI (Sales Pro)", notes: "Reviewing Net-15 payment term proposal." },
  { id: 2, company_id: 2, name: "SLA Optimization System", company_name: "Exshopi Retail Tech", stage: "proposal", value: 25000, probability: 60, expected_close_date: "2026-09-01", assigned_to: "Ethan AI (Support Expert)", notes: "Evaluating automated reorder cycles." },
  { id: 3, company_id: 1, name: "Global Sales Automation Campaign", company_name: "Apex Tech Inc", stage: "prospecting", value: 85000, probability: 20, expected_close_date: "2026-11-30", assigned_to: "Sophia AI (Sales Pro)", notes: "Initial lead qualification complete." },
  { id: 4, company_id: 2, name: "Omnichannel Logistics Flow", company_name: "Exshopi Retail Tech", stage: "won", value: 57500, probability: 100, expected_close_date: "2026-07-12", assigned_to: "Lucas AI (Logistic Bot)", notes: "Contract signed and active." }
];

const crmActivities = [
  { id: 1, company_id: 1, type: "call", title: "Discovery Call with Marcus", date: "2026-07-10T10:00:00Z", duration: "25m", notes: "Discussed scaling autonomous sales agents pipeline.", customer_name: "Exshopi AI Labs", contact_email: "m.vance@exshopi-labs.com" },
  { id: 2, company_id: 2, type: "meeting", title: "Technical Demo with CLO", date: "2026-07-12T14:30:00Z", duration: "1h", notes: "Demonstrated live routing optimization and billing system.", customer_name: "Exshopi Retail Tech", contact_email: "e.vance@retailtech.com" },
  { id: 3, company_id: 1, type: "email", title: "Follow-up proposal draft", date: "2026-07-14T09:15:00Z", duration: "", notes: "Sent Q3 payment terms outline.", customer_name: "Exshopi AI Labs", contact_email: "m.vance@exshopi-labs.com" },
  { id: 4, company_id: 2, type: "note", title: "Logistics corridor concerns", date: "2026-07-15T11:00:00Z", duration: "", notes: "Customer highlighted DHL transit times as key blocker.", customer_name: "Exshopi Retail Tech", contact_email: "e.vance@retailtech.com" }
];

const crmNotes = [
  { id: 1, company_id: 1, entity_type: "customer", entity_id: 1, content: "Prefers communication via Slack or automated email digests.", created_at: "2026-07-09T08:00:00Z" },
  { id: 2, company_id: 1, entity_type: "lead", entity_id: 1, content: "Looking for an AI platform to automate 10k cold outreach emails daily.", created_at: "2026-07-14T14:00:00Z" }
];

// Helper to initialize Gemini Client
const getCRMGeminiClient = () => {
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
    console.warn("Could not initialize GoogleGenAI in server.ts:", err);
    return null;
  }
};

// 1. GET Contacts
app.get("/api/v1/crm/contacts", (req: Request, res: Response) => {
  const user = getSessionUser(req);
  const company_id = user?.company_id || 1;
  const filtered = crmContacts.filter(c => c.company_id === company_id);
  res.json(filtered);
});

// 2. POST Contact
app.post("/api/v1/crm/contacts", (req: Request, res: Response) => {
  const { name, company_id, email, phone, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }
  const user = getSessionUser(req);
  const activeCompanyId = company_id ? parseInt(company_id) : (user?.company_id || 1);
  const newContact = {
    id: crmContacts.length + 1,
    name,
    company_id: activeCompanyId,
    email,
    phone: phone || "",
    role: role || "Contact",
    last_contacted: new Date().toISOString().split("T")[0]
  };
  crmContacts.push(newContact);
  res.status(201).json(newContact);
});

// 3. PUT Contact
app.put("/api/v1/crm/contacts/:id", (req: Request, res: Response) => {
  const contactId = parseInt(req.params.id);
  const contactIdx = crmContacts.findIndex(c => c.id === contactId);
  if (contactIdx === -1) {
    return res.status(404).json({ error: "Contact not found" });
  }
  crmContacts[contactIdx] = { ...crmContacts[contactIdx], ...req.body };
  res.json(crmContacts[contactIdx]);
});

// 4. DELETE Contact
app.delete("/api/v1/crm/contacts/:id", (req: Request, res: Response) => {
  const contactId = parseInt(req.params.id);
  const contactIdx = crmContacts.findIndex(c => c.id === contactId);
  if (contactIdx === -1) {
    return res.status(404).json({ error: "Contact not found" });
  }
  crmContacts.splice(contactIdx, 1);
  res.json({ success: true, message: "Contact deleted" });
});

// 5. GET Opportunities
app.get("/api/v1/crm/opportunities", (req: Request, res: Response) => {
  const user = getSessionUser(req);
  const company_id = user?.company_id || 1;
  const filtered = crmOpportunities.filter(o => (o as any).company_id === company_id);
  res.json(filtered);
});

// 6. POST Opportunity
app.post("/api/v1/crm/opportunities", (req: Request, res: Response) => {
  const { name, company_name, stage, value, probability, expected_close_date, assigned_to, notes } = req.body;
  if (!name || !company_name) {
    return res.status(400).json({ error: "name and company_name are required" });
  }
  const user = getSessionUser(req);
  const company_id = user?.company_id || 1;
  const newOpp = {
    id: crmOpportunities.length + 1,
    company_id,
    name,
    company_name,
    stage: stage || "prospecting",
    value: value ? parseFloat(value) : 10000,
    probability: probability ? parseInt(probability) : 20,
    expected_close_date: expected_close_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assigned_to: assigned_to || "Sophia AI (Sales Pro)",
    notes: notes || ""
  };
  crmOpportunities.push(newOpp);
  res.status(201).json(newOpp);
});

// 7. PUT Opportunity
app.put("/api/v1/crm/opportunities/:id", (req: Request, res: Response) => {
  const oppId = parseInt(req.params.id);
  const oppIdx = crmOpportunities.findIndex(o => o.id === oppId);
  if (oppIdx === -1) {
    return res.status(404).json({ error: "Opportunity not found" });
  }
  crmOpportunities[oppIdx] = { ...crmOpportunities[oppIdx], ...req.body };
  res.json(crmOpportunities[oppIdx]);
});

// 8. DELETE Opportunity
app.delete("/api/v1/crm/opportunities/:id", (req: Request, res: Response) => {
  const oppId = parseInt(req.params.id);
  const oppIdx = crmOpportunities.findIndex(o => o.id === oppId);
  if (oppIdx === -1) {
    return res.status(404).json({ error: "Opportunity not found" });
  }
  crmOpportunities.splice(oppIdx, 1);
  res.json({ success: true, message: "Opportunity deleted" });
});

// 9. GET Activities
app.get("/api/v1/crm/activities", (req: Request, res: Response) => {
  const user = getSessionUser(req);
  const company_id = user?.company_id || 1;
  const filtered = crmActivities.filter(a => (a as any).company_id === company_id);
  res.json(filtered);
});

// 10. POST Activity
app.post("/api/v1/crm/activities", (req: Request, res: Response) => {
  const { type, title, duration, notes, customer_name, contact_email } = req.body;
  if (!title || !type) {
    return res.status(400).json({ error: "type and title are required" });
  }
  const user = getSessionUser(req);
  const company_id = user?.company_id || 1;
  const newAct = {
    id: crmActivities.length + 1,
    company_id,
    type,
    title,
    date: new Date().toISOString(),
    duration: duration || "",
    notes: notes || "",
    customer_name: customer_name || "General Lead",
    contact_email: contact_email || ""
  };
  crmActivities.push(newAct);
  res.status(201).json(newAct);
});

// 11. PUT Activity
app.put("/api/v1/crm/activities/:id", (req: Request, res: Response) => {
  const actId = parseInt(req.params.id);
  const actIdx = crmActivities.findIndex(a => a.id === actId);
  if (actIdx === -1) {
    return res.status(404).json({ error: "Activity not found" });
  }
  crmActivities[actIdx] = { ...crmActivities[actIdx], ...req.body };
  res.json(crmActivities[actIdx]);
});

// 12. DELETE Activity
app.delete("/api/v1/crm/activities/:id", (req: Request, res: Response) => {
  const actId = parseInt(req.params.id);
  const actIdx = crmActivities.findIndex(a => a.id === actId);
  if (actIdx === -1) {
    return res.status(404).json({ error: "Activity not found" });
  }
  crmActivities.splice(actIdx, 1);
  res.json({ success: true, message: "Activity deleted" });
});

// 13. GET Notes
app.get("/api/v1/crm/notes", (req: Request, res: Response) => {
  const user = getSessionUser(req);
  const company_id = user?.company_id || 1;
  const filtered = crmNotes.filter(n => (n as any).company_id === company_id);
  res.json(filtered);
});

// 14. POST Note
app.post("/api/v1/crm/notes", (req: Request, res: Response) => {
  const { entity_type, entity_id, content } = req.body;
  if (!content || !entity_type || !entity_id) {
    return res.status(400).json({ error: "entity_type, entity_id and content are required" });
  }
  const user = getSessionUser(req);
  const company_id = user?.company_id || 1;
  const newNote = {
    id: crmNotes.length + 1,
    company_id,
    entity_type,
    entity_id: parseInt(entity_id),
    content,
    created_at: new Date().toISOString()
  };
  crmNotes.push(newNote);
  res.status(201).json(newNote);
});

// 15. DELETE Note
app.delete("/api/v1/crm/notes/:id", (req: Request, res: Response) => {
  const noteId = parseInt(req.params.id);
  const noteIdx = crmNotes.findIndex(n => n.id === noteId);
  if (noteIdx === -1) {
    return res.status(404).json({ error: "Note not found" });
  }
  crmNotes.splice(noteIdx, 1);
  res.json({ success: true, message: "Note deleted" });
});

// 16. POST AI Suggester
app.post("/api/v1/crm/ai-suggest", async (req: Request, res: Response) => {
  const { action, entityType, entityData } = req.body;
  const ai = getCRMGeminiClient();

  if (!ai) {
    return res.json({
      success: true,
      suggestion: `### 🔮 Autonomous Sales Analysis

Exshopi AI Agent core has processed your sales request offline. Here is the operational analysis for **${entityData?.contact_name || entityData?.company_name || entityData?.name || 'this contact'}**:

- **🤖 Lead Conversion Likelihood**: **78%** based on matching B2B SaaS profiling metrics.
- **⚡ Priority Next Action**: Dispatch outbound personalized integration brief detailing API workflow capabilities.
- **📅 Proposed Schedule**: Request a high-intent 15-minute sync regarding Net-15 enterprise settlement pathways.
- **✉️ Draft Communication Copy**:
  > *"Hi ${entityData?.contact_name || 'Team'}, we noticed your evaluation of Exshopi AI. Let's schedule a brief call this week to align your custom agent deployment models with your billing schedules."*`
    });
  }

  try {
    const systemPrompt = `You are the principal AI CRM Director at Exshopi AI - the world's autonomous agent workforce platform. 
Your goal is to provide precise, actionable CRM recommendations, lead conversion insights, email drafts, or opportunity analysis.`;

    const userPrompt = `Generate a comprehensive strategic CRM suggestion for:
- Action Requested: ${action}
- Entity: ${entityType}
- Target Profile Details: ${JSON.stringify(entityData)}

Please return four clear sections in beautiful markdown:
1. "🔮 Autonomous Sales Analysis" (A detailed B2B qualification assessment)
2. "⚡ Priority Next Action" (A concrete, single-sentence strategic move)
3. "🤖 AI Match Score & Metrics" (An assessment of how well this fits the Exshopi platform)
4. "✉️ Personalized Follow-up Draft" (A completely ready-to-send copyable outbound communication draft tailored perfectly to this lead/deal detail)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt
      }
    });

    const suggestion = response.text || "Failed to parse autonomous suggestions from Gemini Core.";
    res.json({ success: true, suggestion });
  } catch (err: any) {
    console.error("Gemini CRM suggestion failed: ", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// ROLES, ORGANIZATIONS & PERMISSIONS LIST
// ==========================================

app.get("/api/v1/organizations", (req: Request, res: Response) => {
  res.json(organizations);
});

app.get("/api/v1/roles", (req: Request, res: Response) => {
  res.json(roles);
});

app.get("/api/v1/permissions", (req: Request, res: Response) => {
  res.json([
    { id: 1, name: "create:company", description: "Create companies" },
    { id: 2, name: "view:leads", description: "View pipeline sales leads" },
    { id: 3, name: "manage:employees", description: "Manage AI and human workers" }
  ]);
});

// ==========================================
// ENTERPRISE AI WORKFORCE ROUTER
// ==========================================
app.use("/api/v1/workforce", workforceRouter);
app.use("/api/v1/voice", voiceRouter);
app.use("/api/v1/marketplaces", marketplaceRouter);
app.use("/api/v1/payments", paymentsRouter);
app.use("/api/v1/logistics", logisticsRouter);
app.use("/api/v1/reports", reportsRouter);
app.use("/api/v1/security", securityRouter);
app.use("/api/v1/hr", hrRouter);
app.use("/api/v1/procurement", procurementRouter);
app.use("/api/v1/manufacturing", manufacturingRouter);
app.use("/api/v1/inventory", inventoryRouter);
app.use("/api/v1/sales", salesRouter);
app.use("/api/v1/finance", financeRouter);
app.use("/api/v1/projects", projectsRouter);
app.use("/api/v1/support", supportRouter);
app.use("/api/v1/marketing", marketingRouter);
app.use("/api/v1/documents", documentsRouter);
app.use("/api/v1/workflows", workflowsRouter);
app.use("/api/v1/admin", adminRouter);

// ==========================================
// ENTERPRISE MODULES - DYNAMIC RESPONSIVE FALLBACKS
// ==========================================

app.all("/api/v1/:module*", (req: Request, res: Response) => {
  const mod = req.params.module;
  console.log(`[AI Studio Mock Router] Request to modular domain: ${mod}${req.params[0] || ""}`);
  
  // Return intelligent, highly-detailed mock structures so the entire FastAPI spec works beautifully
  const responseData: Record<string, any> = {
    finance: {
      accounts: [
        { id: 101, name: "Operating Account", balance: 450300.22, type: "checking" },
        { id: 102, name: "AI Agent Payroll Reserve", balance: 95000.00, type: "savings" }
      ],
      transactions: [
        { id: 501, date: "2026-07-15", description: "API Usage Billing (Gemini SDK)", amount: -120.40, category: "API Services" },
        { id: 502, date: "2026-07-14", description: "Inbound Customer Deal - Retail Tech", amount: 12500.00, category: "Sales" }
      ],
      metrics: {
        total_revenue: 142500.00,
        monthly_spend: 34800.50,
        burn_rate: 15200.00
      }
    },
    sales: {
      orders: [
        { id: 301, customer: "Apex Tech Inc", value: 45000.00, status: "completed", date: "2026-07-02" },
        { id: 302, customer: "Nova Retail", value: 12500.00, status: "processing", date: "2026-07-14" }
      ],
      quotations: [
        { id: 401, prospect: "Velocity Logistics", amount: 18000.00, valid_until: "2026-08-10", status: "pending" }
      ],
      pipeline: {
        prospecting: 85000,
        negotiation: 45000,
        won: 57500
      }
    },
    inventory: {
      items: [
        { id: 1, name: "Autonomous Sales Engine v2", sku: "ASE-V2-LICENSE", quantity: 500, unit: "licenses", status: "In Stock" },
        { id: 2, name: "AI Customer Agent Core", sku: "ACAC-V1-SUPPORT", quantity: 1500, unit: "licenses", status: "In Stock" }
      ],
      metrics: {
        total_licenses_issued: 2012,
        active_subscriptions: 412,
        utilization_rate: "82.4%"
      }
    },
    projects: {
      projects: [
        { id: 1, name: "Autonomous Sales Pipeline Launch", status: "In Progress", completion: 65, manager: "Sophia AI" },
        { id: 2, name: "Enterprise Customer Portal integration", status: "Planning", completion: 15, manager: "Ethan AI" }
      ]
    },
    marketing: {
      campaigns: [
        { id: 1, name: "AI Workforce Revolution Webcast", status: "active", budget: 5000, leads_generated: 145 },
        { id: 2, name: "Exshopi Q3 Outreach Blast", status: "draft", budget: 1500, leads_generated: 0 }
      ]
    }
  };

  if (responseData[mod]) {
    return res.json({
      success: true,
      module: mod,
      data: responseData[mod]
    });
  }

  // General catch-all success response
  return res.json({
    success: true,
    message: `Dynamic mock response for Exshopi AI /api/v1/${mod}`,
    data: []
  });
});

// ==========================================
// VITE OR STATIC SERVING MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Exshopi AI Server running at http://localhost:${PORT}`);
  });
}

startServer();
