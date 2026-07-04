-- Add a 'tags' column to the notes table to store AI-generated topics
alter table "notes"
add column if not exists "tags" jsonb default '[]'::jsonb;
