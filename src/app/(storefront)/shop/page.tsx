import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CatalogControls } from "@/components/catalog/CatalogControls";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { getCatalog } from "@/lib/catalog/adapter";
import { parseProductQuery } from "@/lib/catalog/query";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Shop all parts",
  description: "Browse FleetGo auto and semi truck parts by category, brand, and duty class.",
  alternates: { canonical: "/shop" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = parseProductQuery(params);
  const catalog = getCatalog();
  const [products, categories, brands] = await Promise.all([
    catalog.getProducts(query),
    catalog.getCategories(),
    catalog.getBrands(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
      <nav className="mb-3 text-sm text-[var(--ink-muted)] sm:mb-4">
        <Link href="/" className="hover:text-[var(--navy)]">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-[var(--navy)]">Shop</span>
      </nav>

      <header className="mb-4 border-b border-[var(--line)] pb-4 sm:mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold uppercase tracking-wide text-[var(--navy)] sm:text-4xl">
          Shop all parts
        </h1>
        <p className="mt-1.5 text-sm font-medium text-[var(--ink-muted)]">
          {products.length} part{products.length === 1 ? "" : "s"} available
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-8">
        <Suspense fallback={null}>
          <CatalogControls
            categories={categories}
            brands={brands}
            resultCount={products.length}
          />
        </Suspense>
        <ProductGrid products={products} filterByVehicle />
      </div>
    </div>
  );
}
