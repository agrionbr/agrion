
-- Segmentos ativos por fazenda
create type public.farm_segment as enum ('pecuaria', 'graos');

alter table public.farms
  add column if not exists segments public.farm_segment[] not null default array['pecuaria']::public.farm_segment[];

-- Enums grãos
create type public.crop_kind as enum ('soja','milho','trigo','algodao','feijao','arroz','sorgo','girassol','outro');
create type public.season_status as enum ('planejado','plantado','em_desenvolvimento','colhido','encerrado');
create type public.application_kind as enum ('fertilizante','defensivo','semente','calcario','foliar','outro');

-- Talhões
create table public.plots (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  name text not null,
  area_ha numeric not null check (area_ha > 0),
  current_crop public.crop_kind,
  soil_type text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.plots(farm_id);
alter table public.plots enable row level security;
create policy plots_select on public.plots for select to authenticated using (public.is_farm_member(farm_id, auth.uid()));
create policy plots_insert on public.plots for insert to authenticated with check (public.can_manage_farm(farm_id, auth.uid()));
create policy plots_update on public.plots for update to authenticated using (public.can_manage_farm(farm_id, auth.uid()));
create policy plots_delete on public.plots for delete to authenticated using (public.can_manage_farm(farm_id, auth.uid()));
create trigger plots_touch before update on public.plots for each row execute function public.touch_updated_at();

-- Safras
create table public.crop_seasons (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  plot_id uuid references public.plots(id) on delete set null,
  name text not null,
  crop public.crop_kind not null,
  variety text,
  planted_at date,
  expected_harvest_at date,
  harvested_at date,
  status public.season_status not null default 'planejado',
  area_ha numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.crop_seasons(farm_id);
alter table public.crop_seasons enable row level security;
create policy seasons_select on public.crop_seasons for select to authenticated using (public.is_farm_member(farm_id, auth.uid()));
create policy seasons_insert on public.crop_seasons for insert to authenticated with check (public.can_manage_farm(farm_id, auth.uid()));
create policy seasons_update on public.crop_seasons for update to authenticated using (public.can_manage_farm(farm_id, auth.uid()));
create policy seasons_delete on public.crop_seasons for delete to authenticated using (public.can_manage_farm(farm_id, auth.uid()));
create trigger seasons_touch before update on public.crop_seasons for each row execute function public.touch_updated_at();

-- Aplicações
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  plot_id uuid references public.plots(id) on delete set null,
  season_id uuid references public.crop_seasons(id) on delete set null,
  kind public.application_kind not null,
  product text not null,
  dose text,
  quantity numeric,
  unit text,
  cost numeric,
  applied_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);
create index on public.applications(farm_id);
alter table public.applications enable row level security;
create policy app_select on public.applications for select to authenticated using (public.is_farm_member(farm_id, auth.uid()));
create policy app_insert on public.applications for insert to authenticated with check (public.can_manage_farm(farm_id, auth.uid()));
create policy app_update on public.applications for update to authenticated using (public.can_manage_farm(farm_id, auth.uid()));
create policy app_delete on public.applications for delete to authenticated using (public.can_manage_farm(farm_id, auth.uid()));

-- Colheitas
create table public.harvests (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  plot_id uuid references public.plots(id) on delete set null,
  season_id uuid references public.crop_seasons(id) on delete set null,
  harvested_at date not null default current_date,
  bags numeric not null check (bags >= 0),
  bag_weight_kg numeric not null default 60,
  moisture_pct numeric,
  area_ha numeric,
  notes text,
  created_at timestamptz not null default now()
);
create index on public.harvests(farm_id);
alter table public.harvests enable row level security;
create policy harv_select on public.harvests for select to authenticated using (public.is_farm_member(farm_id, auth.uid()));
create policy harv_insert on public.harvests for insert to authenticated with check (public.can_manage_farm(farm_id, auth.uid()));
create policy harv_update on public.harvests for update to authenticated using (public.can_manage_farm(farm_id, auth.uid()));
create policy harv_delete on public.harvests for delete to authenticated using (public.can_manage_farm(farm_id, auth.uid()));
