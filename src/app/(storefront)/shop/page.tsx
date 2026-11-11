import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Filters } from "@/components/catalog/Filters";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { getCatalog } from "@/lib/catalog/adapter";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Shop all parts",
  description: "Browse FleetGo auto and semi truck parts by category, brand, and duty class.",
  alternates: { canonical: "/shop" },
};

type SearchParams = Promise<{ duty?: string; brand?: string; q?: string }>;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const catalog = getCatalog();
  const [products, categories, brands] = await Promise.all([
    catalog.getProducts({
      duty: params.duty,
      brand: params.brand,
      q: params.q,
    }),
    catalog.getCategories(),
    catalog.getBrands(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <nav className="mb-4 text-sm text-[var(--ink-muted)]">
        <Link href="/" className="hover:text-[var(--navy)]">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-[var(--navy)]">Shop</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[200px_1fr] lg:items-start">
        <Suspense fallback={null}>
          <Filters categories={categories} brands={brands} />
        </Suspense>

        <div>
          <header className="mb-5 border-b border-[var(--line)] pb-4">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold uppercase tracking-wide text-[var(--navy)] sm:text-4xl">
              Shop all parts
            </h1>
            <p className="mt-2 text-sm font-medium text-[var(--ink-muted)]">
              {products.length} part{products.length === 1 ? "" : "s"} available
            </p>
          </header>
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
