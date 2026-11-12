import Link from "next/link";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalog } from "@/lib/catalog/adapter";
import { organizationJsonLd } from "@/lib/seo";

export const revalidate = 120;

export default async function HomePage() {
  const catalog = getCatalog();
  const [categories, featured, settings] = await Promise.all([
    catalog.getCategories(),
    catalog.getProducts({ featured: true }),
    catalog.getSiteSettings(),
  ]);

  return (
    <>
      <JsonLd data={organizationJsonLd(settings)} />
      <Hero />
      <TrustStrip />
      <FeaturedCategories categories={categories} />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold uppercase tracking-wide text-[var(--navy)] sm:text-4xl">
              Featured parts
            </h2>
            <p className="mt-2 text-[var(--ink-muted)]">
              High-turn SKUs for light-duty and Class 8 maintenance.
            </p>
          </div>
          <Link href="/shop" className="hidden text-sm font-semibold text-[var(--field)] hover:underline sm:inline">
            View all
          </Link>
        </div>
        <ProductGrid products={featured.slice(0, 8)} />
      </section>
    </>
  );
}
