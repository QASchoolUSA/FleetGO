import { getCatalog } from "@/lib/catalog/adapter";
import { buildManifestAudit } from "@/lib/admin/manifestAudit";
import { InventoryConsole } from "@/components/admin/InventoryConsole";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const products = await getCatalog().getProducts();
  const audit = await buildManifestAudit(products);

  return <InventoryConsole audit={audit} />;
}
