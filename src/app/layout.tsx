import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { PLANS_ON, PRODUCT_NAME, SITE_URL, searchDescription } from "@/product";
import { Toaster } from "@/components/Toast";
import { InAppTip } from "@/components/InAppTip";

export const metadata: Metadata = {
  title: { default: PRODUCT_NAME, template: `%s · ${PRODUCT_NAME}` },
  description: searchDescription(20, PLANS_ON),
  // Link previews need absolute image URLs; without APP_URL they fall back to the public origin, never to nothing.
  metadataBase: new URL(process.env.APP_URL || SITE_URL),
  applicationName: PRODUCT_NAME,
  // Pages that do not declare their own get these: a shared link shows the card (app/opengraph-image.png), not a bare URL.
  openGraph: { siteName: PRODUCT_NAME, type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
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
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <InAppTip />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
