/**
 * Defaults and category → Amazon product_type placeholders for FBM flat-file export.
 * Fill `product_type` / `template_sheet` with values from the Automotive inventory
 * template you download in Seller Central before creating new catalog listings.
 */

import { EXPERT_CATEGORY_TITLES } from "../src/lib/catalog/expertCategories";

export const amazonExportConfig = {
  marketplace: "US",
  currency: "USD",
  conditionType: "New",
  /** Business days before ship (FBM fulfillment latency). */
  fulfillmentLatency: 2,
  /**
   * Must match a shipping template name in Seller Central, or leave blank and
   * assign the default template after upload.
   */
  merchantShippingGroupName: "",
  /** Max secondary image columns (other_image_url1..N). */
  maxOtherImages: 8,
  /** Max bullet points derived from specs + fitment. */
  maxBulletPoints: 5,
  /** Max vehicles packed into the fitment bullet / description. */
  maxFitmentLines: 12,
} as const;

export type AmazonProductTypeMapping = {
  /** Our catalog category title (Sanity category or Convex category string). */
  categoryTitle: string;
  /**
   * Amazon product type / template sheet name from the downloaded flat file.
   * Leave empty until you map it in Seller Central’s Automotive template.
   */
  productType: string;
  templateSheet: string;
};

/**
 * Starter map — productType/templateSheet are placeholders you fill once from
 * Seller Central → Catalog → Add products via upload → Inventory File Template.
 */
export const categoryProductTypeMap: AmazonProductTypeMapping[] = EXPERT_CATEGORY_TITLES.map(
  (categoryTitle) => ({ categoryTitle, productType: "", templateSheet: "" }),
);

export function resolveProductType(categoryTitles: string[]): AmazonProductTypeMapping | null {
  for (const title of categoryTitles) {
    const hit = categoryProductTypeMap.find(
      (row) => row.categoryTitle.toLowerCase() === title.toLowerCase(),
    );
    if (hit) return hit;
  }
  return null;
}
