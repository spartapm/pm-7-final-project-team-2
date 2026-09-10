export const CATALOG_SQL = `-- 챙겨요 catalog + 삭제율 (accounts/trips 포함)

create table if not exists public.accounts (
  id text primary key,
  personal_items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.trips (
  id text primary key,
  account_id text not null references public.accounts(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists trips_account_id_idx on public.trips (account_id);

create table if not exists public.catalog_items (
  id text primary key,
  name text not null,
  item_desc text,
  purchasable boolean not null default false,
  link_count int not null default 0,
  link_note text
);

create table if not exists public.catalog_links (
  id bigint generated always as identity primary key,
  item_id text not null references public.catalog_items(id) on delete cascade,
  display_order int not null default 0,
  link_type text,
  link_text text,
  link_url text
);

create table if not exists public.catalog_rules (
  id text primary key,
  table_name text not null,
  item_id text not null,
  reason text,
  country_id text,
  companion_id text,
  activity_id text,
  weather_id text,
  temp_band_id text
);

create table if not exists public.item_stats (
  activity_id text not null,
  item_id text not null,
  exposure_count int not null default 0,
  delete_count int not null default 0,
  comment_shown boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (activity_id, item_id)
);

alter table public.accounts enable row level security;
alter table public.trips enable row level security;
alter table public.catalog_items enable row level security;
alter table public.catalog_links enable row level security;
alter table public.catalog_rules enable row level security;
alter table public.item_stats enable row level security;

drop policy if exists "accounts open" on public.accounts;
create policy "accounts open" on public.accounts for all using (true) with check (true);
drop policy if exists "trips open" on public.trips;
create policy "trips open" on public.trips for all using (true) with check (true);
drop policy if exists "catalog_items open" on public.catalog_items;
create policy "catalog_items open" on public.catalog_items for all using (true) with check (true);
drop policy if exists "catalog_links open" on public.catalog_links;
create policy "catalog_links open" on public.catalog_links for all using (true) with check (true);
drop policy if exists "catalog_rules open" on public.catalog_rules;
create policy "catalog_rules open" on public.catalog_rules for all using (true) with check (true);
drop policy if exists "item_stats open" on public.item_stats;
create policy "item_stats open" on public.item_stats for all using (true) with check (true);

grant all on public.accounts to anon, authenticated, service_role;
grant all on public.trips to anon, authenticated, service_role;
grant all on public.catalog_items to anon, authenticated, service_role;
grant all on public.catalog_links to anon, authenticated, service_role;
grant all on public.catalog_rules to anon, authenticated, service_role;
grant all on public.item_stats to anon, authenticated, service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;
`;
