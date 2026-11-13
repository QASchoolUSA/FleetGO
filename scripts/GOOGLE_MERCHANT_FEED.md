# Google Merchant Center product feed

FleetGo serves a **TSV primary feed** from the live Sanity catalog for scheduled pulls in Google Merchant Center (free listings / Shopping).

## Local validation

1. Ensure `.env.local` has `NEXT_PUBLIC_SITE_URL` (production: `https://fleetgollc.com`) and Sanity credentials (see `.env.example`).
2. Prefer publishing the real catalog to Sanity first (Convex inventory sync → FleetGo).
3. From the FLEETGO repo root:

```bash
npm run export:google-merchant
```

4. Outputs land in `exports/` (gitignored):

| File | Use |
|------|-----|
| `google-merchant.tsv` | Local copy of the feed |
| `google-merchant-report.md` | Included / skipped counts and reasons |

Fix skipped products (missing image, brand, or both GTIN and MPN) before relying on Merchant Center.

## Live feed URL

Set a long random secret in production (and `.env.local` for local tests):

```bash
GOOGLE_MERCHANT_FEED_SECRET=your-long-random-secret
```

Feed endpoint:

```text
https://fleetgollc.com/api/feeds/google-merchant?key=<GOOGLE_MERCHANT_FEED_SECRET>
```

Auth alternatives:

- Query: `?key=…`
- Header: `Authorization: Bearer …`

Unauthenticated requests return `401`. Missing secret returns `503`.

## Merchant Center setup

1. Open [Google Merchant Center](https://merchants.google.com/) for the account that already claims **fleetgollc.com**.
2. **Products → Feeds → Add feed** (or edit primary feed).
3. Choose **Scheduled fetch**.
4. File URL: the live feed URL above (include the `key`).
5. File type: **TSV** / tab-delimited.
6. Fetch schedule: daily (or more often if stock/price changes frequently).
7. Confirm:
   - Website claimed / verified
   - Shipping and returns policies
   - Free listings (and Shopping ads programs if you use them)
8. After the first fetch, open **Diagnostics** / disapprovals and reconcile with `google-merchant-report.md`.

## Attribute mapping

| GMC column | FleetGo source |
|------------|----------------|
| `id` | `sku` (fallback barcode / Sanity id) |
| `title` | product title |
| `description` | description → shortDescription |
| `link` | `{NEXT_PUBLIC_SITE_URL}/p/{slug}` |
| `image_link` | first image |
| `additional_image_link` | remaining images (comma-separated) |
| `availability` | stockStatus → `in_stock` / `out_of_stock` / `preorder` |
| `price` | `{price} USD` |
| `brand` | brand title |
| `gtin` | normalized barcode when valid UPC/EAN |
| `mpn` | mpn |
| `condition` | `new` (or `refurbished` / `used` from specs) |
| `google_product_category` | config default (Vehicles & Parts…) |
| `product_type` | category titles |
| `shipping` | optional US row from [`merchantFeedConfig.ts`](../src/lib/google/merchantFeedConfig.ts) |

Eligibility skips: no image, price ≤ 0, no brand, or neither valid GTIN nor MPN. Out-of-stock items remain in the feed with `availability = out_of_stock`.

## Config

Edit [`src/lib/google/merchantFeedConfig.ts`](../src/lib/google/merchantFeedConfig.ts) for:

- `googleProductCategory`
- `shipping` feed column (or clear it and rely on Merchant Center shipping only)
- `maxAdditionalImages`

## What is not included

- Google Content API push sync
- Google Ads / Shopping campaign creation
- Per-SKU shipping weight/dims (use Merchant Center shipping or extend config later)
