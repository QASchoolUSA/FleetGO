import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import {
  deleteInventoryProduct,
  patchInventoryQuantity,
  syncInventoryProduct,
  type InventorySyncPayload,
  type QuantityOnlyPayload,
} from "@/lib/sanity/writeProduct";
import { isSanityConfigured } from "@/lib/sanity/env";
import { sanityWriteClient } from "@/lib/sanity/client";

export const runtime = "nodejs";
export const maxDuration = 60;

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function isAuthorized(request: Request): boolean {
  const secret = process.env.INVENTORY_SYNC_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const alt = request.headers.get("x-inventory-sync-secret") || "";
  return bearer === secret || alt === secret;
}

function asString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number.parseFloat(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function parseQuantityOnly(body: Record<string, unknown>): QuantityOnlyPayload | null {
  if (body.quantityOnly !== true) return null;
  const barcode = asString(body.barcode);
  const convexProductKey = asString(body.convexProductKey);
  const quantity = asNumber(body.quantity);
  const contentHash = asString(body.contentHash);
  if (!barcode || !convexProductKey || quantity === undefined || !contentHash) {
    return null;
  }
  return {
    quantityOnly: true,
    barcode,
    convexProductKey,
    quantity: Math.max(0, Math.floor(quantity)),
    contentHash,
  };
}

function parseFullSync(body: Record<string, unknown>): InventorySyncPayload | { error: string } {
  const title = asString(body.title);
  const barcode = asString(body.barcode);
  const sku = asString(body.sku) || barcode;
  const convexProductKey = asString(body.convexProductKey);
  const contentHash = asString(body.contentHash);
  const price = asNumber(body.price);
  const quantity = asNumber(body.quantity) ?? 0;
  const currency = asString(body.currency) || "USD";
  const imageUrls = Array.isArray(body.imageUrls)
    ? body.imageUrls.filter((u): u is string => typeof u === "string" && /^https?:\/\//i.test(u))
    : [];

  if (!title) return { error: "title is required" };
  if (!barcode) return { error: "barcode is required" };
  if (!sku) return { error: "sku is required" };
  if (!convexProductKey) return { error: "convexProductKey is required" };
  if (!contentHash) return { error: "contentHash is required" };
  if (price === undefined || price < 0) return { error: "price must be a non-negative number" };
  if (imageUrls.length === 0) return { error: "imageUrls must include at least one URL" };

  const fitment = Array.isArray(body.fitment)
    ? body.fitment
        .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
        .map((row) => ({
          yearFrom: asNumber(row.yearFrom),
          yearTo: asNumber(row.yearTo),
          make: asString(row.make),
          model: asString(row.model),
          engine: asString(row.engine),
          notes: asString(row.notes),
        }))
    : undefined;

  const specs = Array.isArray(body.specs)
    ? body.specs
        .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
        .map((row) => ({
          label: asString(row.label) ?? "",
          value: asString(row.value) ?? "",
        }))
        .filter((row) => row.label && row.value)
    : undefined;

  return {
    title,
    brand: asString(body.brand),
    category: asString(body.category),
    description: asString(body.description),
    mpn: asString(body.mpn),
    barcode,
    sku,
    quantity: Math.max(0, Math.floor(quantity)),
    currency,
    price,
    compareAtPrice: asNumber(body.compareAtPrice),
    imageUrls,
    convexProductKey,
    contentHash,
    imageSource: asString(body.imageSource),
    fitment,
    specs,
    autoPublish: body.autoPublish === false ? false : process.env.AUTO_PUBLISH !== "false",
  };
}

function revalidatePaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidateTag("catalog", "max");
  if (slug) {
    revalidatePath(`/p/${slug}`);
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return unauthorized();
  }

  if (!isSanityConfigured() || !sanityWriteClient) {
    return NextResponse.json(
      { error: "Sanity write client is not configured" },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (body.delete === true) {
      const barcode = asString(body.barcode);
      if (!barcode) {
        return NextResponse.json({ error: "barcode is required" }, { status: 400 });
      }
      const result = await deleteInventoryProduct(barcode, {
        notifyConvex: body.source !== "convex",
      });
      revalidatePaths(result.slug || undefined);
      return NextResponse.json(result);
    }

    const quantityOnly = parseQuantityOnly(body);
    if (quantityOnly) {
      const result = await patchInventoryQuantity(quantityOnly);
      revalidatePaths(result.slug || undefined);
      return NextResponse.json(result);
    }

    const parsed = parseFullSync(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const result = await syncInventoryProduct(parsed);
    revalidatePaths(result.slug);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    console.error("inventory sync failed", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
