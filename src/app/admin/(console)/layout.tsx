import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export default function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--navy)]"
            >
              FleetGo Ops
            </Link>
            <nav className="hidden text-sm text-[var(--ink-muted)] sm:block">
              <Link href="/admin" className="hover:text-[var(--ink)]">
                Inventory
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-[var(--ink-muted)] transition hover:text-[var(--ink)]"
            >
              Storefront
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
