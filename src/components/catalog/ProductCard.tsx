"use client";

import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog/types";
import { cn, formatMoney, stockLabel } from "@/lib/format";
import { useGarage } from "@/lib/garage/store";
import { productFitsVehicle } from "@/lib/vehicles";
import { ProductImageFrame } from "@/components/product/ProductImageFrame";

function stockShort(status: string): string {
  switch (status) {
    case "in_stock":
      return "In stock";
    case "low_stock":
      return "Low";
    case "out_of_stock":
      return "Out";
    case "preorder":
      return "Pre-order";
    default:
      return stockLabel(status);
  }
}

export function ProductCard({ product }: { product: CatalogProduct }) {
  const vehicle = useGarage((s) => s.vehicle);
  const fits = productFitsVehicle(product.fitment, vehicle);
  const image = product.images[0];

  return (
    <article className="group overflow-hidden rounded-lg border border-[var(--line)] bg-white transition-colors duration-200 hover:border-[var(--field)]/45">
      <Link href={`/p/${product.slug}`} className="relative block">
        <ProductImageFrame
          src={image?.url}
          alt={image?.alt || product.title}
          variant="card"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="aspect-[5/4] bg-[var(--surface)]"
          imageClassName="transition-transform duration-300 ease-out max-md:group-hover:scale-100 md:group-hover:scale-[1.03]"
        />
        {fits ? (
          <span className="absolute left-1.5 top-1.5 max-w-[calc(100%-0.75rem)] truncate rounded bg-[var(--field)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white sm:left-2 sm:top-2 sm:px-2 sm:py-1 sm:text-[10px]">
            Fits
            <span className="hidden sm:inline"> your vehicle</span>
          </span>
        ) : null}
      </Link>
      <div className="space-y-1 p-2.5 sm:space-y-1.5 sm:p-3.5">
        <p className="truncate text-[10px] font-medium uppercase tracking-wide text-[var(--ink-muted)] sm:text-[11px]">
          {product.brand}
        </p>
        <Link
          href={`/p/${product.slug}`}
          className="line-clamp-2 block min-h-[2.25rem] text-[13px] font-medium leading-snug text-[var(--navy)] transition-colors hover:text-[var(--field)] sm:min-h-[2.5rem] sm:text-sm"
        >
          {product.title}
        </Link>
        <p className="hidden text-xs tabular-nums text-[var(--ink-muted)] sm:block">
          SKU {product.sku}
        </p>
        <div className="flex items-end justify-between gap-2 pt-0.5 sm:pt-1">
          <div className="min-w-0">
            <p className="text-[15px] font-semibold tabular-nums text-[var(--navy)] sm:text-base">
              {formatMoney(product.price, product.currency)}
            </p>
            {product.compareAtPrice ? (
              <p className="text-[11px] tabular-nums text-[var(--ink-muted)] line-through sm:text-xs">
                {formatMoney(product.compareAtPrice, product.currency)}
              </p>
            ) : null}
          </div>
          <span
            className={cn(
              "shrink-0 pb-0.5 text-[10px] font-medium text-[var(--ink-muted)] sm:text-[11px]",
              product.stockStatus === "out_of_stock" && "text-[var(--signal)]",
            )}
          >
            <span className="sm:hidden">{stockShort(product.stockStatus)}</span>
            <span className="hidden sm:inline">{stockLabel(product.stockStatus)}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
