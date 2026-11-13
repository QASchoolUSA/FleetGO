# Amazon FBM one-time catalog export

Exports the live Sanity web catalog into Amazon Seller Central flat files for **merchant-fulfilled (FBM)** listings.

## Generate the files

1. Ensure `.env.local` has `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` (see `.env.example`). Add `SANITY_API_READ_TOKEN` if the dataset is private.
2. Prefer publishing the real catalog to Sanity first (Convex inventory sync → FleetGo). If Sanity has **0** products, the script falls back to `src/lib/catalog/sample-data.ts` (same behavior as the storefront).
3. From the FLEETGO repo root:

```bash
npm run export:amazon
```

4. Outputs land in `exports/` (gitignored):

| File | Use |
|------|-----|
| `amazon-offers.csv` | Primary upload — match existing Amazon catalog by UPC/EAN, add your FBM offer |
| `amazon-listings-full.csv` | Fallback — create/update full listing attributes when UPC match fails |
| `amazon-export-report.md` | Counts, missing fields, parse failures |

## Seller Central upload order

1. Open **Seller Central → Catalog → Add products via upload**.
2. Download the current **Inventory File Template** for **Automotive** (US) so you can see Amazon’s latest column names.
3. **Upload `amazon-offers.csv` first** (Inventory Loader / offer file style).
   - `product-id` + `product-id-type` = barcode (UPC or EAN)
   - `fulfillment-center-id` = `DEFAULT` (ships yourself)
   - `item-condition` = `11` (New)
   - `handling-time` = config default (2 business days)
4. Open the **processing report**. Note SKUs with “product ID not found” / invalid UPC.
5. For those SKUs only, open `amazon-listings-full.csv` and either:
   - Paste values into Amazon’s downloaded category flat-file sheet, **or**
   - Upload after filling `product_type` in [`amazon-export-config.ts`](./amazon-export-config.ts) to match the template sheet names Amazon expects.
6. In Seller Central, confirm your **shipping template** and **handling time** match the export defaults (`merchant_shipping_group_name` is blank by default — assign your template after upload if needed).
7. Spot-check 3–5 live listings: title, main image, price, quantity, Buy Box eligibility.

## Aligning headers with Amazon’s template

Our CSVs use stable Inventory Loader / listing attribute names. Amazon occasionally renames columns in the downloaded XLSX. If upload rejects headers:

1. Open Amazon’s template sheet.
2. Copy cells from our CSV into the matching Amazon columns (SKU, product id, price, quantity, images, bullets, weight, dimensions).
3. Re-upload Amazon’s file — do not rename Amazon’s required header row.

### Offers columns we emit

`sku`, `product-id`, `product-id-type`, `price`, `item-condition`, `quantity`, `add-delete`, `fulfillment-center-id`, `handling-time`, `merchant_shipping_group_name`, …

### Full listing columns we emit

`sku`, `product_type`, `item_name`, `brand_name`, `external_product_id`, `external_product_id_type`, `manufacturer_part_number`, `standard_price`, `quantity`, `condition_type`, `fulfillment_latency`, `main_image_url`, `other_image_url1..8`, `product_description`, `bullet_point1..5`, weight/dims, `update_delete`, …

## Config

Edit [`amazon-export-config.ts`](./amazon-export-config.ts) for:

- Handling time (`fulfillmentLatency`)
- Shipping template name (`merchantShippingGroupName`)
- Category → Amazon `product_type` / template sheet placeholders (needed mainly for create-new listings)

## What is not included

- Ongoing inventory sync / SP-API
- FBA inbound
- Amazon’s dedicated vehicle-fitment (ACES) file — fitment is packed into bullets and description for this one-time pass
