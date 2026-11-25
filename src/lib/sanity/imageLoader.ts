"use client";

import type { ImageLoaderProps } from "next/image";

/**
 * Custom Next.js image loader that routes Sanity CDN and Unsplash image
 * resizing/format transforms directly through their upstream CDNs, bypassing
 * Vercel's `/_next/image` optimization proxy.
 */
export default function sanityImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (!src || src.startsWith("/") || src.startsWith("data:") || src.startsWith("blob:")) {
    return src;
  }

  try {
    const url = new URL(src);
    const q = String(quality || 75);

    if (url.hostname === "cdn.sanity.io") {
      if (url.pathname.toLowerCase().endsWith(".svg")) {
        return src;
      }
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "max");
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", q);
      return url.href;
    }

    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("auto", "format");
      if (!url.searchParams.has("fit")) {
        url.searchParams.set("fit", "max");
      }
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", q);
      return url.href;
    }

    return src;
  } catch {
    return src;
  }
}
