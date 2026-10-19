-- Explore by chat (founder, 18 Oct 2026): one Explore item is one chat (its first question is the title, "N videos"),
-- opening it plays its videos in order; standalone videos (asked before chats) are items of one. Search over the
-- questions and narration, a subject filter, and related chats under a shared video.
-- Also: the generation server puts a finished video on Explore itself (explore_on_finish), so a video whose maker
-- closed the tab before it finished still shows; before, the browser asked for it after the "done" event.
-- Security change: adds SECURITY DEFINER explore_on_finish (service_role), explore_feed, explore_series and
-- explore_related (anon, authenticated, service_role), owned by postgres with search_path = ''. They return only
-- what get_shared_video already makes public (slug, question, style, script) plus the chat's subject and count:
-- never an owner, generation or conversation id.

-- create_share + set_explore for the server: same contact-info refusal and 20-a-day share limit, the user is passed in.
-- outcome: shown | contact_info | share_limit | not_found
create function public.explore_on_finish(p_generation_id uuid, p_user_id uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare g public.generations; v_slug text;
begin
  select * into g from public.generations where id = p_generation_id and user_id = p_user_id
     and status in ('succeeded','refunded') and content_deleted_at is null and question is not null;
  if not found then return 'not_found'; end if;
  if not exists (select 1 from public.profiles p where p.id = p_user_id and p.deleted_at is null) then return 'not_found'; end if;
  select s.slug into v_slug from public.shares s where s.generation_id = p_generation_id;
  if not found then
    if public._has_contact_info(g.question) then return 'contact_info'; end if;
    if not public.hit_rate_limit('share:' || p_user_id, 86400, 20) then return 'share_limit'; end if;
    insert into public.shares (slug, generation_id, user_id) values (public._new_slug(), p_generation_id, p_user_id);
  end if;
  update public.shares set explore_at = coalesce(explore_at, clock_timestamp()) where generation_id = p_generation_id;
  return 'shown';
end $$;

-- Every Explore item, newest first: a chat's videos that are on Explore, or one standalone video. Internal (not granted).
-- ponytail: computed on every call, fine for a few thousand videos; past that, keep it in a table with a GIN index.
create function public._explore_items() returns table(
  item uuid, slug text, title text, style text, script jsonb, n integer, subject text, latest timestamptz, doc tsvector)
language sql stable security definer set search_path = '' as $$
  with v as (
    select coalesce(g.conversation_id, g.id) item, s.slug, g.question, g.style, g.script, g.created_at, s.explore_at,
           c.subject,
           coalesce((select string_agg(x->>'say', ' ') from jsonb_array_elements(
             case when jsonb_typeof(g.script->'steps') = 'array' then g.script->'steps'
                  when jsonb_typeof(g.script->'objects') = 'array' then g.script->'objects' else '[]'::jsonb end) x), '') say
      from public.shares s
      join public.generations g on g.id = s.generation_id
      left join public.conversations c on c.id = g.conversation_id
     where s.explore_at is not null and g.status in ('succeeded','refunded') and g.content_deleted_at is null
       and g.question is not null and g.script is not null)
  select distinct on (item) item, slug, question, style, script,
         (count(*) over w)::int, subject, max(explore_at) over w,
         setweight(to_tsvector('english', string_agg(question, ' ') over w), 'A')
           || setweight(to_tsvector('english', string_agg(say, ' ') over w), 'B')
    from v
  window w as (partition by item order by created_at rows between unbounded preceding and unbounded following)
   order by item, created_at
$$;

-- anon may call it. p_q: words to search (empty: everything, newest first); p_subject: biology | physics | chemistry
-- or null; a page of up to 48 from p_offset.
create function public.explore_feed(p_q text, p_subject text, p_offset integer, p_limit integer)
returns table(slug text, title text, style text, script jsonb, n integer, subject text, latest timestamptz)
language sql stable security definer set search_path = '' as $$
  with q as (select nullif(btrim(left(coalesce(p_q, ''), 100)), '') t),
  tq as (select t, case when t is null then null else websearch_to_tsquery('english', t) end query from q)
  select i.slug, i.title, i.style, i.script, i.n, i.subject, i.latest
    from public._explore_items() i, tq
   where (p_subject is null or i.subject = p_subject)
     and (tq.t is null or i.doc @@ tq.query or position(lower(tq.t) in lower(i.title)) > 0)
   order by case when tq.t is null then 0 else ts_rank(i.doc, tq.query) end desc, i.latest desc
   offset greatest(coalesce(p_offset, 0), 0)
   limit least(greatest(coalesce(p_limit, 24), 1), 48)
$$;

-- A shared video and, when it belongs to a chat, the chat's other videos that are on Explore, oldest first. Videos of
-- the chat that were taken off Explore stay out; the opened one shows as long as its link is shared.
create function public.explore_series(p_slug text)
returns table(slug text, question text, style text, script jsonb, subject text)
language sql stable security definer set search_path = '' as $$
  with me as (
    select g.id, g.conversation_id from public.shares s join public.generations g on g.id = s.generation_id
     where s.slug = p_slug and g.status in ('succeeded','refunded') and g.content_deleted_at is null)
  select s.slug, g.question, g.style, g.script, c.subject
    from public.shares s
    join public.generations g on g.id = s.generation_id
    left join public.conversations c on c.id = g.conversation_id
    join me on (g.id = me.id) or (me.conversation_id is not null and g.conversation_id = me.conversation_id and s.explore_at is not null)
   where g.status in ('succeeded','refunded') and g.content_deleted_at is null and g.question is not null and g.script is not null
   order by g.created_at
$$;

-- Other Explore items like this one: any of its title's words in their questions or narration, best first, then the
-- same subject, newest first.
create function public.explore_related(p_slug text, p_limit integer)
returns table(slug text, title text, style text, script jsonb, n integer, subject text, latest timestamptz)
language sql stable security definer set search_path = '' as $$
  with me as (
    select coalesce(g.conversation_id, g.id) item, c.subject, g.question
      from public.shares s join public.generations g on g.id = s.generation_id
      left join public.conversations c on c.id = g.conversation_id
     where s.slug = p_slug),
  words as (
    select to_tsquery('english', string_agg(quote_literal(w), ' | ')) query
      from me, unnest(tsvector_to_array(to_tsvector('english', me.question))) w)
  select i.slug, i.title, i.style, i.script, i.n, i.subject, i.latest
    from public._explore_items() i, me, words
   where i.item <> me.item
   order by coalesce(ts_rank(i.doc, words.query), 0) desc, (i.subject is not distinct from me.subject) desc, i.latest desc
   limit least(greatest(coalesce(p_limit, 6), 1), 12)
$$;

revoke all on function public.explore_on_finish(uuid, uuid)                   from public, anon, authenticated, service_role;
revoke all on function public._explore_items()                                from public, anon, authenticated, service_role;
revoke all on function public.explore_feed(text, text, integer, integer)      from public, anon, authenticated, service_role;
revoke all on function public.explore_series(text)                            from public, anon, authenticated, service_role;
revoke all on function public.explore_related(text, integer)                  from public, anon, authenticated, service_role;
grant execute on function public.explore_on_finish(uuid, uuid)                to service_role;
grant execute on function public.explore_feed(text, text, integer, integer)   to anon, authenticated, service_role;
grant execute on function public.explore_series(text)                         to anon, authenticated, service_role;
grant execute on function public.explore_related(text, integer)               to anon, authenticated, service_role;
