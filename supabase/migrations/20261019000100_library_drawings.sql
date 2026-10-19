-- Library drawings the model made (founder, 19 Oct 2026): when a lesson draws something the library lacks, its parts
-- (els named new_<name>_<part>) are kept here as a candidate; an admin previews it on /admin and approves it (it then
-- becomes a realistic-style "sv id=<slug>" drawing that find_drawing returns) or rejects it. Drawings, not people:
-- only path/circle/ellipse/rect/line lines are kept, never words.
-- Security change: adds the table (RLS on, no policies, SELECT for service_role only; writes go through the DEFINER
-- functions below),
-- save_drawing_candidates + approved_drawings (service_role), admin_list_drawings + admin_review_drawing (authenticated,
-- is_admin()/aal2 first, the review audited as 'review_drawing').

create table public.library_drawings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  generation_id uuid references public.generations(id) on delete set null,
  subject text check (subject in ('biology','physics','chemistry')),
  name text not null check (name ~ '^[a-z]{2,30}$'),
  lines jsonb not null check (jsonb_typeof(lines) = 'object' and pg_column_size(lines) < 200000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  slug text unique check (slug ~ '^[a-z0-9-]{1,60}$'),
  tags text[] not null default '{}' check (cardinality(tags) <= 12),
  data jsonb check (data is null or (jsonb_typeof(data) = 'object' and pg_column_size(data) < 400000)),
  reviewed_at timestamptz,
  check (status <> 'approved' or (slug is not null and data is not null))
);
create index library_drawings_status on public.library_drawings (status, created_at);
alter table public.library_drawings enable row level security;
revoke all on public.library_drawings from public, anon, authenticated, service_role;
grant select on public.library_drawings to service_role;

alter table public.admin_audit drop constraint admin_audit_action_check;
alter table public.admin_audit add constraint admin_audit_action_check check (action in ('grant_credits','revoke_credits',
  'refund_generation','set_flags','clear_flags','unpublish_share','set_settings','view_generation','resolve_report',
  'delete_user','resolve_stripe_event','beta_allow','change_email','grant_access','dispute_evidence','review_drawing'));

-- The generation server, after a video is saved: p_items = [{name, lines: {id: line}}]. At most 3 a video, and a name
-- that already has 3 waiting (or one approved) is skipped. Returns how many were kept.
create function public.save_drawing_candidates(p_generation uuid, p_subject text, p_items jsonb) returns int
language plpgsql security definer set search_path = '' as $$
declare v_item jsonb; v_n int := 0; v_name text;
begin
  if jsonb_typeof(p_items) <> 'array' then raise exception 'rejected:invalid_input' using errcode = '22023'; end if;
  for v_item in select value from jsonb_array_elements(p_items) limit 3 loop
    v_name := v_item ->> 'name';
    if v_name !~ '^[a-z]{2,30}$' or jsonb_typeof(v_item -> 'lines') <> 'object' then continue; end if;
    if exists (select 1 from public.library_drawings where name = v_name and status = 'approved')
       or (select count(*) from public.library_drawings where name = v_name and status = 'pending') >= 3 then continue; end if;
    insert into public.library_drawings (generation_id, subject, name, lines)
      values (p_generation, case when p_subject in ('biology','physics','chemistry') then p_subject end, v_name, v_item -> 'lines');
    v_n := v_n + 1;
  end loop;
  return v_n;
end $$;

create function public.approved_drawings() returns table(slug text, name text, subject text, tags text[], data jsonb)
language sql stable security definer set search_path = '' as $$
  select d.slug, d.name, d.subject, d.tags, d.data from public.library_drawings d where d.status = 'approved' order by d.slug
$$;

create function public.admin_list_drawings(p_status text default 'pending', p_limit int default 30)
returns table(id uuid, created_at timestamptz, subject text, name text, lines jsonb, status text, slug text, tags text[])
language plpgsql stable security definer set search_path = '' as $$
#variable_conflict use_column
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  return query select d.id, d.created_at, d.subject, d.name, d.lines, d.status, d.slug, d.tags from public.library_drawings d
    where d.status = coalesce(p_status, 'pending') order by d.created_at desc limit least(greatest(coalesce(p_limit, 30), 1), 100);
end $$;

-- Approve (p_data = the drawing normalised by the app from its stored lines, under p_slug) or reject (p_slug, p_data null).
create function public.admin_review_drawing(p_id uuid, p_approve boolean, p_slug text, p_tags text[], p_data jsonb,
  p_reason text, p_request_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  perform public._admin_check(p_reason);
  if p_id is null or p_approve is null or p_request_id is null
     or (p_approve and (coalesce(p_slug, '') !~ '^[a-z0-9-]{1,60}$' or p_data is null or jsonb_typeof(p_data) <> 'object')) then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  if exists (select 1 from public.admin_audit where request_id = p_request_id) then return true; end if;
  if p_approve and exists (select 1 from public.library_drawings where slug = p_slug and id <> p_id) then
    raise exception 'rejected:slug_taken' using errcode = '23505';
  end if;
  update public.library_drawings set status = case when p_approve then 'approved' else 'rejected' end,
    slug = case when p_approve then p_slug end, tags = case when p_approve then coalesce(p_tags[1:12], '{}') else tags end,
    data = case when p_approve then p_data end, reviewed_at = now()
   where id = p_id and status = 'pending';
  if not found then return false; end if;
  perform public._audit('review_drawing', null, 'drawing:' || p_id, null, p_request_id, p_reason,
                        jsonb_build_object('approved', p_approve, 'slug', p_slug));
  return true;
end $$;

revoke all on function public.save_drawing_candidates(uuid,text,jsonb) from public, anon, authenticated, service_role;
revoke all on function public.approved_drawings()                      from public, anon, authenticated, service_role;
revoke all on function public.admin_list_drawings(text,int)            from public, anon, authenticated, service_role;
revoke all on function public.admin_review_drawing(uuid,boolean,text,text[],jsonb,text,uuid) from public, anon, authenticated, service_role;
grant execute on function public.save_drawing_candidates(uuid,text,jsonb) to service_role;
grant execute on function public.approved_drawings()                      to service_role;
grant execute on function public.admin_list_drawings(text,int)            to authenticated;
grant execute on function public.admin_review_drawing(uuid,boolean,text,text[],jsonb,text,uuid) to authenticated;
