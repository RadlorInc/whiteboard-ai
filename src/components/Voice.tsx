"use client";
// The narration voice in the UI: the first-visit load as a real progress bar, and the voice picker on /settings.
// Both follow the page's language: Dutch pages load and pick the Dutch voice (lib/voice.ts).
import { useEffect, useState } from "react";
import { playSound, setVoice, speakLine, startVoice, stopSound, tapForSound, useSoundBlocked, useVoiceChoice, useVoiceStatus, voicesFor } from "@/lib/voice";
import { useLang, useT } from "./Lang";

const MB = (b: number) => Math.round(b / 1e6);

// Shown while the voice loads (the first time: a download of ~166 MB in English, ~82 MB in Dutch, and its check,
// then the model starting up), and once if this device cannot run it. Nothing once it is ready.
export function VoiceProgress() {
  const lang = useLang(), t = useT();
  const s = useVoiceStatus(lang);
  if (s.state === "failed") return (
    <p className="muted small" role="status">
      {t("This device can't run the narration voice, so videos use your browser's voice.")}
      {s.why && <span style={{ display: "block", opacity: 0.7 }}>{t("Reason:")} {s.why}</span>}
    </p>
  );
  if (s.state !== "loading") return null;
  const label = s.stage === "download" ? t("Downloading the voice — {got} of {total} MB (first time only)", { got: MB(s.loaded), total: MB(s.total) })
    : s.stage === "check" ? t("Checking the download…")
    : s.stage === "prepare" ? t("Getting the voice ready…")
    : t("Loading the voice…");
  return (
    <div className="voice-progress" role="status">
      <span>{label}</span>
      <progress aria-label={t("Voice loading")} {...(s.stage === "download" ? { value: s.loaded, max: s.total } : {})} />
    </div>
  );
}

const SAMPLE = "Hi, I'm {name}. This is how I'll explain your question.";

export function VoicePicker() {
  const lang = useLang(), t = useT();
  const voice = useVoiceChoice(lang);
  const status = useVoiceStatus(lang);
  const [hearing, setHearing] = useState(false);
  const blocked = useSoundBlocked();
  useEffect(() => { startVoice(lang); return () => stopSound(); }, [lang, voice]);   // a new Dutch voice loads its model
  if (status.state === "off") return <p className="muted small">{t("Videos use your browser's voice.")}</p>;
  if (status.state === "failed") return null;          // VoiceProgress says why

  // Played through the page's one audio element, started by this tap (lib/voice.ts): an iPhone refused a new Audio
  // started after the line was made. If it is refused anyway, the next tap on the button plays it.
  const voices = voicesFor(lang);
  const hear = async () => {
    if (blocked) { tapForSound(); return; }
    const v = voices.find((x) => x.id === voice)!;
    setHearing(true);
    const wav = await speakLine(t(SAMPLE, { name: v.name }), lang, v.id);
    setHearing(false);
    if (wav) playSound(wav);
  };

  return (
    <div className="row" style={{ alignItems: "end", gap: 8 }}>
      <label className="stack" style={{ gap: 4, flex: 1 }}>
        <span className="small muted">{t("Narrator")}</span>
        <select value={voice} onChange={(e) => setVoice(e.target.value, lang)}>
          {voices.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </label>
      <button type="button" className="btn secondary" onClick={hear} disabled={hearing || status.state !== "ready"}>
        {hearing ? <span className="spinner sm" aria-label={t("Making the sample")} /> : t(blocked ? "Tap to hear" : "Hear it")}
      </button>
    </div>
  );
}
