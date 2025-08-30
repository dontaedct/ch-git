-- Phase 4 Task 22: Media uploads & storage
-- Creates private storage bucket and media table with RLS

-- 1) Create private storage bucket for media (id/name: 'media')
insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

-- 2) Media table to track uploaded files
create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,
  -- We avoid FK here to prevent coupling issues with current schema drift.
  -- If clients table is stable with uuid PK, add FK:
  -- constraint fk_media_client references clients(id) on delete cascade,
  path text not null,
  filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Update updated_at on change
create or replace function update_media_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_update_media_updated_at on media;
create trigger trg_update_media_updated_at
  before update on media
  for each row execute function update_media_updated_at();

-- Helpful indexes
create index if not exists idx_media_client on media(client_id);
create index if not exists idx_media_created_at on media(created_at);

-- 3) Enable RLS and add policies
alter table media enable row level security;

-- Allow users to insert/select/delete their own media rows based on email->client ownership
-- We consider a user "owns" a client row when their JWT email matches the clients.email
-- (This matches existing guards which rely on email on the clients table.)
drop policy if exists "Users insert own media" on media;
create policy "Users insert own media" on media
  for insert
  with check (
    exists (
      select 1 from clients c
      where c.id = client_id
      and (
        c.email = auth.jwt() ->> 'email' -- client themselves
        or c.coach_id::text = auth.uid()::text -- coach
      )
    )
  );

drop policy if exists "Users select own media" on media;
create policy "Users select own media" on media
  for select using (
    exists (
      select 1 from clients c
      where c.id = client_id
      and (
        c.email = auth.jwt() ->> 'email'
        or c.coach_id::text = auth.uid()::text
      )
    )
  );

drop policy if exists "Users delete own media" on media;
create policy "Users delete own media" on media
  for delete using (
    exists (
      select 1 from clients c
      where c.id = client_id
      and (
        c.email = auth.jwt() ->> 'email'
        or c.coach_id::text = auth.uid()::text
      )
    )
  );

-- Service role full access
drop policy if exists "Service role manage media" on media;
create policy "Service role manage media" on media for all using (auth.role() = 'service_role');

-- 4) Storage policies (keep bucket private; allow service role manage)
-- Note: Signed upload/download flows do not require broad read policies.
-- We restrict direct access and rely on signed URLs.
drop policy if exists "Service role manage storage objects (media)" on storage.objects;
create policy "Service role manage storage objects (media)" on storage.objects
  for all using (
    bucket_id = 'media' and auth.role() = 'service_role'
  );

comment on table media is 'Tracks uploaded files stored in Supabase Storage (bucket: media)';
comment on column media.client_id is 'Owner client id (RLS via clients.email = jwt email)';
comment on column media.path is 'Storage path within media bucket';
