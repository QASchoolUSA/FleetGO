# FleetGo

Professional auto & semi truck parts ecommerce — Next.js, Sanity, Stripe.

Fast storefront with vehicle fitment, search, cart, and Stripe Checkout. Sample catalog ships out of the box; wire Sanity + Stripe when you have credentials.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Sanity** CMS (products, categories, brands, SEO, orders)
- **Stripe Checkout** for payments
- **Motion** for restrained UI animation
- Catalog adapter ready for future **Convex** sync from [Inventory-Management-System](../Inventory-Management-System)

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Sanity credentials, the app uses `src/lib/catalog/sample-data.ts` (~24 sample parts).

## Environment

See [`.env.example`](.env.example):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (sitemap, Stripe redirects) |
| `NEXT_PUBLIC_SANITY_*` | Sanity project / dataset |
| `SANITY_API_READ_TOKEN` / `WRITE_TOKEN` | Optional until you connect Sanity |
| `SANITY_REVALIDATE_SECRET` | On-demand revalidation webhook |
| `INVENTORY_SYNC_SECRET` | Shared Bearer secret for `POST /api/inventory/sync` from Convex |
| `AUTO_PUBLISH` | Optional; default publish live (set `false` for Sanity drafts) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret (test mode OK) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

## Sanity

1. Create a free project at [sanity.io](https://www.sanity.io)
2. Put project id + dataset in `.env.local`
3. Create a write token with Editor permissions
4. Open Studio at `/studio`
5. Seed sample documents:

```bash
npm run seed
```

Product fields include `barcode`, `mpn`, `quantity`, and `convexProductKey` for inventory sync.

### Inventory sync (from barcode mobile app)

Convex posts enriched products to:

```http
POST /api/inventory/sync
Authorization: Bearer <INVENTORY_SYNC_SECRET>
```

The route uploads image URLs into Sanity assets, resolve-or-creates brand/category refs, `createOrReplace`s `product.barcode.{upc}`, and revalidates `/shop` + `/p/[slug]`. Quantity-only updates are supported when catalog content is unchanged.

Set the same `INVENTORY_SYNC_SECRET` on the Convex deployment (`FLEETGO_SYNC_URL` = this site’s origin).

## Stripe

1. Add test keys to `.env.local`
2. Forward webhooks locally: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`
4. Checkout creates a Stripe Checkout Session; paid orders are written to Sanity when a write token is set

## SEO

- Dynamic `sitemap.xml` and `robots.txt`
- Per-page `generateMetadata` + Product / Organization / Breadcrumb JSON-LD
- Cart, checkout, studio, and API routes are disallowed for crawlers
- Optional Google / Bing verification fields on Sanity `siteSettings`

## Routes

| Path | Description |
|------|-------------|
| `/` | Home |
| `/shop` | All parts + filters |
| `/c/[slug]` | Category |
| `/p/[slug]` | Product detail |
| `/brands/[slug]` | Brand |
| `/search` | Search |
| `/cart` / `/checkout` | Cart & Stripe |
| `/studio` | Sanity Studio |

## Convex bridge

Inventory-Management-System Convex enriches scanned barcodes and publishes into Sanity via `/api/inventory/sync`. Storefront still reads Sanity through `getCatalog()`; mobile shows publish status from Convex `webSyncStatus` / `webSlug`.

## Scripts

```bash
npm run dev      # local storefront
npm run build    # production build
npm run start    # serve build
npm run seed     # push sample catalog to Sanity
npm run lint     # eslint
```
