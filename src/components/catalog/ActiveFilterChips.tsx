"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import {
  PRICE_PRESETS,
  matchPricePreset,
} from "@/lib/catalog/query";

const DUTY_LABELS: Record<string, string> = {
  light: "Light duty",
  semi: "Semi / HD",
};

type Props = {
  brands: { slug: string; title: string }[];
};

export function ActiveFilterChips({ brands }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const duty = searchParams.get("duty") || "all";
  const brand = searchParams.get("brand") || "";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const inStock = searchParams.get("inStock") === "1";
  const minNum = minPrice ? Number(minPrice) : undefined;
  const maxNum = maxPrice ? Number(maxPrice) : undefined;

  const chips = useMemo(() => {
    const list: { key: string; label: string; clear: Record<string, null> }[] = [];

    if (duty && duty !== "all") {
      list.push({
        key: "duty",
        label: DUTY_LABELS[duty] || duty,
        clear: { duty: null },
      });
    }

    if (brand) {
      const title = brands.find((b) => b.slug === brand)?.title || brand;
      list.push({
        key: "brand",
        label: title,
        clear: { brand: null },
      });
    }

    if (typeof minNum === "number" || typeof maxNum === "number") {
      const preset = PRICE_PRESETS.find((p) => p.id === matchPricePreset(minNum, maxNum));
      const label =
        preset && preset.id !== "any" && preset.id !== "custom"
          ? preset.label
          : [
              typeof minNum === "number" ? `$${minNum}` : null,
              typeof maxNum === "number" ? `$${maxNum}` : null,
            ]
              .filter(Boolean)
              .join(" – ") || "Custom price";
      list.push({
        key: "price",
        label,
        clear: { minPrice: null, maxPrice: null },
      });
    }

    if (inStock) {
      list.push({
        key: "stock",
        label: "In stock",
        clear: { inStock: null },
      });
    }

    return list;
  }, [duty, brand, brands, minNum, maxNum, inStock]);

  if (!chips.length) return null;

  function pushClear(patch: Record<string, null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.keys(patch).forEach((key) => params.delete(key));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    ["duty", "brand", "minPrice", "maxPrice", "inStock"].forEach((k) => params.delete(k));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => pushClear(chip.clear)}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--line)] bg-white pl-2.5 pr-1.5 text-xs font-medium text-[var(--navy)] transition-colors hover:border-[var(--field)]/40"
          aria-label={`Remove ${chip.label} filter`}
        >
          {chip.label}
          <span className="inline-flex h-5 w-5 items-center justify-center rounded text-[var(--ink-muted)]">
            <X className="h-3 w-3" strokeWidth={2} />
          </span>
        </button>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="h-8 px-1 text-xs font-semibold text-[var(--field)] hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
