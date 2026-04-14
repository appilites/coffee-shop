import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Druids Nutrition",
    short_name: "Druids",
    description:
      "Order premium coffee, refreshing teas, and power-packed protein drinks for quick pickup.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#181511",
    theme_color: "#b87333",
    orientation: "portrait",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}

