"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpDown, Check, SlidersHorizontal, X } from "lucide-react";
import type { CatalogBrand, CatalogCategory } from "@/lib/catalog/types";
import {
  PRICE_PRESETS,
  SORT_OPTIONS,
  countActiveFilters,
  matchPricePreset,
  type ProductSort,
} from "@/lib/catalog/query";
import { cn } from "@/lib/format";

type Props = {
  categories: CatalogCategory[];
  brands: CatalogBrand[];
  activeCategory?: string;
  resultCount: number;
};

const DUTY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "light", label: "Light duty" },
  { value: "semi", label: "Semi / HD" },
] as const;

function useCatalogQueryState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const duty = searchParams.get("duty") || "all";
  const brand = searchParams.get("brand") || "";
  const sort = (searchParams.get("sort") as ProductSort) || "featured";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const inStock = searchParams.get("inStock") === "1";
  const minNum = minPrice ? Number(minPrice) : undefined;
  const maxNum = maxPrice ? Number(maxPrice) : undefined;

  function pushParams(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([key, value]) => {
      if (
        value === null ||
        value === "" ||
        (key === "duty" && value === "all") ||
        (key === "sort" && value === "featured")
      ) {
        params.delete(key);
        return;
      }
      params.set(key, value);
    });
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    ["duty", "brand", "minPrice", "maxPrice", "inStock"].forEach((k) => params.delete(k));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return {
    duty,
    brand,
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort : ("featured" as ProductSort),
    minNum,
    maxNum,
    inStock,
    pushParams,
    clearFilters,
    searchParams,
    pathname,
  };
}

function FilterPanel({
  categories,
  brands,
  activeCategory,
  onNavigate,
}: {
  categories: CatalogCategory[];
  brands: CatalogBrand[];
  activeCategory?: string;
  onNavigate?: () => void;
}) {
  const { duty, brand, minNum, maxNum, inStock, pushParams, pathname } = useCatalogQueryState();
  const [minInput, setMinInput] = useState(minNum?.toString() ?? "");
  const [maxInput, setMaxInput] = useState(maxNum?.toString() ?? "");
  const presetId = matchPricePreset(minNum, maxNum);

  useEffect(() => {
    setMinInput(minNum?.toString() ?? "");
    setMaxInput(maxNum?.toString() ?? "");
  }, [minNum, maxNum]);

  function applyCustomPrice() {
    pushParams({
      minPrice: minInput.trim() || null,
      maxPrice: maxInput.trim() || null,
    });
    onNavigate?.();
  }

  return (
    <div className="space-y-7">
      <section>
        <h3 className="text-xs font-medium text-[var(--ink-muted)]">
          Vehicle duty
        </h3>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {DUTY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                pushParams({ duty: opt.value });
                onNavigate?.();
              }}
              className={cn(
                "rounded-md border px-2 py-2.5 text-center text-xs font-semibold sm:text-sm",
                duty === opt.value
                  ? "border-[var(--field)] bg-[var(--field)] text-white"
                  : "border-[var(--line)] bg-white text-[var(--navy)]",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-medium text-[var(--ink-muted)]">
          Price
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PRICE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                pushParams({
                  minPrice: preset.min !== undefined ? String(preset.min) : null,
                  maxPrice: preset.max !== undefined ? String(preset.max) : null,
                });
                onNavigate?.();
              }}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                presetId === preset.id
                  ? "border-[var(--field)] bg-[var(--field)] text-white"
                  : "border-[var(--line)] bg-white text-[var(--navy)]",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex min-w-0 flex-col gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="Min"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              className="h-10 min-w-0 flex-1 rounded-md border border-[var(--line)] bg-white px-2.5 text-sm text-[var(--navy)] outline-none focus:border-[var(--field)]"
              aria-label="Minimum price"
            />
            <span className="shrink-0 text-xs text-[var(--ink-muted)]">to</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="Max"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              className="h-10 min-w-0 flex-1 rounded-md border border-[var(--line)] bg-white px-2.5 text-sm text-[var(--navy)] outline-none focus:border-[var(--field)]"
              aria-label="Maximum price"
            />
          </div>
          <button
            type="button"
            onClick={applyCustomPrice}
            className="h-10 w-full rounded-md bg-[var(--surface-muted)] px-3 text-xs font-medium text-[var(--navy)] transition-colors hover:bg-[var(--line)]"
          >
            Go
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-medium text-[var(--ink-muted)]">
          Availability
        </h3>
        <button
          type="button"
          onClick={() => {
            pushParams({ inStock: inStock ? null : "1" });
            onNavigate?.();
          }}
          className={cn(
            "mt-2 flex w-full items-center gap-2 rounded-md border px-3 py-2.5 text-left text-sm",
            inStock
              ? "border-[var(--field)] bg-[var(--field)] text-white"
              : "border-[var(--line)] bg-white text-[var(--navy)]",
          )}
        >
          <span
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded border",
              inStock ? "border-white bg-white text-[var(--navy)]" : "border-[var(--line)]",
            )}
          >
            {inStock ? <Check className="h-3 w-3" /> : null}
          </span>
          In stock only
        </button>
      </section>

      <section>
        <h3 className="text-xs font-medium text-[var(--ink-muted)]">
          Categories
        </h3>
        <ul className="mt-2 max-h-48 space-y-0.5 overflow-y-auto pr-1">
          <li>
            <Link
              href="/shop"
              onClick={onNavigate}
              className={cn(
                "block rounded-md px-2 py-2 text-sm",
                !activeCategory && pathname.startsWith("/shop")
                  ? "bg-[var(--surface-muted)] font-semibold text-[var(--navy)]"
                  : "text-[var(--ink)] hover:bg-[var(--surface-muted)]",
              )}
            >
              All parts
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/c/${cat.slug}`}
                onClick={onNavigate}
                className={cn(
                  "block rounded-md px-2 py-2 text-sm",
                  activeCategory === cat.slug
                    ? "bg-[var(--surface-muted)] font-semibold text-[var(--navy)]"
                    : "text-[var(--ink)] hover:bg-[var(--surface-muted)]",
                )}
              >
                {cat.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-xs font-medium text-[var(--ink-muted)]">
          Brands
        </h3>
        <ul className="mt-2 max-h-48 space-y-0.5 overflow-y-auto pr-1">
          {brands.map((b) => {
            const active = brand === b.slug;
            return (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => {
                    pushParams({ brand: active ? null : b.slug });
                    onNavigate?.();
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm",
                    active
                      ? "bg-[var(--surface-muted)] font-semibold text-[var(--navy)]"
                      : "text-[var(--ink)] hover:bg-[var(--surface-muted)]",
                  )}
                >
                  {b.title}
                  {active ? <Check className="h-3.5 w-3.5" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

export function CatalogControls({
  categories,
  brands,
  activeCategory,
  resultCount,
}: Props) {
  const [open, setOpen] = useState(false);
  const { duty, brand, sort, minNum, maxNum, inStock, pushParams, clearFilters } =
    useCatalogQueryState();

  const activeCount = useMemo(
    () =>
      countActiveFilters(
        {
          duty,
          brand,
          minPrice: minNum,
          maxPrice: maxNum,
          inStock,
        },
        { ignoreCategory: Boolean(activeCategory) },
      ),
    [duty, brand, minNum, maxNum, inStock, activeCategory],
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <div className="lg:contents">
        {/* Mobile / tablet toolbar — keeps the product grid uncluttered */}
        <div className="mb-4 flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 text-sm font-medium text-[var(--navy)]"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
            Filters
            {activeCount > 0 ? (
              <span className="rounded-md bg-[var(--field)] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white">
                {activeCount}
              </span>
            ) : null}
          </button>
          <label className="relative inline-flex h-11 min-w-[46%] max-w-[52%] flex-1 items-center rounded-md border border-[var(--line)] bg-white">
            <ArrowUpDown className="pointer-events-none absolute left-3 h-4 w-4 text-[var(--ink-muted)]" strokeWidth={1.5} />
            <select
              value={sort}
              onChange={(e) => pushParams({ sort: e.target.value })}
              className="h-full w-full appearance-none rounded-md bg-transparent py-2 pl-9 pr-7 text-sm font-medium text-[var(--navy)] outline-none"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
          <div className="mb-5 rounded-lg border border-[var(--line)] bg-white p-3">
            <label className="block text-xs font-medium text-[var(--ink-muted)]">
              Sort by
            </label>
            <select
              value={sort}
              onChange={(e) => pushParams({ sort: e.target.value })}
              className="mt-2 h-10 w-full rounded-md border border-[var(--line)] bg-[var(--surface-muted)] px-3 text-sm font-medium text-[var(--navy)] outline-none focus:border-[var(--field)]"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-lg border border-[var(--line)] bg-white p-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold uppercase tracking-wide text-[var(--navy)]">
                Filters
              </h2>
              {activeCount > 0 ? (
                <button
                  type="button"
                  onClick={() => clearFilters()}
                  className="text-xs font-semibold text-[var(--field)] hover:underline"
                >
                  Clear
                </button>
              ) : null}
            </div>
            <FilterPanel
              categories={categories}
              brands={brands}
              activeCategory={activeCategory}
            />
          </div>
        </aside>
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <motion.button
              type="button"
              aria-label="Close filters"
              className="absolute inset-0 bg-black/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="filters-title"
              className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-xl bg-white shadow-xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
                <div>
                  <h2
                    id="filters-title"
                    className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-wide text-[var(--navy)]"
                  >
                    Filters
                  </h2>
                  <p className="text-xs text-[var(--ink-muted)]">
                    {resultCount} part{resultCount === 1 ? "" : "s"} match
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--line)]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <FilterPanel
                  categories={categories}
                  brands={brands}
                  activeCategory={activeCategory}
                />
              </div>
              <div className="flex gap-2 border-t border-[var(--line)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={() => clearFilters()}
                  className="h-11 flex-1 rounded-md border border-[var(--line)] text-sm font-semibold text-[var(--navy)]"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-11 flex-[1.4] rounded-md bg-[var(--signal)] text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[var(--signal-dark)]"
                >
                  Show {resultCount} results
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
