import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { deleteInventoryProduct } from "@/lib/sanity/writeProduct";
import { isSanityConfigured } from "@/lib/sanity/env";
import { sanityWriteClient } from "@/lib/sanity/client";

export const runtime = "nodejs";

/**
 * Sanity webhook for product deletions (Studio / API).
 * Configure in Sanity: trigger on delete for type `product`,
 * header `Authorization: Bearer <INVENTORY_SYNC_SECRET>` (or x-inventory-sync-secret).
 */
export async function POST(request: Request) {
  const secret = process.env.INVENTORY_SYNC_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const header = request.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const alt = request.headers.get("x-inventory-sync-secret") || "";
  if (bearer !== secret && alt !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSanityConfigured() || !sanityWriteClient) {
    return NextResponse.json({ error: "Sanity not configured" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Sanity delete webhooks vary; accept barcode, _id, or nested document.
  const barcodeField =
    (typeof body.barcode === "string" && body.barcode) ||
    (typeof body._id === "string" && body._id.startsWith("product.barcode.")
      ? body._id.replace(/^product\.barcode\./, "")
      : undefined) ||
    (typeof (body as { document?: { barcode?: string; _id?: string } }).document
      ?.barcode === "string"
      ? (body as { document: { barcode: string } }).document.barcode
      : undefined);

  if (!barcodeField) {
    return NextResponse.json(
      { error: "Could not resolve barcode from webhook payload" },
      { status: 400 },
    );
  }

  try {
    const result = await deleteInventoryProduct(barcodeField, {
      notifyConvex: true,
    });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidateTag("catalog", "max");
    if (result.slug) revalidatePath(`/p/${result.slug}`);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook delete failed";
    console.error("sanity delete webhook failed", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}