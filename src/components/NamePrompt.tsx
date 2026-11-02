"use client";
// Asks once for the name shown as "Asked by" on Explore (founder, 2 Nov 2026). Prefilled from the email's local part as
// a suggestion only: nothing is public until the user presses Save. Skip is remembered in this browser; the name can
// always be set later on /account.
import { useActionState, useEffect, useRef } from "react";
import { savePublicName } from "@/app/actions";

const SKIP = "ar_name_prompt_skipped";

// "rafi.k+news@x.com" -> "rafi.k": only the characters a name may have, at most 30.
export const suggestName = (email: string) => {
  const s = email.split("@")[0].split("+")[0].replace(/[^\p{L}\p{N} ._-]/gu, "").slice(0, 30).trim();
  return /\p{L}/u.test(s) && s.length >= 2 ? s : "";
};

export function NamePrompt({ email }: { email: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(savePublicName, undefined);
  useEffect(() => {
    let skipped = false;
    try { skipped = localStorage.getItem(SKIP) === "1"; } catch {}
    if (!skipped) ref.current?.showModal();
  }, []);
  useEffect(() => { if (state?.ok) ref.current?.close(); }, [state]);
  const skip = () => { try { localStorage.setItem(SKIP, "1"); } catch {} ref.current?.close(); };
  return (
    <dialog ref={ref} className="signup-popup" aria-labelledby="name-title" onCancel={skip}>
      <h2 id="name-title">Pick a name for your videos</h2>
      <p className="muted small">Videos you share or put on Explore will say &ldquo;Asked by&rdquo; this name. Your real name or a nickname. We never show your email.</p>
      <form action={action} className="stack" style={{ width: "100%" }}>
        <input name="name" className="input" defaultValue={suggestName(email)} maxLength={30} required minLength={2} autoComplete="nickname" aria-label="Name on your videos" />
        <div className="toolbar" style={{ justifyContent: "center" }}>
          <button type="submit" className="btn" disabled={pending}>Save</button>
          <button type="button" className="btn ghost" onClick={skip}>Skip</button>
        </div>
        {state?.error && <p role="alert" className="error small">{state.error}</p>}
      </form>
    </dialog>
  );
}
