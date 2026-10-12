// The committed voice runtime (public/tts/vendor) is exactly the pinned files: the hashes are written here by hand
// (checked equal to the npm registry tarballs, 13 Oct 2026), not read from scripts/vendor-tts.mjs. Production once
// served 404s for these because a build step that made them never ran; now they are in git and checked here.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const file = (n: string) => readFileSync(new URL(`../../public/tts/vendor/${n}`, import.meta.url));
const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");

describe("public/tts/vendor", () => {
  it.each([
    ["kokoro.web.js", "6067712fe4c43cdb36c762f860a5ab8d96ea1d9c8882466438eb9f3d0d20be8f"],
    ["ort-wasm-simd-threaded.jsep.mjs", "08fb86ec433c78bfb032c5d84a68b8e8e5a8d81268fa39e24314179a5767a5b9"],
    ["ort-wasm-simd-threaded.jsep.wasm", "c46655e8a94afc45338d4cb2b840475f88e5012d524509916e505079c00bfa39"],
  ])("%s is the pinned file", (n, want) => {
    expect(sha(file(n))).toBe(want);
  });
});
