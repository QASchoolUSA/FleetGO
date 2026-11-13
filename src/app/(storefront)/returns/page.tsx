import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Return Policy",
  description:
    "FleetGo accepts returns of defective products only. Exchanges are available; return and replacement shipping are at the customer’s expense.",
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold uppercase tracking-wide text-[var(--navy)]">
        Return Policy
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink-muted)]">
        FleetGo sells automotive and heavy-duty parts for professional use. To keep pricing and inventory
        accurate, we accept returns of <strong className="font-semibold text-[var(--ink)]">defective products only</strong>.
        Change-of-mind, incorrect fitment selected by the buyer, and unused “buy and try” returns are not accepted.
      </p>
      <p className="mt-2 text-xs text-[var(--ink-muted)]">Last updated: November 13, 2026</p>

      <section className="mt-10 space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold uppercase tracking-wide text-[var(--navy)]">
          What qualifies as defective
        </h2>
        <p className="text-[15px] leading-relaxed text-[var(--ink-muted)]">
          A product may be eligible for return or exchange if it arrives damaged, is missing required components
          as shipped, or fails under normal use due to a manufacturing or material defect within{" "}
          <strong className="font-semibold text-[var(--ink)]">30 days of delivery</strong>, provided:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-[var(--ink-muted)]">
          <li>You contact us before sending anything back and receive a written Return Merchandise Authorization (RMA).</li>
          <li>You provide the order number, part number / SKU, and clear photos or video of the defect or damage.</li>
          <li>The part has not been altered, misinstalled, or damaged by improper tools, fluids, torque, or electrical overload outside OEM specifications.</li>
          <li>Where applicable, original packaging and any included hardware or documentation are returned with the part.</li>
        </ul>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold uppercase tracking-wide text-[var(--navy)]">
          What we do not accept
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-[var(--ink-muted)]">
          <li>Parts that are the wrong application because the buyer selected the incorrect vehicle, year, make, model, or options.</li>
          <li>Opened, installed, or used parts that show no verified defect after inspection.</li>
          <li>Special-order, made-to-order, or non-stocked items unless they arrive defective or damaged in transit.</li>
          <li>Electrical modules, sensors, or computers that show signs of improper wiring, reverse polarity, or water intrusion after installation.</li>
          <li>Returns without a prior RMA, or shipments sent to any address other than the one we provide with the RMA.</li>
        </ul>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold uppercase tracking-wide text-[var(--navy)]">
          Exchanges
        </h2>
        <p className="text-[15px] leading-relaxed text-[var(--ink-muted)]">
          Where a defective part is confirmed (or strongly indicated by your documentation), we may offer an{" "}
          <strong className="font-semibold text-[var(--ink)]">exchange for the same part</strong> when stock is available.
        </p>
        <p className="text-[15px] leading-relaxed text-[var(--ink-muted)]">
          <strong className="font-semibold text-[var(--ink)]">Shipping for exchanges is at the customer’s expense.</strong>{" "}
          That includes outbound shipping of the replacement and return shipping of the defective unit, unless we
          determine the defect was caused by FleetGo packing error or carrier damage that we elect to cover. We do
          not prepay return labels for routine defect exchanges.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold uppercase tracking-wide text-[var(--navy)]">
          Refunds &amp; credits
        </h2>
        <p className="text-[15px] leading-relaxed text-[var(--ink-muted)]">
          If an exchange is not available or you prefer a refund after we approve a defective return, we will refund
          the product purchase price to the original payment method after the part is received and inspected.
          Original outbound shipping charges are non-refundable except when we determine the order was fulfilled
          incorrectly or damaged in transit due to our packing.
        </p>
        <p className="text-[15px] leading-relaxed text-[var(--ink-muted)]">
          Inspection typically completes within 5–10 business days of receipt. Approved refunds generally post within
          5–10 business days after approval, depending on your bank or card issuer.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold uppercase tracking-wide text-[var(--navy)]">
          How to start a claim
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-[var(--ink-muted)]">
          <li>
            Email{" "}
            <a href="mailto:parts@fleetgo.com" className="font-medium text-[var(--field)] hover:underline">
              parts@fleetgo.com
            </a>{" "}
            or call{" "}
            <a href="tel:18005550188" className="font-medium text-[var(--field)] hover:underline">
              (800) 555-0188
            </a>{" "}
            with your order number, SKU / MPN, and photos of the defect or shipping damage.
          </li>
          <li>Wait for written RMA approval and return instructions. Do not ship without an RMA.</li>
          <li>
            Pack the part securely, mark the RMA number on the outside of the carton, and ship with tracking at your
            expense (unless we state otherwise in writing).
          </li>
          <li>We inspect on arrival and confirm exchange shipment or refund / credit.</li>
        </ol>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold uppercase tracking-wide text-[var(--navy)]">
          Carrier damage
        </h2>
        <p className="text-[15px] leading-relaxed text-[var(--ink-muted)]">
          Inspect packages on delivery. If the carton is crushed or the part is damaged in transit, note it with the
          carrier when possible and contact us within 48 hours with photos of the packaging and the part. We will
          advise whether to refuse delivery, file a claim, or proceed under this defective-return process.
        </p>
      </section>

      <p className="mt-12 border-t border-[var(--line)] pt-6 text-[15px] leading-relaxed text-[var(--ink-muted)]">
        Questions about an order? See{" "}
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
