"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { formatMoney } from "@/lib/format";
import type { ManifestAuditResult } from "@/lib/admin/types";
import { cn } from "@/lib/format";
import { GapTable } from "./GapTable";
import { KpiStrip } from "./KpiStrip";
import { PublishIssuesTable } from "./PublishIssuesTable";
import { StockTable } from "./StockTable";
import { TabTotals } from "./TabTotals";

type TabId =
  | "stock"
  | "missing"
  | "shortfalls"
  | "publish"
  | "acknowledged";

const TABS: { id: TabId; label: string }[] = [
  { id: "stock", label: "In stock" },
  { id: "missing", label: "Missing" },
  { id: "shortfalls", label: "Shortfalls" },
  { id: "publish", label: "Publish issues" },
  { id: "acknowledged", label: "Acknowledged" },
];

type SortKey = "retail" | "qty" | "title";

export function InventoryConsole({
  audit,
  sourceNote,
}: {
  audit: ManifestAuditResult;
  sourceNote?: string;
}) {
  const { summary } = audit;
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<TabId>("missing");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>("retail");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const row of audit.missing) set.add(row.category);
    for (const row of audit.shortfalls) set.add(row.category);
    for (const row of audit.acknowledged) set.add(row.category);
    for (const row of audit.stock) {
      for (const c of row.categories) set.add(c);
    }
    return ["all", ...[...set].sort()];
  }, [audit]);

  const q = query.trim().toLowerCase();

  const stockRows = useMemo(() => {
    let rows = audit.stock;
    if (q) {
      rows = rows.filter((r) =>
        [r.title, r.sku, r.mpn, r.barcode, r.brand]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      );
    }
    if (category !== "all") {
      rows = rows.filter((r) => r.categories.includes(category));
    }
    rows = [...rows].sort((a, b) => {
      if (sort === "qty") return b.quantity - a.quantity;
      if (sort === "retail") return b.price - a.price;
      return a.title.localeCompare(b.title);
    });
    return rows;
  }, [audit.stock, q, category, sort]);

  const missingRows = useMemo(() => {
    let next = audit.missing;
    if (q) {
      next = next.filter((r) =>
        [r.item, r.mpn, r.description, r.category]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    if (category !== "all") {
      next = next.filter((r) => r.category === category);
    }
    return [...next].sort((a, b) => {
      if (sort === "qty") return b.gapQty - a.gapQty || b.gapExtRetail - a.gapExtRetail;
      if (sort === "title") return a.description.localeCompare(b.description);
      return b.gapExtRetail - a.gapExtRetail || b.gapQty - a.gapQty;
    });
  }, [audit.missing, q, category, sort]);

  const shortfallRows = useMemo(() => {
    let next = audit.shortfalls;
    if (q) {
      next = next.filter((r) =>
        [r.item, r.mpn, r.description, r.category]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    if (category !== "all") {
      next = next.filter((r) => r.category === category);
    }
    return [...next].sort((a, b) => {
      if (sort === "qty") return b.gapQty - a.gapQty || b.gapExtRetail - a.gapExtRetail;
      if (sort === "title") return a.description.localeCompare(b.description);
      return b.gapExtRetail - a.gapExtRetail || b.gapQty - a.gapQty;
    });
  }, [audit.shortfalls, q, category, sort]);
  const acknowledgedRows = useMemo(() => {
    let rows = audit.acknowledged;
    if (q) {
      rows = rows.filter((r) =>
        [r.item, r.mpn, r.description, r.exceptionNote]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    if (category !== "all") {
      rows = rows.filter((r) => r.category === category);
    }
    return [...rows].sort((a, b) => b.manifestExtRetail - a.manifestExtRetail);
  }, [audit.acknowledged, q, category]);

  const publishRows = useMemo(() => {
    let rows = audit.publishIssues;
    if (q) {
      rows = rows.filter((r) =>
        [r.title, r.mpn, r.barcode, r.webSyncError, r.brand]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    return rows;
  }, [audit.publishIssues, q]);

  const stockTotals = useMemo(() => {
    const units = stockRows.reduce((s, r) => s + r.quantity, 0);
    const retail = stockRows.reduce((s, r) => s + r.quantity * r.price, 0);
    return { skus: stockRows.length, units, retail };
  }, [stockRows]);

  const missingTotals = useMemo(() => {
    const units = missingRows.reduce((s, r) => s + r.gapQty, 0);
    const retail = missingRows.reduce((s, r) => s + r.gapExtRetail, 0);
    return { skus: missingRows.length, units, retail };
  }, [missingRows]);

  const shortfallTotals = useMemo(() => {
    const units = shortfallRows.reduce((s, r) => s + r.gapQty, 0);
    const retail = shortfallRows.reduce((s, r) => s + r.gapExtRetail, 0);
    const manifest = shortfallRows.reduce((s, r) => s + r.manifestQty, 0);
    const onHand = shortfallRows.reduce((s, r) => s + r.onHandQty, 0);
    return { skus: shortfallRows.length, units, retail, manifest, onHand };
  }, [shortfallRows]);

  const acknowledgedTotals = useMemo(() => {
    const units = acknowledgedRows.reduce((s, r) => s + r.manifestQty, 0);
    const retail = acknowledgedRows.reduce((s, r) => s + r.manifestExtRetail, 0);
    return { skus: acknowledgedRows.length, units, retail };
  }, [acknowledgedRows]);

  const publishTotals = useMemo(() => {
    const units = publishRows.reduce((s, r) => s + r.quantity, 0);
    return { skus: publishRows.length, units };
  }, [publishRows]);

  const tabMeta: Record<TabId, { skus: number; units: number }> = {
    stock: { skus: stockTotals.skus, units: stockTotals.units },
    missing: { skus: missingTotals.skus, units: missingTotals.units },
    shortfalls: { skus: shortfallTotals.skus, units: shortfallTotals.units },
    publish: { skus: publishTotals.skus, units: publishTotals.units },
    acknowledged: {
      skus: acknowledgedTotals.skus,
      units: acknowledgedTotals.units,
    },
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--field)]">
          Delivery reconciliation
        </p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--navy)] sm:text-4xl">
              Inventory console
            </h1>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Lot <code className="rounded bg-[#eef5f0] px-1.5 py-0.5 font-mono text-[12px]">{summary.lotId}</code>
              {" · "}
              Source{" "}
              <code className="rounded bg-[#eef5f0] px-1.5 py-0.5 font-mono text-[12px]">
                {summary.source}
                {sourceNote && sourceNote !== summary.source ? ` (${sourceNote})` : ""}
              </code>
              {" · "}
              Loaded {new Date(summary.generatedAt).toLocaleString()}
            </p>
          </div>
          <div className="text-right text-sm text-[var(--ink-muted)]">
            <p>
              <span className="font-medium text-[var(--ink)]">Now</span>{" "}
              {summary.stockUnits.toLocaleString()} units ·{" "}
              {summary.stockSkus.toLocaleString()} SKUs
            </p>
            <p>
              <span className="font-medium text-[var(--ink)]">Manifest</span>{" "}
              {summary.manifestUnits.toLocaleString()} units ·{" "}
              {summary.manifestSkus.toLocaleString()} SKUs
            </p>
            {summary.publishIssueSkus > 0 ? (
              <p>{summary.publishIssueSkus} publish issue(s)</p>
            ) : null}
          </div>
        </div>
      </header>

      <KpiStrip summary={summary} />

      <div className="rounded-xl border border-[#f0d7bf] bg-[#fff8f1] px-4 py-3 text-sm text-[#7c2d12]">
        Missing / shortfalls compare the BStock manifest to <strong>Convex</strong>{" "}
        on-hand inventory (warehouse source of truth).{" "}
        <strong>Publish issues</strong> are in Convex but not live on the website
        (Sanity). Physically received but unscanned items appear under{" "}
        <strong>Acknowledged</strong>. Not adjusted for sales.
        {" "}Now {summary.stockUnits.toLocaleString()} / Manifest{" "}
        {summary.manifestUnits.toLocaleString()} units · Missing gap{" "}
        {formatMoney(summary.missingExtRetail)} · Shortfall gap{" "}
        {formatMoney(summary.shortfallExtRetail)}.
      </div>

      <div className="flex flex-col gap-4">
        <div
          role="tablist"
          className="flex flex-wrap gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1"
        >
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-[var(--navy)] text-white"
                    : "text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]",
                )}
              >
                {t.label}
                <span
                  className={cn(
                    "ml-2 tabular-nums text-xs",
                    active ? "text-white/80" : "text-[var(--ink-muted)]",
                  )}
                >
                  {tabMeta[t.id].skus} · {tabMeta[t.id].units.toLocaleString()}u
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, MPN, Item #, barcode…"
            className="min-w-[220px] flex-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--focus-ring)] focus:ring-4"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
          >
            <option value="retail">Sort by retail</option>
            <option value="qty">Sort by qty</option>
            <option value="title">Sort by title</option>
          </select>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "stock" ? (
              <>
                <TabTotals
                  title="In stock totals"
                  stats={[
                    { label: "SKUs", value: String(stockTotals.skus) },
                    {
                      label: "Units",
                      value: stockTotals.units.toLocaleString(),
                    },
                    {
                      label: "Ext. value",
                      value: formatMoney(stockTotals.retail),
                    },
                  ]}
                />
                <StockTable rows={stockRows} />
              </>
            ) : null}
            {tab === "missing" ? (
              <>
                <TabTotals
                  title="Missing totals"
                  stats={[
                    { label: "SKUs", value: String(missingTotals.skus) },
                    {
                      label: "Units",
                      value: missingTotals.units.toLocaleString(),
                      emphasize: true,
                    },
                    {
                      label: "Gap retail",
                      value: formatMoney(missingTotals.retail),
                      emphasize: true,
                    },
                  ]}
                />
                <GapTable rows={missingRows} mode="missing" />
              </>
            ) : null}
            {tab === "shortfalls" ? (
              <>
                <TabTotals
                  title="Shortfall totals"
                  stats={[
                    { label: "SKUs", value: String(shortfallTotals.skus) },
                    {
                      label: "Manifest",
                      value: shortfallTotals.manifest.toLocaleString(),
                    },
                    {
                      label: "On hand",
                      value: shortfallTotals.onHand.toLocaleString(),
                    },
                    {
                      label: "Short",
                      value: shortfallTotals.units.toLocaleString(),
                      emphasize: true,
                    },
                    {
                      label: "Gap retail",
                      value: formatMoney(shortfallTotals.retail),
                      emphasize: true,
                    },
                  ]}
                />
                <GapTable rows={shortfallRows} mode="shortfall" />
              </>
            ) : null}
            {tab === "publish" ? (
              <>
                <TabTotals
                  title="Publish issue totals"
                  stats={[
                    { label: "SKUs", value: String(publishTotals.skus) },
                    {
                      label: "Units held",
                      value: publishTotals.units.toLocaleString(),
                    },
                  ]}
                />
                <PublishIssuesTable rows={publishRows} />
              </>
            ) : null}
            {tab === "acknowledged" ? (
              <>
                <TabTotals
                  title="Acknowledged totals"
                  stats={[
                    { label: "SKUs", value: String(acknowledgedTotals.skus) },
                    {
                      label: "Units",
                      value: acknowledgedTotals.units.toLocaleString(),
                    },
                    {
                      label: "Ext. retail",
                      value: formatMoney(acknowledgedTotals.retail),
                    },
                  ]}
                />
                <GapTable rows={acknowledgedRows} mode="acknowledged" />
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {audit.categoryRollup.length > 0 && tab === "missing" ? (
        <section className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--navy)]">
            Missing by category
          </h2>
          <div className="overflow-auto rounded-xl border border-[var(--line)] bg-[var(--surface)]">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[#f8fafc] text-left text-[11px] uppercase tracking-[0.08em] text-[var(--ink-muted)]">
                  <th className="px-3 py-3 font-semibold">Category</th>
                  <th className="px-3 py-3 text-right font-semibold">SKUs</th>
                  <th className="px-3 py-3 text-right font-semibold">Units</th>
                  <th className="px-3 py-3 text-right font-semibold">Ext. Retail</th>
                </tr>
              </thead>
              <tbody>
                {audit.categoryRollup.map((row) => (
                  <tr
                    key={row.category}
                    className="border-b border-[var(--line)]"
                  >
                    <td className="px-3 py-2.5">{row.category}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {row.skus}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {row.qty.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-medium">
                      {formatMoney(row.ext)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--line)] bg-[#f8fafc] font-semibold">
                  <td className="px-3 py-3">Total</td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {audit.categoryRollup.reduce((s, r) => s + r.skus, 0)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {audit.categoryRollup
                      .reduce((s, r) => s + r.qty, 0)
                      .toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {formatMoney(
                      audit.categoryRollup.reduce((s, r) => s + r.ext, 0),
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
