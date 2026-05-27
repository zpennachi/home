
-- Insert a new storage bucket for 'work' assets
insert into storage.buckets (id, name, public)
values ('work', 'work', true)
on conflict (id) do nothing;

-- Allow public access to read files
create policy "Public Work Access"
  on storage.objects for select
  to public
  using ( bucket_id = 'work' );

-- Allow authenticated users to upload/delete files
create policy "Admin Manage Work"
  on storage.objects for all
  to authenticated
  using ( bucket_id = 'work' )
  with check ( bucket_id = 'work' );
