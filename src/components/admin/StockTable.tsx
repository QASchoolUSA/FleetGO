import Link from "next/link";
import { formatMoney, stockLabel } from "@/lib/format";
import type { StockRow } from "@/lib/admin/types";

export function StockTable({ rows }: { rows: StockRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-10 text-center text-sm text-[var(--ink-muted)]">
        No products match this filter.
      </p>
    );
  }

  return (
    <div className="overflow-auto rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_8px_24px_rgba(18,24,32,0.04)]">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] bg-[#f8fafc] text-left text-[11px] uppercase tracking-[0.08em] text-[var(--ink-muted)]">
            <th className="px-3 py-3 font-semibold">Product</th>
            <th className="px-3 py-3 font-semibold">SKU / MPN</th>
            <th className="px-3 py-3 font-semibold">Barcode</th>
            <th className="px-3 py-3 text-right font-semibold">Qty</th>
            <th className="px-3 py-3 font-semibold">Status</th>
            <th className="px-3 py-3 text-right font-semibold">Price</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--surface-muted)]/60"
            >
              <td className="px-3 py-2.5">
                {row.slug ? (
                  <Link
                    href={`/p/${row.slug}`}
                    className="font-medium text-[var(--navy)] hover:underline"
                  >
                    {row.title}
                  </Link>
                ) : (
                  <span className="font-medium">{row.title}</span>
                )}
                <div className="mt-0.5 text-xs text-[var(--ink-muted)]">
                  {row.brand}
                  {row.categories[0] ? ` · ${row.categories[0]}` : ""}
                  {row.webSyncStatus && row.webSyncStatus !== "published"
                    ? ` · sync: ${row.webSyncStatus}`
                    : ""}
                </div>
              </td>
              <td className="px-3 py-2.5">
                <code className="rounded bg-[#eef5f0] px-1.5 py-0.5 font-mono text-[12px]">
                  {row.mpn || row.sku}
                </code>
              </td>
              <td className="px-3 py-2.5 font-mono text-xs text-[var(--ink-muted)]">
                {row.barcode || "—"}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums font-medium">
                {row.quantity.toLocaleString()}
              </td>
              <td className="px-3 py-2.5 text-[var(--ink-muted)]">
                {stockLabel(row.stockStatus)}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">
                {formatMoney(row.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
