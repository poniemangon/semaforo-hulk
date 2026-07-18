-- Public storage bucket for location photos uploaded from the "+" button.
insert into storage.buckets (id, name, public)
values ('location-images', 'location-images', true)
on conflict (id) do nothing;

create policy "Location images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'location-images');

create policy "Authenticated users can upload location images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'location-images');

create policy "Users can delete their own uploaded location images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'location-images' and owner = auth.uid());
