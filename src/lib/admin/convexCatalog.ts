export type ConvexAdminProduct = {
  id: string;
  barcode: string;
  mpn?: string;
  title: string;
  brand?: string;
  category?: string;
  quantity: number;
  webSyncStatus: string;
  webSyncError?: string;
  webSlug?: string;
  sanityDocumentId?: string;
  webPrice?: number;
  webPriceManual?: number;
  catalogPhotoCount: number;
  imageCount: number;
  updatedAt: number;
};

export async function fetchConvexAdminCatalog(): Promise<ConvexAdminProduct[]> {
  const base = process.env.CONVEX_SITE_URL?.replace(/\/$/, "");
  const secret = process.env.INVENTORY_SYNC_SECRET?.trim();
  if (!base) {
    throw new Error("CONVEX_SITE_URL is not configured");
  }
  if (!secret) {
    throw new Error("INVENTORY_SYNC_SECRET is not configured");
  }

  const res = await fetch(`${base}/admin/catalog`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secret}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Convex admin catalog failed (${res.status}): ${text.slice(0, 240)}`,
    );
  }

  const json = (await res.json()) as {
    products?: ConvexAdminProduct[];
  };
  return json.products ?? [];
}
