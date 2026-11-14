"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/store";
import { formatMoney } from "@/lib/format";

export function CartView() {
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = useCart((s) => s.subtotal());

  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--line)] px-6 py-16 text-center">
        <p className="font-medium text-[var(--navy)]">Your cart is empty</p>
        <Link
          href="/shop"
          className="mt-4 inline-flex h-11 items-center rounded-md bg-[var(--field)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--navy)]"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <ul className="divide-y divide-[var(--line)] rounded-lg border border-[var(--line)]">
        {items.map((item) => (
          <li key={item.productId} className="flex gap-4 p-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-[var(--surface-muted)]">
              {item.image ? (
                <Image src={item.image} alt="" fill className="object-cover" sizes="96px" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/p/${item.slug}`} className="font-medium text-[var(--navy)] hover:underline">
                {item.title}
              </Link>
              <p className="mt-1 text-xs tabular-nums text-[var(--ink-muted)]">SKU {item.sku}</p>
              <p className="mt-2 font-semibold tabular-nums">{formatMoney(item.price, item.currency)}</p>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => setQuantity(item.productId, Number(e.target.value) || 1)}
                  className="h-10 w-20 rounded-md border border-[var(--line)] px-2 tabular-nums"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-sm font-medium text-[var(--field)] hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <aside className="h-fit rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--ink-muted)]">Subtotal</span>
          <span className="text-xl font-semibold tabular-nums text-[var(--navy)]">{formatMoney(subtotal)}</span>
        </div>
        <p className="mt-2 text-xs text-[var(--ink-muted)]">
          Shipping and tax calculated at checkout.
        </p>
        <Link
          href="/checkout"
          className="mt-5 flex h-12 items-center justify-center rounded-md bg-[var(--signal)] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[var(--signal-dark)]"
        >
          Checkout
        </Link>
      </aside>
    </div>
  );
}
