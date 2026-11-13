/**
 * One-time Sanity → Amazon Seller Central FBM flat-file export.
 *
 * Requires NEXT_PUBLIC_SANITY_PROJECT_ID (+ SANITY_API_READ_TOKEN if dataset is private).
 *
 * Usage: npm run export:amazon
 *
 * Outputs (gitignored):
 *   exports/amazon-offers.csv
 *   exports/amazon-listings-full.csv
 *   exports/amazon-export-report.md
 *
 * See scripts/AMAZON_EXPORT.md for Seller Central upload steps.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@sanity/client";
import { config as loadEnv } from "dotenv";
import { normalizeBarcode } from "../src/lib/catalog/barcode";
import { products as sampleProducts } from "../src/lib/catalog/sample-data";
import type { CatalogProduct } from "../src/lib/catalog/types";
import { productsQuery } from "../src/lib/sanity/queries";
import {
  amazonExportConfig,
  resolveProductType,
} from "./amazon-export-config";

loadEnv({ path: ".env.local" });
loadEnv();

const OUT_DIR = join(process.cwd(), "exports");

type Fitment = {
  yearFrom?: number;
  yearTo?: number;
  make?: string;
  model?: string;
  engine?: string;
  notes?: string;
};

type Spec = { label?: string; value?: string };

type SanityProduct = {
  _id: string;
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  compareAtPrice?: number;
  currency?: string;
  sku?: string;
  barcode?: string;
  mpn?: string;
  brand?: string;
  categories?: { title?: string; slug?: string }[];
  images?: { url?: string; alt?: string }[];
  fitment?: Fitment[];
  specs?: Spec[];
  stockStatus?: string;
  quantity?: number;
};

type ParsedWeight = { pounds: number; raw: string } | null;
type ParsedDims = { length: number; width: number; height: number; unit: "inches"; raw: string } | null;

type ProductIssue = {
  sku: string;
  title: string;
  issues: string[];
};

function sellerSku(p: SanityProduct): string {
  return (p.sku || p.mpn || p.barcode || p._id).trim();
}

function findSpec(specs: Spec[] | undefined, ...labelHints: string[]): string | undefined {
  if (!specs?.length) return undefined;
  const lowerHints = labelHints.map((h) => h.toLowerCase());
  for (const spec of specs) {
    const label = (spec.label || "").toLowerCase();
    if (lowerHints.some((h) => label.includes(h))) {
      const value = (spec.value || "").trim();
      if (value) return value;
    }
  }
  return undefined;
}

function parseWeightPounds(raw: string | undefined): ParsedWeight {
  if (!raw) return null;
  const cleaned = raw.replace(/~/g, "").trim();
  const match = cleaned.match(/([\d.]+)\s*(lb|lbs|pound|pounds|oz|ounce|ounces)\b/i);
  if (!match) return null;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const unit = match[2].toLowerCase();
  const pounds = unit.startsWith("oz") || unit.startsWith("ounce") ? amount / 16 : amount;
  return { pounds: Math.round(pounds * 1000) / 1000, raw: cleaned };
}

function parseDimsInches(raw: string | undefined): ParsedDims {
  if (!raw) return null;
  const cleaned = raw.replace(/~/g, "").replace(/×/g, "x").replace(/,/g, "").trim();
  const match = cleaned.match(
    /([\d.]+)\s*[xX]\s*([\d.]+)\s*[xX]\s*([\d.]+)\s*(in|inch|inches|")?/i,
  );
  if (!match) return null;
  const length = Number(match[1]);
  const width = Number(match[2]);
  const height = Number(match[3]);
  if (![length, width, height].every((n) => Number.isFinite(n) && n > 0)) return null;
  return { length, width, height, unit: "inches", raw: cleaned };
}

function formatFitmentLine(f: Fitment): string {
  const years =
    f.yearFrom && f.yearTo
      ? f.yearFrom === f.yearTo
        ? String(f.yearFrom)
        : `${f.yearFrom}-${f.yearTo}`
      : f.yearFrom
        ? String(f.yearFrom)
        : "";
  const parts = [years, f.make, f.model, f.engine].filter(Boolean);
  const base = parts.join(" ");
  return f.notes ? `${base} (${f.notes})` : base;
}

function buildFitmentText(fitment: Fitment[] | undefined): string {
  if (!fitment?.length) return "";
  const lines = fitment
    .map(formatFitmentLine)
    .filter(Boolean)
    .slice(0, amazonExportConfig.maxFitmentLines);
  if (!lines.length) return "";
  const more =
    fitment.length > amazonExportConfig.maxFitmentLines
      ? ` (+${fitment.length - amazonExportConfig.maxFitmentLines} more)`
      : "";
  return `Compatible with: ${lines.join("; ")}${more}`;
}

function buildBulletPoints(p: SanityProduct): string[] {
  const bullets: string[] = [];
  const brand = p.brand?.trim();
  const mpn = p.mpn?.trim();
  if (brand && mpn) bullets.push(`${brand} manufacturer part number ${mpn}`);
  else if (mpn) bullets.push(`Manufacturer part number ${mpn}`);

  const weightRaw = findSpec(p.specs, "weight");
  const dimsRaw = findSpec(
    p.specs,
    "package / housing",
    "package l",
    "dimensions l",
    "l×w×h",
    "lxwxh",
  );
  if (weightRaw) bullets.push(`Weight: ${weightRaw.replace(/^~/, "")}`);
  if (dimsRaw) bullets.push(`Package dimensions: ${dimsRaw.replace(/^~/, "")}`);

  // Prefer non-weight/dim specs for remaining bullets
  const skip = /weight|dimension|package\s*\/?\s*housing|l\s*[×x]\s*w|upc|oe cross/i;
  for (const spec of p.specs || []) {
    if (bullets.length >= amazonExportConfig.maxBulletPoints) break;
    const label = (spec.label || "").trim();
    const value = (spec.value || "").trim();
    if (!label || !value || skip.test(label)) continue;
    bullets.push(`${label}: ${value}`);
  }

  const fitmentText = buildFitmentText(p.fitment);
  if (fitmentText && bullets.length < amazonExportConfig.maxBulletPoints) {
    bullets.push(fitmentText);
  }

  return bullets.slice(0, amazonExportConfig.maxBulletPoints);
}

function escapeCsv(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function rowsToCsv(headers: string[], rows: Record<string, string | number>[]): string {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsv(row[h])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function fromCatalogProduct(p: CatalogProduct): SanityProduct {
  return {
    _id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    shortDescription: p.shortDescription,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    currency: p.currency,
    sku: p.sku,
    barcode: p.barcode,
    mpn: p.mpn,
    brand: p.brand,
    categories: p.categories,
    images: p.images,
    fitment: p.fitment,
    specs: p.specs,
    stockStatus: p.stockStatus,
    quantity: p.quantity,
  };
}

function productIssues(p: SanityProduct, barcode: ReturnType<typeof normalizeBarcode>): string[] {
  const issues: string[] = [];
  if (!p.title?.trim()) issues.push("missing title");
  if (!p.brand?.trim()) issues.push("missing brand");
  if (p.price === undefined || p.price === null || Number(p.price) < 0) {
    issues.push("missing/invalid price");
  }
  if (!barcode.id) issues.push("missing barcode");
  else if (barcode.warning) issues.push(barcode.warning);
  if (!barcode.type && barcode.id) issues.push("could not classify barcode as UPC/EAN");
  if (!p.images?.some((img) => img.url)) issues.push("missing images");
  if (p.quantity === undefined || p.quantity === null) issues.push("missing quantity");
  else if (p.quantity <= 0) issues.push("quantity <= 0 (still exported; set qty in Seller Central)");

  const weight = parseWeightPounds(findSpec(p.specs, "weight"));
  const dims = parseDimsInches(
    findSpec(p.specs, "package / housing", "package l", "dimensions l", "l×w×h", "lxwxh"),
  );
  if (!weight) issues.push("could not parse weight from specs");
  if (!dims) issues.push("could not parse package dimensions from specs");

  const mapping = resolveProductType((p.categories || []).map((c) => c.title || "").filter(Boolean));
  if (!mapping) issues.push("no category→product_type map entry");
  else if (!mapping.productType) {
    issues.push("product_type placeholder empty (fill amazon-export-config.ts)");
  }

  return issues;
}

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";
  const token = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN;

  if (!projectId || projectId === "your_project_id") {
    console.error(`
Sanity project id missing. Set NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local
(see .env.example). Optional: SANITY_API_READ_TOKEN if the dataset is private.
`);
    process.exit(1);
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: token || undefined,
  });

  console.log(`Fetching products from Sanity ${projectId}/${dataset}…`);
  let products = (await client.fetch(productsQuery)) as SanityProduct[];
  let sourceLabel = `Sanity \`${projectId}/${dataset}\``;

  if (!products.length) {
    console.warn(
      "Sanity returned 0 products — falling back to sample-data (same as the storefront when the CMS catalog is empty).",
    );
    products = sampleProducts.map(fromCatalogProduct);
    sourceLabel = `sample-data.ts (${sampleProducts.length} products; Sanity empty)`;
  }

  console.log(`Found ${products.length} products.`);

  const offerHeaders = [
    "sku",
    "product-id",
    "product-id-type",
    "price",
    "minimum-seller-allowed-price",
    "maximum-seller-allowed-price",
    "item-condition",
    "quantity",
    "add-delete",
    "will-ship-internationally",
    "expedited-shipping",
    "standard-plus",
    "item-note",
    "fulfillment-center-id",
    "product-tax-code",
    "handling-time",
    "merchant_shipping_group_name",
  ];

  const otherImageHeaders = Array.from(
    { length: amazonExportConfig.maxOtherImages },
    (_, i) => `other_image_url${i + 1}`,
  );

  const fullHeaders = [
    "sku",
    "product_type",
    "item_name",
    "brand_name",
    "external_product_id",
    "external_product_id_type",
    "manufacturer_part_number",
    "standard_price",
    "quantity",
    "condition_type",
    "fulfillment_latency",
    "merchant_shipping_group_name",
    "main_image_url",
    ...otherImageHeaders,
    "product_description",
    "bullet_point1",
    "bullet_point2",
    "bullet_point3",
    "bullet_point4",
    "bullet_point5",
    "item_weight",
    "item_weight_unit_of_measure",
    "item_length",
    "item_width",
    "item_height",
    "item_dimensions_unit_of_measure",
    "website_shipping_weight",
    "website_shipping_weight_unit_of_measure",
    "item_type_keyword",
    "update_delete",
  ];

  const offerRows: Record<string, string | number>[] = [];
  const fullRows: Record<string, string | number>[] = [];
  const issueRows: ProductIssue[] = [];

  for (const p of products) {
    const sku = sellerSku(p);
    const barcode = normalizeBarcode(p.barcode);
    const issues = productIssues(p, barcode);
    if (issues.length) {
      issueRows.push({ sku, title: p.title || "", issues });
    }

    const qty =
      p.quantity !== undefined && p.quantity !== null ? Math.max(0, Math.floor(p.quantity)) : 0;
    const price =
      p.price !== undefined && p.price !== null ? Number(p.price).toFixed(2) : "";

    offerRows.push({
      sku,
      "product-id": barcode.id,
      "product-id-type": barcode.type,
      price,
      "minimum-seller-allowed-price": "",
      "maximum-seller-allowed-price": "",
      "item-condition": "11", // New
      quantity: qty,
      "add-delete": "a",
      "will-ship-internationally": "",
      "expedited-shipping": "",
      "standard-plus": "",
      "item-note": "",
      "fulfillment-center-id": "DEFAULT", // Merchant Fulfilled
      "product-tax-code": "",
      "handling-time": amazonExportConfig.fulfillmentLatency,
      merchant_shipping_group_name: amazonExportConfig.merchantShippingGroupName,
    });

    const images = (p.images || []).map((img) => img.url).filter(Boolean) as string[];
    const mainImage = images[0] || "";
    const otherImages = images.slice(1, 1 + amazonExportConfig.maxOtherImages);

    const weight = parseWeightPounds(findSpec(p.specs, "weight"));
    const dims = parseDimsInches(
      findSpec(p.specs, "package / housing", "package l", "dimensions l", "l×w×h", "lxwxh"),
    );
    const bullets = buildBulletPoints(p);
    const fitmentText = buildFitmentText(p.fitment);
    const descriptionParts = [p.description?.trim(), fitmentText].filter(Boolean);
    const categoryTitles = (p.categories || []).map((c) => c.title || "").filter(Boolean);
    const mapping = resolveProductType(categoryTitles);

    const fullRow: Record<string, string | number> = {
      sku,
      product_type: mapping?.productType || "",
      item_name: p.title || "",
      brand_name: p.brand || "",
      external_product_id: barcode.id,
      external_product_id_type: barcode.type,
      manufacturer_part_number: (p.mpn || "").trim(),
      standard_price: price,
      quantity: qty,
      condition_type: amazonExportConfig.conditionType,
      fulfillment_latency: amazonExportConfig.fulfillmentLatency,
      merchant_shipping_group_name: amazonExportConfig.merchantShippingGroupName,
      main_image_url: mainImage,
      product_description: descriptionParts.join("\n\n"),
      bullet_point1: bullets[0] || "",
      bullet_point2: bullets[1] || "",
      bullet_point3: bullets[2] || "",
      bullet_point4: bullets[3] || "",
      bullet_point5: bullets[4] || "",
      item_weight: weight ? weight.pounds : "",
      item_weight_unit_of_measure: weight ? "LB" : "",
      item_length: dims ? dims.length : "",
      item_width: dims ? dims.width : "",
      item_height: dims ? dims.height : "",
      item_dimensions_unit_of_measure: dims ? "inches" : "",
      website_shipping_weight: weight ? weight.pounds : "",
      website_shipping_weight_unit_of_measure: weight ? "LB" : "",
      item_type_keyword: mapping?.templateSheet || categoryTitles[0] || "",
      update_delete: "Update",
    };

    for (let i = 0; i < amazonExportConfig.maxOtherImages; i++) {
      fullRow[`other_image_url${i + 1}`] = otherImages[i] || "";
    }

    fullRows.push(fullRow);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const offersPath = join(OUT_DIR, "amazon-offers.csv");
  const fullPath = join(OUT_DIR, "amazon-listings-full.csv");
  const reportPath = join(OUT_DIR, "amazon-export-report.md");

  writeFileSync(offersPath, rowsToCsv(offerHeaders, offerRows), "utf8");
  writeFileSync(fullPath, rowsToCsv(fullHeaders, fullRows), "utf8");

  const missingBarcode = issueRows.filter((r) => r.issues.some((i) => i.includes("barcode")));
  const missingImages = issueRows.filter((r) => r.issues.some((i) => i.includes("images")));
  const missingWeight = issueRows.filter((r) => r.issues.some((i) => i.includes("weight")));
  const missingDims = issueRows.filter((r) => r.issues.some((i) => i.includes("dimensions")));
  const zeroQty = issueRows.filter((r) => r.issues.some((i) => i.includes("quantity <=")));

  const report = `# Amazon FBM export report

Generated: ${new Date().toISOString()}
Marketplace: ${amazonExportConfig.marketplace}
Source: ${sourceLabel}
Products exported: **${products.length}**

## Files

| File | Purpose |
|------|---------|
| \`amazon-offers.csv\` | Inventory Loader–style FBM offers (match by UPC/EAN) |
| \`amazon-listings-full.csv\` | Create-new / full attribute rows if UPC match fails |
| \`amazon-export-report.md\` | This report |

## Column headers used

### Offers (\`amazon-offers.csv\`)

\`\`\`
${offerHeaders.join(", ")}
\`\`\`

- \`fulfillment-center-id=DEFAULT\` → Merchant Fulfilled (FBM)
- \`item-condition=11\` → New
- \`handling-time=${amazonExportConfig.fulfillmentLatency}\` business days
- \`add-delete=a\` → add/update offer

### Full listings (\`amazon-listings-full.csv\`)

\`\`\`
${fullHeaders.join(", ")}
\`\`\`

Amazon’s downloaded Automotive template may use slightly different names — copy values into their sheet if upload rejects headers. See \`scripts/AMAZON_EXPORT.md\`.

## Issue summary

| Check | Count |
|-------|------:|
| Products with any issue flag | ${issueRows.length} |
| Missing / odd barcode | ${missingBarcode.length} |
| Missing images | ${missingImages.length} |
| Unparsed weight | ${missingWeight.length} |
| Unparsed package dimensions | ${missingDims.length} |
| Quantity ≤ 0 | ${zeroQty.length} |

## Per-SKU issues

${
  issueRows.length
    ? issueRows
        .map(
          (r) =>
            `- **${r.sku}** — ${r.title || "(no title)"}\n  - ${r.issues.join("\n  - ")}`,
        )
        .join("\n")
    : "_No issues flagged._"
}

## Next steps

1. Upload \`amazon-offers.csv\` first in Seller Central (match existing ASINs by UPC).
2. Review the processing report for “product ID not found” rows.
3. For those SKUs, use matching rows from \`amazon-listings-full.csv\` (after filling \`product_type\` in \`scripts/amazon-export-config.ts\`).
4. Align shipping template name with Seller Central if \`merchant_shipping_group_name\` is blank.
`;

  writeFileSync(reportPath, report, "utf8");

  console.log(`
Wrote:
  ${offersPath}
  ${fullPath}
  ${reportPath}

${issueRows.length} product(s) have issue flags — see the report.
Upload offers CSV first; use full listings CSV for UPC match failures.
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
