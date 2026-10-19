"use client";
// The bookmark on an Explore card or lesson: saves it to your Collection. Signed out, it asks you to sign in first.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveItem } from "@/app/(app)/saved/actions";
import { toast } from "./Toast";
import { Icon } from "./Icon";

export function SaveButton({ slug, saved: initial, signedIn, className = "", label = false }: {
  slug: string; saved: boolean; signedIn: boolean; className?: string; label?: boolean;
}) {
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <button type="button" className={`save-btn${saved ? " on" : ""} ${className}`} disabled={busy} aria-pressed={saved}
      aria-label={saved ? "Remove from Collection" : "Save to Collection"} title={saved ? "Saved" : "Save"}
      onClick={async () => {
        if (!signedIn) { router.push(`/signin?next=${encodeURIComponent(location.pathname)}`); return; }
        setBusy(true); setSaved(!saved);                                // at once; put back if it fails
        const r = await saveItem(slug, !saved);
        setBusy(false);
        if (r === "saved") toast("Saved to Collection");
        else if (r === "removed") toast("Removed from Collection");
        else { setSaved(saved); toast(r === "full" ? "Your Collection is full." : "Couldn't save. Try again."); }
      }}>
      <Icon name={saved ? "bookmarkOn" : "bookmark"} size={label ? 16 : 18} />
      {label && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
