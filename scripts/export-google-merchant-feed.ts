/**
 * Sanity / sample catalog → Google Merchant Center TSV export (local validation).
 *
 * Usage: npm run export:google-merchant
 *
 * Outputs (gitignored):
 *   exports/google-merchant.tsv
 *   exports/google-merchant-report.md
 *
 * See scripts/GOOGLE_MERCHANT_FEED.md for Merchant Center scheduled-fetch setup.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { config as loadEnv } from "dotenv";
import { getCatalog } from "../src/lib/catalog/adapter";
import { buildMerchantFeed } from "../src/lib/google/merchantFeed";
import { merchantFeedConfig } from "../src/lib/google/merchantFeedConfig";
import { getPackageProfileForProduct } from "../src/lib/shipping/packageProfiles";

loadEnv({ path: ".env.local" });
loadEnv();

const OUT_DIR = join(process.cwd(), "exports");

async function main() {
  const catalog = getCatalog();
  const products = await catalog.getProducts();
  const source = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    ? `Sanity \`${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET || "production"}\` (via getCatalog)`
    : "sample-data (Sanity not configured)";

  console.log(`Building Google Merchant feed from ${products.length} products (${source})…`);

  const { tsv, included, skipped, warnings } = buildMerchantFeed(products);
  const packageConfidence = { high: 0, medium: 0, low: 0, missing: 0 };
  for (const product of products) {
    const profile = getPackageProfileForProduct(product);
    if (profile) packageConfidence[profile.confidence] += 1;
    else packageConfidence.missing += 1;
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const tsvPath = join(OUT_DIR, "google-merchant.tsv");
  const reportPath = join(OUT_DIR, "google-merchant-report.md");
  writeFileSync(tsvPath, tsv, "utf8");

  const byReason = (reason: string) =>
    skipped.filter((s) => s.reasons.includes(reason as (typeof s.reasons)[number])).length;

  const skippedLines = skipped
    .slice(0, 50)
    .map(
      (s) =>
        `| \`${s.productId}\` | ${s.title.replace(/\|/g, "/")} | ${s.reasons.join(", ")} |`,
    )
    .join("\n");

  const warningLines = warnings
    .slice(0, 30)
    .map(
      (w) =>
        `| \`${w.productId}\` | ${w.title.replace(/\|/g, "/")} | ${w.warnings.join("; ")} |`,
    )
    .join("\n");

  const report = `# Google Merchant feed report

Generated: ${new Date().toISOString()}

## Source

${source}

## Config

| Setting | Value |
|---------|-------|
| Country / language | ${merchantFeedConfig.targetCountry} / ${merchantFeedConfig.contentLanguage} |
| Currency | ${merchantFeedConfig.currency} |
| google_product_category | ${merchantFeedConfig.googleProductCategory} |
| Shipping origin / service | ${merchantFeedConfig.shippingOriginZip} / ${merchantFeedConfig.shippingService} |

## Counts

| Metric | Count |
|--------|------:|
| Catalog products | ${products.length} |
| Included in feed | ${included.length} |
| Skipped | ${skipped.length} |
| With feed warnings | ${warnings.length} |
| Skipped: missing_image | ${byReason("missing_image")} |
| Skipped: invalid_price | ${byReason("invalid_price")} |
| Skipped: missing_brand | ${byReason("missing_brand")} |
| Skipped: missing_gtin_and_mpn | ${byReason("missing_gtin_and_mpn")} |
| Skipped: missing_package_profile | ${byReason("missing_package_profile")} |
| Skipped: duplicate_id | ${byReason("duplicate_id")} |

## Package profile confidence

| Confidence | Products |
|------------|---------:|
| High | ${packageConfidence.high} |
| Medium | ${packageConfidence.medium} |
| Low | ${packageConfidence.low} |
| Missing | ${packageConfidence.missing} |

## Outputs

| File | Use |
|------|-----|
| \`google-merchant.tsv\` | Upload or compare against scheduled feed URL |
| \`google-merchant-report.md\` | This report |

## Skipped products (first 50)

| id | title | reasons |
|----|-------|---------|
${skippedLines || "| — | — | none |"}

## Feed warnings (first 30)

| id | title | warnings |
|----|-------|----------|
${warningLines || "| — | — | none |"}

## Next steps

1. Fix skipped rows (images, brand, GTIN or MPN) in Sanity / Convex sync.
2. Deploy the live feed: \`GET /api/feeds/google-merchant?key=…\`
3. In Merchant Center → Products → Feeds → scheduled fetch (see \`scripts/GOOGLE_MERCHANT_FEED.md\`).
`;

  writeFileSync(reportPath, report, "utf8");

  console.log(`Wrote ${tsvPath} (${included.length} rows)`);
  console.log(`Wrote ${reportPath} (${skipped.length} skipped)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
