"use client";

import { motion, useReducedMotion } from "motion/react";
import { formatMoney } from "@/lib/format";
import type { AuditSummary } from "@/lib/admin/types";
import { cn } from "@/lib/format";

type Tone = "default" | "field" | "signal" | "warn";

const toneClass: Record<Tone, string> = {
  default: "text-[var(--ink)]",
  field: "text-[var(--field)]",
  signal: "text-[var(--signal)]",
  warn: "text-[#9a3412]",
};

function Kpi({
  label,
  value,
  detail,
  tone = "default",
  index,
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: Tone;
  index: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: reduce ? 0 : index * 0.04 }}
      className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-4 shadow-[0_8px_24px_rgba(18,24,32,0.04)]"
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-muted)]">
        {label}
      </div>
      <div
        className={cn(
          "mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight tabular-nums",
          toneClass[tone],
        )}
      >
        {value}
      </div>
      {detail ? (
        <div className="mt-1 text-xs tabular-nums text-[var(--ink-muted)]">
          {detail}
        </div>
      ) : null}
    </motion.div>
  );
}

export function KpiStrip({ summary }: { summary: AuditSummary }) {
  const rawUnitGap = Math.max(0, summary.manifestUnits - summary.stockUnits);
  const stockDetail =
    summary.appOnlySkus > 0
      ? `${summary.stockSkus.toLocaleString()} SKUs (${summary.appOnlySkus} app-only)`
      : `${summary.stockSkus.toLocaleString()} SKUs`;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      <Kpi
        index={0}
        label="Manifest total"
        value={summary.manifestUnits.toLocaleString()}
        detail={`${summary.manifestSkus.toLocaleString()} SKUs`}
      />
      <Kpi
        index={1}
        label="On hand now"
        value={summary.stockUnits.toLocaleString()}
        detail={stockDetail}
        tone="field"
      />
      <Kpi
        index={2}
        label="Reconciled gap"
        value={summary.totalGapUnits.toLocaleString()}
        detail={`Raw Δ ${rawUnitGap.toLocaleString()} · miss ${summary.missingUnits} + short ${summary.shortfallUnits}`}
        tone="signal"
      />
      <Kpi
        index={3}
        label="Missing SKUs"
        value={summary.missingSkus.toLocaleString()}
        detail={`${summary.missingUnits.toLocaleString()} units · ${formatMoney(summary.missingExtRetail)}`}
        tone="signal"
      />
      <Kpi
        index={4}
        label="Gap retail"
        value={formatMoney(summary.totalGapExtRetail)}
        detail={`Shortfalls ${summary.shortfallSkus} SKUs · unmatched live ${summary.unmatchedLiveSkus}`}
        tone="warn"
      />
      <Kpi
        index={5}
        label="Unit coverage"
        value={`${summary.unitCoveragePct}%`}
        detail={`SKU ${summary.skuCoveragePct}% · ${summary.exactMatchSkus} exact · data gaps ${summary.dataGapSkus}`}
        tone={summary.unitCoveragePct >= 70 ? "field" : "warn"}
      />
    </div>
  );
}
