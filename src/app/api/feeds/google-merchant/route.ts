import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog/adapter";
import type { CatalogProduct } from "@/lib/catalog/types";
import { buildMerchantFeed } from "@/lib/google/merchantFeed";
import { isSanityConfigured } from "@/lib/sanity/env";

export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const secret = process.env.GOOGLE_MERCHANT_FEED_SECRET?.trim();
  if (!secret) return false;

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (key && key === secret) return true;

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ") && auth.slice(7) === secret) return true;

  return false;
}

/**
 * Google Merchant Center primary product feed (TSV).
 * Register as a scheduled fetch:
 *   https://www.fleetgollc.com/api/feeds/google-merchant?key=<GOOGLE_MERCHANT_FEED_SECRET>
 */
export async function GET(request: Request) {
  if (!process.env.GOOGLE_MERCHANT_FEED_SECRET?.trim()) {
    return NextResponse.json(
      { error: "GOOGLE_MERCHANT_FEED_SECRET is not configured" },
      { status: 503 },
    );
  }

  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSanityConfigured()) {
    return NextResponse.json({ error: "The production Sanity catalog is required for the Merchant Center feed." }, { status: 503 });
  }

  const catalog = getCatalog();
  let products: CatalogProduct[];
  try {
    products = await catalog.getProducts();
  } catch (error) {
    console.error("Google Merchant catalog fetch failed", error);
    return NextResponse.json({ error: "The production catalog could not be read." }, { status: 503 });
  }
  if (!products.length) {
    return NextResponse.json({ error: "The production catalog returned no products." }, { status: 503 });
  }

  const { tsv, skipped } = buildMerchantFeed(products);
  if (skipped.length) {
    return NextResponse.json({
      error: "The catalog feed is incomplete; fix product eligibility or package-profile gaps before Google fetches it.",
      skippedCount: skipped.length,
      examples: skipped.slice(0, 10).map((item) => ({ productId: item.productId, reasons: item.reasons })),
    }, { status: 503 });
  }

  return new NextResponse(tsv, {
    status: 200,
    headers: {
      "Content-Type": "text/tab-separated-values; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}
