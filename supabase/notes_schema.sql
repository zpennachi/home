
-- Create the notes table
create table if not exists "notes" (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null default 'Untitled',
  content text not null default '',
  transcript text not null default '',
  ai_summary text,
  folder text,
  is_pinned boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table "notes" enable row level security;

-- Admin-only access (all operations)
create policy "Admin Manage Notes"
  on "notes"
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Simple trigger to handle updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on notes
for each row
execute function handle_updated_at();
