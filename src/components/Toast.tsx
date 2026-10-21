"use client";
// Short confirmations ("Link copied") at the bottom of the screen, read out by screen readers. toast() from anywhere.
import { useEffect, useState } from "react";

export const toast = (text: string) => dispatchEvent(new CustomEvent("app:toast", { detail: text }));

export function Toaster() {
  const [msg, setMsg] = useState<{ text: string; n: number } | null>(null);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      setMsg((m) => ({ text: (e as CustomEvent<string>).detail, n: (m?.n ?? 0) + 1 }));
      clearTimeout(t); t = setTimeout(() => setMsg(null), 2600);
    };
    addEventListener("app:toast", on);
    return () => { removeEventListener("app:toast", on); clearTimeout(t); };
  }, []);
  return <div className="toast-region" role="status" aria-live="polite">{msg && <div key={msg.n} className="toast">{msg.text}</div>}</div>;
}

// Share a link: the phone's share sheet where there is one, else copy it. Says what happened (copied: in the viewer's language).
export async function shareLink(url: string, title: string, copied = "Link copied") {
  if (navigator.share && matchMedia("(pointer: coarse)").matches) {
    try { await navigator.share({ title, url }); return; } catch (e) { if ((e as Error).name === "AbortError") return; }
  }
  try { await navigator.clipboard.writeText(url); toast(copied); } catch { toast(url); }
}
