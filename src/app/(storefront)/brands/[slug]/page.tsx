import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { getCatalog } from "@/lib/catalog/adapter";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getCatalog().getBrandBySlug(slug);
  if (!brand) return { title: "Brand" };
  return {
    title: brand.title,
    description: brand.description || `Shop ${brand.title} parts at FleetGo.`,
    alternates: { canonical: `/brands/${slug}` },
  };
}

export async function generateStaticParams() {
  const brands = await getCatalog().getBrands();
  return brands.map((b) => ({ slug: b.slug }));
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const catalog = getCatalog();
  const brand = await catalog.getBrandBySlug(slug);
  if (!brand) notFound();
  const products = await catalog.getProducts({ brand: slug });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold uppercase tracking-wide text-[var(--navy)]">
        {brand.title}
      </h1>
      {brand.description ? (
        <p className="mt-3 max-w-2xl text-[var(--ink-muted)]">{brand.description}</p>
      ) : null}
      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
