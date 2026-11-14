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
    <article className="group overflow-hidden rounded-lg border border-[var(--line)] bg-white transition-colors hover:border-[var(--field)]/40">
      <Link
        href={`/p/${product.slug}`}
        className="relative block aspect-[5/4] overflow-hidden bg-[var(--surface-muted)]"
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : null}
        {fits && (
          <span className="absolute left-2 top-2 rounded-md bg-[var(--field)] px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
            Fits your vehicle
          </span>
        )}
      </Link>
      <div className="space-y-1.5 p-3 sm:p-3.5">
        <p className="text-[11px] font-medium text-[var(--ink-muted)]">
          {product.brand}
        </p>
        <Link
          href={`/p/${product.slug}`}
          className="line-clamp-2 block min-h-[2.5rem] text-sm font-medium leading-snug text-[var(--navy)] hover:underline"
        >
          {product.title}
        </Link>
        <p className="text-xs tabular-nums text-[var(--ink-muted)]">SKU {product.sku}</p>
        <div className="flex items-end justify-between gap-2 pt-1">
          <div>
            <p className="text-base font-semibold tabular-nums text-[var(--navy)]">
              {formatMoney(product.price, product.currency)}
            </p>
            {product.compareAtPrice ? (
              <p className="text-xs tabular-nums text-[var(--ink-muted)] line-through">
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
