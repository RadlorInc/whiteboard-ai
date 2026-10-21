// Writes the voice's browser runtime into public/tts/vendor/, which is committed: viewers load it from our own
// origin, never a CDN. Run it (`npm run vendor:tts`) only to change a version, then commit the files; the deploy does
// not run it (it was a prebuild step, and production served 404s: Vercel's build never ran it, 13 Oct 2026).
// tests/voice/vendor.test.ts checks the committed files against the hashes below (13 Oct 2026: ONNX Runtime from the
// npm registry via jsDelivr; sentencepiece.js, an emscripten build with browser shims, from KevinAHM's Pocket TTS
// Space at the pinned commit, Apache-2.0 like the Space's code).
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public/tts/vendor");
const NPM = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.0/dist/";
const SPACE = "https://huggingface.co/spaces/KevinAHM/pocket-tts-web/resolve/d0c0c79b7712256a32d691c67f20b8ae2e020d00/";
const PIPER_WASM = "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/";
const PIPER_WEB = "https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.5/dist/";
const FILES = [
  [NPM + "ort.wasm.min.mjs", "dd1777fa47e810e1778ae99d69901495fc471d6997294a7aa36d589c1188cfd9"],
  [NPM + "ort-wasm-simd-threaded.mjs", "b58de73c7b47b86290578489c6b5b16ade5d237cd5f340f0776a219bb833bd04"],
  [NPM + "ort-wasm-simd-threaded.wasm", "704f51767fe3e11443aac6b5509c8654688e4cea3d988f96a069390b6eccbabc"],
  [SPACE + "sentencepiece.js", "fc802c6945931e685d82d0f601cda185bb43990870d712119caf5ea74e6e9c56"],
  // The Dutch voice's phonemizer (piper-worker.js, 21 Oct 2026): espeak-ng in WebAssembly from @diffusionstudio/piper-wasm
  // (MIT; espeak-ng inside is GPL-3.0), and the ES-module loader for it from @mintplex-labs/piper-tts-web (MIT).
  [PIPER_WASM + "piper_phonemize.wasm", "b777cd107a91d2bcc6a1ea46f2c26a662a7407394fe84589198aeaa83dd7a9d6"],
  [PIPER_WASM + "piper_phonemize.data", "29f1025eb23a5b5c192cd14a6efbce4509402ff265405072ee6f7d1a09b78f8c"],
  [PIPER_WEB + "piper-o91UDS6e.js", "b5ac96981729547606fd026b8e3829aad81e9e3c22308869d50473259c563283", "piper-phonemize.mjs"],
];
const sha = (b) => createHash("sha256").update(b).digest("hex");

mkdirSync(out, { recursive: true });
for (const [path, want, as] of FILES) {
  const file = join(out, as ?? path.split("/").pop());
  if (existsSync(file) && sha(readFileSync(file)) === want) continue;
  const res = await fetch(path);
  if (!res.ok) throw new Error(`vendor-tts: ${path}: HTTP ${res.status}`);
  const bytes = Buffer.from(await res.arrayBuffer()), got = sha(bytes);
  if (got !== want) throw new Error(`vendor-tts: ${path}: SHA-256 ${got}, expected ${want}`);
  writeFileSync(file, bytes);
}
console.log(`vendor-tts: ${FILES.length} files in public/tts/vendor/, hashes checked`);
