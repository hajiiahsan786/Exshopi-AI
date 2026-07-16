import express, { Request, Response } from "express";
import { PaymentService } from "../services/paymentService";
import {
  paymentIntents,
  paymentTransactions,
  paymentAuthorizations,
  paymentCaptures,
  paymentRefunds,
  settlementBatches,
  paymentReceipts,
  paymentAuditLogs,
  logPaymentAudit
} from "../db";

export const paymentsRouter = express.Router();

// RBAC Helper
function checkPaymentPermission(permission: string) {
  return (req: Request, res: Response, next: express.NextFunction) => {
    const userRole = req.headers["x-user-role"] || "Enterprise Admin";
    if (userRole === "Enterprise Admin" || userRole === "Admin" || userRole === "AI Finance Manager") {
      return next();
    }

    const permitted: Record<string, string[]> = {
      "payments.create": ["AI Sales Manager", "Sales Representative"],
      "payments.capture": ["AI Finance Manager", "Finance Specialist"],
      "payments.refund": ["AI Finance Manager", "Customer Support Lead"],
      "payments.settlement": ["AI Finance Manager"],
      "payments.admin": []
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

// 1. Create Payment Intent
paymentsRouter.post("/intents", checkPaymentPermission("payments.create"), async (req: Request, res: Response) => {
  try {
    const { amount, currency, storeId, orderId, paymentMethodId, idempotencyKey } = req.body;
    if (!amount || !currency) {
      return res.status(400).json({ success: false, message: "Missing required fields 'amount' and 'currency'." });
    }

    const intent = await PaymentService.createPaymentIntent({
      amount: parseFloat(amount),
      currency,
      storeId: storeId ? parseInt(storeId) : undefined,
      orderId: orderId ? parseInt(orderId) : undefined,
      paymentMethodId: paymentMethodId ? parseInt(paymentMethodId) : undefined,
      idempotencyKey
    });

    return res.status(201).json({ success: true, data: intent });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 2. Authorize Payment Intent
paymentsRouter.post("/intents/:id/authorize", checkPaymentPermission("payments.create"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { provider } = req.body;
    const auth = await PaymentService.authorizeIntent(id, provider);
    return res.json({ success: true, data: auth });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 3. Capture Authorization
paymentsRouter.post("/authorizations/:id/capture", checkPaymentPermission("payments.capture"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { provider } = req.body;
    const cap = await PaymentService.captureAuthorization(id, provider);
    return res.json({ success: true, data: cap });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 4. Void Authorization
paymentsRouter.post("/authorizations/:id/void", checkPaymentPermission("payments.capture"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { provider } = req.body;
    const auth = await PaymentService.voidAuthorization(id, provider);
    return res.json({ success: true, data: auth });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 5. Refund Transaction
paymentsRouter.post("/transactions/:id/refund", checkPaymentPermission("payments.refund"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { amount, reason, provider } = req.body;
    if (!amount || !reason) {
      return res.status(400).json({ success: false, message: "Missing required refund parameters 'amount' and 'reason'." });
    }

    const refund = await PaymentService.refundTransaction(id, parseFloat(amount), reason, provider);
    return res.json({ success: true, data: refund });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 6. Trigger Subscription/Recurring Payments
paymentsRouter.post("/subscriptions/trigger-recurring", checkPaymentPermission("payments.create"), async (req: Request, res: Response) => {
  try {
    const { accountId, amount, subscriptionId } = req.body;
    if (!accountId || !amount || !subscriptionId) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const intent = await PaymentService.triggerRecurringBilling(parseInt(accountId), parseFloat(amount), parseInt(subscriptionId));
    return res.json({ success: true, data: intent });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 7. End of Day Reconciliation Settlement
paymentsRouter.post("/reconciliation/trigger", checkPaymentPermission("payments.settlement"), async (req: Request, res: Response) => {
  try {
    const batch = await PaymentService.runEndOfDayReconciliation();
    return res.json({ success: true, data: batch });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 8. Stripe / Alternate Ingress Webhooks
paymentsRouter.post("/webhooks/:provider", async (req: Request, res: Response) => {
  try {
    const provider = req.params.provider;
    const signature = req.headers["stripe-signature"] as string || "mock_signature_key";
    const payloadStr = JSON.stringify(req.body);

    const event = await PaymentService.processGatewayWebhook(provider, payloadStr, signature);
    return res.json({ success: true, data: event });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 9. Query & Filter Transactions
paymentsRouter.get("/transactions", checkPaymentPermission("payments.create"), (req: Request, res: Response) => {
  try {
    const currency = req.query.currency as string;
    const status = req.query.status as string;

    let list = [...paymentTransactions];
    if (currency) list = list.filter(t => t.currency === currency);
    if (status) list = list.filter(t => t.status === status);

    return res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 10. Get Payment Intent
paymentsRouter.get("/intents/:id", checkPaymentPermission("payments.create"), (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const intent = paymentIntents.find(i => i.id === id);
  if (!intent) return res.status(404).json({ success: false, message: "Payment intent not found." });
  return res.json({ success: true, data: intent });
});

// 11. Retrieve Invoice / Receipt for transaction
paymentsRouter.get("/receipts/:txId", checkPaymentPermission("payments.create"), (req: Request, res: Response) => {
  const txId = parseInt(req.params.txId);
  const receipt = paymentReceipts.find(r => r.transactionId === txId);
  if (!receipt) return res.status(404).json({ success: false, message: "Receipt not found for this transaction." });
  return res.json({ success: true, data: receipt });
});
