import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "siteName", type: "string", initialValue: "FleetGo" }),
    defineField({ name: "tagline", type: "string" }),
    defineField({ name: "phone", type: "string" }),
    defineField({ name: "email", type: "string" }),
    defineField({ name: "address", type: "string" }),
    defineField({
      name: "googleSiteVerification",
      type: "string",
      description: "Google Search Console verification code",
    }),
    defineField({
      name: "bingSiteVerification",
      type: "string",
      description: "Bing Webmaster Tools verification code",
    }),
  ],
});
