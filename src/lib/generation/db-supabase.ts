// The real GenDb: the §6.6 SECURITY DEFINER functions through a service-role client. Server only.
import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/server';
import type { GenDb, Reserve, CacheState, GenerationRow, Thread, ApprovedDrawing } from './db';

let sb: SupabaseClient | null = null;
const admin = () => (sb ??= createAdminClient());
async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await admin().rpc(fn, args);
  if (error) throw Object.assign(new Error(`${fn}: ${error.message}`), { code: error.code });
  return data as T;
}
// Follow-ups see at most the last 6 answered questions of their conversation (founder, 18 Oct 2026: questions +
// narration, no drawings). ponytail: a fixed window; summarise older turns if long chats lose the thread.
const THREAD_TURNS = 6;
const one = <T>(rows: T[] | T): T => (Array.isArray(rows) ? rows[0] : rows);

export const supabaseDb: GenDb = {
  async findByRequest(userId, clientRequestId) {
    const { data, error } = await admin().from('generations').select('id, status')
      .eq('user_id', userId).eq('client_request_id', clientRequestId).maybeSingle();
    if (error) throw new Error(`findByRequest: ${error.message}`);
    return data;
  },
  async findOwned(userId, style, questionNorm) {
    const { data, error } = await admin().from('generations').select('id, created_at')
      .eq('user_id', userId).eq('style', style).eq('question_norm', questionNorm).eq('status', 'succeeded')
      .is('content_deleted_at', null).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (error) throw new Error(`findOwned: ${error.message}`);
    return data;
  },
  async reserve(a) {
    return one(await rpc<Reserve[]>('reserve_generation', {
      p_user_id: a.userId, p_client_request_id: a.clientRequestId, p_style: a.style, p_question: a.question,
      p_build_id: a.buildId, p_prompt_sha: a.promptSha, p_policy_version: a.policyVersion,
    }));
  },
  start: id => rpc<boolean>('start_generation', { p_id: id }),
  async setStage(id, stage) { await rpc('set_generation_stage', { p_id: id, p_stage: stage }); },
  async finish(id, script, metrics) { return one(await rpc('finish_generation', { p_id: id, p_script: script, p_metrics: metrics })); },
  async fail(id, code, metrics) { return one(await rpc('fail_generation', { p_id: id, p_error_code: code, p_metrics: metrics })); },
  async recordCall(c) {
    await rpc('record_model_call', {
      p_generation_id: c.generation_id, p_style: c.style, p_kind: c.kind, p_round: c.round, p_prompt_sha: c.prompt_sha,
      p_started_at: c.started_at, p_ttft_ms: c.ttft_ms, p_ms: c.ms, p_stop_reason: c.stop_reason,
      p_input_tokens: c.input_tokens, p_cache_read_tokens: c.cache_read_tokens, p_cache_write_1h_tokens: c.cache_write_1h_tokens,
      p_output_tokens: c.output_tokens, p_thinking_tokens: null, p_tts_chars: null, p_cost_usd: c.cost_usd,
      p_anthropic_request_id: c.anthropic_request_id, p_raw_text: c.raw_text,
    });
  },
  async getOwn(id, userId) {
    const { data, error } = await admin().from('generations')
      .select('id, user_id, style, status, stage, script, error_code, credits_charged, narration_chars, created_at, question')
      .eq('id', id).eq('user_id', userId).is('content_deleted_at', null).maybeSingle();
    if (error) throw new Error(`getOwn: ${error.message}`);
    return data as GenerationRow | null;
  },
  expireIfStale: id => rpc<string>('expire_if_stale', { p_id: id }),
  async cacheState() {
    const { data, error } = await admin().from('prompt_cache_state').select('style, prompt_sha, last_touch_at, last_real_at');
    if (error) throw new Error(`cacheState: ${error.message}`);
    return (data ?? []) as CacheState[];
  },
  async thread(userId, conversationId) {
    const { data: c, error } = await admin().from('conversations').select('subject')
      .eq('id', conversationId).eq('user_id', userId).maybeSingle();
    if (error) throw new Error(`thread: ${error.message}`);
    if (!c) return null;
    const { data: rows, error: e2 } = await admin().from('generations').select('question, script')
      .eq('conversation_id', conversationId).eq('user_id', userId).in('status', ['succeeded', 'refunded'])
      .is('content_deleted_at', null).not('question', 'is', null).order('created_at', { ascending: false }).limit(THREAD_TURNS);
    if (e2) throw new Error(`thread: ${e2.message}`);
    const turns = (rows ?? []).reverse().map(r => ({ question: r.question as string,
      says: (((r.script as { steps?: { say?: unknown }[] } | null)?.steps) ?? []).map(s => String(s.say ?? '')) }));
    return { subject: c.subject as Thread['subject'], turns };
  },
  attach: (generationId, conversationId, userId) =>
    rpc<boolean>('attach_to_conversation', { p_generation_id: generationId, p_conversation_id: conversationId, p_user_id: userId }),
  explore: (generationId, userId) =>
    rpc<'shown' | 'contact_info' | 'share_limit' | 'not_found'>('explore_on_finish', { p_generation_id: generationId, p_user_id: userId }),
  async approvedDrawings() {
    // ponytail: a 5-minute copy per server instance; an approval shows up within that. Bust it on approve if it matters.
    if (approvedAt > Date.now() - 300_000) return approvedRows;
    approvedRows = await rpc<ApprovedDrawing[]>('approved_drawings', {}) ?? []; approvedAt = Date.now();
    return approvedRows;
  },
  saveDrawings: (generationId, subject, items) =>
    rpc<number>('save_drawing_candidates', { p_generation: generationId, p_subject: subject, p_items: items }),
};
let approvedRows: ApprovedDrawing[] = [], approvedAt = 0;
