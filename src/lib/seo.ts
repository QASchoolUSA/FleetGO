import type { Metadata } from "next";
import type { CatalogProduct } from "@/lib/catalog/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function absoluteUrl(path = "/"): string {
  return new URL(path, siteUrl).toString();
}

const defaultOgImage = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: "FleetGo — Auto and semi truck parts",
};

export function baseMetadata(settings?: {
  siteName?: string;
  tagline?: string;
  googleSiteVerification?: string;
  bingSiteVerification?: string;
}): Metadata {
  const siteName = settings?.siteName || "FleetGo";
  const title = `${siteName} | Auto & Semi Truck Parts`;
  const description =
    settings?.tagline ||
    "Shop auto and semi truck parts online. Fast search, vehicle fitment, and reliable delivery from FleetGo.";

  const verification: Metadata["verification"] = {};
  if (settings?.googleSiteVerification) {
    verification.google = settings.googleSiteVerification;
  }
  if (settings?.bingSiteVerification) {
    verification.other = { "msvalidate.01": settings.bingSiteVerification };
  }

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    applicationName: siteName,
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName,
      title,
      description,
      url: siteUrl,
      images: [defaultOgImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [defaultOgImage.url],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    verification: Object.keys(verification).length ? verification : undefined,
    alternates: { canonical: "/" },
  };
}

export function productMetadata(product: CatalogProduct): Metadata {
  const title = `${product.title} — ${product.brand}`;
  const description =
    product.shortDescription ||
    product.description.slice(0, 155) ||
    `Buy ${product.title} at FleetGo. SKU ${product.sku}.`;
  const images = product.images[0]?.url
    ? [
        {
          url: product.images[0].url,
          width: 900,
          height: 720,
          alt: product.images[0].alt || product.title,
        },
      ]
    : [defaultOgImage];

  return {
    title,
    description,
    alternates: { canonical: `/p/${product.slug}` },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/p/${product.slug}`),
      siteName: "FleetGo",
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [images[0].url],
    },
  };
}

export function productJsonLd(product: CatalogProduct) {
  const availability =
    product.stockStatus === "in_stock" || product.stockStatus === "low_stock"
      ? "https://schema.org/InStock"
      : product.stockStatus === "preorder"
        ? "https://schema.org/PreOrder"
        : "https://schema.org/OutOfStock";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    sku: product.sku,
    mpn: product.mpn,
    gtin13: product.barcode,
    brand: { "@type": "Brand", name: product.brand },
    image: product.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/p/${product.slug}`),
      priceCurrency: product.currency,
      price: product.price.toFixed(2),
      availability,
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

export function organizationJsonLd(settings: {
  siteName: string;
  phone?: string;
  email?: string;
  address?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    name: settings.siteName,
    url: absoluteUrl("/"),
    telephone: settings.phone,
    email: settings.email,
    image: absoluteUrl("/og.jpg"),
    address: settings.address
      ? {
          "@type": "PostalAddress",
          streetAddress: settings.address,
        }
      : undefined,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
