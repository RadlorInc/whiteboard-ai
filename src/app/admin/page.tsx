import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";
import { CreditsForm, InviteForm, SwitchForm } from "@/components/AdminForms";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
const usd = (n: number) => `$${n.toFixed(2)}`;

// §11.3: today's spend and failures, credit drift, switches and audited money actions. No question text is shown
// here: viewing one is its own audited action (admin_view_generation).
export default async function Admin() {
  const { sb } = await requireAdmin();
  const db = createAdminClient();
  const day = new Date(); day.setUTCHours(0, 0, 0, 0);
  const since = day.toISOString();
  const [gens, calls, settings, drift, misses, users] = await Promise.all([
    db.from("generations").select("id, created_at, style, status, credits_charged, error_code").gte("created_at", since).order("created_at", { ascending: false }).limit(500),
    db.from("generation_calls").select("cost_usd").gte("started_at", since),
    db.from("ops_settings").select("*").single(),
    db.rpc("credit_drift"),
    sb.rpc("admin_top_misses", { p_days: 30 }),
    db.from("profiles").select("id", { count: "exact", head: true }),
  ]);
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
        <p>Credits charged: {credits} (≈ {usd(credits * 9.99 / 150)} at the Plus rate). Accounts: {users.count ?? 0}.</p>
        <p>Credit ledger check: {(drift.data ?? []).length === 0 ? "balances match the ledger ✓" : <strong className="error">{(drift.data ?? []).length} accounts drift — investigate</strong>}</p>
      </section>
      <div className="grid">
        <SwitchForm k="generation_enabled" label="Making videos" on={s.generation_enabled} />
        <SwitchForm k="purchases_enabled" label="Purchases" on={s.purchases_enabled} />
      </div>
      <div className="grid">
        <CreditsForm />
        <InviteForm />
      </div>
      <section className="card stack">
        <h2>Latest videos today</h2>
        <table><thead><tr><th>Time</th><th>Style</th><th>Status</th><th>Credits</th><th>Error</th></tr></thead>
          <tbody>{g.slice(0, 30).map(x => (
            <tr key={x.id}><td>{new Date(x.created_at).toISOString().slice(11, 16)}</td><td>{x.style}</td><td>{x.status}</td><td>{x.credits_charged}</td><td>{x.error_code ?? ""}</td></tr>
          ))}</tbody></table>
      </section>
      <section className="card stack">
        <h2>Drawings asked for but missing (30 days)</h2>
        <p>{(misses.data ?? []).slice(0, 20).map((m: { name: string; n: number }) => `${m.name} ×${m.n}`).join(", ") || "None"}</p>
      </section>
    </main>
  );
}
