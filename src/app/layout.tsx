import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { PRODUCT_NAME } from "@/product";

export const metadata: Metadata = {
  title: { default: PRODUCT_NAME, template: `%s · ${PRODUCT_NAME}` },
  description: "Ask any question and watch it drawn and explained.",
};

// §5.12: never maximum-scale or user-scalable=no.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#0b0b0c",
  colorScheme: "dark",
};

// Reading cookies makes every page dynamic, which the nonce CSP needs anyway (proxy.ts). Always dark (founder,
// 18 Oct 2026); the motion choice comes from a cookie so the server renders it with no flash (§5.11).
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const jar = await cookies();
  const motion = jar.get("wb_motion")?.value;
  return (
    <html
      lang="en"
      data-motion={motion === "reduce" || motion === "full" ? motion : undefined}
    >
      <body>{children}</body>
    </html>
  );
}
