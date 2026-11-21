export type TabTotalStat = {
  label: string;
  value: string;
  emphasize?: boolean;
};

export function TabTotals({
  title,
  stats,
}: {
  title: string;
  stats: TabTotalStat[];
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 shadow-[0_4px_16px_rgba(18,24,32,0.03)]">
      <p className="text-sm font-medium text-[var(--ink)]">{title}</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
        {stats.map((stat) => (
          <div key={stat.label} className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-muted)]">
              {stat.label}
            </div>
            <div
              className={
                stat.emphasize
                  ? "tabular-nums text-base font-semibold text-[var(--signal)]"
                  : "tabular-nums text-base font-semibold text-[var(--ink)]"
              }
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
