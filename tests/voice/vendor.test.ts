// The committed voice runtime (public/tts/vendor) is exactly the pinned files: the hashes are written here by hand
// (ONNX Runtime checked equal to the npm registry's files via jsDelivr, sentencepiece.js to KevinAHM's Space at
// d0c0c79, 13 Oct 2026), not read from scripts/vendor-tts.mjs. Production once served 404s for these because a build
// step that made them never ran; now they are in git and checked here.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dir = new URL("../../public/tts/vendor/", import.meta.url);
const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");
const PINNED: [string, string][] = [
  ["ort.wasm.min.mjs", "dd1777fa47e810e1778ae99d69901495fc471d6997294a7aa36d589c1188cfd9"],
  ["ort-wasm-simd-threaded.mjs", "b58de73c7b47b86290578489c6b5b16ade5d237cd5f340f0776a219bb833bd04"],
  ["ort-wasm-simd-threaded.wasm", "704f51767fe3e11443aac6b5509c8654688e4cea3d988f96a069390b6eccbabc"],
  ["sentencepiece.js", "fc802c6945931e685d82d0f601cda185bb43990870d712119caf5ea74e6e9c56"],
];

describe("public/tts/vendor", () => {
  it.each(PINNED)("%s is the pinned file", (n, want) => {
    expect(sha(readFileSync(new URL(n, dir)))).toBe(want);
  });
  it("holds nothing else", () => {
    expect(readdirSync(dir).sort()).toEqual(PINNED.map(([n]) => n).sort());
  });
});
