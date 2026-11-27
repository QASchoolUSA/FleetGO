import { NextResponse } from "next/server";
import { parseShippingAddress } from "@/lib/shipping/address";
import { quoteCartShipping, type ShippingCartItem } from "@/lib/shipping/quote";
import { ShippingQuoteError } from "@/lib/shipping/usps";

export async function POST(request: Request) {
  try {
    const parsed = await request.json();
    const body = parsed && typeof parsed === "object"
      ? parsed as { items?: ShippingCartItem[]; shippingAddress?: unknown }
      : {};
    const address = parseShippingAddress(body.shippingAddress);
    if (!address) {
      return NextResponse.json({ error: "Enter a complete U.S. shipping address to see the USPS rate." }, { status: 400 });
    }

    const quote = await quoteCartShipping(body.items || [], address.postalCode);
    return NextResponse.json({ quote });
  } catch (error) {
    const status = error instanceof ShippingQuoteError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Unable to calculate shipping.";
    if (status >= 500) console.error("USPS quote failed", error);
    return NextResponse.json({ error: message }, { status });
  }
}
