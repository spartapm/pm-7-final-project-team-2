"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { PUSH_SQL } from "@/lib/catalogSchema";

type AccountRow = {
  id: string;
  endpoints: number;
  trips: { id: string; startDate?: string }[];
};

type Targets = {
  ok: boolean;
  status: string;
  configured: boolean;
  subscriptions: number;
  accounts: AccountRow[];
};

async function readJson(res: Response) {
  const text = await res.text();
  if (!text.trim()) {
    return { ok: false, message: `서버가 빈 응답을 보냈습니다 (${res.status})` };
  }
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { ok: false, message: text.slice(0, 180) };
  }
}

export function AdminPushPanel() {
  const [targets, setTargets] = useState<Targets | null>(null);
  const [title, setTitle] = useState("챙겨요 테스트 알림");
  const [body, setBody] = useState("탭하면 체크리스트로 이동해요.");
  const [accountId, setAccountId] = useState("");
  const [tripId, setTripId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    const res = await fetch("/api/push/targets", { cache: "no-store" });
    const json = await readJson(res);
    if (!("subscriptions" in json) && json.message) {
      throw new Error(String(json.message));
    }
    setTargets(json as unknown as Targets);
  };

  useEffect(() => {
    load().catch(() => setMsg("구독 목록을 불러오지 못했습니다"));
  }, []);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "오류가 발생했습니다");
    } finally {
      setBusy(false);
    }
  };

  const selected = targets?.accounts.find((a) => a.id === accountId);

  return (
    <div style={panel}>
      <p style={hint}>
        안드로이드·데스크톱만. iOS는 보내지 않습니다. 매일 19:00(KST) D-7/D-3/D-1은 Vercel Cron이{" "}
        <code style={code}>/api/push/dispatch</code>를 호출합니다. 탭하면 해당 여행 체크리스트(C-01)로 갑니다.
      </p>
      {targets && !targets.configured ? (
        <p style={warn}>VAPID 키가 없습니다. `.env.local`과 Vercel에 `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`를 넣으세요.</p>
      ) : null}
      {targets?.status === "missing-table" ? (
        <p style={warn}>구독 테이블이 없습니다. 아래 SQL을 복사해 SQL Editor에서 Run 하세요.</p>
      ) : null}

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button
          style={btn}
          disabled={busy}
          onClick={async () => {
            await navigator.clipboard.writeText(PUSH_SQL);
            setCopied(true);
            setMsg("푸시 테이블 SQL을 복사했습니다.");
            window.setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? "복사됨" : "푸시 SQL 복사"}
        </button>
        <button style={btn} disabled={busy} onClick={() => run(load)}>
          구독 새로고침
        </button>
        <button
          style={btnPrimary}
          disabled={busy}
          onClick={() =>
            run(async () => {
              const res = await fetch("/api/push/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scheduled: true, ignoreHour: true }),
              });
              const json = await readJson(res);
              setMsg(String(json.message ?? (json.ok ? `${json.sent ?? 0}건 발송` : "발송 실패")));
              await load();
            })
          }
        >
          오늘 D-7/D-3/D-1 보내기
        </button>
      </div>

      <p style={{ margin: "0 0 12px", fontSize: 13, color: "#666" }}>
        구독 {targets?.subscriptions ?? 0}건 · 계정 {targets?.accounts.length ?? 0}개
      </p>

      <div style={form}>
        <label style={label}>
          대상 계정
          <select
            style={select}
            value={accountId}
            onChange={(e) => {
              setAccountId(e.target.value);
              setTripId("");
            }}
          >
            <option value="">모든 구독</option>
            {(targets?.accounts ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.id} ({a.endpoints}대)
              </option>
            ))}
          </select>
        </label>
        <label style={label}>
          이동할 여행 (C-01)
          <select style={select} value={tripId} onChange={(e) => setTripId(e.target.value)} disabled={!selected}>
            <option value="">내 여행 홈</option>
            {(selected?.trips ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.id}
                {t.startDate ? ` · ${t.startDate}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label style={label}>
          제목
          <input style={input} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label style={label}>
          내용
          <textarea style={area} value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
        <button
          style={btnPrimary}
          disabled={busy}
          onClick={() =>
            run(async () => {
              const res = await fetch("/api/push/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  accountId: accountId || undefined,
                  tripId: tripId || undefined,
                  title,
                  body,
                }),
              });
              const json = await readJson(res);
              setMsg(String(json.message ?? (json.ok ? `${json.sent ?? 0}건 발송` : "발송 실패")));
            })
          }
        >
          테스트 알림 보내기
        </button>
      </div>
      {msg ? <p style={banner}>{msg}</p> : null}
    </div>
  );
}

const panel: CSSProperties = { height: "100%", overflow: "auto" };
const hint: CSSProperties = { margin: "0 0 10px", color: "#666", fontSize: 13, lineHeight: 1.5 };
const warn: CSSProperties = {
  margin: "0 0 10px",
  padding: "8px 12px",
  borderRadius: 8,
  background: "#FFF4E5",
  color: "#8A5A00",
  fontSize: 13,
};
const code: CSSProperties = { background: "#ECEFF3", padding: "1px 5px", borderRadius: 4, fontSize: 12 };
const form: CSSProperties = { display: "grid", gap: 10, maxWidth: 560 };
const label: CSSProperties = { display: "grid", gap: 6, fontSize: 12, fontWeight: 600, color: "#444" };
const input: CSSProperties = {
  height: 36,
  border: "1px solid #D8DCE3",
  borderRadius: 8,
  padding: "0 12px",
  fontSize: 14,
  fontWeight: 400,
};
const area: CSSProperties = { ...input, height: 72, padding: "8px 12px", resize: "vertical" };
const select: CSSProperties = { ...input, background: "#fff" };
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
const banner: CSSProperties = {
  marginTop: 10,
  padding: "8px 12px",
  borderRadius: 8,
  background: "#E8F2FF",
  color: "#1F3D88",
  fontSize: 13,
};
