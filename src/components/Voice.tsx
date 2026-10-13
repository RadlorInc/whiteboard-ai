"use client";
// The narration voice in the UI: the first-visit load as a real progress bar, and the voice picker on /settings.
import { useEffect, useState } from "react";
import { VOICES, playSound, setVoice, speakLine, startVoice, stopSound, tapForSound, useSoundBlocked, useVoiceChoice, useVoiceStatus } from "@/lib/voice";

const MB = (b: number) => Math.round(b / 1e6);

// Shown while the voice loads (the first time: a ~166 MB download and its check, then the model starting up),
// and once if this device cannot run it. Nothing once it is ready.
export function VoiceProgress() {
  const s = useVoiceStatus();
  if (s.state === "failed") return (
    <p className="muted small" role="status">
      This device can&apos;t run the narration voice, so videos use your browser&apos;s voice.
      {s.why && <span style={{ display: "block", opacity: 0.7 }}>Reason: {s.why}</span>}
    </p>
  );
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
  const blocked = useSoundBlocked();
  useEffect(() => { startVoice(); return () => stopSound(); }, []);
  if (status.state === "off") return <p className="muted small">Videos use your browser&apos;s voice.</p>;
  if (status.state === "failed") return null;          // VoiceProgress says why

  // Played through the page's one audio element, started by this tap (lib/voice.ts): an iPhone refused a new Audio
  // started after the line was made. If it is refused anyway, the next tap on the button plays it.
  const hear = async () => {
    if (blocked) { tapForSound(); return; }
    const v = VOICES.find((x) => x.id === voice)!;
    setHearing(true);
    const wav = await speakLine(sample(v.name), v.id);
    setHearing(false);
    if (wav) playSound(wav);
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
        {hearing ? "…" : blocked ? "🔊 Tap to hear" : "▶ Hear"}
      </button>
    </div>
  );
}
