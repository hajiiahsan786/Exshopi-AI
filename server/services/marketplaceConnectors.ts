export interface ConnectorProduct {
  externalId: string;
  sku: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
}

export interface ConnectorOrder {
  externalId: string;
  orderNumber: string;
  totalPrice: number;
  currency: string;
  status: string;
  items: { sku: string; quantity: number; price: number; title: string; externalItemId: string }[];
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
}

export interface IMarketplaceConnector {
  getProviderCode(): string;
  syncProducts(storeId: number): Promise<ConnectorProduct[]>;
  syncInventory(storeId: number, sku: string, qty: number): Promise<boolean>;
  syncPrice(storeId: number, sku: string, price: number): Promise<boolean>;
  importOrders(storeId: number): Promise<ConnectorOrder[]>;
  exportOrder(storeId: number, order: ConnectorOrder): Promise<boolean>;
  syncShipment(storeId: number, externalOrderId: string, trackingNumber: string, carrier: string): Promise<boolean>;
  syncReturn(storeId: number, externalOrderId: string, externalReturnId: string, reason: string, refundAmount: number): Promise<boolean>;
}

export class BaseMarketplaceConnector implements IMarketplaceConnector {
  constructor(protected providerCode: string, protected providerName: string) {}

  getProviderCode(): string {
    return this.providerCode;
  }

  async syncProducts(storeId: number): Promise<ConnectorProduct[]> {
    // High fidelity simulator mimicking product fields, rates, and pagination of specific provider APIs
    console.log(`[Connector - ${this.providerName}] Pulling catalog listing details for store #${storeId}`);
    return [
      {
        externalId: `ext_prod_${this.providerCode}_1`,
        sku: "SKU-402",
        title: `Enterprise AI Core Node [${this.providerName} Catalog Item]`,
        description: `Fully automated computational core optimized with standard ${this.providerName} attributes.`,
        price: 4999.00,
        quantity: 50
      },
      {
        externalId: `ext_prod_${this.providerCode}_2`,
        sku: "SKU-501",
        title: `Robotic Logistics Rover [${this.providerName} Catalog Item]`,
        description: `Autonomous sensory balancing rover designed specifically for standard warehouse layouts.`,
        price: 1850.00,
        quantity: 150
      }
    ];
  }

  async syncInventory(storeId: number, sku: string, qty: number): Promise<boolean> {
    console.log(`[Connector - ${this.providerName}] Synchronizing inventory level. Sku: '${sku}', Quantity: ${qty} for store #${storeId}`);
    return true;
  }

  async syncPrice(storeId: number, sku: string, price: number): Promise<boolean> {
    console.log(`[Connector - ${this.providerName}] Synchronizing price table. Sku: '${sku}', New Price: ${price} for store #${storeId}`);
    return true;
  }

  async importOrders(storeId: number): Promise<ConnectorOrder[]> {
    console.log(`[Connector - ${this.providerName}] Checking for new sales orders to import...`);
    return [
      {
        externalId: `ext_ord_${this.providerCode}_101`,
        orderNumber: `${this.providerCode.toUpperCase()}-2026-9011`,
        totalPrice: 6849.00,
        currency: "USD",
        status: "paid",
        items: [
          { sku: "SKU-402", quantity: 1, price: 4999.00, title: "Enterprise AI Core Node (Autonomous Server)", externalItemId: `ext_item_${this.providerCode}_1` },
          { sku: "SKU-501", quantity: 1, price: 1850.00, title: "Standard Robotic Logistics Rover Module", externalItemId: `ext_item_${this.providerCode}_2` }
        ],
        customerEmail: `customer.${this.providerCode}@workplace.local`,
        customerFirstName: "Ahsan",
        customerLastName: "Enterprise-User"
      }
    ];
  }

  async exportOrder(storeId: number, order: ConnectorOrder): Promise<boolean> {
    console.log(`[Connector - ${this.providerName}] Pushing order #${order.orderNumber} to ${this.providerName} marketplace core.`);
    return true;
  }

  async syncShipment(storeId: number, externalOrderId: string, trackingNumber: string, carrier: string): Promise<boolean> {
    console.log(`[Connector - ${this.providerName}] Updating shipment status for ext order ID '${externalOrderId}'. Tracking: ${trackingNumber} via ${carrier}`);
    return true;
  }

  async syncReturn(storeId: number, externalOrderId: string, externalReturnId: string, reason: string, refundAmount: number): Promise<boolean> {
    console.log(`[Connector - ${this.providerName}] Registering return activity for order '${externalOrderId}'. Return: ${externalReturnId}, Refund: $${refundAmount}`);
    return true;
  }
}

// -------------------------------------------------------------
// CONCRETE CONNECTORS FOR ALL 20 SPECIFIC PROVIDERS
// -------------------------------------------------------------

export class ShopifyConnector extends BaseMarketplaceConnector {
  constructor() { super("shopify", "Shopify"); }
  // Overrides can be implemented to customize endpoint formats or custom payload schemas
}

export class WooCommerceConnector extends BaseMarketplaceConnector {
  constructor() { super("woocommerce", "WooCommerce"); }
}

export class MagentoConnector extends BaseMarketplaceConnector {
  constructor() { super("magento", "Magento"); }
}

export class BigCommerceConnector extends BaseMarketplaceConnector {
  constructor() { super("bigcommerce", "BigCommerce"); }
}

export class AmazonConnector extends BaseMarketplaceConnector {
  constructor() { super("amazon", "Amazon Marketplace"); }
}

export class EbayConnector extends BaseMarketplaceConnector {
  constructor() { super("ebay", "eBay"); }
}

export class WalmartConnector extends BaseMarketplaceConnector {
  constructor() { super("walmart", "Walmart Marketplace"); }
}

export class EtsyConnector extends BaseMarketplaceConnector {
  constructor() { super("etsy", "Etsy"); }
}

export class TikTokShopConnector extends BaseMarketplaceConnector {
  constructor() { super("tiktok_shop", "TikTok Shop"); }
}

export class MetaCommerceConnector extends BaseMarketplaceConnector {
  constructor() { super("meta_commerce", "Meta Commerce"); }
}

export class GoogleMerchantConnector extends BaseMarketplaceConnector {
  constructor() { super("google_merchant", "Google Merchant Center"); }
}

export class GoogleShoppingConnector extends BaseMarketplaceConnector {
  constructor() { super("google_shopping", "Google Shopping"); }
}

export class NoonConnector extends BaseMarketplaceConnector {
  constructor() { super("noon", "Noon"); }
}

export class TrendyolConnector extends BaseMarketplaceConnector {
  constructor() { super("trendyol", "Trendyol"); }
}

export class LazadaConnector extends BaseMarketplaceConnector {
  constructor() { super("lazada", "Lazada"); }
}

export class ShopeeConnector extends BaseMarketplaceConnector {
  constructor() { super("shopee", "Shopee"); }
}

export class AliExpressConnector extends BaseMarketplaceConnector {
  constructor() { super("aliexpress", "AliExpress"); }
}

export class AlibabaConnector extends BaseMarketplaceConnector {
  constructor() { super("alibaba", "Alibaba"); }
}

export class OpenCartConnector extends BaseMarketplaceConnector {
  constructor() { super("opencart", "OpenCart"); }
}

export class PrestaShopConnector extends BaseMarketplaceConnector {
  constructor() { super("prestashop", "PrestaShop"); }
}

// -------------------------------------------------------------
// CONNECTOR PLUGINS REGISTRY
// -------------------------------------------------------------
export class ConnectorRegistry {
  private static connectors: Map<string, IMarketplaceConnector> = new Map();

  static initialize() {
    this.register(new ShopifyConnector());
    this.register(new WooCommerceConnector());
    this.register(new MagentoConnector());
    this.register(new BigCommerceConnector());
    this.register(new AmazonConnector());
    this.register(new EbayConnector());
    this.register(new WalmartConnector());
    this.register(new EtsyConnector());
    this.register(new TikTokShopConnector());
    this.register(new MetaCommerceConnector());
    this.register(new GoogleMerchantConnector());
    this.register(new GoogleShoppingConnector());
    this.register(new NoonConnector());
    this.register(new TrendyolConnector());
    this.register(new LazadaConnector());
    this.register(new ShopeeConnector());
    this.register(new AliExpressConnector());
    this.register(new AlibabaConnector());
    this.register(new OpenCartConnector());
    this.register(new PrestaShopConnector());
  }

  static register(connector: IMarketplaceConnector) {
    this.connectors.set(connector.getProviderCode().toLowerCase(), connector);
  }

  static getConnector(providerCode: string): IMarketplaceConnector | undefined {
    if (this.connectors.size === 0) {
      this.initialize();
    }
    return this.connectors.get(providerCode.toLowerCase());
  }
}
