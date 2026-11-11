import { sanityWriteClient } from "./client";

type WriteClient = NonNullable<typeof sanityWriteClient>;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function stockStatusFromQuantity(quantity: number): string {
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= 2) return "low_stock";
  return "in_stock";
}

export function productDocumentId(barcode: string): string {
  const clean = barcode.replace(/\D/g, "") || slugify(barcode);
  return `product.barcode.${clean}`;
}

export function productSlug(title: string, barcode: string): string {
  const base = slugify(title) || "part";
  const suffix = barcode.replace(/\D/g, "").slice(-8) || slugify(barcode).slice(0, 8);
  return `${base}-${suffix}`;
}

export async function ensureBrand(
  client: WriteClient,
  brandName?: string | null,
): Promise<string> {
  const title = brandName?.trim() || "Unknown";
  const slug = slugify(title) || "unknown";
  const id = `brand.${slug}`;
  await client.createOrReplace({
    _id: id,
    _type: "brand",
    title,
    slug: { _type: "slug", current: slug },
  });
  return id;
}

export async function ensureCategory(
  client: WriteClient,
  categoryName?: string | null,
): Promise<string | null> {
  const title = categoryName?.trim();
  if (!title) return null;
  // Category strings from barcode APIs can be path-like: "Automotive > Filters"
  const leaf = title.split(/[>/|,]/).map((s) => s.trim()).filter(Boolean).pop() || title;
  const slug = slugify(leaf) || "uncategorized";
  const id = `category.${slug}`;
  await client.createOrReplace({
    _id: id,
    _type: "category",
    title: leaf,
    slug: { _type: "slug", current: slug },
  });
  return id;
}

const MAX_IMAGE_BYTES = 8_000_000;
const MAX_IMAGES = 16;

function filenameFromUrl(url: string, index: number): string {
  try {
    const pathname = new URL(url).pathname;
    const base = pathname.split("/").pop() || `image-${index}.jpg`;
    return base.includes(".") ? base.slice(0, 120) : `${base}.jpg`;
  } catch {
    return `image-${index}.jpg`;
  }
}

export async function uploadImagesFromUrls(
  client: WriteClient,
  imageUrls: string[],
  alt: string,
): Promise<Array<{ _type: "image"; _key: string; asset: { _type: "reference"; _ref: string }; alt: string }>> {
  const images: Array<{
    _type: "image";
    _key: string;
    asset: { _type: "reference"; _ref: string };
    alt: string;
  }> = [];

  for (const [index, url] of imageUrls.slice(0, MAX_IMAGES).entries()) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: { Accept: "image/*,*/*" },
      });
      if (!response.ok) continue;
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType && !contentType.startsWith("image/")) continue;
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.byteLength < 500 || buffer.byteLength > MAX_IMAGE_BYTES) continue;

      const asset = await client.assets.upload("image", buffer, {
        filename: filenameFromUrl(url, index),
        contentType: contentType.startsWith("image/") ? contentType : undefined,
      });

      images.push({
        _type: "image",
        _key: `img${index}-${asset._id.replace(/[^a-zA-Z0-9]/g, "").slice(-10)}`,
        asset: { _type: "reference", _ref: asset._id },
        alt,
      });
    } catch (err) {
      console.warn("image upload failed", url, err);
    }
  }

  return images;
}

export type InventorySyncPayload = {
  title: string;
  brand?: string;
  category?: string;
  description?: string;
  mpn?: string;
  barcode: string;
  sku: string;
  quantity: number;
  currency: string;
  price: number;
  compareAtPrice?: number;
  imageUrls: string[];
  convexProductKey: string;
  contentHash: string;
  imageSource?: string;
  autoPublish?: boolean;
};

export type QuantityOnlyPayload = {
  quantityOnly: true;
  barcode: string;
  convexProductKey: string;
  quantity: number;
  contentHash: string;
};

export async function syncInventoryProduct(payload: InventorySyncPayload) {
  if (!sanityWriteClient) {
    throw new Error("Sanity write client is not configured");
  }

  const client = sanityWriteClient;
  const autoPublish = payload.autoPublish !== false;
  const barcode = payload.barcode.replace(/\D/g, "") || payload.barcode;
  const slug = productSlug(payload.title, barcode);
  const docId = productDocumentId(barcode);
  const draftId = `drafts.${docId}`;

  const brandId = await ensureBrand(client, payload.brand);
  const categoryId = await ensureCategory(client, payload.category);
  const images = await uploadImagesFromUrls(client, payload.imageUrls, payload.title);

  if (images.length === 0) {
    throw new Error("Failed to upload any product images to Sanity");
  }

  const shortDescription =
    payload.description?.trim().slice(0, 160) ||
    `${payload.brand ? `${payload.brand} ` : ""}${payload.title}`.slice(0, 160);

  const doc = {
    _id: autoPublish ? docId : draftId,
    _type: "product" as const,
    title: payload.title,
    slug: { _type: "slug" as const, current: slug },
    shortDescription,
    description: payload.description?.trim() || shortDescription,
    images,
    price: payload.price,
    compareAtPrice: payload.compareAtPrice,
    currency: payload.currency || "USD",
    sku: payload.sku || barcode,
    barcode,
    mpn: payload.mpn,
    brand: { _type: "reference" as const, _ref: brandId },
    categories: categoryId
      ? [{ _type: "reference" as const, _ref: categoryId, _key: categoryId }]
      : [],
    fitment: [],
    specs: payload.imageSource
      ? [{ label: "Image source", value: payload.imageSource }]
      : [],
    stockStatus: stockStatusFromQuantity(payload.quantity),
    quantity: payload.quantity,
    convexProductKey: payload.convexProductKey,
    duty: "both" as const,
    featured: false,
    seo: {
      title: payload.title,
      description: shortDescription,
    },
  };

  // If publishing, remove any leftover draft with the same id.
  if (autoPublish) {
    try {
      await client.delete(draftId);
    } catch {
      // draft may not exist
    }
  }

  const saved = await client.createOrReplace(doc);

  return {
    sanityDocumentId: saved._id,
    slug,
    imageCount: images.length,
  };
}

export async function deleteInventoryProduct(
  barcodeRaw: string,
  opts?: { notifyConvex?: boolean },
) {
  if (!sanityWriteClient) {
    throw new Error("Sanity write client is not configured");
  }

  const barcode = barcodeRaw.replace(/\D/g, "") || barcodeRaw;
  const docId = productDocumentId(barcode);
  const draftId = `drafts.${docId}`;
  const client = sanityWriteClient;

  const existing = await client.getDocument(docId);
  const slug =
    existing &&
    typeof existing.slug === "object" &&
    existing.slug &&
    "current" in existing.slug
      ? String((existing.slug as { current?: string }).current || "")
      : "";

  try {
    await client.delete(docId);
  } catch {
    // may already be gone
  }
  try {
    await client.delete(draftId);
  } catch {
    // draft may not exist
  }

  // Notify Convex so mobile catalogs drop the same barcode (skip when Convex initiated).
  if (opts?.notifyConvex !== false) {
    await notifyConvexDeleted(barcode);
  }

  return {
    deleted: true as const,
    sanityDocumentId: docId,
    slug,
  };
}

async function notifyConvexDeleted(barcode: string) {
  const siteUrl = process.env.CONVEX_SITE_URL?.replace(/\/$/, "");
  const secret = process.env.INVENTORY_SYNC_SECRET;
  if (!siteUrl || !secret) {
    console.warn(
      "CONVEX_SITE_URL or INVENTORY_SYNC_SECRET missing — skipped mobile delete notify",
    );
    return;
  }

  try {
    const response = await fetch(`${siteUrl}/inventory/deleted`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ barcode }),
    });
    if (!response.ok) {
      const text = await response.text();
      console.warn("Convex delete notify failed", response.status, text.slice(0, 200));
    }
  } catch (err) {
    console.warn("Convex delete notify error", err);
  }
}

export async function patchInventoryQuantity(payload: QuantityOnlyPayload) {
  if (!sanityWriteClient) {
    throw new Error("Sanity write client is not configured");
  }

  const barcode = payload.barcode.replace(/\D/g, "") || payload.barcode;
  const docId = productDocumentId(barcode);
  const client = sanityWriteClient;

  const existing = await client.getDocument(docId);
  if (!existing) {
    throw new Error(`Sanity product ${docId} not found for quantity patch`);
  }

  await client
    .patch(docId)
    .set({
      quantity: payload.quantity,
      stockStatus: stockStatusFromQuantity(payload.quantity),
      convexProductKey: payload.convexProductKey,
    })
    .commit();

  const slug =
    typeof existing.slug === "object" &&
    existing.slug &&
    "current" in existing.slug
      ? String((existing.slug as { current?: string }).current || "")
      : "";

  return {
    sanityDocumentId: docId,
    slug,
    imageCount: Array.isArray(existing.images) ? existing.images.length : 0,
    quantityOnly: true as const,
  };
}

export async function revalidateCatalog(slug?: string) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!secret || !siteUrl) {
    // Fall through to in-process revalidation when called from the same app.
    return { skipped: true as const };
  }

  try {
    await fetch(`${siteUrl}/api/revalidate`, {
      method: "POST",
      headers: { "x-fleetgo-revalidate": secret },
    });
  } catch (err) {
    console.warn("revalidate fetch failed", err);
  }

  if (slug) {
    // Path-specific warm is handled by the sync route via next/cache when in-process.
  }

  return { skipped: false as const };
}
