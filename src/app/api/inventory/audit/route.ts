import { NextResponse } from "next/server";
import { fetchConvexAdminCatalog } from "@/lib/admin/convexCatalog";
import {
  buildManifestAudit,
  convexToInventory,
} from "@/lib/admin/manifestAudit";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

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

/**
 * Authenticated inventory reconciliation audit (same payload as /admin console).
 * Used by the Parts Catalog mobile app via Convex proxy.
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return unauthorized();
  }

  try {
    const convexProducts = await fetchConvexAdminCatalog();
    const audit = await buildManifestAudit(convexToInventory(convexProducts), {
      source: "convex",
      convexMeta: convexProducts,
    });
    return NextResponse.json(audit);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to build inventory audit";
    console.error("inventory audit API failed", error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
