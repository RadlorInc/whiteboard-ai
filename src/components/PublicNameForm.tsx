"use client";
// /account: the name shown as "Asked by …" on your shared videos and Explore (founder, 2 Nov 2026).
import { useActionState } from "react";
import { savePublicName } from "@/app/actions";

export function PublicNameForm({ initial }: { initial: string }) {
  const [state, action, pending] = useActionState(savePublicName, undefined);
  return (
    <form action={action} className="stack">
      <label className="stack">Name on your videos
        <input name="name" className="input" defaultValue={initial} minLength={2} maxLength={30} required autoComplete="nickname" />
      </label>
      <p className="muted small">Shown as &ldquo;Asked by&rdquo; on videos you share or put on Explore. Your real name or a nickname: your choice.</p>
      <div><button type="submit" className="btn" disabled={pending}>Save</button></div>
      {state?.error && <p role="alert" className="error">{state.error}</p>}
      {state?.ok && <p role="status" className="muted small">Saved.</p>}
    </form>
  );
}
