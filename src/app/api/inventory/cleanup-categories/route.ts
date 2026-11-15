import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  deleteEmptyCategories,
  remapProductsToExpertCategories,
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

export async function POST(request: Request) {
  if (!isAuthorized(request)) return unauthorized();
  if (!isSanityConfigured() || !sanityWriteClient) {
    return NextResponse.json({ error: "Sanity write client is not configured" }, { status: 503 });
  }

  try {
    const remap = await remapProductsToExpertCategories();
    const cleanup = await deleteEmptyCategories();
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/c", "layout");
    return NextResponse.json({
      ok: true,
      remapped: remap.remapped,
      unchanged: remap.unchanged,
      deleted: cleanup.deleted,
      kept: cleanup.kept,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cleanup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
