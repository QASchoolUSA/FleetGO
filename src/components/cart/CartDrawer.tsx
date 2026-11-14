"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/cart/store";
import { formatMoney } from "@/lib/format";
import { ProductImageFrame } from "@/components/product/ProductImageFrame";

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const closeCart = useCart((s) => s.closeCart);
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = useCart((s) => s.subtotal());

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80]">
          <motion.button
            type="button"
            aria-label="Close cart"
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[var(--surface)] shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-4">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-wide text-[var(--navy)]">
                Your cart
              </h2>
              <button type="button" onClick={closeCart} aria-label="Close cart">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <p className="text-sm text-[var(--ink-muted)]">Your cart is empty.</p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="rounded-md bg-[var(--field)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--navy)]"
                  >
                    Browse parts
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.productId} className="flex gap-3 border-b border-[var(--line)] pb-4">
                      <ProductImageFrame
                        src={item.image}
                        alt=""
                        variant="cart"
                        sizes="80px"
                        className="h-20 w-20 shrink-0 rounded-md"
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/p/${item.slug}`}
                          onClick={closeCart}
                          className="line-clamp-2 text-sm font-medium text-[var(--navy)] hover:underline"
                        >
                          {item.title}
                        </Link>
                        <p className="mt-0.5 text-xs tabular-nums text-[var(--ink-muted)]">SKU {item.sku}</p>
                        <p className="mt-1 text-sm font-semibold tabular-nums">
                          {formatMoney(item.price, item.currency)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--line)] transition-colors hover:bg-[var(--surface-muted)]"
                            onClick={() => setQuantity(item.productId, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                          <span className="w-6 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--line)] transition-colors hover:bg-[var(--surface-muted)]"
                            onClick={() => setQuantity(item.productId, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            className="ml-auto text-xs font-medium text-[var(--field)] hover:underline"
                            onClick={() => removeItem(item.productId)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-[var(--line)] p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-[var(--ink-muted)]">Subtotal</span>
                  <span className="text-lg font-semibold tabular-nums text-[var(--navy)]">
                    {formatMoney(subtotal)}
                  </span>
                </div>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="mb-2 flex h-11 items-center justify-center rounded-md border border-[var(--line)] font-medium transition-colors hover:bg-[var(--surface-muted)]"
                >
                  View cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex h-11 items-center justify-center rounded-md bg-[var(--signal)] font-semibold text-white transition-colors hover:bg-[var(--signal-dark)]"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
