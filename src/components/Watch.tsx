"use client";
// Watching a video (PLAN.md §5.6–5.8, §7.3): reads /api/generate's SSE stream and feeds the sandboxed player.
// The same component replays a finished script (library, video page, share page) with no network call.
import { useCallback, useEffect, useRef, useState } from "react";
import { cancelLine, pauseSound, playSound, resumeSound, speakLine, startVoice, stopSound, tapForSound, useSoundBlocked, useVoiceStatus, voiceOn } from "@/lib/voice";
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
  insufficient_credits: "You have no videos left. Get more to keep asking.",
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

type At = { i: number; n: number; done: boolean; paused?: boolean; waiting?: boolean };

// The bar under the board (founder, 18 Oct 2026: jump to any step as soon as the video exists): play/pause (replay at
// the end), previous/next, one segment per step to jump straight to it, where it is, full screen.
function Controls({ at, labels, seek, toggle, full, isFull }: {
  at: At; labels: string[]; seek: (i: number) => void; toggle: () => void; full?: () => void; isFull: boolean;
}) {
  const ended = at.i >= at.n;
  return (
    <div className="player-controls">
      <button type="button" className="pc-btn pc-play" aria-label={ended ? "Replay" : at.paused ? "Play" : "Pause"}
        onClick={ended ? () => seek(0) : toggle}>
        <Icon name={ended ? "replay" : at.paused ? "play" : "pause"} size={ended ? 18 : 16} />
      </button>
      <button type="button" className="pc-btn" aria-label="Previous step" disabled={at.i === 0} onClick={() => seek(at.i - 1)}>
        <Icon name="prev" size={14} />
      </button>
      <button type="button" className="pc-btn" aria-label="Next step" disabled={at.i >= at.n - 1} onClick={() => seek(at.i + 1)}>
        <Icon name="next" size={14} />
      </button>
      <div className="pc-steps" role="group" aria-label="Steps">
        {Array.from({ length: at.n }, (_, k) => (
          <button key={k} type="button" title={labels[k]} onClick={() => seek(k)}
            className={`pc-seg${k < at.i || ended ? " done" : ""}${k === at.i && !ended ? ` now${at.paused ? " held" : ""}${at.waiting ? " wait" : ""}` : ""}`}
            aria-label={`Go to step ${k + 1}${labels[k] ? `: ${labels[k]}` : ""}`} aria-current={k === at.i ? "step" : undefined} />
        ))}
        {!at.done && <i className="pc-seg more" aria-hidden="true" />}
      </div>
      <span className="pc-count" aria-live="off">{ended ? "End" : `Step ${at.i + 1} of ${at.n}${at.done ? "" : "…"}`}</span>
      {full && (
        <button type="button" className="pc-btn" aria-label={isFull ? "Exit full screen" : "Full screen"} onClick={full}>
          <Icon name={isFull ? "shrink" : "expand"} size={16} />
        </button>
      )}
    </div>
  );
}

export function Player({ style, script, onEnded, bind, onStart, cover }: {
  style: Style; script?: Script | null; onEnded?: () => void; bind?: (post: (m: unknown) => void) => void;
  onStart?: () => void; cover?: React.ReactNode;     // cover: shown over the board until the first step plays
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const ready = useRef(false);
  const soundBlocked = useSoundBlocked();
  const pending = useRef<unknown[]>([]);
  const [h, setH] = useState<number | null>(null);    // the player's own content height, once it says
  const [at, setAt] = useState<At | null>(null);       // whiteboard: the step playing
  const [labels, setLabels] = useState<string[]>([]);  // each step's spoken line, for the segments' titles
  const [isFull, setFull] = useState(false);
  const raw = useCallback((m: unknown) => {
    if (ready.current) frame.current?.contentWindow?.postMessage(m, "*");
    else pending.current.push(m);
  }, []);

  // The voice is made behind the board, one line at a time, starting from the step the player is on (or was jumped
  // to: 'need'), so every step can be reached at once and a jump ahead is not stuck behind the lines before it.
  const feed = useRef({ lines: [] as string[], labels: [] as string[], got: new Set<number>(), want: 0, busy: false, alive: true, epoch: 0,
    making: -1, dropped: new Set<number>() });
  const pump = useCallback(async () => {
    const f = feed.current;
    if (f.busy) return;
    f.busy = true;
    const ep = f.epoch;
    try {
      while (f.alive && ep === f.epoch) {
        const n = f.lines.length;
        let i = -1;
        for (let k = 0; k < n; k++) { const j = (f.want + k) % n; if (!f.got.has(j)) { i = j; break; } }
        if (i < 0) break;
        f.got.add(i); f.making = i;
        const wav = await speakLine(f.lines[i]);
        f.making = -1;
        if (!f.alive || ep !== f.epoch) break;
        if (f.dropped.delete(i)) continue;              // given up for a jump (need): made again when its turn comes
        raw({ type: "stepWav", i, wav });
      }
    } finally { if (ep === f.epoch) f.busy = false; }
  }, [raw]);
  // What callers post: steps go in at once; with the app's voice on, the board waits for each line (voice: true).
  const post = useCallback((m: unknown) => {
    const msg = m as { type?: string; step?: { say: string } };
    const f = feed.current;
    if (msg?.type === "reset") { f.epoch++; f.lines = []; f.labels = []; f.got = new Set(); f.want = 0; f.busy = false; }
    if (style === "whiteboard" && msg?.type === "step" && msg.step) {
      f.labels.push(msg.step.say);
      if (voiceOn()) { f.lines.push(msg.step.say); raw({ type: "step", step: msg.step }); pump(); return; }
    }
    if (style === "whiteboard" && msg?.type === "els" && voiceOn()) { raw({ ...(m as object), voice: true }); return; }
    raw(m);
  }, [raw, pump, style]);
  useEffect(() => { const f = feed.current; f.alive = true; return () => { f.alive = false; }; }, []);

  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow || !e.data) return;    // only our own iframe
      if (e.data.type === "ready" && !ready.current) { ready.current = true; pending.current.splice(0).forEach(raw); }
      if (e.data.type === "ended") onEnded?.();
      if (e.data.type === "size" && Number.isFinite(e.data.h) && e.data.h > 50 && e.data.h < 4000) setH(e.data.h);
      if (e.data.type === "need" && Number.isInteger(e.data.i)) {
        // A jump to a step whose line is not being made: drop the line in progress so this one starts at once.
        const f = feed.current;
        f.want = e.data.i;
        if (f.making >= 0 && f.making !== e.data.i && !f.got.has(e.data.i)) {
          const k = f.making; f.dropped.add(k); f.got.delete(k); cancelLine(f.lines[k]);
        }
        pump();
      }
      if (e.data.type === "at") {
        if (!e.data.waiting) onStart?.();
        setAt({ i: e.data.i, n: e.data.n, done: e.data.done, paused: e.data.paused === true, waiting: e.data.waiting === true });
        setLabels(feed.current.labels.slice());
      }
      // The player's lines play on this page (an iPhone refuses sound started in the iframe): see lib/voice.ts.
      if (e.data.type === "play" && e.data.wav instanceof ArrayBuffer) {
        const id = e.data.id;
        playSound(e.data.wav).then(() => raw({ type: "played", id }));
      }
      if (e.data.type === "hush") stopSound();
      if (e.data.type === "pauseSound") pauseSound();
      if (e.data.type === "resumeSound") resumeSound();
    };
    addEventListener("message", on);
    // If the iframe loaded before this listener existed, its 'ready' was lost: ask again (it answers 'ready').
    frame.current?.contentWindow?.postMessage({ type: "hello" }, "*");
    return () => { removeEventListener("message", on); stopSound(); };
  }, [raw, pump, onEnded, onStart]);
  useEffect(() => { startVoice(); }, []);
  // A finished whiteboard script goes in whole: every step at once, so any step can be jumped to; the voice follows.
  // Paper and match-cut take the script whole (their lines follow as WAVs).
  useEffect(() => {
    if (!script) return;
    if (style !== "whiteboard") return sendScript(raw, style, script);
    post({ type: "reset" }); post({ type: "els", els: script.els, drawings: script.drawings });
    for (const step of script.steps ?? []) post({ type: "step", step });
    post({ type: "done" });
  }, [script, post, raw, style]);
  useEffect(() => { bind?.(post); }, [bind, post]);      // the streaming caller sends steps through this
  useEffect(() => {
    const on = () => setFull(document.fullscreenElement === box.current);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);

  const seek = (i: number) => { if (at) { feed.current.want = Math.max(0, i); raw({ type: "seek", i: Math.max(0, Math.min(i, at.n - 1)) }); } };
  const toggle = () => { if (at) raw({ type: at.paused ? "resume" : "pause" }); };
  const canFull = typeof document !== "undefined" && document.fullscreenEnabled;
  return (
    <div className={`player${isFull ? " full" : ""}`} ref={box}
      onKeyDown={(e) => {
        // ← → steps, space / k play-pause (a focused button keeps its own space)
        if (!at || (e.target as HTMLElement).closest("input, textarea, select")) return;
        if (e.key === "ArrowRight") { e.preventDefault(); seek(at.i + 1); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); seek(at.i - 1); }
        else if ((e.key === " " && !(e.target as HTMLElement).closest("button")) || e.key === "k") { e.preventDefault(); toggle(); }
      }}>
      {soundBlocked && (
        <button type="button" className="btn tap-sound" onClick={tapForSound}>
          <Icon name="sound" size={18} /> Tap for sound
        </button>
      )}
      {cover}
      {at?.waiting && !cover && (
        <div className="pc-wait" role="status"><span className="spinner xs" aria-hidden="true" /> Preparing the voice for step {at.i + 1}…</div>
      )}
      <iframe ref={frame} src={PAGE[style]} sandbox="allow-scripts" allow="autoplay" title="Video player" loading="eager"
        style={h && !isFull ? { height: h } : { aspectRatio: style === "matchcut" ? "960/500" : style === "paper" ? "960/720" : "960/660" }} />
      {at && at.n > 0 && (
        <Controls at={at} labels={labels} seek={seek} toggle={toggle} isFull={isFull}
          full={canFull ? () => (isFull ? document.exitFullscreen() : box.current?.requestFullscreen()) : undefined} />
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
    // Whiteboard messages go to the player as they stream in; the Player makes each step's line behind the board, and
    // a step waits for its line (the board and the voice start together). On a first visit the first line also waits
    // for the voice model, and the cover shows that load.
    const send = (m: Record<string, unknown>) => post(m);
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
        else if (ev === "els") { scriptParts.els = d.els; if (style === "whiteboard") send({ type: "els", els: d.els, drawings: d.drawings }); }
        else if (ev === "els_add") { scriptParts.els = { ...scriptParts.els, ...d.els }; if (style === "whiteboard") send({ type: "els_add", els: d.els, drawings: d.drawings }); }
        else if (ev === "step") {
          if (d.i === 0) setMaking(m => ({ ...m, at: 3 }));
          scriptParts.steps[d.i] = d.step; setSteps(s => { const n = [...s]; n[d.i] = d.step.say; return n; });
          if (style === "whiteboard") send({ type: "step", step: d.step });
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
            <button className="btn secondary" type="button" onClick={() => run(true)}>Make a new one (uses 1 video)</button>
          </div>
        </div>
      )}
      {result && (
        <p className="answer-meta">
          <span data-charged={result.charged}>Done.</span>
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
