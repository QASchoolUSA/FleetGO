import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold uppercase tracking-wide text-[var(--navy)]">
        Your cart
      </h1>
      <div className="mt-8">
        <CartView />
      </div>
    </div>
  );
}
