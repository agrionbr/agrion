-- Roles enum + user_roles table
do $$ begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'user');
  end if;
end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  );
$$;

-- RLS: users can read their own roles; admins can read/manage all
drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

drop policy if exists "user_roles_admin_insert" on public.user_roles;
create policy "user_roles_admin_insert" on public.user_roles
  for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "user_roles_admin_update" on public.user_roles;
create policy "user_roles_admin_update" on public.user_roles
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "user_roles_admin_delete" on public.user_roles;
create policy "user_roles_admin_delete" on public.user_roles
  for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Update handle_new_user to assign roles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare new_farm uuid;
begin
  insert into public.profiles(id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.raw_user_meta_data->>'phone')
  on conflict do nothing;

  insert into public.farms(name, created_by)
  values (coalesce(new.raw_user_meta_data->>'farm_name', 'Minha Fazenda'), new.id)
  returning id into new_farm;

  -- Assign role: admin for the configured email, otherwise standard user
  if lower(new.email) = 'agrionbr@gmail.com' then
    insert into public.user_roles(user_id, role) values (new.id, 'admin')
    on conflict do nothing;
  else
    insert into public.user_roles(user_id, role) values (new.id, 'user')
    on conflict do nothing;
  end if;

  return new;
end$$;

-- Ensure trigger exists on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger to populate farm_members on farm creation (existing function)
drop trigger if exists on_farms_after_insert on public.farms;
create trigger on_farms_after_insert
  after insert on public.farms
  for each row execute function public.on_farm_created();

-- Backfill admin role if the email already exists
insert into public.user_roles(user_id, role)
select u.id, 'admin'::public.app_role
from auth.users u
where lower(u.email) = 'agrionbr@gmail.com'
on conflict do nothing;