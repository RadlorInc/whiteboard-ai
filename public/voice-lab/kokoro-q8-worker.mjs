// Voice lab only (13 Oct 2026): Kokoro-82M q8 (92 MB) on the CPU (WebAssembly), to see whether a phone can run it.
// Same kokoro.web.js as the live voice (/tts/vendor), same pinned Hugging Face commit; transformers.js keeps the
// files in Cache Storage itself (92 MB, unlike the 325 MB fp32 model the live worker keeps in OPFS).
// In: {warm: true} -> {loaded: ms} | {error}. {text, voice} -> {wav, secs, ms, bad} | {error}.
import './streams.mjs';
import { KokoroTTS, env } from '../tts/vendor/kokoro.web.js';

env.wasmPaths = new URL('../tts/vendor/', import.meta.url).href;
const REV = '1939ad2a8e416c0acfeecc08a694d14ef25f2231';
const realFetch = self.fetch.bind(self);
self.fetch = (input, init) => {
  const url = typeof input === 'string' ? input : input.url;
  return realFetch(url.replace(/(Kokoro-82M-v1\.0-ONNX\/resolve\/)main\//, `$1${REV}/`), init);
};

let tts = null;
self.onmessage = async ({ data }) => {
  try {
    if (data.warm) {
      const t = performance.now();
      tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
        dtype: 'q8', device: 'wasm',
        progress_callback: p => p.status === 'progress' && p.file?.endsWith('.onnx') && self.postMessage({ progress: p.progress }),
      });
      self.postMessage({ loaded: performance.now() - t });
      return;
    }
    const t = performance.now();
    const a = await tts.generate(data.text, { voice: data.voice });
    let bad = 0; for (const x of a.audio) if (!Number.isFinite(x)) bad++;
    const wav = await a.toBlob().arrayBuffer();
    self.postMessage({ wav, secs: a.audio.length / a.sampling_rate, ms: performance.now() - t, bad }, [wav]);
  } catch (e) { self.postMessage({ error: String(e?.message || e) }); }
};
