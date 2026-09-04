"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";

const SQL = `create table if not exists public.accounts (
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
create policy "accounts open" on public.accounts for all using (true) with check (true);

drop policy if exists "trips open" on public.trips;
create policy "trips open" on public.trips for all using (true) with check (true);

grant all on public.accounts to anon, authenticated, service_role;
grant all on public.trips to anon, authenticated, service_role;`;

export function CloudBanner() {
  const { cloudStatus } = useStore();
  const [copied, setCopied] = useState(false);
  if (cloudStatus !== "missing-table") return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 393,
        zIndex: 60,
        background: "#1F3D88",
        color: "#fff",
        padding: "12px 16px",
        fontSize: 12,
        lineHeight: "16px",
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Supabase 테이블이 아직 없습니다</div>
      <div style={{ opacity: 0.9, marginBottom: 8 }}>
        <a
          href="https://supabase.com/dashboard/project/vsvlniwtfnjhqonsbldc/sql/new"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#fff", textDecoration: "underline" }}
        >
          SQL Editor 열기
        </a>
        에 SQL을 붙여넣고 Run 한 번이면 일정 공유가 기기 간에 동작합니다. URL과 publishable key만으로는 테이블을 만들 수 없습니다.
      </div>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(SQL).catch(() => undefined);
          setCopied(true);
        }}
        style={{
          border: "none",
          background: "#368FFF",
          color: "#fff",
          height: 32,
          padding: "0 12px",
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 12,
        }}
      >
        {copied ? "복사됨" : "SQL 복사"}
      </button>
    </div>
  );
}
