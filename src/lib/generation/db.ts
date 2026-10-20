// What the generation server needs from the database. The real one (db-supabase.ts) calls the §6.6 functions with
// the service-role key; tests pass an in-memory fake with the same shape.
import type { Style } from './model';

export type ReserveOutcome = 'reserved' | 'duplicate' | 'no_account' | 'deleted' | 'age_unconfirmed' | 'terms_required'
  | 'access_required' | 'paused' | 'blocked' | 'busy' | 'rate_limited' | 'slow_down' | 'at_capacity' | 'spend_cap' | 'insufficient';
export type Reserve = { outcome: ReserveOutcome; generation_id: string | null; status: string | null; available: number | null; retry_at: string | null };
export type FailCode = 'refusal' | 'decline_unsafe' | 'decline_self_harm' | 'decline_abuse_disclosure' | 'decline_personal_medical'
  | 'decline_not_a_question' | 'check_failed' | 'tool_loop' | 'output_budget' | 'provider_error' | 'provider_config'
  | 'timeout' | 'stale' | 'too_long' | 'empty';
export type Metrics = {
  attempts?: number; repaired?: boolean; misses?: string[]; timings?: Record<string, number>; error_detail?: string;
  refusal_category?: string | null; response_model?: string | null; steps_sent?: number; voice?: 'browser'; clips?: null;
};
export type ModelCall = {
  generation_id: string | null; style: Style; kind: 'round' | 'repair' | 'ping'; round: number | null; prompt_sha: string;
  started_at: string; ttft_ms: number | null; ms: number; stop_reason: string | null; input_tokens: number | null;
  cache_read_tokens: number | null; cache_write_1h_tokens: number | null; output_tokens: number | null;
  cost_usd: number; anthropic_request_id: string | null; raw_text: string | null;
};
export type GenerationRow = {
  id: string; user_id: string; style: Style; status: 'reserved' | 'running' | 'succeeded' | 'failed' | 'refunded';
  stage: string | null; script: unknown; error_code: string | null; credits_charged: number; narration_chars: number;
  created_at: string; question: string | null;
};
export type Subject = 'biology' | 'physics' | 'chemistry' | 'home' | 'car';
// A conversation's subject and its earlier answered questions, oldest first, each with its spoken lines.
export type Thread = { subject: Subject; turns: { question: string; says: string[] }[] };
export type CacheState = { style: Style; prompt_sha: string; last_touch_at: string | null; last_real_at: string | null };

export interface GenDb {
  findByRequest(userId: string, clientRequestId: string): Promise<{ id: string; status: string } | null>;
  findOwned(userId: string, style: Style, questionNorm: string): Promise<{ id: string; created_at: string } | null>;
  reserve(a: { userId: string; clientRequestId: string; style: Style; question: string; buildId: string; promptSha: string; policyVersion: number }): Promise<Reserve>;
  start(id: string): Promise<boolean>;
  setStage(id: string, stage: 'reading' | 'drawings' | 'writing' | 'fixing'): Promise<void>;
  finish(id: string, script: unknown, metrics: Metrics): Promise<{ outcome: 'settled' | 'already_final' | 'too_late' | 'rejected' | 'not_found'; credits_charged: number | null; available: number | null }>;
  fail(id: string, code: FailCode, metrics: Metrics): Promise<{ outcome: 'released' | 'already_final' | 'not_found'; available: number | null }>;
  recordCall(c: ModelCall): Promise<void>;
  getOwn(id: string, userId: string): Promise<GenerationRow | null>;
  expireIfStale(id: string): Promise<string>;
  cacheState(): Promise<CacheState[]>;
  thread(userId: string, conversationId: string): Promise<Thread | null>;
  attach(generationId: string, conversationId: string, userId: string): Promise<boolean>;
  // A finished video goes on Explore (founder, 18 Oct 2026); the share refusals pass through.
  explore(generationId: string, userId: string): Promise<'shown' | 'contact_info' | 'share_limit' | 'not_found'>;
  // Library drawings the model made (19 Oct 2026): approved ones for find_drawing, candidates kept for /admin.
  approvedDrawings?(): Promise<ApprovedDrawing[]>;
  saveDrawings?(generationId: string, subject: Subject | null, items: { name: string; lines: Record<string, string> }[]): Promise<number>;
}
export type ApprovedDrawing = { slug: string; name: string; subject: Subject | null; tags: string[]; data: { w: number; h: number; shapes: unknown[] } };
