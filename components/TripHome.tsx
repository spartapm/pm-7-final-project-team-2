"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { activityName, countryName } from "@/lib/catalog";
import { sortTrips, statusChip, tripPeriodLabel } from "@/lib/dates";
import { pushAccount } from "@/lib/cloud";
import { useStore } from "@/lib/store";
import { IconMeatball, IconPlus, PhoneShell } from "./icons";
import { ConfirmDialog, Menu, Toast } from "./ui";

export function TripHome() {
  const router = useRouter();
  const { trips, deleteTrip, accountId, hydrated, personalItems } = useStore();
  const sorted = useMemo(() => sortTrips(trips), [trips]);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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
    try {
      await navigator.clipboard.writeText(url);
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
                    <div key={trip.id} style={{ position: "relative" }}>
                      <button className="trip" onClick={() => router.push(`/trips/${trip.id}`)}>
                        <div className="head">
                          <span className="place">{countryName(trip.countryId)}</span>
                          <span className={`badge${chip.kind === "off" ? " off" : ""}`}>{chip.label}</span>
                        </div>
                        <div className="when">{tripPeriodLabel(trip.startDate, trip.endDate)}</div>
                        <div className="tags">
                          {trip.activities.map((a) => (
                            <span className="tag" key={a}>
                              {activityName(a)}
                            </span>
                          ))}
                        </div>
                      </button>
                      <button
                        className="kb"
                        aria-label="더보기"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuId(menuId === trip.id ? null : trip.id);
                        }}
                      >
                        <IconMeatball active={menuId === trip.id} />
                      </button>
                      {menuId === trip.id ? (
                        <Menu
                          style={{ top: 48, right: 16 }}
                          onClose={() => setMenuId(null)}
                          items={[
                            {
                              label: "삭제하기",
                              onClick: () => setConfirmId(trip.id),
                            },
                          ]}
                        />
                      ) : null}
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
                <IconPlus color="#fff" size={20} />
              </div>
            </button>
            <div style={{ display: "flex", justifyContent: "center", padding: "24px 0 40px" }}>
              <button className="share-btn" onClick={share}>
                일정 공유하기
              </button>
            </div>
          </>
        )}
      </div>
      {confirmId ? (
        <ConfirmDialog
          message="등록한 일정을 모두 삭제하시겠습니까?"
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            deleteTrip(confirmId);
            setConfirmId(null);
          }}
        />
      ) : null}
      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </PhoneShell>
  );
}
