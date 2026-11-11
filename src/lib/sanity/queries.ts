export const productsQuery = `*[_type == "product" && defined(slug.current)] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  description,
  shortDescription,
  price,
  compareAtPrice,
  currency,
  sku,
  barcode,
  mpn,
  "brand": brand->title,
  "brandSlug": brand->slug.current,
  "categories": categories[]->{ title, "slug": slug.current },
  "images": images[]{ "url": asset->url, alt },
  fitment,
  specs,
  stockStatus,
  quantity,
  convexProductKey,
  duty,
  featured
}`;

export const productBySlugQuery = `*[_type == "product" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  description,
  shortDescription,
  price,
  compareAtPrice,
  currency,
  sku,
  barcode,
  mpn,
  "brand": brand->title,
  "brandSlug": brand->slug.current,
  "categories": categories[]->{ title, "slug": slug.current },
  "images": images[]{ "url": asset->url, alt },
  fitment,
  specs,
  stockStatus,
  quantity,
  convexProductKey,
  duty,
  featured,
  seo
}`;

export const productByBarcodeQuery = `*[_type == "product" && barcode == $barcode][0] {
  _id,
  title,
  "slug": slug.current,
  description,
  shortDescription,
  price,
  compareAtPrice,
  currency,
  sku,
  barcode,
  mpn,
  "brand": brand->title,
  "brandSlug": brand->slug.current,
  "categories": categories[]->{ title, "slug": slug.current },
  "images": images[]{ "url": asset->url, alt },
  fitment,
  specs,
  stockStatus,
  quantity,
  convexProductKey,
  duty,
  featured
}`;

export const categoriesQuery = `*[_type == "category"] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  description,
  "image": image.asset->url,
  "parentSlug": parent->slug.current
}`;

export const categoryBySlugQuery = `*[_type == "category" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  description,
  "image": image.asset->url,
  "parentSlug": parent->slug.current,
  seo
}`;

export const brandsQuery = `*[_type == "brand"] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  description
}`;

export const brandBySlugQuery = `*[_type == "brand" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  description
}`;

export const siteSettingsQuery = `*[_type == "siteSettings"][0] {
  siteName,
  tagline,
  phone,
  email,
  address,
  googleSiteVerification,
  bingSiteVerification
}`;

export const productSlugsQuery = `*[_type == "product" && defined(slug.current)].slug.current`;
export const categorySlugsQuery = `*[_type == "category" && defined(slug.current)].slug.current`;
export const brandSlugsQuery = `*[_type == "brand" && defined(slug.current)].slug.current`;
