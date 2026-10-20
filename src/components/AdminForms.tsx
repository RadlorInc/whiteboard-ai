"use client";
import { useActionState } from "react";
import { adjustCredits, createInvite, handleReport, reviewDrawing, setLimits, setSwitch, unpublishShare } from "@/app/admin/actions";
import { BoardPreview } from "@/components/BoardPreview";

function Result({ s }: { s: { ok?: string; error?: string } }) {
  return s.error ? <p role="alert" className="error">{s.error}</p> : s.ok ? <p role="status">{s.ok}</p> : null;
}

export function SwitchForm({ k, label, on }: { k: string; label: string; on: boolean }) {
  const [s, act, pending] = useActionState(setSwitch, {});
  return (
    <form action={act} className="card stack">
      <strong>{label}: {on ? "ON" : "OFF"}</strong>
      <input type="hidden" name="key" value={k} /><input type="hidden" name="value" value={on ? "off" : "on"} />
      <label>Reason<input name="reason" className="input" required minLength={5} /></label>
      <button className={on ? "btn danger" : "btn"} disabled={pending}>{on ? "Turn off" : "Turn on"}</button>
      <Result s={s} />
    </form>
  );
}

const LIMIT_LABELS: [string, string, string?][] = [
  ["daily_spend_cap_usd", "App-wide model spend a day ($)", "0.01"], ["max_open_generations", "Videos made at once, app-wide"],
  ["user_daily_cap", "Videos a user a day"], ["user_monthly_cap", "Videos a user a month"],
  ["slow_1_after", "First wait after this many videos today"], ["slow_1_seconds", "First wait (seconds, max 60)"],
  ["slow_2_after", "Second wait after this many videos today"], ["slow_2_seconds", "Second wait (seconds, max 60)"],
];
export function LimitsForm({ values }: { values: Record<string, number | string> }) {
  const [s, act, pending] = useActionState(setLimits, {});
  return (
    <form action={act} className="card stack">
      <strong>Limits</strong>
      {LIMIT_LABELS.map(([k, label, step]) => (
        <label key={k}>{label}<input name={k} type="number" min={0} step={step ?? 1} defaultValue={values[k]} className="input" required /></label>
      ))}
      <label>Reason<input name="reason" className="input" required minLength={5} /></label>
      <button className="btn" disabled={pending}>Save limits</button>
      <Result s={s} />
    </form>
  );
}

export function CreditsForm() {
  const [s, act, pending] = useActionState(adjustCredits, {});
  return (
    <form action={act} className="card stack">
      <strong>Give or take credits (top-up bucket)</strong>
      <label>Email or user id<input name="who" className="input" required /></label>
      <label>Credits (+ to give, − to take)<input name="delta" type="number" className="input" required /></label>
      <label>Reason<input name="reason" className="input" required minLength={5} /></label>
      <button className="btn" disabled={pending}>Apply</button>
      <Result s={s} />
    </form>
  );
}

export function InviteForm() {
  const [s, act, pending] = useActionState(createInvite, {});
  return (
    <form action={act} className="card stack">
      <strong>New invite code</strong>
      <label>Code<input name="code" className="input" required pattern="[A-Za-z0-9-]{4,40}" /></label>
      <label>Uses<input name="uses" type="number" min={1} max={500} defaultValue={1} className="input" /></label>
      <label>Reason<input name="reason" className="input" required minLength={5} /></label>
      <button className="btn" disabled={pending}>Create</button>
      <Result s={s} />
    </form>
  );
}

export function UnpublishForm() {
  const [s, act, pending] = useActionState(unpublishShare, {});
  return (
    <form action={act} className="card stack">
      <strong>Take a video off Explore</strong>
      <label>Link or slug<input name="slug" className="input" required placeholder="https://…/v/…" /></label>
      <label>Reason<input name="reason" className="input" required minLength={5} /></label>
      <button className="btn" disabled={pending}>Remove</button>
      <Result s={s} />
    </form>
  );
}

export function ReportRow({ r }: { r: { id: string; slug: string; reason: string; note: string | null; created_at: string } }) {
  const [s, act, pending] = useActionState(handleReport, {});
  return (
    <li className="card stack">
      <span><a href={`/v/${r.slug}`} target="_blank" rel="noreferrer">/v/{r.slug}</a> · <strong>{r.reason}</strong> · {new Date(r.created_at).toLocaleString()}</span>
      {r.note && <span className="muted">{r.note}</span>}
      <form action={act} className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <input type="hidden" name="id" value={r.id} /><input type="hidden" name="slug" value={r.slug} />
        <input name="reason" className="input" placeholder="Reason (5+ characters)" required minLength={5} />
        <button className="btn" name="act" value="remove" disabled={pending}>Take off Explore and resolve</button>
        <button className="btn secondary" name="act" value="keep" disabled={pending}>Keep and resolve</button>
      </form>
      <Result s={s} />
    </li>
  );
}

// A drawing the model made for something the library lacked: its preview is exactly what lessons will draw.
export function DrawingRow({ d, preview, problem }: { d: { id: string; name: string; subject: string | null; created_at: string };
  preview: unknown; problem: string | null }) {
  const [s, act, pending] = useActionState(reviewDrawing, {});
  return (
    <li className="card stack">
      <span><strong>{d.name}</strong> · {d.subject ?? "no subject"} · {new Date(d.created_at).toLocaleString()}</span>
      {problem ? <p className="error">Cannot read it: {problem}</p>
        : <div style={{ maxWidth: 420 }}><BoardPreview style="whiteboard" script={preview} label={`Drawing: ${d.name}`} /></div>}
      <form action={act} className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <input type="hidden" name="id" value={d.id} />
        <input name="slug" className="input" defaultValue={d.name} aria-label="Library name" />
        <input name="tags" className="input" defaultValue={d.name} placeholder="Search words" aria-label="Search words" />
        <input name="reason" className="input" defaultValue="Library drawing review" required minLength={5} aria-label="Reason" />
        <button className="btn" name="act" value="approve" disabled={pending || !!problem}>Approve into the library</button>
        <button className="btn secondary" name="act" value="reject" disabled={pending}>Reject</button>
      </form>
      <Result s={s} />
    </li>
  );
}
