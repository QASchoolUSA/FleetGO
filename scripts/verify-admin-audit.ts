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
        stockSkus: s.stockSkus,
        stockUnits: s.stockUnits,
        missingSkus: s.missingSkus,
        missingUnits: s.missingUnits,
        shortfallSkus: s.shortfallSkus,
        shortfallUnits: s.shortfallUnits,
        acknowledgedSkus: s.acknowledgedSkus,
        publishIssueSkus: s.publishIssueSkus,
        publishIssues: audit.publishIssues.map((p) => ({
          mpn: p.mpn,
          title: p.title,
          status: p.webSyncStatus,
          error: p.webSyncError,
        })),
        sparkMissing: audit.missing.some((r) => r.item === "ACD_41-905"),
        sparkShort: audit.shortfalls.some((r) => r.item === "ACD_41-905"),
        sparkStock: audit.stock.some((r) => r.mpn === "41-905"),
        lot: s.lotId,
      },
      null,
      2,
    ),
  );

  if (s.source !== "convex") {
    throw new Error("expected convex source");
  }
  if (audit.missing.some((r) => r.item === "ACD_41-905")) {
    throw new Error("ACD_41-905 should not be missing after publish");
  }
  if (!audit.stock.some((r) => r.mpn === "41-905")) {
    throw new Error("41-905 should appear in stock");
  }
  // brake shoes still acknowledged
  if (s.acknowledgedSkus !== 1) {
    throw new Error(`expected 1 acknowledged, got ${s.acknowledgedSkus}`);
  }
  console.log("VERIFY_OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
