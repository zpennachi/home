
-- Create the table for 365 dailies
create table if not exists "365" (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  medium text not null,
  file text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table "365" enable row level security;

-- Create a policy that allows anyone to read (public portfolio)
create policy "Public 365 Access"
  on "365"
  for select
  to public
  using (true);

-- Create a policy that allows only authenticated users (admins) to insert/update/delete
create policy "Admin Manage 365"
  on "365"
  for all
  to authenticated
  using (true)
  with check (true);
