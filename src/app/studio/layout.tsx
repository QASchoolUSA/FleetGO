export const metadata = {
  title: "FleetGo Studio",
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black [color-scheme:light]">{children}</div>
  );
}
