import { defineArrayMember, defineField, defineType } from "sanity";

export const order = defineType({
  name: "order",
  title: "Order",
  type: "document",
  readOnly: true,
  fields: [
    defineField({ name: "stripeSessionId", type: "string" }),
    defineField({ name: "email", type: "string" }),
    defineField({ name: "total", type: "number" }),
    defineField({ name: "currency", type: "string" }),
    defineField({
      name: "status",
      type: "string",
      options: {
        list: ["pending", "paid", "fulfilled", "cancelled"],
      },
    }),
    defineField({
      name: "lineItems",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "sku", type: "string" }),
            defineField({ name: "title", type: "string" }),
            defineField({ name: "quantity", type: "number" }),
            defineField({ name: "price", type: "number" }),
          ],
        }),
      ],
    }),
    defineField({ name: "createdAt", type: "datetime" }),
  ],
  preview: {
    select: { title: "email", subtitle: "stripeSessionId" },
  },
});
