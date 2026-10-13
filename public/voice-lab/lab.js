// Voice lab (13 Oct 2026): runs each candidate voice engine on this device and shows what it measured. Nothing is
// sent anywhere; the founder screenshots the page. A crash (iOS kills a tab that uses too much memory, and Safari
// reloads it) is caught by a mark left in localStorage before each heavy step and cleared after it.
import { VOICES as KOKORO_VOICES } from '../tts/kokoro-files.mjs';

const $ = (s, el = document) => el.querySelector(s);
const MARK = 'voicelab.running';
const POCKET_VOICES = ['alba', 'azelma', 'cosette', 'eponine', 'fantine', 'javert', 'jean', 'marius'];   // bundle.json, d0c0c79

const store = {
  get: () => { try { return localStorage.getItem(MARK); } catch { return null; } },
  set: v => { try { v ? localStorage.setItem(MARK, v) : localStorage.removeItem(MARK); } catch {} },
};
const died = store.get();
if (died) { $('#crash').hidden = false; $('#crash').textContent = `Last time the page closed during: ${died}. If you did not close or reload it, the phone most likely ran out of memory.`; store.set(null); }

const ua = navigator.userAgent;
$('#device').textContent = [
  /iPhone|iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'iPhone/iPad' : /Android/.test(ua) ? 'Android' : 'computer',
  `${navigator.hardwareConcurrency || '?'} cores`,
  navigator.gpu ? 'WebGPU yes' : 'WebGPU no',
].join(' · ');

let ctx = null;                                   // one AudioContext, made inside a tap (iOS plays nothing otherwise)
const audio = () => { ctx ||= new (window.AudioContext || window.webkitAudioContext)(); ctx.resume(); return ctx; };
let source = null;
const play = buf => { source?.stop(); source = ctx.createBufferSource(); source.buffer = buf; source.connect(ctx.destination); source.start(); };

const s = n => `${(n / 1000).toFixed(1)} s`;
function card(engine, voices, run) {
  const el = $(`[data-engine="${engine}"]`), sel = $('.voice', el), go = $('.go', el), playBtn = $('.play', el);
  for (const v of voices) sel.add(new Option(v.label, v.id));
  const status = t => { $('.status', el).textContent = t; };
  const rows = [];
  const show = (k, v) => {                       // text only: an error message never becomes markup
    rows.push([k, v]);
    $('.m', el).replaceChildren(...rows.map(([a, b]) => { const tr = document.createElement('tr'); for (const t of [a, b]) tr.insertCell().textContent = t; return tr; }));
  };
  let buf = null;
  playBtn.onclick = () => { audio(); if (buf) play(buf); };
  go.onclick = async () => {
    audio(); go.disabled = true; rows.length = 0; show('started', new Date().toLocaleTimeString());
    try {
      buf = await run({ text: $('#text').value.trim(), voice: sel.value, status, show, mark: step => store.set(step ? `${engine}: ${step}` : null) });
      playBtn.disabled = false; play(buf); status('Done. Tap ▶ to hear it again, or change the voice and tap Load + speak.');
    } catch (e) { status(`Failed: ${e.message || e}`); show('error', String(e.message || e).slice(0, 80)); store.set(null); }
    go.disabled = false; go.textContent = 'Speak again';
  };
}

// ── A. Pocket TTS ──────────────────────────────────────────────────────────────────────────────────────────────
let pocket = null, pocketReady = null;
card('pocket', POCKET_VOICES.map(v => ({ id: v, label: v[0].toUpperCase() + v.slice(1) })), async ({ text, voice, status, show, mark }) => {
  if (!pocketReady) {
    pocket = new Worker('pocket-worker.js', { type: 'module' });
    const t = performance.now();
    mark('loading the model');
    pocketReady = new Promise((ok, fail) => {
      pocket.onerror = e => fail(new Error(e.message || 'the worker did not start'));
      pocket.onmessage = ({ data }) => {
        if (data.type === 'status') status(data.status);
        if (data.type === 'error') fail(new Error(data.error));
        if (data.type === 'loaded') ok();
      };
      pocket.postMessage({ type: 'load' });
    }).then(() => show('download + load', s(performance.now() - t)), e => { pocketReady = null; throw e; });
  }
  await pocketReady;
  mark('making the line');
  const t = performance.now(), parts = []; let first = 0;
  await new Promise((ok, fail) => {
    pocket.onmessage = ({ data }) => {
      if (data.type === 'status') status(data.status);
      if (data.type === 'error') fail(new Error(data.error));
      if (data.type === 'audio_chunk') { if (!first) first = performance.now() - t; parts.push(data.data); }
      if (data.type === 'stream_ended') ok();
    };
    pocket.postMessage({ type: 'generate', data: { text, voice } });
  });
  mark(null);
  const n = parts.reduce((a, p) => a + p.length, 0), all = new Float32Array(n);
  let at = 0; for (const p of parts) { all.set(p, at); at += p.length; }
  const ms = performance.now() - t, secs = n / 24000;
  show('first sound after', s(first));
  show(`made ${secs.toFixed(1)} s of speech in`, s(ms));
  show('speed', `${(secs * 1000 / ms).toFixed(1)}× real time`);
  const b = ctx.createBuffer(1, n, 24000); b.copyToChannel(all, 0); return b;
});

// ── B. Kokoro q8 on the CPU ────────────────────────────────────────────────────────────────────────────────────
let kokoro = null, kokoroReady = null;
card('kokoro', KOKORO_VOICES.map(v => ({ id: v.id, label: `${v.name} — ${v.accent}, ${v.gender}` })), async ({ text, voice, status, show, mark }) => {
  if (!kokoroReady) {
    kokoro = new Worker('kokoro-q8-worker.mjs', { type: 'module' });
    const t = performance.now();
    mark('loading the model');
    status('Downloading the model…');
    kokoroReady = new Promise((ok, fail) => {
      kokoro.onerror = e => fail(new Error(e.message || 'the worker did not start'));
      kokoro.onmessage = ({ data }) => {
        if ('progress' in data) status(`Downloading the model… ${Math.round(data.progress)}%`);
        if (data.error) fail(new Error(data.error));
        if ('loaded' in data) ok();
      };
      kokoro.postMessage({ warm: true });
    }).then(() => show('download + load', s(performance.now() - t)), e => { kokoroReady = null; throw e; });
  }
  await kokoroReady;
  mark('making the line');
  status('Making the line…');
  const r = await new Promise((ok, fail) => {
    kokoro.onmessage = ({ data }) => data.error ? fail(new Error(data.error)) : ok(data);
    kokoro.postMessage({ text, voice });
  });
  mark(null);
  show(`made ${r.secs.toFixed(1)} s of speech in`, s(r.ms));
  show('speed', `${(r.secs * 1000 / r.ms).toFixed(1)}× real time`);
  if (r.bad) show('broken samples', r.bad);
  return ctx.decodeAudioData(r.wav);
});

// #auto=pocket or #auto=kokoro starts that engine on load (for checking a browser without tapping; no sound then).
const auto = /^#auto=(pocket|kokoro)$/.exec(location.hash);
if (auto) $(`[data-engine="${auto[1]}"] .go`).click();
