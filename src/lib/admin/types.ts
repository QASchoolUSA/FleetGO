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
};

export type AuditSummary = {
  generatedAt: string;
  lotId: string;
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
  categoryRollup: CategoryRollup[];
};
