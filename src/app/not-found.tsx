import Link from "next/link";
import { SiteChrome } from "@/components/layout/SiteChrome";

export default function NotFound() {
  return (
    <SiteChrome>
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--signal)]">404</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold uppercase tracking-wide text-[var(--navy)]">
          Part not found
        </h1>
        <p className="mt-3 text-[var(--ink-muted)]">
          That page isn&apos;t in the catalog. Try search or browse by category.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex h-11 items-center rounded-md bg-[var(--navy)] px-5 text-sm font-semibold text-white"
        >
          Shop parts
        </Link>
      </div>
    </SiteChrome>
  );
}
