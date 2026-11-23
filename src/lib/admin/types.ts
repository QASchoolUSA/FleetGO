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
  imageUrls?: string[];
  imageCount?: number;
  fitmentCount?: number;
  specsCount?: number;
  hasDescription?: boolean;
  storeOfferCount?: number;
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
  fitmentCount: number;
  specsCount: number;
  hasDescription: boolean;
  storeOfferCount: number;
  updatedAt?: number;
  manifestItem?: string;
  manifestDescription?: string;
  manifestUnitRetail?: number;
  /** Manifest lot qty when this Convex SKU matched a line. */
  manifestQty?: number;
  /** Live qty − manifest qty (negative = short vs lot). */
  qtyDelta?: number;
};

export type GapMatch = {
  id: string;
  title: string;
  barcode?: string;
  /** Prefer mobile catalog photos, then enrichment images. */
  photoUrls: string[];
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
  /** Matched Convex products (shortfalls / overs / acknowledged with hits). */
  matches?: GapMatch[];
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
  /** Live Convex SKUs with no matching manifest line. */
  unmatchedLiveSkus: number;
  unmatchedLiveUnits: number;
  /** Live SKUs missing price, description, or specs. */
  dataGapSkus: number;
  dataGapUnits: number;
  /** Matched live SKUs with qty below manifest. */
  shortQtySkus: number;
  /** Matched live SKUs with qty above manifest. */
  overQtySkus: number;
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
  /** Live inventory with no B-Stock manifest match. */
  unmatchedLive: StockRow[];
  /** Live inventory missing price / description / specs. */
  dataGaps: StockRow[];
  missing: GapRow[];
  shortfalls: GapRow[];
  acknowledged: GapRow[];
  overs: GapRow[];
  publishIssues: PublishIssueRow[];
  categoryRollup: CategoryRollup[];
};
