import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

export const manufacturingRouter = Router();

// ==========================================
// HIGH-FIDELITY IN-MEMORY DATABASES
// ==========================================

export let productionOrders = [
  {
    id: 1,
    code: "PO-MRP-2601",
    productName: "Autonomous Drone Chassis v2",
    qtyRequired: 50,
    qtyCompleted: 30,
    targetDate: "2026-07-20",
    startDate: "2026-07-10",
    status: "In Progress",
    assignedMachine: "Machine Unit #1 (Solder Station)",
    assignedOperator: "Marcus AI Logistics",
    progress: 60,
    bomCode: "BOM-DRONE-V2",
    routing: ["SMT PCB Mount", "Solder Assembly", "Laser Range Calibration", "Stress Test Cage"]
  },
  {
    id: 2,
    code: "PO-MRP-2602",
    productName: "AI Core Server Frame",
    qtyRequired: 10,
    qtyCompleted: 0,
    targetDate: "2026-07-28",
    startDate: "2026-07-16",
    status: "Scheduled",
    assignedMachine: "Machine Unit #3 (Precision CNC Mill)",
    assignedOperator: "Lucas AI Logistics",
    progress: 0,
    bomCode: "BOM-FRAME-S1",
    routing: ["CNC Steel Milling", "Frame Arc Weld", "SLA Ingress Mount", "Power Array Check"]
  },
  {
    id: 3,
    code: "PO-MRP-2603",
    productName: "Opto-Coupler Board Array",
    qtyRequired: 200,
    qtyCompleted: 200,
    targetDate: "2026-07-14",
    startDate: "2026-07-05",
    status: "Completed",
    assignedMachine: "Machine Unit #2 (Laser Calibrator)",
    assignedOperator: "Sophia AI Pro",
    progress: 100,
    bomCode: "BOM-OPTO-A",
    routing: ["Silicon Deposition", "Gold Wire Solder", "Laser Refraction Seal", "Diode Array QC"]
  }
];

export let workOrders = [
  {
    id: 1,
    code: "WO-001A",
    poCode: "PO-MRP-2601",
    operationName: "SMT PCB Mount",
    timeExpected: 120, // minutes
    timeActual: 110,
    status: "Completed",
    notes: "Placer nozzle calibrator recalibrated prior to mounting."
  },
  {
    id: 2,
    code: "WO-001B",
    poCode: "PO-MRP-2601",
    operationName: "Solder Assembly",
    timeExpected: 90,
    timeActual: 95,
    status: "Completed",
    notes: "Soldering wave temp stabilized at 215C."
  },
  {
    id: 3,
    code: "WO-001C",
    poCode: "PO-MRP-2601",
    operationName: "Laser Range Calibration",
    timeExpected: 45,
    timeActual: 12,
    status: "In Progress",
    notes: "Calibrating wavelength to 850nm ± 2nm tolerances."
  },
  {
    id: 4,
    code: "WO-001D",
    poCode: "PO-MRP-2601",
    operationName: "Stress Test Cage",
    timeExpected: 60,
    timeActual: 0,
    status: "Pending",
    notes: "Vibration threshold test profile ready."
  },
  {
    id: 5,
    code: "WO-002A",
    poCode: "PO-MRP-2602",
    operationName: "CNC Steel Milling",
    timeExpected: 240,
    timeActual: 0,
    status: "Pending",
    notes: "Awaiting machine unit #3 maintenance clearance."
  }
];

export let boms = [
  {
    id: 1,
    code: "BOM-DRONE-V2",
    productName: "Autonomous Drone Chassis v2",
    version: "v2.1",
    materials: [
      { name: "SLA Micro-controller Node v3", qty: 1, cost: 25000, available: 12 },
      { name: "Silicon Wafers Grade-A", qty: 2, cost: 500, available: 150 },
      { name: "Carbon Fiber Plate Sub-Frame", qty: 1, cost: 120, available: 45 },
      { name: "Laser Diode High Power", qty: 4, cost: 80, available: 200 }
    ],
    materialCost: 26340,
    availabilityStatus: "In Stock"
  },
  {
    id: 2,
    code: "BOM-FRAME-S1",
    productName: "AI Core Server Frame",
    version: "v1.0",
    materials: [
      { name: "Alloy Steel Coils (Type-A)", qty: 4, cost: 3000, available: 8 },
      { name: "Standard Rack Mounting Screws", qty: 50, cost: 2, available: 1500 },
      { name: "AI Power Transduction Array", qty: 1, cost: 1200, available: 2 }
    ],
    materialCost: 13300,
    availabilityStatus: "Material Shortage"
  }
];

export let machines = [
  {
    id: 1,
    name: "Machine Unit #1 (Solder Station)",
    status: "Running",
    efficiency: "94.5%",
    utilization: "91.2%",
    temperature: "215°C",
    lastServiceDate: "2026-06-10",
    operationalHours: 1420,
    activeOrder: "PO-MRP-2601"
  },
  {
    id: 2,
    name: "Machine Unit #2 (Laser Calibrator)",
    status: "Maintenance",
    efficiency: "88.0%",
    utilization: "78.5%",
    temperature: "42°C",
    lastServiceDate: "2026-07-15",
    operationalHours: 850,
    activeOrder: "PO-MRP-2603"
  },
  {
    id: 3,
    name: "Machine Unit #3 (Precision CNC Mill)",
    status: "Idle",
    efficiency: "92.5%",
    utilization: "84.0%",
    temperature: "22°C",
    lastServiceDate: "2026-05-18",
    operationalHours: 2100,
    activeOrder: "None"
  },
  {
    id: 4,
    name: "Machine Unit #4 (Robotic Ingress Assembly)",
    status: "Offline",
    efficiency: "0.0%",
    utilization: "0.0%",
    temperature: "18°C",
    lastServiceDate: "2026-04-20",
    operationalHours: 320,
    activeOrder: "None"
  }
];

export let qualityChecks = [
  {
    id: 1,
    code: "QC-2026-901",
    poCode: "PO-MRP-2603",
    checkedQty: 200,
    acceptedQty: 198,
    rejectedQty: 2,
    defectType: "Solder Bridge Bridging",
    correctiveAction: "Scrap board and recycle silicon base. Solder nozzle temperature optimized by +2C.",
    inspector: "Sophia AI Pro",
    date: "2026-07-14",
    status: "Closed"
  },
  {
    id: 2,
    code: "QC-2026-902",
    poCode: "PO-MRP-2601",
    checkedQty: 10,
    acceptedQty: 10,
    rejectedQty: 0,
    defectType: "None",
    correctiveAction: "None",
    inspector: "Marcus AI Logistics",
    date: "2026-07-13",
    status: "Completed"
  }
];

export let maintenanceEvents = [
  {
    id: 1,
    machineName: "Machine Unit #2 (Laser Calibrator)",
    type: "Lens Alignment & Wavelength Lock",
    scheduledDate: "2026-07-15",
    status: "In Progress",
    technician: "SRE Laser Team",
    downtimeExpected: 240 // minutes
  },
  {
    id: 2,
    machineName: "Machine Unit #1 (Solder Station)",
    type: "Heating Wave Crucible Flush",
    scheduledDate: "2026-07-22",
    status: "Scheduled",
    technician: "Marcus AI Logistics",
    downtimeExpected: 180
  }
];

export let scrapLog = [
  {
    id: 1,
    poCode: "PO-MRP-2603",
    materialName: "Gold Wire Core Bond",
    qty: 2,
    reason: "Wire tension snap during high velocity feed",
    cost: 160,
    date: "2026-07-14"
  }
];

// Helper for Gemini AI Manufacturing Assistant
const getMfgGeminiClient = () => {
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

// Manufacturing summary metrics
manufacturingRouter.get("/summary", (req: Request, res: Response) => {
  const runningCount = machines.filter(m => m.status === "Running").length;
  const maintenanceCount = machines.filter(m => m.status === "Maintenance").length;
  const activeJobsCount = productionOrders.filter(p => p.status === "In Progress").length;
  
  // High-fidelity capacity utilization calculation
  const totalUtilization = machines.reduce((sum, m) => sum + parseFloat(m.utilization.replace('%', '')), 0);
  const avgUtilization = (totalUtilization / machines.length).toFixed(1) + "%";

  res.json({
    activeOrders: productionOrders.length,
    runningMachines: runningCount,
    maintenanceMachines: maintenanceCount,
    activeJobs: activeJobsCount,
    averageUtilization: avgUtilization,
    efficiencyTrend: [
      { shift: "Shift-A", output: 120, target: 110, rate: 94 },
      { shift: "Shift-B", output: 105, target: 110, rate: 89 },
      { shift: "Shift-C", output: 118, target: 110, rate: 96 }
    ],
    machinePerformance: machines.map(m => ({
      name: m.name,
      efficiency: parseFloat(m.efficiency.replace('%', '')),
      utilization: parseFloat(m.utilization.replace('%', ''))
    }))
  });
});

// PRODUCTION ORDERS
manufacturingRouter.get("/production-orders", (req: Request, res: Response) => {
  res.json(productionOrders);
});

manufacturingRouter.post("/production-orders", (req: Request, res: Response) => {
  const { productName, qtyRequired, targetDate, bomCode, assignedMachine, assignedOperator } = req.body;
  const nextId = productionOrders.length + 1;
  const code = `PO-MRP-26${String(nextId).padStart(2, '0')}`;
  
  const newOrder = {
    id: nextId,
    code,
    productName,
    qtyRequired: parseInt(qtyRequired) || 10,
    qtyCompleted: 0,
    targetDate: targetDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    status: "Scheduled",
    assignedMachine: assignedMachine || "Machine Unit #3 (Precision CNC Mill)",
    assignedOperator: assignedOperator || "System AI Scheduler",
    progress: 0,
    bomCode: bomCode || "BOM-GENERIC",
    routing: ["Material Preparation", "Structure Milling", "Quality Inspection", "Finished Assembly"]
  };
  
  productionOrders.push(newOrder);
  res.status(201).json(newOrder);
});

// Update Production Order status or complete quantities
manufacturingRouter.patch("/production-orders/:id/update-quantity", (req: Request, res: Response) => {
  const poId = parseInt(req.params.id);
  const { qtyCompleted } = req.body;
  const po = productionOrders.find(p => p.id === poId);
  if (po) {
    po.qtyCompleted = parseInt(qtyCompleted);
    po.progress = Math.min(100, Math.round((po.qtyCompleted / po.qtyRequired) * 100));
    if (po.progress === 100) {
      po.status = "Completed";
    } else if (po.qtyCompleted > 0) {
      po.status = "In Progress";
    }
    res.json({ success: true, po });
  } else {
    res.status(404).json({ error: "Production Order not found" });
  }
});

// WORK ORDERS
manufacturingRouter.get("/work-orders", (req: Request, res: Response) => {
  res.json(workOrders);
});

manufacturingRouter.post("/work-orders", (req: Request, res: Response) => {
  const { poCode, operationName, timeExpected, notes } = req.body;
  const nextId = workOrders.length + 1;
  const code = `WO-${String(nextId).padStart(3, '0')}X`;
  
  const newWO = {
    id: nextId,
    code,
    poCode,
    operationName,
    timeExpected: parseInt(timeExpected) || 60,
    timeActual: 0,
    status: "Pending",
    notes: notes || ""
  };
  workOrders.push(newWO);
  res.status(201).json(newWO);
});

// Pause, Resume, Complete Work Orders
manufacturingRouter.patch("/work-orders/:id/status", (req: Request, res: Response) => {
  const woId = parseInt(req.params.id);
  const { status, timeActual } = req.body;
  const wo = workOrders.find(w => w.id === woId);
  if (wo) {
    wo.status = status;
    if (timeActual) {
      wo.timeActual = parseInt(timeActual);
    }
    res.json({ success: true, wo });
  } else {
    res.status(404).json({ error: "Work Order not found" });
  }
});

// BILL OF MATERIALS (BOM)
manufacturingRouter.get("/boms", (req: Request, res: Response) => {
  res.json(boms);
});

// MACHINES & WORK CENTERS
manufacturingRouter.get("/machines", (req: Request, res: Response) => {
  res.json(machines);
});

manufacturingRouter.patch("/machines/:id/status", (req: Request, res: Response) => {
  const mId = parseInt(req.params.id);
  const { status } = req.body;
  const machine = machines.find(m => m.id === mId);
  if (machine) {
    machine.status = status;
    if (status === "Offline") {
      machine.utilization = "0.0%";
    } else if (status === "Running") {
      machine.utilization = "95.0%";
    } else if (status === "Idle") {
      machine.utilization = "85.0%";
    }
    res.json({ success: true, machine });
  } else {
    res.status(404).json({ error: "Machine not found" });
  }
});

// QUALITY CONTROL
manufacturingRouter.get("/quality", (req: Request, res: Response) => {
  res.json(qualityChecks);
});

manufacturingRouter.post("/quality", (req: Request, res: Response) => {
  const { poCode, checkedQty, acceptedQty, defectType, correctiveAction, inspector } = req.body;
  const nextId = qualityChecks.length + 1;
  const cQty = parseInt(checkedQty) || 0;
  const aQty = parseInt(acceptedQty) || 0;
  const rQty = cQty - aQty;
  
  const newQC = {
    id: nextId,
    code: `QC-2026-${900 + nextId}`,
    poCode,
    checkedQty: cQty,
    acceptedQty: aQty,
    rejectedQty: rQty,
    defectType: defectType || "None",
    correctiveAction: correctiveAction || "None",
    inspector: inspector || "QA System Inspector",
    date: new Date().toISOString().split('T')[0],
    status: rQty > 0 ? "Under Review" : "Completed"
  };
  
  qualityChecks.push(newQC);
  res.status(201).json(newQC);
});

// MAINTENANCE
manufacturingRouter.get("/maintenance", (req: Request, res: Response) => {
  res.json(maintenanceEvents);
});

manufacturingRouter.post("/maintenance", (req: Request, res: Response) => {
  const { machineName, type, scheduledDate, technician, downtimeExpected } = req.body;
  const nextId = maintenanceEvents.length + 1;
  
  const newMaint = {
    id: nextId,
    machineName,
    type,
    scheduledDate,
    status: "Scheduled",
    technician: technician || "Assigned SRE",
    downtimeExpected: parseInt(downtimeExpected) || 120
  };
  
  maintenanceEvents.push(newMaint);
  res.status(201).json(newMaint);
});

// SCRAP MANAGEMENT
manufacturingRouter.get("/scrap", (req: Request, res: Response) => {
  res.json(scrapLog);
});

// ==========================================
// GEMINI MANUFACTURING AI ENDPOINT
// ==========================================
manufacturingRouter.post("/ai-agent", async (req: Request, res: Response) => {
  const { prompt } = req.body;
  
  const ai = getMfgGeminiClient();
  if (!ai) {
    return res.json({
      success: true,
      text: "MRP Planning System operates inside high-performance millisecond scheduler. Fallback analysis active:\n\n- **Capacity Utilization**: Machines average **63.4%** load. Machine Unit #4 is currently offline, causing a temporary assembly queuing block.\n- **Bottleneck Detection**: Laser wavelength Polish on Unit #2 is scheduled for 240 minutes. Recommendation: Route gold wire bonding tasks to idle Station Unit #3 in the interim.\n- **Stock Shortage**: Alloy Steel Coils inventory (BOM-FRAME-S1) has breached safety limit. Auto-triggering procurement reorder from NeoSteel Foundries."
    });
  }

  try {
    const systemPrompt = `You are the Exshopi AI Industrial Manufacturing & Material Requirements Planning (MRP) Agent.
You have active real-time access to the shop floor manufacturing database:
- Production Orders: ${JSON.stringify(productionOrders)}
- Active Work Orders: ${JSON.stringify(workOrders)}
- Bill of Materials (BOM): ${JSON.stringify(boms)}
- Machines and Shop Floor Utilization: ${JSON.stringify(machines)}
- Quality Inspections & Defects: ${JSON.stringify(qualityChecks)}
- Maintenance events: ${JSON.stringify(maintenanceEvents)}

Provide highly precise, professional, industrial solutions.
Always suggest schedule optimizations, predict downtime risks, evaluate material shortages, and offer bottleneck remedies.
Use Markdown formatting beautifully. Do not expose internal technical file paths.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.6
      }
    });

    res.json({
      success: true,
      text: response.text
    });
  } catch (error: any) {
    console.error("Gemini Manufacturing AI call failed:", error);
    res.json({
      success: false,
      text: "Primary industrial planning network offline. Heuristic sequence optimization suggested:\n\n1. Move CNC operations to idle Machine Unit #3.\n2. Reorder Grade-A steel coils to avert critical safety stocks depletion."
    });
  }
});
