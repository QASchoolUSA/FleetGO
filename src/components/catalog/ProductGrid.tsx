import type { CatalogProduct } from "@/lib/catalog/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: CatalogProduct[] }) {
  if (!products.length) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface-muted)] px-6 py-12 text-center">
        <p className="font-semibold text-[var(--navy)]">No parts matched</p>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Try another search, category, or clear your vehicle filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 items-start gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
