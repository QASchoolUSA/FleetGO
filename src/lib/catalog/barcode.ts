/** Normalize retail barcodes for Amazon / Google Merchant feeds. */

export type NormalizedBarcode = {
  id: string;
  type: "UPC" | "EAN" | "";
  warning?: string;
};

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Classify and normalize UPC/EAN/GTIN digit strings.
 * - 12 → UPC-A
 * - 13 → EAN-13
 * - 11 → pad leading 0 as UPC-A
 * - 14 starting with 0 → trim to EAN-13
 */
export function normalizeBarcode(raw: string | undefined): NormalizedBarcode {
  if (!raw?.trim()) return { id: "", type: "" };
  const digits = digitsOnly(raw);
  if (digits.length === 12) return { id: digits, type: "UPC" };
  if (digits.length === 13) return { id: digits, type: "EAN" };
  if (digits.length === 11) {
    // Common leading-zero strip on UPC-A
    return { id: `0${digits}`, type: "UPC", warning: "padded 11-digit barcode to UPC-A" };
  }
  if (digits.length === 14 && digits.startsWith("0")) {
    return { id: digits.slice(1), type: "EAN", warning: "trimmed GTIN-14 leading zero to EAN-13" };
  }
  return {
    id: digits,
    type: digits.length >= 12 ? "UPC" : "",
    warning: `unusual barcode length ${digits.length}`,
  };
}

/** True when barcode is a usable GTIN for Google Merchant (valid UPC or EAN). */
export function isValidGtin(barcode: NormalizedBarcode): boolean {
  return Boolean(barcode.id && (barcode.type === "UPC" || barcode.type === "EAN") && !barcode.warning?.startsWith("unusual"));
}
