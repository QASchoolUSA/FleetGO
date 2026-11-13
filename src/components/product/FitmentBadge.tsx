"use client";

import type { ProductFitment } from "@/lib/catalog/types";
import { useGarage } from "@/lib/garage/store";
import { productFitsVehicle, vehicleLabel } from "@/lib/vehicles";

export function FitmentBadge({ fitment }: { fitment: ProductFitment[] }) {
  const vehicle = useGarage((s) => s.vehicle);
  if (!vehicle) return null;
  const fits = productFitsVehicle(fitment, vehicle);
  if (!fits) return null;

  return (
    <p className="mt-3 inline-flex items-center rounded bg-[var(--field)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
      Fits your vehicle · {vehicleLabel(vehicle)}
    </p>
  );
}

export function FitmentList({ fitment }: { fitment: ProductFitment[] }) {
  const vehicle = useGarage((s) => s.vehicle);

  return (
    <ul className="mt-3 divide-y divide-[var(--line)] rounded-lg border border-[var(--line)]">
      {fitment.map((f, i) => {
        const matches =
          vehicle != null &&
          productFitsVehicle([f], vehicle);
        return (
          <li
            key={`${f.make}-${f.model}-${i}`}
            className={`px-4 py-3 text-sm ${matches ? "bg-[var(--field)]/5" : ""}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[var(--navy)]">
                {f.yearFrom}–{f.yearTo} {f.make} {f.model}
              </span>
              {f.engine ? (
                <span className="text-[var(--ink-muted)]">· {f.engine}</span>
              ) : null}
              {matches ? (
                <span className="rounded bg-[var(--field)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Fits yours
                </span>
              ) : null}
            </div>
            {f.notes ? (
              <p className="mt-1 text-[var(--ink-muted)]">{f.notes}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
