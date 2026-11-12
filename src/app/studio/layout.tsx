export const metadata = {
  title: "FleetGo Studio",
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--ink)] [color-scheme:light]">
      {children}
    </div>
  );
}
