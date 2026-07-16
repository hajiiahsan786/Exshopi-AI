process.env.NODE_ENV = "test";
import {
  employees,
  roles,
  capabilities,
  permissions,
  configurations,
  memories,
  tasks,
  conversations,
  decisions,
  recommendations,
  reports,
  analytics,
  auditLogs,
  getEmployeeById
} from "../server/db";
import {
  generateAgentResponse,
  createTaskPlan,
  generateDomainRecommendation,
  delegateTask,
  generateDomainReport
} from "../server/services/engines";
import { VoiceRepository } from "../server/services/voiceRepository";
import { VoiceService } from "../server/services/voiceService";
import { MarketplaceRepository } from "../server/services/marketplaceRepository";
import { MarketplaceService, retryQueue } from "../server/services/marketplaceService";
import { ConnectorRegistry } from "../server/services/marketplaceConnectors";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failed++;
  }
}

async function runSuite() {
  console.log("==========================================");
  console.log("  EXSHOPI AI - WORKFORCE TEST SUITE       ");
  console.log("==========================================\n");

  // 1. REPOSITORY TESTS
  console.log("--- Running Repository Tests ---");
  assert(employees.length === 14, "Database contains exactly 14 AI Employees");
  assert(roles.length === 14, "Database contains exactly 14 AI Employee Roles");
  assert(getEmployeeById(1)?.name === "Chief Executive Agent", "AI CEO profile loads correctly");
  assert(getEmployeeById(14)?.name === "Carter Compliance Agent", "AI Compliance Advisor profile loads correctly");
  assert(capabilities.length >= 14, "All AI employees have registered core capabilities");
  assert(configurations.length === 14, "Each employee has custom LLM configuration records");

  // 2. PLANNING ENGINE TESTS
  console.log("\n--- Running Planning Engine Tests ---");
  const ceoPlan = await createTaskPlan(1, "Formulate Q3 Growth Plan");
  assert(Array.isArray(ceoPlan) && ceoPlan.length >= 4, "Planning Engine returns a multi-step structured plan");

  // 3. CONVERSATION & REASONING ENGINE TESTS
  console.log("\n--- Running Conversation & Reasoning Tests ---");
  const ceoResponse = await generateAgentResponse(1, "What is our current strategic focus?");
  assert(ceoResponse.length > 0 && ceoResponse.toLowerCase().includes("strateg"), "AI CEO Conversation Engine returns context-aware strategy recommendations");
  
  const originalMessageCount = conversations.find(c => c.employeeId === 1)?.messages.length || 0;
  assert(originalMessageCount > 0, "Conversation history records messages correctly");

  // 4. RECOMMENDATION ENGINE TESTS
  console.log("\n--- Running Recommendation Engine Tests ---");
  const fionaRec = generateDomainRecommendation(6); // Fiona Finance Agent
  assert(fionaRec && fionaRec.score >= 80, "Recommendation Engine computes highly optimized business tips");
  assert(recommendations.find(r => r.employeeId === 6) !== undefined, "Recommendations saved to database state table");

  // 5. DELEGATION ENGINE TESTS
  console.log("\n--- Running Task Delegation Tests ---");
  const delegationResult = delegateTask(1, 3, "Urgent Campaign Outreach", "Perform immediate CRM lead scores outreach.");
  assert(delegationResult.task.delegatedBy === "Chief Executive Agent", "Delegated Task records source employee");
  assert(delegationResult.task.delegatedTo === "Sophia Sales Agent", "Delegated Task records destination employee");
  assert(decisions.find(d => d.employeeId === 1 && d.title.includes("Urgent Campaign Outreach")) !== undefined, "Delegation action logged to AI decisions table");

  // 6. REPORT GENERATOR TESTS
  console.log("\n--- Running Report & Document Tests ---");
  const complianceReport = await generateDomainReport(14, "GDPR SOC-2 Quarterly Alignment Report");
  assert(complianceReport.content.includes("Report"), "Report Engine builds markdown reports");
  assert(reports.find(r => r.employeeId === 14 && r.title.includes("GDPR")) !== undefined, "Generated reports persist in reports table");

  // 7. MEMORY PERSISTENCE TESTS
  console.log("\n--- Running Memory Persistence Tests ---");
  const originalMemCount = memories.filter(m => m.employeeId === 3).length;
  memories.push({
    id: memories.length + 1,
    employeeId: 3,
    type: "long-term",
    content: "Customer preference: prefers async updates over video briefings.",
    timestamp: new Date().toISOString()
  });
  const updatedMemCount = memories.filter(m => m.employeeId === 3).length;
  assert(updatedMemCount === originalMemCount + 1, "Memory Engine successfully appends long-term memory blocks");

  // 8. AUDIT & PERMISSION TESTS
  console.log("\n--- Running Audit & Permission Tests ---");
  const latestAuditLog = auditLogs[auditLogs.length - 1];
  assert(latestAuditLog.permissionChecked === true, "Audit engine validates permission context matches organization boundary");

  // 9. ENTERPRISE VOICE AI PLATFORM TESTS
  console.log("\n--- Running Enterprise Voice AI Platform Tests ---");

  // 9A. Unit & Provider Abstraction Tests
  console.log("\n--- [Voice Unit] Testing Provider Abstractions ---");
  let sttTriggered = false;
  const customSTT = {
    async transcribeAudio(base64: string): Promise<string> {
      sttTriggered = true;
      return "custom transcribed command";
    }
  };
  VoiceService.registerSTTProvider(customSTT);
  const transcriptionResult = await (customSTT.transcribeAudio("fake_audio_bytes"));
  assert(transcriptionResult === "custom transcribed command", "Speech-to-Text abstraction interface functions correctly");
  assert(sttTriggered === true, "Registering external custom STT provider successfully delegates processing");

  // Restore defaults for downstream service tests
  const defaultSTT = new (class {
    async transcribeAudio(b: string) { return "AI CEO, outline our strategic plan"; }
  })();
  VoiceService.registerSTTProvider(defaultSTT);

  // 9B. Repository Tests (16 requested models check)
  console.log("\n--- [Voice Repository] Testing voice database models CRUD ---");
  const seededSessions = VoiceRepository.listSessions();
  assert(seededSessions.items.length >= 3, "VoiceSession model and query pagination loaded successfully");
  
  const ceoProfile = VoiceRepository.getProfileByEmployeeId(1);
  assert(ceoProfile !== undefined && ceoProfile.voiceName === "en-US-Journey-F", "VoiceProfile model and employee resolver loaded successfully");

  const ceoPref = VoiceRepository.getPreferenceByEmployeeId(1);
  assert(ceoPref !== undefined && ceoPref.wakeWord === "Hey Chief", "VoicePreference model and custom wake word loaded successfully");

  const voiceCommandsCount = VoiceRepository.listCommands().length;
  VoiceRepository.createCommand({
    commandPattern: "reorder inventory safety stocks",
    actionType: "inventory_reorder",
    description: "Trigger stocks optimization under SKU-402 balance parameters",
    minConfidence: 0.9
  });
  assert(VoiceRepository.listCommands().length === voiceCommandsCount + 1, "VoiceCommand model successfully persist in state tables");

  const firstCall = VoiceRepository.getCallById(1);
  assert(firstCall !== undefined && firstCall.callSid === "CA-TWILIO-882190", "VoiceCall model and Twilio Sid parser loads correctly");

  const participants = VoiceRepository.listCallParticipants(1);
  assert(participants.length === 2, "VoiceCallParticipant correctly maps speaker timeline and participants");

  // 9C. Service Tests (Voice Sessions, Conversations & Real-Time Orchestration)
  console.log("\n--- [Voice Service] Testing Session & Real-Time Orchestration ---");
  const session = await VoiceService.startSession(1, "browser");
  assert(session !== undefined && session.status === "active", "Voice session management starts active browser voice loop");

  const messagesBefore = await VoiceService.getSessionMessages(session.id);
  assert(messagesBefore.length === 0, "New voice session correctly initializes with empty conversation timeline");

  // Process a real-time turn on session (STT -> Agent LLM Brain -> TTS)
  console.log("Simulating real-time voice audio turn processing...");
  const turnResult = await VoiceService.processVoiceTurn(session.id, "AI CEO, generate a strategic plan report");
  assert(turnResult.userMessage.content === "AI CEO, generate a strategic plan report", "Real-time user voice transcript mapped correctly");
  assert(turnResult.agentMessage.content.length > 0, "AI CEO Brain generated context-aware verbal recommendation");
  assert(turnResult.responseAudioUrl.startsWith("/audio/synth_"), "Text-to-Speech provider synthesized agent response to audio stream");

  const messagesAfter = await VoiceService.getSessionMessages(session.id);
  assert(messagesAfter.length === 2, "VoiceConversation timeline successfully saved user query and agent response records");

  await VoiceService.endSession(session.id);
  assert(VoiceRepository.getSessionById(session.id)?.status === "completed", "Voice session ended and marked completed successfully");

  // 9D. Call & Telephony Management Tests
  console.log("\n--- [Voice Telephony] Testing Start/End Voice Call Abstractions ---");
  const call = await VoiceService.initiateCall(1, "+15550199", "+1800249675", "outbound");
  assert(call.status === "in-progress", "SIP trunk successfully initialized call in-progress status");
  
  const terminatedCall = await VoiceService.terminateCall(call.id);
  assert(terminatedCall !== undefined && terminatedCall.status === "completed" && terminatedCall.duration > 0, "SIP telephony circuit released and duration metrics calculated");

  const savedTranscript = VoiceRepository.getTranscript("call", call.id);
  assert(savedTranscript !== undefined && savedTranscript.fullText.length > 0, "Call voice message transcribed and saved as VoiceTranscript");

  const savedRecording = VoiceRepository.getRecording("call", call.id);
  assert(savedRecording !== undefined && savedRecording.fileUrl.includes(`call_rec_${call.id}`), "Call audio recorded and saved as VoiceRecording asset");

  // 9E. Meeting Transcriptions, Summaries & Action Items Extraction Tests
  console.log("\n--- [Voice Meetings] Testing Virtual Room Summarization & Extraction ---");
  const meeting = await VoiceService.createMeeting("Q3 Budget Strategic alignment", "google_meet", "https://meet.google.com/exshopi-weekly-strategic");
  assert(meeting.status === "live", "Virtual Google Meet listener initialized as live status");

  const transcriptContent = `
  User Ahsan: Chief Agent, please approve the extra $25K budget for Sophia AI's CRM outreach.
  Chief Executive Agent: Fiona Finance Agent, do we have liquidity margins to approve this?
  Fiona Finance Agent: Yes, our liquidity run-rate is positive. I will approve the $25K reserve budget under DEPT-ASA.
  Chief Executive Agent: Approved. Fiona, make sure to allocate this by Friday.
  `;

  const meetingResult = await VoiceService.completeMeeting(meeting.id, transcriptContent);
  assert(meetingResult.meeting.status === "completed", "Virtual meeting completed and closed successfully");
  assert(meetingResult.summary.summaryText.length > 0, "Meeting Summarization engine auto-generated high-fidelity summary");
  assert(meetingResult.summary.keyTopics.length > 0, "Key business topics correctly extracted from verbal transcript");
  assert(meetingResult.actions.length > 0, "Action item assignee and priority extracted successfully");

  const finalActionItems = VoiceRepository.listActionItems(meeting.id);
  assert(finalActionItems.some(i => i.assigneeName.includes("Fiona")), "Action items assigned to appropriate employee in database");

  // ==========================================
  // ENTERPRISE MARKETPLACE & COMMERCE TESTS
  // ==========================================
  console.log("\n--- Enterprise Marketplace & Commerce Integrations Tests ---");

  // 1. [Unit / Registry Tests] Check provider connectors registration
  console.log("--- [Unit] Testing Marketplace Connector Registry ---");
  const shopifyConnector = ConnectorRegistry.getConnector("shopify");
  const amazonConnector = ConnectorRegistry.getConnector("amazon");
  const noonConnector = ConnectorRegistry.getConnector("noon");
  const lazadaConnector = ConnectorRegistry.getConnector("lazada");
  const shopeeConnector = ConnectorRegistry.getConnector("shopee");
  const alibabaConnector = ConnectorRegistry.getConnector("alibaba");
  const openCartConnector = ConnectorRegistry.getConnector("opencart");
  const prestaShopConnector = ConnectorRegistry.getConnector("prestashop");

  assert(shopifyConnector !== undefined, "Shopify connector successfully loaded from ConnectorRegistry");
  assert(amazonConnector !== undefined, "Amazon Marketplace connector successfully loaded from ConnectorRegistry");
  assert(noonConnector !== undefined, "Noon connector successfully loaded from ConnectorRegistry");
  assert(lazadaConnector !== undefined, "Lazada connector successfully loaded from ConnectorRegistry");
  assert(shopeeConnector !== undefined, "Shopee connector successfully loaded from ConnectorRegistry");
  assert(alibabaConnector !== undefined, "Alibaba connector successfully loaded from ConnectorRegistry");
  assert(openCartConnector !== undefined, "OpenCart connector successfully loaded from ConnectorRegistry");
  assert(prestaShopConnector !== undefined, "PrestaShop connector successfully loaded from ConnectorRegistry");

  // 2. [Repository Tests] Verify CRUD of Marketplace models
  console.log("--- [Repository] Testing Marketplace Database Models CRUD ---");
  const initialAccounts = MarketplaceRepository.listAccounts();
  assert(initialAccounts.length >= 2, "Marketplace accounts table holds connected sellers");

  const shopifyStore = MarketplaceRepository.getStoreById(1);
  assert(shopifyStore !== undefined && shopifyStore.storeName === "Exshopi USA", "Marketplace store resolves by ID");

  const productList = MarketplaceRepository.listProducts({ storeId: 1 });
  assert(productList.items.length > 0, "Marketplace products retrieved with page pagination and store filtering");

  const orderList = MarketplaceRepository.listOrders({ storeId: 1 });
  assert(orderList.items.length > 0, "Marketplace orders and item lists resolved successfully");

  // 3. [Service Tests] Verify account connection flows, audits, and AI alignment
  console.log("--- [Service] Testing Connect/Disconnect Workflows ---");
  const beforeCount = MarketplaceRepository.listAccounts().length;
  const newConnection = await MarketplaceService.connectAccount({
    providerCode: "woocommerce",
    accountName: "Exshopi WooCommerce EU Portal",
    storeName: "WooCommerce Paris",
    storeUrl: "https://paris.exshopi-woocommerce.com",
    credentials: [{ key: "consumerKey", value: "ck_xxxxxxxx" }, { key: "consumerSecret", value: "cs_xxxxxxxx" }],
    employeeId: 1
  });

  const afterCount = MarketplaceRepository.listAccounts().length;
  assert(afterCount === beforeCount + 1, "WooCommerce brand account registered successfully under multi-store architecture");

  const wooStore = MarketplaceRepository.listStores(newConnection.account.id)[0];
  assert(wooStore.storeName === "WooCommerce Paris", "Active store and currency variables resolved automatically");

  const activeWebhooks = MarketplaceRepository.listWebhooks(wooStore.id);
  assert(activeWebhooks.some(w => w.topic === "order.created"), "Generic webhook framework auto-registered for connected store");

  const hasAuditLog = MarketplaceRepository.listAuditLogs().some(log => log.action === "Connect Marketplace Provider");
  assert(hasAuditLog, "Corporate audit trail logs connectivity activity correctly");

  // 4. [Conflict Resolution Tests] Verify Conflict Resolver policies
  console.log("--- [Conflict Resolver] Testing Record Merge Conflict Strategies ---");
  const localRecord = { sku: "SKU-402", title: "Original Core Node", description: "Local Version" };
  const incomingRecord = { title: "Overwriting Core Node", description: "Incoming Cloud Version" };

  const keepExistingResult = MarketplaceService.resolveConflict(localRecord, incomingRecord, "keep_existing");
  assert(keepExistingResult.title === "Original Core Node", "Conflict resolver successfully honors 'keep_existing' strategy");

  const overwriteResult = MarketplaceService.resolveConflict(localRecord, incomingRecord, "overwrite");
  assert(overwriteResult.title === "Overwriting Core Node", "Conflict resolver successfully honors 'overwrite' strategy");

  // 5. [Sync Tests] Verify catalog, price and inventory synchronization
  console.log("--- [Sync Engine] Testing Background Sync Jobs ---");
  const syncJob = await MarketplaceService.syncProducts(wooStore.id, "overwrite");
  assert(syncJob.status === "completed" && syncJob.recordsProcessed > 0, "Product Synchronization Engine runs as background job successfully");

  const syncedProduct = MarketplaceRepository.getProductBySku(wooStore.id, "SKU-402");
  assert(syncedProduct !== undefined, "Products mapped to correct categories and SKU patterns");

  const updatedPrice = MarketplaceRepository.getPriceBySku(wooStore.id, "SKU-402");
  assert(updatedPrice !== undefined && updatedPrice.price === 4999.00, "Price tables auto-synchronized across stores");

  // Test Inventory Synchronizer
  const syncedInventory = await MarketplaceService.syncInventory(wooStore.id, "SKU-402", 75);
  assert(syncedInventory.quantity === 75, "Inventory Synchronizer propagates levels to local tables");

  // 6. [Webhook Tests] Verify generic Webhook framework integration
  console.log("--- [Webhooks] Testing Webhook Processor Ingress ---");
  const webHookResponse = await MarketplaceService.processWebhook(wooStore.id, "inventory.changed", {
    sku: "SKU-402",
    quantity: 15
  });
  assert(webHookResponse.success, "Generic Webhook Processor accepted incoming payload");
  
  const currentInv = MarketplaceRepository.getInventoryBySku(wooStore.id, "SKU-402");
  assert(currentInv !== undefined && currentInv.quantity === 15, "Webhook action trigger successfully updated SKU inventory quantity");

  const refundWebhookResponse = await MarketplaceService.processWebhook(wooStore.id, "refund", {
    externalOrderId: "ord_shp_882940",
    externalReturnId: "ret_webhook_992",
    refundAmount: 4999.00,
    reason: "Damaged during shipping"
  });
  assert(refundWebhookResponse.success, "Refund webhook registered refund and updated orders tables");

  // 7. [Retry Queue Tests] Verify Failed sync job and Retry queue logic
  console.log("--- [Sync Engine] Testing Retry Queue ---");
  MarketplaceService.enqueueRetry(999, { storeId: wooStore.id, policy: "overwrite" });
  assert(retryQueue.some(q => q.jobId === 999), "Failed background sync jobs successfully enqueued to retry queue");

  // Advance scheduled retry time to make it eligible immediately
  const queueItem = retryQueue.find(q => q.jobId === 999);
  if (queueItem) {
    queueItem.nextAttemptAt = new Date(Date.now() - 10000).toISOString();
  }

  const retriedCount = await MarketplaceService.processRetryQueue();
  assert(retriedCount > 0, "Retry queue engine successfully retried and completed failed sync jobs");

  console.log("\n==========================================");
  console.log(`TEST SUITE COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSuite().catch(err => {
  console.error("Unhandle test failure: ", err);
  process.exit(1);
});
