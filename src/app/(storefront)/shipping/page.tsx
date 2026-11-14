import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping",
  description: "FleetGo shipping policies for continental US parts orders.",
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold uppercase tracking-wide text-[var(--navy)]">
        Shipping
      </h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[var(--ink-muted)]">
        <p>Orders placed before 3 PM CT on business days typically ship the same day when items are in stock.</p>
        <p>Free ground shipping applies to qualifying continental US orders over $99 before tax. Oversized freight and hazardous items may require additional charges shown at checkout.</p>
        <p>You will receive tracking once the carrier scans your package. For fleet drop-ships or will-call, contact the parts desk.</p>
      </div>
    </article>
  );
}
