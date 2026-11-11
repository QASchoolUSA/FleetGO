"use client";

import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog/types";
import { formatMoney, stockLabel } from "@/lib/format";
import { useGarage } from "@/lib/garage/store";
import { productFitsVehicle } from "@/lib/vehicles";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const vehicle = useGarage((s) => s.vehicle);
  const fits = productFitsVehicle(product.fitment, vehicle);
  const image = product.images[0];

  return (
    <article className="group overflow-hidden rounded-lg border border-[var(--line)] bg-white transition hover:border-[var(--navy)]/30 hover:shadow-[0_10px_24px_rgba(15,28,46,0.08)]">
      <Link
        href={`/p/${product.slug}`}
        className="relative block aspect-[5/4] overflow-hidden bg-[var(--surface-muted)]"
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : null}
        {fits && (
          <span className="absolute left-2 top-2 rounded bg-[var(--navy)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Fits your vehicle
          </span>
        )}
      </Link>
      <div className="space-y-1.5 p-3 sm:p-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-muted)]">
          {product.brand}
        </p>
        <Link
          href={`/p/${product.slug}`}
          className="line-clamp-2 block min-h-[2.5rem] text-sm font-semibold leading-snug text-[var(--navy)] hover:underline"
        >
          {product.title}
        </Link>
        <p className="text-xs text-[var(--ink-muted)]">SKU {product.sku}</p>
        <div className="flex items-end justify-between gap-2 pt-1">
          <div>
            <p className="text-base font-bold text-[var(--navy)]">
              {formatMoney(product.price, product.currency)}
            </p>
            {product.compareAtPrice ? (
              <p className="text-xs text-[var(--ink-muted)] line-through">
                {formatMoney(product.compareAtPrice, product.currency)}
              </p>
            ) : null}
          </div>
          <span className="pb-0.5 text-[11px] font-medium text-[var(--ink-muted)]">
            {stockLabel(product.stockStatus)}
          </span>
        </div>
      </div>
    </article>
  );
}
