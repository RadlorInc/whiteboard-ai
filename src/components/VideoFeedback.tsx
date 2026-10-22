"use client";
// Feedback on one of your own videos (founder, 22 Oct 2026: collect it for every video). A thumb saves at once, so a
// single tap is enough; a thumbs-down then asks why, optionally. One row per video (submit_feedback upserts), read
// back on load so the choice shows again. The table, the function and its checks have existed since §11.10.
// It sits inside a row of video actions, beside Share and Open (founder, 22 Oct 2026): the thumbs are two more
// buttons in that row, and the thumbs-down form wraps onto a line of its own below it.
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "./Toast";
import { Icon } from "./Icon";

const REASONS = [
  ["wrong", "Something's wrong"],
  ["unclear", "Hard to follow"],
  ["looks_broken", "Drawing looks broken"],
  ["didnt_play", "Didn't play or no sound"],
  ["other", "Something else"],
] as const;
type Reason = (typeof REASONS)[number][0];

export function VideoFeedback({ id, big = false }: { id: string; big?: boolean }) {
  const [rating, setRating] = useState<1 | -1 | null>(null);
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    createClient().from("video_feedback").select("rating, reasons, note").eq("generation_id", id).maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setRating(data.rating as 1 | -1);
        setReasons((data.reasons ?? []) as Reason[]);
        setNote(data.note ?? "");
      });
  }, [id]);

  async function save(r: 1 | -1, why: Reason[], text: string) {
    setBusy(true);
    const { data, error } = await createClient().rpc("submit_feedback", {
      p_generation_id: id, p_rating: r, p_reasons: why, p_note: text.trim() || null,
    });
    setBusy(false);
    if (error || data !== true) { toast("Couldn't save that. Try again."); return false; }
    return true;
  }

  async function thumb(r: 1 | -1) {
    setRating(r);
    const why = r === 1 ? [] : reasons, text = r === 1 ? "" : note;
    if (r === 1) { setReasons([]); setNote(""); setOpen(false); }
    if (await save(r, why, text)) {
      if (r === 1) toast("Thanks! Glad it helped.");
      else setOpen(true);
    }
  }

  async function send() {
    if (await save(-1, reasons, note)) { setOpen(false); toast("Thanks. We'll look at this video."); }
  }

  const cls = `btn ${big ? "secondary" : "ghost sm"} thumb`;
  return (
    <>
      <span className="feedback" role="group" aria-label="Was this video helpful?">
        <button type="button" className={cls} aria-pressed={rating === 1} aria-label="Helpful" title="Helpful" disabled={busy}
          onClick={() => thumb(1)}><Icon name="thumbUp" size={16} /></button>
        <button type="button" className={cls} aria-pressed={rating === -1} aria-label="Not helpful" title="Not helpful" disabled={busy}
          onClick={() => thumb(-1)}><Icon name="thumbDown" size={16} /></button>
      </span>
      {open && (
        <form className="feedback-why stack" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <p className="muted small">What went wrong? (optional)</p>
          <div className="chips" role="group" aria-label="What went wrong">
            {REASONS.map(([key, label]) => {
              const on = reasons.includes(key);
              return (
                <button key={key} type="button" className={`chip${on ? " on" : ""}`} aria-pressed={on}
                  onClick={() => setReasons(on ? reasons.filter((x) => x !== key) : [...reasons, key])}>{label}</button>
              );
            })}
          </div>
          <label className="field">
            <span className="muted small">Anything to add?</span>
            <textarea rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Which step, what you expected…" />
          </label>
          <div className="row" style={{ gap: 8 }}>
            <button type="submit" className="btn sm" disabled={busy}>Send</button>
            <button type="button" className="btn ghost sm" onClick={() => setOpen(false)}>Skip</button>
          </div>
        </form>
      )}
    </>
  );
}
