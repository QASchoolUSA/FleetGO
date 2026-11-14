import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ActiveFilterChips } from "@/components/catalog/ActiveFilterChips";
import { CatalogControls } from "@/components/catalog/CatalogControls";
import { CatalogControlsFallback } from "@/components/catalog/CatalogControlsFallback";
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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <nav className="mb-4 text-sm text-[var(--ink-muted)]">
        <Link href="/" className="transition-colors hover:text-[var(--navy)]">
          Home
        </Link>
        <span className="mx-1.5 text-[var(--line)]">/</span>
        <span className="text-[var(--navy)]">Shop</span>
      </nav>

      <div className="mb-6 sm:mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold uppercase tracking-wide text-[var(--navy)] sm:text-4xl">
          Shop all parts
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          <span className="tabular-nums font-medium text-[var(--navy)]">{products.length}</span>
          {" "}
          part{products.length === 1 ? "" : "s"} in catalog
        </p>
        <Suspense fallback={null}>
          <ActiveFilterChips brands={brands} />
        </Suspense>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-10">
        <Suspense fallback={<CatalogControlsFallback />}>
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
