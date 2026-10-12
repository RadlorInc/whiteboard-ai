-- M1 / PLAN.md §6.9 Storage, C35: per-step voice clips at voice/<uid>/<generation_id>/<i>.mp3.
-- There are NO storage policies on purpose: no client reads, uploads, overwrites or deletes anything. The server
-- uploads with the secret key and signs 1-hour URLs for the owner; share pages stream clips through
-- /v/[slug]/audio/[i]. Only audio/mpeg is allowed, so nobody can host HTML on the storage domain.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('voice', 'voice', false, 2097152, array['audio/mpeg']);   -- 60 s at 128 kbps ≈ 0.96 MB
