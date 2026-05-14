
-- ENUMS
create type public.farm_role as enum ('owner','manager','worker');
create type public.animal_sex as enum ('macho','femea');
create type public.animal_status as enum ('ativo','vendido','morto','transferido');
create type public.tx_kind as enum ('receita','despesa');
create type public.task_status as enum ('pendente','concluida','cancelada');
create type public.alert_severity as enum ('info','aviso','critico');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (id = auth.uid());

-- FARMS
create table public.farms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  state text,
  area_ha numeric,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.farms enable row level security;

-- FARM MEMBERS
create table public.farm_members (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.farm_role not null default 'worker',
  created_at timestamptz not null default now(),
  unique(farm_id, user_id)
);
alter table public.farm_members enable row level security;

-- security definer helpers (avoid recursive RLS)
create or replace function public.is_farm_member(_farm uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.farm_members where farm_id = _farm and user_id = _user);
$$;

create or replace function public.farm_role_of(_farm uuid, _user uuid)
returns public.farm_role language sql stable security definer set search_path = public as $$
  select role from public.farm_members where farm_id = _farm and user_id = _user;
$$;

create or replace function public.can_manage_farm(_farm uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.farm_members
    where farm_id = _farm and user_id = _user and role in ('owner','manager')
  );
$$;

-- FARMS policies
create policy "farms_select_member" on public.farms for select to authenticated
  using (public.is_farm_member(id, auth.uid()));
create policy "farms_insert_self" on public.farms for insert to authenticated
  with check (created_by = auth.uid());
create policy "farms_update_manager" on public.farms for update to authenticated
  using (public.can_manage_farm(id, auth.uid()));
create policy "farms_delete_owner" on public.farms for delete to authenticated
  using (public.farm_role_of(id, auth.uid()) = 'owner');

-- FARM MEMBERS policies
create policy "members_select_same_farm" on public.farm_members for select to authenticated
  using (public.is_farm_member(farm_id, auth.uid()));
create policy "members_insert_owner_or_self_first" on public.farm_members for insert to authenticated
  with check (public.can_manage_farm(farm_id, auth.uid()) or user_id = auth.uid());
create policy "members_update_manager" on public.farm_members for update to authenticated
  using (public.can_manage_farm(farm_id, auth.uid()));
create policy "members_delete_owner" on public.farm_members for delete to authenticated
  using (public.farm_role_of(farm_id, auth.uid()) = 'owner');

-- ANIMALS
create table public.animals (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  tag text not null,
  name text,
  breed text,
  sex public.animal_sex not null default 'macho',
  birth_date date,
  entry_date date not null default current_date,
  current_weight_kg numeric,
  lot text,
  origin text,
  status public.animal_status not null default 'ativo',
  notes text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(farm_id, tag)
);
alter table public.animals enable row level security;
create index on public.animals(farm_id);
create index on public.animals(lot);

create policy "animals_select" on public.animals for select to authenticated
  using (public.is_farm_member(farm_id, auth.uid()));
create policy "animals_insert" on public.animals for insert to authenticated
  with check (public.can_manage_farm(farm_id, auth.uid()));
create policy "animals_update" on public.animals for update to authenticated
  using (public.can_manage_farm(farm_id, auth.uid()));
create policy "animals_delete" on public.animals for delete to authenticated
  using (public.can_manage_farm(farm_id, auth.uid()));

-- WEIGHINGS
create table public.weighings (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  animal_id uuid not null references public.animals(id) on delete cascade,
  weight_kg numeric not null,
  weighed_at date not null default current_date,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.weighings enable row level security;
create index on public.weighings(animal_id);
create index on public.weighings(farm_id);

create policy "weighings_select" on public.weighings for select to authenticated
  using (public.is_farm_member(farm_id, auth.uid()));
create policy "weighings_insert" on public.weighings for insert to authenticated
  with check (public.can_manage_farm(farm_id, auth.uid()));
create policy "weighings_update" on public.weighings for update to authenticated
  using (public.can_manage_farm(farm_id, auth.uid()));
create policy "weighings_delete" on public.weighings for delete to authenticated
  using (public.can_manage_farm(farm_id, auth.uid()));

-- VACCINATIONS
create table public.vaccinations (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  animal_id uuid references public.animals(id) on delete cascade,
  lot text,
  product text not null,
  dose text,
  applied_at date,
  scheduled_at date,
  applied boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.vaccinations enable row level security;
create index on public.vaccinations(farm_id);

create policy "vacc_select" on public.vaccinations for select to authenticated
  using (public.is_farm_member(farm_id, auth.uid()));
create policy "vacc_insert" on public.vaccinations for insert to authenticated
  with check (public.can_manage_farm(farm_id, auth.uid()));
create policy "vacc_update" on public.vaccinations for update to authenticated
  using (public.can_manage_farm(farm_id, auth.uid()));
create policy "vacc_delete" on public.vaccinations for delete to authenticated
  using (public.can_manage_farm(farm_id, auth.uid()));

-- TRANSACTIONS
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  kind public.tx_kind not null,
  category text not null,
  description text,
  amount numeric not null,
  occurred_at date not null default current_date,
  lot text,
  animal_id uuid references public.animals(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.transactions enable row level security;
create index on public.transactions(farm_id, occurred_at);

create policy "tx_select" on public.transactions for select to authenticated
  using (public.is_farm_member(farm_id, auth.uid()));
create policy "tx_insert" on public.transactions for insert to authenticated
  with check (public.can_manage_farm(farm_id, auth.uid()));
create policy "tx_update" on public.transactions for update to authenticated
  using (public.can_manage_farm(farm_id, auth.uid()));
create policy "tx_delete" on public.transactions for delete to authenticated
  using (public.can_manage_farm(farm_id, auth.uid()));

-- TASKS
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid references auth.users(id),
  due_date date,
  status public.task_status not null default 'pendente',
  notes text,
  photo_url text,
  completed_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.tasks enable row level security;
create index on public.tasks(farm_id);

create policy "tasks_select" on public.tasks for select to authenticated
  using (public.is_farm_member(farm_id, auth.uid()));
create policy "tasks_insert" on public.tasks for insert to authenticated
  with check (public.can_manage_farm(farm_id, auth.uid()));
create policy "tasks_update_member" on public.tasks for update to authenticated
  using (public.is_farm_member(farm_id, auth.uid()));
create policy "tasks_delete" on public.tasks for delete to authenticated
  using (public.can_manage_farm(farm_id, auth.uid()));

-- ALERTS
create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  title text not null,
  message text,
  severity public.alert_severity not null default 'info',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.alerts enable row level security;
create index on public.alerts(farm_id, created_at desc);

create policy "alerts_select" on public.alerts for select to authenticated
  using (public.is_farm_member(farm_id, auth.uid()));
create policy "alerts_insert" on public.alerts for insert to authenticated
  with check (public.can_manage_farm(farm_id, auth.uid()));
create policy "alerts_update" on public.alerts for update to authenticated
  using (public.is_farm_member(farm_id, auth.uid()));
create policy "alerts_delete" on public.alerts for delete to authenticated
  using (public.can_manage_farm(farm_id, auth.uid()));

-- TRIGGER: when farm is created, add creator as owner member
create or replace function public.on_farm_created()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.farm_members(farm_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict do nothing;
  return new;
end$$;
create trigger trg_farm_created after insert on public.farms
for each row execute function public.on_farm_created();

-- TRIGGER: on signup, create profile + initial farm
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare new_farm uuid;
begin
  insert into public.profiles(id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.raw_user_meta_data->>'phone')
  on conflict do nothing;

  insert into public.farms(name, created_by)
  values (coalesce(new.raw_user_meta_data->>'farm_name', 'Minha Fazenda'), new.id)
  returning id into new_farm;

  return new;
end$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end$$;

create trigger t_profiles_upd before update on public.profiles for each row execute function public.touch_updated_at();
create trigger t_farms_upd before update on public.farms for each row execute function public.touch_updated_at();
create trigger t_animals_upd before update on public.animals for each row execute function public.touch_updated_at();
