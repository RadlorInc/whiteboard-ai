// The Dutch narration voice (founder, 21 Oct 2026: launch in the Netherlands): Piper, made in the viewer's browser on
// the CPU, off the page's main thread — like the English one (pocket-worker.js, which speaks no Dutch). Text goes to
// phonemes with espeak-ng (vendor/piper_phonemize.*, WebAssembly), the phonemes to sound with the voice's VITS model
// (ONNX Runtime, the same vendored copy the English voice uses). The steps follow @mintplex-labs/piper-tts-web 1.0.5
// (MIT), which the voice lab page used (prototype/dutch-voices.html).
//
// Messages in:  {warm: true, voice}  -> load (first time: download ~82 MB, hash-check, keep) -> {warm:'ok'|'error'}
//               {id, text, voice}    -> {id, wav, secs, ms} or {id, error};  {cancel: id} drops a line not yet made
// Messages out while loading: {download, total} (bytes), {stage: 'prepare'}.
import { DEFAULT_PIPER_VOICE, PIPER_VOICES, bytesFor, filesFor } from "./piper-files.mjs";
import { keeper } from "./keep.mjs";
import { createPiperPhonemize } from "./vendor/piper-phonemize.mjs";

let ort = null, wasm = null, data = null;
const voices = new Map();            // id -> {session, config}, once loaded
const voiceOf = (id) => PIPER_VOICES.find((v) => v.id === id) ?? PIPER_VOICES.find((v) => v.id === DEFAULT_PIPER_VOICE);

async function loadOrt() {
    if (ort) return;
    const m = await import("./vendor/ort.wasm.min.mjs");
    ort = m.default || m;
    ort.env.wasm.wasmPaths = new URL("./vendor/", import.meta.url).href;
    ort.env.wasm.simd = true;
    ort.env.wasm.numThreads = self.crossOriginIsolated ? Math.min(navigator.hardwareConcurrency || 4, 8) : 1;
}

const loading = new Map();
const load = (id) => {
    const v = voiceOf(id);
    if (!loading.has(v.id)) loading.set(v.id, (async () => {
        const keptOnce = keeper("piper", bytesFor(v));
        const [model, config, w, d] = await Promise.all(filesFor(v).map(keptOnce));   // download + check first
        self.postMessage({ stage: "prepare" });
        await loadOrt();
        wasm ??= await WebAssembly.compile(await w.arrayBuffer());
        data ??= await d.arrayBuffer();
        const session = await ort.InferenceSession.create(new Uint8Array(await model.arrayBuffer()), { executionProviders: ["wasm"] });
        voices.set(v.id, { session, config: JSON.parse(await config.text()) });
        return voices.get(v.id);
    })().catch((e) => { loading.delete(v.id); throw e; }));
    return loading.get(v.id);
};

// espeak-ng's phoneme ids for one piece of text. The module runs its main() once, so each piece gets a fresh one
// (from the compiled wasm and the kept data: nothing is fetched).
const phonemeIds = (text, espeakVoice) => new Promise((resolve, reject) => {
    createPiperPhonemize({
        print: (line) => { try { resolve(JSON.parse(line).phoneme_ids); } catch (e) { reject(e); } },
        printErr: (line) => reject(new Error(line)),
        instantiateWasm: (imports, done) => { WebAssembly.instantiate(wasm, imports).then((i) => done(i), reject); return {}; },
        getPreloadedPackage: () => data.slice(0),
        locateFile: (f) => f,
    }).then((m) => m.callMain(["-l", espeakVoice, "--input", JSON.stringify([{ text }]), "--espeak_data", "/espeak-ng-data"]), reject);
});

// Long text in pieces of at most 400 characters, at sentence ends where it can (the package's limit).
function pieces(text, max = 400) {
    const t = text.trim();
    if (t.length <= max) return t ? [t] : [];
    const out = []; let cur = "";
    for (const s of t.match(/[^.!?…\n]+[.!?…]*\s*/g) ?? [t]) {
        if ((cur + s).length > max && cur.trim()) { out.push(cur.trim()); cur = ""; }
        cur += s;
    }
    if (cur.trim()) out.push(cur.trim());
    return out.flatMap((p) => (p.length <= max ? [p] : p.match(new RegExp(`.{1,${max}}(\\s|$)`, "g")).map((x) => x.trim())));
}

// 16-bit mono WAV at the model's rate.
function wavOf(samples, rate) {
    const b = new ArrayBuffer(44 + samples.length * 2), v = new DataView(b);
    const str = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
    str(0, "RIFF"); v.setUint32(4, 36 + samples.length * 2, true); str(8, "WAVE"); str(12, "fmt ");
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true);
    v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, "data");
    v.setUint32(40, samples.length * 2, true);
    for (let i = 0; i < samples.length; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i] || 0)) * 0x7fff, true);
    return b;
}

async function make(text, id) {
    const { session, config } = await load(id), t = performance.now();
    const { noise_scale, length_scale, noise_w } = config.inference, multi = Object.keys(config.speaker_id_map ?? {}).length > 0;
    const parts = [];
    for (const p of pieces(text)) {
        const ids = await phonemeIds(p, config.espeak.voice);
        const feeds = {
            input: new ort.Tensor("int64", BigInt64Array.from(ids, BigInt), [1, ids.length]),
            input_lengths: new ort.Tensor("int64", BigInt64Array.from([BigInt(ids.length)]), [1]),
            scales: new ort.Tensor("float32", Float32Array.from([noise_scale, length_scale, noise_w]), [3]),
            ...(multi && { sid: new ort.Tensor("int64", BigInt64Array.from([0n]), [1]) }),
        };
        parts.push((await session.run(feeds)).output.data);
    }
    if (!parts.length) throw new Error("no text to speak");
    const n = parts.reduce((a, p) => a + p.length, 0), audio = new Float32Array(n);
    let at = 0;
    for (const p of parts) { audio.set(p, at); at += p.length; }
    const rate = config.audio.sample_rate;
    return { wav: wavOf(audio, rate), secs: n / rate, ms: performance.now() - t };
}

// One thing at a time, in the order asked; {cancel: id} skips a line not started yet (a model run is not stoppable).
let chain = Promise.resolve();
const dropped = new Set();
self.onmessage = ({ data: m }) => {
    if (m.cancel !== undefined) { dropped.add(m.cancel); return; }
    if (m.warm) {
        chain = chain.then(() => load(m.voice))
            .then(() => self.postMessage({ warm: "ok" }), (e) => self.postMessage({ warm: "error", error: String(e?.message || e) }));
        return;
    }
    const { id, text, voice } = m;
    chain = chain.then(() => { if (dropped.delete(id)) throw new Error("cancelled"); return make(text, voice); })
        .then((r) => self.postMessage({ id, ...r }, [r.wav]), (e) => self.postMessage({ id, error: String(e?.message || e) }));
};
