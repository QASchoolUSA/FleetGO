import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { AddToCart } from "@/components/product/AddToCart";
import { ProductGallery } from "@/components/product/ProductGallery";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalog } from "@/lib/catalog/adapter";
import { formatMoney, stockLabel } from "@/lib/format";
import { breadcrumbJsonLd, productJsonLd, productMetadata } from "@/lib/seo";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalog().getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return productMetadata(product);
}

export async function generateStaticParams() {
  const products = await getCatalog().getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const catalog = getCatalog();
  const product = await catalog.getProductBySlug(slug);
  if (!product) notFound();

  const related = (await catalog.getProducts({ category: product.categories[0]?.slug }))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <JsonLd data={productJsonLd(product)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          ...(product.categories[0]
            ? [{ name: product.categories[0].title, path: `/c/${product.categories[0].slug}` }]
            : []),
          { name: product.title, path: `/p/${product.slug}` },
        ])}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} title={product.title} />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
            <Link href={`/brands/${product.brandSlug}`} className="hover:text-[var(--field)]">
              {product.brand}
            </Link>
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold uppercase leading-tight tracking-wide text-[var(--navy)] sm:text-4xl">
            {product.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <p className="text-3xl font-bold text-[var(--navy)]">
              {formatMoney(product.price, product.currency)}
            </p>
            {product.compareAtPrice ? (
              <p className="pb-1 text-base text-[var(--ink-muted)] line-through">
                {formatMoney(product.compareAtPrice, product.currency)}
              </p>
            ) : null}
            <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--ink-muted)]">
              {stockLabel(product.stockStatus)}
            </span>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-md border border-[var(--line)] p-3">
              <dt className="text-[11px] uppercase tracking-wide text-[var(--ink-muted)]">SKU</dt>
              <dd className="mt-1 font-semibold">{product.sku}</dd>
            </div>
            {product.mpn ? (
              <div className="rounded-md border border-[var(--line)] p-3">
                <dt className="text-[11px] uppercase tracking-wide text-[var(--ink-muted)]">MPN</dt>
                <dd className="mt-1 font-semibold">{product.mpn}</dd>
              </div>
            ) : null}
            {product.barcode ? (
              <div className="rounded-md border border-[var(--line)] p-3">
                <dt className="text-[11px] uppercase tracking-wide text-[var(--ink-muted)]">Barcode</dt>
                <dd className="mt-1 font-semibold">{product.barcode}</dd>
              </div>
            ) : null}
          </dl>

          <p className="mt-6 text-[15px] leading-relaxed text-[var(--ink-muted)]">
            {product.description}
          </p>

          <div className="sticky bottom-0 z-20 mt-8 border-t border-[var(--line)] bg-white/95 py-4 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            <AddToCart product={product} />
          </div>

          {product.fitment.length > 0 && (
            <div className="mt-10">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold uppercase tracking-wide text-[var(--navy)]">
                Vehicle fitment
              </h2>
              <ul className="mt-3 divide-y divide-[var(--line)] rounded-lg border border-[var(--line)]">
                {product.fitment.map((f, i) => (
                  <li key={`${f.make}-${f.model}-${i}`} className="px-4 py-3 text-sm">
                    <span className="font-semibold text-[var(--navy)]">
                      {f.yearFrom}–{f.yearTo} {f.make} {f.model}
                    </span>
                    {f.engine ? <span className="text-[var(--ink-muted)]"> · {f.engine}</span> : null}
                    {f.notes ? <p className="mt-1 text-[var(--ink-muted)]">{f.notes}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.specs.length > 0 && (
            <div className="mt-10">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold uppercase tracking-wide text-[var(--navy)]">
                Specs
              </h2>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between gap-3 rounded-md bg-[var(--surface-muted)] px-3 py-2 text-sm">
                    <dt className="text-[var(--ink-muted)]">{spec.label}</dt>
                    <dd className="font-semibold">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-wide text-[var(--navy)]">
            Related parts
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
