-- 챙겨요: 일정 공유 링크가 계정처럼 동작하도록 계정 단위로 저장합니다.
-- Supabase Dashboard → SQL Editor 에 붙여넣고 Run 한 번이면 됩니다.

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

alter table public.accounts enable row level security;
alter table public.trips enable row level security;

drop policy if exists "accounts open" on public.accounts;
create policy "accounts open" on public.accounts
  for all using (true) with check (true);

drop policy if exists "trips open" on public.trips;
create policy "trips open" on public.trips
  for all using (true) with check (true);

grant all on public.accounts to anon, authenticated, service_role;
grant all on public.trips to anon, authenticated, service_role;
