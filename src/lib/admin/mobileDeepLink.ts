/** Custom URL scheme registered by the Parts Catalog iOS app. */
export const PARTS_CATALOG_SCHEME = "barcodecatalog";

/** Deep link that opens a Convex product in the Parts Catalog app. */
export function partsCatalogProductUrl(productId: string): string {
  return `${PARTS_CATALOG_SCHEME}://product/${encodeURIComponent(productId)}`;
}

/** Deep link that opens a product by barcode in the Parts Catalog app. */
export function partsCatalogBarcodeUrl(barcode: string): string {
  return `${PARTS_CATALOG_SCHEME}://barcode/${encodeURIComponent(barcode)}`;
}
