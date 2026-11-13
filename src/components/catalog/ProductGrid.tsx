"use client";

import { useEffect, useMemo, useState } from "react";
import type { CatalogProduct } from "@/lib/catalog/types";
import { useGarage } from "@/lib/garage/store";
import { productFitsVehicle } from "@/lib/vehicles";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  filterByVehicle = false,
}: {
  products: CatalogProduct[];
  /** When true and a garage vehicle is set, default to fitting parts only */
  filterByVehicle?: boolean;
}) {
  const vehicle = useGarage((s) => s.vehicle);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setShowAll(false);
  }, [vehicle?.year, vehicle?.make, vehicle?.model, vehicle?.engine]);

  const activeFilter = Boolean(filterByVehicle && vehicle && !showAll);

  const visible = useMemo(() => {
    if (!activeFilter || !vehicle) return products;
    return products.filter((p) => productFitsVehicle(p.fitment, vehicle));
  }, [activeFilter, products, vehicle]);

  const fittingCount = useMemo(() => {
    if (!filterByVehicle || !vehicle) return products.length;
    return products.filter((p) => productFitsVehicle(p.fitment, vehicle)).length;
  }, [filterByVehicle, products, vehicle]);

  return (
    <div className="space-y-4">
      {filterByVehicle && vehicle ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="text-[var(--ink-muted)]">
            {showAll
              ? `Showing all ${products.length} parts · ${fittingCount} fit your vehicle`
              : `Showing ${visible.length} parts that fit your vehicle`}
          </p>
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="font-semibold text-[var(--field)] hover:underline"
          >
            {showAll ? "Show fitting only" : "Show all parts"}
          </button>
        </div>
      ) : null}

      {!visible.length ? (
        <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface-muted)] px-6 py-12 text-center">
          <p className="font-semibold text-[var(--navy)]">No parts matched</p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            {filterByVehicle && vehicle && !showAll
              ? "No parts in this list fit your vehicle. Try another category, or show all parts."
              : "Try another search or category."}
          </p>
          {filterByVehicle && vehicle && !showAll && products.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-3 text-sm font-semibold text-[var(--field)] hover:underline"
            >
              Show all parts
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-2 items-start gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
