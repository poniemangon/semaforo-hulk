-- Locations table: map pins with coordinates, a name and a photo.
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  lat double precision not null,
  lng double precision not null,
  location_name text not null,
  location_image text,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists locations_lat_lng_idx on public.locations (lat, lng);

alter table public.locations enable row level security;

-- The map is public: anyone (even signed-out visitors) can see the pins.
create policy "Locations are viewable by everyone"
  on public.locations for select
  using (true);

-- Only signed-in users can drop new pins, and only as themselves.
create policy "Authenticated users can insert their own locations"
  on public.locations for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own locations"
  on public.locations for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own locations"
  on public.locations for delete
  to authenticated
  using (auth.uid() = user_id);
