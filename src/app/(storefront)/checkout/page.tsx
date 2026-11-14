import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutButton } from "@/components/cart/CheckoutButton";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold uppercase tracking-wide text-[var(--navy)]">
        Checkout
      </h1>
      <p className="mt-3 text-[var(--ink-muted)]">
        Review your cart, then continue to Stripe for secure payment.
      </p>
      <div className="mt-8 rounded-lg border border-[var(--line)] p-5">
        <CheckoutButton />
      </div>
      <Link href="/cart" className="mt-6 inline-block text-sm font-medium text-[var(--navy)] hover:underline">
        ← Back to cart
      </Link>
    </div>
  );
}
