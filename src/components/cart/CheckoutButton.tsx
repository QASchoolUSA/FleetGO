"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart/store";
import { formatMoney } from "@/lib/format";

type ShippingAddressForm = {
  name: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: "US";
};

type ShippingQuoteState = {
  amountCents: number;
  cartKey: string;
  addressKey: string;
};

const fieldClass = "mt-1 h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--field)]";

export function CheckoutButton() {
  const items = useCart((s) => s.items);
  const [address, setAddress] = useState<ShippingAddressForm>({
    name: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });
  const [quote, setQuote] = useState<ShippingQuoteState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cartKey = useMemo(
    () => items.map((item) => `${item.slug}:${item.quantity}`).sort().join("|"),
    [items],
  );
  const addressKey = JSON.stringify(address);
  const quoteMatches = quote?.cartKey === cartKey && quote.addressKey === addressKey;

  function updateAddress(field: keyof ShippingAddressForm, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));
    setQuote(null);
    setError(null);
  }

  async function getQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setQuote(null);
    try {
      const response = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ slug, quantity }) => ({ slug, quantity })),
          shippingAddress: address,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to calculate shipping.");
      setQuote({
        amountCents: data.quote.amountCents,
        cartKey,
        addressKey,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to calculate shipping.");
    } finally {
      setLoading(false);
    }
  }

  async function startCheckout() {
    if (!quoteMatches) {
      setError("Get a fresh shipping quote before continuing.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ slug, quantity }) => ({ slug, quantity })),
          shippingAddress: address,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to start checkout.");
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("No checkout URL returned.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout.");
      setLoading(false);
    }
  }

  if (!items.length) {
    return <p className="text-sm text-[var(--ink-muted)]">Add parts to your cart before checking out.</p>;
  }

  return (
    <form onSubmit={getQuote} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-[var(--navy)] sm:col-span-2">
          Recipient name
          <input required autoComplete="name" value={address.name} onChange={(event) => updateAddress("name", event.target.value)} className={fieldClass} />
        </label>
        <label className="text-sm font-medium text-[var(--navy)] sm:col-span-2">
          Email for order updates
          <input type="email" autoComplete="email" value={address.email} onChange={(event) => updateAddress("email", event.target.value)} className={fieldClass} />
        </label>
        <label className="text-sm font-medium text-[var(--navy)] sm:col-span-2">
          Street address
          <input required autoComplete="address-line1" value={address.line1} onChange={(event) => updateAddress("line1", event.target.value)} className={fieldClass} />
        </label>
        <label className="text-sm font-medium text-[var(--navy)] sm:col-span-2">
          Apartment, suite, etc. <span className="font-normal text-[var(--ink-muted)]">(optional)</span>
          <input autoComplete="address-line2" value={address.line2} onChange={(event) => updateAddress("line2", event.target.value)} className={fieldClass} />
        </label>
        <label className="text-sm font-medium text-[var(--navy)]">
          City
          <input required autoComplete="address-level2" value={address.city} onChange={(event) => updateAddress("city", event.target.value)} className={fieldClass} />
        </label>
        <label className="text-sm font-medium text-[var(--navy)]">
          State
          <input required autoComplete="address-level1" maxLength={2} placeholder="FL" value={address.state} onChange={(event) => updateAddress("state", event.target.value.toUpperCase())} className={fieldClass} />
        </label>
        <label className="text-sm font-medium text-[var(--navy)]">
          ZIP code
          <input required autoComplete="postal-code" inputMode="numeric" maxLength={10} pattern="\d{5}(-?\d{4})?" placeholder="33844" value={address.postalCode} onChange={(event) => updateAddress("postalCode", event.target.value)} className={fieldClass} />
        </label>
        <label className="text-sm font-medium text-[var(--navy)]">
          Country
          <input readOnly value="United States" className={`${fieldClass} bg-[var(--surface-muted)]`} />
        </label>
      </div>

      <p className="text-xs leading-relaxed text-[var(--ink-muted)]">
        USPS Ground Advantage is quoted from Haines City, FL 33844. Quotes use current package estimates and are calculated separately for each product and quantity.
      </p>

      {quoteMatches ? (
        <div className="rounded-md bg-[var(--surface-muted)] p-4" aria-live="polite">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-[var(--ink-muted)]">USPS Ground Advantage</span>
            <span className="font-semibold tabular-nums text-[var(--navy)]">{formatMoney(quote.amountCents / 100)}</span>
          </div>
          <button
            type="button"
            onClick={startCheckout}
            disabled={loading}
            className="mt-4 flex h-12 w-full items-center justify-center rounded-md bg-[var(--signal)] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[var(--signal-dark)] disabled:opacity-60"
          >
            {loading ? "Opening Stripe…" : "Continue to secure payment"}
          </button>
        </div>
      ) : (
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center rounded-md bg-[var(--signal)] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[var(--signal-dark)] disabled:opacity-60"
        >
          {loading ? "Calculating USPS rate…" : "Calculate USPS shipping"}
        </button>
      )}

      {error ? <p role="alert" className="text-sm text-[var(--signal)]">{error}</p> : null}
    </form>
  );
}
