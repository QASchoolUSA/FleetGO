import { PackageCheck, ShieldCheck, Truck } from "lucide-react";

const items = [
  {
    icon: Truck,
    title: "Fleet-ready shipping",
    copy: "Fast fulfillment for shops and owner-operators across the continental US.",
  },
  {
    icon: ShieldCheck,
    title: "Fitment first",
    copy: "Year / make / model guidance so you order the part that bolts up.",
  },
  {
    icon: PackageCheck,
    title: "Real part numbers",
    copy: "SKU, MPN, and barcode-ready data for counters and mobile inventory.",
  },
];

export function TrustStrip() {
  return (
    <section className="border-y border-[var(--line)] bg-[var(--surface-muted)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        {items.map(({ icon: Icon, title, copy }) => (
          <div key={title} className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--navy)] text-white">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--navy)]">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">{copy}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
