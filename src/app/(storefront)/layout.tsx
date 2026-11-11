import { SiteChrome } from "@/components/layout/SiteChrome";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteChrome>{children}</SiteChrome>;
}
