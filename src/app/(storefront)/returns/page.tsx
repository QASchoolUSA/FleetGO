import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns",
  description: "FleetGo return policy for unused auto and truck parts.",
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold uppercase tracking-wide text-[var(--navy)]">
        Returns
      </h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[var(--ink-muted)]">
        <p>Unused parts in original packaging may be returned within 30 days of delivery for a refund to the original payment method.</p>
        <p>Electrical components, special orders, and opened fluids are final sale unless defective. Contact us before shipping a return so we can issue an RMA.</p>
        <p>Defective parts within warranty will be replaced or credited after inspection. Keep your order confirmation and photos of the issue when requesting warranty support.</p>
      </div>
    </article>
  );
}
