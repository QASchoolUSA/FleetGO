import type { Metadata } from "next";
import Link from "next/link";
import { ClearCartOnSuccess } from "@/components/cart/ClearCartOnSuccess";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ session_id?: string }> };

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
      <ClearCartOnSuccess />
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--signal)]">
        Thank you
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold uppercase tracking-wide text-[var(--navy)]">
        Order confirmed
      </h1>
      <p className="mt-4 text-[var(--ink-muted)]">
        Your payment went through. A receipt is on its way from Stripe
        {session_id ? " for this session" : ""}.
      </p>
      {session_id ? (
        <p className="mt-2 break-all text-xs text-[var(--ink-muted)]">Ref: {session_id}</p>
      ) : null}
      <Link
        href="/shop"
        className="mt-8 inline-flex h-11 items-center rounded-md bg-[var(--navy)] px-5 text-sm font-semibold text-white"
      >
        Keep shopping
      </Link>
    </div>
  );
}
