-- Admin flag on profiles + admin-aware RLS so admins can manage any pin.
alter table public.profiles add column if not exists is_admin boolean not null default false;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

drop policy if exists "Users can update their own locations" on public.locations;
create policy "Owners and admins can update locations"
  on public.locations for update
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can delete their own locations" on public.locations;
create policy "Owners and admins can delete locations"
  on public.locations for delete
  to authenticated
  using (auth.uid() = user_id or public.is_admin());
