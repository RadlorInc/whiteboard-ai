// The real GenDb (db-supabase.ts) against the LOCAL Supabase stack: reserve → start → run → finish, and a refusal →
// release, then credit_drift() must be empty. Opt-in, because it writes rows: WB_LOCAL_DB=1 npx vitest run tests/generation/localdb.test.ts
// It refuses any URL that is not http://127.0.0.1:<port>. The model is the mock / a fake: no API call.
import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const on = process.env.WB_LOCAL_DB === '1';
const env: Record<string, string> = on ? Object.fromEntries(fs.readFileSync('.env.local', 'utf8').split('\n')
  .filter(l => /^(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY)=/.test(l))
  .map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)])) : {};
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL ?? '', KEY = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '';
const local = () => { if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(URL_)) throw new Error('not the local stack: refusing'); return createClient(URL_, KEY, { auth: { persistSession: false } }); };
vi.mock('@/lib/supabase/server', () => ({ createAdminClient: local }));
vi.mock('server-only', () => ({}));

describe.runIf(on)('local stack money path (WB_LOCAL_DB=1)', () => {
  it('charges 4 for the rainbow, releases a refusal, and leaves no drift', async () => {
    const { supabaseDb: db } = await import('../../src/lib/generation/db-supabase');
    const { runGeneration } = await import('../../src/lib/generation/run');
    const { mockClient, PROMPT_SHA } = await import('../../src/lib/generation/model');
    const { fakeClient } = await import('./fakes');
    const sb = local(), A = '00000000-0000-4000-8000-00000000000a';     // seed.sql user A
    const ask = async (question: string) => {
      const r = await db.reserve({ userId: A, clientRequestId: crypto.randomUUID(), style: 'whiteboard', question, buildId: 'local', promptSha: PROMPT_SHA.whiteboard, policyVersion: 1 });
      expect(r.outcome).toBe('reserved'); expect(await db.start(r.generation_id!)).toBe(true);
      return r.generation_id!;
    };
    const ok = await ask('How does a rainbow form?');
    await runGeneration({ id: ok, style: 'whiteboard', question: 'How does a rainbow form?', client: mockClient({ cps: 0 }), db, send: () => {} });
    expect(await db.getOwn(ok, A)).toMatchObject({ status: 'succeeded', credits_charged: 4, narration_chars: 515 });
    const bad = await ask('q two');
    await runGeneration({ id: bad, style: 'whiteboard', question: 'q two', client: fakeClient([{ stop: 'refusal', text: '' }]).client, db, send: () => {} });
    expect(await db.getOwn(bad, A)).toMatchObject({ status: 'failed', error_code: 'refusal' });
    const ledger = (await sb.from('credit_ledger').select('kind, generation_id').in('generation_id', [ok, bad]).order('id')).data!;
    expect(ledger.map(l => [l.kind, l.generation_id])).toEqual([['reserve', ok], ['settle', ok], ['reserve', bad], ['release', bad]]);
    expect((await sb.rpc('credit_drift')).data).toEqual([]);
  });
});
