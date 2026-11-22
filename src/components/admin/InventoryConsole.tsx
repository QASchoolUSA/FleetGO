"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn, formatMoney } from "@/lib/format";
import type { ManifestAuditResult } from "@/lib/admin/types";
import { AppOnlyTable } from "./AppOnlyTable";
import { GapTable } from "./GapTable";
import { KpiStrip } from "./KpiStrip";
import { PublishIssuesTable } from "./PublishIssuesTable";
import { StockTable } from "./StockTable";
import { TabTotals } from "./TabTotals";

type TabId =
  | "stock"
  | "appOnly"
  | "missing"
  | "shortfalls"
  | "acknowledged"
  | "publish";

const TABS: { id: TabId; label: string }[] = [
  { id: "stock", label: "In stock" },
  { id: "appOnly", label: "Manual / App-only" },
  { id: "missing", label: "Missing" },
  { id: "shortfalls", label: "Shortfalls" },
  { id: "acknowledged", label: "Acknowledged" },
  { id: "publish", label: "Publish issues" },
];

type SortKey = "retail" | "qty" | "updated" | "title";

export function InventoryConsole({
  audit,
  sourceNote,
}: {
  audit: ManifestAuditResult;
  sourceNote?: string;
}) {
  const { summary } = audit;
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const reduce = useReducedMotion();

  const [tab, setTab] = useState<TabId>("stock");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sort, setSort] = useState<SortKey>("updated");

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

  const locations = useMemo(() => {
    const set = new Set<string>();
    for (const row of audit.stock) {
      if (row.location) set.add(row.location);
    }
    return ["all", ...[...set].sort((a, b) => a.localeCompare(b))];
  }, [audit.stock]);

  const q = query.trim().toLowerCase();

  const filterAndSortStock = (rows: typeof audit.stock) => {
    let next = rows;
    if (q) {
      next = next.filter((r) =>
        [
          r.title,
          r.sku,
          r.mpn,
          r.barcode,
          r.brand,
          r.location,
          r.description,
          r.notes,
          r.manifestItem,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      );
    }
    if (category !== "all") {
      next = next.filter((r) => r.categories.includes(category));
    }
    if (locationFilter !== "all") {
      next = next.filter((r) => r.location === locationFilter);
    }
    return [...next].sort((a, b) => {
      if (sort === "updated") {
        return (b.updatedAt ?? 0) - (a.updatedAt ?? 0) || a.title.localeCompare(b.title);
      }
      if (sort === "qty") return b.quantity - a.quantity || a.title.localeCompare(b.title);
      if (sort === "retail") return b.price - a.price || b.quantity - a.quantity;
      return a.title.localeCompare(b.title);
    });
  };

  const stockRows = useMemo(
    () => filterAndSortStock(audit.stock),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [audit.stock, q, category, locationFilter, sort],
  );

  const appOnlyRows = useMemo(
    () => filterAndSortStock(audit.appOnly),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [audit.appOnly, q, category, locationFilter, sort],
  );

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
        [r.item, r.mpn, r.description, r.category, ...(r.locations ?? [])]
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

  const appOnlyTotals = useMemo(() => {
    const units = appOnlyRows.reduce((s, r) => s + r.quantity, 0);
    const photos = appOnlyRows.reduce((s, r) => s + r.catalogPhotoCount, 0);
    const matched = appOnlyRows.filter((r) => Boolean(r.manifestItem)).length;
    return { skus: appOnlyRows.length, units, photos, matched };
  }, [appOnlyRows]);

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
    appOnly: { skus: appOnlyTotals.skus, units: appOnlyTotals.units },
    missing: { skus: missingTotals.skus, units: missingTotals.units },
    shortfalls: { skus: shortfallTotals.skus, units: shortfallTotals.units },
    acknowledged: {
      skus: acknowledgedTotals.skus,
      units: acknowledgedTotals.units,
    },
    publish: { skus: publishTotals.skus, units: publishTotals.units },
  };

  const isInventoryTab = tab === "stock" || tab === "appOnly";

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--field)]">
          Delivery reconciliation
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--navy)] sm:text-4xl">
              Inventory console
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--ink-muted)]">
              <span>
                Lot{" "}
                <code className="rounded bg-[#eef5f0] px-1.5 py-0.5 font-mono text-[12px]">
                  {summary.lotId}
                </code>
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    summary.source === "convex" ? "bg-emerald-500" : "bg-amber-500",
                  )}
                />
                Source{" "}
                <code className="rounded bg-[#eef5f0] px-1.5 py-0.5 font-mono text-[12px]">
                  {summary.source}
                  {sourceNote && sourceNote !== summary.source
                    ? ` (${sourceNote})`
                    : ""}
                </code>
              </span>
              <span>·</span>
              <span>Loaded {new Date(summary.generatedAt).toLocaleString()}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
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
                <p className="font-medium text-[var(--signal)]">
                  {summary.publishIssueSkus} publish issue(s)
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => startRefresh(() => router.refresh())}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-sm font-medium text-[var(--navy)] shadow-[0_4px_12px_rgba(18,24,32,0.04)] transition hover:bg-[var(--surface-muted)] disabled:opacity-60"
            >
              <RefreshCw
                className={cn("h-4 w-4", isRefreshing && "animate-spin")}
              />
              {isRefreshing ? "Syncing…" : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <KpiStrip summary={summary} />

      <div className="rounded-xl border border-[#f0d7bf] bg-[#fff8f1] px-4 py-3 text-sm text-[#7c2d12]">
        Reconciliation compares the BStock manifest to live{" "}
        <strong>Convex</strong> warehouse stock (including pack-size conversions
        and <strong>{summary.appOnlySkus} Manual / App-only</strong> items).
        App-only items stay out of <strong>Publish issues</strong>. Physically
        received unscanned items appear under <strong>Acknowledged</strong>. Not
        adjusted for sales. Missing gap{" "}
        <strong>{formatMoney(summary.missingExtRetail)}</strong> · Shortfall gap{" "}
        <strong>{formatMoney(summary.shortfallExtRetail)}</strong>.
      </div>

      <div className="flex flex-col gap-4">
        <div
          role="tablist"
          className="flex flex-wrap gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1"
        >
          {TABS.map((t) => {
            const active = tab === t.id;
            const hasAlert = t.id === "publish" && tabMeta.publish.skus > 0;
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
                    active
                      ? "text-white/80"
                      : hasAlert
                        ? "font-semibold text-[var(--signal)]"
                        : "text-[var(--ink-muted)]",
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
            placeholder="Search title, MPN, Item #, barcode, location…"
            className="min-w-[220px] flex-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--focus-ring)] focus:ring-4"
          />
          {isInventoryTab && locations.length > 1 ? (
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="max-w-[240px] rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === "all" ? "All locations" : loc}
                </option>
              ))}
            </select>
          ) : null}
          {!isInventoryTab || tab === "stock" ? (
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
          ) : null}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
          >
            <option value="updated">Sort by recently updated</option>
            <option value="retail">Sort by retail / price</option>
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
            {tab === "appOnly" ? (
              <>
                <TabTotals
                  title="Manual & app-only inventory"
                  stats={[
                    { label: "SKUs", value: String(appOnlyTotals.skus) },
                    {
                      label: "Units",
                      value: appOnlyTotals.units.toLocaleString(),
                    },
                    {
                      label: "Matched to lot",
                      value: `${appOnlyTotals.matched}/${appOnlyTotals.skus}`,
                    },
                    {
                      label: "Catalog photos",
                      value: appOnlyTotals.photos.toLocaleString(),
                    },
                  ]}
                />
                <AppOnlyTable rows={appOnlyRows} />
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
