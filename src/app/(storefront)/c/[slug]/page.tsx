import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogControls } from "@/components/catalog/CatalogControls";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalog } from "@/lib/catalog/adapter";
import { parseProductQuery } from "@/lib/catalog/query";
import { breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 120;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCatalog().getCategoryBySlug(slug);
  if (!category) return { title: "Category" };
  return {
    title: category.title,
    description: category.description || `Shop ${category.title} at FleetGo.`,
    alternates: { canonical: `/c/${slug}` },
  };
}

export async function generateStaticParams() {
  const categories = await getCatalog().getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const raw = await searchParams;
  const query = parseProductQuery(raw);
  const catalog = getCatalog();
  const category = await catalog.getCategoryBySlug(slug);
  if (!category) notFound();

  const [products, categories, brands] = await Promise.all([
    catalog.getProducts({ ...query, category: slug }),
    catalog.getCategories(),
    catalog.getBrands(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: category.title, path: `/c/${slug}` },
        ])}
      />

      <nav className="mb-3 text-sm text-[var(--ink-muted)] sm:mb-4">
        <Link href="/" className="hover:text-[var(--navy)]">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <Link href="/shop" className="hover:text-[var(--navy)]">
          Shop
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-[var(--navy)]">{category.title}</span>
      </nav>

      <div className="mb-5 sm:mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold uppercase tracking-wide text-[var(--navy)] sm:text-4xl">
          {category.title}
        </h1>
        {category.description ? (
          <p className="mt-2 max-w-2xl text-sm text-[var(--ink-muted)] sm:text-[15px]">
            {category.description}
          </p>
        ) : null}
        <p className="mt-1.5 text-sm font-medium text-[var(--ink-muted)]">
          {products.length} part{products.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-8">
        <Suspense fallback={null}>
          <CatalogControls
            categories={categories}
            brands={brands}
            activeCategory={slug}
            resultCount={products.length}
          />
        </Suspense>
        <ProductGrid products={products} filterByVehicle />
      </div>
    </div>
  );
}
