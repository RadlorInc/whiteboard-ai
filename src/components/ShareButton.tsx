"use client";
// Share one of your videos from wherever it is shown: makes (or reuses) its link, then the share sheet or a copy.
import { useState } from "react";
import { shareVideo } from "@/app/(app)/videos/actions";
import { shareLink, toast } from "./Toast";
import { Icon } from "./Icon";
import { useT } from "./Lang";

export function ShareButton({ id, title, label = "Share" }: { id: string; title: string; label?: string }) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  return (
    <button type="button" className="btn ghost sm" disabled={busy} onClick={async () => {
      setBusy(true);
      const r = await shareVideo(id);
      setBusy(false);
      if (r.slug) shareLink(`${location.origin}/v/${r.slug}`, title, t("Link copied"));
      else toast(t(r.error === "contact_info" ? "This question has contact details in it, so it can't be shared."
        : r.error === "share_limit" ? "That's a lot of shared videos today. Try again tomorrow." : "Couldn't make a link. Try again."));
    }}><Icon name="share" size={16} /> {t(label)}</button>
  );
}
