import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const { fetchConvexAdminCatalog } = await import(
    "../src/lib/admin/convexCatalog"
  );
  const {
    buildManifestAudit,
    catalogToInventory,
    convexToInventory,
  } = await import("../src/lib/admin/manifestAudit");
  const { getCatalog } = await import("../src/lib/catalog/adapter");

  let audit;
  try {
    const convexProducts = await fetchConvexAdminCatalog();
    audit = await buildManifestAudit(convexToInventory(convexProducts), {
      source: "convex",
      convexMeta: convexProducts,
    });
  } catch (error) {
    console.warn("Convex unavailable, Sanity fallback", error);
    const sanityProducts = await getCatalog().getProducts();
    audit = await buildManifestAudit(catalogToInventory(sanityProducts), {
      source: "sanity",
    });
  }

  const s = audit.summary;
  console.log(
    JSON.stringify(
      {
        source: s.source,
        lot: s.lotId,
        stockSkus: s.stockSkus,
        stockUnits: s.stockUnits,
        appOnlySkus: s.appOnlySkus,
        appOnlyUnits: s.appOnlyUnits,
        noBarcodeSkus: s.noBarcodeSkus,
        unrecognizedBarcodeSkus: s.unrecognizedBarcodeSkus,
        locatedSkus: s.locatedSkus,
        matchedSkus: s.matchedSkus,
        exactMatchSkus: s.exactMatchSkus,
        missingSkus: s.missingSkus,
        missingUnits: s.missingUnits,
        missingExtRetail: s.missingExtRetail,
        shortfallSkus: s.shortfallSkus,
        shortfallUnits: s.shortfallUnits,
        shortfallExtRetail: s.shortfallExtRetail,
        totalGapUnits: s.totalGapUnits,
        totalGapExtRetail: s.totalGapExtRetail,
        skuCoveragePct: s.skuCoveragePct,
        unitCoveragePct: s.unitCoveragePct,
        acknowledgedSkus: s.acknowledgedSkus,
        publishIssueSkus: s.publishIssueSkus,
        appOnlySample: audit.appOnly.slice(0, 3).map((r) => ({
          title: r.title,
          mpn: r.mpn,
          manifestItem: r.manifestItem,
          location: r.location,
          photos: r.catalogPhotoUrls.length,
        })),
      },
      null,
      2,
    ),
  );

  if (s.source !== "convex") {
    throw new Error("expected convex source");
  }
  if (s.publishIssueSkus !== 0) {
    throw new Error(`expected 0 publish issues, got ${s.publishIssueSkus}`);
  }
  if (s.appOnlySkus < 12) {
    throw new Error(`expected >= 12 app-only SKUs, got ${s.appOnlySkus}`);
  }
  for (const item of [
    "ACD_41-905",
    "AAG_CPA2324",
    "AVV_AP11146",
    "AAG_CSA2022",
    "WVE_ST30RD-25",
    "WVE_ST307NC-100",
    "HEL_5528-4",
  ]) {
    if (audit.missing.some((r) => r.item === item)) {
      throw new Error(`${item} should not be missing`);
    }
  }
  for (const exactItem of ["ACD_41-905", "WVE_ST307NC-100", "WVE_ST30RD-25"]) {
    if (audit.shortfalls.some((r) => r.item === exactItem)) {
      throw new Error(`${exactItem} should be exact match via pack_multiplier`);
    }
  }
  if (s.acknowledgedSkus !== 1) {
    throw new Error(`expected 1 acknowledged, got ${s.acknowledgedSkus}`);
  }
  console.log("VERIFY_OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
