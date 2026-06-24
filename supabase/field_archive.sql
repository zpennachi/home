-- Create the field_archive table
create table if not exists "field_archive" (
  id uuid default gen_random_uuid() primary key,
  title text not null default 'Untitled',
  media_type text not null, -- 'audio', 'video', 'photo', '3d'
  file_url text not null,
  location_lat numeric,
  location_lng numeric,
  date_captured timestamp with time zone,
  category text, -- e.g., 'bird chirp', 'wind'
  species text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table "field_archive" enable row level security;

-- Public Read Access
create policy "Public Field Archive Access"
  on "field_archive"
  for select
  to public
  using (true);

-- Admin Manage Access
create policy "Admin Manage Field Archive"
  on "field_archive"
  for all
  to authenticated
  using (true)
  with check (true);

-- Storage bucket for field archive media
insert into storage.buckets (id, name, public) 
values ('archive_media', 'archive_media', true)
on conflict (id) do nothing;

-- Storage policies for the bucket
create policy "Public Access to Archive Media"
  on storage.objects for select
  to public
  using ( bucket_id = 'archive_media' );

create policy "Admin Manage Archive Media"
  on storage.objects for all
  to authenticated
  using ( bucket_id = 'archive_media' )
  with check ( bucket_id = 'archive_media' );
