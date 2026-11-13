/**
 * Defaults for the Google Merchant Center primary product feed.
 * Shipping can also be configured in Merchant Center account settings;
 * the feed `shipping` column is a US fallback when MC shipping is empty.
 */

export const merchantFeedConfig = {
  targetCountry: "US",
  contentLanguage: "en",
  currency: "USD",
  /** Max additional images after the primary `image_link`. */
  maxAdditionalImages: 10,
  /**
   * Google product taxonomy path.
   * @see https://www.google.com/basepages/producttype/taxonomy.en-US.txt
   */
  googleProductCategory: "Vehicles & Parts > Vehicle Parts & Accessories",
  /**
   * Optional feed shipping attribute: `country:region:service:price`.
   * Leave empty to rely on Merchant Center shipping settings only.
   * Example: `US::Ground:0.00 USD` for free continental ground when policy matches.
   */
  shipping: "US::Ground:0.00 USD",
} as const;

export type MerchantFeedConfig = typeof merchantFeedConfig;
