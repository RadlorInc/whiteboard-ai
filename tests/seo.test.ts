// The search surface (23 Oct 2026): what crawlers are told. Literals are written out here, not imported, so a change
// to the origin or a route list has to be made twice — on purpose.
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { searchDescription } from "@/product";

describe("search surface", () => {
  it("lists only public, indexable pages, all on the www origin", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain("https://www.askradlor.com/");
    expect(urls.every((u) => u.startsWith("https://www.askradlor.com/"))).toBe(true);
    // noindex or signed-in pages must never be advertised
    for (const bad of ["/explore", "/v/", "/ask", "/signin", "/signup", "/account", "/admin"])
      expect(urls.some((u) => u.includes(bad))).toBe(false);
  });

  it("keeps signed-in routes out but lets crawlers read the noindex pages", () => {
    const r = robots();
    const rules = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    const disallow = ([] as string[]).concat(rules.disallow ?? []);
    for (const p of ["/ask", "/account", "/signin", "/admin", "/api/"]) expect(disallow).toContain(p);
    // /explore and /v/ carry noindex in their own <meta>; blocking them here would hide that from Google
    expect(disallow.some((p) => "/explore".startsWith(p) || "/v/x".startsWith(p))).toBe(false);
    expect(r.sitemap).toBe("https://www.askradlor.com/sitemap.xml");
  });

  it("leads with the price, and its first sentence fits a search result", () => {
    const d = searchDescription(20, true);
    expect(d.startsWith("Your first 20 videos are free, then around 20¢ a video.")).toBe(true);
    expect(d.split(". ")[0].length).toBeLessThan(155);
  });
});
