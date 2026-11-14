import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to FleetGo parts specialists by phone or email.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold uppercase tracking-wide text-[var(--navy)]">
        Contact
      </h1>
      <p className="mt-4 text-[var(--ink-muted)]">
        Need help confirming fitment or placing a fleet order? Reach the parts desk.
      </p>
      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="font-medium text-[var(--navy)]">Phone</dt>
          <dd>
            <a href="tel:18005550188" className="text-[var(--field)] hover:underline">
              (800) 555-0188
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-medium text-[var(--navy)]">Email</dt>
          <dd>
            <a href="mailto:parts@fleetgo.com" className="text-[var(--field)] hover:underline">
              parts@fleetgo.com
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-medium text-[var(--navy)]">Hours</dt>
          <dd className="text-[var(--ink-muted)]">Mon–Fri 7 AM–7 PM CT · Sat 8 AM–5 PM CT</dd>
        </div>
        <div>
          <dt className="font-medium text-[var(--navy)]">Address</dt>
          <dd className="text-[var(--ink-muted)]">1200 Commerce Blvd, Dallas, TX 75201</dd>
        </div>
      </dl>
    </article>
  );
}
