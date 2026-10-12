// Writes the voice's browser runtime into public/tts/vendor/, which is committed: viewers load it from our own
// origin, never a CDN. Run it (`npm run vendor:tts`) only to change a version, then commit the files; the deploy does
// not run it (it was a prebuild step, and production served 404s for all three: Vercel's build never ran it, 13 Oct
// 2026). tests/voice/vendor.test.ts checks the committed files against the hashes below. The hashes were checked
// equal to the npm registry's own tarballs (13 Oct 2026). Not an npm dependency on purpose: kokoro-js pulls
// @huggingface/transformers, which brings server-side sharp and onnxruntime-node (both with open advisories) that the
// app never runs.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public/tts/vendor");
const FILES = [
  ["kokoro-js@1.2.1/dist/kokoro.web.js", "6067712fe4c43cdb36c762f860a5ab8d96ea1d9c8882466438eb9f3d0d20be8f"],
  // the ONNX Runtime build kokoro.web.js was made with (it bundles transformers.js 3.5.1)
  ["@huggingface/transformers@3.5.1/dist/ort-wasm-simd-threaded.jsep.mjs", "08fb86ec433c78bfb032c5d84a68b8e8e5a8d81268fa39e24314179a5767a5b9"],
  ["@huggingface/transformers@3.5.1/dist/ort-wasm-simd-threaded.jsep.wasm", "c46655e8a94afc45338d4cb2b840475f88e5012d524509916e505079c00bfa39"],
];
const sha = (b) => createHash("sha256").update(b).digest("hex");

mkdirSync(out, { recursive: true });
for (const [path, want] of FILES) {
  const file = join(out, path.split("/").pop());
  if (existsSync(file) && sha(readFileSync(file)) === want) continue;
  const res = await fetch(`https://cdn.jsdelivr.net/npm/${path}`);
  if (!res.ok) throw new Error(`vendor-tts: ${path}: HTTP ${res.status}`);
  const bytes = Buffer.from(await res.arrayBuffer()), got = sha(bytes);
  if (got !== want) throw new Error(`vendor-tts: ${path}: SHA-256 ${got}, expected ${want}`);
  writeFileSync(file, bytes);
}
console.log(`vendor-tts: ${FILES.length} files in public/tts/vendor/, hashes checked`);
