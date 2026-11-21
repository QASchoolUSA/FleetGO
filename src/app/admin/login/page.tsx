"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    params.get("error") === "config"
      ? "ADMIN_SECRET is not configured on this environment."
      : null,
  );
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Invalid credentials.");
        return;
      }
      const next = params.get("next") || "/admin";
      router.replace(next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch {
      setError("Could not sign in. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[0_12px_40px_rgba(18,24,32,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--field)]">
          Restricted
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--navy)]">
          FleetGo Ops
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          Enter the admin password to review live stock and manifest gaps.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
              Password
            </span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-[var(--ink)] outline-none ring-[var(--focus-ring)] focus:ring-4"
              required
            />
          </label>
          {error ? (
            <p className="rounded-lg border border-[#f0d7bf] bg-[#fff8f1] px-3 py-2 text-sm text-[#7c2d12]">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy || !password}
            className="w-full rounded-lg bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--navy-deep)] disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-24 text-sm text-[var(--ink-muted)]">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
