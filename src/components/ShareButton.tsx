"use client";
// Share one of your videos from wherever it is shown: makes (or reuses) its link, then the share sheet or a copy.
import { useState } from "react";
import { shareVideo } from "@/app/(app)/videos/actions";
import { shareLink, toast } from "./Toast";
import { Icon } from "./Icon";

// A video's link carries its maker's friend code: whoever signs up from it is stored as their friend (proxy.ts →
// lib/signup.ts keepFriend), so sign-ups can be counted per person (admin page).
export const shareUrl = (origin: string, slug: string, friend?: string | null) =>
  `${origin}/v/${slug}${friend ? `?friend=${friend}` : ""}`;

// Share any shared video you are watching (a share page, from Explore): the link carries YOUR friend code, so a
// sign-up from it is counted for you (founder, 2 Nov 2026).
export function ShareSlugButton({ slug, title, friend }: { slug: string; title: string; friend: string | null }) {
  return (
    <button type="button" className="btn secondary sm" onClick={() => shareLink(shareUrl(location.origin, slug, friend), title)}>
      <Icon name="share" size={16} /> Share
    </button>
  );
}

export function ShareButton({ id, title, label = "Share" }: { id: string; title: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button type="button" className="btn ghost sm" disabled={busy} onClick={async () => {
      setBusy(true);
      const r = await shareVideo(id);
      setBusy(false);
      if (r.slug) shareLink(shareUrl(location.origin, r.slug, r.friend), title);
      else toast(r.error === "contact_info" ? "This question has contact details in it, so it can't be shared."
        : r.error === "share_limit" ? "That's a lot of shared videos today. Try again tomorrow." : "Couldn't make a link. Try again.");
    }}><Icon name="share" size={16} /> {label}</button>
  );
}
