-- Cost per video by prompt version (founder, 18 Oct 2026): did a change (new drawings, a new prompt, follow-ups) make
-- videos dearer or slower? Each prompt change gets a new prompt_sha, so each row is one version of one prompt, oldest
-- first. Finished videos only; the prototype import is left out. Runs as is in the Supabase SQL editor (production)
-- and locally with: npm run cost
with per_video as (
  select g.id, g.style, g.prompt_sha, g.created_at, g.conversation_id is not null as follow_up_chat,
         extract(epoch from (g.finished_at - g.started_at)) as secs,
         sum(c.cost_usd) as cost,
         sum(coalesce(c.cache_write_1h_tokens, 0)) > 0 as cold,
         sum(c.input_tokens) as input_tokens, sum(c.output_tokens) as output_tokens
    from public.generations g
    join public.generation_calls c on c.generation_id = g.id
   where g.status in ('succeeded', 'refunded')
     and g.build_id is distinct from 'prototype-import-2026-10-13'
   group by g.id
)
select left(prompt_sha, 8)                                                    as prompt,
       min(created_at)::date                                                  as first_used,
       count(*)                                                               as videos,
       count(*) filter (where cold)                                           as cold_cache,
       round(avg(cost)::numeric, 4)                                           as avg_usd,
       round(avg(cost) filter (where not cold)::numeric, 4)                   as avg_warm_usd,
       round(percentile_cont(0.5) within group (order by cost)::numeric, 4)   as median_usd,
       round(max(cost)::numeric, 4)                                           as max_usd,
       round(avg(input_tokens))                                               as avg_in_tokens,
       round(avg(output_tokens))                                              as avg_out_tokens,
       round(avg(secs)::numeric, 1)                                           as avg_seconds,
       count(*) filter (where follow_up_chat)                                 as in_chats
  from per_video
 group by prompt_sha
 order by min(created_at);
