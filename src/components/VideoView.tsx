"use client";
// A finished video: replay (free), share link, delete (§5.9, §5.10).
import { useState, useTransition } from "react";
import { Player, type Style } from "./Watch";
import { deleteVideo, shareVideo, unshareVideo } from "@/app/videos/actions";

export function VideoView({ id, style, script, slug: initial }: { id: string; style: Style; script: Record<string, unknown>; slug: string | null }) {
  const [n, setN] = useState(0);
  const [slug, setSlug] = useState(initial);
  const [note, setNote] = useState<string | null>(null);
  const [busy, start] = useTransition();
  const url = slug && typeof window !== "undefined" ? `${window.location.origin}/v/${slug}` : null;
  return (
    <section className="stack">
      <Player key={n} style={style} script={script} />
      <div className="row">
        <button className="btn" type="button" onClick={() => setN(n + 1)}>Replay</button>
        {slug ? (
          <>
            <button className="btn secondary" type="button" onClick={() => { navigator.clipboard?.writeText(url!); setNote("Link copied."); }}>Copy share link</button>
            <button className="btn secondary" type="button" disabled={busy} onClick={() => start(async () => { await unshareVideo(id); setSlug(null); setNote("The link no longer works."); })}>Stop sharing</button>
          </>
        ) : (
          <button className="btn secondary" type="button" disabled={busy} onClick={() => start(async () => {
            const r = await shareVideo(id);
            if (r.slug) { setSlug(r.slug); setNote("Anyone with the link can watch this video. They can't see who made it."); }
            else setNote(r.error === "contact_info" ? "This question has contact details in it, so it can't be shared." : "Couldn't make a link. Try again.");
          })}>Share</button>
        )}
        <button className="btn secondary" type="button" disabled={busy} onClick={() => {
          if (window.confirm("Delete this video? This can't be undone. Credits aren't returned.")) start(() => deleteVideo(id));
        }}>Delete</button>
      </div>
      {url && <p className="muted" style={{ wordBreak: "break-all" }}>{url}</p>}
      {note && <p role="status">{note}</p>}
    </section>
  );
}
