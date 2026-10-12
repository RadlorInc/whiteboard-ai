"use client";
import { useActionState } from "react";
import type { FormState } from "@/app/actions";

// The invite-code box (§5.3): before the age screen (checkInvite) or for a signed-in user without access (redeemInvite).
export function InviteForm({ action, src }: {
  action: (s: FormState, f: FormData) => Promise<FormState>;
  src?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="stack">
      {src && <input type="hidden" name="src" value={src} />}
      <label className="field">
        <span>Invite code</span>
        <input type="text" name="code" autoComplete="off" autoCapitalize="off" spellCheck={false} maxLength={64} required />
      </label>
      <button type="submit" className="btn block" disabled={pending}>
        {pending ? "Checking…" : "Continue"}
      </button>
      {state?.error && (
        <p role="alert" className="error">
          {state.error}
        </p>
      )}
    </form>
  );
}
