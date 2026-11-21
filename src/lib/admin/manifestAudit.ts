import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CatalogProduct } from "@/lib/catalog/types";
import type {
  AuditSummary,
  CategoryRollup,
  GapRow,
  ManifestAuditResult,
  ManifestException,
  ManifestExceptions,
  ManifestLine,
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

export async function loadManifestLines(
  filePath = DEFAULT_MANIFEST,
): Promise<ManifestLine[]> {
  const text = await readFile(filePath, "utf8");
  return parseManifestCsv(text);
}

export async function loadManifestExceptions(
  filePath = DEFAULT_EXCEPTIONS,
): Promise<ManifestExceptions> {
  try {
    const text = await readFile(filePath, "utf8");
    return JSON.parse(text) as ManifestExceptions;
  } catch {
    return {};
  }
}

function toStockRows(products: CatalogProduct[]): StockRow[] {
  return products
    .map((p) => ({
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
    }))
    .sort((a, b) => b.quantity - a.quantity || a.title.localeCompare(b.title));
}

function indexByNormalizedMpn(products: CatalogProduct[]) {
  const map = new Map<string, CatalogProduct[]>();
  for (const p of products) {
    for (const field of [p.mpn, p.sku]) {
      const key = normalizeMpn(field);
      if (!key) continue;
      const list = map.get(key) ?? [];
      list.push(p);
      map.set(key, list);
    }
  }
  return map;
}

function gapFromLine(
  line: ManifestLine,
  onHandQty: number,
  barcodes: string[],
  exception?: ManifestException,
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
    gapQty,
    unitRetail: line.unitRetail,
    gapExtRetail: gapQty * line.unitRetail,
    manifestExtRetail: line.extRetail,
    barcodes,
    exceptionNote: exception?.note,
  };
}

export function reconcileManifest(
  lines: ManifestLine[],
  products: CatalogProduct[],
  exceptions: ManifestExceptions = {},
): ManifestAuditResult {
  const byMpn = indexByNormalizedMpn(products);
  const stock = toStockRows(products);

  const missing: GapRow[] = [];
  const shortfalls: GapRow[] = [];
  const acknowledged: GapRow[] = [];
  const overs: GapRow[] = [];
  let matchedSkus = 0;
  let exactMatchSkus = 0;
  let matchedOnHand = 0;

  for (const line of lines) {
    const hitsRaw = byMpn.get(line.normalizedMpn) ?? [];
    const uniq = new Map<string, CatalogProduct>();
    for (const hit of hitsRaw) {
      uniq.set(hit.barcode || hit.id, hit);
    }
    const hits = [...uniq.values()];
    const onHand = hits.reduce(
      (sum, p) => sum + Math.max(0, Math.floor(p.quantity ?? 0)),
      0,
    );
    const barcodes = hits.map((p) => p.barcode || "").filter(Boolean);
    const exception = exceptions[line.item];

    if (exception?.status === "physically_received" || exception?.status === "ignored") {
      acknowledged.push(gapFromLine(line, onHand, barcodes, exception));
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
      shortfalls.push(gapFromLine(line, onHand, barcodes, exception));
    } else {
      overs.push(gapFromLine(line, onHand, barcodes, exception));
    }
  }

  missing.sort((a, b) => b.gapExtRetail - a.gapExtRetail || b.gapQty - a.gapQty);
  shortfalls.sort((a, b) => b.gapQty - a.gapQty || b.gapExtRetail - a.gapExtRetail);
  acknowledged.sort((a, b) => b.manifestExtRetail - a.manifestExtRetail);
  overs.sort((a, b) => b.onHandQty - b.manifestQty - (a.onHandQty - a.manifestQty));

  const missingUnits = missing.reduce((s, r) => s + r.gapQty, 0);
  const missingExt = missing.reduce((s, r) => s + r.gapExtRetail, 0);
  const shortfallUnits = shortfalls.reduce((s, r) => s + r.gapQty, 0);
  const shortfallExt = shortfalls.reduce((s, r) => s + r.gapExtRetail, 0);
  const ackUnits = acknowledged.reduce((s, r) => s + r.manifestQty, 0);
  const ackExt = acknowledged.reduce((s, r) => s + r.manifestExtRetail, 0);

  const lotIds = [...new Set(lines.map((l) => l.lotId).filter(Boolean))];
  const stockUnits = stock.reduce((s, r) => s + r.quantity, 0);
  const manifestUnits = lines.reduce((s, r) => s + r.qty, 0);
  const manifestExt = lines.reduce((s, r) => s + r.extRetail, 0);

  const summary: AuditSummary = {
    generatedAt: new Date().toISOString(),
    lotId: lotIds[0] || "unknown",
    manifestSkus: lines.length,
    manifestUnits,
    manifestExtRetail: round2(manifestExt),
    stockSkus: stock.length,
    stockUnits,
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
    missing,
    shortfalls,
    acknowledged,
    overs,
    categoryRollup,
  };
}

export async function buildManifestAudit(
  products: CatalogProduct[],
): Promise<ManifestAuditResult> {
  const [lines, exceptions] = await Promise.all([
    loadManifestLines(),
    loadManifestExceptions(),
  ]);
  return reconcileManifest(lines, products, exceptions);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
