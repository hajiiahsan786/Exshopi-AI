import {
  MarketplaceProvider,
  MarketplaceAccount,
  MarketplaceStore,
  MarketplaceCredential,
  MarketplaceRegion,
  MarketplaceProduct,
  MarketplaceCategory,
  MarketplaceOrder,
  MarketplaceOrderItem,
  MarketplaceCustomer,
  MarketplaceInventory,
  MarketplacePrice,
  MarketplaceShipment,
  MarketplaceReturn,
  MarketplaceSyncJob,
  MarketplaceWebhook,
  MarketplaceEvent,
  MarketplaceLog,
  MarketplaceAuditLog
} from "../../src/types";

import {
  marketplaceProviders,
  marketplaceAccounts,
  marketplaceStores,
  marketplaceCredentials,
  marketplaceRegions,
  marketplaceProducts,
  marketplaceCategories,
  marketplaceOrders,
  marketplaceOrderItems,
  marketplaceCustomers,
  marketplaceInventories,
  marketplacePrices,
  marketplaceShipments,
  marketplaceReturns,
  marketplaceSyncJobs,
  marketplaceWebhooks,
  marketplaceEvents,
  marketplaceLogs,
  marketplaceAuditLogs,
  logMarketplaceAudit
} from "../db";

export class MarketplaceRepository {
  // 1. MarketplaceProvider
  static listProviders(): MarketplaceProvider[] {
    return marketplaceProviders;
  }

  static getProviderById(id: number): MarketplaceProvider | undefined {
    return marketplaceProviders.find(p => p.id === id);
  }

  static getProviderByCode(code: string): MarketplaceProvider | undefined {
    return marketplaceProviders.find(p => p.code.toLowerCase() === code.toLowerCase());
  }

  // 2. MarketplaceAccount
  static listAccounts(): MarketplaceAccount[] {
    return marketplaceAccounts;
  }

  static getAccountById(id: number): MarketplaceAccount | undefined {
    return marketplaceAccounts.find(a => a.id === id);
  }

  static createAccount(account: Omit<MarketplaceAccount, "id" | "createdAt" | "updatedAt">): MarketplaceAccount {
    const now = new Date().toISOString();
    const newAccount: MarketplaceAccount = {
      id: marketplaceAccounts.length + 1,
      ...account,
      createdAt: now,
      updatedAt: now
    };
    marketplaceAccounts.push(newAccount);
    return newAccount;
  }

  static updateAccount(id: number, updates: Partial<Omit<MarketplaceAccount, "id" | "createdAt">>): MarketplaceAccount | undefined {
    const account = this.getAccountById(id);
    if (!account) return undefined;
    Object.assign(account, updates);
    account.updatedAt = new Date().toISOString();
    return account;
  }

  static deleteAccount(id: number): boolean {
    const index = marketplaceAccounts.findIndex(a => a.id === id);
    if (index === -1) return false;
    marketplaceAccounts.splice(index, 1);
    return true;
  }

  // 3. MarketplaceStore
  static listStores(accountId?: number): MarketplaceStore[] {
    if (accountId !== undefined) {
      return marketplaceStores.filter(s => s.accountId === accountId);
    }
    return marketplaceStores;
  }

  static getStoreById(id: number): MarketplaceStore | undefined {
    return marketplaceStores.find(s => s.id === id);
  }

  static createStore(store: Omit<MarketplaceStore, "id">): MarketplaceStore {
    const newStore: MarketplaceStore = {
      id: marketplaceStores.length + 1,
      ...store
    };
    marketplaceStores.push(newStore);
    return newStore;
  }

  static updateStore(id: number, updates: Partial<Omit<MarketplaceStore, "id">>): MarketplaceStore | undefined {
    const store = this.getStoreById(id);
    if (!store) return undefined;
    Object.assign(store, updates);
    return store;
  }

  static deleteStore(id: number): boolean {
    const index = marketplaceStores.findIndex(s => s.id === id);
    if (index === -1) return false;
    marketplaceStores.splice(index, 1);
    return true;
  }

  // 4. MarketplaceCredential
  static listCredentials(accountId: number): MarketplaceCredential[] {
    return marketplaceCredentials.filter(c => c.accountId === accountId);
  }

  static setCredential(accountId: number, key: string, value: string): MarketplaceCredential {
    const existing = marketplaceCredentials.find(c => c.accountId === accountId && c.credentialKey === key);
    if (existing) {
      existing.credentialValue = value;
      return existing;
    }
    const newCred: MarketplaceCredential = {
      id: marketplaceCredentials.length + 1,
      accountId,
      credentialKey: key,
      credentialValue: value
    };
    marketplaceCredentials.push(newCred);
    return newCred;
  }

  // 5. MarketplaceRegion
  static listRegions(providerId?: number): MarketplaceRegion[] {
    if (providerId !== undefined) {
      return marketplaceRegions.filter(r => r.providerId === providerId);
    }
    return marketplaceRegions;
  }

  // 6. MarketplaceProduct
  static listProducts(filter: { storeId?: number; sku?: string; search?: string } = {}, page = 1, limit = 10) {
    let result = [...marketplaceProducts];
    if (filter.storeId !== undefined) {
      result = result.filter(p => p.storeId === filter.storeId);
    }
    if (filter.sku) {
      result = result.filter(p => p.sku.toLowerCase() === filter.sku!.toLowerCase());
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    const total = result.length;
    const startIndex = (page - 1) * limit;
    const items = result.slice(startIndex, startIndex + limit);
    return { items, total, page, limit };
  }

  static getProductById(id: number): MarketplaceProduct | undefined {
    return marketplaceProducts.find(p => p.id === id);
  }

  static getProductByExternalId(storeId: number, externalId: string): MarketplaceProduct | undefined {
    return marketplaceProducts.find(p => p.storeId === storeId && p.externalProductId === externalId);
  }

  static getProductBySku(storeId: number, sku: string): MarketplaceProduct | undefined {
    return marketplaceProducts.find(p => p.storeId === storeId && p.sku.toLowerCase() === sku.toLowerCase());
  }

  static createProduct(product: Omit<MarketplaceProduct, "id" | "createdAt" | "updatedAt">): MarketplaceProduct {
    const now = new Date().toISOString();
    const newProduct: MarketplaceProduct = {
      id: marketplaceProducts.length + 1,
      ...product,
      createdAt: now,
      updatedAt: now
    };
    marketplaceProducts.push(newProduct);
    return newProduct;
  }

  static updateProduct(id: number, updates: Partial<Omit<MarketplaceProduct, "id" | "createdAt">>): MarketplaceProduct | undefined {
    const product = this.getProductById(id);
    if (!product) return undefined;
    Object.assign(product, updates);
    product.updatedAt = new Date().toISOString();
    return product;
  }

  static deleteProduct(id: number): boolean {
    const index = marketplaceProducts.findIndex(p => p.id === id);
    if (index === -1) return false;
    marketplaceProducts.splice(index, 1);
    return true;
  }

  // 7. MarketplaceCategory
  static listCategories(storeId?: number): MarketplaceCategory[] {
    if (storeId !== undefined) {
      return marketplaceCategories.filter(c => c.storeId === storeId);
    }
    return marketplaceCategories;
  }

  static createCategory(category: Omit<MarketplaceCategory, "id">): MarketplaceCategory {
    const newCategory: MarketplaceCategory = {
      id: marketplaceCategories.length + 1,
      ...category
    };
    marketplaceCategories.push(newCategory);
    return newCategory;
  }

  // 8. MarketplaceOrder
  static listOrders(filter: { storeId?: number; status?: string } = {}, page = 1, limit = 10) {
    let result = [...marketplaceOrders];
    if (filter.storeId !== undefined) {
      result = result.filter(o => o.storeId === filter.storeId);
    }
    if (filter.status) {
      result = result.filter(o => o.status.toLowerCase() === filter.status!.toLowerCase());
    }
    const total = result.length;
    const startIndex = (page - 1) * limit;
    const items = result.slice(startIndex, startIndex + limit);
    return { items, total, page, limit };
  }

  static getOrderById(id: number): MarketplaceOrder | undefined {
    return marketplaceOrders.find(o => o.id === id);
  }

  static getOrderByExternalId(storeId: number, externalId: string): MarketplaceOrder | undefined {
    return marketplaceOrders.find(o => o.storeId === storeId && o.externalOrderId === externalId);
  }

  static createOrder(order: Omit<MarketplaceOrder, "id" | "createdAt" | "updatedAt">): MarketplaceOrder {
    const now = new Date().toISOString();
    const newOrder: MarketplaceOrder = {
      id: marketplaceOrders.length + 1,
      ...order,
      createdAt: now,
      updatedAt: now
    };
    marketplaceOrders.push(newOrder);
    return newOrder;
  }

  static updateOrder(id: number, updates: Partial<Omit<MarketplaceOrder, "id" | "createdAt">>): MarketplaceOrder | undefined {
    const order = this.getOrderById(id);
    if (!order) return undefined;
    Object.assign(order, updates);
    order.updatedAt = new Date().toISOString();
    return order;
  }

  // 9. MarketplaceOrderItem
  static listOrderItems(orderId: number): MarketplaceOrderItem[] {
    return marketplaceOrderItems.filter(i => i.orderId === orderId);
  }

  static createOrderItem(item: Omit<MarketplaceOrderItem, "id">): MarketplaceOrderItem {
    const newItem: MarketplaceOrderItem = {
      id: marketplaceOrderItems.length + 1,
      ...item
    };
    marketplaceOrderItems.push(newItem);
    return newItem;
  }

  // 10. MarketplaceCustomer
  static listCustomers(storeId?: number): MarketplaceCustomer[] {
    if (storeId !== undefined) {
      return marketplaceCustomers.filter(c => c.storeId === storeId);
    }
    return marketplaceCustomers;
  }

  static getCustomerById(id: number): MarketplaceCustomer | undefined {
    return marketplaceCustomers.find(c => c.id === id);
  }

  static getCustomerByExternalId(storeId: number, externalId: string): MarketplaceCustomer | undefined {
    return marketplaceCustomers.find(c => c.storeId === storeId && c.externalCustomerId === externalId);
  }

  static createCustomer(customer: Omit<MarketplaceCustomer, "id" | "createdAt">): MarketplaceCustomer {
    const newCustomer: MarketplaceCustomer = {
      id: marketplaceCustomers.length + 1,
      ...customer,
      createdAt: new Date().toISOString()
    };
    marketplaceCustomers.push(newCustomer);
    return newCustomer;
  }

  // 11. MarketplaceInventory
  static listInventories(storeId?: number): MarketplaceInventory[] {
    if (storeId !== undefined) {
      return marketplaceInventories.filter(i => i.storeId === storeId);
    }
    return marketplaceInventories;
  }

  static getInventoryBySku(storeId: number, sku: string): MarketplaceInventory | undefined {
    return marketplaceInventories.find(i => i.storeId === storeId && i.sku.toLowerCase() === sku.toLowerCase());
  }

  static createInventory(inventory: Omit<MarketplaceInventory, "id" | "updatedAt">): MarketplaceInventory {
    const newInv: MarketplaceInventory = {
      id: marketplaceInventories.length + 1,
      ...inventory,
      updatedAt: new Date().toISOString()
    };
    marketplaceInventories.push(newInv);
    return newInv;
  }

  static updateInventory(storeId: number, sku: string, quantity: number, reservedQuantity?: number): MarketplaceInventory {
    let inv = this.getInventoryBySku(storeId, sku);
    if (!inv) {
      inv = this.createInventory({ storeId, sku, quantity, reservedQuantity: reservedQuantity || 0 });
    } else {
      inv.quantity = quantity;
      if (reservedQuantity !== undefined) {
        inv.reservedQuantity = reservedQuantity;
      }
      inv.updatedAt = new Date().toISOString();
    }
    return inv;
  }

  // 12. MarketplacePrice
  static listPrices(storeId?: number): MarketplacePrice[] {
    if (storeId !== undefined) {
      return marketplacePrices.filter(p => p.storeId === storeId);
    }
    return marketplacePrices;
  }

  static getPriceBySku(storeId: number, sku: string): MarketplacePrice | undefined {
    return marketplacePrices.find(p => p.storeId === storeId && p.sku.toLowerCase() === sku.toLowerCase());
  }

  static createPrice(price: Omit<MarketplacePrice, "id" | "updatedAt">): MarketplacePrice {
    const newPrice: MarketplacePrice = {
      id: marketplacePrices.length + 1,
      ...price,
      updatedAt: new Date().toISOString()
    };
    marketplacePrices.push(newPrice);
    return newPrice;
  }

  static updatePrice(storeId: number, sku: string, price: number, compareAtPrice?: number, currency = "USD"): MarketplacePrice {
    let p = this.getPriceBySku(storeId, sku);
    if (!p) {
      p = this.createPrice({ storeId, sku, price, compareAtPrice, currency });
    } else {
      p.price = price;
      if (compareAtPrice !== undefined) {
        p.compareAtPrice = compareAtPrice;
      }
      p.currency = currency;
      p.updatedAt = new Date().toISOString();
    }
    return p;
  }

  // 13. MarketplaceShipment
  static listShipments(orderId?: number): MarketplaceShipment[] {
    if (orderId !== undefined) {
      return marketplaceShipments.filter(s => s.orderId === orderId);
    }
    return marketplaceShipments;
  }

  static getShipmentByExternalId(externalId: string): MarketplaceShipment | undefined {
    return marketplaceShipments.find(s => s.externalShipmentId === externalId);
  }

  static createShipment(shipment: Omit<MarketplaceShipment, "id">): MarketplaceShipment {
    const newShip: MarketplaceShipment = {
      id: marketplaceShipments.length + 1,
      ...shipment
    };
    marketplaceShipments.push(newShip);
    return newShip;
  }

  // 14. MarketplaceReturn
  static listReturns(orderId?: number): MarketplaceReturn[] {
    if (orderId !== undefined) {
      return marketplaceReturns.filter(r => r.orderId === orderId);
    }
    return marketplaceReturns;
  }

  static getReturnByExternalId(externalId: string): MarketplaceReturn | undefined {
    return marketplaceReturns.find(r => r.externalReturnId === externalId);
  }

  static createReturn(ret: Omit<MarketplaceReturn, "id" | "createdAt">): MarketplaceReturn {
    const newReturn: MarketplaceReturn = {
      id: marketplaceReturns.length + 1,
      ...ret,
      createdAt: new Date().toISOString()
    };
    marketplaceReturns.push(newReturn);
    return newReturn;
  }

  // 15. MarketplaceSyncJob
  static listSyncJobs(storeId?: number): MarketplaceSyncJob[] {
    if (storeId !== undefined) {
      return marketplaceSyncJobs.filter(j => j.storeId === storeId);
    }
    return marketplaceSyncJobs;
  }

  static getSyncJobById(id: number): MarketplaceSyncJob | undefined {
    return marketplaceSyncJobs.find(j => j.id === id);
  }

  static createSyncJob(job: Omit<MarketplaceSyncJob, "id">): MarketplaceSyncJob {
    const newJob: MarketplaceSyncJob = {
      id: marketplaceSyncJobs.length + 1,
      ...job
    };
    marketplaceSyncJobs.push(newJob);
    return newJob;
  }

  static updateSyncJob(id: number, updates: Partial<Omit<MarketplaceSyncJob, "id">>): MarketplaceSyncJob | undefined {
    const job = this.getSyncJobById(id);
    if (!job) return undefined;
    Object.assign(job, updates);
    return job;
  }

  // 16. MarketplaceWebhook
  static listWebhooks(storeId?: number): MarketplaceWebhook[] {
    if (storeId !== undefined) {
      return marketplaceWebhooks.filter(w => w.storeId === storeId);
    }
    return marketplaceWebhooks;
  }

  static createWebhook(wh: Omit<MarketplaceWebhook, "id">): MarketplaceWebhook {
    const newWh: MarketplaceWebhook = {
      id: marketplaceWebhooks.length + 1,
      ...wh
    };
    marketplaceWebhooks.push(newWh);
    return newWh;
  }

  // 17. MarketplaceEvent
  static listEvents(storeId?: number): MarketplaceEvent[] {
    if (storeId !== undefined) {
      return marketplaceEvents.filter(e => e.storeId === storeId);
    }
    return marketplaceEvents;
  }

  static createEvent(event: Omit<MarketplaceEvent, "id" | "createdAt">): MarketplaceEvent {
    const newEvent: MarketplaceEvent = {
      id: marketplaceEvents.length + 1,
      ...event,
      createdAt: new Date().toISOString()
    };
    marketplaceEvents.push(newEvent);
    return newEvent;
  }

  static updateEvent(id: number, updates: Partial<Omit<MarketplaceEvent, "id" | "createdAt">>): MarketplaceEvent | undefined {
    const ev = marketplaceEvents.find(e => e.id === id);
    if (!ev) return undefined;
    Object.assign(ev, updates);
    return ev;
  }

  // 18. MarketplaceLog
  static listLogs(storeId?: number): MarketplaceLog[] {
    if (storeId !== undefined) {
      return marketplaceLogs.filter(l => l.storeId === storeId);
    }
    return marketplaceLogs;
  }

  static createLog(log: Omit<MarketplaceLog, "id" | "timestamp">): MarketplaceLog {
    const newLog: MarketplaceLog = {
      id: marketplaceLogs.length + 1,
      ...log,
      timestamp: new Date().toISOString()
    };
    marketplaceLogs.push(newLog);
    return newLog;
  }

  // 19. MarketplaceAuditLog
  static listAuditLogs(): MarketplaceAuditLog[] {
    return marketplaceAuditLogs;
  }

  static createAuditLog(log: Omit<MarketplaceAuditLog, "id" | "timestamp">): MarketplaceAuditLog {
    const newLog = logMarketplaceAudit(log.employeeId, log.action, log.details, log.permissionChecked);
    return newLog;
  }
}
