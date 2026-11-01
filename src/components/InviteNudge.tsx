"use client";
// After a video finishes in the chat (founder, 1 Nov 2026: nobody had used the friend link, it lived only on Account).
// Shows the same friend link as Account, at most once a day, and not for 14 days after "Not now". The dismissal is a
// per-browser convenience (localStorage); the friend bonus itself is counted by the database, not here.
import { useEffect, useState } from "react";
import { FRIEND_BONUS } from "@/lib/videos";
import { FriendLink } from "./FriendLink";

const KEY = "ar_invite_nudge";   // { shown: "YYYY-MM-DD", snoozeUntil: epoch ms }
const DAY = 86400000;

function read(): { shown?: string; snoozeUntil?: number } {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}") ?? {}; } catch { return {}; }
}
function write(v: { shown?: string; snoozeUntil?: number }) {
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* private mode: the card just shows again */ }
}

/** Whether to show the card now: not snoozed, and not already shown today (another day = show again). */
export function shouldNudge(state: { shown?: string; snoozeUntil?: number }, now: number): boolean {
  if (state.snoozeUntil && now < state.snoozeUntil) return false;
  return state.shown !== new Date(now).toISOString().slice(0, 10);
}

export function InviteNudge({ code }: { code: string }) {
  // Only ever rendered in the browser (after a live video in the chat finishes), so reading storage here is safe.
  const [open, setOpen] = useState(() => shouldNudge(read(), Date.now()));
  useEffect(() => { if (open) write({ ...read(), shown: new Date().toISOString().slice(0, 10) }); }, [open]);
  if (!open) return null;
  return (
    <aside className="card stack invite-nudge" aria-label="Invite a friend">
      <p><strong>Liked it? Send it to a friend.</strong></p>
      <p className="muted small">When they sign up with your link and make their first video, you get {FRIEND_BONUS} more free videos.</p>
      <div className="toolbar">
        <FriendLink code={code} />
        <button type="button" className="btn ghost sm" onClick={() => { write({ ...read(), snoozeUntil: Date.now() + 14 * DAY }); setOpen(false); }}>
          Not now
        </button>
      </div>
    </aside>
  );
}
