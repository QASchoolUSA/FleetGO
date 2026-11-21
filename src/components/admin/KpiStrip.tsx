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
  tone = "default",
  index,
}: {
  label: string;
  value: string;
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
    </motion.div>
  );
}

export function KpiStrip({ summary }: { summary: AuditSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <Kpi
        index={0}
        label="Manifest units"
        value={summary.manifestUnits.toLocaleString()}
      />
      <Kpi
        index={1}
        label="On-hand units"
        value={summary.stockUnits.toLocaleString()}
        tone="field"
      />
      <Kpi
        index={2}
        label="Missing SKUs"
        value={String(summary.missingSkus)}
        tone="signal"
      />
      <Kpi
        index={3}
        label="Gap retail"
        value={formatMoney(summary.totalGapExtRetail)}
        tone="warn"
      />
      <Kpi
        index={4}
        label="SKU coverage"
        value={`${summary.skuCoveragePct}%`}
        tone={summary.skuCoveragePct >= 70 ? "field" : "warn"}
      />
    </div>
  );
}
