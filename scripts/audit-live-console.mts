import { fetchConvexAdminCatalog } from "../src/lib/admin/convexCatalog";
import { buildManifestAudit, convexToInventory } from "../src/lib/admin/manifestAudit";

async function main() {
  const products = await fetchConvexAdminCatalog();
  const audit = await buildManifestAudit(convexToInventory(products), {
    source: "convex",
    convexMeta: products,
  });
  const s = audit.summary;
  console.log(JSON.stringify({
    matchedSkus: s.matchedSkus,
    missingSkus: s.missingSkus,
    shortfallSkus: s.shortfallSkus,
    totalGapUnits: s.totalGapUnits,
    totalGapExt: s.totalGapExtRetail,
    appOnlySkus: s.appOnlySkus,
    unmatchedLiveSkus: s.unmatchedLiveSkus,
    unmatchedLiveUnits: s.unmatchedLiveUnits,
    dataGapSkus: s.dataGapSkus,
    skuCoveragePct: s.skuCoveragePct,
    unitCoveragePct: s.unitCoveragePct,
  }, null, 2));
  console.log("unmatched", audit.unmatchedLive.map((r) => `${r.mpn}×${r.quantity}`));
  console.log("appOnly", audit.appOnly.length);
  console.log("dataGaps", audit.dataGaps.length);
}

main().catch((e) => { console.error(e); process.exit(1); });
