import {
  brands as sampleBrands,
  categories as sampleCategories,
  products as sampleProducts,
  siteSettings as sampleSettings,
} from "./sample-data";
import { applyProductQuery, type ProductQueryOpts } from "./query";
import type {
  CatalogAdapter,
  CatalogBrand,
  CatalogCategory,
  CatalogProduct,
  SiteSettings,
} from "./types";
import { isSanityConfigured } from "@/lib/sanity/env";
import { sanityAdapter } from "@/lib/sanity/adapter";

const sampleAdapter: CatalogAdapter = {
  async getProducts(opts?: ProductQueryOpts) {
    return applyProductQuery(sampleProducts, opts);
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
