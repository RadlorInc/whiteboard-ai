-- Explore shows study lessons only (founder, 26 Oct 2026): videos from Home and Car chats leave the feed and the
-- "related" lists (both read _explore_items). Nothing is deleted: their share links still open (explore_series), and
-- the owners keep them in their library. Only this filter is new; the function is otherwise as in 20261018000200.
create or replace function public._explore_items() returns table(
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
       and g.question is not null and g.script is not null
       and (c.subject is null or c.subject not in ('home','car')))   -- the everyday fixes left Explore (26 Oct 2026)
  select distinct on (item) item, slug, question, style, script,
         (count(*) over w)::int, subject, max(explore_at) over w,
         setweight(to_tsvector('english', string_agg(question, ' ') over w), 'A')
           || setweight(to_tsvector('english', string_agg(say, ' ') over w), 'B')
    from v
  window w as (partition by item order by created_at rows between unbounded preceding and unbounded following)
   order by item, created_at
$$;
