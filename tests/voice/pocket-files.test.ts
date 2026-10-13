// What the voice worker loads (public/tts/pocket-files.mjs) and what the committed voices file holds. Expected values
// are written out by hand: sizes and hashes from Hugging Face's API for KevinAHM/pocket-tts-web at d0c0c79 (13 Oct
// 2026; bundle.json hashed from its download), the voice list from the licences at huggingface.co/kyutai/tts-voices.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEFAULT_VOICE, FILES, MODEL_FILES, TOTAL_BYTES, VOICES, VOICES_FILE } from "../../public/tts/pocket-files.mjs";

const AT = "https://huggingface.co/spaces/KevinAHM/pocket-tts-web/resolve/d0c0c79b7712256a32d691c67f20b8ae2e020d00/onnx/english_2026-04/";
const COMMERCIAL = ["alba", "azelma", "eponine", "fantine", "javert", "marius"];
const NON_COMMERCIAL = ["cosette", "jean"];   // Expresso and EARS: CC BY-NC 4.0

// The names in a PTVB1 file, read independently of scripts/pocket-voices.mjs.
function voiceNames(b: Buffer): string[] {
  expect(b.toString("latin1", 0, 5)).toBe("PTVB1");
  const names: string[] = [];
  let at = 9;
  for (let v = b.readUInt32LE(5); v > 0; v--) {
    const len = b.readUInt16LE(at); names.push(b.toString("utf8", at + 2, at + 2 + len)); at += 2 + len;
    const tensors = b.readUInt16LE(at); at += 2;
    for (let t = 0; t < tensors; t++) {
      at += 2 + b.readUInt16LE(at);
      const rank = b[at + 1]; at += 2 + 4 * rank;
      at += 4 + b.readUInt32LE(at);
    }
  }
  expect(at).toBe(b.length);
  return names;
}

describe("the model files", () => {
  it("are the pinned ones, each with its size and hash, and no voice-cloning encoder", () => {
    expect(MODEL_FILES).toEqual([
      ["flow_lm_main_int8.onnx", 76341079, "f9bd8106b79a0192c1c43399ab938fb24900a95c1c599870d75a884e99000116"],
      ["mimi_decoder_int8.onnx", 22684077, "3630450a3297a101792a6ac66619ebc70ab916b265e6220c2afaef8b1673f925"],
      ["text_conditioner_int8.onnx", 16388384, "24c0642bff11a4e1435c004d0c2aa6c68e093fadfa35f0f0dba849ac67f25ac3"],
      ["flow_lm_flow_int8.onnx", 9962530, "3dd781ee5abee9e195320bf0106bebd6372a852b3b36352524ee78b40554635d"],
      ["tokenizer.model", 59339, "d461765ae179566678c93091c5fa6f2984c31bbe990bf1aa62d92c64d91bc3f6"],
      ["bundle.json", 24381, "bab643150f437f37df080a710520ff39ed9ebd9a339f8ebdc739f7eddfc28b3f"],
      ["bos_before_voice.npy", 4224, "f46edf4f7007b7ba4ea58831f49d003e59e167b4641c44bb3addfe9231a780b1"],
    ].map(([name, bytes, sha256]) => ({ name, url: AT + name, bytes, sha256 })));
  });
  it("add up to about 166 MB with the voices", () => {
    expect(FILES.length).toBe(8);
    expect(TOTAL_BYTES).toBe(165478167);
  });
});

describe("the voices", () => {
  it("offered are only those whose licence allows commercial use", () => {
    expect(VOICES.map((v) => v.id)).toEqual(COMMERCIAL);
    expect(DEFAULT_VOICE).toBe("alba");
  });

  const file = readFileSync(new URL("../../public/tts/pocket-voices.bin", import.meta.url));
  it("file we serve holds exactly those, never a non-commercial one", () => {
    const names = voiceNames(file);
    expect(names).toEqual(COMMERCIAL);
    for (const n of NON_COMMERCIAL) expect(names).not.toContain(n);
  });
  it("file is the one the worker is pinned to", () => {
    const sha = createHash("sha256").update(file).digest("hex");
    expect(sha).toBe("f269c81f58e0da03608ac97528eb6195c0ed195b66ebf7528954ba266add16de");
    expect(VOICES_FILE).toEqual({ name: "pocket-voices.bin", url: "/tts/pocket-voices.bin", bytes: 40014153, sha256: sha });
    expect(file.length).toBe(40014153);
  });
});
