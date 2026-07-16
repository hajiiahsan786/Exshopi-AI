import React, { useState } from "react";
import { useStore } from "../store/useStore";
import { Button, Card, Input, Badge, getAccentClass } from "./UI";
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  AlertTriangle,
  LogOut,
  RefreshCw,
  KeyRound,
  Fingerprint,
  ArrowRight,
  UserCheck,
  Phone,
  Building,
  Plus,
  Trash2,
  Globe,
  Sparkles,
  ChevronRight,
  Check,
  UploadCloud,
  FileText,
  Eye,
  CheckCircle2,
  Play,
  Cpu,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthScreensProps {
  onSuccess: () => void;
}

interface UploadedDocument {
  id: number;
  name: string;
  type: string;
  size: string;
  status: string;
  documentType: "trade_license" | "vat_certificate" | "passport_copy";
  ocr_text?: string;
  extractedData?: Record<string, string>;
}

export const AuthScreens: React.FC<AuthScreensProps> = ({ onSuccess }) => {
  const {
    currentUser,
    setCurrentUser,
    addLog,
    lockScreenLocked,
    setLockScreenLocked,
    sessionExpired,
    setSessionExpired
  } = useStore();

  const [mode, setMode] = useState<
    "login" | "register" | "forgot" | "reset" | "mfa" | "lock" | "expired" | "profile" | "aiOnboarding"
  >(sessionExpired ? "expired" : lockScreenLocked ? "lock" : currentUser ? "profile" : "login");

  // Sync mode with global lock/expired state
  React.useEffect(() => {
    if (sessionExpired) setMode("expired");
    else if (lockScreenLocked) setMode("lock");
    else if (currentUser && mode !== "aiOnboarding") setMode("profile");
    else if ((mode === "lock" || mode === "expired" || mode === "profile") && !currentUser) setMode("login");
  }, [lockScreenLocked, sessionExpired, currentUser]);

  // Form states
  const [email, setEmail] = useState("hajiiahsan786@gmail.com");
  const [fullName, setFullName] = useState("Ahsan Haji");
  const [password, setPassword] = useState("password123");
  const [passcode, setPasscode] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Onboarding Wizard States
  const [onboardStep, setOnboardStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("Artificial Intelligence");
  const [businessType, setBusinessType] = useState("B2B SaaS");
  const [country, setCountry] = useState("United Arab Emirates"); // UAE default to showcase specialized Dubai preloads
  const [timezone, setTimezone] = useState("Asia/Dubai");
  const [currency, setCurrency] = useState("AED (United Arab Emirates Dirham)");
  const [language, setLanguage] = useState("English (Arabic Dual)");
  const [website, setWebsite] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("+971 50 123 4567");
  const [departmentsList, setDepartmentsList] = useState<string[]>([
    "Autonomous Sales Agents",
    "AI Customer Support",
    "Procurement & Ledger Desk"
  ]);
  const [newDeptInput, setNewDeptInput] = useState("");
  const [chosenPlan, setChosenPlan] = useState("Scale");
  const [emailVerifyCode, setEmailVerifyCode] = useState("");
  const [phoneVerifyCode, setPhoneVerifyCode] = useState("");
  const [onboardingLogs, setOnboardingLogs] = useState<string[]>([]);
  const [invitedEmails, setInvitedEmails] = useState<string>("");

  // UAE Specialized Fields
  const [tradeLicenseNumber, setTradeLicenseNumber] = useState("TL-90821");

  // Document Management States
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [uploadingDocType, setUploadingDocType] = useState<"trade_license" | "vat_certificate" | "passport_copy" | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ocrLogs, setOcrLogs] = useState<string[]>([]);
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null);

  // 5-Minute AI Onboarding Configurator States
  const [aiAudience, setAiAudience] = useState("Enterprise e-commerce and retail brands in the Middle East");
  const [aiKPI, setAiKPI] = useState("Scale outbound partner conversion rate by 20% within 60 days");
  const [aiBudget, setAiBudget] = useState("$10,000 monthly operational budget limit");
  const [aiCompliance, setAiCompliance] = useState("SOC-2 compliant secure logs with encrypted customer data handles");
  const [aiCompetitors, setAiCompetitors] = useState("Traditional logistics dispatch hubs and manual support desk outsourcing");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGenLogs, setAiGenLogs] = useState<string[]>([]);
  const [aiStrategyMarkdown, setAiStrategyMarkdown] = useState("");
  const [aiCeoPrompt, setAiCeoPrompt] = useState("");

  // Handles pre-populating fields when Country changes
  React.useEffect(() => {
    if (country === "United Arab Emirates") {
      setCurrency("AED (United Arab Emirates Dirham)");
      setTimezone("Asia/Dubai");
      setLanguage("English (Arabic Dual)");
      if (!ownerPhone || ownerPhone === "+1 (555) 0122-8822") {
        setOwnerPhone("+971 50 123 4567");
      }
    } else if (country === "United States") {
      setCurrency("USD ($)");
      setTimezone("America/Los_Angeles");
      setLanguage("English");
      setOwnerPhone("+1 (555) 0122-8822");
    } else if (country === "Singapore") {
      setCurrency("SGD (S$)");
      setTimezone("Asia/Singapore");
      setLanguage("English");
      setOwnerPhone("+65 9123 4567");
    } else if (country === "United Kingdom") {
      setCurrency("GBP (£)");
      setTimezone("Europe/London");
      setLanguage("English");
      setOwnerPhone("+44 20 7946 0192");
    }
  }, [country]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe })
      });
      const data = await res.json();
      
      addLog({
        method: "POST",
        endpoint: "/api/v1/auth/login",
        status: res.status,
        type: "security",
        payload: { email },
        response: data
      });

      if (data.success) {
        setMode("mfa");
        setSuccessMsg("Primary authentication authorized. Security protocols demand MFA OTP.");
      } else {
        setErrorMsg(data.message || "Invalid credentials.");
      }
    } catch (err: any) {
      setErrorMsg("Connection failure. Verify the Exshopi auth nodes are online.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName })
      });
      const data = await res.json();

      addLog({
        method: "POST",
        endpoint: "/api/v1/auth/register",
        status: res.status,
        type: "security",
        payload: { email, full_name: fullName },
        response: data
      });

      if (data.success) {
        setMode("login");
        setSuccessMsg("Security administrative profile registered. Proceed to authenticate.");
      } else {
        setErrorMsg(data.message || "Registration denied by system policy.");
      }
    } catch (err) {
      setErrorMsg("Connection failure.");
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingSubmit = async () => {
    setLoading(true);
    setErrorMsg("");
    setOnboardingLogs([]);

    const steps = [
      { text: "🔑 Authenticating primary workspace administrator permissions...", delay: 100 },
      { text: "🗄️ Allocating isolated tenant tables inside Postgres SQL clusters...", delay: 600 },
      { text: "📂 Committing uploaded trade license & identity logs to Cloud Vault...", delay: 1200 },
      { text: "🔒 Aligning MFA seed values & rotating JWT active signing keys...", delay: 1800 },
      { text: "🏢 Organizing departments, ledger caps, and system routing nodes...", delay: 2400 },
      { text: "🤖 Spawning Sophia AI (CEO Agent) & Ethan AI support workflows...", delay: 3000 },
      { text: "🚀 Provisioning secure container cockpit dashboard...", delay: 3600 }
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setOnboardingLogs((prev) => [...prev, step.text]);
      }, step.delay);
    });

    setTimeout(async () => {
      try {
        const res = await fetch("/api/v1/auth/onboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName,
            industry,
            businessType,
            country,
            timezone,
            currency,
            language,
            website,
            phone: companyPhone,
            departments: departmentsList,
            ownerName: fullName,
            ownerEmail: email,
            ownerPhone,
            password,
            chosenPlan,
            tradeLicenseNumber,
            tradeLicenseFile: uploadedDocs.find(d => d.documentType === "trade_license")?.name || ""
          })
        });

        const data = await res.json();

        addLog({
          method: "POST",
          endpoint: "/api/v1/auth/onboard",
          status: res.status,
          type: "security",
          payload: { companyName, ownerEmail: email },
          response: data
        });

        if (data.success && data.data) {
          setCurrentUser(data.data.user);
          addLog({
            method: "SYSTEM",
            endpoint: "workspace-initialized",
            status: 200,
            type: "security",
            response: { organization: data.data.organization, company: data.data.company }
          });
          
          // Switch to the 5-Minute AI Onboarding Configurator!
          setMode("aiOnboarding");
        } else {
          setErrorMsg(data.message || "Onboarding failed. Please review your credentials.");
          setOnboardStep(1);
        }
      } catch (err) {
        setErrorMsg("Failed to sync workspace credentials with the central database cluster.");
        setOnboardStep(1);
      } finally {
        setLoading(false);
      }
    }, 4000);
  };

  // Triggers simulated file upload and real-time OCR extraction
  const handleSimulatedUpload = (docType: "trade_license" | "vat_certificate" | "passport_copy") => {
    if (uploadingDocType) return;
    setUploadingDocType(docType);
    setUploadProgress(10);
    setOcrLogs(["⚡ Activating Exshopi OCR-Scan Node...", "📂 Reading document byte buffers..."]);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 200);

    // Simulate logs printing in the console
    setTimeout(() => {
      setOcrLogs((prev) => [...prev, "🔍 Decrypting image layers...", "🤖 Isolating text coordinate boundaries..."]);
    }, 600);

    setTimeout(async () => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setOcrLogs((prev) => [...prev, "✨ OCR Extraction complete. Verification token matches government index."]);

      const mockNames = {
        trade_license: "Dubai_Trade_License_2026.pdf",
        vat_certificate: "FTA_VAT_Certificate_TRN.png",
        passport_copy: "Owner_Passport_Identity_Scan.pdf"
      };

      try {
        const res = await fetch("/api/v1/onboard/upload-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: mockNames[docType],
            fileType: docType === "vat_certificate" ? "image/png" : "application/pdf",
            fileSize: docType === "trade_license" ? "1.4 MB" : "940 KB",
            documentType: docType
          })
        });

        const data = await res.json();
        if (data.success && data.document) {
          const newDoc: UploadedDocument = {
            id: data.document.id,
            name: data.document.name,
            type: data.document.type,
            size: data.document.size,
            status: data.document.status,
            documentType: docType,
            ocr_text: data.ocr_text,
            extractedData: data.extractedData
          };
          setUploadedDocs((prev) => [...prev, newDoc]);
          addLog({
            method: "POST",
            endpoint: "/api/v1/onboard/upload-document",
            status: 201,
            type: "security",
            response: data
          });
        }
      } catch (err) {
        console.error("Document upload failed:", err);
      } finally {
        setUploadingDocType(null);
        setUploadProgress(0);
      }
    }, 1800);
  };

  // Real delete document trigger
  const handleDeleteDocument = async (docId: number) => {
    try {
      const res = await fetch(`/api/v1/onboard/documents/${docId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setUploadedDocs((prev) => prev.filter(d => d.id !== docId));
        addLog({
          method: "DELETE",
          endpoint: `/api/v1/onboard/documents/${docId}`,
          status: 200,
          type: "security",
          response: data
        });
      }
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  // 5-Minute AI Onboarding submit to generate dynamic AI Prompts & strategy markdown
  const handleAIOnboardingSubmit = async () => {
    setAiGenerating(true);
    setAiGenLogs(["🧠 Initializing Gemini 3.5 Operational Planner...", "🔮 Synthesizing business objectives & KPIs..."]);

    const logSteps = [
      { text: "⚡ Structuring high-empathy customer support agent loops...", delay: 600 },
      { text: "📊 Mapping compliance profiles into the secure data layer...", delay: 1200 },
      { text: "✍️ Generating highly personalized Outbound Sales templates and targeting criteria...", delay: 1800 },
      { text: "🤖 Injecting customized business goals into Sophia AI CEO node instructions...", delay: 2400 },
      { text: "📁 Compiling & saving final strategic markdown blueprint documents...", delay: 3000 }
    ];

    logSteps.forEach((step) => {
      setTimeout(() => {
        setAiGenLogs((prev) => [...prev, step.text]);
      }, step.delay);
    });

    setTimeout(async () => {
      try {
        const res = await fetch("/api/v1/onboard/ai-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: {
              targetAudience: aiAudience,
              coreKPI: aiKPI,
              budgetLimit: aiBudget,
              complianceProfile: aiCompliance,
              competitors: aiCompetitors
            }
          })
        });

        const data = await res.json();
        if (data.success) {
          setAiStrategyMarkdown(data.strategy);
          setAiCeoPrompt(data.ceoPrompt);
          setAiGenLogs((prev) => [...prev, "🏆 Enterprise AI Workforce Core successfully deployed! System stands ready."]);
        }
      } catch (err) {
        console.error("AI configuration setup failed:", err);
      } finally {
        setAiGenerating(false);
      }
    }, 3800);
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    setTimeout(() => {
      setLoading(false);
      if (otpToken === "000000" || otpToken.length === 6) {
        addLog({
          method: "VERIFY",
          endpoint: "/api/v1/auth/mfa-totp",
          status: 200,
          type: "security",
          response: { mfa: "authorized", identity: email }
        });
        
        setCurrentUser({
          id: 1,
          email,
          full_name: fullName || "Ahsan Haji",
          is_active: true,
          is_verified: true
        });
        
        onSuccess();
      } else {
        setErrorMsg("Incorrect OTP token. Hint: Enter any 6-digit number to bypass.");
      }
    }, 600);
  };

  const handleUnlockPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "1234" || passcode.length >= 4) {
      addLog({
        method: "AUTH",
        endpoint: "/api/v1/security/unlock-screen",
        status: 200,
        type: "security",
        response: { screen: "unlocked" }
      });
      setLockScreenLocked(false);
      onSuccess();
    } else {
      setErrorMsg("Incorrect secure passcode. Try '1234'.");
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMode("reset");
      setSuccessMsg("Reset key vector successfully dispatched to your email address.");
    }, 800);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMode("login");
      setSuccessMsg("Password successfully rotated. Re-authenticate to proceed.");
    }, 800);
  };

  const triggerLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/logout", { method: "POST" });
      const data = await res.json();
      addLog({
        method: "POST",
        endpoint: "/api/v1/auth/logout",
        status: res.status,
        type: "security",
        response: data
      });
      setCurrentUser(null);
      setSessionExpired(false);
      setMode("login");
    } catch {
      setCurrentUser(null);
      setMode("login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-6 relative overflow-hidden select-none">
      {/* Dynamic Background Mesh Grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-lg z-10"
        >
          {/* Brand Identity */}
          {mode !== "aiOnboarding" && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 mb-1.5">
                <span className={`h-8 w-8 rounded-lg ${getAccentClass("bg")} flex items-center justify-center text-white shadow-xl shadow-indigo-500/20`}>
                  ⚡
                </span>
                <span className="font-bold tracking-tight text-white text-lg font-mono">
                  EXSHOPI <span className={getAccentClass("text")}>AI</span>
                </span>
              </div>
              <p className="text-zinc-500 text-3xs uppercase tracking-[0.25em] font-bold">
                The Autonomous Business Operating System
              </p>
            </div>
          )}

          {/* Large Center Card - Rounded 30px, Glass Blur, Gradient Glow borders */}
          <Card className="p-8 border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl shadow-2xl rounded-[30px] transition-all duration-500 hover:shadow-indigo-500/5 ring-1 ring-zinc-800/50">
            
            {/* 1. Login Mode */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="text-center pb-2">
                  <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Access Command Center</h2>
                  <p className="text-zinc-500 text-xs mt-1">Authenticate credentials to initiate enterprise session</p>
                </div>

                {successMsg && (
                  <div className="p-3 bg-emerald-950/30 border border-emerald-900/30 rounded-xl text-xs text-emerald-400 text-center">
                    {successMsg}
                  </div>
                )}
                {errorMsg && (
                  <div className="p-3 bg-rose-950/30 border border-rose-900/30 rounded-xl text-xs text-rose-400 text-center">
                    {errorMsg}
                  </div>
                )}

                <Input
                  label="Administrative Email ID"
                  placeholder="name@exshopi.ai"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="h-4 w-4 text-zinc-500" />}
                />

                <Input
                  label="Access Password"
                  placeholder="••••••••••••"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4 text-zinc-500" />}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-2xs text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                    >
                      Forgot Password?
                    </button>
                  }
                />

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-3.5 w-3.5 rounded bg-zinc-950 border border-zinc-800 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-2xs text-zinc-400 group-hover:text-zinc-200 transition-colors select-none">
                      Remember secure session
                    </span>
                  </label>
                  <Badge variant="neutral" className="text-[10px] font-mono border-zinc-800/80">
                    TTL: 15m
                  </Badge>
                </div>

                <Button variant="primary" className="w-full mt-2" type="submit" loading={loading}>
                  Request Verification OTP
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Need an enterprise AI workspace?</span>
                    <span className={`font-semibold ${getAccentClass("text")} hover:underline`}>Register Tenant</span>
                  </button>
                </div>
              </form>
            )}

            {/* 2. Register Mode (9-Step Premium Onboarding Wizard) */}
            {mode === "register" && (
              <div className="space-y-5">
                {/* Stepper Header */}
                <div className="border-b border-zinc-800/80 pb-3">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-bold text-zinc-400 uppercase tracking-wider text-3xs">
                      Enterprise AI Workspace Creator
                    </span>
                    <Badge variant="neutral" className={`${getAccentClass("text")} border-zinc-800 font-bold`}>
                      Step {onboardStep} of 8
                    </Badge>
                  </div>
                  {/* Progress bar */}
                  <div className="flex gap-1.5">
                    {Array.from({ length: 8 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          idx + 1 <= onboardStep
                            ? getAccentClass("bg")
                            : "bg-zinc-800/60"
                        }`}
                      />
                    ))}
                  </div>
                  <h3 className="text-sm font-bold text-zinc-100 mt-2.5">
                    {onboardStep === 1 && "1. Corporate Identity & Base Country"}
                    {onboardStep === 2 && "2. Lead Administrator Credentials"}
                    {onboardStep === 3 && "3. Security Dual-Factor Authorization"}
                    {onboardStep === 4 && "4. Localized Settlement & Clock Profile"}
                    {onboardStep === 5 && "5. Workforce Organizers & Seat Invites"}
                    {onboardStep === 6 && "6. Secure Document Hub & OCR Node"}
                    {onboardStep === 7 && "7. Workspace Operational Licensing"}
                    {onboardStep === 8 && "8. Spawning Workspace container..."}
                  </h3>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-950/30 border border-rose-900/30 rounded-xl text-xs text-rose-400 text-center">
                    {errorMsg}
                  </div>
                )}

                {/* Step 1: Corporate Identity & Base Country */}
                {onboardStep === 1 && (
                  <div className="space-y-4">
                    <Input
                      label="Company Legal / Trading Name"
                      placeholder="Exshopi Labs International"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      icon={<Building className="h-4 w-4 text-zinc-500" />}
                    />

                    <div className="flex flex-col gap-1.5">
                      <span className="text-2xs font-bold text-zinc-400 uppercase tracking-wider">Base Incorporation Country</span>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700/80"
                      >
                        <option>United Arab Emirates</option>
                        <option>United States</option>
                        <option>Singapore</option>
                        <option>United Kingdom</option>
                      </select>
                    </div>

                    {/* Specialized UAE / Dubai Trade License Preloads */}
                    {country === "United Arab Emirates" && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 bg-indigo-950/20 border border-indigo-900/30 rounded-xl space-y-3"
                      >
                        <div className="flex items-start gap-2.5">
                          <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-zinc-400 leading-normal">
                            **UAE localized registration** triggers automatic Dubai economy TRN formatting and preloads AED currency settling indexes.
                          </p>
                        </div>
                        <Input
                          label="Dubai DED Commercial Trade License Number"
                          placeholder="TL-90821"
                          required
                          value={tradeLicenseNumber}
                          onChange={(e) => setTradeLicenseNumber(e.target.value)}
                          icon={<ShieldCheck className="h-4 w-4 text-indigo-400" />}
                        />
                      </motion.div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Corporate URL Domain"
                        placeholder="https://exshopi.ai"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        icon={<Globe className="h-4 w-4 text-zinc-500" />}
                      />
                      <Input
                        label="Support Line Phone"
                        placeholder="+971 4 555 1234"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        icon={<Phone className="h-4 w-4 text-zinc-500" />}
                      />
                    </div>

                    <div className="pt-2 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setMode("login");
                          setErrorMsg("");
                        }}
                        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        Cancel to Log In
                      </button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          if (!companyName.trim()) {
                            setErrorMsg("Legal corporate name is required to initialize workspace.");
                            return;
                          }
                          setErrorMsg("");
                          setOnboardStep(2);
                        }}
                        className="flex items-center gap-1"
                      >
                        <span>Configure Owner Profile</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Owner Profile */}
                {onboardStep === 2 && (
                  <div className="space-y-4">
                    <Input
                      label="Full Administrator Legal Name"
                      placeholder="Ahsan Haji"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      icon={<User className="h-4 w-4 text-zinc-500" />}
                    />
                    <Input
                      label="Administrative Security Email"
                      placeholder="hajiiahsan786@gmail.com"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      icon={<Mail className="h-4 w-4 text-zinc-500" />}
                    />
                    <Input
                      label="Administrative Contact Phone"
                      placeholder="+971 50 123 4567"
                      required
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      icon={<Phone className="h-4 w-4 text-zinc-500" />}
                    />
                    <Input
                      label="Select Security Password"
                      placeholder="••••••••"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      icon={<Lock className="h-4 w-4 text-zinc-500" />}
                    />
                    <div className="pt-2 flex gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => setOnboardStep(1)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          if (!fullName.trim() || !email.trim() || !ownerPhone.trim() || !password.trim()) {
                            setErrorMsg("All administrator details are required.");
                            return;
                          }
                          setErrorMsg("");
                          setOnboardStep(3);
                        }}
                        className="flex-1 flex justify-center items-center gap-1"
                      >
                        <span>Request Security Codes</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: SMS and Email Dual Verification */}
                {onboardStep === 3 && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-center space-y-2">
                      <p className="text-2xs text-zinc-400">Cryptographic dual-factor tokens dispatched to security coordinates:</p>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        <Badge variant="accent" className="font-mono text-3xs">{email}</Badge>
                        <Badge variant="accent" className="font-mono text-3xs">{ownerPhone}</Badge>
                      </div>
                      <div className="pt-2 text-3xs text-zinc-500 font-mono flex justify-center gap-3 border-t border-zinc-900/50 mt-1.5">
                        <span>Email code: <span className={getAccentClass("text")}>123456</span></span>
                        <span>SMS code: <span className={getAccentClass("text")}>654321</span></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="6-Digit Email OTP"
                        placeholder="123456"
                        required
                        maxLength={6}
                        value={emailVerifyCode}
                        onChange={(e) => setEmailVerifyCode(e.target.value.replace(/\D/g, ""))}
                        icon={<ShieldCheck className="h-4 w-4 text-zinc-500" />}
                      />
                      <Input
                        label="6-Digit SMS OTP"
                        placeholder="654321"
                        required
                        maxLength={6}
                        value={phoneVerifyCode}
                        onChange={(e) => setPhoneVerifyCode(e.target.value.replace(/\D/g, ""))}
                        icon={<ShieldCheck className="h-4 w-4 text-zinc-500" />}
                      />
                    </div>

                    <div className="pt-2 flex gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => setOnboardStep(2)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          if (emailVerifyCode !== "123456" || phoneVerifyCode !== "654321") {
                            setErrorMsg("Verification code mismatch. Please review coordinate coordinates.");
                            return;
                          }
                          setErrorMsg("");
                          setOnboardStep(4);
                        }}
                        className="flex-1 flex justify-center items-center gap-1"
                      >
                        <span>Verify Identity</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Localized Operational Settings */}
                {onboardStep === 4 && (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-zinc-950/40 border border-zinc-800/50 rounded-xl">
                      <span className="text-3xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">Preloaded Regional Settings</span>
                      <p className="text-[11px] text-zinc-400">Settings resolved automatically from incorporative coordinates. Adjust below as desired.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-semibold text-zinc-400">Timezone Node</span>
                        <select
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
                        >
                          <option>Asia/Dubai</option>
                          <option>America/Los_Angeles</option>
                          <option>America/New_York</option>
                          <option>Europe/London</option>
                          <option>Asia/Singapore</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="font-semibold text-zinc-400">Ledger Currency</span>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
                        >
                          <option>AED (United Arab Emirates Dirham)</option>
                          <option>USD ($)</option>
                          <option>EUR (€)</option>
                          <option>SGD (S$)</option>
                          <option>GBP (£)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-semibold text-zinc-400">Interface Language</span>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
                        >
                          <option>English (Arabic Dual)</option>
                          <option>English</option>
                          <option>Spanish</option>
                          <option>German</option>
                          <option>Chinese</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="font-semibold text-zinc-400">Core Industry</span>
                        <select
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
                        >
                          <option>Artificial Intelligence</option>
                          <option>E-Commerce</option>
                          <option>Logistics & Supply Chain</option>
                          <option>Enterprise Software</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => setOnboardStep(3)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => setOnboardStep(5)}
                        className="flex-1 flex justify-center items-center gap-1"
                      >
                        <span>Workspace Structure</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 5: Workforce Departments & Teams */}
                {onboardStep === 5 && (
                  <div className="space-y-4 text-xs">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-bold text-zinc-400 uppercase tracking-wider text-3xs">
                        Configure Core Operational Departments
                      </span>
                      <div className="max-h-32 overflow-y-auto space-y-1.5 bg-zinc-950/40 p-2.5 border border-zinc-850 rounded-xl custom-scrollbar">
                        {departmentsList.map((dept, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-zinc-950 rounded-lg border border-zinc-850/80"
                          >
                            <span className="text-zinc-300 font-medium">{dept}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setDepartmentsList(
                                  departmentsList.filter((_, i) => i !== index)
                                )
                              }
                              className="text-rose-500 hover:text-rose-400 hover:bg-rose-950/20 p-1 rounded-md transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add department */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add Custom Department (e.g. Sales, Accounting)"
                        value={newDeptInput}
                        onChange={(e) => setNewDeptInput(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-850 text-2xs text-zinc-200 placeholder-zinc-600 rounded-lg py-1.5 px-3 focus:outline-none focus:border-zinc-700"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          if (!newDeptInput.trim()) return;
                          setDepartmentsList([...departmentsList, newDeptInput.trim()]);
                          setNewDeptInput("");
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="font-semibold text-zinc-400">Invite Colleagues (Optional, Comma-Separated)</span>
                      <textarea
                        placeholder="coo@company.com, advisor@company.com"
                        rows={2}
                        value={invitedEmails}
                        onChange={(e) => setInvitedEmails(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 text-2xs"
                      />
                    </div>

                    <div className="pt-2 flex gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => setOnboardStep(4)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => setOnboardStep(6)}
                        className="flex-1 flex justify-center items-center gap-1"
                      >
                        <span>Document Vault</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 6: Secure Document Vault & OCR Simulation */}
                {onboardStep === 6 && (
                  <div className="space-y-4">
                    <div className="p-3 bg-indigo-950/10 border border-indigo-900/20 rounded-xl flex items-center gap-2.5">
                      <ShieldCheck className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                      <p className="text-[10px] text-zinc-400 leading-normal">
                        **Exshopi KYC Standards** require upload of incorporative credentials. Live OCR Scan nodes will extract license particulars.
                      </p>
                    </div>

                    {/* Upload grid buttons */}
                    <div className="grid grid-cols-3 gap-2.5 text-3xs font-mono">
                      {/* Trade License */}
                      <button
                        type="button"
                        onClick={() => handleSimulatedUpload("trade_license")}
                        disabled={!!uploadingDocType}
                        className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 justify-center transition-all ${
                          uploadedDocs.some(d => d.documentType === "trade_license")
                            ? "border-emerald-500/30 bg-emerald-950/10 text-emerald-400"
                            : "border-zinc-850 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-950"
                        }`}
                      >
                        <UploadCloud className="h-4 w-4" />
                        <span>TRADE LICENSE</span>
                        {uploadedDocs.some(d => d.documentType === "trade_license") && (
                          <Badge variant="success" className="text-[9px] px-1 py-0.5 mt-0.5">VERIFIED</Badge>
                        )}
                      </button>

                      {/* VAT Certificate */}
                      <button
                        type="button"
                        onClick={() => handleSimulatedUpload("vat_certificate")}
                        disabled={!!uploadingDocType}
                        className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 justify-center transition-all ${
                          uploadedDocs.some(d => d.documentType === "vat_certificate")
                            ? "border-emerald-500/30 bg-emerald-950/10 text-emerald-400"
                            : "border-zinc-850 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-950"
                        }`}
                      >
                        <UploadCloud className="h-4 w-4" />
                        <span>VAT DOCUMENT</span>
                        {uploadedDocs.some(d => d.documentType === "vat_certificate") && (
                          <Badge variant="success" className="text-[9px] px-1 py-0.5 mt-0.5">VERIFIED</Badge>
                        )}
                      </button>

                      {/* Passport Copy */}
                      <button
                        type="button"
                        onClick={() => handleSimulatedUpload("passport_copy")}
                        disabled={!!uploadingDocType}
                        className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 justify-center transition-all ${
                          uploadedDocs.some(d => d.documentType === "passport_copy")
                            ? "border-emerald-500/30 bg-emerald-950/10 text-emerald-400"
                            : "border-zinc-850 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-950"
                        }`}
                      >
                        <UploadCloud className="h-4 w-4" />
                        <span>PASSPORT SCAN</span>
                        {uploadedDocs.some(d => d.documentType === "passport_copy") && (
                          <Badge variant="success" className="text-[9px] px-1 py-0.5 mt-0.5">VERIFIED</Badge>
                        )}
                      </button>
                    </div>

                    {/* Progress indicator */}
                    {uploadingDocType && (
                      <div className="space-y-1.5 bg-zinc-950/50 p-3 border border-zinc-850 rounded-xl font-mono text-[10px]">
                        <div className="flex justify-between text-zinc-400">
                          <span className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3 animate-spin text-indigo-400" />
                            <span>Uploading & Scanning {uploadingDocType.replace("_", " ")}...</span>
                          </span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Active uploaded document list with preview/delete capability */}
                    {uploadedDocs.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-3xs font-bold text-zinc-500 uppercase tracking-widest block">Active Cloud Vault Files</span>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                          {uploadedDocs.map((doc) => (
                            <div key={doc.id} className="flex justify-between items-center p-2.5 bg-zinc-950 rounded-xl border border-zinc-850/60 text-2xs">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                                <div className="text-left">
                                  <div className="text-zinc-200 font-medium truncate max-w-[200px]">{doc.name}</div>
                                  <div className="text-zinc-500 text-3xs">{doc.size} • {doc.documentType.toUpperCase()}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setPreviewDoc(doc)}
                                  icon={<Eye className="h-3.5 w-3.5" />}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-md transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* OCR Output Terminal Log */}
                    {ocrLogs.length > 0 && (
                      <div className="p-3 bg-black border border-zinc-850/80 rounded-xl font-mono text-[9px] h-24 overflow-y-auto custom-scrollbar text-indigo-400">
                        <div className="text-zinc-500 border-b border-zinc-900 pb-1 mb-1 font-bold uppercase text-[8px]">OCR scan telemetry logs</div>
                        {ocrLogs.map((log, i) => (
                          <div key={i} className="flex gap-1 items-start">
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => setOnboardStep(5)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          if (uploadedDocs.length < 1) {
                            setErrorMsg("Security index requires at least 1 verified business document scan.");
                            return;
                          }
                          setErrorMsg("");
                          setOnboardStep(7);
                        }}
                        className="flex-1 flex justify-center items-center gap-1"
                      >
                        <span>Workspace Tier</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 7: Workspace Licensing */}
                {onboardStep === 7 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2.5 text-xs">
                      {/* Growth Plan */}
                      <button
                        type="button"
                        onClick={() => setChosenPlan("Growth")}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-44 transition-all ${
                          chosenPlan === "Growth"
                            ? "bg-zinc-950 border-zinc-600 ring-1 ring-zinc-600"
                            : "bg-zinc-950/30 border-zinc-850 hover:border-zinc-750"
                        }`}
                      >
                        <div>
                          <span className="text-3xs font-bold text-zinc-500 uppercase tracking-wider">
                            Basic
                          </span>
                          <h4 className="font-bold text-zinc-100 text-xs mt-0.5">Growth</h4>
                          <p className="text-zinc-500 text-[9px] mt-1.5 leading-snug">
                            1 AI specialist, 3 core departments, manual trigger workspace.
                          </p>
                        </div>
                        <div className="font-bold text-zinc-300 text-xs">$0 <span className="text-3xs text-zinc-600 font-normal">trial</span></div>
                      </button>

                      {/* Scale Plan */}
                      <button
                        type="button"
                        onClick={() => setChosenPlan("Scale")}
                        className={`relative p-3 rounded-2xl border text-left flex flex-col justify-between h-44 transition-all ${
                          chosenPlan === "Scale"
                            ? "bg-indigo-950/20 border-indigo-500 ring-1 ring-indigo-500"
                            : "bg-zinc-950/30 border-zinc-850 hover:border-indigo-900/30"
                        }`}
                      >
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow">
                          RECOMMENDED
                        </span>
                        <div>
                          <span className="text-3xs font-bold text-indigo-400 uppercase tracking-wider">
                            Strategic
                          </span>
                          <h4 className="font-bold text-zinc-100 text-xs mt-0.5">Scale AI</h4>
                          <p className="text-zinc-500 text-[9px] mt-1.5 leading-snug">
                            Spawns Sophia AI CEO, autonomous specialists, custom budgets.
                          </p>
                        </div>
                        <div className="font-bold text-indigo-300 text-xs">$250 <span className="text-3xs text-zinc-600 font-normal">/mo</span></div>
                      </button>

                      {/* Enterprise Plan */}
                      <button
                        type="button"
                        onClick={() => setChosenPlan("Enterprise")}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-44 transition-all ${
                          chosenPlan === "Enterprise"
                            ? "bg-zinc-950 border-zinc-600 ring-1 ring-zinc-600"
                            : "bg-zinc-950/30 border-zinc-850 hover:border-zinc-750"
                        }`}
                      >
                        <div>
                          <span className="text-3xs font-bold text-zinc-500 uppercase tracking-wider">
                            PCI-DSS Group
                          </span>
                          <h4 className="font-bold text-zinc-100 text-xs mt-0.5">Enterprise</h4>
                          <p className="text-zinc-500 text-[9px] mt-1.5 leading-snug">
                            Dedicated VPS containers, HIPAA vault, unlimited AI cores.
                          </p>
                        </div>
                        <div className="font-bold text-zinc-300 text-xs">$950 <span className="text-3xs text-zinc-600 font-normal">/mo</span></div>
                      </button>
                    </div>

                    <div className="pt-2 flex gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => setOnboardStep(6)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          setOnboardStep(8);
                          handleOnboardingSubmit();
                        }}
                        className="flex-1 flex justify-center items-center gap-1.5 font-bold"
                      >
                        <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-400" />
                        <span>Provision Cockpit</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 8: Terminal logs */}
                {onboardStep === 8 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-black border border-zinc-850 rounded-xl font-mono text-3xs space-y-2 h-56 overflow-y-auto custom-scrollbar shadow-inner text-green-400 text-left">
                      <div className="flex items-center gap-2 text-zinc-400 border-b border-zinc-850 pb-1.5 mb-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                        <span className="font-bold uppercase text-[8px]">PROVISIONING COCKPIT VM LOGS</span>
                      </div>
                      {onboardingLogs.map((log, idx) => (
                        <div key={idx} className="flex gap-1.5 items-start">
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                          <span>{log}</span>
                        </div>
                      ))}
                      {loading && (
                        <div className="flex items-center gap-2 text-zinc-500 italic mt-3 animate-pulse">
                          <RefreshCw className="h-3 w-3 animate-spin text-zinc-500" />
                          <span>Deploying autonomous cores...</span>
                        </div>
                      )}
                    </div>
                    <div className="text-center text-3xs text-zinc-500 italic">
                      Compiling environment ledger data. Please hold connection link alive.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. 5-Minute AI Onboarding Configurator Mode (Post-registration setup!) */}
            {mode === "aiOnboarding" && (
              <div className="space-y-5">
                <div className="text-center pb-2 border-b border-zinc-850/80">
                  <div className="inline-flex p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 mb-2.5">
                    <Sparkles className="h-5 w-5 animate-spin-slow" />
                  </div>
                  <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Configure Autonomous AI Workforce</h2>
                  <p className="text-zinc-400 text-[11px] mt-0.5">Let's align Sophia AI CEO and manager agents with your corporate objectives.</p>
                </div>

                {!aiStrategyMarkdown ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl flex gap-2.5 text-left items-start">
                      <div className="h-6 w-6 rounded-full bg-indigo-600/20 flex items-center justify-center border border-indigo-500/20 shrink-0 text-indigo-400 font-mono text-[10px] font-bold">A</div>
                      <p className="text-[10px] text-zinc-400 leading-normal">
                        **Sophia AI CEO:** "Welcome Ahsan. To configure your autonomous divisions, please declare your primary market profiles."
                      </p>
                    </div>

                    <div className="space-y-3.5 text-left">
                      <Input
                        label="1. Target Audience / Customer Segments"
                        placeholder="E-commerce sellers, retail stores, local SMEs"
                        value={aiAudience}
                        onChange={(e) => setAiAudience(e.target.value)}
                      />

                      <Input
                        label="2. Core Business Objective / Key KPI"
                        placeholder="Double Q3 automated outbound sales deals booked"
                        value={aiKPI}
                        onChange={(e) => setAiKPI(e.target.value)}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="3. Monthly Operational Budget Limit"
                          placeholder="$10,000 monthly limit"
                          value={aiBudget}
                          onChange={(e) => setAiBudget(e.target.value)}
                        />
                        <Input
                          label="4. Security Compliance Profiles"
                          placeholder="SOC-2 and GDPR compliant"
                          value={aiCompliance}
                          onChange={(e) => setAiCompliance(e.target.value)}
                        />
                      </div>

                      <Input
                        label="5. Primary Market Competitors"
                        placeholder="Traditional support channels and outsource brokers"
                        value={aiCompetitors}
                        onChange={(e) => setAiCompetitors(e.target.value)}
                      />
                    </div>

                    <Button
                      variant="primary"
                      className="w-full mt-2 font-bold"
                      onClick={handleAIOnboardingSubmit}
                      loading={aiGenerating}
                    >
                      Deploy AI Workforce Strategy
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-xs text-emerald-400 text-center flex items-center justify-center gap-1.5 font-semibold">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Workforce strategy successfully deployed to Exshopi Cloud Vault!</span>
                    </div>

                    {/* Preview generated strategy & CEO prompt */}
                    <div className="space-y-3">
                      <div className="text-left">
                        <span className="text-3xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">Generated strategic blueprint</span>
                        <div className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl h-36 overflow-y-auto custom-scrollbar font-mono text-3xs text-zinc-300 leading-normal text-left">
                          <pre className="whitespace-pre-wrap">{aiStrategyMarkdown}</pre>
                        </div>
                      </div>

                      <div className="text-left">
                        <span className="text-3xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">Sophia AI CEO core system prompt</span>
                        <div className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl h-24 overflow-y-auto custom-scrollbar font-mono text-3xs text-indigo-400 leading-normal text-left">
                          <pre className="whitespace-pre-wrap">{aiCeoPrompt}</pre>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-950/40 border border-zinc-800/80 rounded-xl text-left text-3xs text-zinc-400 leading-relaxed">
                      💡 These strategic instructions and system Prompts are now live on your **Documents hub** as permanent source-of-truth manuals for your workforce agents.
                    </div>

                    <Button
                      variant="primary"
                      className="w-full font-bold flex items-center justify-center gap-1.5"
                      onClick={onSuccess}
                    >
                      <span>Enter Exshopi Command Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* AI Configuration Processing Terminal */}
                {aiGenerating && (
                  <div className="p-3.5 bg-black border border-zinc-850 rounded-xl font-mono text-3xs space-y-1 text-indigo-400 text-left h-28 overflow-y-auto custom-scrollbar">
                    <div className="text-zinc-500 border-b border-zinc-900 pb-1 mb-1 font-bold">GENERATION TELEMETRY LOGS</div>
                    {aiGenLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-1.5 items-start">
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. MFA Verification Screen */}
            {mode === "mfa" && (
              <form onSubmit={handleMfaSubmit} className="space-y-5">
                <div className="text-center pb-2 flex flex-col items-center">
                  <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-400 mb-3 border border-indigo-500/20">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Multi-Factor Authenticator</h2>
                  <p className="text-zinc-500 text-xs mt-1">Provide corporate authentication sequence to gain terminal clearance</p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-950/30 border border-rose-900/30 rounded-xl text-xs text-rose-400 text-center">
                    {errorMsg}
                  </div>
                )}

                <Input
                  label="6-Digit Auth Token"
                  placeholder="000 000"
                  type="text"
                  maxLength={6}
                  required
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ""))}
                  icon={<Fingerprint className="h-4 w-4 text-zinc-500" />}
                  className="text-center font-mono text-lg tracking-[0.25em]"
                />

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-3xs text-zinc-500 leading-relaxed text-left">
                  💡 **MFA Security Protocols:** Active trial profile bypassed with any 6-digit credential. Real-world systems enforce dynamic software codes.
                </div>

                <Button variant="primary" className="w-full mt-2" type="submit" loading={loading}>
                  Confirm Session Credentials
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setOtpToken("");
                      setErrorMsg("");
                    }}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Cancel authentication attempt
                  </button>
                </div>
              </form>
            )}

            {/* 5. Lock Screen Mode */}
            {mode === "lock" && (
              <form onSubmit={handleUnlockPasscode} className="space-y-5">
                <div className="text-center pb-2 flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full overflow-hidden border border-zinc-700/60 shadow-xl mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="User Avatar"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
                    {currentUser?.full_name || "Ahsan Haji"}
                  </h2>
                  <Badge variant="accent" className="mt-1">
                    Screen Locked
                  </Badge>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-950/30 border border-rose-900/30 rounded-xl text-xs text-rose-400 text-center">
                    {errorMsg}
                  </div>
                )}

                <Input
                  label="Enter Lock Passcode (Try '1234')"
                  placeholder="••••"
                  type="password"
                  maxLength={4}
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ""))}
                  icon={<KeyRound className="h-4 w-4 text-zinc-500" />}
                  className="text-center font-mono text-lg tracking-[0.4em]"
                />

                <Button variant="primary" className="w-full mt-2" type="submit">
                  Unlock Workspace
                </Button>

                <div className="text-center pt-2 border-t border-zinc-800/60 mt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={triggerLogout}
                    className="text-xs text-rose-400 hover:text-rose-300 transition-colors inline-flex items-center gap-1 font-semibold"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Close session
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPasscode("1234");
                      setErrorMsg("");
                    }}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Bypass '1234'
                  </button>
                </div>
              </form>
            )}

            {/* 6. Session Expired Mode */}
            {mode === "expired" && (
              <div className="space-y-5 text-center">
                <div className="p-3 bg-rose-500/10 rounded-full text-rose-400 mx-auto w-fit mb-3 border border-rose-500/20">
                  <AlertTriangle className="h-6 w-6 animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Session Credentials Expired</h2>
                <p className="text-zinc-500 text-xs mt-1">
                  Active security verification lifecycle exceeded the 15-minute high-security TTL limit.
                </p>

                <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl text-left space-y-2 font-mono text-3xs text-zinc-500">
                  <div>PROTOCOL_INDEX: SEC-JWT-ACTIVE-RENEWAL</div>
                  <div>TRIGGER_SENSOR: EXPIRED_IDLE_CONCURRENCY</div>
                </div>

                <Button variant="primary" className="w-full font-bold" onClick={() => setMode("login")}>
                  Re-Authenticate Profile
                </Button>
              </div>
            )}

            {/* 7. Forgot Password Mode */}
            {mode === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="text-center pb-2">
                  <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Recover Secure Access</h2>
                  <p className="text-zinc-500 text-xs mt-1">Request cryptographic resets to registered admin coordinates</p>
                </div>

                <Input
                  label="Registered Email"
                  placeholder="hajiiahsan786@gmail.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="h-4 w-4 text-zinc-500" />}
                />

                <Button variant="primary" className="w-full mt-2" type="submit" loading={loading}>
                  Dispatch Reset Key
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    Return to login gate
                  </button>
                </div>
              </form>
            )}

            {/* 8. Reset Password Mode */}
            {mode === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="text-center pb-2">
                  <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Setup Secure Password</h2>
                  <p className="text-zinc-500 text-xs mt-1">Establish high-entropy credentials</p>
                </div>

                {successMsg && (
                  <div className="p-3 bg-emerald-950/30 border border-emerald-900/30 rounded-xl text-xs text-emerald-400 text-center">
                    {successMsg}
                  </div>
                )}

                <Input
                  label="New Secure Password"
                  placeholder="••••••••••••"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4 text-zinc-500" />}
                />

                <Button variant="primary" className="w-full mt-2" type="submit" loading={loading}>
                  Rotate Credentials
                </Button>
              </form>
            )}

            {/* 9. Profile card (Identity verify fallback) */}
            {mode === "profile" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="h-20 w-20 rounded-full border-2 border-indigo-500/20 overflow-hidden mx-auto mb-3 shadow-2xl relative">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                      alt="User Avatar"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-100">{currentUser?.full_name || "Ahsan Haji"}</h3>
                  <p className="text-zinc-500 text-xs font-mono">{currentUser?.email || "hajiiahsan786@gmail.com"}</p>
                </div>

                <div className="space-y-2 border-t border-zinc-850 pt-4 text-xs text-zinc-400">
                  <div className="flex justify-between py-1 border-b border-zinc-900/40">
                    <span className="text-zinc-500">Security Authorization</span>
                    <span className="font-semibold text-zinc-300">Level-3 Global Admin</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-900/40">
                    <span className="text-zinc-500">Active Tenant ID</span>
                    <span className="font-mono text-zinc-300 font-semibold">T-900-EX-882</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Security Clearance</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <UserCheck className="h-3 w-3" /> VERIFIED
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="primary" className="flex-1 font-bold" onClick={onSuccess}>
                    Launch Cockpit Command
                  </Button>
                  <Button variant="danger" icon={<LogOut className="h-4 w-4" />} onClick={triggerLogout} />
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Interactive Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-6 select-none">
          <Card className="w-full max-w-lg bg-zinc-900 border border-zinc-800 p-6 rounded-[30px] space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-zinc-200">{previewDoc.name} ({previewDoc.documentType.toUpperCase()})</h3>
              </div>
              <Badge variant="success" className="font-bold">VERIFIED OCR</Badge>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-black border border-zinc-850 rounded-xl font-mono text-[9px] text-green-400 leading-normal text-left h-48 overflow-y-auto custom-scrollbar">
                <pre>{previewDoc.ocr_text}</pre>
              </div>

              {previewDoc.extractedData && (
                <div className="bg-zinc-950 p-3.5 border border-zinc-850 rounded-xl space-y-2 text-2xs text-left">
                  <div className="text-zinc-500 uppercase tracking-wider text-[9px] font-bold border-b border-zinc-900 pb-1 mb-1">Extracted index items</div>
                  {Object.entries(previewDoc.extractedData).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-zinc-400 capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>
                      <span className="font-mono text-zinc-200 font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setPreviewDoc(null)}>
                Close Preview
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
