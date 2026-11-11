import type { CatalogAdapter, CatalogProduct } from "@/lib/catalog/types";
import { sanityClient } from "./client";
import {
  brandBySlugQuery,
  brandsQuery,
  categoriesQuery,
  categoryBySlugQuery,
  productByBarcodeQuery,
  productBySlugQuery,
  productsQuery,
  siteSettingsQuery,
} from "./queries";

type SanityProduct = Omit<CatalogProduct, "id"> & { _id: string };

function mapProduct(doc: SanityProduct | null): CatalogProduct | null {
  if (!doc) return null;
  return {
    id: doc._id,
    title: doc.title,
    slug: doc.slug,
    description: doc.description ?? "",
    shortDescription: doc.shortDescription,
    price: doc.price,
    compareAtPrice: doc.compareAtPrice,
    currency: doc.currency || "USD",
    sku: doc.sku,
    barcode: doc.barcode,
    mpn: doc.mpn,
    brand: doc.brand,
    brandSlug: doc.brandSlug,
    categories: doc.categories ?? [],
    images: (doc.images ?? []).map((img) => ({
      url: img.url,
      alt: img.alt || doc.title,
    })),
    fitment: doc.fitment ?? [],
    specs: doc.specs ?? [],
    stockStatus: doc.stockStatus ?? "in_stock",
    quantity: doc.quantity,
    convexProductKey: doc.convexProductKey,
    duty: doc.duty ?? "both",
    featured: doc.featured,
  };
}

function filterLocal(
  list: CatalogProduct[],
  opts?: {
    category?: string;
    brand?: string;
    duty?: string;
    q?: string;
    featured?: boolean;
  },
) {
  let result = list;
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
    const q = opts.q.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.mpn?.toLowerCase().includes(q) ||
        p.barcode?.includes(q),
    );
  }
  return result;
}

export const sanityAdapter: CatalogAdapter = {
  async getProducts(opts) {
    if (!sanityClient) return [];
    const docs = await sanityClient.fetch<SanityProduct[]>(productsQuery);
    return filterLocal(docs.map((d) => mapProduct(d)!).filter(Boolean), opts);
  },
  async getProductBySlug(slug) {
    if (!sanityClient) return null;
    const doc = await sanityClient.fetch<SanityProduct | null>(productBySlugQuery, { slug });
    return mapProduct(doc);
  },
  async getProductByBarcode(barcode) {
    if (!sanityClient) return null;
    const doc = await sanityClient.fetch<SanityProduct | null>(productByBarcodeQuery, {
      barcode,
    });
    return mapProduct(doc);
  },
  async getCategories() {
    if (!sanityClient) return [];
    const docs = await sanityClient.fetch<
      { _id: string; title: string; slug: string; description?: string; image?: string; parentSlug?: string }[]
    >(categoriesQuery);
    return docs.map((d) => ({
      id: d._id,
      title: d.title,
      slug: d.slug,
      description: d.description,
      image: d.image,
      parentSlug: d.parentSlug,
    }));
  },
  async getCategoryBySlug(slug) {
    if (!sanityClient) return null;
    const d = await sanityClient.fetch<{
      _id: string;
      title: string;
      slug: string;
      description?: string;
      image?: string;
      parentSlug?: string;
    } | null>(categoryBySlugQuery, { slug });
    if (!d) return null;
    return {
      id: d._id,
      title: d.title,
      slug: d.slug,
      description: d.description,
      image: d.image,
      parentSlug: d.parentSlug,
    };
  },
  async getBrands() {
    if (!sanityClient) return [];
    const docs = await sanityClient.fetch<
      { _id: string; title: string; slug: string; description?: string }[]
    >(brandsQuery);
    return docs.map((d) => ({
      id: d._id,
      title: d.title,
      slug: d.slug,
      description: d.description,
    }));
  },
  async getBrandBySlug(slug) {
    if (!sanityClient) return null;
    const d = await sanityClient.fetch<{
      _id: string;
      title: string;
      slug: string;
      description?: string;
    } | null>(brandBySlugQuery, { slug });
    if (!d) return null;
    return { id: d._id, title: d.title, slug: d.slug, description: d.description };
  },
  async getSiteSettings() {
    if (!sanityClient) {
      return {
        siteName: "FleetGo",
        tagline: "Auto & semi truck parts, delivered with confidence.",
      };
    }
    const d = await sanityClient.fetch<{
      siteName?: string;
      tagline?: string;
      phone?: string;
      email?: string;
      address?: string;
      googleSiteVerification?: string;
      bingSiteVerification?: string;
    } | null>(siteSettingsQuery);
    return {
      siteName: d?.siteName || "FleetGo",
      tagline: d?.tagline || "Auto & semi truck parts, delivered with confidence.",
      phone: d?.phone,
      email: d?.email,
      address: d?.address,
      googleSiteVerification: d?.googleSiteVerification,
      bingSiteVerification: d?.bingSiteVerification,
    };
  },
};
