-- Invite credits (founder, 13 Oct 2026): whoever gets access with an invite code gets 100 top-up credits, once.
-- A new ledger kind, invite_grant (top-up only: like a pack, it does not expire), at most one per user (unique
-- index), written only when redeem_invite turns access on for the first time — not for access an admin grants, not
-- again for a second code. Not retroactive: people who redeemed before this get credits from /admin by hand.
-- Security change: redefines the SECURITY DEFINER function redeem_invite (pg_get_functiondef output with two lines
-- added; owner, grants and search_path unchanged by create or replace).

alter table public.credit_ledger drop constraint credit_ledger_kind_check;
alter table public.credit_ledger add constraint credit_ledger_kind_check
  check (kind in ('grant_sub','grant_sub_late','expire_sub','grant_topup','reserve','settle','release','admin_refund',
                  'admin_adjust','clawback','dispute_restore','forfeit','invite_grant'));
alter table public.credit_ledger drop constraint credit_ledger_check1;      -- conservation, per kind (+ invite_grant)
alter table public.credit_ledger add constraint credit_ledger_check1 check (case kind   -- conservation, per kind
    when 'grant_sub'       then sub_delta > 0 and topup_delta = 0 and held_delta = 0 and stripe_ref is not null
    when 'grant_sub_late'  then topup_delta > 0 and sub_delta = 0 and held_delta = 0 and stripe_ref is not null
    when 'expire_sub'      then sub_delta < 0 and topup_delta = 0 and held_delta = 0
    when 'grant_topup'     then topup_delta > 0 and sub_delta = 0 and held_delta = 0 and stripe_ref is not null
    when 'reserve'         then sub_delta <= 0 and topup_delta <= 0 and held_delta = -(sub_delta + topup_delta)
                                and held_delta > 0 and generation_id is not null
    when 'settle'          then held_delta < 0 and sub_delta >= 0 and topup_delta >= 0
                                and sub_delta + topup_delta < -held_delta and generation_id is not null
    when 'release'         then held_delta < 0 and sub_delta >= 0 and topup_delta >= 0
                                and sub_delta + topup_delta = -held_delta and generation_id is not null
    when 'admin_refund'    then topup_delta > 0 and sub_delta = 0 and held_delta = 0
                                and generation_id is not null and admin_audit_id is not null
    when 'admin_adjust'    then sub_delta = 0 and held_delta = 0 and admin_audit_id is not null
    when 'clawback'        then sub_delta <= 0 and topup_delta <= 0 and held_delta = 0 and stripe_ref is not null
    when 'dispute_restore' then topup_delta > 0 and sub_delta = 0 and held_delta = 0 and stripe_ref is not null
    when 'forfeit'         then sub_delta <= 0 and topup_delta <= 0 and held_delta = 0
    when 'invite_grant'    then topup_delta > 0 and sub_delta = 0 and held_delta = 0 end);
create unique index ledger_one_invite on public.credit_ledger (user_id) where kind = 'invite_grant';

CREATE OR REPLACE FUNCTION public.redeem_invite(p_code text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid := auth.uid();
begin
  if not public.is_live_user() then raise exception 'not allowed' using errcode = '42501'; end if;
  perform 1 from public.profiles where id = v_uid and access_granted_at is not null;
  if found then return true; end if;
  if p_code is null or char_length(p_code) not between 1 and 64 then return false; end if;
  update public.invites set used = used + 1 where code = p_code and used < max_uses;
  if not found then return false; end if;
  update public.profiles set access_granted_at = now() where id = v_uid;
  -- Invite credits: 100 top-up credits on first access through an invite (ledger_one_invite: once per user).
  perform public._ledger(v_uid, 'invite_grant', 0, 100, 0);
  return true;
end $function$;
