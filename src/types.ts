export interface AIEmployee {
  id: number;
  name: string;
  roleId: number;
  email: string;
  avatarUrl: string;
  departmentId: number;
  status: "active" | "idle" | "busy";
  salary: number; // simulated cost per month
  created_at: string;
}

export interface AIEmployeeRole {
  id: number;
  name: string; // e.g. "AI CEO"
  description: string;
  responsibilities: string[];
}

export interface AIEmployeeCapability {
  id: number;
  employeeId: number;
  name: string;
  description: string;
  proficiency: number; // 0-100
}

export interface AIEmployeePermission {
  id: number;
  roleId: number;
  permission: string; // e.g. "crm:read"
  description: string;
}

export interface AIEmployeeConfiguration {
  id: number;
  employeeId: number;
  temperature: number;
  responseStyle: "professional" | "concise" | "detailed" | "playful";
  systemInstructions: string;
  toolsEnabled: string[]; // e.g. ["CRM Tool", "Finance Tool"]
}

export interface AIEmployeeMemory {
  id: number;
  employeeId: number;
  type: "short-term" | "long-term";
  content: string;
  timestamp: string;
}

export interface AIEmployeeTask {
  id: number;
  employeeId: number;
  title: string;
  description: string;
  status: "pending" | "planning" | "in-progress" | "completed" | "failed";
  priority: "low" | "medium" | "high" | "critical";
  delegatedBy?: string;
  delegatedTo?: string;
  due_date: string;
  created_at: string;
}

export interface AIEmployeeConversation {
  id: number;
  employeeId: number;
  messages: Array<{
    sender: "user" | "agent";
    content: string;
    timestamp: string;
  }>;
  updated_at: string;
}

export interface AIEmployeeDecision {
  id: number;
  employeeId: number;
  title: string;
  rational: string;
  impactLevel: "low" | "medium" | "high" | "critical";
  logged_at: string;
}

export interface AIEmployeeRecommendation {
  id: number;
  employeeId: number;
  category: string;
  recommendation: string;
  benefit: string;
  score: number; // 0-100 score
  status: "pending" | "accepted" | "dismissed";
  created_at: string;
}

export interface AIEmployeeReport {
  id: number;
  employeeId: number;
  title: string;
  content: string; // Markdown / detailed text report
  generated_at: string;
}

export interface AIEmployeeAnalytics {
  id: number;
  employeeId: number;
  metricName: string;
  metricValue: number;
  timestamp: string;
}

export interface AIEmployeeAuditLog {
  id: number;
  employeeId: number;
  action: string;
  details: string;
  permissionChecked: boolean;
  timestamp: string;
}

// ==========================================
// ENTERPRISE VOICE AI PLATFORM MODELS
// ==========================================

export interface VoiceSession {
  id: number;
  employeeId: number;
  status: "active" | "completed";
  provider: string;
  duration: number; // in seconds
  channel: "browser" | "mobile" | "phone" | "sip" | "whatsapp" | "meeting" | "internal" | "notes" | "robot";
  createdAt: string;
}

export interface VoiceConversation {
  id: number;
  sessionId: number;
  employeeId: number;
  messagesCount: number;
  lastActive: string;
}

export interface VoiceMessage {
  id: number;
  conversationId: number;
  sender: "user" | "agent";
  content: string;
  audioUrl: string;
  duration: number; // in seconds
  timestamp: string;
}

export interface VoiceTranscript {
  id: number;
  entityType: "call" | "meeting" | "session";
  entityId: number;
  fullText: string;
  formattedText: string;
  completedAt: string;
}

export interface VoiceRecording {
  id: number;
  entityType: "call" | "meeting" | "session";
  entityId: number;
  fileUrl: string;
  fileSize: number; // in bytes
  duration: number; // in seconds
  format: "mp3" | "wav" | "ogg";
  createdAt: string;
}

export interface VoiceProfile {
  id: number;
  employeeId: number;
  voiceName: string;
  languageCode: string;
  gender: "male" | "female" | "neutral";
  pitch: number;
  speakingRate: number;
}

export interface VoicePreference {
  id: number;
  employeeId: number;
  wakeWordEnabled: boolean;
  wakeWord: string;
  silenceTimeoutMs: number;
  autoRecord: boolean;
  preferredChannel: "browser" | "mobile" | "phone" | "sip" | "whatsapp" | "meeting" | "internal" | "notes" | "robot";
}

export interface VoiceCommand {
  id: number;
  commandPattern: string;
  actionType: string;
  description: string;
  minConfidence: number;
}

export interface VoiceCall {
  id: number;
  callSid: string;
  fromNumber: string;
  toNumber: string;
  direction: "inbound" | "outbound";
  status: "ringing" | "in-progress" | "completed" | "failed";
  startTime: string;
  endTime: string;
  duration: number; // in seconds
}

export interface VoiceCallParticipant {
  id: number;
  callId: number;
  name: string;
  role: "user" | "agent" | "third-party";
  joinedAt: string;
}

export interface VoiceMeeting {
  id: number;
  meetingTitle: string;
  provider: "zoom" | "google_meet" | "teams" | "custom";
  meetingUrl: string;
  status: "scheduled" | "live" | "completed";
  startTime: string;
  duration: number; // in seconds
}

export interface VoiceMeetingParticipant {
  id: number;
  meetingId: number;
  name: string;
  email: string;
  isAiAgent: boolean;
  joinedAt: string;
}

export interface VoiceMeetingSummary {
  id: number;
  meetingId: number;
  summaryText: string;
  generalVibe: string;
  keyTopics: string[];
  generatedAt: string;
}

export interface VoiceActionItem {
  id: number;
  meetingId: number;
  assigneeName: string;
  taskDescription: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
  status: "pending" | "created";
}

export interface VoiceAnalytics {
  id: number;
  employeeId: number;
  wordCount: number;
  avgResponseTimeMs: number;
  audioDurationSeconds: number;
  silencePercentage: number;
  sentimentScore: number; // -1 to +1
  timestamp: string;
}

export interface VoiceAuditLog {
  id: number;
  employeeId: number;
  action: string;
  details: string;
  channel: string;
  permissionChecked: boolean;
  ipAddress: string;
  timestamp: string;
}

// ==========================================
// ENTERPRISE MARKETPLACE & COMMERCE MODELS
// ==========================================

export interface MarketplaceProvider {
  id: number;
  code: string; // e.g., 'shopify', 'woocommerce'
  name: string; // e.g., 'Shopify', 'WooCommerce'
  status: "active" | "inactive";
  supportedFeatures: string[]; // e.g., ['product_sync', 'inventory_sync', 'order_import']
}

export interface MarketplaceAccount {
  id: number;
  providerId: number;
  name: string; // e.g., 'My Shopify Store US'
  status: "connected" | "disconnected" | "error";
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceStore {
  id: number;
  accountId: number;
  storeName: string;
  storeUrl: string;
  regionCode: string; // e.g., 'US', 'EU'
  status: "active" | "inactive";
  currency: string;
}

export interface MarketplaceCredential {
  id: number;
  accountId: number;
  credentialKey: string; // e.g., 'apiKey', 'accessToken'
  credentialValue: string; // Encrypted or obfuscated in production
}

export interface MarketplaceRegion {
  id: number;
  providerId: number;
  regionCode: string; // e.g., 'US', 'EU', 'AS'
  regionName: string;
  endpointUrl: string;
}

export interface MarketplaceProduct {
  id: number;
  storeId: number;
  externalProductId: string;
  sku: string;
  title: string;
  description: string;
  status: string; // e.g., 'published', 'draft'
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceCategory {
  id: number;
  storeId: number;
  externalCategoryId: string;
  name: string;
  parentCategoryId?: string;
}

export interface MarketplaceOrder {
  id: number;
  storeId: number;
  externalOrderId: string;
  orderNumber: string;
  status: string; // e.g., 'pending', 'paid', 'shipped', 'cancelled'
  currency: string;
  totalPrice: number;
  subtotalPrice: number;
  totalTax: number;
  totalDiscount: number;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceOrderItem {
  id: number;
  orderId: number;
  externalItemId: string;
  sku: string;
  title: string;
  quantity: number;
  price: number;
  totalDiscount: number;
}

export interface MarketplaceCustomer {
  id: number;
  storeId: number;
  externalCustomerId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: string;
}

export interface MarketplaceInventory {
  id: number;
  storeId: number;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  locationId?: string;
  updatedAt: string;
}

export interface MarketplacePrice {
  id: number;
  storeId: number;
  sku: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  updatedAt: string;
}

export interface MarketplaceShipment {
  id: number;
  orderId: number;
  externalShipmentId: string;
  trackingNumber: string;
  carrier: string;
  status: string; // e.g., 'label_created', 'shipped', 'delivered'
  shippedAt?: string;
}

export interface MarketplaceReturn {
  id: number;
  orderId: number;
  externalReturnId: string;
  status: string; // e.g., 'requested', 'received', 'refunded'
  reason: string;
  refundAmount: number;
  createdAt: string;
}

export interface MarketplaceSyncJob {
  id: number;
  storeId: number;
  syncType: "product" | "inventory" | "price" | "order" | "customer" | "shipment" | "return";
  status: "pending" | "processing" | "completed" | "failed";
  recordsProcessed: number;
  errorMessage?: string;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface MarketplaceWebhook {
  id: number;
  storeId: number;
  topic: string; // e.g., 'order.created', 'product.updated'
  webhookUrl: string;
  externalWebhookId?: string;
  status: "active" | "inactive";
}

export interface MarketplaceEvent {
  id: number;
  storeId: number;
  topic: string;
  payload: string; // JSON string
  status: "pending" | "processed" | "failed";
  errorMessage?: string;
  createdAt: string;
}

export interface MarketplaceLog {
  id: number;
  storeId?: number;
  level: "info" | "warn" | "error";
  message: string;
  details?: string;
  timestamp: string;
}

export interface MarketplaceAuditLog {
  id: number;
  employeeId: number;
  action: string;
  details: string;
  permissionChecked: boolean;
  timestamp: string;
}

// ==========================================================
// ENTERPRISE PAYMENT INTEGRATION PLATFORM TYPES
// ==========================================================

export interface PaymentProvider {
  id: number;
  code: string; // e.g. "stripe", "paypal", "adyen"
  name: string;
  status: "active" | "inactive";
  supportedFeatures: string[];
}

export interface PaymentGateway {
  id: number;
  providerId: number;
  gatewayName: string;
  environment: "sandbox" | "production";
  status: "active" | "inactive";
}

export interface PaymentAccount {
  id: number;
  gatewayId: number;
  merchantId: string;
  accountName: string;
  currency: string;
  status: "active" | "inactive";
}

export interface MerchantAccount {
  id: number;
  accountId: number;
  corporateName: string;
  countryCode: string;
  settlementBankRouting: string;
  settlementBankAccount: string;
}

export interface PaymentMethod {
  id: number;
  accountId: number;
  type: "card" | "wallet" | "bank_transfer" | "alternative";
  brand: string; // e.g., "visa", "mastercard", "apple_pay"
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  status: "active" | "expired" | "disabled";
}

export interface PaymentMethodToken {
  id: number;
  paymentMethodId: number;
  tokenValue: string;
  vaultedAt: string;
  expiresAt?: string;
}

export interface PaymentIntent {
  id: number;
  storeId?: number;
  orderId?: number;
  amount: number;
  currency: string;
  status: "requires_payment_method" | "requires_confirmation" | "requires_action" | "processing" | "requires_capture" | "canceled" | "succeeded";
  clientSecret: string;
  paymentMethodId?: number;
  metadata?: string;
}

export interface PaymentTransaction {
  id: number;
  intentId?: number;
  accountId: number;
  type: "authorization" | "capture" | "sale" | "refund" | "void";
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed";
  externalReferenceId?: string;
  errorMessage?: string;
  processedAt: string;
}

export interface PaymentAuthorization {
  id: number;
  intentId: number;
  amount: number;
  currency: string;
  status: "authorized" | "captured" | "voided" | "expired";
  authorizedAt: string;
  expiresAt: string;
  authCode: string;
}

export interface PaymentCapture {
  id: number;
  authorizationId: number;
  amount: number;
  currency: string;
  status: "succeeded" | "failed";
  capturedAt: string;
  transactionId: number;
}

export interface PaymentRefund {
  id: number;
  transactionId: number; // reference transaction
  amount: number;
  currency: string;
  reason: string;
  status: "pending" | "succeeded" | "failed";
  refundedAt: string;
}

export interface PartialRefund {
  id: number;
  refundId: number;
  lineItemId?: number;
  amount: number;
  status: "succeeded" | "failed";
}

export interface PaymentDispute {
  id: number;
  transactionId: number;
  externalDisputeId: string;
  reason: string;
  amount: number;
  currency: string;
  status: "needs_response" | "under_review" | "won" | "lost";
  evidenceSubmitted?: string;
  createdAt: string;
}

export interface Chargeback {
  id: number;
  disputeId: number;
  feeAmount: number;
  totalDebitedAmount: number;
  debitedAt: string;
}

export interface PaymentSettlement {
  id: number;
  batchId: number;
  transactionId: number;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  status: "pending" | "settled";
  settledAt?: string;
}

export interface SettlementBatch {
  id: number;
  accountId: number;
  batchReference: string;
  totalGrossAmount: number;
  totalFeeAmount: number;
  totalNetAmount: number;
  status: "open" | "processing" | "closed";
  closedAt?: string;
}

export interface PaymentWebhook {
  id: number;
  providerCode: string;
  webhookUrl: string;
  secret: string;
  status: "active" | "inactive";
}

export interface PaymentEvent {
  id: number;
  webhookId?: number;
  eventType: string; // e.g. "payment_intent.succeeded"
  payload: string;
  status: "pending" | "processed" | "failed";
  errorMessage?: string;
  createdAt: string;
}

export interface PaymentInvoice {
  id: number;
  orderId: number;
  invoiceNumber: string;
  totalAmount: number;
  currency: string;
  status: "draft" | "unpaid" | "paid" | "overdue";
  dueDate: string;
  createdAt: string;
}

export interface PaymentReceipt {
  id: number;
  transactionId: number;
  receiptNumber: string;
  issuedAt: string;
  details: string;
}

export interface PaymentAuditLog {
  id: number;
  employeeId: number;
  action: string;
  details: string;
  timestamp: string;
}


// ==========================================================
// ENTERPRISE LOGISTICS & SUPPLY CHAIN MANAGEMENT TYPES
// ==========================================================

export interface LogisticsProvider {
  id: number;
  code: string; // e.g., "dhl", "fedex"
  name: string;
  status: "active" | "inactive";
}

export interface Carrier {
  id: number;
  providerId: number;
  name: string;
  trackingTemplateUrl?: string;
  status: "active" | "inactive";
}

export interface CarrierService {
  id: number;
  carrierId: number;
  serviceName: string; // e.g. "Ground", "Express Next Day"
  transitTimeDays: number;
  baseCost: number;
}

export interface WarehouseZone {
  id: number;
  warehouseId: number;
  zoneName: string; // e.g., "Aisle A", "Cold Storage"
  zoneCode: string;
}

export interface WarehouseBin {
  id: number;
  zoneId: number;
  binCode: string; // e.g. "BIN-01-02-A"
  maxCapacity: number;
}

export interface FulfillmentCenter {
  id: number;
  name: string;
  locationAddress: string;
  capacitySqFt: number;
  status: "active" | "inactive";
}

export interface Shipment {
  id: number;
  orderId?: number;
  warehouseId: number;
  carrierServiceId: number;
  trackingNumber?: string;
  shipmentNumber: string;
  status: "pending" | "packed" | "shipped" | "in_transit" | "delivered" | "exception" | "lost" | "damaged";
  originAddress: string;
  destinationAddress: string;
  estimatedDeliveryDate?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface ShipmentPackage {
  id: number;
  shipmentId: number;
  weightLbs: number;
  lengthInches: number;
  widthInches: number;
  heightInches: number;
  packageType: string;
}

export interface ShipmentItem {
  id: number;
  shipmentId: number;
  sku: string;
  quantity: number;
  weightLbs: number;
}

export interface ShipmentLabel {
  id: number;
  shipmentId: number;
  labelFormat: "zpl" | "pdf";
  base64Data: string;
  createdAt: string;
}

export interface ShipmentTracking {
  id: number;
  shipmentId: number;
  location: string;
  status: string;
  description: string;
  timestamp: string;
}

export interface DeliveryRoute {
  id: number;
  fleetId: number;
  routeName: string;
  status: "planned" | "active" | "completed";
  plannedDistanceMiles: number;
  actualDistanceMiles?: number;
  estimatedDurationMinutes: number;
  actualDurationMinutes?: number;
}

export interface DeliveryStop {
  id: number;
  routeId: number;
  shipmentId: number;
  stopSequence: number;
  status: "pending" | "completed" | "skipped" | "failed";
  estimatedArrival: string;
  actualArrival?: string;
}

export interface Fleet {
  id: number;
  fleetName: string;
  region: string;
  status: "active" | "inactive";
}

export interface Vehicle {
  id: number;
  fleetId: number;
  makeModel: string;
  licensePlate: string;
  weightCapacityLbs: number;
  volumeCapacityCuFt: number;
  status: "available" | "in_transit" | "maintenance";
}

export interface Driver {
  id: number;
  name: string;
  licenseNumber: string;
  phoneNumber: string;
  status: "available" | "on_route" | "offline";
}

export interface DriverAssignment {
  id: number;
  vehicleId: number;
  driverId: number;
  routeId?: number;
  assignedAt: string;
  releasedAt?: string;
}

export interface DispatchOrder {
  id: number;
  routeId: number;
  dispatchedAt: string;
  status: "dispatched" | "in_transit" | "completed";
}

export interface RouteOptimizationJob {
  id: number;
  fleetId: number;
  status: "pending" | "running" | "completed" | "failed";
  stopCount: number;
  optimizedRouteDetails?: string;
  completedAt?: string;
}

export interface PickupRequest {
  id: number;
  warehouseId: number;
  carrierId: number;
  pickupTime: string;
  status: "requested" | "confirmed" | "completed" | "canceled";
}

export interface DeliveryConfirmation {
  id: number;
  shipmentId: number;
  confirmedBy: string;
  signatureBase64?: string;
  confirmedAt: string;
}

export interface ProofOfDelivery {
  id: number;
  confirmationId: number;
  photoUrl?: string;
  notes?: string;
}

export interface ReturnShipment {
  id: number;
  originalShipmentId: number;
  returnReason: string;
  status: "requested" | "received" | "inspected" | "restocked";
  createdAt: string;
}

export interface ReverseLogistics {
  id: number;
  returnShipmentId: number;
  disposition: "restock" | "refurbish" | "recycle" | "liquidate" | "dispose";
  inspectedBy: string;
  inspectionDetails: string;
  resolvedAt?: string;
}

export interface CustomsDeclaration {
  id: number;
  shipmentId: number;
  declarationNumber: string;
  customsValue: number;
  tariffCode: string;
  status: "pending" | "cleared" | "rejected" | "held";
}

export interface FreightOrder {
  id: number;
  freightNumber: string;
  shipper: string;
  vesselFlight?: string;
  containerId?: string;
  status: "booked" | "loaded" | "on_water" | "customs" | "discharged";
}

export interface FreightCost {
  id: number;
  freightOrderId: number;
  costCategory: string; // e.g. "ocean_freight", "demurrage"
  amount: number;
  currency: string;
}

export interface TransportationOrder {
  id: number;
  shipmentId: number;
  transportType: "road" | "rail" | "ocean" | "air";
  estimatedCost: number;
  actualCost?: number;
}

export interface SupplyChainNode {
  id: number;
  name: string; // e.g., "Factory A", "Warehouse B"
  type: "supplier" | "warehouse" | "factory" | "customer";
  latitude: number;
  longitude: number;
}

export interface SupplyChainRoute {
  id: number;
  originNodeId: number;
  destinationNodeId: number;
  distanceMiles: number;
  averageTransitHours: number;
}

export interface InventoryTransit {
  id: number;
  originWarehouseId: number;
  destinationWarehouseId: number;
  sku: string;
  quantity: number;
  status: "in_transit" | "received";
  shippedAt: string;
  receivedAt?: string;
}

export interface ShipmentException {
  id: number;
  shipmentId: number;
  exceptionCode: string; // e.g. "WEATHER_DELAY"
  resolved: boolean;
  notes: string;
  createdAt: string;
}

export interface LogisticsWebhook {
  id: number;
  carrierId: number;
  webhookUrl: string;
  status: "active" | "inactive";
}

export interface LogisticsAuditLog {
  id: number;
  employeeId: number;
  action: string;
  details: string;
  timestamp: string;
}


// ==========================================================
// ENTERPRISE ADVANCED REPORTING & REPORT DESIGNER TYPES
// ==========================================================

export interface Report {
  id: number;
  categoryId: number;
  folderId?: number;
  title: string;
  description: string;
  type: "operational" | "executive" | "financial" | "sales" | "crm" | "hr" | "manufacturing" | "inventory" | "procurement" | "project" | "marketing" | "support" | "ai_insights" | "compliance" | "audit" | "logistics" | "custom";
  layoutJson: string; // saved drag-and-drop report layout metadata
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportCategory {
  id: number;
  name: string;
  code: string;
}

export interface ReportTemplate {
  id: number;
  name: string;
  description: string;
  layoutJson: string;
}

export interface ReportFolder {
  id: number;
  name: string;
  parentId?: number;
}

export interface ReportSection {
  id: number;
  reportId: number;
  title: string;
  sortOrder: number;
}

export interface ReportWidget {
  id: number;
  sectionId: number;
  type: "chart" | "kpi" | "table" | "pivot" | "crosstab";
  title: string;
  configJson: string;
  sortOrder: number;
}

export interface ReportParameter {
  id: number;
  reportId: number;
  name: string;
  dataType: "string" | "number" | "date" | "boolean";
  defaultValue?: string;
}

export interface ReportFilter {
  id: number;
  reportId: number;
  fieldName: string;
  operator: "equals" | "contains" | "greater_than" | "less_than" | "between";
  filterValue: string;
}

export interface ReportQuery {
  id: number;
  reportId: number;
  sqlStatement: string;
  timeoutSeconds: number;
}

export interface ReportSchedule {
  id: number;
  reportId: number;
  frequency: "hourly" | "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "cron";
  cronExpression?: string;
  nextRunAt: string;
  status: "active" | "paused";
}

export interface ReportExecution {
  id: number;
  reportId: number;
  triggeredBy: string; // e.g. "user_1", "schedule_2"
  status: "running" | "completed" | "failed";
  durationMs?: number;
  errorMessage?: string;
  executedAt: string;
}

export interface ReportHistory {
  id: number;
  reportId: number;
  filePath: string;
  format: "pdf" | "xlsx" | "csv" | "json" | "xml" | "html" | "markdown";
  generatedAt: string;
}

export interface ReportSnapshot {
  id: number;
  reportId: number;
  dataSnapshotJson: string;
  snapshotAt: string;
}

export interface ReportSubscription {
  id: number;
  reportId: number;
  subscriberEmail: string;
  format: "pdf" | "xlsx" | "csv";
}

export interface ReportRecipient {
  id: number;
  subscriptionId: number;
  recipientName: string;
  recipientEmail: string;
}

export interface ReportExport {
  id: number;
  executionId: number;
  exportFormat: "pdf" | "xlsx" | "csv" | "json" | "xml" | "html" | "markdown";
  fileSize: number;
  downloadUrl: string;
}

export interface ReportAttachment {
  id: number;
  exportId: number;
  fileName: string;
}

export interface ReportBookmark {
  id: number;
  reportId: number;
  userId: number;
  bookmarkName: string;
  paramsJson: string;
}

export interface ReportFavorite {
  id: number;
  reportId: number;
  userId: number;
}

export interface DashboardReport {
  id: number;
  reportId: number;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
}

export interface ReportPermission {
  id: number;
  reportId: number;
  roleName: string;
  canRead: boolean;
  canEdit: boolean;
  canExport: boolean;
  canShare: boolean;
}

export interface ReportAuditLog {
  id: number;
  employeeId: number;
  action: string;
  details: string;
  timestamp: string;
}


// ==========================================================
// ENTERPRISE SECURITY HARDENING PLATFORM TYPES
// ==========================================================

export interface SecurityPolicy {
  id: number;
  policyName: string;
  description: string;
  status: "enabled" | "disabled";
}

export interface SecurityRule {
  id: number;
  policyId: number;
  ruleName: string;
  ruleType: "ip_allow" | "ip_block" | "rate_limit" | "mfa_requirement" | "concurrent_session_limit";
  ruleValue: string;
  status: "enabled" | "disabled";
}

export interface SecurityEvent {
  id: number;
  eventType: string; // e.g., "login_failed", "unauthorized_access"
  severity: "low" | "medium" | "high" | "critical";
  ipAddress: string;
  details: string;
  timestamp: string;
}

export interface SecurityAlert {
  id: number;
  eventId: number;
  message: string;
  status: "unread" | "dismissed";
  timestamp: string;
}

export interface SecurityIncident {
  id: number;
  title: string;
  status: "open" | "investigating" | "mitigated" | "resolved";
  severity: "low" | "medium" | "high" | "critical";
  assignedToEmployeeId?: number;
  timelineJson: string;
  createdAt: string;
}

export interface SecurityAudit {
  id: number;
  employeeId: number;
  action: string;
  ipAddress: string;
  details: string;
  timestamp: string;
}

export interface SecuritySession {
  id: number;
  userId: number;
  sessionToken: string;
  deviceFingerprint: string;
  ipAddress: string;
  expiresAt: string;
  mfaVerified: boolean;
  status: "active" | "revoked";
}

export interface TrustedDevice {
  id: number;
  userId: number;
  deviceFingerprint: string;
  deviceName: string;
  verifiedAt: string;
}

export interface LoginHistory {
  id: number;
  userId: number;
  status: "success" | "failed";
  ipAddress: string;
  deviceFingerprint: string;
  failureReason?: string;
  timestamp: string;
}

export interface RiskAssessment {
  id: number;
  assessedAt: string;
  overallRiskScore: number; // 0 to 100
  detailsJson: string;
}

export interface ThreatDetection {
  id: number;
  threatType: "brute_force" | "impossible_travel" | "api_abuse" | "privilege_escalation" | "credential_stuffing";
  status: "detected" | "blocked" | "ignored";
  ipAddress: string;
  riskScore: number;
  detectedAt: string;
}

export interface APIKey {
  id: number;
  keyName: string;
  apiKeyHash: string;
  scopeJson: string; // stringified scopes array
  status: "active" | "revoked";
  expiresAt?: string;
}

export interface APIKeyScope {
  id: number;
  apiKeyId: number;
  scope: string; // e.g. "logistics.read"
}

export interface SecretReference {
  id: number;
  secretKey: string;
  secretHash: string;
  updatedAt: string;
}

export interface EncryptionKeyReference {
  id: number;
  keyAlias: string;
  algorithm: string;
  rotatedAt: string;
}

export interface ComplianceReport {
  id: number;
  framework: "SOC2" | "PCI-DSS" | "GDPR" | "HIPAA";
  score: number; // 0 to 100
  status: "compliant" | "non_compliant" | "under_review";
  generatedAt: string;
}

export interface ComplianceControl {
  id: number;
  framework: string;
  controlCode: string;
  title: string;
  status: "passed" | "failed" | "exempt";
}

export interface ComplianceAudit {
  id: number;
  complianceReportId: number;
  inspectedBy: string;
  findings: string;
  auditedAt: string;
}


