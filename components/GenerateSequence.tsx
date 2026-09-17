"use client";

import { useEffect, useMemo, useState } from "react";
import { companionName, countryName } from "@/lib/catalog";
import { nightDay, tripMonthDayRange } from "@/lib/dates";
import { liveActivityName } from "@/lib/liveCatalog";
import type { ActivityId, CompanionId, CountryId } from "@/lib/types";

const PATHS = [
  "M8 2v4M16 2v4M3.5 9.5h17M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V6A1.5 1.5 0 0 1 5 4.5Z",
  "M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z",
  "M9 11a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 11ZM2.5 20a6.5 6.5 0 0 1 13 0M16 11.2a3 3 0 1 0 0-6 3 3 0 0 0 0 6M17 14.4a6 6 0 0 1 4.5 5.6",
  "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM16.24 7.76L14.12 14.12L7.76 16.24L9.88 9.88Z",
];

export function GenerateSequence({
  countryId,
  startDate,
  endDate,
  companions,
  activities,
  itemCount,
  ready,
  onDone,
}: {
  countryId: CountryId;
  startDate: string;
  endDate: string;
  companions: CompanionId[];
  activities: ActivityId[];
  itemCount: number;
  ready: boolean;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const started = useMemo(() => performance.now(), []);

  const country = countryName(countryId);
  const nd = nightDay(startDate, endDate);
  const stay = `${nd.nights}박 ${nd.days}일`;
  const period = tripMonthDayRange(startDate, endDate);
  const companionLine = companions.map(companionName).join(" · ");
  const activityLine = activities.map(liveActivityName).join(", ");

  const steps = useMemo(
    () => [
      { t: "일정을 읽고 있어요", v: `${country} · ${period} · ${stay}`, d: PATHS[0] },
      {
        t: "날씨를 확인하고 있어요",
        v: `최근 5년 이맘때 ${country} 날씨를 참고했어요`,
        d: PATHS[1],
      },
      { t: "함께 갈 사람을 확인하고 있어요", v: companionLine, d: PATHS[2] },
      { t: "활동에 맞는 준비물을 고르고 있어요", v: activityLine, d: PATHS[3] },
    ],
    [activityLine, companionLine, country, period, stay]
  );

  useEffect(() => {
    const timers: number[] = [];
    steps.forEach((_, i) => {
      if (i === 0) return;
      timers.push(window.setTimeout(() => setStep(i), i * 1000));
    });
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [steps]);

  useEffect(() => {
    if (!ready || done) return;
    const wait = Math.max(0, steps.length * 1000 - (performance.now() - started));
    const id = window.setTimeout(() => setDone(true), wait);
    return () => window.clearTimeout(id);
  }, [ready, done, started, steps.length]);

  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(onDone, 2600);
    return () => window.clearTimeout(t);
  }, [done, onDone]);

  const cur = steps[Math.min(step, steps.length - 1)];

  return (
    <div className="gen-seq">
      <div className="gen-seq-dots">
        {steps.map((_, i) => (
          <i
            key={i}
            className={done ? "done" : i < step ? "done" : i === step ? "cur" : ""}
          />
        ))}
      </div>
      <div className="gen-seq-stage">
        <div className="gen-seq-ico">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d={cur.d} />
          </svg>
        </div>
        <div key={step} className="gen-seq-copy">
          <div className="ttl">{cur.t}</div>
          <div className="val">{cur.v}</div>
        </div>
      </div>
      <div className={`gen-seq-fin${done ? " show" : ""}`}>
        <div className="gen-seq-big">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12.5 9.5 18 20 7" />
          </svg>
        </div>
        <b>{itemCount}개를 담았어요</b>
        <span>넉넉하게 담았으니 덜어내면서 쓰세요</span>
      </div>
    </div>
  );
}
