"use client";
import { useActionState } from "react";
import { sendSupport } from "@/app/(app)/contact/actions";

const TOPICS: [string, string][] = [["billing", "Payment or plan"], ["video", "A video"], ["account", "My account"], ["other", "Something else"]];

// signedInEmail: replies go to the account's email, so the field is not asked.
export function ContactForm({ signedInEmail }: { signedInEmail: string | null }) {
  const [s, act, pending] = useActionState(sendSupport, undefined);
  if (s?.ok) return <p role="status">Thanks, we got your message. We&apos;ll reply by email within 2 business days.</p>;
  return (
    <form action={act} className="stack">
      {signedInEmail ? <p className="muted small">We&apos;ll reply to {signedInEmail}.</p> : (
        <label className="field"><span>Your email</span><input type="email" name="email" autoComplete="email" maxLength={320} required /></label>
      )}
      <label className="field"><span>Topic</span>
        <select name="topic" defaultValue="" required>
          <option value="" disabled>Choose one</option>
          {TOPICS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="field"><span>Message</span>
        <textarea name="message" rows={5} maxLength={2000} required placeholder="For a video, paste its link." />
      </label>
      <div><button className="btn" disabled={pending}>{pending ? "Sending…" : "Send message"}</button></div>
      {s?.error && <p className="error small" role="alert">{s.error}</p>}
    </form>
  );
}
