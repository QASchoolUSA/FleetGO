import { getCatalog } from "@/lib/catalog/adapter";
import type { CatalogCategory } from "@/lib/catalog/types";
import { Footer } from "./Footer";
import { Header } from "./Header";

const NAV_CATEGORY_LIMIT = 8;

function pickNavCategories(categories: CatalogCategory[]): CatalogCategory[] {
  return [...categories]
    .sort((a, b) => {
      const byCount = (b.productCount ?? 0) - (a.productCount ?? 0);
      if (byCount !== 0) return byCount;
      return a.title.localeCompare(b.title);
    })
    .slice(0, NAV_CATEGORY_LIMIT);
}

export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const categories = await getCatalog().getCategories();
  const navCategories = pickNavCategories(categories);
  const footerCategories = pickNavCategories(categories).slice(0, 3);

  return (
    <>
      <Header navCategories={navCategories} />
      <main className="flex-1">{children}</main>
      <Footer shopCategories={footerCategories} />
    </>
  );
}
