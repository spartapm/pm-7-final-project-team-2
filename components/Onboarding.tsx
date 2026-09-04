"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ACTIVITIES, COMPANIONS, COUNTRIES } from "@/lib/catalog";
import { track } from "@/lib/analytics";
import { useStore } from "@/lib/store";
import type { ActivityId, CompanionId, CountryId } from "@/lib/types";
import { PhoneShell } from "./icons";
import { Calendar, Chip, PrimaryButton, ProgressBar, TopBar } from "./ui";

export function Onboarding({ step }: { step: 1 | 2 | 3 }) {
  const router = useRouter();
  const { draft, setDraft, createTrip } = useStore();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const go = (n: 1 | 2 | 3) => router.push(n === 1 ? "/onboarding" : `/onboarding?step=${n}`);

  if (step === 1) {
    return (
      <PhoneShell>
        <TopBar back={() => router.push("/trips")} progress="1 / 3" />
        <ProgressBar step={1} total={3} />
        <div className="shell-scroll pad-a">
          <span className="badge lg">여행 준비 시작</span>
          <h1 className="t-display" style={{ margin: "16px 0 12px" }}>
            지금부터 여행 준비물
            <br />
            리스트를 뽑아볼게요
          </h1>
          <p className="t-body" style={{ color: "var(--text-3)", margin: "0 0 32px" }}>
            몇 가지만 알려주시면 이번 여행에 꼭 필요한 준비물만 골라서 정리해드려요. 2분이면 충분해요.
          </p>
          <div className="infobox">
            <div className="t">이런 걸 여쭤볼게요</div>
            <ul>
              <li><span className="n">1</span>언제, 어디로 가시는지</li>
              <li><span className="n">2</span>누구와 함께 가시는지</li>
              <li><span className="n">3</span>어떤 활동을 하실지</li>
            </ul>
          </div>
        </div>
        <div className="shell-footer">
          <PrimaryButton
            onClick={() => {
              track("checklist_start", { entry_point: "a01" });
              go(2);
            }}
          >
            시작하기
          </PrimaryButton>
        </div>
      </PhoneShell>
    );
  }

  if (step === 2) {
    const ready = Boolean(draft.countryId && draft.startDate && draft.endDate);
    const toggleCountry = (id: CountryId) => setDraft({ countryId: id });
    return (
      <PhoneShell>
        <TopBar back={() => go(1)} progress="2 / 3" />
        <ProgressBar step={2} total={3} />
        <div className="shell-scroll pad-a">
          <div className="q-block">
            <div className="q-title t-title2">
              어디로 가세요? <span className="req">*</span>
            </div>
            <p className="q-sub">나라에 따라 챙길 것들이 달라져요.</p>
            <div className="chips">
              {COUNTRIES.map((c) => (
                <Chip
                  key={c.id}
                  label={c.name}
                  pressed={draft.countryId === c.id}
                  onClick={() => toggleCountry(c.id)}
                />
              ))}
            </div>
          </div>
          <div className="q-block">
            <div className="q-title t-title2">
              언제 가세요? <span className="req">*</span>
            </div>
            <p className="q-sub">계절과 일정에 맞춰 준비물을 골라드려요.</p>
            <Calendar
              start={draft.startDate}
              end={draft.endDate}
              onChange={(start, end) => setDraft({ startDate: start, endDate: end ?? start })}
            />
          </div>
        </div>
        <div className="shell-footer">
          <PrimaryButton disabled={!ready} onClick={() => { track("onboarding_step_complete", { step_name: "a02" }); go(3); }}>
            다음
          </PrimaryButton>
        </div>
      </PhoneShell>
    );
  }

  const toggleCompanion = (id: CompanionId) => {
    const has = draft.companions.includes(id);
    setDraft({
      companions: has ? draft.companions.filter((x) => x !== id) : [...draft.companions, id],
    });
  };
  const toggleActivity = (id: ActivityId) => {
    const has = draft.activities.includes(id);
    setDraft({
      activities: has ? draft.activities.filter((x) => x !== id) : [...draft.activities, id],
    });
  };

  const ready = draft.companions.length > 0;

  return (
    <PhoneShell>
      <TopBar back={() => go(2)} progress="3 / 3" />
      <ProgressBar step={3} total={3} />
      <div className="shell-scroll pad-a">
        <div className="q-block">
          <div className="sec-head q-title">
            <div className="t-title2">
              누구와 함께 가세요? <span className="req">*</span>
            </div>
            <span className="sec-count">{draft.companions.length}개 선택됨</span>
          </div>
          <p className="q-sub">함께 가는 사람에 따라 챙길 것이 늘어나요.</p>
          <div className="chips">
            {COMPANIONS.map((c) => (
              <Chip
                key={c.id}
                label={c.name}
                pressed={draft.companions.includes(c.id)}
                onClick={() => toggleCompanion(c.id)}
              />
            ))}
          </div>
        </div>
        <div className="q-block">
          <div className="sec-head q-title">
            <div className="t-title2">어떤 활동을 하세요?</div>
            <span className="sec-count">{draft.activities.length}개 선택됨</span>
          </div>
          <p className="q-sub">
            해당하는 활동을 여러 개 선택할 수 있어요. 선택한 활동에 맞는 준비물이 체크리스트에 함께 담겨요.
          </p>
          <div className="chips">
            {ACTIVITIES.map((a) => (
              <Chip
                key={a.id}
                label={a.name}
                pressed={draft.activities.includes(a.id)}
                onClick={() => toggleActivity(a.id)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="shell-footer">
        <PrimaryButton
          disabled={!ready || busy}
          onClick={async () => {
            setBusy(true);
            setErr(null);
            try {
              track("onboarding_step_complete", { step_name: "a03" });
              const trip = await createTrip();
              track("checklist_created", {
                destination: trip.countryId,
                companion: trip.companions.join(","),
                activity: trip.activities.join(","),
                item_count: trip.categories.reduce((n, c) => n + c.items.length, 0),
              });
              if ("Notification" in window && Notification.permission === "default") {
                Notification.requestPermission().catch(() => undefined);
              }
              router.replace(`/trips/${trip.id}`);
            } catch {
              setErr("체크리스트를 만들지 못했어요. 다시 시도해 주세요.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "만드는 중..." : "체크리스트 생성하기"}
        </PrimaryButton>
        {err ? (
          <p className="t-caption" style={{ color: "var(--accent)", textAlign: "center", margin: "8px 0 0" }}>
            {err}
          </p>
        ) : null}
      </div>
    </PhoneShell>
  );
}
