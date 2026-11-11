import type { CatalogProduct } from "./types";

export type ProductSort =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "brand-asc";

export type ProductQueryOpts = {
  category?: string;
  brand?: string;
  duty?: string;
  q?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  inStock?: boolean;
};

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A–Z" },
  { value: "brand-asc", label: "Brand: A–Z" },
];

export const PRICE_PRESETS: {
  id: string;
  label: string;
  min?: number;
  max?: number;
}[] = [
  { id: "any", label: "Any price" },
  { id: "0-25", label: "Under $25", max: 25 },
  { id: "25-50", label: "$25 – $50", min: 25, max: 50 },
  { id: "50-100", label: "$50 – $100", min: 50, max: 100 },
  { id: "100-200", label: "$100 – $200", min: 100, max: 200 },
  { id: "200+", label: "$200+", min: 200 },
];

export function parseProductQuery(
  params: Record<string, string | string[] | undefined>,
): ProductQueryOpts {
  const get = (key: string) => {
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const minRaw = get("minPrice");
  const maxRaw = get("maxPrice");
  const sort = get("sort") as ProductSort | undefined;
  const validSort = SORT_OPTIONS.some((o) => o.value === sort) ? sort : "featured";

  return {
    category: get("category") || undefined,
    brand: get("brand") || undefined,
    duty: get("duty") || undefined,
    q: get("q") || undefined,
    minPrice: minRaw !== undefined && minRaw !== "" ? Number(minRaw) : undefined,
    maxPrice: maxRaw !== undefined && maxRaw !== "" ? Number(maxRaw) : undefined,
    sort: validSort,
    inStock: get("inStock") === "1" || get("inStock") === "true",
  };
}

export function applyProductQuery(
  list: CatalogProduct[],
  opts?: ProductQueryOpts,
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
  if (typeof opts?.minPrice === "number" && !Number.isNaN(opts.minPrice)) {
    result = result.filter((p) => p.price >= opts.minPrice!);
  }
  if (typeof opts?.maxPrice === "number" && !Number.isNaN(opts.maxPrice)) {
    result = result.filter((p) => p.price <= opts.maxPrice!);
  }
  if (opts?.inStock) {
    result = result.filter(
      (p) => p.stockStatus === "in_stock" || p.stockStatus === "low_stock",
    );
  }

  const sort = opts?.sort || "featured";
  result.sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name-asc":
        return a.title.localeCompare(b.title);
      case "brand-asc":
        return a.brand.localeCompare(b.brand) || a.title.localeCompare(b.title);
      case "featured":
      default:
        return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.title.localeCompare(b.title);
    }
  });

  return result;
}

export function countActiveFilters(opts: ProductQueryOpts, options?: { ignoreCategory?: boolean }) {
  let n = 0;
  if (opts.duty && opts.duty !== "all") n += 1;
  if (opts.brand) n += 1;
  if (!options?.ignoreCategory && opts.category) n += 1;
  if (typeof opts.minPrice === "number" || typeof opts.maxPrice === "number") n += 1;
  if (opts.inStock) n += 1;
  return n;
}

export function matchPricePreset(min?: number, max?: number) {
  return (
    PRICE_PRESETS.find((p) => {
      if (p.id === "any") return min === undefined && max === undefined;
      return p.min === min && p.max === max;
    })?.id ?? "custom"
  );
}
