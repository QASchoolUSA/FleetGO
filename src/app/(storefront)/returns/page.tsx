import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Return Policy",
  description: "Eligible FleetGo parts may be returned within 30 days. Return shipping is covered by FleetGo.",
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold uppercase tracking-wide text-[var(--navy)]">
        Return Policy
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink-muted)]">
        Eligible parts may be returned within <strong className="font-semibold text-[var(--ink)]">30 calendar days of delivery</strong>.
        FleetGo covers return shipping for approved returns.
      </p>
      <p className="mt-2 text-xs text-[var(--ink-muted)]">Last updated: November 26, 2026</p>

      <section className="mt-10 space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-wide text-[var(--navy)]">
          Return eligibility
        </h2>
        <p className="text-[15px] leading-relaxed text-[var(--ink-muted)]">
          To qualify for a return, a part must be unused, uninstalled, unaltered, and include its original packaging,
          included hardware, and documentation. Parts that have been installed or show use are not eligible for a
          change-of-mind or fitment return. Contact us about a part that arrives damaged, incomplete, or defective.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-wide text-[var(--navy)]">
          How to start a return
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-[var(--ink-muted)]">
          <li>
            Contact{" "}
            <a href="mailto:parts@fleetgo.com" className="font-medium text-[var(--field)] hover:underline">
              parts@fleetgo.com
            </a>{" "}
            within 30 days of delivery with your order number, SKU, and reason for return.
          </li>
          <li>Wait for a return authorization and prepaid return instructions before shipping anything back.</li>
          <li>Pack the part securely and include the authorization number with the return.</li>
        </ol>
        <p className="text-[15px] leading-relaxed text-[var(--ink-muted)]">
          FleetGo covers approved return shipping. Original outbound shipping charges are refunded when an order was
          fulfilled incorrectly or arrived damaged; otherwise, outbound shipping charges are non-refundable.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-wide text-[var(--navy)]">
          Refunds
        </h2>
        <p className="text-[15px] leading-relaxed text-[var(--ink-muted)]">
          We inspect approved returns after receipt. Refunds are issued to the original payment method after inspection;
          your bank or card issuer may need additional time to post the credit.
        </p>
      </section>

      <p className="mt-12 border-t border-[var(--line)] pt-6 text-[15px] leading-relaxed text-[var(--ink-muted)]">
        Questions about delivery? See{" "}
        <Link href="/shipping" className="font-medium text-[var(--field)] hover:underline">
          shipping
        </Link>{" "}
        or{" "}
        <Link href="/contact" className="font-medium text-[var(--field)] hover:underline">
          contact the parts desk
        </Link>
        .
      </p>
    </article>
  );
}
