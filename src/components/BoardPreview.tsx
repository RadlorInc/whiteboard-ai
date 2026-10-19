"use client";
// A still of a video's finished board, for Explore cards: the sandboxed player in poster mode (silent, every step
// drawn at once), faded in when drawn. Paper and match-cut videos (old) get the mark instead.
// ponytail: one lazy iframe per visible card; at scale, store a PNG per video when it is made and show that.
import { useEffect, useRef, useState } from "react";

export function BoardPreview({ style, script, label }: { style: string; script: unknown; label: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [shown, setShown] = useState(false);
  const board = style === "whiteboard" && !!script;
  useEffect(() => {
    if (!board) return;
    let sent = false;
    const on = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow || !e.data) return;
      if (e.data.type === "ready" && !sent) { sent = true; frame.current?.contentWindow?.postMessage({ type: "poster", script }, "*"); }
      if (e.data.type === "posterDone") setShown(true);
    };
    addEventListener("message", on);
    frame.current?.contentWindow?.postMessage({ type: "hello" }, "*");   // it may have loaded before this listener
    return () => removeEventListener("message", on);
  }, [board, script]);
  return (
    <div className={`preview${shown ? " shown" : ""}`} role="img" aria-label={label}>
      {board ? (
        <iframe ref={frame} src="/player/index.html" sandbox="allow-scripts" loading="lazy" tabIndex={-1} aria-hidden="true" title="Preview" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/logo.png" alt="" width={72} height={50} />
      )}
    </div>
  );
}
