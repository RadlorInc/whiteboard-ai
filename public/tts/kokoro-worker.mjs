// The Kokoro voice, made in the viewer's browser on the graphics chip (WebGPU), off the page's main thread: making
// a line on the page itself held back the audio's `ended` event and left 2–3 s holes (prototype, 12 Oct 2026).
// Messages in:  {warm: true}            -> load (first time: download 325 MB, hash-check, keep) -> {warm:'ok'|'error'}
//               {id, text, voice}       -> {id, wav, secs, ms, bad} or {id, error}
// Messages out while loading: {download, total} (bytes of the model), {stage: 'check' | 'prepare'}.
// kokoro.web.js and ONNX Runtime come from our own origin (scripts/vendor-tts.mjs, pinned and hash-checked).
import { KokoroTTS, env } from './vendor/kokoro.web.js';
import { pinned, MODEL, VOICES, DEFAULT_VOICE } from './kokoro-files.mjs';

env.wasmPaths = new URL('./vendor/', import.meta.url).href;
// transformers.js inside kokoro.web.js also copies every file into Cache Storage, which only failed for the model
// ("Quota exceeded", 13 Oct). Our files already live in OPFS (below), so it gets an empty cache that keeps nothing.
// (Removing `caches` instead makes it throw "Browser cache is not available".)
const none = { match: async () => undefined, put: async () => {} };
Object.defineProperty(self, 'caches', { value: { open: async () => none } });

const hex = async buf => [...new Uint8Array(await crypto.subtle.digest('SHA-256', buf))].map(b => b.toString(16).padStart(2, '0')).join('');

// Every Hugging Face request goes through here: moved to the pinned commit, refused if it is not a known file, and
// the large files served from the browser's file storage (OPFS) — Cache Storage refused the 325 MB model in the
// prototype, so transformers.js's own cache cannot keep it.
const realFetch = self.fetch.bind(self);
self.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input.url;
  if (!url.startsWith('https://huggingface.co/')) return realFetch(input, init);
  const f = pinned(url);
  if (!f) throw new Error(`not a pinned voice file: ${url}`);
  if (!f.sha256) return realFetch(f.url, init);
  const file = await kept(f);
  if (f.path === MODEL.path) self.postMessage({ stage: 'prepare' });
  return new Response(file, { headers: { 'content-length': String(f.bytes), 'content-type': 'application/octet-stream' } });
};

// A file is kept under its hash, and only after the hash matched: what is stored is always right. The download is
// written straight into "<name>.part" as it arrives (a sync access handle commits each write), so a reload or a new
// page carries on from where it stopped with an HTTP Range request instead of starting the 325 MB again (it did, 13
// Oct: every video opened from the library restarted it, so none of them ever played).
async function kept(f) {
  const dir = await navigator.storage.getDirectory(), name = `kokoro-${f.sha256}`, big = f.path === MODEL.path;
  try { const file = await (await dir.getFileHandle(name)).getFile(); if (file.size === f.bytes) return file; } catch {}
  let part = null, sync = null, have = 0, chunks = [];
  try {
    part = await dir.getFileHandle(name + '.part', { create: true });
    sync = await part.createSyncAccessHandle();                   // one writer: another tab gets the in-memory way
    have = sync.getSize();
    if (have > f.bytes) { sync.truncate(0); have = 0; }
  } catch { sync?.close(); part = sync = null; have = 0; }
  try {
    if (have < f.bytes) {
      const res = await realFetch(f.url, have ? { headers: { Range: `bytes=${have}-` } } : undefined);
      if (!res.ok) throw new Error(`${f.path}: HTTP ${res.status}`);
      if (have && res.status !== 206) { sync.truncate(0); have = 0; }   // the server sent it all: start the file again
      const reader = res.body.getReader();
      for (;;) {
        const { done, value } = await reader.read(); if (done) break;
        if (have + value.length > f.bytes) throw new Error(`${f.path}: longer than ${f.bytes} bytes`);
        if (sync) sync.write(value, { at: have }); else chunks.push(value);   // no OPFS: keep it in memory this once
        have += value.length;
        if (big) self.postMessage({ download: have, total: f.bytes });
      }
      if (have !== f.bytes) throw new Error(`${f.path}: ${have} bytes, expected ${f.bytes}`);
    }
  } finally { sync?.flush(); sync?.close(); }
  const blob = part ? await part.getFile() : new Blob(chunks);
  if (big) self.postMessage({ stage: 'check' });
  const hash = await hex(await blob.arrayBuffer());
  if (hash !== f.sha256) {
    if (part) await dir.removeEntry(name + '.part').catch(() => {});  // a bad piece: the next try starts clean
    throw new Error(`${f.path}: hash ${hash.slice(0, 12)}… is not ${f.sha256.slice(0, 12)}…`);
  }
  if (part) try { await part.move(name); return await (await dir.getFileHandle(name)).getFile(); } catch {}
  return blob;
}

// Stored voice files that nothing pinned names (an older model, the earlier Kitten voice) go; a pinned file's .part
// stays, so its download can carry on.
async function sweep() {
  const keep = new Set([MODEL.sha256, ...VOICES.map(v => v.sha256)].flatMap(s => [`kokoro-${s}`, `kokoro-${s}.part`]));
  const dir = await navigator.storage.getDirectory();
  for await (const n of dir.keys()) if (/^(kokoro|kitten)-/.test(n) && !keep.has(n)) await dir.removeEntry(n).catch(() => {});
}

let loading = null;
const load = () => loading ||= (async () => {
  const adapter = navigator.gpu && await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error('no WebGPU on this device');
  await sweep().catch(() => {});
  return KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'fp32', device: 'webgpu' });
})().catch(e => { loading = null; throw e; });

async function make(text, voice) {
  const tts = await load(), t = performance.now();
  const a = await tts.generate(text, { voice: VOICES.some(v => v.id === voice) ? voice : DEFAULT_VOICE });
  let bad = 0; for (const x of a.audio) if (!Number.isFinite(x)) bad++;
  const wav = await a.toBlob().arrayBuffer();
  return { wav, secs: a.audio.length / a.sampling_rate, ms: performance.now() - t, bad };
}

// One line at a time, in the order asked.
let chain = Promise.resolve();
self.onmessage = ({ data }) => {
  if (data.warm) {
    chain = chain.then(load)
      .then(() => self.postMessage({ warm: 'ok' }), e => self.postMessage({ warm: 'error', error: String(e?.message || e) }));
    return;
  }
  const { id, text, voice } = data;
  chain = chain.then(() => make(text, voice))
    .then(r => self.postMessage({ id, ...r }, [r.wav]), e => self.postMessage({ id, error: String(e?.message || e) }));
};
