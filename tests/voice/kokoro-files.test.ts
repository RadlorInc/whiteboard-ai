// What the voice worker may fetch (public/tts/kokoro-files.mjs). Expected values are written out by hand: the pinned
// commit and hashes were read from Hugging Face's API on 13 Oct 2026, the voice list is the founder's pick (the 16
// kokoro-js grades A to C-).
import { describe, expect, it } from "vitest";
import { pinned, VOICES, DEFAULT_VOICE } from "../../public/tts/kokoro-files.mjs";

const BASE = "https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/";
const AT = BASE + "1939ad2a8e416c0acfeecc08a694d14ef25f2231/";

describe("pinned: every Hugging Face request is moved to one commit, or refused", () => {
  it("moves the model from main to the pinned commit, with its size and hash", () => {
    expect(pinned(BASE + "main/onnx/model.onnx")).toEqual({
      url: AT + "onnx/model.onnx", path: "onnx/model.onnx", bytes: 325532232,
      sha256: "8fbea51ea711f2af382e88c833d9e288c6dc82ce5e98421ea61c058ce21a34cb",
    });
  });
  it("moves an offered voice, with its hash, and drops a query string", () => {
    expect(pinned(BASE + "main/voices/bf_emma.bin?download=true")).toEqual({
      url: AT + "voices/bf_emma.bin", path: "voices/bf_emma.bin", bytes: 522240,
      sha256: "669fe0647f9dd04fcab92f1439a40eeb4c8b4ab1f82e4996fe3d918ce4a63b73",
    });
  });
  it("lets the small config files through at the pinned commit, without a hash", () => {
    expect(pinned(BASE + "main/tokenizer.json")).toEqual({ url: AT + "tokenizer.json", path: "tokenizer.json" });
  });
  it("refuses a voice we do not offer, another model file, and another repository", () => {
    expect(pinned(BASE + "main/voices/am_adam.bin")).toBeNull();                 // graded F+: left out
    expect(pinned(BASE + "main/onnx/model_quantized.onnx")).toBeNull();
    expect(pinned("https://huggingface.co/someone/else/resolve/main/onnx/model.onnx")).toBeNull();
  });
});

describe("VOICES", () => {
  it("offers the founder's 16, best first, each pinned to a SHA-256", () => {
    expect(VOICES.map((v: { id: string }) => v.id)).toEqual([
      "af_heart", "af_bella", "af_nicole", "bf_emma", "af_aoede", "af_kore", "af_sarah", "am_fenrir",
      "am_michael", "am_puck", "af_alloy", "af_nova", "bf_isabella", "bm_george", "bm_fable", "af_sky",
    ]);
    for (const v of VOICES) expect(v.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(DEFAULT_VOICE).toBe("af_heart");
  });
});
