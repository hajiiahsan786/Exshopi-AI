import fs from "fs";
import path from "path";

const STORE_PATH = path.join(process.cwd(), "server_data_store.json");

export interface Organization {
  id: number;
  name: string;
  domain: string;
}

export interface Company {
  id: number;
  organization_id: number;
  company_name: string;
  legal_name: string;
  industry: string;
  business_type: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  website: string;
  currency: string;
  timezone: string;
  language: string;
  tax_number: string;
  registration_number: string;
  logo: string;
  owner_id: number;
  created_at: string;
  trade_license_number?: string;
  trade_license_file?: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface User {
  id: number;
  uuid: string;
  full_name: string;
  email: string;
  phone: string;
  password_hash: string;
  role_id: number;
  organization_id: number;
  company_id: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  mfa_secret?: string;
  mfa_enabled?: boolean;
}

export interface Department {
  id: number;
  company_id: number;
  name: string;
  code: string;
  budget: number;
}

export interface Employee {
  id: number;
  department_id: number;
  full_name: string;
  email: string;
  position: string;
  status: string;
  salary: number;
}

export interface Task {
  id: number;
  company_id: number;
  title: string;
  assigned_to: string;
  status: string;
  priority: string;
  due_date: string;
}

export interface Lead {
  id: number;
  company_id: number;
  contact_name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  notes: string;
}

export interface Document {
  id: number;
  company_id: number;
  name: string;
  type: string;
  size: string;
  uploaded_at: string;
  uploaded_by: string;
  status: "pending" | "verified" | "rejected";
  ocr_text?: string;
  content?: string;
}

export interface RefreshTokenStore {
  token: string;
  user_id: number;
  expires_at: number;
  device_info?: string;
}

export interface DBStore {
  organizations: Organization[];
  companies: Company[];
  roles: Role[];
  users: User[];
  departments: Department[];
  employees: Employee[];
  tasks: Task[];
  leads: Lead[];
  documents: Document[];
  refreshTokens: RefreshTokenStore[];
}

const DEFAULT_STORE: DBStore = {
  organizations: [
    { id: 1, name: "Global Tech Corp", domain: "globaltech.com" },
    { id: 2, name: "Exshopi Enterprises", domain: "exshopi.ai" }
  ],
  companies: [
    {
      id: 1,
      organization_id: 2,
      company_name: "Exshopi AI Labs",
      legal_name: "Exshopi AI Labs LLC",
      industry: "Artificial Intelligence",
      business_type: "B2B SaaS",
      email: "labs@exshopi.ai",
      phone: "+1-800-AI-WORK",
      country: "United Arab Emirates",
      city: "Dubai",
      address: "DIFC, The Gate District, Level 15",
      website: "https://exshopi.ai",
      currency: "AED",
      timezone: "Asia/Dubai",
      language: "English",
      tax_number: "TRN-100223344",
      registration_number: "LIC-Dubai-881234",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=60",
      owner_id: 1,
      created_at: "2026-01-10T08:00:00Z"
    }
  ],
  roles: [
    { id: 1, name: "Enterprise Admin", description: "Full access to all systems and billing" },
    { id: 2, name: "Department Manager", description: "Access to department-specific roles and employees" },
    { id: 3, name: "AI Employee", description: "Autonomous worker role with system-specific execution permissions" }
  ],
  users: [
    {
      id: 1,
      uuid: "u1-uuid-8822",
      full_name: "Ahsan Haji",
      email: "hajiiahsan786@gmail.com",
      phone: "+971-50-123-4567",
      password_hash: "password123", // storing clear text or hash, for demo simplicity lets allow password123
      role_id: 1,
      organization_id: 2,
      company_id: 1,
      is_active: true,
      is_verified: true,
      created_at: "2026-01-01T00:00:00Z",
      mfa_enabled: true
    }
  ],
  departments: [
    { id: 1, company_id: 1, name: "Autonomous Sales Agents", code: "DEPT-ASA", budget: 150000 },
    { id: 2, company_id: 1, name: "AI Customer Support", code: "DEPT-ACS", budget: 80000 },
    { id: 3, company_id: 1, name: "Inventory Optimization", code: "DEPT-IO", budget: 120000 }
  ],
  employees: [
    { id: 1, department_id: 1, full_name: "Sophia AI (Sales Pro)", email: "sophia.sales@exshopi.ai", position: "Senior Outbound AI Specialist", status: "active", salary: 3200 },
    { id: 2, department_id: 2, full_name: "Ethan AI (Support Expert)", email: "ethan.support@exshopi.ai", position: "Tier-1 Autonomous Support", status: "active", salary: 2400 },
    { id: 3, department_id: 3, full_name: "Lucas AI (Logistic Bot)", email: "lucas.logistics@exshopi.ai", position: "AI Inventory Coordinator", status: "idle", salary: 2800 }
  ],
  tasks: [
    { id: 1, company_id: 1, title: "Cold outreach to Dubai tech companies", assigned_to: "Sophia AI (Sales Pro)", status: "In Progress", priority: "High", due_date: "2026-07-20" },
    { id: 2, company_id: 1, title: "Index knowledge base PDFs", assigned_to: "Ethan AI (Support Expert)", status: "Completed", priority: "Medium", due_date: "2026-07-14" }
  ],
  leads: [
    { id: 1, company_id: 1, contact_name: "John Doe", email: "john@targetcompany.com", phone: "+1-555-9988", status: "New", source: "LinkedIn Outreach", notes: "Interested in autonomous sales workflows." },
    { id: 2, company_id: 1, contact_name: "Alice Smith", email: "alice@retailgiant.com", phone: "+1-555-7766", status: "Contacted", source: "Inbound Demo", notes: "Evaluating AI agents for e-commerce." }
  ],
  documents: [],
  refreshTokens: []
};

class LocalJSONDb {
  private data: DBStore;

  constructor() {
    this.data = { ...DEFAULT_STORE };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const fileContent = fs.readFileSync(STORE_PATH, "utf8");
        this.data = JSON.parse(fileContent);
      } else {
        this.save();
      }
    } catch (err) {
      console.error("Failed to load local JSON DB:", err);
    }
  }

  public save() {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.data, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to save local JSON DB:", err);
    }
  }

  public getOrganizations() { return this.data.organizations; }
  public getCompanies() { return this.data.companies; }
  public getRoles() { return this.data.roles; }
  public getUsers() { return this.data.users; }
  public getDepartments() { return this.data.departments; }
  public getEmployees() { return this.data.employees; }
  public getTasks() { return this.data.tasks; }
  public getLeads() { return this.data.leads; }
  public getDocuments() { return this.data.documents; }
  public getRefreshTokens() { return this.data.refreshTokens; }

  public addOrganization(org: Omit<Organization, "id">): Organization {
    const newOrg = { ...org, id: this.data.organizations.length + 1 };
    this.data.organizations.push(newOrg);
    this.save();
    return newOrg;
  }

  public addCompany(comp: Omit<Company, "id">): Company {
    const newComp = { ...comp, id: this.data.companies.length + 1 };
    this.data.companies.push(newComp);
    this.save();
    return newComp;
  }

  public addUser(user: Omit<User, "id">): User {
    const newUser = { ...user, id: this.data.users.length + 1 };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public addDepartment(dept: Omit<Department, "id">): Department {
    const newDept = { ...dept, id: this.data.departments.length + 1 };
    this.data.departments.push(newDept);
    this.save();
    return newDept;
  }

  public addEmployee(emp: Omit<Employee, "id">): Employee {
    const newEmp = { ...emp, id: this.data.employees.length + 1 };
    this.data.employees.push(newEmp);
    this.save();
    return newEmp;
  }

  public addTask(task: Omit<Task, "id">): Task {
    const newTask = { ...task, id: this.data.tasks.length + 1 };
    this.data.tasks.push(newTask);
    this.save();
    return newTask;
  }

  public addLead(lead: Omit<Lead, "id">): Lead {
    const newLead = { ...lead, id: this.data.leads.length + 1 };
    this.data.leads.push(newLead);
    this.save();
    return newLead;
  }

  public addDocument(doc: Omit<Document, "id">): Document {
    const newDoc = { ...doc, id: this.data.documents.length + 1 };
    this.data.documents.push(newDoc);
    this.save();
    return newDoc;
  }

  public deleteDocument(id: number): boolean {
    const idx = this.data.documents.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.data.documents.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  public updateDocumentStatus(id: number, status: "pending" | "verified" | "rejected"): boolean {
    const doc = this.data.documents.find(d => d.id === id);
    if (doc) {
      doc.status = status;
      this.save();
      return true;
    }
    return false;
  }

  public updateUserCompany(userId: number, companyId: number) {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.company_id = companyId;
      this.save();
    }
  }

  public addRefreshToken(token: RefreshTokenStore) {
    // Remove expired tokens
    this.data.refreshTokens = this.data.refreshTokens.filter(t => t.expires_at > Date.now());
    this.data.refreshTokens.push(token);
    this.save();
  }

  public verifyRefreshToken(token: string): RefreshTokenStore | null {
    const stored = this.data.refreshTokens.find(t => t.token === token);
    if (!stored) return null;
    if (stored.expires_at < Date.now()) {
      // Clean up
      this.data.refreshTokens = this.data.refreshTokens.filter(t => t.token !== token);
      this.save();
      return null;
    }
    return stored;
  }

  public removeRefreshToken(token: string) {
    this.data.refreshTokens = this.data.refreshTokens.filter(t => t.token !== token);
    this.save();
  }
}

export const dbStore = new LocalJSONDb();
