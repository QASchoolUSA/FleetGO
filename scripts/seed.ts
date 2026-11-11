/**
 * Seeds Sanity with sample FleetGo catalog data.
 * Requires NEXT_PUBLIC_SANITY_PROJECT_ID + SANITY_API_WRITE_TOKEN.
 *
 * Usage: npm run seed
 *
 * Until credentials exist, the storefront uses src/lib/catalog/sample-data.ts automatically.
 */
import { createClient } from "@sanity/client";
import { config as loadEnv } from "dotenv";
import {
  brands,
  categories,
  products,
  siteSettings,
} from "../src/lib/catalog/sample-data";

loadEnv({ path: ".env.local" });
loadEnv();

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

async function main() {
  if (!projectId || projectId === "your_project_id" || !token) {
    console.log(`
FleetGo seed skipped — Sanity credentials not configured.

The storefront already ships with ${products.length} sample products from
src/lib/catalog/sample-data.ts when Sanity is not configured.

To seed Sanity later:
  1. Create a Sanity project
  2. Copy .env.example → .env.local and fill project id + write token
  3. Run: npm run seed
`);
    process.exit(0);
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01",
    token,
    useCdn: false,
  });

  console.log(`Seeding Sanity project ${projectId}/${dataset}…`);

  const brandIds = new Map<string, string>();
  for (const brand of brands) {
    const doc = await client.createOrReplace({
      _id: `brand.${brand.slug}`,
      _type: "brand",
      title: brand.title,
      slug: { _type: "slug", current: brand.slug },
      description: brand.description,
    });
    brandIds.set(brand.slug, doc._id);
    console.log("brand", brand.slug);
  }

  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const doc = await client.createOrReplace({
      _id: `category.${category.slug}`,
      _type: "category",
      title: category.title,
      slug: { _type: "slug", current: category.slug },
      description: category.description,
    });
    categoryIds.set(category.slug, doc._id);
    console.log("category", category.slug);
  }

  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    ...siteSettings,
  });

  for (const product of products) {
    const brandId = brandIds.get(product.brandSlug);
    await client.createOrReplace({
      _id: `product.${product.slug}`,
      _type: "product",
      title: product.title,
      slug: { _type: "slug", current: product.slug },
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      currency: product.currency,
      sku: product.sku,
      barcode: product.barcode,
      mpn: product.mpn,
      brand: brandId ? { _type: "reference", _ref: brandId } : undefined,
      categories: product.categories
        .map((c) => categoryIds.get(c.slug))
        .filter(Boolean)
        .map((id) => ({ _type: "reference", _ref: id, _key: id })),
      fitment: product.fitment,
      specs: product.specs,
      stockStatus: product.stockStatus,
      quantity: product.quantity,
      convexProductKey: product.barcode,
      duty: product.duty,
      featured: product.featured ?? false,
    });
    console.log("product", product.slug);
  }

  console.log(`Done. Seeded ${products.length} products.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
