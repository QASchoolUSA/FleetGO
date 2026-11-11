import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { sanityWriteClient } from "@/lib/sanity/client";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret || webhookSecret.includes("your_")) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("stripe webhook verify failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (sanityWriteClient) {
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          limit: 100,
        });

        await sanityWriteClient.create({
          _type: "order",
          stripeSessionId: session.id,
          email: session.customer_details?.email || session.customer_email || "",
          total: (session.amount_total || 0) / 100,
          currency: (session.currency || "usd").toUpperCase(),
          status: "paid",
          createdAt: new Date().toISOString(),
          lineItems: lineItems.data.map((li) => ({
            _type: "object",
            sku: li.price?.product ? String(li.price.product) : li.description || "",
            title: li.description || "Item",
            quantity: li.quantity || 1,
            price: (li.amount_total || 0) / 100,
          })),
        });
      } catch (err) {
        console.error("Failed to write Sanity order", err);
      }
    } else {
      console.info("Order paid (Sanity write token not set)", {
        sessionId: session.id,
        email: session.customer_details?.email,
        total: session.amount_total,
      });
    }
  }

  return NextResponse.json({ received: true });
}
