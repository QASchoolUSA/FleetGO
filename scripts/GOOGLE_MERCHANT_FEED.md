# Google Merchant Center product feed

FleetGo serves a **TSV primary feed** from the production Sanity catalog for scheduled pulls in Google Merchant Center free listings. The feed refuses sample data or a partial catalog.

## Local validation

1. Ensure Sanity is configured with the production catalog. Local sample data is not suitable for launch validation.
2. `src/lib/shipping/product-package-profiles.json` contains the package profiles used by both the feed and checkout. Most profiles are low-confidence category estimates, not measured cartons; see the report's confidence counts and replace them with measured packed dimensions and weights as they become available.
3. From the FLEETGO repo root:

```bash
npm run export:google-merchant
```

4. Outputs land in `exports/` (gitignored):

| File | Use |
|------|-----|
| `google-merchant.tsv` | Local copy of the feed |
| `google-merchant-report.md` | Included / skipped counts and reasons |

Fix skipped products (missing image, brand, GTIN/MPN, package profile, or unique item ID) before relying on Merchant Center. The live route returns an error instead of publishing a partial feed.

## Live feed URL

Set a long random secret in production (and `.env.local` for local tests):

```bash
GOOGLE_MERCHANT_FEED_SECRET=your-long-random-secret
```

Feed endpoint:

```text
https://www.fleetgollc.com/api/feeds/google-merchant?key=<GOOGLE_MERCHANT_FEED_SECRET>
```

Auth alternatives:

- Query: `?key=…`
- Header: `Authorization: Bearer …`

Unauthenticated requests return `401`. Missing secret returns `503`.

## Merchant Center setup

1. Open [Google Merchant Center](https://merchants.google.com/) for the account that already claims **fleetgollc.com**.
2. Add a primary source using **Scheduled fetch**. Keep the existing Merchant API source unchanged.
3. File URL: the live feed URL above (include the `key`); file type **TSV**; schedule daily; country US, language English, destination Free listings.
4. Configure USPS Ground Advantage rates from origin ZIP 33844 and match each `shipping_label` group to its nonstandard-fee adjustment.
5. Configure a 30-day returns policy with free return shipping, and ensure the website policy matches.
6. Confirm:
   - Website claimed / verified
   - Free listings enabled; no paid Shopping ads are configured by this integration
7. After the first fetch, open **Diagnostics** / disapprovals and reconcile with `google-merchant-report.md`.

## Attribute mapping

| GMC column | FleetGo source |
|------------|----------------|
| `id` | Unique SKU-based ID (duplicate SKUs use a stable product-ID hash suffix; maximum 50 characters) |
| `title` | product title |
| `description` | description → shortDescription |
| `link` | `https://www.fleetgollc.com/p/{slug}` |
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
| `shipping_weight`, `shipping_length`, `shipping_width`, `shipping_height` | exact SKU match or explicit title alias from the package profile file |
| `shipping_label` | Ground Advantage fee class derived from estimated package length and volume |

Eligibility skips: no image, price ≤ 0, no brand, neither valid GTIN nor MPN, no unique ID, or no package profile. Out-of-stock items remain in the feed with `availability = out_of_stock`.

## Config

Edit [`src/lib/google/merchantFeedConfig.ts`](../src/lib/google/merchantFeedConfig.ts) for:

- `googleProductCategory`
- `siteUrl` (canonical host)
- `shippingOriginZip` and `shippingService`
- `maxAdditionalImages`

## Checkout shipping

USPS Domestic Prices v3 credentials are server-only. Add `USPS_CLIENT_ID`, `USPS_CLIENT_SECRET`, and `USPS_ENVIRONMENT` to the deployment environment. USPS Developer Portal app access must include Domestic Pricing. Checkout collects a U.S. address first, calculates each item and quantity separately, and passes the fee and destination to Stripe. If USPS rates are unavailable or a package profile is missing, checkout fails with an explanation rather than charging zero.

## What is not included

- Google Content API push sync
- Google Ads / Shopping campaign creation
- Product package profiles are estimates for most SKUs; measure cartons to improve rate accuracy
