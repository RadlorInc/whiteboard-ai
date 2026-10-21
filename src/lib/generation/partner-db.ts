// The partner endpoint's gate, read with the service role (reserve_generation does the same checks for /api/generate).
import 'server-only';
import { createAdminClient } from '@/lib/supabase/server';
import { supabaseDb } from './db-supabase';
import type { Gate } from './partner';

const PER_MINUTE = 60;           // a backstop only: Radlic limits each child itself
const HOLD_USD = 0.3;            // about one lesson plus its screen: refuse when it could cross the cap

export async function partnerGate(): Promise<Gate> {
  const db = createAdminClient(), midnight = new Date(); midnight.setUTCHours(0, 0, 0, 0);
  const [s, blocked, calls, rl] = await Promise.all([
    db.from('ops_settings').select('generation_enabled, daily_spend_cap_usd').single(),
    db.from('ops_state').select('key').eq('key', 'provider_blocked_until').gt('at', new Date().toISOString()).maybeSingle(),
    // ponytail: sums today's rows in the app, as /admin does; an SQL sum if the day grows past a few thousand calls
    db.from('generation_calls').select('cost_usd').gte('started_at', midnight.toISOString()),
    db.rpc('hit_rate_limit', { p_key: 'partner:radlic', p_window_seconds: 60, p_max: PER_MINUTE }),
  ]);
  if (s.error || blocked.error || calls.error || rl.error) throw new Error('gate read failed');
  if (!s.data.generation_enabled || blocked.data) return 'paused';
  const spent = (calls.data ?? []).reduce((t, c) => t + Number(c.cost_usd ?? 0), 0);
  if (spent + HOLD_USD > Number(s.data.daily_spend_cap_usd)) return 'spend_cap';
  return rl.data === true ? 'ok' : 'rate_limited';
}

export const recordPartnerCall = supabaseDb.recordCall;
