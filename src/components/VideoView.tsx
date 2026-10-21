"use client";
// A finished video: replay (free), share link, Explore, delete (§5.9, §5.10).
import { useState, useSyncExternalStore, useTransition } from "react";
import { Player, type Style } from "./Watch";
import { VoiceProgress } from "./Voice";
import { Icon } from "./Icon";
import { VideoFeedback } from "./VideoFeedback";
import { deleteVideo, setExplore, shareVideo, unshareVideo } from "@/app/(app)/videos/actions";

export const exploreRefusal = (e?: string) => e === "contact_info" ? "This question has contact details in it, so it can't go on Explore."
  : e === "share_limit" ? "That's a lot of shared videos today. Try again tomorrow." : "Couldn't change Explore. Try again.";

const noop = () => () => {};

export function VideoView({ id, style, script, slug: initial, inExplore: initialExplore }: { id: string; style: Style; script: Record<string, unknown>; slug: string | null; inExplore: boolean }) {
  const [n, setN] = useState(0);
  const [inExplore, setInExplore] = useState(initialExplore);
  const [slug, setSlug] = useState(initial);
  const [note, setNote] = useState<string | null>(null);
  const [busy, start] = useTransition();
  // The origin is only known in the browser: null on the server and while hydrating, so the HTML matches
  // (a mismatch re-renders the page and drops a click made meanwhile, e.g. "Remove from Explore").
  const origin = useSyncExternalStore(noop, () => location.origin, () => null);
  const url = slug && origin ? `${origin}/v/${slug}` : null;
  return (
    <section className="stack">
      <VoiceProgress />
      <Player key={n} style={style} script={script} />
      <div className="toolbar">
        <button className="btn" type="button" onClick={() => setN(n + 1)}><Icon name="replay" size={16} /> Replay</button>
        {slug ? (
          <>
            <button className="btn secondary" type="button" onClick={() => { navigator.clipboard?.writeText(url!); setNote("Link copied."); }}><Icon name="link" size={16} /> Copy share link</button>
            <button className="btn secondary" type="button" disabled={busy} onClick={() => start(async () => { await unshareVideo(id); setSlug(null); setInExplore(false); setNote("The link no longer works. It is off Explore too."); })}>Stop sharing</button>
          </>
        ) : (
          <button className="btn secondary" type="button" disabled={busy} onClick={() => start(async () => {
            const r = await shareVideo(id);
            if (r.slug) { setSlug(r.slug); setNote("Anyone with the link can watch this video. They can't see who made it."); }
            else setNote(r.error === "contact_info" ? "This question has contact details in it, so it can't be shared." : "Couldn't make a link. Try again.");
          })}><Icon name="share" size={16} /> Share</button>
        )}
        <button className="btn secondary" type="button" disabled={busy} onClick={() => start(async () => {
          const r = await setExplore(id, !inExplore);
          if (r.error) { setNote(exploreRefusal(r.error)); return; }
          if (r.slug) setSlug(r.slug);
          setInExplore(!inExplore);
          setNote(inExplore ? "Off Explore. The share link still works." : "On Explore: anyone can watch it there. They can't see who made it.");
        })}><Icon name="compass" size={16} /> {inExplore ? "Remove from Explore" : "Show in Explore"}</button>
        <button className="btn danger" type="button" disabled={busy} onClick={() => {
          if (window.confirm("Delete this video? This can't be undone. Used videos aren't given back.")) start(() => deleteVideo(id));
        }}><Icon name="trash" size={16} /> Delete</button>
      </div>
      {url && <p className="muted share-url">{url}</p>}
      {note && <p role="status" className="muted small">{note}</p>}
      <VideoFeedback id={id} />
    </section>
  );
}
