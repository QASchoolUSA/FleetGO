import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog/adapter";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { parseShippingAddress } from "@/lib/shipping/address";
import { quoteCartShipping, type ShippingCartItem } from "@/lib/shipping/quote";
import { ShippingQuoteError } from "@/lib/shipping/usps";

export async function POST(request: Request) {
  try {
    const parsed = await request.json();
    const body = parsed && typeof parsed === "object"
      ? parsed as { items?: ShippingCartItem[]; shippingAddress?: unknown }
      : {};
    const items = body.items ?? [];
    const shippingAddress = parseShippingAddress(body.shippingAddress);

    if (!items.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!shippingAddress) {
      return NextResponse.json({ error: "Enter a complete U.S. shipping address before continuing." }, { status: 400 });
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

    const shippingQuote = await quoteCartShipping(items, shippingAddress.postalCode);

    const catalog = getCatalog();
    const line_items: NonNullable<
      Parameters<typeof stripe.checkout.sessions.create>[0]["line_items"]
    > = [];

    for (const item of items) {
      const product = await catalog.getProductBySlug(item.slug);
      if (!product || product.stockStatus === "out_of_stock") {
        return NextResponse.json({ error: "A product in your cart is unavailable. Refresh your cart and try again." }, { status: 409 });
      }
      const unitAmount = Math.round(product.price * 100);
      if (unitAmount <= 0 || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
        return NextResponse.json({ error: `Invalid line item: ${product.sku}` }, { status: 400 });
      }

      line_items.push({
        quantity: item.quantity,
        price_data: {
          currency: (product?.currency || "usd").toLowerCase(),
          unit_amount: unitAmount,
          product_data: {
            name: product.title,
            description: `SKU ${product.sku}`,
            images: product.images[0]?.url ? [product.images[0].url] : [],
            metadata: {
              sku: product.sku,
              productId: product.id,
              slug: item.slug,
            },
          },
        },
      });
    }

    if (shippingQuote.amountCents > 0) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: shippingQuote.amountCents,
          product_data: {
            name: "USPS Ground Advantage shipping",
            description: `Shipping to ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}`,
            metadata: { type: "shipping", service: shippingQuote.service },
          },
        },
      });
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://")
      ? process.env.NEXT_PUBLIC_SITE_URL
      : "https://www.fleetgollc.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      ...(shippingAddress.email ? { customer_email: shippingAddress.email } : {}),
      payment_intent_data: {
        shipping: {
          name: shippingAddress.name,
          address: {
            line1: shippingAddress.line1,
            ...(shippingAddress.line2 ? { line2: shippingAddress.line2 } : {}),
            city: shippingAddress.city,
            state: shippingAddress.state,
            postal_code: shippingAddress.postalCode,
            country: "US",
          },
        },
        metadata: {
          source: "fleetgo-web",
          shipping_service: shippingQuote.service,
          shipping_amount_cents: String(shippingQuote.amountCents),
        },
      },
      metadata: {
        source: "fleetgo-web",
        shippingService: shippingQuote.service,
        shippingAmountCents: String(shippingQuote.amountCents),
        shippingZip: shippingAddress.postalCode,
      },
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (error) {
    if (error instanceof ShippingQuoteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("checkout error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
