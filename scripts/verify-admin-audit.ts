import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const { getCatalog } = await import("../src/lib/catalog/adapter");
  const { buildManifestAudit } = await import("../src/lib/admin/manifestAudit");

  const products = await getCatalog().getProducts();
  const audit = await buildManifestAudit(products);
  const s = audit.summary;
  console.log(
    JSON.stringify(
      {
        stockSkus: s.stockSkus,
        stockUnits: s.stockUnits,
        missingSkus: s.missingSkus,
        missingUnits: s.missingUnits,
        missingExt: s.missingExtRetail,
        shortfallSkus: s.shortfallSkus,
        shortfallUnits: s.shortfallUnits,
        acknowledgedSkus: s.acknowledgedSkus,
        acknowledgedItem: audit.acknowledged.map((a) => a.item),
        totalGapExt: s.totalGapExtRetail,
        lot: s.lotId,
        sanityConfigured: Boolean(
          process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
            process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "your_project_id",
        ),
      },
      null,
      2,
    ),
  );
  if (s.missingSkus !== 118) {
    throw new Error(`expected 118 missing, got ${s.missingSkus}`);
  }
  if (s.shortfallSkus !== 24) {
    throw new Error(`expected 24 shortfalls, got ${s.shortfallSkus}`);
  }
  if (s.acknowledgedSkus !== 1) {
    throw new Error(`expected 1 acknowledged, got ${s.acknowledgedSkus}`);
  }
  if (audit.acknowledged[0]?.item !== "HDX_GG4707QR") {
    throw new Error("brake shoes not acknowledged");
  }
  console.log("VERIFY_OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
