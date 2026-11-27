import rawProfiles from "./product-package-profiles.json";
import type { CatalogProduct } from "@/lib/catalog/types";

export type PackageConfidence = "high" | "medium" | "low";

export type PackageProfile = {
  sourceSku: string;
  sourceTitle: string;
  weightLb: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  confidence: PackageConfidence;
  weightBasis: string;
  dimensionsBasis: string;
  shippingLabel: string;
};

const profiles = rawProfiles as Omit<PackageProfile, "shippingLabel">[];

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

function labelForProfile(profile: Omit<PackageProfile, "shippingLabel">): string {
  // USPS rounds each package dimension up to whole inches before classifying it.
  const dimensions = [profile.lengthIn, profile.widthIn, profile.heightIn].map(Math.ceil);
  const longest = Math.max(...dimensions);
  const volumeCubicFeet = (dimensions[0] * dimensions[1] * dimensions[2]) / 1728;
  const over22 = longest > 22;
  const over30 = longest > 30;
  const over2CubicFeet = volumeCubicFeet > 2;

  if (over30 && over2CubicFeet) return "usps_ga_gt30_gt2cuft";
  if (over2CubicFeet && over22) return "usps_ga_22_30_gt2cuft";
  if (over30) return "usps_ga_gt30";
  if (over22) return "usps_ga_22_30";
  if (over2CubicFeet) return "usps_ga_gt2cuft";
  return "usps_ga_standard";
}

const bySku = new Map<string, Omit<PackageProfile, "shippingLabel">[]>();
const byTitle = new Map<string, Omit<PackageProfile, "shippingLabel">[]>();

for (const profile of profiles) {
  const sku = normalize(profile.sourceSku);
  const title = normalize(profile.sourceTitle);
  bySku.set(sku, [...(bySku.get(sku) || []), profile]);
  byTitle.set(title, [...(byTitle.get(title) || []), profile]);
}

export function getPackageProfileForProduct(product: CatalogProduct): PackageProfile | null {
  const skuMatches = bySku.get(normalize(product.sku)) || [];
  const matches = skuMatches.length === 1
    ? skuMatches
    : byTitle.get(normalize(product.title)) || [];

  if (matches.length !== 1) return null;

  const profile = matches[0];
  if (
    !Number.isFinite(profile.weightLb) || profile.weightLb <= 0 ||
    !Number.isFinite(profile.lengthIn) || profile.lengthIn <= 0 ||
    !Number.isFinite(profile.widthIn) || profile.widthIn <= 0 ||
    !Number.isFinite(profile.heightIn) || profile.heightIn <= 0
  ) {
    return null;
  }

  return { ...profile, shippingLabel: labelForProfile(profile) };
}

export function getShippingPackageProfileBySku(sku: string): PackageProfile | null {
  const matches = bySku.get(normalize(sku)) || [];
  if (matches.length !== 1) return null;
  return { ...matches[0], shippingLabel: labelForProfile(matches[0]) };
}
