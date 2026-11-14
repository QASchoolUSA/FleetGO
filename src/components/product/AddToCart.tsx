"use client";

import { useState } from "react";
import type { CatalogProduct } from "@/lib/catalog/types";
import { useCart } from "@/lib/cart/store";

export function AddToCart({ product }: { product: CatalogProduct }) {
  const addItem = useCart((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const disabled =
    product.stockStatus === "out_of_stock" || product.stockStatus === "preorder";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="inline-flex items-center gap-2 text-sm">
        <span className="font-medium">Qty</span>
        <input
          type="number"
          min={1}
          max={99}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          className="h-11 w-20 rounded-md border border-[var(--line)] px-3 tabular-nums"
        />
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          addItem(
            {
              productId: product.id,
              slug: product.slug,
              title: product.title,
              price: product.price,
              currency: product.currency,
              image: product.images[0]?.url,
              sku: product.sku,
            },
            qty,
          )
        }
        className="h-12 flex-1 rounded-md bg-[var(--signal)] px-6 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[var(--signal-dark)] disabled:cursor-not-allowed disabled:opacity-40 sm:max-w-xs"
      >
        {disabled ? "Unavailable" : "Add to cart"}
      </button>
    </div>
  );
}
