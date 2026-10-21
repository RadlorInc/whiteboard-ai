// The narration voice (founder's pick for every device, 13 Oct 2026): made in the viewer's browser on the CPU — no
// server, no per-video cost. English: Pocket TTS (public/tts/pocket-worker.js; first time ~166 MB). Dutch (founder,
// 21 Oct 2026, the Netherlands launch; Pocket speaks no Dutch): Piper (public/tts/piper-worker.js; first time ~82 MB).
// One worker per language per tab loads its model once (pinned, hash-checked, kept in the browser). startVoice()
// begins that as soon as a signed-in page opens, in the page's language; speakLine() gives a line's WAV in the
// viewer's chosen voice for the video's language, or null when it cannot (a failed download, an old browser): the
// player then says the line with the browser's own voice.
// NEXT_PUBLIC_VOICE=browser turns it off (the e2e suite does, so CI never downloads a model).
import { useSyncExternalStore } from "react";
import { DEFAULT_VOICE, VOICES } from "../../public/tts/pocket-files.mjs";
import { DEFAULT_PIPER_VOICE, PIPER_VOICES } from "../../public/tts/piper-files.mjs";
import { isLang, type Lang } from "./i18n";

export { VOICES };
export type VoiceStatus = {
  state: "off" | "loading" | "ready" | "failed";
  stage: "download" | "check" | "prepare" | null;   // while loading: bytes arriving, the hash check, the graphics chip
  loaded: number;
  total: number;
  why?: string;     // when failed: the worker's reason, shown small so a screenshot says what happened
};

const ON = process.env.NEXT_PUBLIC_VOICE !== "browser";
export const voiceOn = () => ON && typeof Worker !== "undefined";
// The page's language (the root layout sets <html lang>): the default for everything below.
export const pageLang = (): Lang => {
  const l = typeof document === "undefined" ? "" : document.documentElement.lang;
  return isLang(l) ? l : "en";
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((f) => f());
const subscribe = (f: () => void) => { listeners.add(f); return () => { listeners.delete(f); }; };

type Engine = {
  url: string; key: string; voices: { id: string; name: string }[]; fallback: string;
  status: VoiceStatus; worker: Worker | null; ready: Promise<boolean> | null; warmed: string | null;
  waiting: Map<number, (wav: ArrayBuffer | null) => void>;
};
const engine = (url: string, key: string, voices: { id: string; name: string }[], fallback: string): Engine =>
  ({ url, key, voices, fallback, status: { state: "off", stage: null, loaded: 0, total: 0 }, worker: null, ready: null, warmed: null, waiting: new Map() });
const ENGINES: Record<Lang, Engine> = {
  en: engine("/tts/pocket-worker.js", "wb.voice", VOICES, DEFAULT_VOICE),
  nl: engine("/tts/piper-worker.js", "wb.voice.nl", PIPER_VOICES, DEFAULT_PIPER_VOICE),
};
const set = (e: Engine, s: Partial<VoiceStatus>) => { e.status = { ...e.status, ...s }; emit(); };
let nextId = 0;

// Loads the language's model for the viewer's voice (the Dutch voices are separate models: a new pick loads it).
export function startVoice(lang: Lang = pageLang()): Promise<boolean> {
  const e = ENGINES[lang], voice = getVoice(lang);
  if (e.ready && (e.warmed === voice || e.status.state === "failed")) return e.ready;
  if (!voiceOn()) return (e.ready = Promise.resolve(false));
  e.warmed = voice;
  set(e, { state: "loading", stage: null, loaded: 0, total: 0 });
  e.ready = new Promise<boolean>((resolve) => {
    const off = (why: string) => {
      console.warn("Narration voice off, the browser voice speaks instead:", why);
      set(e, { state: "failed", stage: null, why: why.slice(0, 160) }); resolve(false);
      e.waiting.forEach((w) => w(null)); e.waiting.clear();
    };
    if (!e.worker) {
      try { e.worker = new Worker(e.url, { type: "module" }); }
      catch (err) { off(String(err)); return; }
      e.worker.onerror = (ev) => off(ev.message || "the worker did not start");
    }
    e.worker.onmessage = ({ data }) => {
      if ("download" in data) { set(e, { stage: "download", loaded: data.download, total: data.total }); return; }
      if ("stage" in data) { set(e, { stage: data.stage }); return; }
      if (data.warm) { if (data.warm === "ok") { set(e, { state: "ready", stage: null }); resolve(true); } else off(data.error); return; }
      const w = e.waiting.get(data.id); e.waiting.delete(data.id);
      if (data.error && data.error !== "cancelled") console.warn("The narration voice could not make a line:", data.error);
      w?.(data.error ? null : data.wav);
    };
    e.worker.postMessage({ warm: true, voice });
  });
  return e.ready;
}

// The viewer's voice for a language, remembered on this device (localStorage can be missing in private mode: then
// the default).
export function getVoice(lang: Lang = pageLang()): string {
  const e = ENGINES[lang];
  try { const v = localStorage.getItem(e.key); if (v && e.voices.some((x) => x.id === v)) return v; } catch {}
  return e.fallback;
}
export function setVoice(id: string, lang: Lang = pageLang()) {
  try { localStorage.setItem(ENGINES[lang].key, id); } catch {}
  emit();
}
export const voicesFor = (lang: Lang) => ENGINES[lang].voices;
export function useVoiceChoice(lang: Lang = pageLang()): string {
  return useSyncExternalStore(subscribe, () => getVoice(lang), () => ENGINES[lang].fallback);
}

// A line made once (in one voice) is kept for the life of the tab: a Replay remounts the player and gets it at once.
// Failures are not kept. ponytail: unbounded, ~250 KB a line; bound it if one tab plays hundreds of videos.
const made = new Map<string, Promise<ArrayBuffer | null>>();
const asked = new Map<string, number>();     // a line still being made (or queued): its worker id, for cancelLine
export function speakLine(text: string, lang: Lang = pageLang(), voice = getVoice(lang)): Promise<ArrayBuffer | null> {
  const key = `${voice}\n${text}`, hit = made.get(key);
  if (hit) return hit;
  const e = ENGINES[lang];
  const p = (async () => {
    if (!(await startVoice(lang)) || !e.worker) return null;
    const w = e.worker;
    return new Promise<ArrayBuffer | null>((resolve) => {
      const id = nextId++; asked.set(key, id);
      e.waiting.set(id, (wav) => { asked.delete(key); resolve(wav); });
      w.postMessage({ id, text, voice });
    });
  })();
  made.set(key, p);
  p.then((wav) => { if (!wav) made.delete(key); });
  return p;
}

/** Stop making a line nobody needs now (a jump to another step): it resolves null and is not kept, so asking for it
 *  again makes it afresh. */
export function cancelLine(text: string, lang: Lang = pageLang(), voice = getVoice(lang)) {
  const id = asked.get(`${voice}\n${text}`);
  if (id !== undefined) ENGINES[lang].worker?.postMessage({ cancel: id });
}

export function useVoiceStatus(lang: Lang = pageLang()): VoiceStatus {
  return useSyncExternalStore(subscribe, () => ENGINES[lang].status, () => ENGINES[lang].status);
}

// ── Playing the lines ─────────────────────────────────────────────────────────────────────────────────────────────
// An iPhone plays sound only from an audio element that was first started inside a tap: a line made seconds after
// "Ask" or "▶ Hear" was refused silently (13 Oct 2026, no sound at all on the founder's iPhone). So every line plays
// through one element on this page, started on the first tap (unlockSound, a click listener), and the sandboxed
// player asks this page to play its lines. A line refused anyway (a page opened with no tap yet) waits, and the player
// waits with it, until the viewer taps "Tap for sound" (tapForSound).
let el: HTMLAudioElement | null = null;
let unlocked = false;
let current: { finish: (played: boolean) => void } | null = null;
let blocked = false;
const setBlocked = (b: boolean) => { if (blocked !== b) { blocked = b; emit(); } };

const silence = () => {   // 0.1 s of silent 16-bit mono WAV, as a blob URL
  const n = 2400, b = new ArrayBuffer(44 + n * 2), v = new DataView(b), s = (o: number, t: string) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  s(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); s(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, 1, true); v.setUint32(24, 24000, true); v.setUint32(28, 48000, true); v.setUint16(32, 2, true);
  v.setUint16(34, 16, true); s(36, "data"); v.setUint32(40, n * 2, true);
  return URL.createObjectURL(new Blob([b], { type: "audio/wav" }));
};

export function unlockSound() {
  if (unlocked || typeof Audio === "undefined") return;
  el ||= new Audio();
  if (current) return;                      // a line is waiting on this tap: tapForSound plays it
  el.src = silence();
  el.play().then(() => { unlocked = true; }, () => {});
}
if (typeof document !== "undefined") {
  document.addEventListener("click", unlockSound, true);
  document.addEventListener("keydown", unlockSound, true);
}

/** Plays one line's WAV; resolves when it ends (true) or cannot play (false). Refused for want of a tap: waits.
 *  onStart: the sound has really begun (after a "Tap for sound" too), so the board can draw on the spoken words. */
export function playSound(wav: ArrayBuffer, onStart?: () => void): Promise<boolean> {
  stopSound();
  el ||= new Audio();
  const a = el, url = URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
  return new Promise<boolean>((resolve) => {
    const me = {
      finish: (played: boolean) => {
        if (current !== me) return;
        current = null; a.onended = a.onerror = a.onplaying = null; URL.revokeObjectURL(url); setBlocked(false); resolve(played);
      },
    };
    current = me;
    a.onended = () => me.finish(true);
    a.onerror = () => me.finish(false);
    a.onplaying = () => { a.onplaying = null; onStart?.(); };    // once: a resume after pause fires it again
    a.src = url;
    a.play().then(() => { unlocked = true; }, (e: DOMException) => {
      if (e?.name === "NotAllowedError") setBlocked(true); else me.finish(false);
    });
  });
}

/** The player's pause: hold the line being spoken, and carry on from the same place. */
export function pauseSound() { if (current) el?.pause(); }
export function resumeSound() { if (current) el?.play().catch(() => {}); }

export function stopSound() {
  if (!current) return;
  el?.pause();
  current.finish(false);
}

/** The viewer's tap on "Tap for sound": plays the waiting line inside the tap. */
export function tapForSound() {
  if (!el || !current) return;
  const me = current;
  el.play().then(() => { unlocked = true; setBlocked(false); }, () => me.finish(false));
}

export function useSoundBlocked(): boolean {
  return useSyncExternalStore(subscribe, () => blocked, () => false);
}
