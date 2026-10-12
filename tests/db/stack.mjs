// Shared by the Node DB tests (PLAN.md §12.3): the LOCAL stack only, real JWTs, real parallel connections.
// Keys come from `supabase status` at run time and are never printed.
import { execFileSync, spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const APP = fileURLToPath(new URL('../..', import.meta.url));
const LOCAL_API = 'http://127.0.0.1:55321';            // the local stack (supabase/config.toml), written by hand
const DB_CONTAINER = 'supabase_db_whiteboard-ai';

let cached;
export function stack() {
  if (cached) return cached;
  let out;
  try {
    out = execFileSync('supabase', ['status', '-o', 'json'], { cwd: APP, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  } catch {
    throw new Error('could not look: the local stack is not running (run `supabase start` in app/)');
  }
  const s = JSON.parse(out.slice(out.indexOf('{')));
  if (s.API_URL !== LOCAL_API) throw new Error(`refusing to run: API_URL is not the local stack ${LOCAL_API}`);
  const opts = { auth: { persistSession: false, autoRefreshToken: false } };
  cached = {
    url: s.API_URL,
    publishable: s.PUBLISHABLE_KEY,
    admin: createClient(s.API_URL, s.SECRET_KEY, opts),         // the server's client (service_role)
    anon: () => createClient(s.API_URL, s.PUBLISHABLE_KEY, opts),
    as: (token) => createClient(s.API_URL, s.PUBLISHABLE_KEY,
      { ...opts, global: { headers: { Authorization: `Bearer ${token}` } } }),
  };
  return cached;
}

// A psql session inside the local DB container (psql is not installed on the host). run() resolves with the
// command's output lines once psql has finished it; a command that blocks keeps its promise pending.
export function psql() {
  // stderr is folded into stdout inside the container, so an error line always precedes its command's marker.
  const p = spawn('docker', ['exec', '-i', DB_CONTAINER, 'bash', '-c', 'psql -U postgres -d postgres -X -q -t -A 2>&1'],
    { stdio: ['pipe', 'pipe', 'pipe'] });
  let buf = '';
  let n = 0;
  const waiting = new Map();
  const onData = (d) => {
    buf += d.toString();
    for (const [marker, resolve] of waiting) {
      const i = buf.indexOf(marker);
      if (i >= 0) {
        const lines = buf.slice(0, i).split('\n').map((l) => l.trim()).filter(Boolean);
        buf = buf.slice(i + marker.length);
        waiting.delete(marker);
        resolve(lines);
      }
    }
  };
  p.stdout.on('data', onData);
  return {
    run(sql) {
      const marker = `__done_${++n}__`;
      const done = new Promise((resolve) => waiting.set(marker, resolve));
      p.stdin.write(`${sql}\n\\echo ${marker}\n`);
      return done;
    },
    close() { p.stdin.end(); },
  };
}

export async function sql(query) {
  const s = psql();
  try { return await s.run(query); } finally { s.close(); }
}

// A fresh user with a real session (6-digit code flow: generateLink -> verifyOtp), signed up, invited (redeem_invite
// with a fixture code) and linked to a Stripe customer. No credits.
// A signed-up account with access and no credits. With { invite: true } access comes the way the app gives it, by the
// user redeeming an invite code, which also grants the 100 invite credits (13 Oct 2026); without it, access is set
// directly so money tests start from zero.
export async function newUser(label, { invite = false } = {}) {
  const { admin, anon, as } = stack();
  const email = `${label}-${randomUUID().slice(0, 8)}@example.test`;
  const created = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (created.error) throw created.error;
  const id = created.data.user.id;
  const link = await admin.auth.admin.generateLink({ type: 'magiclink', email });
  if (link.error) throw link.error;
  const v = await anon().auth.verifyOtp({ email, token: link.data.properties.email_otp, type: 'email' });
  if (v.error) throw v.error;
  const token = v.data.session.access_token;
  const terms = await admin.rpc('current_terms_version');
  const signup = await admin.rpc('complete_signup', { p_user_id: id, p_birth_year: 2000, p_birth_month: 1,
    p_gate_version: 'age-v1', p_terms_version: terms.data, p_source: 'direct' });
  if (signup.data !== 'ok') throw new Error(`complete_signup: ${JSON.stringify(signup)}`);
  if (invite) {
    const code = `NODE-${randomUUID().slice(0, 8)}`;
    await sql(`insert into public.invites (code, max_uses, note) values ('${code}', 1, 'node test fixture');`);
    const redeemed = await as(token).rpc('redeem_invite', { p_code: code });
    if (redeemed.data !== true) throw new Error(`redeem_invite: ${JSON.stringify(redeemed)}`);
  } else {
    await sql(`update public.profiles set access_granted_at = now() where id = '${id}';`);
  }
  const customer = `cus_node_${id.replaceAll('-', '')}`;
  const linked = await admin.rpc('link_stripe_customer', { p_user_id: id, p_customer_id: customer });
  if (linked.data !== customer) throw new Error(`link_stripe_customer: ${JSON.stringify(linked)}`);
  return { id, email, token, customer };
}

// Credits the only way they enter: a (fake) signature-verified Stripe event through stripe_topup_paid.
export async function buyPack(user, priceKey = 'topup_60', cents = 499) {
  const n = randomUUID().replaceAll('-', '');
  const r = await stack().admin.rpc('stripe_topup_paid', {
    p_event_id: `evt_node_${n}`, p_event_type: 'checkout.session.completed', p_event_created: new Date().toISOString(),
    p_livemode: false, p_customer_id: user.customer, p_client_reference_id: user.id, p_session_id: `cs_node_${n}`,
    p_payment_intent_id: `pi_node_${n}`, p_price_key: priceKey, p_unit_amount: cents, p_quantity: 1, p_currency: 'usd',
    p_amount_total: cents });
  if (r.data !== 'applied') throw new Error(`stripe_topup_paid: ${JSON.stringify(r)}`);
}

export async function balance(userId) {
  const [row] = await sql(`select sub || '/' || topup || '/' || held from public.credit_balances where user_id = '${userId}';`);
  return row;
}

export async function drift() {
  const r = await stack().admin.rpc('credit_drift');
  if (r.error) throw r.error;
  return r.data;
}
