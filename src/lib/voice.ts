// The narration voice (founder's pick for every device, 13 Oct 2026): Pocket TTS, made in the viewer's browser on the
// CPU — no server, no per-video cost. One worker per tab (public/tts/pocket-worker.js) loads the model once: the first
// time it downloads ~166 MB (pinned, hash-checked) and keeps it in the browser. startVoice() begins that as soon as a
// signed-in page opens; speakLine() gives a line's WAV in the viewer's chosen voice, or null when it cannot (a failed
// download, an old browser): the player then says the line with the browser's own voice.
// NEXT_PUBLIC_VOICE=browser turns it off (the e2e suite does, so CI never downloads the model).
import { useSyncExternalStore } from "react";
import { DEFAULT_VOICE, VOICES } from "../../public/tts/pocket-files.mjs";

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

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((f) => f());
const subscribe = (f: () => void) => { listeners.add(f); return () => { listeners.delete(f); }; };

let status: VoiceStatus = { state: "off", stage: null, loaded: 0, total: 0 };
const set = (s: Partial<VoiceStatus>) => { status = { ...status, ...s }; emit(); };

let worker: Worker | null = null;
let ready: Promise<boolean> | null = null;
let nextId = 0;
const waiting = new Map<number, (wav: ArrayBuffer | null) => void>();

export function startVoice(): Promise<boolean> {
  if (ready) return ready;
  if (!voiceOn()) return (ready = Promise.resolve(false));
  set({ state: "loading", stage: null });
  ready = new Promise<boolean>((resolve) => {
    const fail = (why: string) => {
      console.warn("Narration voice off, the browser voice speaks instead:", why);
      set({ state: "failed", stage: null, why: why.slice(0, 160) }); resolve(false);
      waiting.forEach((w) => w(null)); waiting.clear();
    };
    try { worker = new Worker("/tts/pocket-worker.js", { type: "module" }); }
    catch (e) { fail(String(e)); return; }
    worker.onerror = (e) => fail(e.message || "the worker did not start");
    worker.onmessage = ({ data }) => {
      if ("download" in data) { set({ stage: "download", loaded: data.download, total: data.total }); return; }
      if ("stage" in data) { set({ stage: data.stage }); return; }
      if (data.warm) { if (data.warm === "ok") { set({ state: "ready", stage: null }); resolve(true); } else fail(data.error); return; }
      const w = waiting.get(data.id); waiting.delete(data.id);
      if (data.error) console.warn("The narration voice could not make a line:", data.error);
      w?.(data.error ? null : data.wav);
    };
    worker.postMessage({ warm: true });
  });
  return ready;
}

// The viewer's voice, remembered on this device (localStorage can be missing in private mode: then the default).
const KEY = "wb.voice";
export function getVoice(): string {
  try { const v = localStorage.getItem(KEY); if (v && VOICES.some((x) => x.id === v)) return v; } catch {}
  return DEFAULT_VOICE;
}
export function setVoice(id: string) {
  try { localStorage.setItem(KEY, id); } catch {}
  emit();
}
export function useVoiceChoice(): string {
  return useSyncExternalStore(subscribe, getVoice, () => DEFAULT_VOICE);
}

// A line made once (in one voice) is kept for the life of the tab: a Replay remounts the player and gets it at once.
// Failures are not kept. ponytail: unbounded, ~250 KB a line; bound it if one tab plays hundreds of videos.
const made = new Map<string, Promise<ArrayBuffer | null>>();
export function speakLine(text: string, voice = getVoice()): Promise<ArrayBuffer | null> {
  const key = `${voice}\n${text}`, hit = made.get(key);
  if (hit) return hit;
  const p = (async () => {
    if (!(await startVoice()) || !worker) return null;
    const w = worker;
    return new Promise<ArrayBuffer | null>((resolve) => { const id = nextId++; waiting.set(id, resolve); w.postMessage({ id, text, voice }); });
  })();
  made.set(key, p);
  p.then((wav) => { if (!wav) made.delete(key); });
  return p;
}

export function useVoiceStatus(): VoiceStatus {
  return useSyncExternalStore(subscribe, () => status, () => status);
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

/** Plays one line's WAV; resolves when it ends (true) or cannot play (false). Refused for want of a tap: waits. */
export function playSound(wav: ArrayBuffer): Promise<boolean> {
  stopSound();
  el ||= new Audio();
  const a = el, url = URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
  return new Promise<boolean>((resolve) => {
    const me = {
      finish: (played: boolean) => {
        if (current !== me) return;
        current = null; a.onended = a.onerror = null; URL.revokeObjectURL(url); setBlocked(false); resolve(played);
      },
    };
    current = me;
    a.onended = () => me.finish(true);
    a.onerror = () => me.finish(false);
    a.src = url;
    a.play().then(() => { unlocked = true; }, (e: DOMException) => {
      if (e?.name === "NotAllowedError") setBlocked(true); else me.finish(false);
    });
  });
}

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
