import { getCatalog } from "./adapter";
import {
  buildVehicleCatalogFromFitment,
  type VehicleCatalog,
} from "@/lib/vehicles";

export async function getFitmentVehicleCatalog(): Promise<VehicleCatalog> {
  const products = await getCatalog().getProducts();
  const rows = products.flatMap((p) => p.fitment ?? []);
  return buildVehicleCatalogFromFitment(rows);
}
