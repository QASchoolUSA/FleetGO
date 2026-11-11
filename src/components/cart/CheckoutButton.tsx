"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/store";

export function CheckoutButton() {
  const items = useCart((s) => s.items);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            slug: i.slug,
            title: i.title,
            price: i.price,
            quantity: i.quantity,
            sku: i.sku,
            image: i.image,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to start checkout");
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("No checkout URL returned");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  if (!items.length) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">
        Add parts to your cart before checking out.
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className="flex h-12 w-full items-center justify-center rounded-md bg-[var(--signal)] font-bold uppercase tracking-wide text-white disabled:opacity-60"
      >
        {loading ? "Redirecting to Stripe…" : "Pay with Stripe"}
      </button>
      {error ? <p className="mt-3 text-sm text-[var(--signal)]">{error}</p> : null}
      <p className="mt-3 text-xs leading-relaxed text-[var(--ink-muted)]">
        You&apos;ll complete payment securely on Stripe Checkout. Configure{" "}
        <code className="rounded bg-[var(--surface-muted)] px-1">STRIPE_SECRET_KEY</code> in{" "}
        <code className="rounded bg-[var(--surface-muted)] px-1">.env.local</code> for live sessions.
      </p>
    </div>
  );
}
