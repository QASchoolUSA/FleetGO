"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/format";

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full" role="search">
      <Search
        className={cn(
          "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]",
          compact ? "h-4 w-4" : "h-4.5 w-4.5",
        )}
        strokeWidth={1.5}
      />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by part name, SKU, MPN, or barcode"
        className={cn(
          "w-full rounded-md border border-[var(--line)] bg-[var(--surface-muted)] pl-10 pr-24 text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--ink-muted)] focus:border-[var(--field)] focus:bg-white",
          compact ? "h-10 text-sm" : "h-11 text-sm",
        )}
        aria-label="Search parts"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md bg-[var(--signal)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[var(--signal-dark)]"
      >
        Search
      </button>
    </form>
  );
}
