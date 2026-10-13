import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Copied from the prototype as-is; M4 rewrites it into the players (player-src/README.md).
    "player-src/**",
    // Third-party voice runtime, copied in by scripts/vendor-tts.mjs (pinned and hash-checked), minified.
    "public/tts/vendor/**",
    "public/voice-lab/vendor/**", "public/voice-lab/sentencepiece.js", "public/voice-lab/pocket-worker.js",   // third-party, copied as is
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
