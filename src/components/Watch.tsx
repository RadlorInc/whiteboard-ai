"use client";
// Watching a video (PLAN.md §5.6–5.8, §7.3): reads /api/generate's SSE stream and feeds the sandboxed player.
// The same component replays a finished script (library, video page, share page) with no network call.
import { useCallback, useEffect, useRef, useState } from "react";
import { pauseSound, playSound, resumeSound, speakLine, startVoice, stopSound, tapForSound, useSoundBlocked, useVoiceStatus, voiceOn } from "@/lib/voice";
import { VoiceProgress } from "./Voice";
import { exploreRefusal } from "./VideoView";
import { Icon } from "./Icon";
import { ShareButton } from "./ShareButton";

export type Style = "whiteboard" | "paper" | "matchcut";
type Script = Record<string, unknown> & { steps?: { say: string }[]; objects?: { say: string }[] };
// The spoken lines of a paper (steps) or match-cut (objects) script, in the order the player speaks them.
const linesOf = (style: Style, s: Script) => (style === "matchcut" ? s.objects ?? [] : s.steps ?? []).map((x) => x.say);
// A paper or match-cut script goes in whole and starts at once; its lines follow as the voice makes them,
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

export function Player({ style, script, onEnded, bind, onStart, cover }: {
  style: Style; script?: Script | null; onEnded?: () => void; bind?: (post: (m: unknown) => void) => void;
  onStart?: () => void; cover?: React.ReactNode;     // cover: shown over the board until the first step plays
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const ready = useRef(false);
  const soundBlocked = useSoundBlocked();
  const pending = useRef<unknown[]>([]);
  const [h, setH] = useState<number | null>(null);    // the player's own content height, once it says
  const [at, setAt] = useState<{ i: number; n: number; done: boolean; paused?: boolean } | null>(null);   // whiteboard: the step playing
  const post = useCallback((m: unknown) => {
    if (ready.current) frame.current?.contentWindow?.postMessage(m, "*");
    else pending.current.push(m);
  }, []);
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow || !e.data) return;    // only our own iframe
      if (e.data.type === "ready" && !ready.current) { ready.current = true; pending.current.splice(0).forEach(post); }
      if (e.data.type === "ended") onEnded?.();
      if (e.data.type === "size" && Number.isFinite(e.data.h) && e.data.h > 50 && e.data.h < 4000) setH(e.data.h);
      if (e.data.type === "at") onStart?.();
      if (e.data.type === "at") setAt({ i: e.data.i, n: e.data.n, done: e.data.done, paused: e.data.paused === true });
      // The player's lines play on this page (an iPhone refuses sound started in the iframe): see lib/voice.ts.
      if (e.data.type === "play" && e.data.wav instanceof ArrayBuffer) {
        const id = e.data.id;
        playSound(e.data.wav).then(() => post({ type: "played", id }));
      }
      if (e.data.type === "hush") stopSound();
      if (e.data.type === "pauseSound") pauseSound();
      if (e.data.type === "resumeSound") resumeSound();
    };
    addEventListener("message", on);
    // If the iframe loaded before this listener existed, its 'ready' was lost: ask again (it answers 'ready').
    frame.current?.contentWindow?.postMessage({ type: "hello" }, "*");
    return () => { removeEventListener("message", on); stopSound(); };
  }, [post, onEnded, onStart]);
  useEffect(() => { startVoice(); }, []);
  // A finished whiteboard script goes in as a stream, each step with its spoken line (made in order, ahead of the
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
      {soundBlocked && (
        <button type="button" className="btn tap-sound" onClick={tapForSound}>
          <Icon name="sound" size={18} /> Tap for sound
        </button>
      )}
      {cover}
      <iframe ref={frame} src={PAGE[style]} sandbox="allow-scripts" allow="autoplay" title="Video player" loading="eager"
        style={h ? { height: h } : { aspectRatio: style === "matchcut" ? "960/500" : style === "paper" ? "960/720" : "960/660" }} />
      {at && at.n > 0 && (
        <div className="player-controls">
          <button type="button" className="icon-btn" aria-label="Previous step" disabled={at.i === 0}
            onClick={() => post({ type: "seek", i: at.i - 1 })}><Icon name="prev" size={16} /></button>
          {at.i < at.n && (
            <button type="button" className="icon-btn" aria-label={at.paused ? "Play" : "Pause"}
              onClick={() => post({ type: at.paused ? "resume" : "pause" })}><Icon name={at.paused ? "play" : "pause"} size={16} /></button>
          )}
          <button type="button" className="icon-btn" aria-label="Next step" disabled={at.i >= at.n - 1}
            onClick={() => post({ type: "seek", i: at.i + 1 })}><Icon name="next" size={16} /></button>
          <input type="range" min={1} max={at.n} value={Math.min(at.i + 1, at.n)} aria-label="Step"
            onChange={(e) => post({ type: "seek", i: Number(e.target.value) - 1 })} />
          <span aria-live="off">
            {at.i >= at.n ? "End" : `Step ${at.i + 1} of ${at.n}${at.done ? "" : "…"}`}
          </span>
        </div>
      )}
    </div>
  );
}

type Making = { at: 0 | 1 | 2 | 3; names?: string[]; fixing?: boolean };

// Over the empty board while a video is made: a spinner, how long it has taken, and the real stages from the
// server's stream (reading → drawings → writing) and then this browser making the first spoken line. Nothing here
// is a guess: each line ticks when its event arrives.
function MakingCover({ making }: { making: Making }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => { const t = setInterval(() => setSecs(s => s + 1), 1000); return () => clearInterval(t); }, []);
  const voice = useVoiceStatus();
  const names = making.names?.filter(Boolean).slice(0, 4).join(", ");
  const voiceLine = voice.state === "loading"
    ? voice.stage === "download" && voice.total ? `Getting the voice ready (${Math.round(voice.loaded / 1e6)} of ${Math.round(voice.total / 1e6)} MB, first time only)` : "Getting the voice ready"
    : "Making the voice";
  const rows = [
    "Reading your question",
    names ? `Choosing drawings: ${names}` : "Choosing drawings",
    making.fixing ? "Writing the lesson (fixing a step)" : "Writing the lesson",
    voiceLine,
  ];
  const pct = Math.round(((making.at + (making.at === 3 && voice.state === "loading" && voice.total ? voice.loaded / voice.total : 0)) / rows.length) * 100);
  return (
    <div className="making" role="status" aria-live="polite">
      <div className="making-box">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={64} height={44} className="making-mark" />
        <div className="making-head">
          <strong>Making your video</strong>
          <span className="making-secs">{secs} s</span>
        </div>
        <div className="bar" role="progressbar" aria-label="Progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <span style={{ width: `${Math.max(pct, 4)}%` }} />
        </div>
        <ol className="making-steps">
          {rows.map((r, i) => (
            <li key={i} className={i < making.at ? "done" : i === making.at ? "now" : ""}>
              <span className="tick" aria-hidden="true">{i < making.at ? <Icon name="check" size={12} /> : i === making.at ? <span className="spinner xs" /> : null}</span>
              {r}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function Watch({ question, style, explore = false, conversationId, onDone, onExit }: {
  question: string; style: Style; explore?: boolean; conversationId?: string;
  onDone?: (available: number | null, id?: string) => void; onExit?: () => void;
}) {
  const [exploreNote, setExploreNote] = useState<string | null>(null);
  const [stage, setStage] = useState("Starting…");
  const [error, setError] = useState<string | null>(null);
  const [owned, setOwned] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; charged: number } | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [making, setMaking] = useState<Making>({ at: 0 });      // what the progress cover shows
  const [playing, setPlaying] = useState(false);                // the first step is on the board: the cover goes
  const onStart = useCallback(() => setPlaying(true), []);
  const started = useRef(false);
  const requestId = useRef(crypto.randomUUID());

  const postRef = useRef<(m: unknown) => void>(() => {});
  const bind = useCallback((p: (m: unknown) => void) => { postRef.current = p; }, []);

  useEffect(() => { startVoice(); }, []);

  const run = useCallback(async (confirmNew = false) => {
    const post = (m: unknown) => postRef.current(m);
    // Whiteboard messages go to the player in order, a step only once its spoken line is made (the board and the
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
        body: JSON.stringify({ question, style, client_request_id: requestId.current, confirm_new: confirmNew, explore,
          ...(conversationId && { conversation_id: conversationId }) }),
      });
    } catch { setError("You're offline. Check your connection and try again."); onDone?.(null); return; }
    if (res.status === 409) { const j = await res.json(); if (j.code === "already_owned") { setOwned(j.id); setStage(""); return; } setError(msg(j.code ?? "provider_error")); onDone?.(null); return; }
    if (!res.ok || !res.body) { const j = await res.json().catch(() => ({})); setError(msg(j.code ?? "provider_error")); onDone?.(null); return; }
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
        if (ev === "stage") {
          setStage(STAGE[d.stage] ?? "Working…");
          setMaking(m => d.stage === "drawings" ? { at: 1, names: d.names } : d.stage === "writing" ? { ...m, at: 2 }
            : d.stage === "fixing" ? { ...m, at: 2, fixing: true } : m);
        }
        else if (ev === "els") { scriptParts.els = d.els; if (style === "whiteboard") send({ type: "els", els: d.els }); }
        else if (ev === "els_add") { scriptParts.els = { ...scriptParts.els, ...d.els }; if (style === "whiteboard") send({ type: "els_add", els: d.els }); }
        else if (ev === "step") {
          if (d.i === 0) setMaking(m => ({ ...m, at: 3 }));
          scriptParts.steps[d.i] = d.step; setSteps(s => { const n = [...s]; n[d.i] = d.step.say; return n; });
          if (style === "whiteboard") send({ type: "step", step: d.step }, d.step.say);
        }
        else if (ev === "script") { setPlaying(true); sendWhole(d.script); setSteps(d.script.objects.map((o: { say: string }) => o.say)); }
        else if (ev === "done") {
          finished = true; setResult({ id: d.id, charged: d.creditsCharged }); setStage("");
          // The server put it on Explore as it saved it (or says why it couldn't).
          if (d.explore) setExploreNote(d.explore === "shown" ? "Shown in Explore." : exploreRefusal(d.explore));
          if (style === "whiteboard") send({ type: "done" });
          else if (style === "paper") setPlaying(true);
          if (style === "paper") sendWhole({ q: question, ...scriptParts } as Script);
          onDone?.(d.available ?? null, d.id);
        }
        else if (ev === "failed") { finished = true; setError(msg(d.code)); onDone?.(d.available ?? null); }
      }
    }
    if (!finished) onDone?.(null);
    if (!finished) setError("The connection dropped. If the video finishes it will be in your library, and failed videos are never charged.");
  }, [question, style, explore, conversationId, onDone]);

  useEffect(() => { if (!started.current) { started.current = true; run(); } }, [run]);

  return (
    <section className="turn" aria-live="polite">
      <p className="chat-q">{question}</p>
      {playing && !error && !owned && <VoiceProgress />}
      <Player style={style} bind={bind} onStart={onStart}
        cover={!playing && !error && !owned ? <MakingCover making={making} /> : null} />
      {playing && stage && !error && !owned && <p role="status" className="answer-meta"><span className="spinner xs" aria-hidden="true" /> {stage}</p>}
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
      {result && (
        <p className="answer-meta">
          <span>Done. {result.charged} credit{result.charged === 1 ? "" : "s"} used.</span>
          <ShareButton id={result.id} title={question} />
          <a href={`/videos/${result.id}`} className="btn ghost sm"><Icon name="external" size={16} /> Open this video</a>
        </p>
      )}
      {exploreNote && <p className="answer-meta" role="status">{exploreNote}</p>}
      {steps.length > 0 && (
        <details className="transcript"><summary>Transcript</summary><ol>{steps.map((s, i) => <li key={i}>{s}</li>)}</ol></details>
      )}
      {onExit && <button className="btn secondary" type="button" onClick={onExit}>Ask another question</button>}
    </section>
  );
}
