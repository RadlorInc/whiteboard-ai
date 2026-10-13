// The request gate (Next 16 "proxy", PLAN.md §9.3): a fresh nonce CSP and the security headers on every page, and
// the Supabase session refresh (Server Components cannot write cookies). Access decisions are made in the pages with
// auth.getUser(), never here.
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function csp(nonce: string, dev: boolean) {
  const sb = new URL(SUPABASE_URL);
  const ws = `${sb.protocol === "https:" ? "wss:" : "ws:"}//${sb.host}`;
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `media-src 'self' blob: ${sb.origin}`,
    `connect-src 'self' ${sb.origin} ${ws}`,
    "worker-src 'self'",                 // the voice worker, /tts/kokoro-worker.mjs (it fetches the model, not the page)
    "frame-src 'self' https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self' https://checkout.stripe.com https://billing.stripe.com",
    "frame-ancestors 'none'",
    ...(sb.protocol === "https:" ? ["upgrade-insecure-requests"] : []), // off on a local http stack, even under next start
  ].join("; ");
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const policy = csp(nonce, process.env.NODE_ENV === "development");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list, cacheHeaders) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request: { headers: requestHeaders } });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
        for (const [k, v] of Object.entries(cacheHeaders)) response.headers.set(k, v);
      },
    },
  });
  await supabase.auth.getUser(); // refreshes an expired access token; the result is not trusted here

  const h = response.headers;
  h.set("Content-Security-Policy", policy);
  h.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  h.set("Referrer-Policy", "strict-origin-when-cross-origin");
  h.set("X-Content-Type-Options", "nosniff");
  h.set("X-Frame-Options", "DENY");
  h.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()");
  h.set("Cross-Origin-Opener-Policy", "same-origin");
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|player|tts|voice-lab|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
