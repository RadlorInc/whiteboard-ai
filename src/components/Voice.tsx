"use client";
// The narration voice in the UI: the first-visit load as a real progress bar, and the voice picker on /ask.
import { useEffect, useRef, useState } from "react";
import { VOICES, setVoice, speakLine, startVoice, useVoiceChoice, useVoiceStatus } from "@/lib/voice";

const MB = (b: number) => Math.round(b / 1e6);

// Shown while the voice loads (the first time: a ~166 MB download and its check, then the model starting up),
// and once if this device cannot run it. Nothing once it is ready.
export function VoiceProgress() {
  const s = useVoiceStatus();
  if (s.state === "failed") return <p className="muted small" role="status">This device can&apos;t run the narration voice, so videos use your browser&apos;s voice.</p>;
  if (s.state !== "loading") return null;
  const label = s.stage === "download" ? `Downloading the voice — ${MB(s.loaded)} of ${MB(s.total)} MB (first time only)`
    : s.stage === "check" ? "Checking the download…"
    : s.stage === "prepare" ? "Getting the voice ready…"
    : "Loading the voice…";
  return (
    <div className="stack" style={{ gap: 4 }} role="status">
      <span className="muted small">{label}</span>
      <progress style={{ width: "100%" }} aria-label="Voice loading" {...(s.stage === "download" ? { value: s.loaded, max: s.total } : {})} />
    </div>
  );
}

const sample = (name: string) => `Hi, I'm ${name}. This is how I'll explain your question.`;

export function VoicePicker() {
  const voice = useVoiceChoice();
  const status = useVoiceStatus();
  const [hearing, setHearing] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  useEffect(() => { startVoice(); return () => audio.current?.pause(); }, []);
  if (status.state === "failed" || status.state === "off") return null;

  const hear = async () => {
    const v = VOICES.find((x) => x.id === voice)!;
    setHearing(true);
    const wav = await speakLine(sample(v.name), v.id);
    setHearing(false);
    if (!wav) return;
    audio.current?.pause();
    audio.current = new Audio(URL.createObjectURL(new Blob([wav], { type: "audio/wav" })));
    audio.current.play().catch(() => {});
  };

  return (
    <div className="row" style={{ alignItems: "end", gap: 8 }}>
      <label className="stack" style={{ gap: 4, flex: 1 }}>
        <span className="small">Voice</span>
        <select value={voice} onChange={(e) => setVoice(e.target.value)}>
          {VOICES.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </label>
      <button type="button" className="btn secondary" onClick={hear} disabled={hearing || status.state !== "ready"}>
        {hearing ? "…" : "▶ Hear"}
      </button>
    </div>
  );
}
