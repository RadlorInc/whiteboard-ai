-- Explore (founder, 13 Oct 2026): a public feed, open without signing in, of the videos their makers chose to show
-- ("Show in Explore", ticked by default on /ask; 13–17 included). An Explore item IS a share — the same public
-- /v/[slug] page, the same contact-info refusal and daily limit — with explore_at set. Everything that removes a
-- share removes it from Explore too: revoke_share, delete_my_video, admin_unpublish_share, account deletion.
-- Security change: adds SECURITY DEFINER functions set_explore (authenticated) and explore_list (anon,
-- authenticated, service_role), owned by postgres with search_path = ''.

alter table public.shares add column explore_at timestamptz;     -- null: not in Explore
create index shares_explore on public.shares (explore_at desc) where explore_at is not null;

-- outcome: shown | removed | contact_info | share_limit | not_found (create_share's refusals pass through).
-- Showing makes the share if there is none; removing keeps the share link working.
create function public.set_explore(p_generation_id uuid, p_on boolean) returns table(outcome text, slug text)
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare v_uid uuid := auth.uid(); r record;
begin
  if not public.is_live_user() then raise exception 'not allowed' using errcode = '42501'; end if;
  if not coalesce(p_on, false) then
    update public.shares set explore_at = null where generation_id = p_generation_id and user_id = v_uid;
    outcome := case when found then 'removed' else 'not_found' end; return next; return;
  end if;
  select * into r from public.create_share(p_generation_id);
  if r.outcome not in ('created', 'exists') then outcome := r.outcome; return next; return; end if;
  -- clock_timestamp, not now(): two videos shown in one transaction must still order and page apart
  update public.shares set explore_at = coalesce(explore_at, clock_timestamp())
   where generation_id = p_generation_id and user_id = v_uid;
  outcome := 'shown'; slug := r.slug; return next;
end $$;

-- anon may call it. Newest first, a page at a time (p_before = the last explore_at seen). Never the owner's id or
-- the generation id; only live videos that still have their question.
create function public.explore_list(p_before timestamptz, p_limit integer)
returns table(slug text, question text, style text, explore_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select s.slug, g.question, g.style, s.explore_at
    from public.shares s join public.generations g on g.id = s.generation_id
   where s.explore_at is not null and (p_before is null or s.explore_at < p_before)
     and g.status in ('succeeded','refunded') and g.content_deleted_at is null and g.question is not null
   order by s.explore_at desc
   limit least(greatest(coalesce(p_limit, 24), 1), 48)
$$;

revoke all on function public.set_explore(uuid, boolean)              from public, anon, authenticated, service_role;
revoke all on function public.explore_list(timestamptz, integer)      from public, anon, authenticated, service_role;
grant execute on function public.set_explore(uuid, boolean)           to authenticated;
grant execute on function public.explore_list(timestamptz, integer)   to anon, authenticated, service_role;
