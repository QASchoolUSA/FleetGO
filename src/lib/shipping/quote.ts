import { getCatalog } from "@/lib/catalog/adapter";
import { getPackageProfileForProduct } from "@/lib/shipping/packageProfiles";
import { shippingConfig } from "@/lib/shipping/config";
import { getGroundAdvantageRateCents, ShippingQuoteError } from "@/lib/shipping/usps";

export type ShippingCartItem = { slug: string; quantity: number };

export type ShippingQuote = {
  service: typeof shippingConfig.service;
  amountCents: number;
  currency: "usd";
  lines: {
    sku: string;
    title: string;
    quantity: number;
    unitAmountCents: number;
    confidence: "high" | "medium" | "low";
  }[];
};

export async function quoteCartShipping(
  items: ShippingCartItem[],
  destinationZip: string,
): Promise<ShippingQuote> {
  if (!Array.isArray(items) || !items.length || items.length > 25) {
    throw new ShippingQuoteError("Your cart must contain between 1 and 25 different products.", 400);
  }
  if (items.some((item) => !item || typeof item.slug !== "string" || !item.slug.trim() || item.slug.length > 200)) {
    throw new ShippingQuoteError("One or more cart items are invalid. Refresh your cart and try again.", 400);
  }
  if (items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100)) {
    throw new ShippingQuoteError("Enter a valid quantity for every cart item.", 400);
  }

  const catalog = getCatalog();
  const products = await Promise.all(items.map((item) => catalog.getProductBySlug(item.slug)));
  const prepared: {
    product: NonNullable<(typeof products)[number]>;
    quantity: number;
    profile: NonNullable<ReturnType<typeof getPackageProfileForProduct>>;
  }[] = [];
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const product = products[index];
    if (!product || product.stockStatus === "out_of_stock") {
      throw new ShippingQuoteError("A product in your cart is unavailable. Refresh your cart and try again.", 409);
    }

    const profile = getPackageProfileForProduct(product);
    if (!profile) {
      throw new ShippingQuoteError(`Shipping package details are not available for ${product.sku}. Please contact FleetGo for a quote.`, 422);
    }

    prepared.push({ product, quantity: item.quantity, profile });
  }

  const rates = new Array<number>(prepared.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(5, prepared.length) }, async () => {
    while (nextIndex < prepared.length) {
      const index = nextIndex++;
      rates[index] = await getGroundAdvantageRateCents(destinationZip, prepared[index].profile);
    }
  });
  await Promise.all(workers);

  const lines = prepared.map(({ product, quantity, profile }, index) => ({
    sku: product.sku,
    title: product.title,
    quantity,
    unitAmountCents: rates[index],
    confidence: profile.confidence,
  }));
  const amountCents = lines.reduce((sum, line) => sum + line.unitAmountCents * line.quantity, 0);

  return { service: shippingConfig.service, amountCents, currency: "usd", lines };
}
