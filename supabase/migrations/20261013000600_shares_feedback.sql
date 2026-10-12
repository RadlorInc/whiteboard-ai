-- M1 / PLAN.md §5.10, §9.4, §11.10: share links, feedback, reports, support messages.
-- Security change: adds SECURITY DEFINER functions create_share, revoke_share, submit_feedback (authenticated),
-- get_shared_video (anon, authenticated, service_role), submit_report, submit_support_message (service_role),
-- owned by postgres with search_path = ''.

create table public.shares (                             -- revoke deletes the row; a re-share makes a new slug
  slug text primary key check (slug ~ '^[A-Za-z0-9_-]{22}$'),
  generation_id uuid not null unique references public.generations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now());

create table public.video_feedback (generation_id uuid primary key references public.generations(id),
  user_id uuid not null references public.profiles(id) on delete cascade, rating smallint not null check (rating in (-1, 1)),
  reasons text[] not null default '{}' check (reasons <@ array['wrong','unclear','looks_broken','didnt_play','other']),
  note text check (char_length(note) <= 500), created_at timestamptz not null default now(), resolved_at timestamptz,
  resolution text);

create table public.reports (id uuid primary key default gen_random_uuid(), slug text not null,
  reason text not null check (reason in ('wrong','offensive','personal_info','spam','other')),
  note text check (char_length(note) <= 500), ip_hash text not null, created_at timestamptz not null default now(),
  resolved_at timestamptz, resolution text);

create table public.support_messages (id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  email text not null, topic text not null check (topic in ('billing','video','account','other')),
  message text not null check (char_length(message) between 1 and 2000), generation_id uuid,
  created_at timestamptz not null default now(), resolved_at timestamptz);

alter table public.shares           enable row level security;
alter table public.video_feedback   enable row level security;
alter table public.reports          enable row level security;
alter table public.support_messages enable row level security;
revoke all on public.shares, public.video_feedback, public.reports, public.support_messages
  from public, anon, authenticated, service_role;
grant select on public.shares, public.video_feedback to authenticated;
grant select on public.shares, public.video_feedback, public.reports, public.support_messages to service_role;
create policy shares_own on public.shares for select to authenticated
  using (user_id = (select auth.uid()) and (select public.is_live_user()));
create policy video_feedback_own on public.video_feedback for select to authenticated
  using (user_id = (select auth.uid()) and (select public.is_live_user()));

-- §5.10: the question becomes a public H1, og:title and OG image text, so links, emails, @handles and US phone
-- numbers are refused (contact_info). The same patterns are written by hand in checks.mjs (§12.2).
-- Postgres regexes: \y is a word boundary (\b would be a backspace).
create function public._has_contact_info(p_text text) returns boolean
language sql immutable set search_path = '' as $$
  select coalesce(p_text ~* 'https?://' or p_text ~* 'www\.'
      or p_text ~* '\y[a-z0-9_-]+\.(com|net|org|io|ly|gg|xyz|app|co)\y'
      or p_text ~* '[a-z0-9_.+-]+@[a-z0-9-]+\.[a-z0-9.-]+'
      or p_text ~ '@\w{2,}'
      or p_text ~ '\(?\d{3}\)?[ .-]?\d{3}[ .-]\d{4}', false)
$$;

-- 128 random bits from the server; a client never chooses a slug (C25).
create function public._new_slug() returns text
language sql volatile set search_path = '' as $$
  select translate(rtrim(encode(extensions.gen_random_bytes(16), 'base64'), '='), '+/', '-_')
$$;

-- outcome: created | exists | contact_info | share_limit | not_found. slug only for created/exists.
create function public.create_share(p_generation_id uuid) returns table(outcome text, slug text)
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare v_uid uuid := auth.uid(); g public.generations; v_slug text;
begin
  if not public.is_live_user() then raise exception 'not allowed' using errcode = '42501'; end if;
  select * into g from public.generations where id = p_generation_id and user_id = v_uid
     and status in ('succeeded','refunded') and content_deleted_at is null;
  if not found then outcome := 'not_found'; return next; return; end if;
  select s.slug into v_slug from public.shares s where s.generation_id = p_generation_id;
  if found then outcome := 'exists'; slug := v_slug; return next; return; end if;
  if public._has_contact_info(g.question) then outcome := 'contact_info'; return next; return; end if;
  if not public.hit_rate_limit('share:' || v_uid, 86400, 20) then
    outcome := 'share_limit'; return next; return;
  end if;
  v_slug := public._new_slug();
  insert into public.shares (slug, generation_id, user_id) values (v_slug, p_generation_id, v_uid);
  outcome := 'created'; slug := v_slug; return next;
end $$;

create function public.revoke_share(p_generation_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_live_user() then raise exception 'not allowed' using errcode = '42501'; end if;
  delete from public.shares where generation_id = p_generation_id and user_id = auth.uid();
  return found;
end $$;

-- §9.4: anon may call it. The same empty result for not found, revoked and deleted; never the owner's id, the
-- generation id or a Storage path (paths hold the uid; clips stream through /v/[slug]/audio/[i]).
create function public.get_shared_video(p_slug text)
returns table(question text, style text, script jsonb, voice text, clips jsonb, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select g.question, g.style, g.script, g.voice,
         (select jsonb_agg(c - 'path' order by n) from jsonb_array_elements(g.voice_clips) with ordinality x(c, n)),
         g.created_at
    from public.shares s join public.generations g on g.id = s.generation_id
   where p_slug ~ '^[A-Za-z0-9_-]{22}$' and s.slug = p_slug
     and g.status in ('succeeded','refunded') and g.content_deleted_at is null
$$;

-- §11.10, owner only, one row per video (upserted).
create function public.submit_feedback(p_generation_id uuid, p_rating smallint, p_reasons text[], p_note text)
returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_c text;
begin
  if not public.is_live_user() then raise exception 'not allowed' using errcode = '42501'; end if;
  if p_rating is null or p_rating not in (-1, 1) or char_length(p_note) > 500
     or not (coalesce(p_reasons, '{}') <@ array['wrong','unclear','looks_broken','didnt_play','other']) then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  perform 1 from public.generations where id = p_generation_id and user_id = v_uid
     and status in ('succeeded','refunded') and content_deleted_at is null;
  if not found then return false; end if;
  begin
    insert into public.video_feedback as f (generation_id, user_id, rating, reasons, note)
    values (p_generation_id, v_uid, p_rating, coalesce(p_reasons, '{}'), p_note)
    on conflict (generation_id) do update set rating = excluded.rating, reasons = excluded.reasons,
      note = excluded.note, created_at = now(), resolved_at = null, resolution = null
    where f.user_id = v_uid;
  exception when check_violation or not_null_violation or unique_violation then
    get stacked diagnostics v_c = constraint_name;
    raise exception 'rejected:%', v_c using errcode = sqlstate, detail = '';
  end;
  return true;
end $$;

-- §9.4 'ok' | 'rate_limited' | 'invalid'. 5 a day per IP hash (HMAC-SHA256 under RATE_LIMIT_HMAC_KEY).
create function public.submit_report(p_slug text, p_reason text, p_note text, p_ip_hash text) returns text
language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(p_slug, '') !~ '^[A-Za-z0-9_-]{22}$'
     or coalesce(p_reason, '') not in ('wrong','offensive','personal_info','spam','other')
     or char_length(p_note) > 500 or coalesce(p_ip_hash, '') !~ '^[0-9a-f]{64}$' then
    return 'invalid';
  end if;
  if not public.hit_rate_limit('report:' || p_ip_hash, 86400, 5) then return 'rate_limited'; end if;
  insert into public.reports (slug, reason, note, ip_hash) values (p_slug, p_reason, p_note, p_ip_hash);
  return 'ok';
end $$;

-- §11.10 (the route applies contact:<uid-or-ip>, 3 an hour). Returns the message id.
create function public.submit_support_message(p_user_id uuid, p_email text, p_topic text, p_message text,
  p_generation_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_c text;
begin
  if coalesce(char_length(p_email), 0) not between 3 and 320
     or coalesce(p_topic, '') not in ('billing','video','account','other')
     or coalesce(char_length(p_message), 0) not between 1 and 2000 then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  begin
    insert into public.support_messages (user_id, email, topic, message, generation_id)
    values (p_user_id, p_email, p_topic, p_message, p_generation_id) returning id into v_id;
  exception when check_violation or not_null_violation or unique_violation or foreign_key_violation then
    get stacked diagnostics v_c = constraint_name;
    raise exception 'rejected:%', v_c using errcode = sqlstate, detail = '';
  end;
  return v_id;
end $$;

revoke all on function public._has_contact_info(text)                   from public, anon, authenticated, service_role;
revoke all on function public._new_slug()                               from public, anon, authenticated, service_role;
revoke all on function public.create_share(uuid)                        from public, anon, authenticated, service_role;
revoke all on function public.revoke_share(uuid)                        from public, anon, authenticated, service_role;
revoke all on function public.get_shared_video(text)                    from public, anon, authenticated, service_role;
revoke all on function public.submit_feedback(uuid,smallint,text[],text) from public, anon, authenticated, service_role;
revoke all on function public.submit_report(text,text,text,text)        from public, anon, authenticated, service_role;
revoke all on function public.submit_support_message(uuid,text,text,text,uuid) from public, anon, authenticated, service_role;
grant execute on function public.get_shared_video(text)                 to anon, authenticated, service_role;
grant execute on function public.create_share(uuid)                     to authenticated;
grant execute on function public.revoke_share(uuid)                     to authenticated;
grant execute on function public.submit_feedback(uuid,smallint,text[],text) to authenticated;
grant execute on function public.submit_report(text,text,text,text)     to service_role;
grant execute on function public.submit_support_message(uuid,text,text,text,uuid) to service_role;
