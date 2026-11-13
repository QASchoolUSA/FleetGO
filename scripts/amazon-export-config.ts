/**
 * Defaults and category → Amazon product_type placeholders for FBM flat-file export.
 * Fill `product_type` / `template_sheet` with values from the Automotive inventory
 * template you download in Seller Central before creating new catalog listings.
 */

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
export const categoryProductTypeMap: AmazonProductTypeMapping[] = [
  { categoryTitle: "Fuel System — Throttle Bodies", productType: "", templateSheet: "" },
  { categoryTitle: "Fuel System — Fuel Pumps & Modules", productType: "", templateSheet: "" },
  { categoryTitle: "Steering — Rack & Pinion", productType: "", templateSheet: "" },
  { categoryTitle: "Steering — Tie Rod Ends", productType: "", templateSheet: "" },
  { categoryTitle: "Transmission — Filters & Kits", productType: "", templateSheet: "" },
  { categoryTitle: "Wheel End — Hub Caps", productType: "", templateSheet: "" },
  { categoryTitle: "Wheel End — Hub Assemblies", productType: "", templateSheet: "" },
  { categoryTitle: "Driveline — U-Joints", productType: "", templateSheet: "" },
  { categoryTitle: "Brakes — Rotors", productType: "", templateSheet: "" },
  { categoryTitle: "Brakes — Hardware Kits", productType: "", templateSheet: "" },
  { categoryTitle: "Trailer / Towing — Couplers", productType: "", templateSheet: "" },
  { categoryTitle: "Trailer / Towing — Hitches", productType: "", templateSheet: "" },
  { categoryTitle: "Trailer / Towing — Electrical", productType: "", templateSheet: "" },
  { categoryTitle: "Exhaust — Heat Protection", productType: "", templateSheet: "" },
  { categoryTitle: "HVAC — Control Modules", productType: "", templateSheet: "" },
  { categoryTitle: "Suspension — Control Arms", productType: "", templateSheet: "" },
  { categoryTitle: "Suspension — Sway Bar Links", productType: "", templateSheet: "" },
  { categoryTitle: "Suspension — Trailing Arms", productType: "", templateSheet: "" },
  { categoryTitle: "Engine — Intake Manifolds", productType: "", templateSheet: "" },
  { categoryTitle: "Lighting — CHMSL / Third Brake Lights", productType: "", templateSheet: "" },
  { categoryTitle: "Electrical — Body Control Modules", productType: "", templateSheet: "" },
  { categoryTitle: "Wipers & Washers — Reservoirs", productType: "", templateSheet: "" },
  { categoryTitle: "Hydraulics — Hose Couplings / Fittings", productType: "", templateSheet: "" },
  { categoryTitle: "Hydraulics — Ferrules", productType: "", templateSheet: "" },
  { categoryTitle: "Emissions — EVAP / Canister Vent Valves", productType: "", templateSheet: "" },
  { categoryTitle: "Clutch — Hydraulics", productType: "", templateSheet: "" },
];

export function resolveProductType(categoryTitles: string[]): AmazonProductTypeMapping | null {
  for (const title of categoryTitles) {
    const hit = categoryProductTypeMap.find(
      (row) => row.categoryTitle.toLowerCase() === title.toLowerCase(),
    );
    if (hit) return hit;
  }
  return null;
}
