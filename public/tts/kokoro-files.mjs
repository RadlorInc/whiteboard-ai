// What the voice worker may fetch from Hugging Face, and the voices users can pick. Shared by kokoro-worker.mjs,
// src/lib/voice.ts and tests/voice/kokoro-files.test.ts. No imports: plain data and functions.

// Kokoro-82M v1.0 (Apache-2.0), ONNX, fp32 for WebGPU — founder's pick, 13 Oct 2026. Pinned to one commit; every
// large file also to the SHA-256 in Hugging Face's LFS record, so an upstream change can never silently change it.
export const REPO = "https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/";
export const REV = "1939ad2a8e416c0acfeecc08a694d14ef25f2231";
export const MODEL = { path: "onnx/model.onnx", bytes: 325532232, sha256: "8fbea51ea711f2af382e88c833d9e288c6dc82ce5e98421ea61c058ce21a34cb" };
const SMALL = ["config.json", "tokenizer.json", "tokenizer_config.json"];   // a few KB each, fixed by the commit

// The voices offered (founder, 13 Oct: the ~16 graded A to C- by kokoro-js; the D/F ones are left out), best first.
export const VOICES = [
  ["af_heart", "Heart", "US", "female", "d583ccff3cdca2f7fae535cb998ac07e9fcb90f09737b9a41fa2734ec44a8f0b"],
  ["af_bella", "Bella", "US", "female", "f69d836209b78eb8c66e75e3cda491e26ea838a3674257e9d4e5703cbaf55c8b"],
  ["af_nicole", "Nicole", "US", "female", "cd2191ab31b914ed7b318416b0e4440fdf392ddad9106a060819aa600a64f59a"],
  ["bf_emma", "Emma", "UK", "female", "669fe0647f9dd04fcab92f1439a40eeb4c8b4ab1f82e4996fe3d918ce4a63b73"],
  ["af_aoede", "Aoede", "US", "female", "4a004c33430762e2461eedb2013fad808ef4ab3121f5300f554476caf58d8361"],
  ["af_kore", "Kore", "US", "female", "9be5221b6a941c04b561959b8ff0b06e809444dcc4ab7e75a7b23606f691819e"],
  ["af_sarah", "Sarah", "US", "female", "4409fbc125afabacc615d94db5398d847006a737b0247d6892b7a9a0007a2f0a"],
  ["am_fenrir", "Fenrir", "US", "male", "c27989f741f7ee34d273a39d8a595cc0837d35f5ced9a29b7cc162614616df43"],
  ["am_michael", "Michael", "US", "male", "1d1f21dd8da39c30705cd4c75d039d265e9bc4a2a93ed09bc9e1b1225eb95ba1"],
  ["am_puck", "Puck", "US", "male", "fcf73c989033e9233e0b98713eca600c8c74dcc1614b37009d5450ff4a2274a0"],
  ["af_alloy", "Alloy", "US", "female", "c4a6b876047fd7fb472edf4ebd63cfac7c3b958a7cae7c106e8f038ca6308c45"],
  ["af_nova", "Nova", "US", "female", "18778272caa0d0eebaea251c35fd635f038434f9eee5e691d02a174bd328414f"],
  ["bf_isabella", "Isabella", "UK", "female", "3754352c4aaa46d17f27654ab7518d65b62ad6163a0f55a5f4330c2da2c4e94f"],
  ["bm_george", "George", "UK", "male", "c4b235a4c1f2cd3b939fed08b899ce9385638b763f7b73a59616c4fc9bd6c9bc"],
  ["bm_fable", "Fable", "UK", "male", "f889083196807b4adb15e9204252165f503b8d33d3982e681c52443c49d798f1"],
  ["af_sky", "Sky", "US", "female", "4435255c9744f3f31659e0d714ab7689bf65d9e77ec1cce060f083912614f0b9"],
].map(([id, name, accent, gender, sha256]) => ({ id, name, accent, gender, sha256 }));
export const DEFAULT_VOICE = "af_heart";
export const VOICE_BYTES = 522240;

// A request the worker's fetch sees -> where it really goes and what it must be, or null to refuse it.
// Any ref (kokoro-js asks for "main") is replaced by the pinned commit; only the files above may be fetched.
export function pinned(url) {
  if (!url.startsWith(REPO)) return null;
  const path = url.slice(REPO.length).split("?")[0].replace(/^[^/]+\//, "");   // drop the ref
  const to = REPO + REV + "/" + path;
  if (path === MODEL.path) return { url: to, path, bytes: MODEL.bytes, sha256: MODEL.sha256 };
  const v = /^voices\/([a-z]{2}_[a-z]+)\.bin$/.exec(path) && VOICES.find((x) => x.id === path.slice(7, -4));
  if (v) return { url: to, path, bytes: VOICE_BYTES, sha256: v.sha256 };
  if (SMALL.includes(path)) return { url: to, path };
  return null;
}
