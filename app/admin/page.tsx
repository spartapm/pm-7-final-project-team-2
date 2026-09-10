"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ACTIVITIES } from "@/lib/catalog";
import { CATALOG_SQL } from "@/lib/catalogSchema";
import { getLiveCatalog, loadCatalogFromCloud, seedCatalog, subscribeCatalog } from "@/lib/liveCatalog";
import { saveStat } from "@/lib/stats";
import { getSupabase } from "@/lib/supabase";

type Tab = "stats" | "items" | "rules";

export default function AdminPage() {
  const [, bump] = useState(0);
  const [tab, setTab] = useState<Tab>("stats");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const live = getLiveCatalog();

  useEffect(() => subscribeCatalog(() => bump((n) => n + 1)), []);
  useEffect(() => {
    loadCatalogFromCloud();
  }, []);

  return (
    <div style={{ height: "100dvh", background: "#F2F2F2", overflow: "auto" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 20px 80px", fontFamily: "Pretendard, sans-serif" }}>
        <h1 style={{ fontSize: 24, margin: "0 0 8px" }}>챙겨요 어드민</h1>
        <p style={{ color: "#666", margin: "0 0 20px", lineHeight: 1.5 }}>
          아이템·규칙·삭제율을 Supabase에서 바로 고칩니다. 테이블과 CSV 시드는 이미 올라가 있습니다. 삭제율 숫자를 고친 뒤 저장하면 체크리스트 편집 모드에 바로 반영됩니다.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <button style={btn} onClick={() => navigator.clipboard.writeText(CATALOG_SQL)}>
            SQL 복사
          </button>
          <button
            style={btnPrimary}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const res = await seedCatalog();
              setMsg(res.message);
              setBusy(false);
            }}
          >
            CSV 시드 올리기
          </button>
          <a href="https://supabase.com/dashboard/project/vsvlniwtfnjhqonsbldc/sql/new" target="_blank" rel="noreferrer" style={{ ...btn, textDecoration: "none" }}>
            SQL Editor
          </a>
        </div>
        {msg ? <div style={{ marginBottom: 16, color: "#1F3D88" }}>{msg}</div> : null}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["stats", "items", "rules"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={tab === t ? tabOn : tabOff}>
              {t === "stats" ? "삭제율" : t === "items" ? "아이템" : "규칙"}
            </button>
          ))}
        </div>
        {tab === "stats" ? <StatsPanel /> : null}
        {tab === "items" ? <ItemsPanel items={live.items} /> : null}
        {tab === "rules" ? <RulesPanel /> : null}
      </div>
    </div>
  );
}

function StatsPanel() {
  const live = getLiveCatalog();
  const activityItems = useMemo(() => {
    const rows: { activityId: string; itemId: string; name: string }[] = [];
    for (const r of live.rules) {
      if (r.table !== "activity" || !r.activityId) continue;
      rows.push({ activityId: r.activityId, itemId: r.itemId, name: r.name });
    }
    return rows;
  }, [live.rules]);

  const [activityId, setActivityId] = useState(ACTIVITIES[0]?.id ?? "photo");
  const filtered = activityItems.filter((r) => r.activityId === activityId);

  return (
    <div>
      <p style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>
        편집모드 코멘트는 활동 아이템만, 노출 30건 이상 + 삭제율 70% 이상일 때 뜹니다. 숫자를 직접 넣으면 바로 확인할 수 있습니다.
      </p>
      <label style={{ display: "block", margin: "12px 0" }}>
        활동{" "}
        <select value={activityId} onChange={(e) => setActivityId(e.target.value as typeof activityId)} style={input}>
          {ACTIVITIES.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((row) => {
          const stat = live.stats.find((s) => s.activityId === row.activityId && s.itemId === row.itemId);
          const exposure = stat?.exposure ?? 0;
          const deletes = stat?.deletes ?? 0;
          const rate = exposure ? deletes / exposure : 0;
          return (
            <StatRow
              key={row.activityId + row.itemId}
              name={row.name}
              activityId={row.activityId}
              itemId={row.itemId}
              exposure={exposure}
              deletes={deletes}
              shown={stat?.shown ?? false}
              rate={rate}
            />
          );
        })}
      </div>
    </div>
  );
}

function StatRow({
  name,
  activityId,
  itemId,
  exposure,
  deletes,
  shown,
  rate,
}: {
  name: string;
  activityId: string;
  itemId: string;
  exposure: number;
  deletes: number;
  shown: boolean;
  rate: number;
}) {
  const [ex, setEx] = useState(String(exposure));
  const [del, setDel] = useState(String(deletes));
  const [force, setForce] = useState(shown);
  useEffect(() => {
    setEx(String(exposure));
    setDel(String(deletes));
    setForce(shown);
  }, [exposure, deletes, shown]);

  return (
    <div style={card}>
      <div style={{ fontWeight: 600 }}>{name}</div>
      <div style={{ fontSize: 12, color: "#888" }}>
        {itemId} · 현재 삭제율 {(rate * 100).toFixed(0)}%
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
        <label>
          노출{" "}
          <input style={input} value={ex} onChange={(e) => setEx(e.target.value)} />
        </label>
        <label>
          삭제{" "}
          <input style={input} value={del} onChange={(e) => setDel(e.target.value)} />
        </label>
        <label>
          <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} /> 코멘트 강제
        </label>
        <button
          style={btnPrimary}
          onClick={async () => {
            await saveStat({
              activityId,
              itemId,
              exposure: Number(ex) || 0,
              deletes: Number(del) || 0,
              shown: force,
            });
          }}
        >
          저장
        </button>
        <button
          style={btn}
          onClick={async () => {
            setEx("30");
            setDel("21");
            await saveStat({ activityId, itemId, exposure: 30, deletes: 21, shown: false });
          }}
        >
          70% 데모
        </button>
      </div>
    </div>
  );
}

function ItemsPanel({ items }: { items: ReturnType<typeof getLiveCatalog>["items"] }) {
  const list = Object.values(items);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {list.map((item) => (
        <ItemRow key={item.id} id={item.id} name={item.name} note={item.linkNote ?? ""} desc={item.desc ?? ""} />
      ))}
    </div>
  );
}

function ItemRow({ id, name, note, desc }: { id: string; name: string; note: string; desc: string }) {
  const [n, setN] = useState(name);
  const [d, setD] = useState(desc);
  const [noteV, setNoteV] = useState(note);
  return (
    <div style={card}>
      <div style={{ fontSize: 12, color: "#888" }}>{id}</div>
      <input style={{ ...input, width: "100%", marginTop: 6 }} value={n} onChange={(e) => setN(e.target.value)} />
      <textarea style={{ ...input, width: "100%", marginTop: 6, height: 52 }} value={d} onChange={(e) => setD(e.target.value)} />
      <textarea style={{ ...input, width: "100%", marginTop: 6, height: 52 }} value={noteV} onChange={(e) => setNoteV(e.target.value)} placeholder="link_note" />
      <button
        style={{ ...btnPrimary, marginTop: 8 }}
        onClick={async () => {
          const sb = getSupabase();
          if (!sb) return;
          await sb.from("catalog_items").update({ name: n, item_desc: d || null, link_note: noteV || null }).eq("id", id);
          await loadCatalogFromCloud();
        }}
      >
        저장
      </button>
    </div>
  );
}

function RulesPanel() {
  const live = getLiveCatalog();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {live.rules.map((r, idx) => (
        <RuleRow key={`${r.table}-${r.itemId}-${idx}`} idx={idx} />
      ))}
    </div>
  );
}

function RuleRow({ idx }: { idx: number }) {
  const r = getLiveCatalog().rules[idx];
  const [reason, setReason] = useState(r?.reason ?? "");
  if (!r) return null;
  return (
    <div style={card}>
      <div style={{ fontWeight: 600 }}>
        {r.name} · {r.table}
        {r.activityId ? ` · ${r.activityId}` : ""}
      </div>
      <textarea style={{ ...input, width: "100%", marginTop: 6, height: 56 }} value={reason} onChange={(e) => setReason(e.target.value)} />
      <button
        style={{ ...btnPrimary, marginTop: 8 }}
        onClick={async () => {
          const sb = getSupabase();
          if (!sb) return;
          const id = `R${String(idx + 1).padStart(4, "0")}`;
          await sb.from("catalog_rules").update({ reason }).eq("id", id);
          await loadCatalogFromCloud();
        }}
      >
        저장
      </button>
    </div>
  );
}

const btn: CSSProperties = {
  border: "1px solid #ccc",
  background: "#fff",
  height: 36,
  padding: "0 12px",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 13,
};
const btnPrimary: CSSProperties = { ...btn, background: "#368FFF", color: "#fff", border: "none" };
const tabOn: CSSProperties = { ...btnPrimary };
const tabOff: CSSProperties = btn;
const input: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 6,
  padding: "6px 8px",
  fontSize: 14,
  width: 88,
};
const card: CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 12,
};
