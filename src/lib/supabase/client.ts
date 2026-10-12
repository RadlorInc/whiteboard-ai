"use client";
// Browser Supabase client: sends the email code and starts Google (PKCE), so Supabase's per-IP limits see the user's
// IP, not the server's. The code itself is checked on the server (verifyCode).
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
