/**
 * Canonical storefront / inventory category titles.
 * Keep in sync with Inventory-Management-System `CATALOG_VERIFIED` categories
 * and `scripts/amazon-export-config.ts` `categoryProductTypeMap`.
 */

export const EXPERT_CATEGORY_TITLES = [
  "Fuel System — Throttle Bodies",
  "Fuel System — Fuel Pumps & Modules",
  "Steering — Rack & Pinion",
  "Steering — Tie Rod Ends",
  "Transmission — Filters & Kits",
  "Wheel End — Hub Caps",
  "Wheel End — Hub Assemblies",
  "Driveline — U-Joints",
  "Brakes — Rotors",
  "Brakes — Hardware Kits",
  "Trailer / Towing — Couplers",
  "Trailer / Towing — Hitches",
  "Trailer / Towing — Electrical",
  "Exhaust — Heat Protection",
  "HVAC — Control Modules",
  "Suspension — Control Arms",
  "Suspension — Sway Bar Links",
  "Suspension — Trailing Arms",
  "Suspension — Struts & Shocks",
  "Suspension — Bushings",
  "Suspension — Ball Joints",
  "Steering — Pitman Arms",
  "Engine — Intake Manifolds",
  "Engine — Mounts",
  "Transmission — Mounts",
  "Lighting — CHMSL / Third Brake Lights",
  "Electrical — Body Control Modules",
  "Wipers & Washers — Reservoirs",
  "Hydraulics — Hose Couplings / Fittings",
  "Hydraulics — Ferrules",
  "Emissions — EVAP / Canister Vent Valves",
  "Clutch — Hydraulics",
  "Trailer / Towing — Hitch Balls",
  "Trailer / Towing — Hitch Covers & Accessories",
  "Brakes — Master Cylinders",
  "Driveline — Differential Components",
  "Ignition — Spark Plugs",
  "Ignition — Conversion Kits",
  "Engine — Crankshaft Seals",
  "Cooling & Heating — Heater Pipes & Hoses",
  "Body & Hardware — Clips & Retainers",
  "Body & Hardware — Fasteners & Screws",
  "Suspension — Air Springs",
  "Tools & Shop — Hand Tools & Hardware",
  "Fuel System — Carburetor Rebuild Kits",
  "Driveline — CV Joint Boot Kits",
] as const;

export type ExpertCategoryTitle = (typeof EXPERT_CATEGORY_TITLES)[number];

/** Known bad barcode-API / short leaf titles → expert category. */
export const CATEGORY_ALIASES: Record<string, ExpertCategoryTitle> = {
  "bicycle wheel parts": "Wheel End — Hub Assemblies",
  "canister vent valves": "Emissions — EVAP / Canister Vent Valves",
  "third brake lights": "Lighting — CHMSL / Third Brake Lights",
  "chmsl / third brake lights": "Lighting — CHMSL / Third Brake Lights",
  fittings: "Hydraulics — Hose Couplings / Fittings",
  "hose couplings / fittings": "Hydraulics — Hose Couplings / Fittings",
  "towing — couplers": "Trailer / Towing — Couplers",
  "towing — hitches": "Trailer / Towing — Hitches",
  "towing — electrical": "Trailer / Towing — Electrical",
  "towing couplers": "Trailer / Towing — Couplers",
  "towing hitches": "Trailer / Towing — Hitches",
  "towing electrical": "Trailer / Towing — Electrical",
  ignition: "Ignition — Spark Plugs",
  "spark plugs": "Ignition — Spark Plugs",
  "crankshaft seals": "Engine — Crankshaft Seals",
  "air springs": "Suspension — Air Springs",
  "clips & retainers": "Body & Hardware — Clips & Retainers",
  "fasteners & screws": "Body & Hardware — Fasteners & Screws",
  "carburetor rebuild kits": "Fuel System — Carburetor Rebuild Kits",
  "cv joint boot kits": "Driveline — CV Joint Boot Kits",
};

function normalizeKey(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\u2014/g, "—")
    .replace(/\s+/g, " ");
}

/**
 * Resolve an incoming inventory/API category string to an expert title.
 * Returns null when the value is junk taxonomy that must not create a Sanity category.
 */
export function resolveExpertCategoryTitle(
  categoryName?: string | null,
): ExpertCategoryTitle | null {
  const raw = categoryName?.trim();
  if (!raw) return null;

  const exact = EXPERT_CATEGORY_TITLES.find(
    (title) => normalizeKey(title) === normalizeKey(raw),
  );
  if (exact) return exact;

  const alias = CATEGORY_ALIASES[normalizeKey(raw)];
  if (alias) return alias;

  // Path-like Google / barcode taxonomy: "Automotive > Filters" or deeper junk.
  if (/[>/|,]/.test(raw)) {
    const leaf =
      raw
        .split(/[>/|,]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .pop() || raw;
    const leafExact = EXPERT_CATEGORY_TITLES.find(
      (title) => normalizeKey(title) === normalizeKey(leaf),
    );
    if (leafExact) return leafExact;
    const leafAlias = CATEGORY_ALIASES[normalizeKey(leaf)];
    if (leafAlias) return leafAlias;
    return null;
  }

  // Short leaf that matches the part after " — " of an expert title.
  const bySuffix = EXPERT_CATEGORY_TITLES.find((title) => {
    const parts = title.split("—").map((s) => s.trim());
    const leaf = parts[parts.length - 1] || title;
    return normalizeKey(leaf) === normalizeKey(raw);
  });
  if (bySuffix) return bySuffix;

  return null;
}
