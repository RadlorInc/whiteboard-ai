// What the Dutch voice worker loads (public/tts/piper-files.mjs). Expected values written out by hand: sizes and
// hashes from Hugging Face's API for rhasspy/piper-voices at 5041a7a (21 Oct 2026; the .onnx.json configs hashed from
// their download), licences from each voice's MODEL_CARD (both CC0).
import { describe, expect, it } from "vitest";
import { DEFAULT_PIPER_VOICE, PHONEMIZE_FILES, PIPER_VOICES, bytesFor } from "../../public/tts/piper-files.mjs";

const AT = "https://huggingface.co/rhasspy/piper-voices/resolve/5041a7a49ae5b3a0f30e6837769eb03fdbb231bd/nl/nl_NL/";

describe("the Dutch voices", () => {
  it("are Pim and Ronnie (CC0), pinned to one commit with their sizes and hashes", () => {
    expect(PIPER_VOICES.map((v) => [v.id, v.model.url, v.model.bytes, v.model.sha256, v.config.url, v.config.sha256])).toEqual([
      ["pim", AT + "pim/medium/nl_NL-pim-medium.onnx", 63516050, "403e58c3675c394f505c2428117bf34cc56e9542dcf6eadbdd3a84706c12e048",
        AT + "pim/medium/nl_NL-pim-medium.onnx.json", "08b58456ca00cf77123826b1712758f99d5fd19ddfb7ec7da8e1a715b047f642"],
      ["ronnie", AT + "ronnie/medium/nl_NL-ronnie-medium.onnx", 62950044, "ac9aba346d2088ed1ddea646a843ef97dc8e1514cc75e969c90a0c843bb5cbf5",
        AT + "ronnie/medium/nl_NL-ronnie-medium.onnx.json", "4329a4deb198d119b7f7364173e388afb8efec9eca10e849f9394aa1a92bb7bc"],
    ]);
    expect(PIPER_VOICES.every((v) => v.source.endsWith("(CC0)"))).toBe(true);
    expect(DEFAULT_PIPER_VOICE).toBe("pim");
  });
  it("come with the phonemizer from our own origin: about 82 MB the first time", () => {
    expect(PHONEMIZE_FILES.every((f) => f.url.startsWith("/tts/vendor/"))).toBe(true);
    expect(bytesFor(PIPER_VOICES[0])).toBe(82233548);
  });
});
