import type { Metadata } from "next";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { getCatalog } from "@/lib/catalog/adapter";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search",
    robots: q ? { index: true, follow: true } : { index: false, follow: true },
    alternates: { canonical: q ? `/search?q=${encodeURIComponent(q)}` : "/search" },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const products = q ? await getCatalog().getProducts({ q }) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold uppercase tracking-wide text-[var(--navy)]">
        Search results
      </h1>
      <p className="mt-2 text-[var(--ink-muted)]">
        {q ? (
          <>
            Showing results for <span className="font-semibold text-[var(--navy)]">&ldquo;{q}&rdquo;</span> —{" "}
            {products.length} found
          </>
        ) : (
          "Enter a part name, SKU, MPN, or barcode in the search bar."
        )}
      </p>
      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
