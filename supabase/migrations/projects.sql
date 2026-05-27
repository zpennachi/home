
-- Projects Table
drop table if exists projects;
create table projects (
  id text primary key, -- slug
  title text not null,
  category text not null,
  medium text not null,
  description text,
  content text, -- markdown
  stack text[],
  repo text,
  images text[],
  branding jsonb,
  status text default 'published',
  source text default 'supabase',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table projects enable row level security;

-- Public Read
create policy "Public Projects Access"
  on projects
  for select
  to public
  using (true);

-- Admin Write
create policy "Admin Manage Projects"
  on projects
  for all
  to authenticated
  using (true)
  with check (true);
