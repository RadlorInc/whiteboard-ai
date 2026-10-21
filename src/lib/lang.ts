import "server-only";
// The viewer's language on the server: the wb_lang cookie (Settings), else detected from the request (lib/i18n.ts).
import { cookies, headers } from "next/headers";
import { detectLang, LANG_COOKIE, tFor, type Lang, type T } from "./i18n";

export async function getLang(): Promise<Lang> {
  return detectLang(await headers(), (await cookies()).get(LANG_COOKIE)?.value);
}
export async function getT(): Promise<T> {
  return tFor(await getLang());
}
