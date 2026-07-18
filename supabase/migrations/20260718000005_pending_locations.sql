-- Anyone (logged in or not) can propose a location. Logged-in submissions are
-- auto-approved; anonymous ones start pending and only show on the public map
-- once an admin approves them from the control panel.
alter table public.locations add column if not exists approved boolean not null default true;

-- Force user_id/approved from the real auth context — never trust client input for these.
create or replace function public.set_location_approval()
returns trigger
language plpgsql
as $$
begin
  new.user_id := auth.uid();
  new.approved := (auth.uid() is not null);
  return new;
end;
$$;

drop trigger if exists on_location_insert on public.locations;
create trigger on_location_insert
  before insert on public.locations
  for each row execute procedure public.set_location_approval();

drop policy if exists "Authenticated users can insert their own locations" on public.locations;
create policy "Anyone can propose a location"
  on public.locations for insert
  to public
  with check (true);

drop policy if exists "Locations are viewable by everyone" on public.locations;
create policy "Approved locations are public, admins see all"
  on public.locations for select
  using (approved = true or public.is_admin());

-- Anonymous submitters need to be able to attach a photo too.
drop policy if exists "Authenticated users can upload location images" on storage.objects;
create policy "Anyone can upload location images"
  on storage.objects for insert
  to public
  with check (bucket_id = 'location-images');
