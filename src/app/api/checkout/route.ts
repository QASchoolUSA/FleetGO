import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog/adapter";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

type CheckoutItem = {
  productId: string;
  slug: string;
  title: string;
  price: number;
  quantity: number;
  sku: string;
  image?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { items?: CheckoutItem[] };
    const items = body.items ?? [];

    if (!items.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local (test mode is fine).",
        },
        { status: 503 },
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe client unavailable" }, { status: 503 });
    }

    const catalog = getCatalog();
    const line_items = [];

    for (const item of items) {
      const product = await catalog.getProductBySlug(item.slug);
      const unitAmount = Math.round((product?.price ?? item.price) * 100);
      if (unitAmount <= 0 || item.quantity < 1) {
        return NextResponse.json({ error: `Invalid line item: ${item.sku}` }, { status: 400 });
      }

      line_items.push({
        quantity: item.quantity,
        price_data: {
          currency: (product?.currency || "usd").toLowerCase(),
          unit_amount: unitAmount,
          product_data: {
            name: product?.title || item.title,
            description: `SKU ${product?.sku || item.sku}`,
            images: item.image ? [item.image] : product?.images[0]?.url ? [product.images[0].url] : [],
            metadata: {
              sku: product?.sku || item.sku,
              productId: product?.id || item.productId,
              slug: item.slug,
            },
          },
        },
      });
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      shipping_address_collection: { allowed_countries: ["US", "CA"] },
      metadata: {
        source: "fleetgo-web",
      },
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (error) {
    console.error("checkout error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
