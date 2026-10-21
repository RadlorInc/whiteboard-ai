// The app's languages (founder, 21 Oct 2026: launch in the Netherlands, in Dutch). Every UI string is written in
// English in the code and wrapped in t(); the Dutch for it lives in src/content/nl.ts, keyed by that English. A
// string with no Dutch entry shows in English, so a missed one is visible, never broken.
// Plain data and functions: used by server and client code alike.
import { NL } from "@/content/nl";

export const LANGS = ["en", "nl"] as const;
export type Lang = (typeof LANGS)[number];
export const isLang = (s: unknown): s is Lang => LANGS.includes(s as Lang);
export const LANG_COOKIE = "wb_lang";
// For dates and numbers (Intl).
export const LOCALE: Record<Lang, string> = { en: "en-US", nl: "nl-NL" };

export type Vars = Record<string, string | number>;
export type T = (s: string, vars?: Vars) => string;
// "Step {i} of {n}": the {names} are filled in after the lookup, so the key stays the English template.
export const translate = (lang: Lang, s: string, vars?: Vars): string => {
  const out = (lang === "nl" && NL[s]) || s;
  return vars ? out.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : out;
};
export const tFor = (lang: Lang): T => (s, vars) => translate(lang, s, vars);

// No cookie: Dutch for visitors from the Netherlands or Belgium (Vercel's country header) or whose browser asks for
// Dutch first; English otherwise.
export function detectLang(h: { get(name: string): string | null }, cookie?: string): Lang {
  if (isLang(cookie)) return cookie;
  const country = h.get("x-vercel-ip-country")?.toUpperCase();
  if (country === "NL" || country === "BE") return "nl";
  const first = h.get("accept-language")?.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("nl") ? "nl" : "en";
}
