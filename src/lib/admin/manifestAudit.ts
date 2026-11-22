import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CatalogProduct } from "@/lib/catalog/types";
import type { ConvexAdminProduct } from "./convexCatalog";
import type {
  AuditSummary,
  CategoryRollup,
  GapRow,
  InventoryProduct,
  ManifestAuditResult,
  ManifestException,
  ManifestExceptions,
  ManifestLine,
  PublishIssueRow,
  StockRow,
} from "./types";

const DEFAULT_MANIFEST = path.join(
  process.cwd(),
  "data/bstock-lot-dc69-21596-manifest.csv",
);
const DEFAULT_EXCEPTIONS = path.join(
  process.cwd(),
  "data/manifest-exceptions.json",
);

export function normalizeMpn(value: string | undefined | null): string {
  return (value || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

function splitItem(item: string): { brandCode: string; mpn: string } {
  if (item.includes("_")) {
    const idx = item.indexOf("_");
    return { brandCode: item.slice(0, idx), mpn: item.slice(idx + 1) };
  }
  return { brandCode: "", mpn: item };
}

function isLocalOnlyProduct(p: {
  skipWebsiteSync?: boolean;
  webSyncStatus?: string;
  isNoBarcode?: boolean;
}): boolean {
  return (
    p.skipWebsiteSync === true ||
    p.webSyncStatus === "local_only" ||
    p.isNoBarcode === true
  );
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n") {
      row.push(cell);
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    if (ch === "\r") continue;
    cell += ch;
  }
  if (cell.length || row.length) {
    row.push(cell);
    if (row.some((c) => c.trim() !== "")) rows.push(row);
  }
  return rows;
}

export function parseManifestCsv(text: string): ManifestLine[] {
  const rows = parseCsv(text.trim());
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim());
  const idx = (name: string) => header.indexOf(name);

  const iItem = idx("Item #");
  const iDesc = idx("Item Description");
  const iQty = idx("Qty");
  const iUnit = idx("Unit Retail");
  const iExt = idx("Ext. Retail");
  const iSeller = idx("Seller Category");
  const iCat = idx("Category");
  const iCond = idx("Condition");
  const iLot = idx("Lot ID");

  return rows.slice(1).map((cols) => {
    const item = (cols[iItem] || "").trim();
    const { brandCode, mpn } = splitItem(item);
    return {
      item,
      brandCode,
      mpn,
      normalizedMpn: normalizeMpn(mpn),
      description: (cols[iDesc] || "").trim(),
      qty: Math.round(Number(cols[iQty]) || 0),
      unitRetail: Number(cols[iUnit]) || 0,
      extRetail: Number(cols[iExt]) || 0,
      category: (cols[iCat] || "UNCATEGORIZED").trim(),
      sellerCategory: (cols[iSeller] || "").trim(),
      condition: (cols[iCond] || "").trim(),
      lotId: (cols[iLot] || "").trim(),
    };
  });
}

export async function loadManifestLines(): Promise<ManifestLine[]> {
  const text = await readFile(DEFAULT_MANIFEST, "utf8");
  return parseManifestCsv(text);
}

export async function loadManifestExceptions(): Promise<ManifestExceptions> {
  try {
    const text = await readFile(DEFAULT_EXCEPTIONS, "utf8");
    return JSON.parse(text) as ManifestExceptions;
  } catch {
    return {};
  }
}

export function catalogToInventory(products: CatalogProduct[]): InventoryProduct[] {
  return products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    sku: p.sku,
    mpn: p.mpn,
    barcode: p.barcode,
    brand: p.brand,
    quantity: Math.max(0, Math.floor(p.quantity ?? 0)),
    stockStatus: p.stockStatus,
    price: p.price,
    categories: p.categories.map((c) => c.title),
    skipWebsiteSync: false,
    isNoBarcode: false,
    isUnrecognizedBarcode: false,
    webSyncStatus: "published",
    webSlug: p.slug,
    catalogPhotoCount: 0,
    catalogPhotoUrls: [],
  }));
}

export function convexToInventory(
  products: ConvexAdminProduct[],
): InventoryProduct[] {
  return products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.webSlug,
    sku: p.mpn || p.barcode,
    mpn: p.mpn,
    barcode: p.barcode,
    brand: p.brand,
    description: p.description,
    notes: p.notes,
    location: p.location,
    containerKind: p.containerKind,
    provider: p.provider,
    quantity: Math.max(0, Math.floor(p.quantity ?? 0)),
    stockStatus:
      (p.quantity ?? 0) > 0
        ? "in_stock"
        : ("out_of_stock" as InventoryProduct["stockStatus"]),
    price: p.webPriceManual ?? p.webPrice ?? 0,
    categories: p.category ? [p.category] : [],
    skipWebsiteSync: p.skipWebsiteSync,
    isNoBarcode: p.isNoBarcode,
    isUnrecognizedBarcode: p.isUnrecognizedBarcode,
    webSyncStatus: p.webSyncStatus,
    webSyncError: p.webSyncError,
    webSlug: p.webSlug,
    sanityDocumentId: p.sanityDocumentId,
    catalogPhotoCount: p.catalogPhotoCount,
    catalogPhotoUrls: p.catalogPhotoUrls ?? [],
    imageCount: p.imageCount,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}

function toStockRows(
  products: InventoryProduct[],
  manifestByProductId: Map<string, string>,
): StockRow[] {
  return products
    .map((p) => {
      const localOnly = isLocalOnlyProduct(p);
      return {
        id: p.id,
        title: p.title,
        slug: p.slug || p.webSlug || "",
        sku: p.sku || p.mpn || p.barcode || "",
        mpn: p.mpn,
        barcode: p.barcode,
        brand: p.brand?.trim() || "—",
        description: p.description?.trim() || undefined,
        notes: p.notes?.trim() || undefined,
        location: p.location?.trim() || undefined,
        containerKind: p.containerKind,
        quantity: Math.max(0, Math.floor(p.quantity ?? 0)),
        stockStatus: p.stockStatus || "in_stock",
        price: p.price ?? 0,
        categories: p.categories ?? [],
        isLocalOnly: localOnly,
        isNoBarcode: Boolean(p.isNoBarcode),
        isUnrecognizedBarcode: Boolean(p.isUnrecognizedBarcode),
        webSyncStatus: p.webSyncStatus,
        webSyncError: p.webSyncError,
        catalogPhotoCount: p.catalogPhotoCount ?? 0,
        catalogPhotoUrls: p.catalogPhotoUrls ?? [],
        updatedAt: p.updatedAt,
        manifestItem: manifestByProductId.get(p.id),
      };
    })
    .sort((a, b) => b.quantity - a.quantity || a.title.localeCompare(b.title));
}

function addToMap<T>(map: Map<string, T[]>, key: string, value: T) {
  if (!key) return;
  const list = map.get(key) ?? [];
  list.push(value);
  map.set(key, list);
}

/**
 * Extract MPN keys for a product: exact MPN/SKU plus brand-prefixed suffix
 * (e.g. "AUV-AP11146" -> "AP11146", "DW-K6339" -> "K6339").
 */
function mpnKeysForProduct(p: InventoryProduct): string[] {
  const keys = new Set<string>();
  for (const field of [p.mpn, p.sku]) {
    if (!field) continue;
    const norm = normalizeMpn(field);
    if (norm) keys.add(norm);
    const trimmed = field.trim();
    const prefixMatch = trimmed.match(/^[A-Za-z]{2,4}[-_]([A-Za-z0-9][A-Za-z0-9-]{3,})$/);
    if (prefixMatch?.[1]) {
      const suffixNorm = normalizeMpn(prefixMatch[1]);
      if (suffixNorm.length >= 4) keys.add(suffixNorm);
    }
  }
  return [...keys];
}

function indexByNormalizedMpn(products: InventoryProduct[]) {
  const map = new Map<string, InventoryProduct[]>();
  for (const p of products) {
    for (const key of mpnKeysForProduct(p)) {
      addToMap(map, key, p);
    }
  }
  return map;
}

function indexByBarcode(products: InventoryProduct[]) {
  const map = new Map<string, InventoryProduct[]>();
  for (const p of products) {
    const key = normalizeMpn(p.barcode);
    if (key) addToMap(map, key, p);
  }
  return map;
}

/**
 * Extract normalized alphanumeric tokens from free text (title, description, notes)
 * so manual / lookup items whose MPN was written into title or description
 * (e.g. "Carquest CPA2324", "Part Number ST30RD25", "CSA2022") still reconcile.
 */
function extractTextTokens(p: InventoryProduct): Set<string> {
  const tokens = new Set<string>();
  const combined = [p.title, p.description, p.notes].filter(Boolean).join(" ");
  if (!combined) return tokens;

  for (const raw of combined.split(/[\s,;:()[\]{}/\\|]+/)) {
    const norm = normalizeMpn(raw);
    if (norm.length >= 5 && /[A-Z]/.test(norm) && /\d/.test(norm)) {
      tokens.add(norm);
    }
  }
  return tokens;
}

function isSafeTokenMpn(normalizedMpn: string): boolean {
  return (
    normalizedMpn.length >= 5 &&
    /[A-Z]/.test(normalizedMpn) &&
    /\d/.test(normalizedMpn)
  );
}

function gapFromLine(
  line: ManifestLine,
  onHandQty: number,
  barcodes: string[],
  exception?: ManifestException,
  webSyncStatus?: string,
  extra?: {
    rawOnHandQty?: number;
    packSize?: number;
    locations?: string[];
  },
): GapRow {
  const gapQty = Math.max(0, line.qty - onHandQty);
  return {
    item: line.item,
    mpn: line.mpn,
    description: line.description,
    category: line.category,
    sellerCategory: line.sellerCategory,
    manifestQty: line.qty,
    onHandQty,
    rawOnHandQty: extra?.rawOnHandQty,
    packSize: extra?.packSize,
    gapQty,
    unitRetail: line.unitRetail,
    gapExtRetail: gapQty * line.unitRetail,
    manifestExtRetail: line.extRetail,
    barcodes,
    locations: extra?.locations,
    exceptionNote: exception?.note,
    webSyncStatus,
  };
}

function collectPublishIssues(
  products: InventoryProduct[],
  convexMeta?: ConvexAdminProduct[],
): PublishIssueRow[] {
  const metaById = new Map((convexMeta ?? []).map((p) => [p.id, p]));
  return products
    .filter((p) => {
      // Intentionally app-only / manual items never publish to Sanity — not a failure.
      if (isLocalOnlyProduct(p)) return false;
      const status = p.webSyncStatus || "idle";
      return status === "failed" || (status !== "published" && !p.sanityDocumentId);
    })
    .map((p) => {
      const meta = metaById.get(p.id);
      return {
        id: p.id,
        title: p.title,
        barcode: p.barcode || "",
        mpn: p.mpn,
        quantity: p.quantity,
        webSyncStatus: p.webSyncStatus || "idle",
        webSyncError: p.webSyncError,
        catalogPhotoCount: meta?.catalogPhotoCount ?? p.catalogPhotoCount,
        imageCount: meta?.imageCount ?? p.imageCount,
        brand: p.brand,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function reconcileManifest(
  lines: ManifestLine[],
  products: InventoryProduct[],
  exceptions: ManifestExceptions = {},
  opts?: { source?: "convex" | "sanity"; convexMeta?: ConvexAdminProduct[] },
): ManifestAuditResult {
  const byMpn = indexByNormalizedMpn(products);
  const byBarcode = indexByBarcode(products);
  const publishIssues = collectPublishIssues(products, opts?.convexMeta);

  // Pass 1: direct MPN / SKU / explicit exception alias matching
  const lineHits = new Map<string, InventoryProduct[]>();
  const matchedProductIds = new Set<string>();
  const manifestByProductId = new Map<string, string>();

  const dedupeHits = (raw: InventoryProduct[]) => {
    const uniq = new Map<string, InventoryProduct>();
    for (const hit of raw) {
      uniq.set(hit.barcode || hit.id, hit);
    }
    return [...uniq.values()];
  };

  for (const line of lines) {
    const exception = exceptions[line.item];
    const hitsRaw: InventoryProduct[] = [
      ...(byMpn.get(line.normalizedMpn) ?? []),
    ];

    if (exception?.matchBarcodes) {
      for (const bc of exception.matchBarcodes) {
        hitsRaw.push(...(byBarcode.get(normalizeMpn(bc)) ?? []));
      }
    }
    if (exception?.matchMpns) {
      for (const aliasMpn of exception.matchMpns) {
        hitsRaw.push(...(byMpn.get(normalizeMpn(aliasMpn)) ?? []));
      }
    }

    const hits = dedupeHits(hitsRaw);
    if (hits.length > 0) {
      lineHits.set(line.item, hits);
      for (const h of hits) {
        matchedProductIds.add(h.id);
        if (!manifestByProductId.has(h.id)) {
          manifestByProductId.set(h.id, line.item);
        }
      }
    }
  }

  // Pass 2: fallback token match in title/description/notes for unmatched products
  const unmatchedProducts = products.filter((p) => !matchedProductIds.has(p.id));
  if (unmatchedProducts.length > 0) {
    const tokenIndex = new Map<string, InventoryProduct[]>();
    for (const p of unmatchedProducts) {
      for (const token of extractTextTokens(p)) {
        addToMap(tokenIndex, token, p);
      }
    }

    for (const line of lines) {
      if (lineHits.has(line.item)) continue;
      if (!isSafeTokenMpn(line.normalizedMpn)) continue;
      const fallbackHits = dedupeHits(tokenIndex.get(line.normalizedMpn) ?? []);
      if (fallbackHits.length > 0) {
        lineHits.set(line.item, fallbackHits);
        for (const h of fallbackHits) {
          matchedProductIds.add(h.id);
          if (!manifestByProductId.has(h.id)) {
            manifestByProductId.set(h.id, line.item);
          }
        }
      }
    }
  }

  const stock = toStockRows(products, manifestByProductId);
  const appOnly = stock
    .filter((row) => row.isLocalOnly)
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0) || a.title.localeCompare(b.title));

  const missing: GapRow[] = [];
  const shortfalls: GapRow[] = [];
  const acknowledged: GapRow[] = [];
  const overs: GapRow[] = [];
  let matchedSkus = 0;
  let exactMatchSkus = 0;
  let matchedOnHand = 0;

  for (const line of lines) {
    const hits = lineHits.get(line.item) ?? [];
    const rawOnHand = hits.reduce(
      (sum, p) => sum + Math.max(0, Math.floor(p.quantity ?? 0)),
      0,
    );
    const exception = exceptions[line.item];
    const packSize =
      exception?.status === "pack_multiplier" &&
      typeof exception.packSize === "number" &&
      exception.packSize > 1
        ? Math.floor(exception.packSize)
        : undefined;
    const onHand = packSize ? rawOnHand * packSize : rawOnHand;

    const barcodes = hits.map((p) => p.barcode || "").filter(Boolean);
    const locations = [
      ...new Set(hits.map((p) => p.location?.trim() || "").filter(Boolean)),
    ];
    const syncStatus = hits.map((h) => h.webSyncStatus).filter(Boolean)[0];

    if (
      exception?.status === "physically_received" ||
      exception?.status === "ignored"
    ) {
      acknowledged.push(
        gapFromLine(line, onHand, barcodes, exception, syncStatus, {
          rawOnHandQty: packSize ? rawOnHand : undefined,
          packSize,
          locations,
        }),
      );
      continue;
    }

    if (hits.length === 0) {
      missing.push(gapFromLine(line, 0, [], exception));
      continue;
    }

    matchedSkus += 1;
    matchedOnHand += onHand;
    if (onHand === line.qty) {
      exactMatchSkus += 1;
    } else if (onHand < line.qty) {
      shortfalls.push(
        gapFromLine(line, onHand, barcodes, exception, syncStatus, {
          rawOnHandQty: packSize ? rawOnHand : undefined,
          packSize,
          locations,
        }),
      );
    } else {
      overs.push(
        gapFromLine(line, onHand, barcodes, exception, syncStatus, {
          rawOnHandQty: packSize ? rawOnHand : undefined,
          packSize,
          locations,
        }),
      );
    }
  }

  missing.sort((a, b) => b.gapExtRetail - a.gapExtRetail || b.gapQty - a.gapQty);
  shortfalls.sort(
    (a, b) => b.gapQty - a.gapQty || b.gapExtRetail - a.gapExtRetail,
  );
  acknowledged.sort((a, b) => b.manifestExtRetail - a.manifestExtRetail);
  overs.sort(
    (a, b) =>
      b.onHandQty - b.manifestQty - (a.onHandQty - a.manifestQty),
  );

  const missingUnits = missing.reduce((s, r) => s + r.gapQty, 0);
  const missingExt = missing.reduce((s, r) => s + r.gapExtRetail, 0);
  const shortfallUnits = shortfalls.reduce((s, r) => s + r.gapQty, 0);
  const shortfallExt = shortfalls.reduce((s, r) => s + r.gapExtRetail, 0);
  const ackUnits = acknowledged.reduce((s, r) => s + r.manifestQty, 0);
  const ackExt = acknowledged.reduce((s, r) => s + r.manifestExtRetail, 0);

  const lotIds = [...new Set(lines.map((l) => l.lotId).filter(Boolean))];
  const stockUnits = stock.reduce((s, r) => s + r.quantity, 0);
  const appOnlyUnits = appOnly.reduce((s, r) => s + r.quantity, 0);
  const noBarcodeSkus = appOnly.filter((r) => r.isNoBarcode).length;
  const unrecognizedBarcodeSkus = appOnly.filter(
    (r) => !r.isNoBarcode && r.isUnrecognizedBarcode,
  ).length;
  const locatedSkus = stock.filter((r) => Boolean(r.location)).length;

  const manifestUnits = lines.reduce((s, r) => s + r.qty, 0);
  const manifestExt = lines.reduce((s, r) => s + r.extRetail, 0);

  const summary: AuditSummary = {
    generatedAt: new Date().toISOString(),
    lotId: lotIds[0] || "unknown",
    source: opts?.source ?? "sanity",
    manifestSkus: lines.length,
    manifestUnits,
    manifestExtRetail: round2(manifestExt),
    stockSkus: stock.length,
    stockUnits,
    appOnlySkus: appOnly.length,
    appOnlyUnits,
    noBarcodeSkus,
    unrecognizedBarcodeSkus,
    locatedSkus,
    matchedSkus,
    missingSkus: missing.length,
    missingUnits,
    missingExtRetail: round2(missingExt),
    shortfallSkus: shortfalls.length,
    shortfallUnits,
    shortfallExtRetail: round2(shortfallExt),
    acknowledgedSkus: acknowledged.length,
    acknowledgedUnits: ackUnits,
    acknowledgedExtRetail: round2(ackExt),
    publishIssueSkus: publishIssues.length,
    exactMatchSkus,
    overSkus: overs.length,
    overUnits: overs.reduce((s, r) => s + (r.onHandQty - r.manifestQty), 0),
    totalGapUnits: missingUnits + shortfallUnits,
    totalGapExtRetail: round2(missingExt + shortfallExt),
    skuCoveragePct: round1((100 * matchedSkus) / Math.max(lines.length, 1)),
    unitCoveragePct: round1((100 * matchedOnHand) / Math.max(manifestUnits, 1)),
  };

  const catMap = new Map<string, CategoryRollup>();
  for (const row of missing) {
    const cur = catMap.get(row.category) ?? {
      category: row.category,
      skus: 0,
      qty: 0,
      ext: 0,
    };
    cur.skus += 1;
    cur.qty += row.gapQty;
    cur.ext += row.gapExtRetail;
    catMap.set(row.category, cur);
  }
  const categoryRollup = [...catMap.values()]
    .map((c) => ({ ...c, ext: round2(c.ext) }))
    .sort((a, b) => b.ext - a.ext);

  return {
    summary,
    stock,
    appOnly,
    missing,
    shortfalls,
    acknowledged,
    overs,
    publishIssues,
    categoryRollup,
  };
}

export async function buildManifestAudit(
  products: InventoryProduct[],
  opts?: { source?: "convex" | "sanity"; convexMeta?: ConvexAdminProduct[] },
): Promise<ManifestAuditResult> {
  const [lines, exceptions] = await Promise.all([
    loadManifestLines(),
    loadManifestExceptions(),
  ]);
  return reconcileManifest(lines, products, exceptions, opts);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
