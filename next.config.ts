import type { NextConfig } from "next";

// The players (public/player, PLAN.md §7.8) are prototype pages with inline scripts. They skip the app's nonce CSP
// (proxy.ts) and get their own: no network at all, framed only by our own pages, and loaded in a sandboxed iframe.
// A sandboxed iframe has an opaque origin, so 'self' matches nothing inside it: name our origin instead.
const ORIGIN = new URL(process.env.APP_URL || "http://localhost:3100").origin;
const PLAYER_CSP = [
  "sandbox allow-scripts",            // opaque origin even when opened directly in a tab: no cookies, no same-origin access
  "default-src 'none'",
  `script-src ${ORIGIN} 'unsafe-inline'`,
  `style-src ${ORIGIN} 'unsafe-inline' https://fonts.googleapis.com`,
  "font-src https://fonts.gstatic.com",
  `img-src ${ORIGIN} data:`,
  `media-src ${ORIGIN} blob:`,
  "connect-src 'none'",
  `frame-ancestors ${ORIGIN}`,
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

// The voice worker (public/tts, Pocket TTS) and its runtime also skip the page CSP (a worker takes the CSP its own
// script arrives with). It may run our own scripts and WebAssembly, and fetch only the pinned model files from
// Hugging Face (huggingface.co redirects the download to a *.hf.co CDN host).
// 'unsafe-eval' (security change, 13 Oct 2026): the tokenizer (vendor/sentencepiece.js, emscripten embind) builds
// functions with Function(). It is the worker's CSP only — a worker has no DOM and no document.cookie, and this one
// evaluates no text from users; pages keep their nonce CSP. Drop it if the tokenizer is replaced by one without eval.
const TTS_CSP = [
  "default-src 'none'",
  "script-src 'self' 'wasm-unsafe-eval' 'unsafe-eval'",
  "connect-src 'self' https://huggingface.co https://*.hf.co",
  "base-uri 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: "/player/:path*",
      headers: [
        { key: "Content-Security-Policy", value: PLAYER_CSP },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "no-referrer" },
      ],
    }, {
      source: "/tts/:path*",
      headers: [
        { key: "Content-Security-Policy", value: TTS_CSP },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "no-referrer" },
      ],
    }];
  },
};

export default nextConfig;
