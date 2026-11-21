export type ManifestExceptionStatus = "physically_received" | "ignored";

export type ManifestException = {
  status: ManifestExceptionStatus;
  note?: string;
};

export type ManifestExceptions = Record<string, ManifestException>;

export type ManifestLine = {
  item: string;
  brandCode: string;
  mpn: string;
  normalizedMpn: string;
  description: string;
  qty: number;
  unitRetail: number;
  extRetail: number;
  category: string;
  sellerCategory: string;
  condition: string;
  lotId: string;
};

/** Inventory row used for warehouse reconciliation (Convex preferred). */
export type InventoryProduct = {
  id: string;
  title: string;
  slug?: string;
  sku?: string;
  mpn?: string;
  barcode?: string;
  brand?: string;
  quantity: number;
  stockStatus?: string;
  price?: number;
  categories?: string[];
  webSyncStatus?: string;
  webSyncError?: string;
  webSlug?: string;
  sanityDocumentId?: string;
};

export type StockRow = {
  id: string;
  title: string;
  slug: string;
  sku: string;
  mpn?: string;
  barcode?: string;
  brand: string;
  quantity: number;
  stockStatus: string;
  price: number;
  categories: string[];
  webSyncStatus?: string;
  webSyncError?: string;
};

export type GapRow = {
  item: string;
  mpn: string;
  description: string;
  category: string;
  sellerCategory: string;
  manifestQty: number;
  onHandQty: number;
  gapQty: number;
  unitRetail: number;
  gapExtRetail: number;
  manifestExtRetail: number;
  barcodes: string[];
  exceptionNote?: string;
  webSyncStatus?: string;
};

export type PublishIssueRow = {
  id: string;
  title: string;
  barcode: string;
  mpn?: string;
  quantity: number;
  webSyncStatus: string;
  webSyncError?: string;
  catalogPhotoCount?: number;
  imageCount?: number;
  brand?: string;
};

export type AuditSummary = {
  generatedAt: string;
  lotId: string;
  source: "convex" | "sanity";
  manifestSkus: number;
  manifestUnits: number;
  manifestExtRetail: number;
  stockSkus: number;
  stockUnits: number;
  matchedSkus: number;
  missingSkus: number;
  missingUnits: number;
  missingExtRetail: number;
  shortfallSkus: number;
  shortfallUnits: number;
  shortfallExtRetail: number;
  acknowledgedSkus: number;
  acknowledgedUnits: number;
  acknowledgedExtRetail: number;
  publishIssueSkus: number;
  exactMatchSkus: number;
  overSkus: number;
  overUnits: number;
  totalGapUnits: number;
  totalGapExtRetail: number;
  skuCoveragePct: number;
  unitCoveragePct: number;
};

export type CategoryRollup = {
  category: string;
  skus: number;
  qty: number;
  ext: number;
};

export type ManifestAuditResult = {
  summary: AuditSummary;
  stock: StockRow[];
  missing: GapRow[];
  shortfalls: GapRow[];
  acknowledged: GapRow[];
  overs: GapRow[];
  publishIssues: PublishIssueRow[];
  categoryRollup: CategoryRollup[];
};
