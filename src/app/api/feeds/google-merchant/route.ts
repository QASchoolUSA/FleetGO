import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog/adapter";
import { buildMerchantFeed } from "@/lib/google/merchantFeed";

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
 *   https://fleetgollc.com/api/feeds/google-merchant?key=<GOOGLE_MERCHANT_FEED_SECRET>
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

  const catalog = getCatalog();
  const products = await catalog.getProducts();
  const { tsv } = buildMerchantFeed(products);

  return new NextResponse(tsv, {
    status: 200,
    headers: {
      "Content-Type": "text/tab-separated-values; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}
