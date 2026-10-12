import "server-only";
// Server-side Supabase clients (PLAN.md §9.2). Never import this from a client component.
import { createServerClient } from "@supabase/ssr";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// §14 names first; the older local names are accepted until .env.local is regenerated.
export const SUPABASE_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (typeof window !== "undefined") throw new Error("lib/supabase/server imported in the browser");

/** The signed-in user's client, on the request's cookies. Access decisions use `auth.getUser()`, never getSession(). */
export async function createClient() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // A Server Component cannot set cookies; proxy.ts refreshes the session instead.
        }
      },
    },
  });
}

/** Service-role client: DEFINER functions and the Auth admin API only. */
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY is not set");
  return createPlainClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
