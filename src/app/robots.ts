import type { MetadataRoute } from "next";
import { SITE_URL } from "@/product";

// Crawl the public pages; keep signed-in surfaces out of results. /explore and /v/ stay crawlable on purpose: they
// say noindex in their own metadata (§5.10), and a crawler can only obey that if it is allowed to read the page.
// ⚠️ Not access control: these routes are guarded by the session and RLS, this only saves crawl budget.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/auth/", "/ask", "/account", "/library", "/buy", "/start", "/chats", "/c/",
        "/saved", "/settings", "/videos", "/signin", "/signup", "/age"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
