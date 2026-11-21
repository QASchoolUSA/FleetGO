import { formatMoney } from "@/lib/format";
import type { GapRow } from "@/lib/admin/types";

type Mode = "missing" | "shortfall" | "acknowledged";

export function GapTable({ rows, mode }: { rows: GapRow[]; mode: Mode }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-10 text-center text-sm text-[var(--ink-muted)]">
        Nothing in this list.
      </p>
    );
  }

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

  return (
    <div className="overflow-auto rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_8px_24px_rgba(18,24,32,0.04)]">
      <table className="w-full min-w-[800px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] bg-[#f8fafc] text-left text-[11px] uppercase tracking-[0.08em] text-[var(--ink-muted)]">
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
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.item}
              className="border-b border-[var(--line)] hover:bg-[var(--surface-muted)]/60"
            >
              <td className="px-3 py-2.5">
                <code className="rounded bg-[#eef5f0] px-1.5 py-0.5 font-mono text-[12px]">
                  {row.item}
                </code>
              </td>
              <td className="max-w-[280px] px-3 py-2.5">
                <div className="line-clamp-2">{row.description}</div>
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
                    {row.onHandQty.toLocaleString()}
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
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-[var(--line)] bg-[#f8fafc] font-semibold">
            <td className="px-3 py-3" colSpan={3}>
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
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
