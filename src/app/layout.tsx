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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111317" },
  ],
};

// Reading cookies makes every page dynamic, which the nonce CSP needs anyway (proxy.ts). The theme and motion
// choices come from cookies so the server renders them with no flash (§5.11).
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const jar = await cookies();
  const theme = jar.get("wb_theme")?.value;
  const motion = jar.get("wb_motion")?.value;
  return (
    <html
      lang="en"
      data-theme={theme === "light" || theme === "dark" ? theme : undefined}
      data-motion={motion === "reduce" || motion === "full" ? motion : undefined}
    >
      <body>{children}</body>
    </html>
  );
}
