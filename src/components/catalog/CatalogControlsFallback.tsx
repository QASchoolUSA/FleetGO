export function CatalogControlsFallback() {
  return (
    <div className="lg:contents">
      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <div className="h-11 flex-1 animate-pulse rounded-md border border-[var(--line)] bg-[var(--surface-muted)]" />
        <div className="h-11 min-w-[46%] max-w-[52%] flex-1 animate-pulse rounded-md border border-[var(--line)] bg-[var(--surface-muted)]" />
      </div>
      <aside className="hidden lg:block lg:self-start">
        <div className="mb-5 h-[76px] animate-pulse rounded-lg border border-[var(--line)] bg-[var(--surface-muted)]" />
        <div className="h-[420px] animate-pulse rounded-lg border border-[var(--line)] bg-[var(--surface-muted)]" />
      </aside>
    </div>
  );
}
