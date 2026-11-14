import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About FleetGo",
  description: "FleetGo supplies auto and semi truck parts with fitment-first shopping and fleet-ready fulfillment.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold uppercase tracking-wide text-[var(--navy)]">
        About FleetGo
      </h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[var(--ink-muted)]">
        <p>
          FleetGo is built for shops, fleets, and owner-operators who need the right part without the noise.
          We focus on clear part numbers, vehicle fitment, and a catalog that spans light-duty trucks through Class 8.
        </p>
        <p>
          Our storefront is designed to feel as navigable as a parts counter — search by name, SKU, MPN, or barcode,
          filter by duty class, and save your vehicle so compatible parts are easy to spot.
        </p>
        <p>
          In the future, FleetGo will sync with barcode-scanned inventory from our mobile catalog app, so stock on
          the shelf and stock online stay aligned.
        </p>
      </div>
    </article>
  );
}
