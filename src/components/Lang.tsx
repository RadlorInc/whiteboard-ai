"use client";
// The viewer's language for client components: the root layout reads it on the server and provides it here.
import { createContext, useContext, useMemo } from "react";
import { tFor, type Lang, type T } from "@/lib/i18n";

const Ctx = createContext<Lang>("en");

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <Ctx.Provider value={lang}>{children}</Ctx.Provider>;
}
export const useLang = () => useContext(Ctx);
export function useT(): T {
  const lang = useLang();
  return useMemo(() => tFor(lang), [lang]);
}
