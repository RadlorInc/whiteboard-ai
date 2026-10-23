"use client";
// The friend link (founder, 22 Oct 2026): /?friend=<code>. Shared or copied with the same sheet as a video's link.
import { shareLink } from "./Toast";

export function FriendLink({ code }: { code: string }) {
  return (
    <button className="btn" type="button" onClick={() => shareLink(`${location.origin}/?friend=${code}`, "Try Ask Radlor: your first 20 videos are free")}>
      Share your invite link
    </button>
  );
}
