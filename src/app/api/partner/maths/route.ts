// POST /api/partner/maths: Radlic's server asks for a child's maths lesson (src/lib/generation/partner.ts).
import { after } from 'next/server';
import { handlePartnerMaths } from '../../../../lib/generation/partner';
import { partnerGate, recordPartnerCall } from '../../../../lib/generation/partner-db';
import { getClient } from '../../../../lib/generation/model';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: Request) {
  return handlePartnerMaths(req, { client: getClient(), gate: partnerGate, record: recordPartnerCall, waitUntil: p => after(() => p) });
}
