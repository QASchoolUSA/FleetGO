/**
 * Deletes Sanity category documents with zero product references.
 *
 * Requires NEXT_PUBLIC_SANITY_PROJECT_ID + SANITY_API_WRITE_TOKEN.
 *
 * Usage: npm run cleanup:categories
 */
import { createClient } from "@sanity/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv();

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

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

  const rows = await client.fetch<
    Array<{ _id: string; title: string; slug: string; productCount: number }>
  >(`*[_type == "category"]|order(title asc){
    _id,
    title,
    "slug": slug.current,
    "productCount": count(*[_type == "product" && references(^._id)])
  }`);

  const empty = rows.filter((r) => (r.productCount ?? 0) === 0);
  const kept = rows.filter((r) => (r.productCount ?? 0) > 0);

  console.log(`Categories: ${rows.length} total, ${kept.length} with products, ${empty.length} empty`);
  for (const row of kept) {
    console.log(`  keep  ${row.productCount}\t${row.slug}\t${row.title}`);
  }
  for (const row of empty) {
    console.log(`  delete ${row.slug}\t${row.title}`);
    await client.delete(row._id);
  }

  console.log(`Deleted ${empty.length} empty categor${empty.length === 1 ? "y" : "ies"}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
