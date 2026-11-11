import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import {
  deleteInventoryProduct,
  notifyConvexQuantity,
} from "@/lib/sanity/writeProduct";
import { isSanityConfigured } from "@/lib/sanity/env";
import { sanityWriteClient } from "@/lib/sanity/client";

export const runtime = "nodejs";

type NestedDoc = {
  barcode?: string;
  quantity?: number;
  _id?: string;
  convexProductKey?: string;
};

/**
 * Sanity webhook for product delete + quantity create/update.
 *
 * Delete: trigger on delete for type `product`.
 * Quantity: trigger on create/update for type `product`, projection including
 *   barcode, quantity, _id, convexProductKey.
 * Header: `Authorization: Bearer <INVENTORY_SYNC_SECRET>`
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

  const nested =
    body.document && typeof body.document === "object"
      ? (body.document as NestedDoc)
      : undefined;
  const after =
    body.after && typeof body.after === "object"
      ? (body.after as NestedDoc)
      : undefined;
  const source: NestedDoc = { ...nested, ...after, ...body } as NestedDoc;

  const operation =
    (typeof body.operation === "string" && body.operation) ||
    (typeof body._type === "string" && body._type === "deletion"
      ? "delete"
      : undefined) ||
    (typeof (body as { transition?: string }).transition === "string"
      ? (body as { transition: string }).transition
      : undefined);

  const barcodeField = resolveBarcode(source, body);
  if (!barcodeField) {
    return NextResponse.json(
      { error: "Could not resolve barcode from webhook payload" },
      { status: 400 },
    );
  }

  const isDelete =
    operation === "delete" ||
    operation === "deletion" ||
    body._deleted === true ||
    // Legacy delete-only webhook: no quantity field in projection.
    (typeof source.quantity !== "number" &&
      !("quantity" in body) &&
      nested?.quantity === undefined &&
      after?.quantity === undefined &&
      operation !== "create" &&
      operation !== "update" &&
      operation !== "createOrReplace");

  // Prefer quantity sync when a numeric quantity is present (create/update).
  const quantityRaw =
    typeof source.quantity === "number"
      ? source.quantity
      : typeof body.quantity === "number"
        ? body.quantity
        : undefined;

  if (
    typeof quantityRaw === "number" &&
    Number.isFinite(quantityRaw) &&
    !isDelete
  ) {
    const convexProductKey =
      (typeof source.convexProductKey === "string" && source.convexProductKey) ||
      (typeof body.convexProductKey === "string"
        ? body.convexProductKey
        : undefined);

    try {
      await notifyConvexQuantity(barcodeField, quantityRaw, convexProductKey);
      revalidatePath("/");
      revalidatePath("/shop");
      revalidateTag("catalog", "max");
      return NextResponse.json({
        synced: true as const,
        barcode: barcodeField,
        quantity: quantityRaw,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Webhook quantity sync failed";
      console.error("sanity quantity webhook failed", err);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  if (!isDelete && typeof quantityRaw !== "number") {
    return NextResponse.json(
      { skipped: true, reason: "No quantity and not a delete" },
      { status: 200 },
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

function resolveBarcode(
  source: NestedDoc,
  body: Record<string, unknown>,
): string | undefined {
  if (typeof source.barcode === "string" && source.barcode) {
    return source.barcode;
  }
  if (typeof body.barcode === "string" && body.barcode) {
    return body.barcode;
  }
  const id =
    (typeof source._id === "string" && source._id) ||
    (typeof body._id === "string" ? body._id : undefined);
  if (id?.startsWith("product.barcode.")) {
    return id.replace(/^product\.barcode\./, "");
  }
  if (id?.startsWith("drafts.product.barcode.")) {
    return id.replace(/^drafts\.product\.barcode\./, "");
  }
  return undefined;
}
