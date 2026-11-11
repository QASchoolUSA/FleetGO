import {
  brands as sampleBrands,
  categories as sampleCategories,
  products as sampleProducts,
  siteSettings as sampleSettings,
} from "./sample-data";
import type {
  CatalogAdapter,
  CatalogBrand,
  CatalogCategory,
  CatalogProduct,
  SiteSettings,
} from "./types";
import { isSanityConfigured } from "@/lib/sanity/env";
import { sanityAdapter } from "@/lib/sanity/adapter";

function filterProducts(
  list: CatalogProduct[],
  opts?: {
    category?: string;
    brand?: string;
    duty?: string;
    q?: string;
    featured?: boolean;
  },
): CatalogProduct[] {
  let result = [...list];
  if (opts?.category) {
    result = result.filter((p) => p.categories.some((c) => c.slug === opts.category));
  }
  if (opts?.brand) {
    result = result.filter((p) => p.brandSlug === opts.brand);
  }
  if (opts?.duty && opts.duty !== "all") {
    result = result.filter((p) => p.duty === opts.duty || p.duty === "both");
  }
  if (opts?.featured) {
    result = result.filter((p) => p.featured);
  }
  if (opts?.q) {
    const q = opts.q.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.mpn?.toLowerCase().includes(q) ||
        p.barcode?.includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }
  return result;
}

const sampleAdapter: CatalogAdapter = {
  async getProducts(opts) {
    return filterProducts(sampleProducts, opts);
  },
  async getProductBySlug(slug) {
    return sampleProducts.find((p) => p.slug === slug) ?? null;
  },
  /** Future: query Convex productCache / published catalog by barcode. */
  async getProductByBarcode(barcode) {
    return sampleProducts.find((p) => p.barcode === barcode) ?? null;
  },
  async getCategories() {
    return sampleCategories;
  },
  async getCategoryBySlug(slug) {
    return sampleCategories.find((c) => c.slug === slug) ?? null;
  },
  async getBrands() {
    return sampleBrands;
  },
  async getBrandBySlug(slug) {
    return sampleBrands.find((b) => b.slug === slug) ?? null;
  },
  async getSiteSettings() {
    return sampleSettings;
  },
};

export function getCatalog(): CatalogAdapter {
  if (isSanityConfigured()) {
    return sanityAdapter;
  }
  return sampleAdapter;
}

export type { CatalogProduct, CatalogCategory, CatalogBrand, SiteSettings };
