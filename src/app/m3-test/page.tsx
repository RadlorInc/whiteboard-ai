"use client";
// Phone test of a library model in the real player, with a hand-written answer: no sign-in, no database, no AI.
// Remove before this branch goes to main.
import { useEffect, useRef, useState } from "react";
import answer from "./answer.json";

type Stats = { fps: number; slow: number; pr: number; width: number; buildMs: number };

export default function M3Test() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState("Loading…");
  const [stats, setStats] = useState<Stats | null>(null);
  const [low, setLow] = useState<number | null>(null);
  const [h, setH] = useState(0);

  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow || !e.data) return;
      const m = e.data;
      if (m.type === "ready") { setReady(true); setState((v) => (v === "Loading…" ? "Ready" : v)); }
      if (m.type === "at") setState(m.i >= m.n ? "Finished" : `Step ${m.i + 1} of ${m.n}`);
      if (m.type === "size" && Number.isFinite(m.h)) setH(m.h);
      if (m.type === "error") setState(`Error: ${m.message}`);
      if (m.type === "m3stats") { setStats(m); setLow((l) => (l === null ? m.fps : Math.min(l, m.fps))); }
    };
    addEventListener("message", on);
    const t = setInterval(() => frame.current?.contentWindow?.postMessage({ type: "hello" }, "*"), 500);
    return () => { removeEventListener("message", on); clearInterval(t); };
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 12, color: "#e4e4e7", background: "#18181b", minHeight: "100vh", fontFamily: "system-ui" }}>
      <p style={{ fontWeight: 700 }}>{answer.q}</p>
      <iframe ref={frame} src="/player/index.html" sandbox="allow-scripts" allow="autoplay" title="Video player" style={{ width: "100%", height: h || undefined, aspectRatio: h ? undefined : "16/11", border: 0 }} />
      <button disabled={!ready} style={{ fontSize: 18, padding: "10px 22px", margin: "12px 0", borderRadius: 999 }}
        onClick={() => { setLow(null); frame.current?.contentWindow?.postMessage({ type: "script", script: answer }, "*"); }}>Play</button>
      <p>{state}</p>
      {stats && <p>Speed now: <b>{stats.fps} fps</b> · lowest: <b>{low} fps</b> · slow frames: {stats.slow}% · detail: {stats.pr} · built in {stats.buildMs} ms</p>}
    </main>
  );
}
