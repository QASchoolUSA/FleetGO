import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Filters } from "@/components/catalog/Filters";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalog } from "@/lib/catalog/adapter";
import { breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 120;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ duty?: string; brand?: string }>;
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
  const query = await searchParams;
  const catalog = getCatalog();
  const category = await catalog.getCategoryBySlug(slug);
  if (!category) notFound();

  const [products, categories, brands] = await Promise.all([
    catalog.getProducts({
      category: slug,
      duty: query.duty,
      brand: query.brand,
    }),
    catalog.getCategories(),
    catalog.getBrands(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: category.title, path: `/c/${slug}` },
        ])}
      />

      <nav className="mb-4 text-sm text-[var(--ink-muted)]">
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

      <div className="grid gap-8 lg:grid-cols-[200px_1fr] lg:items-start">
        <Suspense fallback={null}>
          <Filters categories={categories} brands={brands} activeCategory={slug} />
        </Suspense>

        <div>
          <header className="mb-5 border-b border-[var(--line)] pb-4">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold uppercase tracking-wide text-[var(--navy)] sm:text-4xl">
              {category.title}
            </h1>
            {category.description ? (
              <p className="mt-2 max-w-2xl text-sm text-[var(--ink-muted)] sm:text-[15px]">
                {category.description}
              </p>
            ) : null}
            <p className="mt-2 text-sm font-medium text-[var(--ink-muted)]">
              {products.length} part{products.length === 1 ? "" : "s"}
            </p>
          </header>
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
