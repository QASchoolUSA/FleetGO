import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FleetGo",
    short_name: "FleetGo",
    description: "Auto and semi truck parts ecommerce",
    start_url: "/",
    display: "standalone",
    background_color: "#1B54D4",
    theme_color: "#1B54D4",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
