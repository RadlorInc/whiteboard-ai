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
      set({ state: "failed", stage: null }); resolve(false);
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
