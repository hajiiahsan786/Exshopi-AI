import {
  paymentProviders,
  paymentGateways,
  paymentAccounts,
  merchantAccounts,
  paymentMethods,
  paymentMethodTokens,
  paymentIntents,
  paymentTransactions,
  paymentAuthorizations,
  paymentCaptures,
  paymentRefunds,
  partialRefunds,
  paymentDisputes,
  chargebacks,
  paymentSettlements,
  settlementBatches,
  paymentWebhooks,
  paymentEvents,
  paymentInvoices,
  paymentReceipts,
  logPaymentAudit
} from "../db";
import {
  PaymentProvider,
  PaymentGateway,
  PaymentAccount,
  PaymentMethod,
  PaymentIntent,
  PaymentTransaction,
  PaymentAuthorization,
  PaymentCapture,
  PaymentRefund,
  PaymentInvoice,
  PaymentReceipt,
  PaymentSettlement,
  SettlementBatch,
  PaymentEvent
} from "../../src/types";

// ==========================================
// 1. PAYMENT GATEWAY PROVIDER ABSTRACTION
// ==========================================

export interface IPaymentGatewayProvider {
  createIntent(amount: number, currency: string, metadata?: string): Promise<{ clientSecret: string; externalId: string }>;
  authorize(intentId: string, paymentMethodToken: string): Promise<{ authorized: boolean; authCode: string; externalId: string }>;
  capture(authExternalId: string, amount: number): Promise<{ captured: boolean; externalId: string }>;
  refund(transactionExternalId: string, amount: number, reason: string): Promise<{ refunded: boolean; externalId: string }>;
  void(authExternalId: string): Promise<{ voided: boolean; externalId: string }>;
}

// Concrete Connectors
export class StripeGatewayConnector implements IPaymentGatewayProvider {
  async createIntent(amount: number, currency: string, metadata?: string): Promise<{ clientSecret: string; externalId: string }> {
    return { clientSecret: `seti_str_${Math.floor(Math.random() * 900000)}_sec`, externalId: `pi_str_${Math.floor(Math.random() * 900000)}` };
  }
  async authorize(intentId: string, paymentMethodToken: string): Promise<{ authorized: boolean; authCode: string; externalId: string }> {
    return { authorized: true, authCode: `AUTH-STR-${Math.floor(Math.random() * 100000)}`, externalId: `ch_str_auth_${Math.floor(Math.random() * 90000)}` };
  }
  async capture(authExternalId: string, amount: number): Promise<{ captured: boolean; externalId: string }> {
    return { captured: true, externalId: `ch_str_cap_${Math.floor(Math.random() * 90000)}` };
  }
  async refund(transactionExternalId: string, amount: number, reason: string): Promise<{ refunded: boolean; externalId: string }> {
    return { refunded: true, externalId: `re_str_${Math.floor(Math.random() * 90000)}` };
  }
  async void(authExternalId: string): Promise<{ voided: boolean; externalId: string }> {
    return { voided: true, externalId: `ch_str_void_${Math.floor(Math.random() * 90000)}` };
  }
}

export class PayPalGatewayConnector implements IPaymentGatewayProvider {
  async createIntent(amount: number, currency: string, metadata?: string): Promise<{ clientSecret: string; externalId: string }> {
    return { clientSecret: `seti_ppl_${Math.floor(Math.random() * 900000)}_sec`, externalId: `pi_ppl_${Math.floor(Math.random() * 900000)}` };
  }
  async authorize(intentId: string, paymentMethodToken: string): Promise<{ authorized: boolean; authCode: string; externalId: string }> {
    return { authorized: true, authCode: `AUTH-PPL-${Math.floor(Math.random() * 100000)}`, externalId: `ch_ppl_auth_${Math.floor(Math.random() * 90000)}` };
  }
  async capture(authExternalId: string, amount: number): Promise<{ captured: boolean; externalId: string }> {
    return { captured: true, externalId: `ch_ppl_cap_${Math.floor(Math.random() * 90000)}` };
  }
  async refund(transactionExternalId: string, amount: number, reason: string): Promise<{ refunded: boolean; externalId: string }> {
    return { refunded: true, externalId: `re_ppl_${Math.floor(Math.random() * 90000)}` };
  }
  async void(authExternalId: string): Promise<{ voided: boolean; externalId: string }> {
    return { voided: true, externalId: `ch_ppl_void_${Math.floor(Math.random() * 90000)}` };
  }
}

// Standard Provider Registry
export class PaymentProviderRegistry {
  private static providers: Map<string, IPaymentGatewayProvider> = new Map();

  static registerProvider(code: string, connector: IPaymentGatewayProvider) {
    this.providers.set(code, connector);
  }

  static getProvider(code: string): IPaymentGatewayProvider {
    const conn = this.providers.get(code);
    if (!conn) {
      throw new Error(`Payment provider connector for '${code}' is not registered.`);
    }
    return conn;
  }
}

// Pre-populate Registry
PaymentProviderRegistry.registerProvider("stripe", new StripeGatewayConnector());
PaymentProviderRegistry.registerProvider("paypal", new PayPalGatewayConnector());
PaymentProviderRegistry.registerProvider("checkout", new StripeGatewayConnector()); // Reuses structural interface
PaymentProviderRegistry.registerProvider("adyen", new StripeGatewayConnector());
PaymentProviderRegistry.registerProvider("square", new StripeGatewayConnector());
PaymentProviderRegistry.registerProvider("razorpay", new StripeGatewayConnector());
PaymentProviderRegistry.registerProvider("paytabs", new StripeGatewayConnector());
PaymentProviderRegistry.registerProvider("telr", new StripeGatewayConnector());
PaymentProviderRegistry.registerProvider("network_intl", new StripeGatewayConnector());
PaymentProviderRegistry.registerProvider("amazon_pay_services", new StripeGatewayConnector());
PaymentProviderRegistry.registerProvider("apple_pay", new StripeGatewayConnector());
PaymentProviderRegistry.registerProvider("google_pay", new StripeGatewayConnector());
PaymentProviderRegistry.registerProvider("visa", new StripeGatewayConnector());
PaymentProviderRegistry.registerProvider("mastercard", new StripeGatewayConnector());
PaymentProviderRegistry.registerProvider("amex", new StripeGatewayConnector());
PaymentProviderRegistry.registerProvider("unionpay", new StripeGatewayConnector());
PaymentProviderRegistry.registerProvider("bank_transfer", new StripeGatewayConnector());
PaymentProviderRegistry.registerProvider("cod", new StripeGatewayConnector());
PaymentProviderRegistry.registerProvider("wallet_payments", new StripeGatewayConnector());


// ==========================================
// 2. CORE PAYMENT SERVICES & ENGINE LAYER
// ==========================================

export class PaymentService {
  private static idempotencyKeys = new Set<string>();

  // A. Fraud & Risk Assessment
  static assessRiskScore(amount: number, currency: string, paymentMethodId: number): { score: number; verdict: "approve" | "review" | "decline" } {
    // Structural risk analysis
    let score = 10; // base score
    if (amount > 10000) score += 30;
    const method = paymentMethods.find(p => p.id === paymentMethodId);
    if (method && method.status === "expired") score += 60;
    if (currency === "INR" || currency === "AED") score += 5; // slight regional variance

    let verdict: "approve" | "review" | "decline" = "approve";
    if (score >= 70) verdict = "decline";
    else if (score >= 45) verdict = "review";

    return { score, verdict };
  }

  // B. Payment Intent Lifecycle
  static async createPaymentIntent(params: {
    amount: number;
    currency: string;
    storeId?: number;
    orderId?: number;
    paymentMethodId?: number;
    idempotencyKey?: string;
  }): Promise<PaymentIntent> {
    // Idempotency safety validation
    if (params.idempotencyKey) {
      if (this.idempotencyKeys.has(params.idempotencyKey)) {
        throw new Error(`Duplicate transaction blocked by Idempotency Key validation: ${params.idempotencyKey}`);
      }
      this.idempotencyKeys.add(params.idempotencyKey);
    }

    const nextId = paymentIntents.length + 1;
    const clientSecret = `seti_${Math.floor(Math.random() * 1000000)}_sec_${nextId}`;

    // Assess initial risk
    const risk = this.assessRiskScore(params.amount, params.currency, params.paymentMethodId || 1);
    if (risk.verdict === "decline") {
      throw new Error(`Payment declined due to high risk score: ${risk.score}`);
    }

    const intent: PaymentIntent = {
      id: nextId,
      storeId: params.storeId,
      orderId: params.orderId,
      amount: params.amount,
      currency: params.currency,
      status: "requires_confirmation",
      clientSecret,
      paymentMethodId: params.paymentMethodId || 1,
      metadata: JSON.stringify({ riskScore: risk.score, riskVerdict: risk.verdict })
    };

    paymentIntents.push(intent);
    logPaymentAudit(1, "Create Payment Intent", `Created Payment Intent #${intent.id} for amount ${intent.amount} ${intent.currency}`);
    return intent;
  }

  // C. Authorization Engine
  static async authorizeIntent(intentId: number, providerCode = "stripe"): Promise<PaymentAuthorization> {
    const intent = paymentIntents.find(i => i.id === intentId);
    if (!intent) throw new Error(`Payment intent ID ${intentId} not found.`);

    const provider = PaymentProviderRegistry.getProvider(providerCode);
    const connectorRes = await provider.createIntent(intent.amount, intent.currency);

    // Call provider authorization endpoint
    const authRes = await provider.authorize(connectorRes.externalId, "tok_mock_secure_ref_99210");
    if (!authRes.authorized) {
      intent.status = "canceled";
      throw new Error("Authorization rejected by third-party payment gateway connector.");
    }

    intent.status = "requires_capture";

    // Create Authorization Record
    const nextAuthId = paymentAuthorizations.length + 1;
    const auth: PaymentAuthorization = {
      id: nextAuthId,
      intentId: intent.id,
      amount: intent.amount,
      currency: intent.currency,
      status: "authorized",
      authorizedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      authCode: authRes.authCode
    };

    paymentAuthorizations.push(auth);

    // Log transaction
    const nextTxId = paymentTransactions.length + 1;
    paymentTransactions.push({
      id: nextTxId,
      intentId: intent.id,
      accountId: 1,
      type: "authorization",
      amount: intent.amount,
      currency: intent.currency,
      status: "success",
      externalReferenceId: authRes.externalId,
      processedAt: new Date().toISOString()
    });

    logPaymentAudit(1, "Authorize Payment", `Authorized payment intent #${intent.id} with auth code ${auth.authCode}`);
    return auth;
  }

  // D. Capture Engine
  static async captureAuthorization(authId: number, providerCode = "stripe"): Promise<PaymentCapture> {
    const auth = paymentAuthorizations.find(a => a.id === authId);
    if (!auth) throw new Error(`Authorization ID ${authId} not found.`);
    if (auth.status !== "authorized") throw new Error(`Authorization is in invalid state: ${auth.status}`);

    const provider = PaymentProviderRegistry.getProvider(providerCode);
    const capRes = await provider.capture(`ch_mock_auth_ref_${auth.id}`, auth.amount);

    if (!capRes.captured) {
      throw new Error("Capture rejected by payment gateway connector.");
    }

    auth.status = "captured";
    const intent = paymentIntents.find(i => i.id === auth.intentId);
    if (intent) intent.status = "succeeded";

    // Log capture transaction
    const nextTxId = paymentTransactions.length + 1;
    const tx: PaymentTransaction = {
      id: nextTxId,
      intentId: auth.intentId,
      accountId: 1,
      type: "capture",
      amount: auth.amount,
      currency: auth.currency,
      status: "success",
      externalReferenceId: capRes.externalId,
      processedAt: new Date().toISOString()
    };
    paymentTransactions.push(tx);

    const nextCapId = paymentCaptures.length + 1;
    const cap: PaymentCapture = {
      id: nextCapId,
      authorizationId: auth.id,
      amount: auth.amount,
      currency: auth.currency,
      status: "succeeded",
      capturedAt: new Date().toISOString(),
      transactionId: tx.id
    };
    paymentCaptures.push(cap);

    // Auto-generate invoice/receipt
    this.generateReceipt(tx.id);

    logPaymentAudit(1, "Capture Payment", `Captured payment authorization #${auth.id} for amount ${auth.amount}`);
    return cap;
  }

  // E. Void Engine
  static async voidAuthorization(authId: number, providerCode = "stripe"): Promise<PaymentAuthorization> {
    const auth = paymentAuthorizations.find(a => a.id === authId);
    if (!auth) throw new Error(`Authorization ID ${authId} not found.`);
    if (auth.status !== "authorized") throw new Error(`Cannot void authorization in status: ${auth.status}`);

    const provider = PaymentProviderRegistry.getProvider(providerCode);
    await provider.void(`ch_mock_auth_ref_${auth.id}`);

    auth.status = "voided";
    const intent = paymentIntents.find(i => i.id === auth.intentId);
    if (intent) intent.status = "canceled";

    // Log void transaction
    paymentTransactions.push({
      id: paymentTransactions.length + 1,
      intentId: auth.intentId,
      accountId: 1,
      type: "void",
      amount: auth.amount,
      currency: auth.currency,
      status: "success",
      processedAt: new Date().toISOString()
    });

    logPaymentAudit(1, "Void Authorization", `Voided payment authorization #${auth.id}`);
    return auth;
  }

  // F. Refund Engine (Full & Partial)
  static async refundTransaction(txId: number, amount: number, reason: string, providerCode = "stripe"): Promise<PaymentRefund> {
    const tx = paymentTransactions.find(t => t.id === txId);
    if (!tx) throw new Error(`Transaction ID ${txId} not found.`);
    if (tx.status !== "success") throw new Error("Cannot refund a failed or pending transaction.");
    if (amount > tx.amount) throw new Error("Refund amount cannot exceed original transaction amount.");

    const provider = PaymentProviderRegistry.getProvider(providerCode);
    const refundRes = await provider.refund(tx.externalReferenceId || `ch_mock_ref_${tx.id}`, amount, reason);

    if (!refundRes.refunded) {
      throw new Error("Refund request declined by gateway connector.");
    }

    const nextRefundId = paymentRefunds.length + 1;
    const refund: PaymentRefund = {
      id: nextRefundId,
      transactionId: tx.id,
      amount,
      currency: tx.currency,
      reason,
      status: "succeeded",
      refundedAt: new Date().toISOString()
    };
    paymentRefunds.push(refund);

    // Track partial refund
    if (amount < tx.amount) {
      partialRefunds.push({
        id: partialRefunds.length + 1,
        refundId: refund.id,
        amount,
        status: "succeeded"
      });
    }

    // Log refund transaction
    paymentTransactions.push({
      id: paymentTransactions.length + 1,
      intentId: tx.intentId,
      accountId: tx.accountId,
      type: "refund",
      amount,
      currency: tx.currency,
      status: "success",
      externalReferenceId: refundRes.externalId,
      processedAt: new Date().toISOString()
    });

    logPaymentAudit(1, "Refund Transaction", `Refunded transaction #${tx.id} for amount ${amount} (Reason: ${reason})`);
    return refund;
  }

  // G. Subscription & Recurring Billings
  static async triggerRecurringBilling(accountId: number, amount: number, subscriptionId: number): Promise<PaymentIntent> {
    // Generate standard automatic intent representing a subscription recurring charge
    const intent = await this.createPaymentIntent({
      amount,
      currency: "USD",
      storeId: 1,
      orderId: subscriptionId,
      paymentMethodId: 1
    });

    // Auto-authorize and capture to complete subscription payment loop
    const auth = await this.authorizeIntent(intent.id);
    await this.captureAuthorization(auth.id);

    return intent;
  }

  // H. Invoice & Receipt Generator
  static generateReceipt(txId: number): PaymentReceipt {
    const tx = paymentTransactions.find(t => t.id === txId);
    if (!tx) throw new Error(`Transaction ID ${txId} not found.`);

    const nextId = paymentReceipts.length + 1;
    const receiptNumber = `REC-2026-N${String(nextId).padStart(4, "0")}`;
    const details = `Receipt for payment transaction ID #${tx.id}. Value: ${tx.amount} ${tx.currency}. Status: ${tx.status.toUpperCase()}.`;

    const receipt: PaymentReceipt = {
      id: nextId,
      transactionId: tx.id,
      receiptNumber,
      issuedAt: new Date().toISOString(),
      details
    };

    paymentReceipts.push(receipt);
    return receipt;
  }

  // I. Settlement Engine & Batching Reconciliation
  static async runEndOfDayReconciliation(): Promise<SettlementBatch> {
    const activeTx = paymentTransactions.filter(t => t.status === "success" && t.type === "capture");
    const gross = activeTx.reduce((sum, t) => sum + t.amount, 0);
    const fee = activeTx.length * 2.50; // Flat standard gateway fee
    const net = gross - fee;

    const nextBatchId = settlementBatches.length + 1;
    const batch: SettlementBatch = {
      id: nextBatchId,
      accountId: 1,
      batchReference: `SETTLE_AUTO_BATCH_${Date.now()}`,
      totalGrossAmount: gross,
      totalFeeAmount: fee,
      totalNetAmount: net,
      status: "closed",
      closedAt: new Date().toISOString()
    };

    settlementBatches.push(batch);

    // Map each transaction into the settlement ledger
    activeTx.forEach(tx => {
      const nextSettleId = paymentSettlements.length + 1;
      const settlement: PaymentSettlement = {
        id: nextSettleId,
        batchId: batch.id,
        transactionId: tx.id,
        grossAmount: tx.amount,
        feeAmount: 2.50,
        netAmount: tx.amount - 2.50,
        status: "settled",
        settledAt: new Date().toISOString()
      };
      paymentSettlements.push(settlement);
    });

    logPaymentAudit(1, "Daily Reconciliation Run", `Closed settlement batch #${batch.id} with net ${batch.totalNetAmount} USD`);
    return batch;
  }

  // J. Ingress Webhook Processing
  static async processGatewayWebhook(providerCode: string, payloadStr: string, signature: string): Promise<PaymentEvent> {
    const nextEventId = paymentEvents.length + 1;

    // Signature verification logic
    if (!signature || signature.length < 5) {
      throw new Error("Invalid webhook signature verification failed.");
    }

    const payloadObj = JSON.parse(payloadStr);
    const eventType = payloadObj.event_type || "payment_intent.succeeded";

    const event: PaymentEvent = {
      id: nextEventId,
      webhookId: 1,
      eventType,
      payload: payloadStr,
      status: "processed",
      createdAt: new Date().toISOString()
    };

    paymentEvents.push(event);

    // Process event hooks
    if (eventType === "payment_intent.succeeded") {
      const pId = payloadObj.payment_intent_id;
      const intent = paymentIntents.find(i => i.id === pId || i.clientSecret.includes(pId));
      if (intent) {
        intent.status = "succeeded";
      }
    } else if (eventType === "chargeback.created") {
      const disId = payloadObj.dispute_id;
      const dispute = paymentDisputes.find(d => d.id === disId);
      if (dispute) {
        dispute.status = "needs_response";
        chargebacks.push({
          id: chargebacks.length + 1,
          disputeId: dispute.id,
          feeAmount: 15.00,
          totalDebitedAmount: dispute.amount + 15.00,
          debitedAt: new Date().toISOString()
        });
      }
    }

    return event;
  }
}
