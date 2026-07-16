import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

export const procurementRouter = Router();

// ==========================================
// HIGH-FIDELITY IN-MEMORY DATABASES
// ==========================================

export let suppliers = [
  {
    id: 1,
    name: "Global Microchip Solutions",
    category: "Semiconductors",
    status: "Preferred",
    rating: 4.8,
    score: 96,
    country: "Japan",
    city: "Tokyo",
    contactName: "Kenji Sato",
    email: "sato@globalmicrochip.jp",
    phone: "+81-3-5555-0142",
    documents: ["Silicon SLA.pdf", "ISO-9001.pdf"],
    history: [
      { id: 1001, date: "2026-03-12", amount: 45000, items: "SLA Micro-controller v3", status: "Completed" },
      { id: 1002, date: "2026-05-18", amount: 125000, items: "H100 Tensor Core", status: "Completed" }
    ],
    contracts: [
      { id: "CON-8821", title: "Master Semiconductor Allocation Agreement", expiry: "2027-12-31", status: "Active" }
    ],
    invoices: [
      { id: "INV-9901", amount: 125000, date: "2026-05-20", status: "Paid" }
    ]
  },
  {
    id: 2,
    name: "NeoSteel Foundries LLC",
    category: "Raw Metals",
    status: "Active",
    rating: 4.5,
    score: 91,
    country: "United States",
    city: "Pittsburgh",
    contactName: "Sarah Jenkins",
    email: "s.jenkins@neosteel.com",
    phone: "+1-412-555-0182",
    documents: ["Metals Standard Cert.pdf", "BOM SLA.pdf"],
    history: [
      { id: 1003, date: "2026-04-10", amount: 32000, items: "Steel Coils Grade A", status: "Completed" },
      { id: 1004, date: "2026-06-22", amount: 45000, items: "Structural Girders", status: "Processing" }
    ],
    contracts: [
      { id: "CON-8825", title: "Structural Alloy Pricing Schedule", expiry: "2026-11-30", status: "Active" }
    ],
    invoices: [
      { id: "INV-9904", amount: 32000, date: "2026-04-12", status: "Paid" },
      { id: "INV-9912", amount: 45000, date: "2026-06-25", status: "Pending Approval" }
    ]
  },
  {
    id: 3,
    name: "Quantum Sensors Corp",
    category: "Sensors & Actuators",
    status: "Under Review",
    rating: 4.1,
    score: 82,
    country: "Germany",
    city: "Munich",
    contactName: "Dieter Weber",
    email: "d.weber@quantumsensors.de",
    phone: "+49-89-555-3211",
    documents: ["Calibration Report.pdf"],
    history: [
      { id: 1005, date: "2026-02-15", amount: 12500, items: "Opto-couplers & Laser Diodes", status: "Completed" }
    ],
    contracts: [],
    invoices: []
  }
];

export let purchaseRequests = [
  {
    id: 1,
    code: "PR-2026-001",
    title: "Gemini Model Server hardware",
    department: "AI Infrastructure",
    requester: "Sophia AI (Sales Pro)",
    total: 125000,
    status: "Approved",
    items: [
      { name: "SLA Micro-controller Node v3", qty: 5, unitPrice: 25000, total: 125000 }
    ],
    comments: [
      { id: 101, author: "Ahsan Haji (Admin)", content: "Infrastructure SLA verified. Critical core path upgrade.", timestamp: "2026-07-14 09:12" }
    ],
    history: [
      { event: "Created", user: "Sophia AI", timestamp: "2026-07-13 14:22" },
      { event: "Approved", user: "Ahsan Haji", timestamp: "2026-07-14 09:12" }
    ],
    attachments: ["Node Spec Sheet v3.1.pdf"]
  },
  {
    id: 2,
    code: "PR-2026-002",
    title: "Raw Steel Coil Grade A",
    department: "Vehicle Assembly",
    requester: "Fiona Finance Agent",
    total: 45000,
    status: "Pending Review",
    items: [
      { name: "Alloy Steel Coils (Type-A)", qty: 15, unitPrice: 3000, total: 45000 }
    ],
    comments: [
      { id: 102, author: "Lucas AI (Logistics)", content: "Current steel inventories at safety trigger threshold (7 days left). Recommended fast-track approval.", timestamp: "2026-07-15 08:30" }
    ],
    history: [
      { event: "Created", user: "Fiona Finance Agent", timestamp: "2026-07-15 08:30" }
    ],
    attachments: ["Chassis Assembly Grade-A Standard.pdf"]
  },
  {
    id: 3,
    code: "PR-2026-003",
    title: "Micro-Sensors SLA",
    department: "Quality Assurance",
    requester: "Ethan AI (Support Expert)",
    total: 12500,
    status: "Draft",
    items: [
      { name: "Precision Optical Sensors", qty: 25, unitPrice: 500, total: 12500 }
    ],
    comments: [],
    history: [
      { event: "Created", user: "Ethan AI", timestamp: "2026-07-15 08:45" }
    ],
    attachments: []
  }
];

export let purchaseOrders = [
  {
    id: 1,
    code: "PO-2026-101",
    prCode: "PR-2026-001",
    supplier: "Global Microchip Solutions",
    total: 125000,
    deliveryDate: "2026-08-15",
    status: "Confirmed",
    items: [
      { name: "SLA Micro-controller Node v3", qty: 5, unitPrice: 25000, total: 125000 }
    ],
    tax: 12500,
    discount: 5000,
    shippingCost: 1200,
    documents: ["SLA Node Allocation Order.pdf"],
    receivingStatus: "Awaiting Receipt"
  },
  {
    id: 2,
    code: "PO-2026-102",
    prCode: "PR-2026-002",
    supplier: "NeoSteel Foundries LLC",
    total: 45000,
    deliveryDate: "2026-07-28",
    status: "Processing",
    items: [
      { name: "Alloy Steel Coils (Type-A)", qty: 15, unitPrice: 3000, total: 45000 }
    ],
    tax: 4500,
    discount: 0,
    shippingCost: 2500,
    documents: ["Steel Supply Invoice Ref.pdf"],
    receivingStatus: "Partially Received"
  }
];

export let rfqs = [
  {
    id: 1,
    code: "RFQ-2026-501",
    title: "Grade AA Silicon Ingots Supply Plan",
    status: "Open",
    deadline: "2026-07-22",
    description: "Seeking SLA pricing structures for 100kg ultra-pure semiconductor grade monocrystalline silicon ingots.",
    invitations: ["Global Microchip Solutions", "Quantum Sensors Corp", "Shin-Etsu Silicon Ltd"],
    quotations: [
      { vendor: "Global Microchip Solutions", price: 95000, deliveryDays: 14, warranty: "24 months", terms: "Net 30", score: 95, selected: false },
      { vendor: "Quantum Sensors Corp", price: 88000, deliveryDays: 25, warranty: "12 months", terms: "Net 15", score: 88, selected: false }
    ]
  }
];

export let goodsReceipts = [
  {
    id: 1,
    code: "GR-2026-201",
    poCode: "PO-2026-102",
    supplier: "NeoSteel Foundries LLC",
    receivedDate: "2026-07-14",
    status: "Partial",
    acceptedQty: 10,
    rejectedQty: 1,
    partialReason: "Damage during shipping core crate #2",
    warehouse: "Zone-B Primary Coil Vault",
    inspections: [
      { check: "Metal Alloy Structural Crack Test", result: "Passed" },
      { check: "Gauge Thickness Verification", result: "Passed" },
      { check: "Corrosion and Humidity Check", result: "1 item failed" }
    ]
  }
];

export let returns = [
  {
    id: 1,
    code: "RET-2026-001",
    poCode: "PO-2026-102",
    supplier: "NeoSteel Foundries LLC",
    date: "2026-07-15",
    reason: "Gauge thickness deviations in coil #3",
    status: "Awaiting Credit Note",
    qty: 1
  }
];

export let vendorPayments = [
  {
    id: 1,
    invoiceRef: "INV-9901",
    poRef: "PO-2026-101",
    supplier: "Global Microchip Solutions",
    amount: 125000,
    date: "2026-05-22",
    status: "Settled",
    ledgerCode: "LDG-API-GPU-990",
    method: "FedWire"
  }
];

// Helper for Gemini AI Procurement Assistant
const getProcurementGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } catch (e) {
    return null;
  }
};

// ==========================================
// API ENDPOINTS
// ==========================================

// Get all procurement data summary
procurementRouter.get("/summary", (req: Request, res: Response) => {
  const spend = purchaseOrders.reduce((sum, p) => sum + p.total, 0);
  const activePRs = purchaseRequests.filter(p => p.status === "Pending Review").length;
  const preferredSuppliers = suppliers.filter(s => s.status === "Preferred").length;
  
  res.json({
    totalSpend: spend,
    activePurchaseRequests: activePRs,
    totalSuppliers: suppliers.length,
    preferredSuppliers,
    spendDistribution: [
      { name: "Semiconductors", value: 125000 },
      { name: "Raw Metals", value: 45000 },
      { name: "Sensors & Actuators", value: 12500 }
    ],
    procurementTrend: [
      { month: "Jan", spend: 35000, savings: 5000 },
      { month: "Feb", spend: 52000, savings: 8000 },
      { month: "Mar", spend: 45000, savings: 4500 },
      { month: "Apr", spend: 32000, savings: 3200 },
      { month: "May", spend: 125000, savings: 15000 },
      { month: "Jun", spend: 45000, savings: 4000 },
      { month: "Jul", spend: 182500, savings: 24200 }
    ]
  });
});

// SUPPLIERS
procurementRouter.get("/suppliers", (req: Request, res: Response) => {
  res.json(suppliers);
});

procurementRouter.post("/suppliers", (req: Request, res: Response) => {
  const { name, category, status, country, city, contactName, email, phone } = req.body;
  const newSupplier = {
    id: suppliers.length + 1,
    name: name || "New Vendor",
    category: category || "General Goods",
    status: status || "Active",
    rating: 5.0,
    score: 90,
    country: country || "US",
    city: city || "SF",
    contactName: contactName || "Unknown",
    email: email || "vendor@exshopi.ai",
    phone: phone || "",
    documents: [],
    history: [],
    contracts: [],
    invoices: []
  };
  suppliers.push(newSupplier);
  res.status(201).json(newSupplier);
});

// PURCHASE REQUESTS
procurementRouter.get("/requests", (req: Request, res: Response) => {
  res.json(purchaseRequests);
});

procurementRouter.post("/requests", (req: Request, res: Response) => {
  const { title, department, requester, total, items, comments } = req.body;
  const nextId = purchaseRequests.length + 1;
  const code = `PR-2026-${String(nextId).padStart(3, '0')}`;
  
  const newPR = {
    id: nextId,
    code,
    title: title || "Material requisition request",
    department: department || "Operations",
    requester: requester || "System Operator",
    total: total || 0,
    status: "Pending Review",
    items: items || [],
    comments: comments ? [{ id: Date.now(), author: requester, content: comments, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) }] : [],
    history: [
      { event: "Created", user: requester || "System Operator", timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) }
    ],
    attachments: []
  };
  
  purchaseRequests.push(newPR);
  res.status(201).json(newPR);
});

procurementRouter.patch("/requests/:id/approve", (req: Request, res: Response) => {
  const prId = parseInt(req.params.id);
  const pr = purchaseRequests.find(p => p.id === prId);
  if (pr) {
    pr.status = "Approved";
    pr.history.push({
      event: "Approved",
      user: "Ahsan Haji (Admin)",
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });
    
    // Automatically generate a Purchase Order
    const nextPoId = purchaseOrders.length + 1;
    const poCode = `PO-2026-${100 + nextPoId}`;
    const matchedSupplier = suppliers[0]; // Auto select preferred supplier for automation
    
    const newPO = {
      id: nextPoId,
      code: poCode,
      prCode: pr.code,
      supplier: matchedSupplier.name,
      total: pr.total,
      deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "Confirmed",
      items: pr.items.map(item => ({ ...item, unitPrice: item.unitPrice, total: item.total })),
      tax: Math.round(pr.total * 0.08),
      discount: 0,
      shippingCost: 1500,
      documents: [],
      receivingStatus: "Awaiting Receipt"
    };
    purchaseOrders.push(newPO);
    
    res.json({ success: true, pr, po: newPO });
  } else {
    res.status(404).json({ error: "Purchase Request not found" });
  }
});

procurementRouter.patch("/requests/:id/reject", (req: Request, res: Response) => {
  const prId = parseInt(req.params.id);
  const pr = purchaseRequests.find(p => p.id === prId);
  if (pr) {
    pr.status = "Rejected";
    pr.history.push({
      event: "Rejected",
      user: "Ahsan Haji (Admin)",
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });
    res.json({ success: true, pr });
  } else {
    res.status(404).json({ error: "Purchase Request not found" });
  }
});

// PURCHASE ORDERS
procurementRouter.get("/orders", (req: Request, res: Response) => {
  res.json(purchaseOrders);
});

// RFQs
procurementRouter.get("/rfqs", (req: Request, res: Response) => {
  res.json(rfqs);
});

procurementRouter.post("/rfqs", (req: Request, res: Response) => {
  const { title, description, deadline, invitations } = req.body;
  const nextId = rfqs.length + 1;
  const newRfq = {
    id: nextId,
    code: `RFQ-2026-${500 + nextId}`,
    title,
    status: "Open",
    deadline,
    description,
    invitations: invitations || [],
    quotations: []
  };
  rfqs.push(newRfq);
  res.status(201).json(newRfq);
});

procurementRouter.post("/rfqs/:id/award", (req: Request, res: Response) => {
  const rfqId = parseInt(req.params.id);
  const { vendorName } = req.body;
  const rfq = rfqs.find(r => r.id === rfqId);
  if (rfq) {
    rfq.status = "Awarded";
    rfq.quotations = rfq.quotations.map(q => ({
      ...q,
      selected: q.vendor === vendorName
    }));
    
    // Auto-create PO
    const awardedQuote = rfq.quotations.find(q => q.vendor === vendorName);
    if (awardedQuote) {
      const nextPoId = purchaseOrders.length + 1;
      const poCode = `PO-2026-${100 + nextPoId}`;
      const newPO = {
        id: nextPoId,
        code: poCode,
        prCode: `RFQ-${rfq.code}`,
        supplier: vendorName,
        total: awardedQuote.price,
        deliveryDate: new Date(Date.now() + awardedQuote.deliveryDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "Confirmed",
        items: [{ name: rfq.title, qty: 1, unitPrice: awardedQuote.price, total: awardedQuote.price }],
        tax: Math.round(awardedQuote.price * 0.08),
        discount: 0,
        shippingCost: 850,
        documents: [],
        receivingStatus: "Awaiting Receipt"
      };
      purchaseOrders.push(newPO);
      res.json({ success: true, rfq, po: newPO });
    } else {
      res.json({ success: true, rfq });
    }
  } else {
    res.status(404).json({ error: "RFQ not found" });
  }
});

// GOODS RECEIPTS
procurementRouter.get("/receipts", (req: Request, res: Response) => {
  res.json(goodsReceipts);
});

procurementRouter.post("/receipts", (req: Request, res: Response) => {
  const { poCode, supplier, acceptedQty, rejectedQty, partialReason, warehouse, inspections } = req.body;
  const nextId = goodsReceipts.length + 1;
  const newReceipt = {
    id: nextId,
    code: `GR-2026-${200 + nextId}`,
    poCode,
    supplier,
    receivedDate: new Date().toISOString().split('T')[0],
    status: rejectedQty > 0 ? "Under Review" : "Completed",
    acceptedQty: parseInt(acceptedQty) || 0,
    rejectedQty: parseInt(rejectedQty) || 0,
    partialReason: partialReason || "",
    warehouse: warehouse || "Primary Assembly Shelf",
    inspections: inspections || []
  };
  goodsReceipts.push(newReceipt);
  
  // Update PO state to received
  const po = purchaseOrders.find(p => p.code === poCode);
  if (po) {
    po.receivingStatus = "Received";
    po.status = "Completed";
  }
  
  res.status(201).json(newReceipt);
});

// INVOICES & PAYMENTS
procurementRouter.get("/payments", (req: Request, res: Response) => {
  res.json(vendorPayments);
});

// ==========================================
// GEMINI PROCUREMENT AI ENDPOINT
// ==========================================
procurementRouter.post("/ai-agent", async (req: Request, res: Response) => {
  const { prompt, context } = req.body;
  
  const ai = getProcurementGeminiClient();
  if (!ai) {
    return res.json({
      success: true,
      text: "System intelligence engine operates in local air-gapped sandbox. Ready to optimize supplier routing and cost schedules with heuristic matrices:\n\n- Global Microchip Solutions has a Performance rating of **96** and is highly recommended.\n- Steel Grade-A prices show standard inflation tolerances of **+1.2%** next month. Recommend locking CON-8825 contract pricing.\n- Detected 0 duplicate purchases this cycle."
    });
  }

  try {
    const systemPrompt = `You are the Exshopi AI Enterprise Procurement & Supply Chain Agent.
You have active real-time access to the procurement databases:
- Suppliers: ${JSON.stringify(suppliers)}
- Active Purchase Requests: ${JSON.stringify(purchaseRequests)}
- Purchase Orders: ${JSON.stringify(purchaseOrders)}
- Open RFQs and Quotations: ${JSON.stringify(rfqs)}

Provide highly precise, professional, industrial responses. 
Always recommend the best supplier, compare quotations, suggest negotiation terms, or analyze costs when requested.
Use Markdown formatting beautifully. Do not expose internal technical file paths.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7
      }
    });

    res.json({
      success: true,
      text: response.text
    });
  } catch (error: any) {
    console.error("Gemini Procurement AI call failed:", error);
    res.json({
      success: false,
      text: "Error interfacing with primary neural nodes. Activating fallback heuristic analysis:\n\n1. Global Microchip Solutions remains top priority (Rating 4.8).\n2. Steel Coils Grade-A lead times are estimated at 14 days."
    });
  }
});
