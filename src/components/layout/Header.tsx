"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, ShoppingCart, Truck, X } from "lucide-react";
import { useCart } from "@/lib/cart/store";
import { useGarage } from "@/lib/garage/store";
import { vehicleLabel } from "@/lib/vehicles";
import { SearchBar } from "@/components/catalog/SearchBar";
import { VehicleFinder } from "@/components/vehicle/VehicleFinder";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { cn } from "@/lib/format";

const nav = [
  { href: "/c/brakes", label: "Brakes" },
  { href: "/c/filters", label: "Filters" },
  { href: "/c/lighting", label: "Lighting" },
  { href: "/c/electrical", label: "Electrical" },
  { href: "/c/engine", label: "Engine" },
  { href: "/c/suspension", label: "Suspension" },
  { href: "/c/semi-hd", label: "Semi / HD" },
  { href: "/c/fluids", label: "Fluids" },
];

export function Header() {
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const openCart = useCart((s) => s.openCart);
  const vehicle = useGarage((s) => s.vehicle);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [finderOpen, setFinderOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-shadow",
          scrolled ? "border-[var(--line)] bg-[var(--surface)]/95 shadow-sm backdrop-blur-md" : "border-transparent bg-[var(--surface)]",
        )}
      >
        <div className="bg-[var(--navy)] text-[var(--surface)]">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 text-xs sm:px-6">
            <p className="truncate tracking-wide">
              Same-day cut-off 3 PM CT · Free shipping over $99*
            </p>
            <a href="tel:18005550188" className="shrink-0 font-medium hover:underline">
              (800) 555-0188
            </a>
          </div>
          <div className="stripe-patriotic stripe-patriotic-animate" aria-hidden />
        </div>

        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--line)] lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="shrink-0">
            <span className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-[0.04em] text-[var(--navy)] sm:text-3xl">
              Fleet<span className="text-[var(--signal)]">Go</span>
            </span>
          </Link>

          <div className="mx-2 hidden min-w-0 flex-1 md:block">
            <SearchBar />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setFinderOpen(true)}
              className="hidden items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-2 text-left text-sm transition hover:border-[var(--field)] lg:inline-flex"
            >
              <Truck className="h-4 w-4 text-[var(--field)]" />
              <span className="max-w-[180px] truncate">
                {vehicle ? vehicleLabel(vehicle) : "Select your vehicle"}
              </span>
            </button>

            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex h-10 items-center gap-2 rounded-md bg-[var(--navy)] px-3 text-sm font-semibold text-white"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--signal)] px-1 text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="border-t border-[var(--line)] px-4 py-2 md:hidden">
          <SearchBar compact />
        </div>

        <nav className="hidden border-t border-[var(--line)] lg:block">
          <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 sm:px-6">
            <Link
              href="/shop"
              className="whitespace-nowrap px-3 py-2.5 text-sm font-semibold text-[var(--navy)] hover:text-[var(--field)]"
            >
              Shop all
            </Link>
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap px-3 py-2.5 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--field)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-[var(--surface)] shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
              <span className="font-[family-name:var(--font-display)] text-xl font-bold uppercase text-[var(--navy)]">
                Fleet<span className="text-[var(--signal)]">Go</span>
              </span>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-1 overflow-y-auto p-4">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setFinderOpen(true);
                }}
                className="mb-3 flex w-full items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-3 text-left text-sm"
              >
                <Truck className="h-4 w-4 text-[var(--field)]" />
                {vehicle ? vehicleLabel(vehicle) : "Select your vehicle"}
              </button>
              <Link
                href="/shop"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-semibold"
              >
                Shop all
              </Link>
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm"
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-3 h-px bg-[var(--line)]" />
              <Link href="/about" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm">
                About
              </Link>
              <Link href="/contact" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm">
                Contact
              </Link>
            </div>
          </div>
        </div>
      )}

      <VehicleFinder open={finderOpen} onClose={() => setFinderOpen(false)} />
      <CartDrawer />

      <button
        type="button"
        onClick={() => setFinderOpen(true)}
        className="fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-4 py-3 text-sm font-semibold text-white shadow-lg lg:hidden"
      >
        <Truck className="h-4 w-4" />
        Vehicle
      </button>
    </>
  );
}
