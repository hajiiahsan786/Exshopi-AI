import express, { Request, Response } from "express";
import { LogisticsService } from "../services/logisticsService";
import {
  shipments,
  shipmentTrackings,
  deliveryRoutes,
  deliveryStops,
  inventoryTransits,
  returnShipments,
  logisticsAuditLogs,
  carriers,
  carrierServices,
  fleets,
  vehicles,
  drivers,
  driverAssignments,
  shipmentPackages,
  shipmentItems,
  shipmentLabels,
  routeOptimizationJobs,
  pickupRequests,
  deliveryConfirmations,
  proofOfDeliveries,
  reverseLogistics,
  customsDeclarations,
  freightOrders,
  freightCosts,
  transportationOrders,
  shipmentExceptions
} from "../db";

export const logisticsRouter = express.Router();

// RBAC Helper
function checkLogisticsPermission(permission: string) {
  return (req: Request, res: Response, next: express.NextFunction) => {
    const userRole = req.headers["x-user-role"] || "Enterprise Admin";
    if (userRole === "Enterprise Admin" || userRole === "Admin" || userRole === "AI Inventory Manager" || userRole === "AI Procurement Manager") {
      return next();
    }

    const permitted: Record<string, string[]> = {
      "logistics.read": ["AI Support Agent", "Department Manager"],
      "logistics.create": ["AI Procurement Manager", "Logistics Specialist"],
      "logistics.update": ["AI Inventory Manager", "Warehouse Associate"],
      "logistics.dispatch": ["AI Inventory Manager", "Fleet Dispatcher"],
      "logistics.shipments": ["AI Sales Manager"],
      "logistics.tracking": ["Customer Support Lead", "AI Support Agent"],
      "logistics.admin": []
    };

    const rolesWithPermission = permitted[permission] || [];
    if (rolesWithPermission.includes(userRole as string)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied: Missing required permission '${permission}' for role '${userRole}'`
    });
  };
}

// 1. Create Shipment
logisticsRouter.post("/shipments", checkLogisticsPermission("logistics.create"), (req: Request, res: Response) => {
  try {
    const { orderId, warehouseId, carrierServiceId, originAddress, destinationAddress, items, packageDetails } = req.body;
    if (!warehouseId || !carrierServiceId || !originAddress || !destinationAddress || !items || !packageDetails) {
      return res.status(400).json({ success: false, message: "Required fields are missing." });
    }

    const sh = LogisticsService.createShipment({
      orderId: orderId ? parseInt(orderId) : undefined,
      warehouseId: parseInt(warehouseId),
      carrierServiceId: parseInt(carrierServiceId),
      originAddress,
      destinationAddress,
      items,
      packageDetails
    });

    return res.status(201).json({ success: true, data: sh });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 2. Query/Search Shipments with pagination
logisticsRouter.get("/shipments", checkLogisticsPermission("logistics.read"), (req: Request, res: Response) => {
  const status = req.query.status as string;
  const carrierServiceId = req.query.carrierServiceId ? parseInt(req.query.carrierServiceId as string) : undefined;

  let list = [...shipments];
  if (status) list = list.filter(s => s.status === status);
  if (carrierServiceId) list = list.filter(s => s.carrierServiceId === carrierServiceId);

  return res.json({ success: true, count: list.length, data: list });
});

// 3. Get Tracking Numbers Details
logisticsRouter.get("/shipments/:id/tracking", checkLogisticsPermission("logistics.tracking"), (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const trackings = shipmentTrackings.filter(t => t.shipmentId === id);
  return res.json({ success: true, data: trackings });
});

// 4. Report Exception holds
logisticsRouter.post("/shipments/:id/exceptions", checkLogisticsPermission("logistics.update"), (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { code, notes } = req.body;
    if (!code || !notes) {
      return res.status(400).json({ success: false, message: "Exception code and detailed notes are required." });
    }

    const exception = LogisticsService.triggerShipmentException(id, code, notes);
    return res.json({ success: true, data: exception });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 5. Initiate Inter-Warehouse Transfer
logisticsRouter.post("/transfers", checkLogisticsPermission("logistics.create"), (req: Request, res: Response) => {
  try {
    const { originWarehouseId, destinationWarehouseId, sku, quantity } = req.body;
    if (!originWarehouseId || !destinationWarehouseId || !sku || !quantity) {
      return res.status(400).json({ success: false, message: "Missing required transfer fields." });
    }

    const transit = LogisticsService.initiateWarehouseTransfer({
      originWarehouseId: parseInt(originWarehouseId),
      destinationWarehouseId: parseInt(destinationWarehouseId),
      sku,
      quantity: parseInt(quantity)
    });

    return res.status(201).json({ success: true, data: transit });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 6. Complete Inter-Warehouse Stock-in
logisticsRouter.post("/transfers/:id/complete", checkLogisticsPermission("logistics.update"), (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const transit = LogisticsService.completeWarehouseTransfer(id);
    return res.json({ success: true, data: transit });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 7. Dispatch Delivery Route
logisticsRouter.post("/routes/:id/dispatch", checkLogisticsPermission("logistics.dispatch"), (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const route = LogisticsService.dispatchDeliveryRoute(id);
    return res.json({ success: true, data: route });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 8. Record Delivery Stop Success & Signatures (POD)
logisticsRouter.post("/stops/:id/deliver", checkLogisticsPermission("logistics.update"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { confirmedBy, signatureBase64 } = req.body;
    if (!confirmedBy || !signatureBase64) {
      return res.status(400).json({ success: false, message: "Recipient name and validation signature are required." });
    }

    const stop = await LogisticsService.recordDeliveryStopSuccess(id, confirmedBy, signatureBase64);
    return res.json({ success: true, data: stop });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 9. Request Return Shipment RMA
logisticsRouter.post("/returns", checkLogisticsPermission("logistics.create"), (req: Request, res: Response) => {
  try {
    const { shipmentId, returnReason } = req.body;
    if (!shipmentId || !returnReason) {
      return res.status(400).json({ success: false, message: "Shipment ID and return reason are required." });
    }

    const rma = LogisticsService.requestReturnShipment(parseInt(shipmentId), returnReason);
    return res.json({ success: true, data: rma });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 10. Reverse Logistics Inspection
logisticsRouter.post("/returns/:id/inspect", checkLogisticsPermission("logistics.update"), (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { disposition, inspectedBy, details } = req.body;
    if (!disposition || !inspectedBy || !details) {
      return res.status(400).json({ success: false, message: "Missing inspection report details." });
    }

    const rev = LogisticsService.processReverseLogisticsInspection({
      returnShipmentId: id,
      disposition,
      inspectedBy,
      details
    });

    return res.json({ success: true, data: rev });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 11. Run Dispatch Optimizer
logisticsRouter.post("/routes/optimize", checkLogisticsPermission("logistics.dispatch"), (req: Request, res: Response) => {
  try {
    const { fleetId } = req.body;
    if (!fleetId) return res.status(400).json({ success: false, message: "Fleet ID is required." });

    const job = LogisticsService.triggerRouteOptimization(parseInt(fleetId));
    return res.json({ success: true, data: job });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 12. Compare Rates
logisticsRouter.get("/carriers/rates", checkLogisticsPermission("logistics.read"), (req: Request, res: Response) => {
  try {
    const weight = parseFloat(req.query.weight as string || "10.0");
    const origin = req.query.origin as string || "98101";
    const dest = req.query.dest as string || "90001";

    const rates = LogisticsService.compareCarrierRates(weight, origin, dest);
    return res.json({ success: true, data: rates });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 13. High-level Logistics & Supply Chain Dashboard Summary
logisticsRouter.get("/dashboard", checkLogisticsPermission("logistics.read"), (req: Request, res: Response) => {
  try {
    const awaitingShipment = shipments.filter(s => s.status === "pending").length;
    const inProgress = shipments.filter(s => s.status === "in_transit").length;
    const completed = shipments.filter(s => s.status === "delivered").length;
    const failed = shipments.filter(s => s.status === "exception").length;
    
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === "in_transit" || v.status === "available").length;
    const onlineDrivers = drivers.filter(d => d.status === "available" || d.status === "on_route").length;
    const pendingReturns = returnShipments.filter(r => r.status === "requested" || r.status === "inspected").length;

    res.json({
      success: true,
      data: {
        metrics: {
          todayShipments: shipments.length,
          awaitingShipment,
          inProgress,
          completed,
          failed,
          totalVehicles,
          activeVehicles,
          onlineDrivers,
          pendingReturns,
          fleetUtilization: totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0
        },
        recentAuditLogs: logisticsAuditLogs.slice(-15).reverse()
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

logisticsRouter.get("/carriers", checkLogisticsPermission("logistics.read"), (req: Request, res: Response) => {
  res.json({ success: true, data: carriers });
});

logisticsRouter.get("/carrier-services", checkLogisticsPermission("logistics.read"), (req: Request, res: Response) => {
  res.json({ success: true, data: carrierServices });
});

logisticsRouter.get("/fleets", checkLogisticsPermission("logistics.read"), (req: Request, res: Response) => {
  res.json({ success: true, data: fleets });
});

logisticsRouter.get("/vehicles", checkLogisticsPermission("logistics.read"), (req: Request, res: Response) => {
  res.json({ success: true, data: vehicles });
});

logisticsRouter.get("/drivers", checkLogisticsPermission("logistics.read"), (req: Request, res: Response) => {
  res.json({ success: true, data: drivers });
});

logisticsRouter.get("/routes", checkLogisticsPermission("logistics.read"), (req: Request, res: Response) => {
  res.json({ success: true, data: deliveryRoutes });
});

logisticsRouter.get("/stops", checkLogisticsPermission("logistics.read"), (req: Request, res: Response) => {
  res.json({ success: true, data: deliveryStops });
});

logisticsRouter.get("/returns", checkLogisticsPermission("logistics.read"), (req: Request, res: Response) => {
  res.json({ success: true, data: returnShipments });
});

logisticsRouter.get("/transfers", checkLogisticsPermission("logistics.read"), (req: Request, res: Response) => {
  res.json({ success: true, data: inventoryTransits });
});

logisticsRouter.get("/audit-logs", checkLogisticsPermission("logistics.read"), (req: Request, res: Response) => {
  res.json({ success: true, data: logisticsAuditLogs });
});

logisticsRouter.get("/exceptions", checkLogisticsPermission("logistics.read"), (req: Request, res: Response) => {
  res.json({ success: true, data: shipmentExceptions });
});

logisticsRouter.get("/pickup-requests", checkLogisticsPermission("logistics.read"), (req: Request, res: Response) => {
  res.json({ success: true, data: pickupRequests });
});

logisticsRouter.get("/freight-orders", checkLogisticsPermission("logistics.read"), (req: Request, res: Response) => {
  res.json({ success: true, data: freightOrders });
});

logisticsRouter.get("/customs-declarations", checkLogisticsPermission("logistics.read"), (req: Request, res: Response) => {
  res.json({ success: true, data: customsDeclarations });
});

logisticsRouter.post("/drivers", checkLogisticsPermission("logistics.create"), (req: Request, res: Response) => {
  const { name, phone, licenseNumber, status } = req.body;
  if (!name || !licenseNumber) {
    return res.status(400).json({ success: false, message: "Driver name and license number are required." });
  }
  const newDriver = {
    id: drivers.length + 1,
    name,
    phone: phone || "",
    licenseNumber,
    status: status || "active",
    userId: 1,
    createdAt: new Date().toISOString()
  };
  drivers.push(newDriver as any);
  res.status(201).json({ success: true, data: newDriver });
});

logisticsRouter.post("/vehicles", checkLogisticsPermission("logistics.create"), (req: Request, res: Response) => {
  const { name, plateNumber, type, capacityValue, status } = req.body;
  if (!name || !plateNumber || !type) {
    return res.status(400).json({ success: false, message: "Vehicle name, plate number, and type are required." });
  }
  const newVehicle = {
    id: vehicles.length + 1,
    name,
    plateNumber,
    type,
    capacityValue: parseFloat(capacityValue || "1000"),
    capacityUnit: "lbs",
    status: status || "active",
    createdAt: new Date().toISOString()
  };
  vehicles.push(newVehicle as any);
  res.status(201).json({ success: true, data: newVehicle });
});
