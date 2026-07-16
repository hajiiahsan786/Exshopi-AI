import express, { Request, Response } from "express";
import { MarketplaceRepository } from "../services/marketplaceRepository";
import { MarketplaceService, retryQueue } from "../services/marketplaceService";

export const marketplaceRouter = express.Router();

// -------------------------------------------------------------
// RBAC MIDDLEWARE SIMULATOR
// -------------------------------------------------------------
function checkMarketplacePermission(permission: string) {
  return (req: Request, res: Response, next: express.NextFunction) => {
    const userRole = req.headers["x-user-role"] || "Enterprise Admin";
    console.log(`[Marketplace RBAC] Verifying role '${userRole}' matches permission '${permission}'`);

    // Admins and Architects bypass all rules
    if (userRole === "Enterprise Admin" || userRole === "Admin" || userRole === "Principal AI Systems Architect") {
      return next();
    }

    // Role mapping permissions
    const permissionsMap: Record<string, string[]> = {
      "AI CEO": ["marketplace.admin", "marketplace.connect", "marketplace.sync", "marketplace.orders", "marketplace.products", "marketplace.inventory"],
      "AI Sales Manager": ["marketplace.orders", "marketplace.products", "marketplace.sync"],
      "AI Inventory Manager": ["marketplace.inventory", "marketplace.products", "marketplace.sync"],
      "AI Customer Support Manager": ["marketplace.orders"],
      "AI Marketing Manager": ["marketplace.products", "marketplace.sync"]
    };

    const granted = permissionsMap[userRole as string] || [];
    if (granted.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied: Missing required permission '${permission}' for role '${userRole}'`,
      errors: { permission }
    });
  };
}

// =============================================================
// API ROUTES
// =============================================================

// 1. Providers CRUD
marketplaceRouter.get("/providers", (req: Request, res: Response) => {
  try {
    const providers = MarketplaceRepository.listProviders();
    res.json({ success: true, data: providers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Accounts CRUD & Connect/Disconnect
marketplaceRouter.get("/accounts", (req: Request, res: Response) => {
  try {
    const accounts = MarketplaceRepository.listAccounts();
    res.json({ success: true, data: accounts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

marketplaceRouter.post("/connect", checkMarketplacePermission("marketplace.connect"), (req: Request, res: Response) => {
  try {
    const { providerCode, accountName, storeName, storeUrl, credentials, employeeId } = req.body;
    if (!providerCode || !accountName || !storeName || !storeUrl) {
      return res.status(400).json({
        success: false,
        message: "Missing connection attributes: 'providerCode', 'accountName', 'storeName', and 'storeUrl' are required."
      });
    }

    MarketplaceService.connectAccount({
      providerCode,
      accountName,
      storeName,
      storeUrl,
      credentials: credentials || [],
      employeeId: employeeId ? parseInt(employeeId) : 1
    })
      .then(result => {
        res.status(201).json({
          success: true,
          message: "Marketplace successfully integrated and active.",
          data: result
        });
      })
      .catch(err => {
        res.status(500).json({ success: false, message: err.message });
      });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

marketplaceRouter.post("/disconnect", checkMarketplacePermission("marketplace.admin"), (req: Request, res: Response) => {
  try {
    const { accountId, employeeId } = req.body;
    if (!accountId) {
      return res.status(400).json({ success: false, message: "Required field 'accountId' is missing." });
    }

    MarketplaceService.disconnectAccount(parseInt(accountId), employeeId ? parseInt(employeeId) : 1)
      .then(success => {
        if (!success) {
          return res.status(404).json({ success: false, message: `Account ID #${accountId} not found.` });
        }
        res.json({ success: true, message: "Marketplace account disconnected and deactivated successfully." });
      })
      .catch(err => {
        res.status(500).json({ success: false, message: err.message });
      });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Stores CRUD
marketplaceRouter.get("/stores", (req: Request, res: Response) => {
  try {
    const accountId = req.query.accountId ? parseInt(req.query.accountId as string) : undefined;
    const stores = MarketplaceRepository.listStores(accountId);
    res.json({ success: true, data: stores });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Products CRUD & Search
marketplaceRouter.get("/products", checkMarketplacePermission("marketplace.products"), (req: Request, res: Response) => {
  try {
    const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
    const sku = req.query.sku as string | undefined;
    const search = req.query.search as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const result = MarketplaceRepository.listProducts({ storeId, sku, search }, page, limit);
    res.json({ success: true, data: result.items, pagination: { total: result.total, page, limit } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Orders CRUD
marketplaceRouter.get("/orders", checkMarketplacePermission("marketplace.orders"), (req: Request, res: Response) => {
  try {
    const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
    const status = req.query.status as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const result = MarketplaceRepository.listOrders({ storeId, status }, page, limit);
    res.json({ success: true, data: result.items, pagination: { total: result.total, page, limit } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Manual Synchronizations
marketplaceRouter.post("/stores/:id/sync/products", checkMarketplacePermission("marketplace.sync"), (req: Request, res: Response) => {
  try {
    const storeId = parseInt(req.params.id);
    const { conflictPolicy } = req.body;

    MarketplaceService.syncProducts(storeId, conflictPolicy)
      .then(job => {
        res.json({ success: true, message: "Product synchronization completed.", data: job });
      })
      .catch(err => {
        res.status(500).json({ success: false, message: err.message });
      });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

marketplaceRouter.post("/stores/:id/sync/inventory", checkMarketplacePermission("marketplace.inventory"), (req: Request, res: Response) => {
  try {
    const storeId = parseInt(req.params.id);
    const { sku, quantity } = req.body;
    if (!sku || quantity === undefined) {
      return res.status(400).json({ success: false, message: "Missing required attributes 'sku' and 'quantity'." });
    }

    MarketplaceService.syncInventory(storeId, sku, parseInt(quantity))
      .then(inv => {
        res.json({ success: true, message: "Inventory successfully updated.", data: inv });
      })
      .catch(err => {
        res.status(500).json({ success: false, message: err.message });
      });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

marketplaceRouter.post("/stores/:id/sync/orders", checkMarketplacePermission("marketplace.orders"), (req: Request, res: Response) => {
  try {
    const storeId = parseInt(req.params.id);

    MarketplaceService.importOrders(storeId)
      .then(job => {
        res.json({ success: true, message: "Orders import sync processed.", data: job });
      })
      .catch(err => {
        res.status(500).json({ success: false, message: err.message });
      });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

marketplaceRouter.post("/stores/:id/sync/shipments", checkMarketplacePermission("marketplace.orders"), (req: Request, res: Response) => {
  try {
    const storeId = parseInt(req.params.id);
    const { orderId, trackingNumber, carrier } = req.body;
    if (!orderId || !trackingNumber || !carrier) {
      return res.status(400).json({ success: false, message: "Missing fields 'orderId', 'trackingNumber', or 'carrier'." });
    }

    MarketplaceService.syncShipment(storeId, parseInt(orderId), trackingNumber, carrier)
      .then(shipment => {
        res.json({ success: true, message: "Shipment registered and pushed to channel successfully.", data: shipment });
      })
      .catch(err => {
        res.status(500).json({ success: false, message: err.message });
      });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. View Logs
marketplaceRouter.get("/logs", (req: Request, res: Response) => {
  try {
    const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
    const logs = MarketplaceRepository.listLogs(storeId);
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. Retry Jobs Queue
marketplaceRouter.post("/jobs/retry", checkMarketplacePermission("marketplace.sync"), (req: Request, res: Response) => {
  try {
    MarketplaceService.processRetryQueue()
      .then(count => {
        res.json({ success: true, message: `Retry queue processed. ${count} failed jobs retried successfully.`, activeQueue: retryQueue });
      })
      .catch(err => {
        res.status(500).json({ success: false, message: err.message });
      });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 9. Generic Webhook Receiver Ingress
marketplaceRouter.post("/webhooks/:provider", (req: Request, res: Response) => {
  try {
    const providerCode = req.params.provider;
    const { storeId, topic, payload } = req.body;

    if (!storeId || !topic || !payload) {
      return res.status(400).json({
        success: false,
        message: "Webhook rejected: Required attributes 'storeId', 'topic', and 'payload' must reside in payload."
      });
    }

    MarketplaceService.processWebhook(parseInt(storeId), topic, payload)
      .then(result => {
        if (result.success) {
          res.json({ success: true, message: "Webhook accepted and processed successfully.", eventId: result.eventId });
        } else {
          res.status(422).json({ success: false, message: "Webhook processed but marked failed.", eventId: result.eventId });
        }
      })
      .catch(err => {
        res.status(500).json({ success: false, message: err.message });
      });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
