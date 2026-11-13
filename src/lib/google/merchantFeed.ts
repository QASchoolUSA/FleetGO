import { isValidGtin, normalizeBarcode } from "@/lib/catalog/barcode";
import type { CatalogProduct, ProductSpec } from "@/lib/catalog/types";
import { absoluteUrl } from "@/lib/seo";
import { merchantFeedConfig } from "@/lib/google/merchantFeedConfig";

/** Google Merchant Center TSV column order (primary feed). */
export const MERCHANT_FEED_COLUMNS = [
  "id",
  "title",
  "description",
  "link",
  "image_link",
  "additional_image_link",
  "availability",
  "price",
  "brand",
  "gtin",
  "mpn",
  "condition",
  "google_product_category",
  "product_type",
  "shipping",
] as const;

export type MerchantFeedColumn = (typeof MERCHANT_FEED_COLUMNS)[number];

export type MerchantFeedRow = Record<MerchantFeedColumn, string>;

export type MerchantFeedSkipReason =
  | "missing_image"
  | "invalid_price"
  | "missing_brand"
  | "missing_gtin_and_mpn";

export type MerchantFeedItemResult =
  | { ok: true; row: MerchantFeedRow; warnings: string[] }
  | { ok: false; productId: string; title: string; reasons: MerchantFeedSkipReason[]; warnings: string[] };

function escapeTsvCell(value: string): string {
  // Tabs/newlines break TSV columns; collapse whitespace.
  return value.replace(/[\t\r\n]+/g, " ").trim();
}

function formatPrice(price: number, currency: string): string {
  return `${price.toFixed(2)} ${currency}`;
}

function mapAvailability(status: CatalogProduct["stockStatus"]): string {
  switch (status) {
    case "out_of_stock":
      return "out_of_stock";
    case "preorder":
      return "preorder";
    case "in_stock":
    case "low_stock":
    default:
      return "in_stock";
  }
}

function detectCondition(specs: ProductSpec[]): "new" | "refurbished" | "used" {
  for (const spec of specs) {
    const blob = `${spec.label || ""} ${spec.value || ""}`.toLowerCase();
    if (
      blob.includes("reman") ||
      blob.includes("refurbished") ||
      blob.includes("remanufactured")
    ) {
      return "refurbished";
    }
    if (blob.includes("used") || blob.includes("open box") || blob.includes("open-box")) {
      return "used";
    }
  }
  return "new";
}

function productId(product: CatalogProduct): string {
  return (product.sku || product.barcode || product.id).trim();
}

function productDescription(product: CatalogProduct): string {
  const raw = (product.description || product.shortDescription || product.title).trim();
  // Google recommends 500–1000 chars; hard-cap to stay within attribute limits.
  if (raw.length <= 5000) return raw;
  return `${raw.slice(0, 4997)}...`;
}

/**
 * Map a catalog product to a Merchant Center feed row, or return skip reasons.
 */
export function mapProductToMerchantFeed(product: CatalogProduct): MerchantFeedItemResult {
  const warnings: string[] = [];
  const reasons: MerchantFeedSkipReason[] = [];
  const id = productId(product);
  const title = product.title?.trim() || id;

  const imageLink = product.images[0]?.url?.trim() || "";
  if (!imageLink) reasons.push("missing_image");

  if (!(product.price > 0)) reasons.push("invalid_price");

  const brand = product.brand?.trim() || "";
  if (!brand) reasons.push("missing_brand");

  const barcode = normalizeBarcode(product.barcode);
  if (barcode.warning) warnings.push(barcode.warning);

  const gtin = isValidGtin(barcode) ? barcode.id : "";
  const mpn = product.mpn?.trim() || "";
  if (!gtin && !mpn) reasons.push("missing_gtin_and_mpn");

  if (reasons.length) {
    return { ok: false, productId: id, title, reasons, warnings };
  }

  const additional = product.images
    .slice(1, 1 + merchantFeedConfig.maxAdditionalImages)
    .map((img) => img.url.trim())
    .filter(Boolean)
    .join(",");

  const currency = (product.currency || merchantFeedConfig.currency).toUpperCase();
  const productType = product.categories.map((c) => c.title).filter(Boolean).join(" > ");

  const row: MerchantFeedRow = {
    id,
    title: product.title.trim(),
    description: productDescription(product),
    link: absoluteUrl(`/p/${product.slug}`),
    image_link: imageLink,
    additional_image_link: additional,
    availability: mapAvailability(product.stockStatus),
    price: formatPrice(product.price, currency),
    brand,
    gtin,
    mpn,
    condition: detectCondition(product.specs || []),
    google_product_category: merchantFeedConfig.googleProductCategory,
    product_type: productType,
    shipping: merchantFeedConfig.shipping,
  };

  return { ok: true, row, warnings };
}

export function buildMerchantFeed(products: CatalogProduct[]): {
  tsv: string;
  included: MerchantFeedRow[];
  skipped: Extract<MerchantFeedItemResult, { ok: false }>[];
  warnings: { productId: string; title: string; warnings: string[] }[];
} {
  const included: MerchantFeedRow[] = [];
  const skipped: Extract<MerchantFeedItemResult, { ok: false }>[] = [];
  const warnings: { productId: string; title: string; warnings: string[] }[] = [];

  for (const product of products) {
    const result = mapProductToMerchantFeed(product);
    if (result.warnings.length) {
      warnings.push({
        productId: result.ok ? result.row.id : result.productId,
        title: result.ok ? result.row.title : result.title,
        warnings: result.warnings,
      });
    }
    if (result.ok) included.push(result.row);
    else skipped.push(result);
  }

  const header = MERCHANT_FEED_COLUMNS.join("\t");
  const lines = included.map((row) =>
    MERCHANT_FEED_COLUMNS.map((col) => escapeTsvCell(row[col] ?? "")).join("\t"),
  );

  return {
    tsv: [header, ...lines].join("\n") + (lines.length ? "\n" : ""),
    included,
    skipped,
    warnings,
  };
}
