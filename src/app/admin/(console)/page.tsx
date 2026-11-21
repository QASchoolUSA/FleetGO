import { getCatalog } from "@/lib/catalog/adapter";
import { fetchConvexAdminCatalog } from "@/lib/admin/convexCatalog";
import {
  buildManifestAudit,
  catalogToInventory,
  convexToInventory,
} from "@/lib/admin/manifestAudit";
import { InventoryConsole } from "@/components/admin/InventoryConsole";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  let audit;
  let sourceNote = "convex";

  try {
    const convexProducts = await fetchConvexAdminCatalog();
    audit = await buildManifestAudit(convexToInventory(convexProducts), {
      source: "convex",
      convexMeta: convexProducts,
    });
  } catch (error) {
    console.error("Convex admin catalog unavailable, falling back to Sanity", error);
    sourceNote = "sanity-fallback";
    const sanityProducts = await getCatalog().getProducts();
    audit = await buildManifestAudit(catalogToInventory(sanityProducts), {
      source: "sanity",
    });
  }

  return <InventoryConsole audit={audit} sourceNote={sourceNote} />;
}
