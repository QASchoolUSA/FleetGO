"use client";

import { Camera, MapPin, Smartphone } from "lucide-react";
import { formatMoney } from "@/lib/format";
import {
  partsCatalogBarcodeUrl,
  partsCatalogProductUrl,
} from "@/lib/admin/mobileDeepLink";
import type { GapMatch, GapRow } from "@/lib/admin/types";

type Mode = "missing" | "shortfall" | "acknowledged";

function openAppHref(match: GapMatch): string | null {
  if (match.id) return partsCatalogProductUrl(match.id);
  if (match.barcode) return partsCatalogBarcodeUrl(match.barcode);
  return null;
}

function MatchThumbs({ matches }: { matches: GapMatch[] }) {
  if (matches.length === 0) {
    return (
      <div
        className="flex h-11 w-11 items-center justify-center rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface-muted)] text-[var(--ink-muted)]"
        title="No Convex photos yet"
      >
        <Camera className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {matches.slice(0, 3).map((match) => {
        const href = openAppHref(match);
        const thumb = match.photoUrls[0];
        const label = `Open ${match.title} in Parts Catalog`;

        const inner = thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={match.title}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[var(--ink-muted)]">
            <Smartphone className="h-4 w-4" />
          </span>
        );

        const className =
          "group relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface-muted)]";

        if (!href) {
          return (
            <div key={match.id || match.title} className={className} title={match.title}>
              {inner}
            </div>
          );
        }

        return (
          <a
            key={match.id || match.title}
            href={href}
            title={label}
            aria-label={label}
            className={`${className} ring-[var(--field)]/0 transition hover:ring-2 hover:ring-[var(--field)]/40`}
          >
            {inner}
            {match.photoUrls.length > 1 ? (
              <span className="absolute right-0.5 bottom-0.5 rounded bg-black/75 px-1 text-[10px] font-semibold leading-tight text-white tabular-nums">
                +{match.photoUrls.length - 1}
              </span>
            ) : null}
          </a>
        );
      })}
      {matches.length > 3 ? (
        <span className="text-[11px] text-[var(--ink-muted)]">
          +{matches.length - 3}
        </span>
      ) : null}
    </div>
  );
}

export function GapTable({ rows, mode }: { rows: GapRow[]; mode: Mode }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-10 text-center text-sm text-[var(--ink-muted)]">
        Nothing in this list.
      </p>
    );
  }

  const showPhotos = mode === "shortfall";
  const totalManifest = rows.reduce((s, r) => s + r.manifestQty, 0);
  const totalOnHand = rows.reduce((s, r) => s + r.onHandQty, 0);
  const totalGapQty = rows.reduce(
    (s, r) => s + (mode === "acknowledged" ? r.manifestQty : r.gapQty),
    0,
  );
  const totalRetail = rows.reduce(
    (s, r) =>
      s + (mode === "acknowledged" ? r.manifestExtRetail : r.gapExtRetail),
    0,
  );

  const leadColSpan = showPhotos ? 4 : 3;

  return (
    <div className="overflow-auto rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_8px_24px_rgba(18,24,32,0.04)]">
      <table className="w-full min-w-[800px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] bg-[#f8fafc] text-left text-[11px] uppercase tracking-[0.08em] text-[var(--ink-muted)]">
            {showPhotos ? (
              <th className="px-3 py-3 font-semibold">Photo</th>
            ) : null}
            <th className="px-3 py-3 font-semibold">Item #</th>
            <th className="px-3 py-3 font-semibold">Description</th>
            <th className="px-3 py-3 font-semibold">Category</th>
            {mode === "shortfall" ? (
              <>
                <th className="px-3 py-3 text-right font-semibold">Manifest</th>
                <th className="px-3 py-3 text-right font-semibold">On hand</th>
                <th className="px-3 py-3 text-right font-semibold">Short</th>
              </>
            ) : (
              <th className="px-3 py-3 text-right font-semibold">Qty</th>
            )}
            <th className="px-3 py-3 text-right font-semibold">
              {mode === "acknowledged" ? "Ext. Retail" : "Gap retail"}
            </th>
            {mode === "acknowledged" ? (
              <th className="px-3 py-3 font-semibold">Note</th>
            ) : null}
            {showPhotos ? (
              <th className="px-3 py-3 font-semibold">App</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const matches = row.matches ?? [];
            const primary = matches[0];
            const appHref = primary ? openAppHref(primary) : null;

            return (
              <tr
                key={row.item}
                className="border-b border-[var(--line)] hover:bg-[var(--surface-muted)]/60"
              >
                {showPhotos ? (
                  <td className="px-3 py-2.5">
                    <MatchThumbs matches={matches} />
                  </td>
                ) : null}
                <td className="px-3 py-2.5">
                  <code className="rounded bg-[#eef5f0] px-1.5 py-0.5 font-mono text-[12px]">
                    {row.item}
                  </code>
                </td>
                <td className="max-w-[300px] px-3 py-2.5">
                  <div className="line-clamp-2">{row.description}</div>
                  {mode === "shortfall" &&
                  row.locations &&
                  row.locations.length > 0 ? (
                    <div className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--ink-muted)]">
                      <MapPin className="h-3 w-3 shrink-0 text-[var(--field)]" />
                      {row.locations.join(" · ")}
                    </div>
                  ) : null}
                  {showPhotos && primary?.title ? (
                    <div className="mt-1 line-clamp-1 text-[11px] text-[var(--ink-muted)]">
                      {primary.title}
                      {matches.length > 1
                        ? ` · +${matches.length - 1} match${matches.length === 2 ? "" : "es"}`
                        : ""}
                    </div>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 text-xs text-[var(--ink-muted)]">
                  {row.category}
                </td>
                {mode === "shortfall" ? (
                  <>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {row.manifestQty.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      <div>{row.onHandQty.toLocaleString()}</div>
                      {row.packSize && row.rawOnHandQty !== undefined ? (
                        <div className="text-[11px] text-[var(--ink-muted)]">
                          {row.rawOnHandQty} × {row.packSize}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-[var(--signal)]">
                      {row.gapQty.toLocaleString()}
                    </td>
                  </>
                ) : (
                  <td className="px-3 py-2.5 text-right tabular-nums font-medium">
                    {(mode === "acknowledged"
                      ? row.manifestQty
                      : row.gapQty
                    ).toLocaleString()}
                  </td>
                )}
                <td className="px-3 py-2.5 text-right tabular-nums font-semibold">
                  {formatMoney(
                    mode === "acknowledged"
                      ? row.manifestExtRetail
                      : row.gapExtRetail,
                  )}
                </td>
                {mode === "acknowledged" ? (
                  <td className="px-3 py-2.5 text-xs text-[var(--ink-muted)]">
                    {row.exceptionNote || "—"}
                  </td>
                ) : null}
                {showPhotos ? (
                  <td className="px-3 py-2.5">
                    {appHref ? (
                      <a
                        href={appHref}
                        title="Open in Parts Catalog"
                        className="inline-flex items-center gap-1.5 rounded-md bg-[#eef5f0] px-2 py-1 text-[11px] font-semibold text-[#14532d] transition hover:bg-[#dcefe3]"
                      >
                        <Smartphone className="h-3.5 w-3.5" />
                        Open
                      </a>
                    ) : (
                      <span className="text-xs text-[var(--ink-muted)]">—</span>
                    )}
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-[var(--line)] bg-[#f8fafc] font-semibold">
            <td className="px-3 py-3" colSpan={leadColSpan}>
              Total · {rows.length.toLocaleString()} SKUs
            </td>
            {mode === "shortfall" ? (
              <>
                <td className="px-3 py-3 text-right tabular-nums">
                  {totalManifest.toLocaleString()}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {totalOnHand.toLocaleString()}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-[var(--signal)]">
                  {totalGapQty.toLocaleString()}
                </td>
              </>
            ) : (
              <td className="px-3 py-3 text-right tabular-nums">
                {totalGapQty.toLocaleString()}
              </td>
            )}
            <td className="px-3 py-3 text-right tabular-nums text-[var(--signal)]">
              {formatMoney(totalRetail)}
            </td>
            {mode === "acknowledged" ? <td className="px-3 py-3" /> : null}
            {showPhotos ? <td className="px-3 py-3" /> : null}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
