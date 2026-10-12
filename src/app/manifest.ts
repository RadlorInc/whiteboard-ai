import type { MetadataRoute } from "next";
import { PRODUCT_NAME } from "@/product";

// §5.12: installable on a phone's home screen. Icons wait for the logo mark (A1); the favicon stands in.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: PRODUCT_NAME, short_name: PRODUCT_NAME, start_url: "/ask", display: "standalone",
    background_color: "#ffffff", theme_color: "#1f5fbf",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
