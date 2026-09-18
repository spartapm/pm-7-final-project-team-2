"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { countryName } from "@/lib/catalog";
import { daysUntil, sortTrips, statusChip, tripPeriodLabel, tripStatus } from "@/lib/dates";
import { consumeEntry, track } from "@/lib/analytics";
import { setLastHome } from "@/lib/lastHome";
import { liveActivityName, activityOrder, subscribeCatalog } from "@/lib/liveCatalog";
import { pushAccount } from "@/lib/cloud";
import { askPushOnHome } from "@/lib/notify";
import { useStore } from "@/lib/store";
import { IconMeatball, IconPlusFab, PhoneShell } from "./icons";
import { ConfirmDialog, Menu, Toast } from "./ui";

const SHARE_TIP_KEY = "chaeggyeo:shareTip";

export function TripHome() {
  const router = useRouter();
  const { trips, deleteTrip, accountId, hydrated, personalItems } = useStore();
  const [, catalogTick] = useState(0);
  const sorted = useMemo(() => sortTrips(trips), [trips]);
  const [menu, setMenu] = useState<{ tripId: string; anchor: HTMLElement } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [shareTip, setShareTip] = useState(false);

  useEffect(() => {
    setLastHome("/trips");
  }, []);

  useEffect(() => subscribeCatalog(() => catalogTick((n) => n + 1)), []);

  useEffect(() => {
    if (!hydrated) return;
    const entry = consumeEntry();
    track("trip_home_view", { entry_type: entry });
    const delay = entry === "after_create" ? 800 : 400;
    const id = window.setTimeout(() => {
      void askPushOnHome(accountId);
    }, delay);
    try {
      setShareTip(localStorage.getItem(SHARE_TIP_KEY) !== "1");
    } catch {
      setShareTip(true);
    }
    return () => window.clearTimeout(id);
  }, [hydrated, accountId]);

  const dismissShareTip = () => {
    setShareTip(false);
    try {
      localStorage.setItem(SHARE_TIP_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/s/${accountId}`;
    try {
      localStorage.setItem(
        `chaeggyeo:share:${accountId}`,
        JSON.stringify({ accountId, trips })
      );
    } catch {
      /* ignore */
    }
    const cloud = await pushAccount({ id: accountId, trips, personalItems });
    const shareText = `[챙겨요 · 여행 준비물 체크리스트]\n\n접속 후에는 기존 일정이 사라져요!\n\n기존 일정을 유지하시려면 '일정 공유하기'를 눌러 기존 일정을 저장해주세요.\n\n${url}`;
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      /* playwright / insecure context */
    }
    if (cloud === "missing-table") {
      setToast("링크는 복사됐지만, SQL을 실행해야 다른 기기에서 열립니다");
      return;
    }
    if (cloud === "error") {
      setToast("링크는 복사됐지만 클라우드 저장에 실패했습니다");
      return;
    }
    setToast("일정 링크가 복사되었습니다");
  };

  return (
    <PhoneShell>
      <div className="shell-scroll pad-b">
        <h1 className="t-title2" style={{ margin: 0 }}>내 여행 준비</h1>
        <p className="t-caption" style={{ color: "var(--text-3)", margin: "8px 0 20px" }}>
          알려주신 일정 기반으로 준비물을 정리해드렸어요
        </p>
        {!hydrated ? (
          <div className="skel" style={{ height: 114, marginBottom: 12 }} />
        ) : (
          <>
            {sorted.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {sorted.map((trip) => {
                  const chip = statusChip(trip);
                  return (
                    <div className="trip-wrap" key={trip.id}>
                      <button
                        className="trip"
                        onClick={() => {
                          track("trip_card_click", {
                            trip_id: trip.id,
                            trip_status: tripStatus(trip),
                            days_until_departure: daysUntil(trip.startDate),
                            is_new: !trip.seen,
                          });
                          router.push(`/trips/${trip.id}`);
                        }}
                      >
                        <div className="head">
                          <span className="place">{countryName(trip.countryId)}</span>
                          <span className={`badge${chip.kind === "off" ? " off" : ""}`}>{chip.label}</span>
                          {!trip.seen ? <span className="badge new">NEW</span> : null}
                        </div>
                        <div className="when">{tripPeriodLabel(trip.startDate, trip.endDate)}</div>
                        <div className="tags">
                          {[...trip.activities]
                            .sort((a, b) => activityOrder(a) - activityOrder(b))
                            .map((a) => (
                            <span className="tag" key={a}>
                              {liveActivityName(a)}
                            </span>
                          ))}
                        </div>
                      </button>
                      <button
                        className="kb"
                        aria-label="더보기"
                        onClick={(e) => {
                          e.stopPropagation();
                          const el = e.currentTarget;
                          setMenu(menu?.tripId === trip.id ? null : { tripId: trip.id, anchor: el });
                        }}
                      >
                        <IconMeatball />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}
            <button className="trip-new" style={{ marginTop: sorted.length ? 12 : 0 }} onClick={() => router.push("/onboarding")}>
              <div>
                <div className="place">새 여행 등록하기</div>
                <div className="when" style={{ marginBottom: 0 }}>
                  나에게 맞는 준비물을 정리해 드려요
                </div>
              </div>
              <div className="fab">
                <IconPlusFab />
              </div>
            </button>
            <div style={{ display: "flex", justifyContent: "center", padding: "28px 0 100px" }}>
              <div className="share-wrap">
                {shareTip ? (
                  <button type="button" className="share-tip" onClick={dismissShareTip}>
                    다른 기기에서 이어보고, 일행과 함께 체크할 수 있어요
                  </button>
                ) : null}
                <button className="share-btn" onClick={share}>
                  일정 공유하기
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      {menu ? (
        <Menu
          anchor={menu.anchor}
          width={179}
          onClose={() => setMenu(null)}
          items={[
            {
              label: "삭제하기",
              onClick: () => setConfirmId(menu.tripId),
            },
          ]}
        />
      ) : null}
      {confirmId ? (
        <ConfirmDialog
          message={"등록한 일정을\n모두 삭제하시겠습니까?"}
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            deleteTrip(confirmId);
            setConfirmId(null);
          }}
        />
      ) : null}
      {toast ? <Toast message={toast} onDone={() => setToast(null)} place="bottom" /> : null}
    </PhoneShell>
  );
}
