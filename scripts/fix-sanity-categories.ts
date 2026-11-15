/**
 * Aligns Sanity product category refs to the expert taxonomy, creates missing
 * expert category docs, and deletes empty orphan categories.
 *
 * Requires NEXT_PUBLIC_SANITY_PROJECT_ID + SANITY_API_WRITE_TOKEN
 * (falls back to SANITY_API_READ_TOKEN if it has write permission).
 *
 * Usage: npm run fix:categories
 */
import { createClient } from "@sanity/client";
import { config as loadEnv } from "dotenv";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { EXPERT_CATEGORY_TITLES } from "../src/lib/catalog/expertCategories";
import { slugify } from "../src/lib/sanity/writeProduct";

loadEnv({ path: ".env.local" });
loadEnv();

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN;

function loadBarcodeCategoryMap(): Map<string, string> {
  const verifiedPath = resolve(
    __dirname,
    "../../Inventory-Management-System/convex/catalogVerifiedData.ts",
  );
  const src = readFileSync(verifiedPath, "utf8");
  const map = new Map<string, string>();
  const re = /barcode:\s*"([^"]+)"[\s\S]*?category:\s*"([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(src))) {
    map.set(match[1], match[2]);
  }
  return map;
}

async function main() {
  if (!projectId || projectId === "your_project_id" || !token) {
    console.error(
      "Missing Sanity credentials. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local",
    );
    process.exit(1);
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01",
    token,
    useCdn: false,
  });

  const barcodeMap = loadBarcodeCategoryMap();
  console.log(`Loaded ${barcodeMap.size} barcode→category rows from CATALOG_VERIFIED`);

  // 1) Ensure all expert category documents exist with stable ids.
  for (const title of EXPERT_CATEGORY_TITLES) {
    const slug = slugify(title) || "uncategorized";
    const id = `category.${slug}`;
    await client.createOrReplace({
      _id: id,
      _type: "category",
      title,
      slug: { _type: "slug", current: slug },
    });
    console.log(`  ensure ${id}`);
  }

  // 2) Remap products by barcode.
  const products = await client.fetch<
    Array<{ _id: string; barcode?: string; title?: string; categories?: Array<{ _ref: string }> }>
  >(`*[_type == "product"]{ _id, barcode, title, categories }`);

  let remapped = 0;
  let missingMap = 0;
  for (const product of products) {
    const barcode = (product.barcode || "").replace(/\D/g, "") || product.barcode || "";
    const categoryTitle = barcodeMap.get(barcode);
    if (!categoryTitle) {
      missingMap += 1;
      console.warn(`  no verified category for ${barcode || product._id} (${product.title || ""})`);
      continue;
    }
    const slug = slugify(categoryTitle) || "uncategorized";
    const categoryId = `category.${slug}`;
    const currentRef = product.categories?.[0]?._ref;
    if (currentRef === categoryId) continue;

    await client
      .patch(product._id)
      .set({
        categories: [{ _type: "reference", _ref: categoryId, _key: categoryId }],
      })
      .commit();
    remapped += 1;
    console.log(`  remap ${barcode} → ${categoryTitle}`);
  }

  // 3) Delete empty categories.
  const rows = await client.fetch<
    Array<{ _id: string; title: string; slug: string; productCount: number }>
  >(`*[_type == "category"]|order(title asc){
    _id,
    title,
    "slug": slug.current,
    "productCount": count(*[_type == "product" && references(^._id)])
  }`);

  const empty = rows.filter((r) => (r.productCount ?? 0) === 0);
  for (const row of empty) {
    await client.delete(row._id);
    console.log(`  delete empty ${row.slug}\t${row.title}`);
  }

  console.log(
    `\nDone. remapped=${remapped}, alreadyOk=${products.length - remapped - missingMap}, missingMap=${missingMap}, deletedEmpty=${empty.length}, categoriesLeft=${rows.length - empty.length}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
