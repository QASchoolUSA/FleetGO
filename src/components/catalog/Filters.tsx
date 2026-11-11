"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { CatalogBrand, CatalogCategory } from "@/lib/catalog/types";
import { cn } from "@/lib/format";

export function Filters({
  categories,
  brands,
  activeCategory,
}: {
  categories: CatalogCategory[];
  brands: CatalogBrand[];
  activeCategory?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const duty = searchParams.get("duty") || "all";
  const brand = searchParams.get("brand") || "";

  function hrefFor(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    });
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <aside className="space-y-7 lg:sticky lg:top-28 lg:self-start">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
          Duty
        </h3>
        <div className="mt-2 flex flex-col gap-1.5">
          {[
            { value: "all", label: "All vehicles" },
            { value: "light", label: "Light duty" },
            { value: "semi", label: "Semi / HD" },
          ].map((opt) => (
            <Link
              key={opt.value}
              href={hrefFor({ duty: opt.value })}
              className={cn(
                "rounded-md border px-3 py-2 text-sm",
                duty === opt.value
                  ? "border-[var(--navy)] bg-[var(--navy)] font-semibold text-white"
                  : "border-[var(--line)] hover:border-[var(--navy)]",
              )}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
          Categories
        </h3>
        <ul className="mt-2 space-y-0.5">
          <li>
            <Link
              href="/shop"
              className={cn(
                "block rounded-md px-2 py-1.5 text-sm hover:bg-[var(--surface-muted)]",
                !activeCategory && pathname === "/shop" && "bg-[var(--surface-muted)] font-semibold text-[var(--navy)]",
              )}
            >
              All parts
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/c/${cat.slug}`}
                className={cn(
                  "block rounded-md px-2 py-1.5 text-sm hover:bg-[var(--surface-muted)]",
                  activeCategory === cat.slug &&
                    "bg-[var(--surface-muted)] font-semibold text-[var(--navy)]",
                )}
              >
                {cat.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
          Brands
        </h3>
        <ul className="mt-2 space-y-0.5">
          {brands.map((b) => (
            <li key={b.id}>
              <Link
                href={hrefFor({ brand: brand === b.slug ? null : b.slug })}
                className={cn(
                  "block rounded-md px-2 py-1.5 text-sm hover:bg-[var(--surface-muted)]",
                  brand === b.slug && "bg-[var(--surface-muted)] font-semibold text-[var(--navy)]",
                )}
              >
                {b.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
