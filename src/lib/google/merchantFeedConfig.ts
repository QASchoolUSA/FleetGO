import { shippingConfig } from "@/lib/shipping/config";

/**
 * Defaults for the Google Merchant Center primary product feed.
 * Shipping costs are configured in Merchant Center using package attributes.
 */

export const merchantFeedConfig = {
  targetCountry: "US",
  contentLanguage: "en",
  currency: "USD",
  /** Max additional images after the primary `image_link`. */
  maxAdditionalImages: 10,
  /** Always use the production storefront host in Merchant Center item links. */
  siteUrl: "https://www.fleetgollc.com",
  /**
   * Google product taxonomy path.
   * @see https://www.google.com/basepages/producttype/taxonomy.en-US.txt
   */
  googleProductCategory: "Vehicles & Parts > Vehicle Parts & Accessories",
  shippingOriginZip: shippingConfig.originZip,
  shippingService: shippingConfig.service,
} as const;

export type MerchantFeedConfig = typeof merchantFeedConfig;

