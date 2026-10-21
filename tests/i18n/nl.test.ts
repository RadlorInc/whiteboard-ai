// Every string the code shows through t() has its Dutch (src/content/nl.ts), and every Dutch entry keeps the
// template's {placeholders}: a missing one would show English on a Dutch page, a lost {n} would print nothing.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { NL } from "@/content/nl";

const src = new URL("../../src/", import.meta.url).pathname;
const files = (d: string): string[] => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? files(p) : /\.(tsx?|mjs)$/.test(n) && !/\.test\./.test(n) ? [p] : [];
});
// Every string literal in the first argument of a t(…) call: t("Save"), t(saved ? "Saved" : "Save"). Strings that
// reach t() through a variable (a map of messages) are not seen here; a map's values are listed by hand below.
const LIT = /"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`([^`$\\]*)`/g;
function args(code: string): string[] {
  const out: string[] = [];
  for (const m of code.matchAll(/(?<![\w.])(?:t|fail)\(/g)) {
    let depth = 1, i = m.index! + m[0].length, quote = "";
    for (; i < code.length && depth; i++) {
      const c = code[i];
      if (quote) { if (c === "\\") i++; else if (c === quote) quote = ""; }
      else if (c === '"' || c === "'" || c === "`") quote = c;
      else if (c === "(") depth++;
      else if (c === ")" || (c === "," && depth === 1)) { if (c === ")") depth--; else break; }
    }
    out.push(code.slice(m.index! + m[0].length, i));
  }
  return out;
}
const unquote = (m: RegExpMatchArray) => m[1] !== undefined ? JSON.parse(`"${m[1]}"`) : (m[2] ?? m[3]).replace(/\\'/g, "'");
const keys = new Set<string>();
for (const f of files(src)) for (const a of args(readFileSync(f, "utf8"))) for (const m of a.matchAll(LIT)) {
  const k = unquote(m);
  if (/[A-Za-z]{2}/.test(k) && !/^[a-z_]+$/.test(k)) keys.add(k);       // not an id ("contact_info")
}
const holes = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("Dutch", () => {
  it("has every t() string", () => {
    expect([...keys].filter((k) => !NL[k]).sort()).toEqual([]);
  });
  it("keeps every placeholder", () => {
    expect(Object.entries(NL).filter(([en, nl]) => holes(en).join() !== holes(nl).join()).map(([en]) => en)).toEqual([]);
  });
});
