"use client";
// Watching a video (PLAN.md §5.6–5.8, §7.3): reads /api/generate's SSE stream and feeds the sandboxed player.
// The same component replays a finished script (library, video page, share page) with no network call.
import { useCallback, useEffect, useRef, useState } from "react";
import { speakLine, startVoice, voiceOn } from "@/lib/voice";
import { VoiceProgress } from "./Voice";
import { setExplore } from "@/app/videos/actions";
import { exploreRefusal } from "./VideoView";

export type Style = "whiteboard" | "paper" | "matchcut";
type Script = Record<string, unknown> & { steps?: { say: string }[]; objects?: { say: string }[] };
// The spoken lines of a paper (steps) or match-cut (objects) script, in the order the player speaks them.
const linesOf = (style: Style, s: Script) => (style === "matchcut" ? s.objects ?? [] : s.steps ?? []).map((x) => x.say);
// A paper or match-cut script goes in whole and starts at once; its lines follow as Kokoro makes them,
// in order, and the player waits for each where it needs it. Returns a stop for an unmounted player.
function sendScript(post: (m: unknown) => void, style: Style, script: Script) {
  if (!voiceOn()) { post({ type: "script", script }); return () => {}; }
  const lines = linesOf(style, script);
  let live = true;
  post({ type: "script", script, voice: lines.length });
  (async () => { for (const [i, say] of lines.entries()) { const wav = await speakLine(say); if (!live) return; post({ type: "wav", i, wav }); } })();
  return () => { live = false; };
}
const PAGE: Record<Style, string> = {
  whiteboard: "/player/index.html",
  paper: "/player/stopmotion-topics.html?mode=paper",
  matchcut: "/player/matchcut.html",
};
const STAGE: Record<string, string> = {
  reading: "Reading your question…", drawings: "Picking drawings…", writing: "Writing the lesson…", fixing: "Fixing a step…",
};
const FAILED: Record<string, string> = {
  insufficient_credits: "You need at least 6 credits to start a video.",
  busy: "A video is already being made. Wait for it to finish.",
  rate_limited: "That's a lot of videos for now. Try again a little later.",
  paused: "Making videos is paused right now. Try again soon.",
  at_capacity: "We're very busy. Try again in a minute.",
  refusal: "This question can't be answered here.",
  check_failed: "The video didn't come out right, so nothing was charged. Try asking again.",
  timeout: "This took too long, so nothing was charged. Try again.",
  provider_error: "Something went wrong on our side. Nothing was charged.",
};
const msg = (code: string) => FAILED[code] ?? "Something went wrong. Nothing was charged.";

export function Player({ style, script, onEnded, bind }: {
  style: Style; script?: Script | null; onEnded?: () => void; bind?: (post: (m: unknown) => void) => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const ready = useRef(false);
  const pending = useRef<unknown[]>([]);
  const post = useCallback((m: unknown) => {
    if (ready.current) frame.current?.contentWindow?.postMessage(m, "*");
    else pending.current.push(m);
  }, []);
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow || !e.data) return;    // only our own iframe
      if (e.data.type === "ready" && !ready.current) { ready.current = true; pending.current.splice(0).forEach(post); }
      if (e.data.type === "ended") onEnded?.();
    };
    addEventListener("message", on);
    // If the iframe loaded before this listener existed, its 'ready' was lost: ask again (it answers 'ready').
    frame.current?.contentWindow?.postMessage({ type: "hello" }, "*");
    return () => removeEventListener("message", on);
  }, [post, onEnded]);
  useEffect(() => { startVoice(); }, []);
  // A finished whiteboard script goes in as a stream, each step with its Kokoro line (made in order, ahead of the
  // board), so a replay sounds like the first watch. Paper and match-cut take the script whole (browser voice).
  useEffect(() => {
    if (!script) return;
    if (style !== "whiteboard") return sendScript(post, style, script);
    let live = true;
    (async () => {
      post({ type: "reset" }); post({ type: "els", els: script.els });
      for (const step of script.steps ?? []) {
        const wav = await speakLine(step.say);
        if (!live) return;
        post({ type: "step", step, wav });
      }
      post({ type: "done" });
    })();
    return () => { live = false; };
  }, [script, post, style]);
  useEffect(() => { bind?.(post); }, [bind, post]);      // the streaming caller sends steps through this
  return (
    <div className="player">
      <iframe ref={frame} src={PAGE[style]} sandbox="allow-scripts" allow="autoplay" title="Video player" loading="eager"
        style={{ width: "100%", aspectRatio: style === "matchcut" ? "960/500" : style === "paper" ? "960/720" : "960/660", border: 0 }} />
    </div>
  );
}

export function Watch({ question, style, explore = false, onDone, onExit }: {
  question: string; style: Style; explore?: boolean; onDone?: (available: number | null) => void; onExit: () => void;
}) {
  const [exploreNote, setExploreNote] = useState<string | null>(null);
  const [stage, setStage] = useState("Starting…");
  const [error, setError] = useState<string | null>(null);
  const [owned, setOwned] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; charged: number } | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const started = useRef(false);
  const requestId = useRef(crypto.randomUUID());

  const postRef = useRef<(m: unknown) => void>(() => {});
  const bind = useCallback((p: (m: unknown) => void) => { postRef.current = p; }, []);

  useEffect(() => { startVoice(); }, []);

  const run = useCallback(async (confirmNew = false) => {
    const post = (m: unknown) => postRef.current(m);
    // Whiteboard messages go to the player in order, a step only once its Kokoro line is made (the board and the
    // voice start together). The stream keeps arriving meanwhile; on a first visit the first step also waits for
    // the model, and the page shows that load.
    let line: Promise<unknown> = Promise.resolve();
    const send = (m: Record<string, unknown>, say?: string) => {
      line = line.then(async () => post(say === undefined ? m : { ...m, wav: await speakLine(say) }));
    };
    const sendWhole = (script: Script) => { sendScript(post, style, script); };
    setError(null); setOwned(null);
    let res: Response;
    try {
      res = await fetch("/api/generate", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, style, client_request_id: requestId.current, confirm_new: confirmNew }),
      });
    } catch { setError("You're offline. Check your connection and try again."); return; }
    if (res.status === 409) { const j = await res.json(); if (j.code === "already_owned") { setOwned(j.id); setStage(""); return; } }
    if (!res.ok || !res.body) { const j = await res.json().catch(() => ({})); setError(msg(j.code ?? "provider_error")); return; }
    post({ type: "reset" });
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let buf = "", finished = false;
    const scriptParts: { els?: Record<string, unknown>; steps: unknown[] } = { steps: [] };
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += value;
      let cut;
      while ((cut = buf.indexOf("\n\n")) >= 0) {
        const block = buf.slice(0, cut); buf = buf.slice(cut + 2);
        const ev = /^event: (.+)$/m.exec(block)?.[1], data = /^data: (.*)$/m.exec(block)?.[1];
        if (!ev || !data) continue;
        const d = JSON.parse(data);
        if (ev === "stage") setStage(STAGE[d.stage] ?? "Working…");
        else if (ev === "els") { scriptParts.els = d.els; if (style === "whiteboard") send({ type: "els", els: d.els }); }
        else if (ev === "els_add") { scriptParts.els = { ...scriptParts.els, ...d.els }; if (style === "whiteboard") send({ type: "els_add", els: d.els }); }
        else if (ev === "step") {
          scriptParts.steps[d.i] = d.step; setSteps(s => { const n = [...s]; n[d.i] = d.step.say; return n; });
          if (style === "whiteboard") send({ type: "step", step: d.step }, d.step.say);
        }
        else if (ev === "script") { sendWhole(d.script); setSteps(d.script.objects.map((o: { say: string }) => o.say)); }
        else if (ev === "done") {
          finished = true; setResult({ id: d.id, charged: d.creditsCharged }); setStage("");
          if (explore) setExplore(d.id, true).then((r) => setExploreNote(r.error ? exploreRefusal(r.error) : "Shown in Explore."));
          if (style === "whiteboard") send({ type: "done" });
          else if (style === "paper") sendWhole({ q: question, ...scriptParts } as Script);
          onDone?.(d.available ?? null);
        }
        else if (ev === "failed") { finished = true; setError(msg(d.code)); onDone?.(d.available ?? null); }
      }
    }
    if (!finished) setError("The connection dropped. If the video finishes it will be in your library, and failed videos are never charged.");
  }, [question, style, explore, onDone]);

  useEffect(() => { if (!started.current) { started.current = true; run(); } }, [run]);

  return (
    <section className="stack" aria-live="polite">
      <p className="muted">{question}</p>
      {!error && !owned && <VoiceProgress />}
      <Player style={style} bind={bind} />
      {stage && !error && !owned && <p role="status">{stage}</p>}
      {error && <p role="alert" className="error">{error}</p>}
      {owned && (
        <div className="stack">
          <p>You already have a video for this question.</p>
          <div className="row">
            <a className="btn" href={`/videos/${owned}`}>Watch it (free)</a>
            <button className="btn secondary" type="button" onClick={() => run(true)}>Make a new one (uses credits)</button>
          </div>
        </div>
      )}
      {exploreNote && <p className="muted small" role="status">{exploreNote}</p>}
      {result && <p className="muted">Done. {result.charged} credit{result.charged === 1 ? "" : "s"} used. <a href={`/videos/${result.id}`}>Open this video</a></p>}
      {steps.length > 0 && (
        <details><summary>Transcript</summary><ol>{steps.map((s, i) => <li key={i}>{s}</li>)}</ol></details>
      )}
      <button className="btn secondary" type="button" onClick={onExit}>Ask another question</button>
    </section>
  );
}
