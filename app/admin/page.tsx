"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ACTIVITIES, COMPANIONS, COUNTRIES } from "@/lib/catalog";
import { CATALOG_SQL } from "@/lib/catalogSchema";
import { importCsvFiles } from "@/lib/csvImport";
import { getLiveCatalog, loadCatalogFromCloud, seedCatalog, subscribeCatalog } from "@/lib/liveCatalog";
import type { Rule } from "@/lib/rules";
import { saveStat } from "@/lib/stats";
import { getSupabase } from "@/lib/supabase";

type Tab = "stats" | "items" | "rules";

const TABLE_LABEL: Record<Rule["table"], string> = {
  essential: "필수",
  base: "기본",
  country: "국가",
  companion: "동행",
  activity: "활동",
  weather: "날씨",
  temp: "기온",
};

const WEATHER_LABEL: Record<string, string> = {
  sunny: "맑음",
  cloudy: "흐림",
  rain: "비",
  snow: "눈",
  windy: "바람",
};

const TEMP_LABEL: Record<string, string> = {
  cold: "추움",
  mild: "보통",
  hot: "더움",
  low: "추움",
  mid: "보통",
  high: "더움",
};

function ruleCondition(r: Rule) {
  if (r.table === "activity" && r.activityId) {
    return ACTIVITIES.find((a) => a.id === r.activityId)?.name ?? r.activityId;
  }
  if (r.table === "country" && r.countryId) {
    return COUNTRIES.find((c) => c.id === r.countryId)?.name ?? r.countryId;
  }
  if (r.table === "companion" && r.companionId) {
    return COMPANIONS.find((c) => c.id === r.companionId)?.name ?? r.companionId;
  }
  if (r.table === "weather" && r.weatherId) return WEATHER_LABEL[r.weatherId] ?? r.weatherId;
  if (r.table === "temp" && r.tempBandId) return TEMP_LABEL[r.tempBandId] ?? r.tempBandId;
  return "—";
}

export default function AdminPage() {
  const [, bump] = useState(0);
  const [tab, setTab] = useState<Tab>("stats");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const live = getLiveCatalog();

  useEffect(() => subscribeCatalog(() => bump((n) => n + 1)), []);
  useEffect(() => {
    loadCatalogFromCloud();
  }, []);

  const run = async (fn: () => Promise<{ ok?: boolean; message?: string } | void>, fallback?: string) => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fn();
      if (res && "message" in res && res.message) setMsg(res.message);
      else if (fallback) setMsg(fallback);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "오류가 발생했습니다");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={shell}>
      <header style={top}>
        <div style={topRow}>
          <div>
            <h1 style={{ fontSize: 20, margin: 0 }}>챙겨요 어드민</h1>
            <p style={{ margin: "4px 0 0", color: "#666", fontSize: 13 }}>
              카탈로그를 Supabase에서 고칩니다. 로그인 없음 · {live.items ? Object.keys(live.items).length : 0}개 아이템 · {live.rules.length}개 규칙
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              style={btn}
              disabled={busy}
              onClick={async () => {
                await navigator.clipboard.writeText(CATALOG_SQL);
                setCopied(true);
                setMsg("테이블 생성 SQL을 복사했습니다. SQL Editor에 붙여넣고 Run 하세요.");
                window.setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? "복사됨" : "SQL 복사"}
            </button>
            <a
              href="https://supabase.com/dashboard/project/vsvlniwtfnjhqonsbldc/sql/new"
              target="_blank"
              rel="noreferrer"
              style={{ ...btn, textDecoration: "none", display: "inline-flex", alignItems: "center" }}
            >
              SQL Editor
            </a>
            <button style={btnPrimary} disabled={busy} onClick={() => run(() => seedCatalog())}>
              {busy ? "올리는 중…" : "CSV 시드 올리기"}
            </button>
            <button style={btn} disabled={busy} onClick={() => fileRef.current?.click()}>
              CSV 파일 올리기
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              multiple
              hidden
              onChange={(e) => {
                const list = [...(e.target.files ?? [])];
                e.target.value = "";
                if (!list.length) return;
                run(async () => {
                  const files = await Promise.all(list.map(async (f) => ({ name: f.name, text: await f.text() })));
                  return importCsvFiles(files);
                });
              }}
            />
          </div>
        </div>

        <details style={help}>
          <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 13 }}>이용 방법</summary>
          <div style={{ display: "grid", gap: 10, marginTop: 10, fontSize: 13, lineHeight: 1.65, color: "#444" }}>
            <p style={{ margin: 0 }}>
              <b>처음 한 번</b> — SQL 복사 → SQL Editor → 붙여넣고 Run → CSV 시드 올리기. 이미 돌렸으면 건너뛰세요.
            </p>
            <p style={{ margin: 0 }}>
              <b>CSV 시드 올리기</b>는 앱에 들어 있는 제출 CSV로 아이템·링크·규칙을 덮어씁니다. 삭제율은 안 건드립니다.
            </p>
            <p style={{ margin: 0 }}>
              <b>CSV 파일 올리기</b>는 <code style={code}>item_master</code>, <code style={code}>item_link</code>,{" "}
              <code style={code}>item_delete_rate</code>, <code style={code}>rule_*</code>를 여러 개 고를 수 있습니다.
              링크 파일은 기존 링크를 지우고 갈아끼웁니다.
            </p>
            <p style={{ margin: 0 }}>
              아래 표에서 검색·필터 후 칸을 고치고 저장하세요. 체크리스트는 새로고침해야 보입니다. 규칙 문구는 새로 만든 일정부터 반영됩니다.
            </p>
          </div>
        </details>

        {msg ? <div style={banner}>{msg}</div> : null}

        <nav style={tabs}>
          {([
            ["stats", "삭제율"],
            ["items", "아이템"],
            ["rules", "규칙"],
          ] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={tab === id ? tabOn : tabOff}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main style={main}>
        {tab === "stats" ? <StatsPanel /> : null}
        {tab === "items" ? <ItemsPanel items={live.items} onSaved={setMsg} /> : null}
        {tab === "rules" ? <RulesPanel onSaved={setMsg} /> : null}
      </main>
    </div>
  );
}

function Toolbar({
  q,
  onQ,
  placeholder,
  extra,
  count,
}: {
  q: string;
  onQ: (v: string) => void;
  placeholder: string;
  extra?: ReactNode;
  count: string;
}) {
  return (
    <div style={toolbar}>
      <input
        style={search}
        value={q}
        onChange={(e) => onQ(e.target.value)}
        placeholder={placeholder}
      />
      {extra}
      <span style={{ marginLeft: "auto", fontSize: 12, color: "#888", whiteSpace: "nowrap" }}>{count}</span>
    </div>
  );
}

function StatsPanel() {
  const live = getLiveCatalog();
  const [activityId, setActivityId] = useState(ACTIVITIES[0]?.id ?? "photo");
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const list: { activityId: string; itemId: string; name: string }[] = [];
    for (const r of live.rules) {
      if (r.table !== "activity" || !r.activityId) continue;
      if (activityId !== "all" && r.activityId !== activityId) continue;
      list.push({ activityId: r.activityId, itemId: r.itemId, name: r.name });
    }
    const needle = q.trim().toLowerCase();
    return needle
      ? list.filter((r) => `${r.name} ${r.itemId}`.toLowerCase().includes(needle))
      : list;
  }, [live.rules, activityId, q]);

  return (
    <div style={panel}>
      <p style={hint}>
        활동 아이템만, 노출 30 + 삭제율 70% 이상일 때만 「10명 중 N명이 챙겼어요」. 70% 미만이면 강제 표시도 숨김. 70% 데모는 노출 30·삭제 21.
      </p>
      <Toolbar
        q={q}
        onQ={setQ}
        placeholder="아이템 이름 또는 ID"
        count={`${rows.length}건`}
        extra={
          <select value={activityId} onChange={(e) => setActivityId(e.target.value)} style={select}>
            <option value="all">모든 활동</option>
            {ACTIVITIES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        }
      />
      {rows.length ? (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>아이템</th>
                <th style={th}>활동</th>
                <th style={{ ...th, width: 88 }}>노출</th>
                <th style={{ ...th, width: 88 }}>삭제</th>
                <th style={{ ...th, width: 72 }}>삭제율</th>
                <th style={{ ...th, width: 72 }}>강제</th>
                <th style={{ ...th, width: 168 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const stat = live.stats.find((s) => s.activityId === row.activityId && s.itemId === row.itemId);
                return (
                  <StatRow
                    key={row.activityId + row.itemId}
                    name={row.name}
                    activityId={row.activityId}
                    itemId={row.itemId}
                    exposure={stat?.exposure ?? 0}
                    deletes={stat?.deletes ?? 0}
                    shown={stat?.shown ?? false}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={empty}>맞는 항목이 없습니다.</p>
      )}
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
}: {
  name: string;
  activityId: string;
  itemId: string;
  exposure: number;
  deletes: number;
  shown: boolean;
}) {
  const [ex, setEx] = useState(String(exposure));
  const [del, setDel] = useState(String(deletes));
  const [force, setForce] = useState(shown);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setEx(String(exposure));
    setDel(String(deletes));
    setForce(shown);
  }, [exposure, deletes, shown]);
  const rate = (Number(ex) || 0) ? (Number(del) || 0) / (Number(ex) || 1) : 0;
  const ready = rate >= 0.7 && (Number(ex) || 0) >= 30;
  const persist = async (next: { exposure: number; deletes: number; shown: boolean }) => {
    setBusy(true);
    await saveStat({ activityId, itemId, ...next });
    setBusy(false);
  };

  return (
    <tr style={tr}>
      <td style={td}>
        <div style={{ fontWeight: 600 }}>{name}</div>
        <div style={{ fontSize: 11, color: "#999" }}>{itemId}</div>
      </td>
      <td style={td}>{ACTIVITIES.find((a) => a.id === activityId)?.name ?? activityId}</td>
      <td style={td}>
        <input style={cellInput} value={ex} onChange={(e) => setEx(e.target.value)} />
      </td>
      <td style={td}>
        <input style={cellInput} value={del} onChange={(e) => setDel(e.target.value)} />
      </td>
      <td style={td}>
        <span style={{ color: ready ? "#1F3D88" : "#888", fontWeight: ready ? 700 : 500 }}>
          {(rate * 100).toFixed(0)}%
        </span>
      </td>
      <td style={{ ...td, textAlign: "center" }}>
        <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} />
      </td>
      <td style={td}>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            style={btnSm}
            disabled={busy}
            onClick={() => persist({ exposure: Number(ex) || 0, deletes: Number(del) || 0, shown: force })}
          >
            저장
          </button>
          <button
            style={btnGhost}
            disabled={busy}
            onClick={() => {
              setEx("30");
              setDel("21");
              setForce(false);
              persist({ exposure: 30, deletes: 21, shown: false });
            }}
          >
            70%
          </button>
        </div>
      </td>
    </tr>
  );
}

function ItemsPanel({
  items,
  onSaved,
}: {
  items: ReturnType<typeof getLiveCatalog>["items"];
  onSaved: (m: string) => void;
}) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const all = Object.values(items);
    const needle = q.trim().toLowerCase();
    if (!needle) return all;
    return all.filter((i) =>
      `${i.id} ${i.name} ${i.desc ?? ""} ${i.linkNote ?? ""}`.toLowerCase().includes(needle)
    );
  }, [items, q]);

  if (!Object.keys(items).length) return <p style={empty}>아이템이 없습니다. CSV 시드를 먼저 올리세요.</p>;

  return (
    <div style={panel}>
      <p style={hint}>이름 · 상시 설명 · link_note(정보 시트 회색 박스). 새 아이템은 CSV에 행을 넣어 올리세요.</p>
      <Toolbar q={q} onQ={setQ} placeholder="이름, ID, 설명 검색" count={`${list.length} / ${Object.keys(items).length}`} />
      <div style={tableWrap}>
        <table style={table}>
          <thead>
            <tr>
              <th style={{ ...th, width: 72 }}>ID</th>
              <th style={{ ...th, width: 200 }}>이름</th>
              <th style={th}>설명</th>
              <th style={th}>link_note</th>
              <th style={{ ...th, width: 72 }} />
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <ItemRow
                key={item.id}
                id={item.id}
                name={item.name}
                note={item.linkNote ?? ""}
                desc={item.desc ?? ""}
                onSaved={onSaved}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ItemRow({
  id,
  name,
  note,
  desc,
  onSaved,
}: {
  id: string;
  name: string;
  note: string;
  desc: string;
  onSaved: (m: string) => void;
}) {
  const [n, setN] = useState(name);
  const [d, setD] = useState(desc);
  const [noteV, setNoteV] = useState(note);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setN(name);
    setD(desc);
    setNoteV(note);
  }, [name, desc, note]);
  const dirty = n !== name || d !== desc || noteV !== note;

  return (
    <tr style={tr}>
      <td style={{ ...td, color: "#999", fontSize: 12 }}>{id}</td>
      <td style={td}>
        <input style={cellInputWide} value={n} onChange={(e) => setN(e.target.value)} />
      </td>
      <td style={td}>
        <textarea style={cellArea} value={d} onChange={(e) => setD(e.target.value)} rows={2} />
      </td>
      <td style={td}>
        <textarea style={cellArea} value={noteV} onChange={(e) => setNoteV(e.target.value)} rows={2} />
      </td>
      <td style={td}>
        <button
          style={dirty ? btnSm : btnGhost}
          disabled={busy || !dirty}
          onClick={async () => {
            const sb = getSupabase();
            if (!sb) {
              onSaved("Supabase 키가 없습니다");
              return;
            }
            setBusy(true);
            const res = await sb
              .from("catalog_items")
              .update({ name: n, item_desc: d || null, link_note: noteV || null })
              .eq("id", id);
            setBusy(false);
            if (res.error) {
              onSaved(res.error.message);
              return;
            }
            await loadCatalogFromCloud();
            onSaved(`${n} 저장했습니다.`);
          }}
        >
          저장
        </button>
      </td>
    </tr>
  );
}

function RulesPanel({ onSaved }: { onSaved: (m: string) => void }) {
  const live = getLiveCatalog();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<Rule["table"] | "all">("all");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return live.rules
      .map((r, idx) => ({ r, idx }))
      .filter(({ r }) => (kind === "all" ? true : r.table === kind))
      .filter(({ r }) => {
        if (!needle) return true;
        return `${r.name} ${r.itemId} ${r.reason ?? ""} ${TABLE_LABEL[r.table]} ${ruleCondition(r)}`
          .toLowerCase()
          .includes(needle);
      });
  }, [live.rules, q, kind]);

  if (!live.rules.length) return <p style={empty}>규칙이 없습니다. CSV 시드를 먼저 올리세요.</p>;

  return (
    <div style={panel}>
      <p style={hint}>추천 사유는 새로 만든 일정부터 반영됩니다. 행을 통째로 넣거나 빼려면 rule_*.csv를 올리세요.</p>
      <Toolbar
        q={q}
        onQ={setQ}
        placeholder="아이템, 사유, 조건 검색"
        count={`${list.length} / ${live.rules.length}`}
        extra={
          <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} style={select}>
            <option value="all">모든 종류</option>
            {(Object.keys(TABLE_LABEL) as Rule["table"][]).map((k) => (
              <option key={k} value={k}>
                {TABLE_LABEL[k]}
              </option>
            ))}
          </select>
        }
      />
      <div style={tableWrap}>
        <table style={table}>
          <thead>
            <tr>
              <th style={{ ...th, width: 200 }}>아이템</th>
              <th style={{ ...th, width: 72 }}>종류</th>
              <th style={{ ...th, width: 120 }}>조건</th>
              <th style={th}>추천 사유</th>
              <th style={{ ...th, width: 72 }} />
            </tr>
          </thead>
          <tbody>
            {list.map(({ r, idx }) => (
              <RuleRow key={`${r.id ?? idx}-${r.itemId}-${r.table}`} rule={r} fallbackIdx={idx} onSaved={onSaved} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RuleRow({
  rule,
  fallbackIdx,
  onSaved,
}: {
  rule: Rule;
  fallbackIdx: number;
  onSaved: (m: string) => void;
}) {
  const [reason, setReason] = useState(rule.reason ?? "");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setReason(rule.reason ?? "");
  }, [rule.reason]);
  const dirty = reason !== (rule.reason ?? "");

  return (
    <tr style={tr}>
      <td style={td}>
        <div style={{ fontWeight: 600 }}>{rule.name}</div>
        <div style={{ fontSize: 11, color: "#999" }}>{rule.itemId}</div>
      </td>
      <td style={td}>{TABLE_LABEL[rule.table]}</td>
      <td style={td}>{ruleCondition(rule)}</td>
      <td style={td}>
        <textarea style={cellArea} value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="추천 사유" />
      </td>
      <td style={td}>
        <button
          style={dirty ? btnSm : btnGhost}
          disabled={busy || !dirty}
          onClick={async () => {
            const sb = getSupabase();
            if (!sb) {
              onSaved("Supabase 키가 없습니다");
              return;
            }
            const id = rule.id ?? `R${String(fallbackIdx + 1).padStart(4, "0")}`;
            setBusy(true);
            const res = await sb.from("catalog_rules").update({ reason }).eq("id", id);
            setBusy(false);
            if (res.error) {
              onSaved(res.error.message);
              return;
            }
            await loadCatalogFromCloud();
            onSaved(`${rule.name} 사유를 저장했습니다.`);
          }}
        >
          저장
        </button>
      </td>
    </tr>
  );
}

const shell: CSSProperties = {
  height: "100dvh",
  background: "#F4F6F8",
  display: "flex",
  flexDirection: "column",
  fontFamily: "Pretendard, sans-serif",
  color: "#222",
};
const top: CSSProperties = {
  background: "#fff",
  borderBottom: "1px solid #E6E8EC",
  padding: "16px 24px 0",
  flex: "none",
};
const topRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  flexWrap: "wrap",
};
const help: CSSProperties = {
  margin: "12px 0 0",
  padding: "10px 12px",
  background: "#F7F8FA",
  borderRadius: 8,
  fontSize: 13,
};
const tabs: CSSProperties = { display: "flex", gap: 4, marginTop: 14 };
const tabOn: CSSProperties = {
  border: "none",
  borderBottom: "2px solid #368FFF",
  background: "transparent",
  color: "#368FFF",
  height: 36,
  padding: "0 14px",
  fontWeight: 700,
  fontSize: 14,
};
const tabOff: CSSProperties = {
  border: "none",
  borderBottom: "2px solid transparent",
  background: "transparent",
  color: "#666",
  height: 36,
  padding: "0 14px",
  fontWeight: 600,
  fontSize: 14,
};
const main: CSSProperties = { flex: 1, minHeight: 0, overflow: "hidden", padding: 16 };
const panel: CSSProperties = { height: "100%", display: "flex", flexDirection: "column", minHeight: 0 };
const toolbar: CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  marginBottom: 10,
  flexWrap: "wrap",
};
const search: CSSProperties = {
  flex: "1 1 240px",
  minWidth: 200,
  height: 36,
  border: "1px solid #D8DCE3",
  borderRadius: 8,
  padding: "0 12px",
  fontSize: 14,
  background: "#fff",
};
const select: CSSProperties = {
  height: 36,
  border: "1px solid #D8DCE3",
  borderRadius: 8,
  padding: "0 10px",
  fontSize: 13,
  background: "#fff",
};
const tableWrap: CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflow: "auto",
  background: "#fff",
  border: "1px solid #E6E8EC",
  borderRadius: 12,
};
const table: CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 13 };
const th: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 1,
  background: "#F7F8FA",
  textAlign: "left",
  padding: "10px 12px",
  fontWeight: 600,
  color: "#666",
  borderBottom: "1px solid #E6E8EC",
};
const td: CSSProperties = {
  padding: "8px 12px",
  borderBottom: "1px solid #F0F1F3",
  verticalAlign: "top",
};
const tr: CSSProperties = { background: "#fff" };
const cellInput: CSSProperties = {
  width: 72,
  height: 32,
  border: "1px solid #E0E3E8",
  borderRadius: 6,
  padding: "0 8px",
  fontSize: 13,
};
const cellInputWide: CSSProperties = { ...cellInput, width: "100%" };
const cellArea: CSSProperties = {
  width: "100%",
  minHeight: 44,
  border: "1px solid #E0E3E8",
  borderRadius: 6,
  padding: "6px 8px",
  fontSize: 13,
  resize: "vertical",
  lineHeight: 1.4,
};
const btn: CSSProperties = {
  border: "1px solid #D8DCE3",
  background: "#fff",
  height: 34,
  padding: "0 12px",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 13,
};
const btnPrimary: CSSProperties = { ...btn, background: "#368FFF", color: "#fff", border: "none" };
const btnSm: CSSProperties = { ...btnPrimary, height: 30, padding: "0 10px", fontSize: 12 };
const btnGhost: CSSProperties = { ...btn, height: 30, padding: "0 10px", fontSize: 12, color: "#666" };
const banner: CSSProperties = {
  marginTop: 10,
  padding: "8px 12px",
  borderRadius: 8,
  background: "#E8F2FF",
  color: "#1F3D88",
  fontSize: 13,
};
const hint: CSSProperties = { margin: "0 0 10px", color: "#666", fontSize: 13, lineHeight: 1.5 };
const empty: CSSProperties = { margin: 24, color: "#888", fontSize: 14, textAlign: "center" };
const code: CSSProperties = { background: "#ECEFF3", padding: "1px 5px", borderRadius: 4, fontSize: 12 };
