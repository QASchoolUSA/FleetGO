import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CatalogCategory } from "@/lib/catalog/types";

export function FeaturedCategories({ categories }: { categories: CatalogCategory[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
      <div className="mb-8 max-w-2xl">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold uppercase tracking-wide text-[var(--navy)] sm:text-4xl">
          Shop by category
        </h2>
        <p className="mt-2 text-[var(--ink-muted)]">
          Navigate like a parts counter — brakes to Class 8 air systems, without the maze.
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) => (
          <li key={cat.id} className="bg-[var(--surface)]">
            <Link
              href={`/c/${cat.slug}`}
              className="group flex h-full min-h-[5.5rem] flex-col justify-between gap-3 px-4 py-4 transition-colors hover:bg-[var(--surface-muted)] focus-visible:bg-[var(--surface-muted)] sm:min-h-[6.5rem] sm:px-5 sm:py-5"
            >
              <span className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-wide text-[var(--navy)] sm:text-2xl">
                {cat.title}
              </span>
              <span className="flex items-end justify-between gap-3">
                {cat.description ? (
                  <span className="line-clamp-2 text-sm leading-snug text-[var(--ink-muted)]">
                    {cat.description}
                  </span>
                ) : (
                  <span className="text-sm text-[var(--ink-muted)]">Browse parts</span>
                )}
                <ArrowRight
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--field)] transition-transform group-hover:translate-x-0.5"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
