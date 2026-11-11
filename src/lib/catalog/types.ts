/** Shared storefront product DTO — aligned with Inventory-Management-System Convex fields for future sync. */

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "preorder";

export type ProductFitment = {
  yearFrom: number;
  yearTo: number;
  make: string;
  model: string;
  engine?: string;
  notes?: string;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type CatalogProduct = {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  sku: string;
  /** Matches Convex `barcode` */
  barcode?: string;
  /** Matches Convex `mpn` */
  mpn?: string;
  brand: string;
  brandSlug: string;
  categories: { title: string; slug: string }[];
  images: { url: string; alt: string }[];
  fitment: ProductFitment[];
  specs: ProductSpec[];
  stockStatus: StockStatus;
  /** Approximate on-hand count — maps to Convex `quantity` later */
  quantity?: number;
  /** Optional key for future Convex productCache / products sync */
  convexProductKey?: string;
  duty: "light" | "semi" | "both";
  featured?: boolean;
};

export type CatalogCategory = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  parentSlug?: string;
};

export type CatalogBrand = {
  id: string;
  title: string;
  slug: string;
  description?: string;
};

export type SiteSettings = {
  siteName: string;
  tagline: string;
  phone?: string;
  email?: string;
  address?: string;
  googleSiteVerification?: string;
  bingSiteVerification?: string;
};

export type CatalogAdapter = {
  getProducts: (opts?: {
    category?: string;
    brand?: string;
    duty?: string;
    q?: string;
    featured?: boolean;
  }) => Promise<CatalogProduct[]>;
  getProductBySlug: (slug: string) => Promise<CatalogProduct | null>;
  /** Stub for future Convex barcode lookup */
  getProductByBarcode: (barcode: string) => Promise<CatalogProduct | null>;
  getCategories: () => Promise<CatalogCategory[]>;
  getCategoryBySlug: (slug: string) => Promise<CatalogCategory | null>;
  getBrands: () => Promise<CatalogBrand[]>;
  getBrandBySlug: (slug: string) => Promise<CatalogBrand | null>;
  getSiteSettings: () => Promise<SiteSettings>;
};
