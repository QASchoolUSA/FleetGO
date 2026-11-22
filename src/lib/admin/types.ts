export type ManifestExceptionStatus =
  | "physically_received"
  | "ignored"
  | "pack_multiplier"
  | "alias";

export type ManifestException = {
  status: ManifestExceptionStatus;
  note?: string;
  packSize?: number;
  matchBarcodes?: string[];
  matchMpns?: string[];
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
  description?: string;
  notes?: string;
  location?: string;
  containerKind?: string;
  provider?: string;
  quantity: number;
  stockStatus?: string;
  price?: number;
  categories?: string[];
  skipWebsiteSync?: boolean;
  isNoBarcode?: boolean;
  isUnrecognizedBarcode?: boolean;
  webSyncStatus?: string;
  webSyncError?: string;
  webSlug?: string;
  sanityDocumentId?: string;
  catalogPhotoCount?: number;
  catalogPhotoUrls?: string[];
  imageCount?: number;
  createdAt?: number;
  updatedAt?: number;
};

export type StockRow = {
  id: string;
  title: string;
  slug: string;
  sku: string;
  mpn?: string;
  barcode?: string;
  brand: string;
  description?: string;
  notes?: string;
  location?: string;
  containerKind?: string;
  quantity: number;
  stockStatus: string;
  price: number;
  categories: string[];
  isLocalOnly: boolean;
  isNoBarcode: boolean;
  isUnrecognizedBarcode: boolean;
  webSyncStatus?: string;
  webSyncError?: string;
  catalogPhotoCount: number;
  catalogPhotoUrls: string[];
  updatedAt?: number;
  manifestItem?: string;
};

export type GapRow = {
  item: string;
  mpn: string;
  description: string;
  category: string;
  sellerCategory: string;
  manifestQty: number;
  onHandQty: number;
  rawOnHandQty?: number;
  packSize?: number;
  gapQty: number;
  unitRetail: number;
  gapExtRetail: number;
  manifestExtRetail: number;
  barcodes: string[];
  locations?: string[];
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
  appOnlySkus: number;
  appOnlyUnits: number;
  noBarcodeSkus: number;
  unrecognizedBarcodeSkus: number;
  locatedSkus: number;
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
  appOnly: StockRow[];
  missing: GapRow[];
  shortfalls: GapRow[];
  acknowledged: GapRow[];
  overs: GapRow[];
  publishIssues: PublishIssueRow[];
  categoryRollup: CategoryRollup[];
};
