import { defineArrayMember, defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "shortDescription", type: "string" }),
    defineField({ name: "description", type: "text", rows: 5 }),
    defineField({
      name: "images",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", type: "string", title: "Alt text" })],
        }),
      ],
    }),
    defineField({ name: "price", type: "number", validation: (r) => r.required().min(0) }),
    defineField({ name: "compareAtPrice", type: "number" }),
    defineField({ name: "currency", type: "string", initialValue: "USD" }),
    defineField({ name: "sku", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "barcode",
      type: "string",
      description: "Aligned with Convex barcode for future inventory sync",
    }),
    defineField({
      name: "mpn",
      type: "string",
      description: "Manufacturer part number — matches Convex mpn",
    }),
    defineField({
      name: "brand",
      type: "reference",
      to: [{ type: "brand" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "categories",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "category" }] })],
    }),
    defineField({
      name: "fitment",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "yearFrom", type: "number" }),
            defineField({ name: "yearTo", type: "number" }),
            defineField({ name: "make", type: "string" }),
            defineField({ name: "model", type: "string" }),
            defineField({ name: "engine", type: "string" }),
            defineField({ name: "notes", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "specs",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", type: "string" }),
            defineField({ name: "value", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "stockStatus",
      type: "string",
      options: {
        list: [
          { title: "In stock", value: "in_stock" },
          { title: "Low stock", value: "low_stock" },
          { title: "Out of stock", value: "out_of_stock" },
          { title: "Pre-order", value: "preorder" },
        ],
      },
      initialValue: "in_stock",
    }),
    defineField({
      name: "quantity",
      type: "number",
      description: "Maps to Convex quantity for future sync",
    }),
    defineField({
      name: "convexProductKey",
      type: "string",
      description: "Optional Convex document id / barcode key for sync",
    }),
    defineField({
      name: "duty",
      type: "string",
      options: {
        list: [
          { title: "Light duty", value: "light" },
          { title: "Semi / HD", value: "semi" },
          { title: "Both", value: "both" },
        ],
      },
      initialValue: "both",
    }),
    defineField({ name: "featured", type: "boolean", initialValue: false }),
    defineField({
      name: "seo",
      type: "object",
      fields: [
        defineField({ name: "title", type: "string" }),
        defineField({ name: "description", type: "text" }),
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "sku", media: "images.0" },
  },
});
