import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";
import { CreditsForm, DrawingRow, InviteForm, LimitsForm, ReportRow, SwitchForm, UnpublishForm } from "@/components/AdminForms";
import { toDrawing } from "@/lib/generation/drawings.mjs";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
const usd = (n: number) => `$${n.toFixed(2)}`;
const IST = 5.5 * 3600e3;
const istDay = (t: string | number) => new Date(new Date(t).getTime() + IST).toISOString().slice(0, 10);
const istTime = (t: string) => new Date(new Date(t).getTime() + IST).toISOString().slice(5, 16).replace("T", " ");

// §11.3: today's spend and failures, credit drift, switches and audited money actions. No question text is shown
// here: viewing one is its own audited action (admin_view_generation).
export default async function Admin() {
  const { sb } = await requireAdmin();
  const db = createAdminClient();
  const now = new Date(), day = new Date(now); day.setUTCHours(0, 0, 0, 0);
  const since = day.toISOString();
  const week = new Date(day.getTime() - 6 * 864e5).toISOString();
  // Last 7 days in India time (today + 6 before), for the week view below.
  const days = Array.from({ length: 7 }, (_, i) => istDay(now.getTime() - i * 864e5));
  const since7 = new Date(new Date(`${days[6]}T00:00:00Z`).getTime() - IST).toISOString();
  const [gens, calls, settings, drift, misses, users, reports, drawings, feedback, support, wkUsers, wkGens, wkCalls, admins] = await Promise.all([
    db.from("generations").select("id, created_at, style, status, credits_charged, error_code").gte("created_at", since).order("created_at", { ascending: false }).limit(500),
    db.from("generation_calls").select("cost_usd").gte("started_at", since),
    db.from("ops_settings").select("*").single(),
    db.rpc("credit_drift"),
    sb.rpc("admin_top_misses", { p_days: 30 }),
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("reports").select("id, slug, reason, note, created_at").is("resolved_at", null).order("created_at", { ascending: false }).limit(50),
    sb.rpc("admin_list_drawings", { p_status: "pending", p_limit: 30 }),
    db.from("video_feedback").select("generation_id, rating, reasons, note, created_at").gte("created_at", week).order("created_at", { ascending: false }).limit(1000),
    // the contact form (founder, 23 Oct 2026): newest 30; reply by email
    db.from("support_messages").select("id, email, topic, message, created_at").order("created_at", { ascending: false }).limit(30),
    db.from("profiles").select("id, created_at, signup_source").gte("created_at", since7).order("created_at", { ascending: false }),
    db.from("generations").select("user_id, created_at, status").gte("created_at", since7).limit(10000),   // ponytail: row cap, move to a SQL group-by when a week passes 10k videos
    db.from("generation_calls").select("started_at, cost_usd").gte("started_at", since7).limit(20000),
    db.from("admins").select("user_id"),
  ]);
  // Video feedback, last 7 days (VideoFeedback.tsx). A thumbs-down links to the video's public page when it has one.
  const fb = feedback.data ?? [], downs = fb.filter(f => f.rating === -1);
  const why = new Map<string, number>();
  for (const f of downs) for (const r of f.reasons ?? []) why.set(r, (why.get(r) ?? 0) + 1);
  const recent = downs.slice(0, 20);
  const slugs = new Map((recent.length ? (await db.from("shares").select("generation_id, slug").in("generation_id", recent.map(f => f.generation_id))).data ?? [] : [])
    .map(x => [x.generation_id, x.slug]));
  const wg = wkGens.data ?? [], adminIds = new Set((admins.data ?? []).map(a => a.user_id));
  const weekRows = days.map(d => {
    const dg = wg.filter(x => istDay(x.created_at) === d);
    return { d, signups: (wkUsers.data ?? []).filter(u => istDay(u.created_at) === d).length,
      made: dg.filter(x => x.status === "succeeded").length, failed: dg.filter(x => x.status === "failed" || x.status === "refunded").length,
      spend: (wkCalls.data ?? []).filter(c => istDay(c.started_at) === d).reduce((t, c) => t + Number(c.cost_usd ?? 0), 0) };
  });
  // Each waiting drawing, normalised the way approving it would, shown on the player as "sv id=candidate".
  const waiting = ((drawings.data ?? []) as { id: string; name: string; subject: string | null; created_at: string; lines: Record<string, string> }[]).map(d => {
    try { return { d, problem: null, preview: { q: d.name, els: { p: "sv id=candidate 480 270 460" }, steps: [{ say: "", do: ["draw p", "fill p"] }],
      drawings: { candidate: toDrawing(d.lines) } } }; }
    catch (e) { return { d, problem: (e as Error).message, preview: null }; }
  });
  const g = gens.data ?? [], s = settings.data!;
  const spend = (calls.data ?? []).reduce((t, c) => t + Number(c.cost_usd ?? 0), 0);
  const by = (st: string) => g.filter(x => x.status === st).length;
  const credits = g.reduce((t, x) => t + (x.credits_charged ?? 0), 0);
  return (
    <main className="page stack">
      <h1>Admin</h1>
      <section className="card stack">
        <h2>Today (UTC)</h2>
        <p>Model spend <strong>{usd(spend)}</strong> of the {usd(Number(s.daily_spend_cap_usd))} daily cap.</p>
        <p>Videos: {g.length} asked · {by("succeeded")} made · {by("failed") + by("refunded")} failed (not charged) · {by("running") + by("reserved")} in progress.</p>
        <p>Plan videos charged: {credits} (≈ {usd(credits * 9.99 / 40)} at the Plus rate; free and admin videos charge 0). Accounts: {users.count ?? 0}.</p>
        <p>Credit ledger check: {(drift.data ?? []).length === 0 ? "balances match the ledger ✓" : <strong className="error">{(drift.data ?? []).length} accounts drift — investigate</strong>}</p>
      </section>
      <section className="card stack">
        <h2>Last 7 days (India time)</h2>
        <table><thead><tr><th>Day</th><th>Sign-ups</th><th>Videos made</th><th>Failed</th><th>Model spend</th></tr></thead>
          <tbody>{weekRows.map(w => (
            <tr key={w.d}><td>{w.d.slice(5)}</td><td>{w.signups}</td><td>{w.made}</td><td>{w.failed}</td><td>{usd(w.spend)}</td></tr>
          ))}</tbody></table>
      </section>
      <section className="card stack">
        <h2>New accounts, last 7 days ({(wkUsers.data ?? []).length})</h2>
        <p className="muted">Ones with 0 videos signed up and stopped. No emails here.</p>
        <table><thead><tr><th>Signed up (IST)</th><th>Source</th><th>Videos asked</th><th>Made</th></tr></thead>
          <tbody>{(wkUsers.data ?? []).map(u => {
            const ug = wg.filter(x => x.user_id === u.id);
            return <tr key={u.id}><td>{istTime(u.created_at)}</td><td>{adminIds.has(u.id) ? "admin" : u.signup_source ?? "—"}</td>
              <td>{ug.length || <strong className="error">0</strong>}</td><td>{ug.filter(x => x.status === "succeeded").length}</td></tr>;
          })}</tbody></table>
      </section>
      <div className="grid">
        <SwitchForm k="generation_enabled" label="Making videos" on={s.generation_enabled} />
        <SwitchForm k="purchases_enabled" label="Purchases" on={s.purchases_enabled} />
        <LimitsForm values={s} />
      </div>
      <section className="card stack">
        <h2>Video feedback (last 7 days)</h2>
        <p>{fb.length} rated · <strong>{fb.length - downs.length}</strong> helpful · <strong>{downs.length}</strong> not helpful{fb.length ? ` · ${Math.round((fb.length - downs.length) / fb.length * 100)}% helpful` : ""}</p>
        {why.size > 0 && <p className="muted small">Why not: {[...why].sort((a, b) => b[1] - a[1]).map(([r, n]) => `${r.replace("_", " ")} ×${n}`).join(" · ")}</p>}
        {recent.length === 0 ? <p className="muted">No thumbs-down yet.</p>
          : <ul className="stack" style={{ listStyle: "none", padding: 0 }}>{recent.map(f => (
              <li key={f.generation_id} className="small">
                {f.created_at.slice(0, 16).replace("T", " ")} UTC · {(f.reasons ?? []).join(", ") || "no reason"}
                {f.note ? <> · “{f.note}”</> : null}
                {slugs.get(f.generation_id) ? <> · <a href={`/v/${slugs.get(f.generation_id)}`} target="_blank" rel="noreferrer">watch</a></> : null}
              </li>))}</ul>}
      </section>
      <section className="card stack">
        <h2>Open reports ({(reports.data ?? []).length})</h2>
        {(reports.data ?? []).length === 0 ? <p className="muted">None.</p>
          : <ul className="stack" style={{ listStyle: "none", padding: 0 }}>{(reports.data ?? []).map(r => <ReportRow key={r.id} r={r} />)}</ul>}
      </section>
      <section className="card stack">
        <h2>Contact messages ({(support.data ?? []).length})</h2>
        {(support.data ?? []).length === 0 ? <p className="muted">None.</p>
          : <ul className="stack" style={{ listStyle: "none", padding: 0 }}>{(support.data ?? []).map(m => (
              <li key={m.id} className="stack" style={{ gap: 4 }}>
                <span className="small muted">{new Date(m.created_at).toISOString().slice(0, 16).replace("T", " ")} UTC · {m.topic} ·{" "}
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message to Ask Radlor")}`}>{m.email}</a></span>
                <span style={{ whiteSpace: "pre-wrap" }}>{m.message}</span>
              </li>))}</ul>}
      </section>
      <div className="grid">
        <CreditsForm />
        <InviteForm />
        <UnpublishForm />
      </div>
      <section className="card stack">
        <h2>Latest videos today</h2>
        <table><thead><tr><th>Time</th><th>Style</th><th>Status</th><th>Credits</th><th>Error</th></tr></thead>
          <tbody>{g.slice(0, 30).map(x => (
            <tr key={x.id}><td>{new Date(x.created_at).toISOString().slice(11, 16)}</td><td>{x.style}</td><td>{x.status}</td><td>{x.credits_charged}</td><td>{x.error_code ?? ""}</td></tr>
          ))}</tbody></table>
      </section>
      <section className="card stack">
        <h2>Drawings to review ({waiting.length})</h2>
        <p className="muted">Drawn by the model for something the library lacked. Approve the good ones: lessons then find them like any library drawing.</p>
        {waiting.length === 0 ? <p className="muted">None waiting.</p>
          : <ul className="stack" style={{ listStyle: "none", padding: 0 }}>{waiting.map(w => <DrawingRow key={w.d.id} d={w.d} preview={w.preview} problem={w.problem} />)}</ul>}
      </section>
      <section className="card stack">
        <h2>Drawings asked for but missing (30 days)</h2>
        <p>{(misses.data ?? []).slice(0, 20).map((m: { name: string; n: number }) => `${m.name} ×${m.n}`).join(", ") || "None"}</p>
      </section>
    </main>
  );
}
