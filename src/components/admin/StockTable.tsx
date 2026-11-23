"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera, MapPin } from "lucide-react";
import { formatMoney, stockLabel } from "@/lib/format";
import type { StockRow } from "@/lib/admin/types";
import { PhotoLightbox, type LightboxState } from "./PhotoLightbox";

const CONTAINER_LABELS: Record<string, string> = {
  pallet: "Pallet",
  cardboardBox: "Cardboard box",
  plasticBox: "Plastic box",
  floorLoose: "Floor loose",
};

function DataBadges({ row }: { row: StockRow }) {
  const chips: Array<{ label: string; ok: boolean }> = [
    { label: row.price > 0 ? "Price" : "No price", ok: row.price > 0 },
    {
      label: row.hasDescription ? "Desc" : "No desc",
      ok: row.hasDescription,
    },
    {
      label: row.fitmentCount > 0 ? `Fit ${row.fitmentCount}` : "No fitment",
      ok: row.fitmentCount > 0,
    },
    {
      label: row.specsCount > 0 ? `Specs ${row.specsCount}` : "No specs",
      ok: row.specsCount > 0,
    },
  ];
  return (
    <span className="inline-flex flex-wrap gap-1">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className={
            chip.ok
              ? "inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 ring-1 ring-inset ring-emerald-200"
              : "inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-900 ring-1 ring-inset ring-amber-200"
          }
        >
          {chip.label}
        </span>
      ))}
    </span>
  );
}

function SyncBadge({ row }: { row: StockRow }) {
  if (row.isLocalOnly && row.isNoBarcode) {
    return (
      <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
        No barcode · App-only
      </span>
    );
  }
  if (row.isNoBarcode) {
    return (
      <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800 ring-1 ring-inset ring-emerald-200">
        No barcode · Published
      </span>
    );
  }
  if (row.isLocalOnly && row.isUnrecognizedBarcode) {
    return (
      <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
        Unrecognized · App-only
      </span>
    );
  }
  if (row.isLocalOnly) {
    return (
      <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
        App-only
      </span>
    );
  }
  if (row.webSyncStatus && row.webSyncStatus !== "published") {
    return (
      <span className="inline-flex items-center rounded-md bg-[#fff1f2] px-1.5 py-0.5 text-[11px] font-medium text-[var(--signal)]">
        sync: {row.webSyncStatus}
      </span>
    );
  }
  return null;
}

function QtyCell({
  row,
  showQtyGap,
}: {
  row: StockRow;
  showQtyGap?: boolean;
}) {
  const delta = row.qtyDelta;
  const showDelta =
    showQtyGap &&
    typeof row.manifestQty === "number" &&
    typeof delta === "number";
  return (
    <div className="text-right">
      <div className="tabular-nums font-medium">
        {row.quantity.toLocaleString()}
      </div>
      {showDelta ? (
        <div
          className={
            delta < 0
              ? "text-[11px] tabular-nums font-medium text-[var(--signal)]"
              : delta > 0
                ? "text-[11px] tabular-nums text-[var(--field)]"
                : "text-[11px] tabular-nums text-[var(--ink-muted)]"
          }
        >
          vs lot {row.manifestQty!.toLocaleString()}
          {delta === 0
            ? " · exact"
            : ` · ${delta > 0 ? "+" : ""}${delta.toLocaleString()}`}
        </div>
      ) : null}
    </div>
  );
}

export function StockTable({
  rows,
  showQtyGap = false,
}: {
  rows: StockRow[];
  showQtyGap?: boolean;
}) {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-10 text-center text-sm text-[var(--ink-muted)]">
        No products match this filter.
      </p>
    );
  }

  const totalQty = rows.reduce((s, r) => s + r.quantity, 0);
  const totalExt = rows.reduce((s, r) => s + r.quantity * r.price, 0);

  return (
    <>
      <div className="overflow-auto rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_8px_24px_rgba(18,24,32,0.04)]">
        <table className="w-full min-w-[880px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[#f8fafc] text-left text-[11px] uppercase tracking-[0.08em] text-[var(--ink-muted)]">
              <th className="px-3 py-3 font-semibold">Product</th>
              <th className="px-3 py-3 font-semibold">SKU / MPN</th>
              <th className="px-3 py-3 font-semibold">Data</th>
              <th className="px-3 py-3 font-semibold">Location</th>
              <th className="px-3 py-3 text-right font-semibold">
                {showQtyGap ? "Qty vs lot" : "Qty"}
              </th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 text-right font-semibold">Price</th>
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
                          className="group relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface-muted)]"
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
                      ) : null}
                      <div className="min-w-0">
                        {row.slug ? (
                          <Link
                            href={`/p/${row.slug}`}
                            className="font-medium text-[var(--navy)] hover:underline"
                          >
                            {row.title}
                          </Link>
                        ) : (
                          <span className="font-medium text-[var(--ink)]">
                            {row.title}
                          </span>
                        )}
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[var(--ink-muted)]">
                          <span>{row.brand}</span>
                          {row.categories[0] ? (
                            <span>· {row.categories[0]}</span>
                          ) : null}
                          <SyncBadge row={row} />
                          {row.manifestItem ? (
                            <span className="inline-flex items-center rounded bg-[#eef5f0] px-1.5 py-0.5 font-mono text-[11px] text-[#14532d]">
                              {row.manifestItem}
                            </span>
                          ) : null}
                          {!thumb && row.catalogPhotoCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--ink-muted)]">
                              <Camera className="h-3 w-3" />
                              {row.catalogPhotoCount}
                            </span>
                          ) : null}
                        </div>
                        {row.manifestDescription ? (
                          <p className="mt-1 line-clamp-2 text-[11px] text-[var(--ink-muted)]">
                            <span className="font-medium text-[var(--ink)]">
                              Manifest:
                            </span>{" "}
                            {row.manifestDescription}
                            {typeof row.manifestUnitRetail === "number" &&
                            row.manifestUnitRetail > 0
                              ? ` · retail ${formatMoney(row.manifestUnitRetail)}`
                              : ""}
                          </p>
                        ) : null}
                        {row.description ? (
                          <p className="mt-0.5 line-clamp-1 text-xs text-[var(--ink-muted)]">
                            {row.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-col gap-1">
                      <code className="w-fit rounded bg-[#eef5f0] px-1.5 py-0.5 font-mono text-[12px]">
                        {row.mpn || (row.isNoBarcode ? "—" : row.sku)}
                      </code>
                      <span className="font-mono text-[11px] text-[var(--ink-muted)]">
                        {row.isNoBarcode ? "No barcode" : row.barcode || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <DataBadges row={row} />
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
                  <td className="px-3 py-2.5">
                    <QtyCell row={row} showQtyGap={showQtyGap} />
                  </td>
                  <td className="px-3 py-2.5 text-[var(--ink-muted)]">
                    {stockLabel(row.stockStatus)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    <div>
                      {row.price > 0 ? formatMoney(row.price) : "—"}
                    </div>
                    {typeof row.manifestUnitRetail === "number" &&
                    row.manifestUnitRetail > 0 &&
                    showQtyGap ? (
                      <div className="text-[11px] text-[var(--ink-muted)]">
                        lot {formatMoney(row.manifestUnitRetail)}
                      </div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[var(--line)] bg-[#f8fafc] font-semibold">
              <td className="px-3 py-3" colSpan={4}>
                Total · {rows.length.toLocaleString()} SKUs
              </td>
              <td className="px-3 py-3 text-right tabular-nums">
                {totalQty.toLocaleString()}
              </td>
              <td className="px-3 py-3 text-[var(--ink-muted)]">Ext. value</td>
              <td className="px-3 py-3 text-right tabular-nums">
                {formatMoney(totalExt)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <PhotoLightbox state={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}
