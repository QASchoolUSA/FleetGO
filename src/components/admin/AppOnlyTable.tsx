"use client";

import { useState } from "react";
import { Camera, MapPin } from "lucide-react";
import type { StockRow } from "@/lib/admin/types";
import { PhotoLightbox, type LightboxState } from "./PhotoLightbox";

const CONTAINER_LABELS: Record<string, string> = {
  pallet: "Pallet",
  cardboardBox: "Cardboard box",
  plasticBox: "Plastic box",
  floorLoose: "Floor loose",
};

function formatUpdated(ts?: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AppOnlyTable({ rows }: { rows: StockRow[] }) {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-10 text-center text-sm text-[var(--ink-muted)]">
        No manual or app-only items match this filter.
      </p>
    );
  }

  const totalQty = rows.reduce((s, r) => s + r.quantity, 0);
  const totalPhotos = rows.reduce((s, r) => s + r.catalogPhotoCount, 0);

  return (
    <>
      <div className="overflow-auto rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_8px_24px_rgba(18,24,32,0.04)]">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[#f8fafc] text-left text-[11px] uppercase tracking-[0.08em] text-[var(--ink-muted)]">
              <th className="px-3 py-3 font-semibold">Item</th>
              <th className="px-3 py-3 font-semibold">Type &amp; MPN</th>
              <th className="px-3 py-3 font-semibold">Manifest</th>
              <th className="px-3 py-3 font-semibold">Location</th>
              <th className="px-3 py-3 text-right font-semibold">Qty</th>
              <th className="px-3 py-3 text-right font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const thumb = row.catalogPhotoUrls[0];
              return (
                <tr
                  key={row.id}
                  className="border-b border-[var(--line)] hover:bg-[var(--surface-muted)]/60"
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-start gap-3">
                      {thumb ? (
                        <button
                          type="button"
                          onClick={() =>
                            setLightbox({
                              title: row.title,
                              urls: row.catalogPhotoUrls,
                            })
                          }
                          title={`View ${row.catalogPhotoUrls.length} catalog photo(s)`}
                          className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface-muted)]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumb}
                            alt={row.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                          {row.catalogPhotoUrls.length > 1 ? (
                            <span className="absolute right-0.5 bottom-0.5 rounded bg-black/75 px-1 text-[10px] font-semibold leading-tight text-white tabular-nums">
                              +{row.catalogPhotoUrls.length - 1}
                            </span>
                          ) : null}
                        </button>
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface-muted)] text-[var(--ink-muted)]">
                          <Camera className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-[var(--ink)]">
                          {row.title}
                        </div>
                        <div className="mt-0.5 text-xs text-[var(--ink-muted)]">
                          {row.brand}
                          {row.catalogPhotoCount > 0
                            ? ` · ${row.catalogPhotoCount} photo${row.catalogPhotoCount === 1 ? "" : "s"}`
                            : ""}
                        </div>
                        {row.description || row.notes ? (
                          <p className="mt-1 line-clamp-2 text-xs text-[var(--ink-muted)]">
                            {row.description || row.notes}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {row.isNoBarcode ? (
                          <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
                            No barcode
                          </span>
                        ) : row.isUnrecognizedBarcode ? (
                          <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
                            Unrecognized
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                            App-only
                          </span>
                        )}
                        {row.mpn ? (
                          <code className="rounded bg-[#eef5f0] px-1.5 py-0.5 font-mono text-[12px]">
                            {row.mpn}
                          </code>
                        ) : null}
                      </div>
                      <span className="font-mono text-[11px] text-[var(--ink-muted)]">
                        {row.isNoBarcode ? row.barcode : row.barcode || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    {row.manifestItem ? (
                      <code className="rounded bg-[#eef5f0] px-1.5 py-0.5 font-mono text-[12px] text-[#14532d]">
                        {row.manifestItem}
                      </code>
                    ) : (
                      <span className="text-xs text-[var(--ink-muted)]">
                        Off-manifest
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    {row.location ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1 font-medium text-[var(--ink)]">
                          <MapPin className="h-3 w-3 shrink-0 text-[var(--field)]" />
                          {row.location}
                        </span>
                        {row.containerKind ? (
                          <span className="text-[11px] text-[var(--ink-muted)]">
                            {CONTAINER_LABELS[row.containerKind] ?? row.containerKind}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-[var(--ink-muted)]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold">
                    {row.quantity.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs tabular-nums text-[var(--ink-muted)]">
                    {formatUpdated(row.updatedAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[var(--line)] bg-[#f8fafc] font-semibold">
              <td className="px-3 py-3" colSpan={4}>
                Total · {rows.length.toLocaleString()} app-only SKUs ·{" "}
                {totalPhotos.toLocaleString()} photos
              </td>
              <td className="px-3 py-3 text-right tabular-nums">
                {totalQty.toLocaleString()}
              </td>
              <td className="px-3 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>
      <PhotoLightbox state={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}
