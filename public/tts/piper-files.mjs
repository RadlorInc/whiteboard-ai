// What the Dutch voice worker (piper-worker.js) loads, and the Dutch voices users can pick. Shared by piper-worker.js,
// src/lib/voice.ts and tests/voice/piper-files.test.ts. No imports: plain data.

// Piper (VITS, MIT) voices from rhasspy/piper-voices, pinned to one commit, each file to its size and SHA-256 (Hugging
// Face's LFS record; the .onnx.json configs hashed by us), 21 Oct 2026. Both voices are CC0 (their MODEL_CARDs: the
// OHF-Voice voice-datasets recordings). Founder's pick: Dutch for the Netherlands launch.
const AT = "https://huggingface.co/rhasspy/piper-voices/resolve/5041a7a49ae5b3a0f30e6837769eb03fdbb231bd/nl/nl_NL/";
const file = (path, bytes, sha256) => ({ name: path.split("/").pop(), url: AT + path, bytes, sha256 });
export const PIPER_VOICES = [
  { id: "pim", name: "Pim", source: "Piper nl_NL pim (CC0)",
    model: file("pim/medium/nl_NL-pim-medium.onnx", 63516050, "403e58c3675c394f505c2428117bf34cc56e9542dcf6eadbdd3a84706c12e048"),
    config: file("pim/medium/nl_NL-pim-medium.onnx.json", 5037, "08b58456ca00cf77123826b1712758f99d5fd19ddfb7ec7da8e1a715b047f642") },
  { id: "ronnie", name: "Ronnie", source: "Piper nl_NL ronnie (CC0)",
    model: file("ronnie/medium/nl_NL-ronnie-medium.onnx", 62950044, "ac9aba346d2088ed1ddea646a843ef97dc8e1514cc75e969c90a0c843bb5cbf5"),
    config: file("ronnie/medium/nl_NL-ronnie-medium.onnx.json", 5040, "4329a4deb198d119b7f7364173e388afb8efec9eca10e849f9394aa1a92bb7bc") },
];
export const DEFAULT_PIPER_VOICE = "pim";

// The phonemizer (espeak-ng in WebAssembly, the build @mintplex-labs/piper-tts-web 1.0.5 uses), from our own origin
// (public/tts/vendor, scripts/vendor-tts.mjs). The .data file is espeak-ng's dictionaries; also kept after a download.
export const PHONEMIZE_FILES = [
  { name: "piper_phonemize.wasm", url: "/tts/vendor/piper_phonemize.wasm", bytes: 635212, sha256: "b777cd107a91d2bcc6a1ea46f2c26a662a7407394fe84589198aeaa83dd7a9d6" },
  { name: "piper_phonemize.data", url: "/tts/vendor/piper_phonemize.data", bytes: 18077249, sha256: "29f1025eb23a5b5c192cd14a6efbce4509402ff265405072ee6f7d1a09b78f8c" },
];
// Everything one voice needs, and how many bytes the first time (the bar).
export const filesFor = (voice) => [voice.model, voice.config, ...PHONEMIZE_FILES];
export const bytesFor = (voice) => filesFor(voice).reduce((n, f) => n + f.bytes, 0);
