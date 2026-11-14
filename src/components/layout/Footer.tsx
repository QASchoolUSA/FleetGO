import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto bg-[var(--field)] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 md:gap-10">
        <div className="md:col-span-1">
          <p className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.04em]">
            Fleet<span className="text-[var(--signal)]">Go</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
            Auto and semi truck parts for shops, fleets, and owner-operators who need the right part the first time.
          </p>
        </div>
        <div>
          <h3 className="text-xs font-medium text-white/55">Shop</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><Link href="/shop" className="transition-colors hover:text-white">All parts</Link></li>
            <li><Link href="/c/semi-hd" className="transition-colors hover:text-white">Semi / HD</Link></li>
            <li><Link href="/c/brakes" className="transition-colors hover:text-white">Brakes</Link></li>
            <li><Link href="/c/filters" className="transition-colors hover:text-white">Filters</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-medium text-white/55">Help</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><Link href="/shipping" className="transition-colors hover:text-white">Shipping</Link></li>
            <li><Link href="/returns" className="transition-colors hover:text-white">Returns</Link></li>
            <li><Link href="/contact" className="transition-colors hover:text-white">Contact</Link></li>
            <li><Link href="/about" className="transition-colors hover:text-white">About FleetGo</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-medium text-white/55">Talk to parts</h3>
          <p className="mt-3 text-sm text-white/80">
            <a href="tel:18005550188" className="font-medium text-white hover:underline">
              (800) 555-0188
            </a>
          </p>
          <p className="mt-1 text-sm text-white/70">
            <a href="mailto:parts@fleetgo.com" className="transition-colors hover:text-white">
              parts@fleetgo.com
            </a>
          </p>
          <p className="mt-4 text-xs leading-relaxed text-white/50">
            Mon–Fri 7 AM–7 PM CT · Sat 8 AM–5 PM CT
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} FleetGo. All rights reserved.</p>
          <p>*Free shipping on qualifying continental US orders over $99 before tax.</p>
        </div>
      </div>
    </footer>
  );
}
