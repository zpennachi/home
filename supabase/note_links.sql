-- Create the note_links table for Obsidian-style graph connections
create table if not exists "note_links" (
  id uuid default gen_random_uuid() primary key,
  source_id uuid references notes(id) on delete cascade not null,
  target_id uuid references notes(id) on delete cascade, -- nullable for dangling links
  target_title text not null, -- Stores the actual text used in [[Link]] so we can resolve it later
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table "note_links" enable row level security;

-- Admin Manage Access
create policy "Admin Manage Note Links"
  on "note_links"
  for all
  to authenticated
  using (true)
  with check (true);

-- Create a unique constraint to prevent duplicate links between the same notes
alter table "note_links" 
add constraint "unique_source_target_title" unique (source_id, target_title);
