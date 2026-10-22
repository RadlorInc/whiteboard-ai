"use client";
// /settings: change the categories and level chosen at sign-up (founder, 22 Oct 2026). New chats use them.
import { useActionState, useState } from "react";
import { saveInterests } from "@/app/actions";
import { InterestsFields } from "./InterestsFields";
import type { Interests } from "@/lib/interests";

export function InterestsForm({ initial }: { initial: Interests }) {
  const [state, action, pending] = useActionState(saveInterests, undefined);
  const [picked, setPicked] = useState(initial.subjects.length);
  return (
    <form action={action} className="stack">
      <InterestsFields initial={initial.subjects} level={initial.level} onChange={setPicked} />
      <div><button type="submit" className="btn" disabled={!picked || pending}>Save</button></div>
      {state?.error && <p role="alert" className="error">{state.error}</p>}
      {state?.ok && <p role="status" className="muted small">Saved. New chats use these.</p>}
    </form>
  );
}
