"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ACTIVITIES } from "@/lib/catalog";
import { CATALOG_SQL } from "@/lib/catalogSchema";
import { importCsvFiles } from "@/lib/csvImport";
import { getLiveCatalog, loadCatalogFromCloud, seedCatalog, subscribeCatalog } from "@/lib/liveCatalog";
import { saveStat } from "@/lib/stats";
import { getSupabase } from "@/lib/supabase";

type Tab = "stats" | "items" | "rules";

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
    <div style={{ height: "100dvh", background: "#F2F2F2", overflow: "auto" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 20px 80px", fontFamily: "Pretendard, sans-serif" }}>
        <h1 style={{ fontSize: 24, margin: "0 0 8px" }}>챙겨요 어드민</h1>
        <p style={{ color: "#666", margin: "0 0 16px", lineHeight: 1.6 }}>
          제출한 CSV(아이템·규칙·링크·삭제율)를 Supabase에서 고치고, 체크리스트에 바로 반영하는 화면입니다.
          로그인 가드는 없습니다. 주소 아는 사람이면 들어올 수 있습니다.
        </p>

        <section style={guide}>
          <h2 style={h2}>여기서 할 수 있는 일</h2>
          <ol style={ol}>
            <li>
              <b>테이블이 아직 없을 때</b> — 아래 <b>SQL 복사</b> → <b>SQL Editor</b> → 붙여넣고 Run.
              계정·일정·카탈로그·삭제율 테이블이 만들어집니다. 이미 한 번 돌렸으면 다시 안 해도 됩니다.
            </li>
            <li>
              <b>제출 CSV를 DB에 넣을 때</b> — <b>CSV 시드 올리기</b>는 앱에 들어 있는
              <code style={code}>data/*.csv</code> 원본(아이템·링크·규칙)을 올립니다. 삭제율은 건드리지 않습니다.
              이미 고친 아이템/규칙 이름을 덮어쓰니, 데모 초기화할 때만 누르세요.
            </li>
            <li>
              <b>새 CSV를 직접 올릴 때</b> — <b>CSV 파일 올리기</b>로
              <code style={code}>item_master.csv</code>, <code style={code}>item_link.csv</code>,
              <code style={code}>item_delete_rate.csv</code>, <code style={code}>rule_*.csv</code>를
              여러 개 한 번에 고를 수 있습니다. 제출안 <code style={code}>csv.zip</code>과 같은 컬럼이어야 합니다.
            </li>
            <li>
              <b>한 줄만 고칠 때</b> — 아래 탭에서 숫자/문구를 고치고 <b>저장</b>. 새로고침한 체크리스트에 바로 반영됩니다.
            </li>
          </ol>
        </section>

        <section style={guide}>
          <h2 style={h2}>버튼 세 개</h2>
          <ul style={ul}>
            <li>
              <b>SQL 복사</b> — 테이블 생성 SQL이 클립보드에 들어갑니다. Supabase SQL Editor에 그대로 붙여넣으면 됩니다.
              아이템 데이터는 들어 있지 않고, 빈 테이블만 만듭니다.
            </li>
            <li>
              <b>SQL Editor</b> — 챙겨요 Supabase 프로젝트의 SQL 창이 새 탭으로 열립니다.
              복사한 SQL을 붙인 뒤 우측 하단 Run(또는 ⌘/Ctrl+Enter)을 누르면 됩니다.
              “Success. No rows returned”가 뜨면 성공입니다.
            </li>
            <li>
              <b>CSV 시드 올리기</b> — 기능 명세서에 제출한 아이템·링크·규칙을 DB에 upsert합니다.
              테이블이 없을 때 누르면 에러가 납니다. 그때는 위 1번부터 하세요.
            </li>
          </ul>
          <p style={{ ...note, marginTop: 12 }}>
            인식하는 CSV 파일명: item_master, item_link, item_delete_rate, rule_essential_item, rule_base_item,
            rule_country_item, rule_companion_item, rule_activity_item, rule_weather_item, rule_temp_item.
            링크 CSV를 올리면 기존 링크는 전부 지우고 새 파일로 갈아끼웁니다.
          </p>
        </section>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
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
          <button
            style={btnPrimary}
            disabled={busy}
            onClick={() => run(() => seedCatalog())}
          >
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
        {msg ? <div style={banner}>{msg}</div> : null}

        <div style={{ display: "flex", gap: 8, margin: "20px 0 12px" }}>
          {(["stats", "items", "rules"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={tab === t ? tabOn : tabOff}>
              {t === "stats" ? "삭제율" : t === "items" ? "아이템" : "규칙"}
            </button>
          ))}
        </div>

        {tab === "stats" ? (
          <section style={{ ...guide, marginBottom: 12 }}>
            <h2 style={h2}>삭제율 탭</h2>
            <p style={p}>
              편집 모드에서 「10명 중 N명이 챙겼어요」가 뜨는 조건입니다. <b>활동 아이템만</b> 해당하고,
              노출 30건 이상 + 삭제율 70% 이상일 때 나옵니다.
            </p>
            <ul style={ul}>
              <li>70–79% → 10명 중 3명 / 80–89% → 2명 / 90%+ → 1명</li>
              <li>
                <b>노출</b>은 그 아이템이 체크리스트에 담긴 횟수, <b>삭제</b>는 편집에서 지운 횟수입니다.
                삭제율 = 삭제 ÷ 노출.
              </li>
              <li>
                <b>70% 데모</b>는 노출 30 · 삭제 21을 넣습니다. QA할 때 이 버튼을 누르면 됩니다.
              </li>
              <li>
                <b>코멘트 강제</b>를 켜면 노출/삭제율과 상관없이 코멘트를 띄웁니다.
              </li>
              <li>숫자를 바꿔도 <b>저장</b>을 눌러야 DB에 들어갑니다. 그다음 체크리스트를 새로고침하세요.</li>
            </ul>
          </section>
        ) : null}
        {tab === "items" ? (
          <section style={{ ...guide, marginBottom: 12 }}>
            <h2 style={h2}>아이템 탭</h2>
            <p style={p}>
              <code style={code}>item_master.csv</code>에 해당하는 준비물 사전입니다. 새 일정 생성·정보 아이콘에 쓰입니다.
            </p>
            <ul style={ul}>
              <li>첫 칸: 아이템 이름 (체크리스트에 보이는 이름)</li>
              <li>둘째 칸: 상시 설명. 규칙 사유가 없을 때 아이템 아래 회색 문구로 나갑니다.</li>
              <li>
                셋째 칸: <code style={code}>link_note</code>. 정보 시트(C-05) 맨 아래 회색 박스입니다.
                비우면 박스가 안 나옵니다.
              </li>
              <li>아이템을 새로 만들려면 CSV에 행을 추가해 올리거나, SQL Editor에서 catalog_items에 insert 하세요.</li>
            </ul>
          </section>
        ) : null}
        {tab === "rules" ? (
          <section style={{ ...guide, marginBottom: 12 }}>
            <h2 style={h2}>규칙 탭</h2>
            <p style={p}>
              「이 조건이면 이 아이템을 왜 담는지」입니다. 국가·동행·활동·날씨·기온·필수·기본 테이블이 섞여 있습니다.
            </p>
            <ul style={ul}>
              <li>텍스트는 체크리스트 아이템 아래 추천 사유입니다. 고치고 저장하면 새 생성분부터 반영됩니다.</li>
              <li>
                이미 만들어진 일정은 생성 당시 문구를 들고 있습니다. 기존 일정을 바꾸려면 일정을 다시 만들거나
                SQL에서 trips payload를 고쳐야 합니다.
              </li>
              <li>규칙 행을 통째로 넣거나 빼려면 <code style={code}>rule_*.csv</code>를 올리세요.</li>
            </ul>
          </section>
        ) : null}

        {tab === "stats" ? <StatsPanel /> : null}
        {tab === "items" ? <ItemsPanel items={live.items} onSaved={(m) => setMsg(m)} /> : null}
        {tab === "rules" ? <RulesPanel onSaved={(m) => setMsg(m)} /> : null}
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
      <label style={{ display: "block", margin: "0 0 12px" }}>
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
        {filtered.length ? (
          filtered.map((row) => {
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
          })
        ) : (
          <p style={p}>이 활동에 연결된 규칙이 없습니다. CSV 시드를 먼저 올리거나 규칙 탭을 확인하세요.</p>
        )}
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
  const [local, setLocal] = useState<string | null>(null);
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
        {rate >= 0.7 && exposure >= 30 ? " · 코멘트 조건 충족" : ""}
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
            const res = await saveStat({
              activityId,
              itemId,
              exposure: Number(ex) || 0,
              deletes: Number(del) || 0,
              shown: force,
            });
            setLocal(res.ok ? "저장했습니다. 체크리스트를 새로고침하세요." : res.message ?? "실패");
          }}
        >
          저장
        </button>
        <button
          style={btn}
          onClick={async () => {
            setEx("30");
            setDel("21");
            setForce(false);
            const res = await saveStat({ activityId, itemId, exposure: 30, deletes: 21, shown: false });
            setLocal(res.ok ? "70% 데모를 넣었습니다. 편집 모드에서 코멘트를 확인하세요." : res.message ?? "실패");
          }}
        >
          70% 데모
        </button>
      </div>
      {local ? <div style={{ marginTop: 8, fontSize: 13, color: "#1F3D88" }}>{local}</div> : null}
    </div>
  );
}

function ItemsPanel({
  items,
  onSaved,
}: {
  items: ReturnType<typeof getLiveCatalog>["items"];
  onSaved: (m: string) => void;
}) {
  const list = Object.values(items);
  if (!list.length) return <p style={p}>아이템이 없습니다. 위에서 CSV 시드 올리기를 먼저 하세요.</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
  return (
    <div style={card}>
      <div style={{ fontSize: 12, color: "#888" }}>{id}</div>
      <input
        style={{ ...input, width: "100%", marginTop: 6 }}
        value={n}
        onChange={(e) => setN(e.target.value)}
        placeholder="아이템 이름"
      />
      <textarea
        style={{ ...input, width: "100%", marginTop: 6, height: 52 }}
        value={d}
        onChange={(e) => setD(e.target.value)}
        placeholder="상시 설명 (규칙 사유가 없을 때)"
      />
      <textarea
        style={{ ...input, width: "100%", marginTop: 6, height: 52 }}
        value={noteV}
        onChange={(e) => setNoteV(e.target.value)}
        placeholder="link_note — 정보 시트 회색 박스. 없으면 박스 숨김"
      />
      <button
        style={{ ...btnPrimary, marginTop: 8 }}
        onClick={async () => {
          const sb = getSupabase();
          if (!sb) {
            onSaved("Supabase 키가 없습니다");
            return;
          }
          const res = await sb
            .from("catalog_items")
            .update({ name: n, item_desc: d || null, link_note: noteV || null })
            .eq("id", id);
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
    </div>
  );
}

function RulesPanel({ onSaved }: { onSaved: (m: string) => void }) {
  const live = getLiveCatalog();
  if (!live.rules.length) return <p style={p}>규칙이 없습니다. 위에서 CSV 시드 올리기를 먼저 하세요.</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {live.rules.map((r, idx) => (
        <RuleRow key={`${r.table}-${r.itemId}-${idx}`} idx={idx} onSaved={onSaved} />
      ))}
    </div>
  );
}

function RuleRow({ idx, onSaved }: { idx: number; onSaved: (m: string) => void }) {
  const r = getLiveCatalog().rules[idx];
  const [reason, setReason] = useState(r?.reason ?? "");
  if (!r) return null;
  return (
    <div style={card}>
      <div style={{ fontWeight: 600 }}>
        {r.name} · {r.table}
        {r.activityId ? ` · ${r.activityId}` : ""}
        {r.countryId ? ` · ${r.countryId}` : ""}
      </div>
      <textarea
        style={{ ...input, width: "100%", marginTop: 6, height: 56 }}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="추천 사유"
      />
      <button
        style={{ ...btnPrimary, marginTop: 8 }}
        onClick={async () => {
          const sb = getSupabase();
          if (!sb) {
            onSaved("Supabase 키가 없습니다");
            return;
          }
          const id = r.id ?? `R${String(idx + 1).padStart(4, "0")}`;
          const res = await sb.from("catalog_rules").update({ reason }).eq("id", id);
          if (res.error) {
            onSaved(res.error.message);
            return;
          }
          await loadCatalogFromCloud();
          onSaved(`${r.name} 사유를 저장했습니다.`);
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
const guide: CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: "16px 18px",
  marginBottom: 12,
};
const h2: CSSProperties = { fontSize: 16, margin: "0 0 10px" };
const p: CSSProperties = { margin: "0 0 8px", color: "#444", fontSize: 14, lineHeight: 1.65 };
const ol: CSSProperties = { margin: 0, paddingLeft: 20, color: "#444", fontSize: 14, lineHeight: 1.7 };
const ul: CSSProperties = { margin: 0, paddingLeft: 18, color: "#444", fontSize: 14, lineHeight: 1.7 };
const note: CSSProperties = { margin: 0, color: "#666", fontSize: 13, lineHeight: 1.6 };
const code: CSSProperties = {
  background: "#F2F2F2",
  padding: "1px 6px",
  borderRadius: 4,
  fontSize: 12,
};
const banner: CSSProperties = {
  marginBottom: 8,
  padding: "10px 12px",
  borderRadius: 8,
  background: "#E8F2FF",
  color: "#1F3D88",
  fontSize: 14,
  lineHeight: 1.5,
};
