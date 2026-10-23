import type { MetadataRoute } from "next";
import { PLANS_ON, SITE_URL } from "@/product";
import { LEGAL } from "@/content/legal";

// Every public page that says "index" — and nothing else: a sitemap that lists a noindex page (/explore, /v/…) or a
// signed-in one sends crawlers mixed signals. /pricing redirects to /ask while plans are off, so it is listed only when on.
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] =>
    ({ url: `${SITE_URL}${path}`, changeFrequency: "weekly", priority });
  return [
    page("/", 1),
    ...(PLANS_ON ? [page("/pricing", 0.8)] : []),
    page("/help", 0.5),
    page("/contact", 0.4),
    ...Object.keys(LEGAL).map((doc) => page(`/legal/${doc}`, 0.2)),
  ];
}
