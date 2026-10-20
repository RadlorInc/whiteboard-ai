import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";
import { CreditsForm, DrawingRow, InviteForm, LimitsForm, ReportRow, SwitchForm, UnpublishForm } from "@/components/AdminForms";
import { toDrawing } from "@/lib/generation/drawings.mjs";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
const usd = (n: number) => `$${n.toFixed(2)}`;

// §11.3: today's spend and failures, credit drift, switches and audited money actions. No question text is shown
// here: viewing one is its own audited action (admin_view_generation).
export default async function Admin() {
  const { sb } = await requireAdmin();
  const db = createAdminClient();
  const day = new Date(); day.setUTCHours(0, 0, 0, 0);
  const since = day.toISOString();
  const [gens, calls, settings, drift, misses, users, reports, drawings] = await Promise.all([
    db.from("generations").select("id, created_at, style, status, credits_charged, error_code").gte("created_at", since).order("created_at", { ascending: false }).limit(500),
    db.from("generation_calls").select("cost_usd").gte("started_at", since),
    db.from("ops_settings").select("*").single(),
    db.rpc("credit_drift"),
    sb.rpc("admin_top_misses", { p_days: 30 }),
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("reports").select("id, slug, reason, note, created_at").is("resolved_at", null).order("created_at", { ascending: false }).limit(50),
    sb.rpc("admin_list_drawings", { p_status: "pending", p_limit: 30 }),
  ]);
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
      <div className="grid">
        <SwitchForm k="generation_enabled" label="Making videos" on={s.generation_enabled} />
        <SwitchForm k="purchases_enabled" label="Purchases" on={s.purchases_enabled} />
        <LimitsForm values={s} />
      </div>
      <section className="card stack">
        <h2>Open reports ({(reports.data ?? []).length})</h2>
        {(reports.data ?? []).length === 0 ? <p className="muted">None.</p>
          : <ul className="stack" style={{ listStyle: "none", padding: 0 }}>{(reports.data ?? []).map(r => <ReportRow key={r.id} r={r} />)}</ul>}
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
