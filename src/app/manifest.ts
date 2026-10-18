import type { MetadataRoute } from "next";
import { PRODUCT_NAME } from "@/product";

// §5.12: installable on a phone's home screen, with the robot mark (app/icon.png).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: PRODUCT_NAME, short_name: PRODUCT_NAME, start_url: "/ask", display: "standalone",
    background_color: "#0b0b0c", theme_color: "#0b0b0c",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
