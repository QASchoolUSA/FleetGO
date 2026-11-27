import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping",
  description: "FleetGo U.S. shipping rates, delivery timing, and package details.",
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold uppercase tracking-wide text-[var(--navy)]">
        Shipping
      </h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[var(--ink-muted)]">
        <p>U.S. orders ship from Haines City, Florida 33844. In-stock orders placed before 3 PM CT on business days typically ship the same day.</p>
        <p>USPS Ground Advantage shipping is calculated at checkout from your delivery ZIP code and the package estimates for each item and quantity. The rate shown before payment is the amount added to your order.</p>
        <p>You will receive tracking once the carrier scans your package. For fleet drop-ships or will-call, contact the parts desk.</p>
      </div>
    </article>
  );
}
