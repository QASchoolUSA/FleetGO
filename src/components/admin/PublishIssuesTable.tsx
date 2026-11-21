import type { PublishIssueRow } from "@/lib/admin/types";

export function PublishIssuesTable({ rows }: { rows: PublishIssueRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-10 text-center text-sm text-[var(--ink-muted)]">
        No publish failures — every Convex SKU is on the website or still queued.
      </p>
    );
  }

  return (
    <div className="overflow-auto rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_8px_24px_rgba(18,24,32,0.04)]">
      <table className="w-full min-w-[800px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] bg-[#f8fafc] text-left text-[11px] uppercase tracking-[0.08em] text-[var(--ink-muted)]">
            <th className="px-3 py-3 font-semibold">Product</th>
            <th className="px-3 py-3 font-semibold">MPN</th>
            <th className="px-3 py-3 font-semibold">Barcode</th>
            <th className="px-3 py-3 text-right font-semibold">Qty</th>
            <th className="px-3 py-3 font-semibold">Status</th>
            <th className="px-3 py-3 font-semibold">Error</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--surface-muted)]/60"
            >
              <td className="px-3 py-2.5">
                <div className="font-medium">{row.title}</div>
                <div className="mt-0.5 text-xs text-[var(--ink-muted)]">
                  {row.brand || "—"}
                  {typeof row.catalogPhotoCount === "number"
                    ? ` · ${row.catalogPhotoCount} catalog photo(s)`
                    : ""}
                </div>
              </td>
              <td className="px-3 py-2.5">
                <code className="rounded bg-[#eef5f0] px-1.5 py-0.5 font-mono text-[12px]">
                  {row.mpn || "—"}
                </code>
              </td>
              <td className="px-3 py-2.5 font-mono text-xs text-[var(--ink-muted)]">
                {row.barcode || "—"}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">
                {row.quantity.toLocaleString()}
              </td>
              <td className="px-3 py-2.5">
                <span className="rounded-md bg-[#fff1f2] px-2 py-0.5 text-xs font-semibold text-[var(--signal)]">
                  {row.webSyncStatus}
                </span>
              </td>
              <td className="max-w-[320px] px-3 py-2.5 text-xs text-[var(--ink-muted)]">
                {row.webSyncError || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
