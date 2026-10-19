-- Conversations (founder, 18 Oct 2026): a chat of videos. Each follow-up question in a conversation is answered by
-- a new video made with the earlier questions and their narration as context. A conversation keeps only its owner and
-- subject; its title is its first question, read from generations, so account deletion's existing scrub of
-- generations.question already covers it and nothing here holds user text.

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  subject text not null check (subject in ('biology','physics','chemistry')),
  created_at timestamptz not null default now());
create index conversations_user_recent on public.conversations (user_id, created_at desc);

alter table public.generations add column conversation_id uuid references public.conversations(id);
create index generations_conversation on public.generations (conversation_id, created_at) where conversation_id is not null;

-- RLS on, SELECT only for the owner (§6.9); writes go through the two functions below.
alter table public.conversations enable row level security;
revoke all on public.conversations from public, anon, authenticated, service_role;
grant select on public.conversations to authenticated, service_role;
create policy conversations_own on public.conversations for select to authenticated
  using (user_id = (select auth.uid()) and (select public.is_live_user()));

-- The signed-in user starts a conversation. At most 60 an hour, so a loop cannot fill the table.
create function public.create_conversation(p_subject text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not public.is_live_user() then raise exception 'not allowed' using errcode = '42501'; end if;
  if (select count(*) from public.conversations where user_id = auth.uid() and created_at > now() - interval '1 hour') >= 60 then
    raise exception 'too many conversations' using errcode = '54000';
  end if;
  insert into public.conversations (user_id, subject) values (auth.uid(), p_subject) returning id into v_id;
  return v_id;
end $$;
revoke all on function public.create_conversation(text) from public, anon, authenticated, service_role;
grant execute on function public.create_conversation(text) to authenticated;

-- The generation server (service role) files a just-reserved video under a conversation: both must belong to the
-- same user, and a video is filed once.
create function public.attach_to_conversation(p_generation_id uuid, p_conversation_id uuid, p_user_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  update public.generations g set conversation_id = p_conversation_id
   where g.id = p_generation_id and g.user_id = p_user_id and g.conversation_id is null
     and exists (select 1 from public.conversations c where c.id = p_conversation_id and c.user_id = p_user_id);
  return found;
end $$;
revoke all on function public.attach_to_conversation(uuid, uuid, uuid) from public, anon, authenticated, service_role;
grant execute on function public.attach_to_conversation(uuid, uuid, uuid) to service_role;
