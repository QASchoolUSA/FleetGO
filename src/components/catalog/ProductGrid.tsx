"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
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
  const reduceMotion = useReducedMotion();

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

  const listKey = `${visible.map((p) => p.id).join(",")}:${showAll ? "all" : "fit"}`;

  return (
    <div className="space-y-4">
      {filterByVehicle && vehicle ? (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-2.5 sm:px-4">
          <p className="text-sm text-[var(--ink-muted)]">
            {showAll ? (
              <>
                Showing{" "}
                <span className="tabular-nums font-medium text-[var(--navy)]">
                  {products.length}
                </span>{" "}
                parts
                <span className="text-[var(--ink-muted)]">
                  {" "}
                  · {fittingCount} fit your vehicle
                </span>
              </>
            ) : (
              <>
                Showing{" "}
                <span className="tabular-nums font-medium text-[var(--navy)]">
                  {visible.length}
                </span>{" "}
                parts that fit your vehicle
              </>
            )}
          </p>
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-sm font-semibold text-[var(--field)] hover:underline"
          >
            {showAll ? "Show fitting only" : "Show all parts"}
          </button>
        </div>
      ) : null}

      {!visible.length ? (
        <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface-muted)] px-6 py-14 text-center">
          <p className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-wide text-[var(--navy)]">
            No parts matched
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--ink-muted)]">
            {filterByVehicle && vehicle && !showAll
              ? "No parts in this list fit your vehicle. Try another category, or show all parts."
              : "Try another search, filter, or category."}
          </p>
          {filterByVehicle && vehicle && !showAll && products.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-[var(--signal)] px-4 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[var(--signal-dark)]"
            >
              Show all parts
            </button>
          ) : null}
        </div>
      ) : (
        <motion.div
          key={listKey}
          className="grid grid-cols-2 items-start gap-2.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: reduceMotion ? 0 : 0.028,
              },
            },
          }}
        >
          {visible.map((product) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
