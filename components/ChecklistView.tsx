"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { countryName } from "@/lib/catalog";
import { checklistSubtitle } from "@/lib/dates";
import {
  itemParams,
  noteOverpackImpression,
  setEntry,
  track,
  trackItemDelete,
} from "@/lib/analytics";
import { categoryFromPreset, emptyCustomCategory } from "@/lib/generate";
import { commentRateFor, hasInfoIcon, isPurchasable, overpackCopy } from "@/lib/itemMeta";
import { sortChecklistItems } from "@/lib/itemSort";
import { loadCatalogFromCloud, livePresetCategoryNames, subscribeCatalog } from "@/lib/liveCatalog";
import {
  hasSeenCounterCoach,
  hasSeenPackGuide,
  markCounterCoachSeen,
  markPackGuideSeen,
  setLastHome,
} from "@/lib/lastHome";
import { newItem, patchCategory, patchItem, useStore } from "@/lib/store";
import type { Category, ChecklistItem, Trip } from "@/lib/types";
import {
  IconCart,
  IconCartFab,
  IconCheck,
  IconCheckHeader,
  IconChevron,
  IconInfo,
  IconMeatball,
  IconOverpack,
  IconPencil,
  IconPlus,
  IconXSmall,
  PhoneShell,
} from "./icons";
import { ConfirmDialog, InfoSheet, InputDialog, Menu, PackGuideSheet, Toast, TopBar } from "./ui";

const LEGAL =
  "챙겨요(가칭)가 제공하는 국가별 반입 주의·금지 품목 및 관련 법적·규정 정보는 각 항목에 표시된 작성·갱신 기준일 시점에 확인된 내용을 바탕으로 한 참고용 정보입니다. 관련 법령 및 규정은 국가와 시기에 따라 사전 예고 없이 변경될 수 있으며, 본 서비스가 제공하는 정보가 실제 세관·출입국 규정과 다를 수 있습니다. 챙겨요(가칭)는 해당 정보의 최신성·정확성·완전성을 보장하지 않으며, 이를 신뢰하여 발생한 불이익이나 손해에 대해 책임을 지지 않습니다. 정확한 반입 규정은 반드시 이용 항공사, 목적지 국가의 대사관·영사관, 관세청 등 공식 기관을 통해 여행 전 별도로 확인하시기 바랍니다.";

const MAILTO =
  "mailto:chaeggyeo@gmail.com?subject=" +
  encodeURIComponent("준비물 관련 문의") +
  "&body=" +
  encodeURIComponent(
    "• 요청 종류(추가/수정/삭제): \n• 준비물 이름: \n• 어떤 상황에 해당하나요? (국가, 활동 등):\n• 이유를 간단히 적어주세요:"
  );

function isPersonalCat(c: Category) {
  return c.kind === "personal" || c.name === "나만의 준비물";
}

// 13차 Figma(F-01)는 “나만의 준비물”만 삭제 불가로 적혀 있으나,
// 12차 CHG-126 문서 기준으로 필수/기본도 삭제 불가 유지 (문서 우선 · 피그마와 충돌).
function isProtectedCategory(c: Category) {
  const name = c.name.trim();
  return (
    c.kind === "essential" ||
    c.kind === "base" ||
    name === "필수 준비물" ||
    name === "기본 짐싸기" ||
    name === "필수" ||
    name === "기본"
  );
}

const SCROLL_OFFSET_RATIO = 0.2;
const SPOT_HOLD_MS = 800;
const COACH_DELAY_MS = 600;
const COACH_AUTO_MS = 5000;

function scrollItemIntoBand(scroller: HTMLElement, el: Element) {
  const dest = Math.max(
    0,
    scroller.scrollTop +
      el.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top -
      scroller.clientHeight * SCROLL_OFFSET_RATIO
  );
  scroller.scrollTo(0, dest);
}

const RECO_CARDS = [
  {
    title: "[왕복 무료배송] 오즈모 포켓3 대여 인천공항 당일수령 가능",
    src: "챙겨요 렌탈",
    img: "/carousel_1.png",
  },
  {
    title: "[출발 전날 수거] 무거운 수하물 보관부터 공항 배송까지",
    src: "챙겨요 러기지",
    img: "/carousel_2.png",
  },
] as const;

function RecoCarousel({ onSelect }: { onSelect: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; sl: number; moved: boolean } | null>(null);

  const onDown = (e: ReactPointerEvent) => {
    const el = ref.current;
    if (!el) return;
    drag.current = { x: e.clientX, sl: el.scrollLeft, moved: false };
    el.setPointerCapture(e.pointerId);
  };
  const onMove = (e: ReactPointerEvent) => {
    const el = ref.current;
    const d = drag.current;
    if (!el || !d) return;
    if (Math.abs(e.clientX - d.x) > 6) d.moved = true;
    el.scrollLeft = d.sl - (e.clientX - d.x);
  };
  const onUp = () => {
    drag.current = null;
  };

  return (
    <div
      ref={ref}
      className="reco-row"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {RECO_CARDS.map((card) => (
        <button
          type="button"
          className="reco"
          key={card.src}
          onClick={() => {
            if (drag.current?.moved) return;
            onSelect();
          }}
        >
          <div>
            <div className="txt">{card.title}</div>
            <div className="src">{card.src}</div>
          </div>
          <img className="thumb" src={card.img} alt="" width={50} height={50} draggable={false} />
        </button>
      ))}
    </div>
  );
}

export function ChecklistView({ tripId }: { tripId: string }) {
  const router = useRouter();
  const {
    trips,
    personalItems,
    updateTrip,
    addPersonalItem,
    renamePersonalItem,
    removePersonalItem,
    removePersonalCategory,
    restoreSnapshot,
  } = useStore();
  const trip = trips.find((t) => t.id === tripId);
  const [editing, setEditing] = useState(false);
  const [catMenu, setCatMenu] = useState<{ id: string; anchor: HTMLElement } | null>(null);
  const [confirmCat, setConfirmCat] = useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [rename, setRename] = useState<{ catId: string; itemId: string; name: string } | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [addText, setAddText] = useState("");
  const [toast, setToast] = useState<{
    msg: string;
    undo?: () => void;
    place?: "top" | "bottom";
  } | null>(null);
  const addRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);
  const undoRef = useRef<{ trips: Trip[]; personalItems: { id: string; name: string }[] } | null>(null);
  const collapseRef = useRef<Record<string, boolean>>({});
  const editEnteredAt = useRef(0);
  const renamedCount = useRef(0);
  const overpackRates = useRef<Record<string, number>>({});
  const lockedIds = useRef<Set<string>>(new Set());
  const [info, setInfo] = useState<{
    links: { text: string; url: string }[];
    note?: string;
    itemId?: string;
  } | null>(null);
  const [memo, setMemo] = useState<{
    catId: string;
    itemId: string;
    text: string;
    original: string;
  } | null>(null);
  const [, catalogTick] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [packGuide, setPackGuide] = useState(false);
  const [spotId, setSpotId] = useState<string | null>(null);
  const [coachOn, setCoachOn] = useState(false);
  const lastUncheckedId = useRef<string | null>(null);
  const spotHoldTimer = useRef<number | null>(null);
  const pendingScroll = useRef<string | null>(null);
  const addComposing = useRef(false);

  const selectedCount = useMemo(
    () => trip?.categories.reduce((n, c) => n + c.items.filter((i) => i.selected).length, 0) ?? 0,
    [trip]
  );

  const counts = useMemo(() => {
    const items = trip?.categories.flatMap((c) => c.items) ?? [];
    return {
      checked: items.filter((i) => i.checked).length,
      total: items.length,
      cart: items.filter((i) => i.wished && isPurchasable(i.masterId, i.name)).length,
    };
  }, [trip]);

  useEffect(() => {
    if (!trip) return;
    const added = new URLSearchParams(window.location.search).get("added");
    if (!added) return;
    const el = document.querySelector(`[data-cat-name="${CSS.escape(added)}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    router.replace(`/trips/${trip.id}`, { scroll: false });
  }, [router, trip]);

  useEffect(() => subscribeCatalog(() => catalogTick((n) => n + 1)), []);

  useEffect(() => {
    if (!trip) return;
    setLastHome(`/trips/${trip.id}`);
    if (!trip.seen) updateTrip(trip.id, (t) => (t.seen ? t : { ...t, seen: true }));
    const items = trip.categories.flatMap((c) => c.items);
    track("checklist_view", {
      item_count_total: items.length,
      checked_count: items.filter((i) => i.checked).length,
      wished_count: items.filter((i) => i.wished).length,
    });
  }, [trip?.id]);

  useEffect(() => {
    if (!editing || !trip) return;
    for (const cat of trip.categories) {
      if (cat.kind !== "activity") continue;
      for (const item of cat.items) {
        const rate = overpackRates.current[item.id];
        const copy = overpackCopy(rate);
        if (copy && rate != null) noteOverpackImpression(item.id, copy, rate);
      }
    }
  }, [editing, trip]);

  const [scrollNonce, setScrollNonce] = useState(0);
  useLayoutEffect(() => {
    const id = pendingScroll.current;
    if (!id) return;
    const scroll = scrollRef.current;
    const el = scroll?.querySelector(`[data-item-id="${CSS.escape(id)}"]`);
    if (!scroll || !el) return;
    pendingScroll.current = null;
    scrollItemIntoBand(scroll, el);
  }, [trip, scrollNonce]);

  useEffect(() => {
    if (!adding) return;
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-add-row]")) return;
      if (!addText.trim()) {
        setAdding(null);
        setAddText("");
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [adding, addText]);

  useEffect(() => {
    if (rename) requestAnimationFrame(() => renameRef.current?.focus());
  }, [rename]);

  useEffect(() => {
    if (!trip || editing) {
      setPackGuide(false);
      return;
    }
    setPackGuide(!hasSeenPackGuide());
  }, [trip?.id, editing, trip]);

  useEffect(() => {
    if (!trip || editing || packGuide || hasSeenCounterCoach()) {
      setCoachOn(false);
      return;
    }
    const show = window.setTimeout(() => {
      setCoachOn(true);
      markCounterCoachSeen();
    }, COACH_DELAY_MS);
    const hide = window.setTimeout(() => setCoachOn(false), COACH_DELAY_MS + COACH_AUTO_MS);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [trip?.id, editing, packGuide]);

  if (!trip) {
    return (
      <PhoneShell>
        <TopBar back={() => router.push("/trips")} />
        <div className="empty">일정을 찾을 수 없어요.</div>
      </PhoneShell>
    );
  }

  const save = (fn: (t: Trip) => Trip) => updateTrip(trip.id, fn);

  const clearSpot = () => {
    setSpotId(null);
    if (spotHoldTimer.current) window.clearTimeout(spotHoldTimer.current);
  };

  const spotlight = (itemId: string) => {
    const root = scrollRef.current;
    root?.querySelectorAll(".row.spot").forEach((row) => row.classList.remove("spot"));
    const el = root?.querySelector(`[data-item-id="${CSS.escape(itemId)}"]`) as HTMLElement | null;
    if (el) {
      void el.offsetWidth;
      el.classList.add("spot");
    }
    setSpotId(itemId);
    if (spotHoldTimer.current) window.clearTimeout(spotHoldTimer.current);
    spotHoldTimer.current = window.setTimeout(clearSpot, SPOT_HOLD_MS);
  };

  const pickNextUnchecked = () => {
    const rows = trip.categories.flatMap((cat) =>
      sortChecklistItems(cat.items).map((item) => ({ cat, item }))
    );
    const todo = rows.filter(({ item }) => !item.checked);
    if (!todo.length) return null;
    const from = lastUncheckedId.current
      ? rows.findIndex(({ item }) => item.id === lastUncheckedId.current)
      : -1;
    const next = todo.find(({ item }) => rows.findIndex((r) => r.item.id === item.id) > from);
    return next ? { ...next, wrapped: false } : { ...todo[0], wrapped: true };
  };

  const dismissCoach = () => {
    markCounterCoachSeen();
    setCoachOn(false);
  };

  const jumpUnchecked = () => {
    dismissCoach();
    const hit = pickNextUnchecked();
    if (!hit) {
      setToast({ msg: "다 챙기셨어요", place: "bottom" });
      return;
    }
    if (hit.wrapped) setToast({ msg: "처음으로 돌아왔어요", place: "bottom" });
    lastUncheckedId.current = hit.item.id;
    if (hit.cat.collapsed) {
      save((t) => patchCategory(t, hit.cat.id, (c) => ({ ...c, collapsed: false })));
    }
    spotlight(hit.item.id);
    pendingScroll.current = hit.item.id;
    setScrollNonce((n) => n + 1);
  };

  const toggleCat = (cat: Category) => {
    const next = !cat.collapsed;
    track("category_toggle", {
      category_name: cat.name,
      toggle_state: next ? "collapse" : "expand",
      item_count: cat.items.length,
    });
    save((t) => patchCategory(t, cat.id, (c) => ({ ...c, collapsed: !c.collapsed })));
  };

  const toggleChecked = (cat: Category, item: ChecklistItem) => {
    const next = !item.checked;
    save((t) => patchItem(t, cat.id, item.id, (i) => ({ ...i, checked: !i.checked })));
    track("item_check_toggle", {
      ...itemParams(cat, item),
      check_state: next ? "on" : "off",
    });
  };

  const toggleSelect = (catId: string, itemId: string) => {
    if (lockedIds.current.has(itemId)) return;
    save((t) => patchItem(t, catId, itemId, (i) => ({ ...i, selected: !i.selected })));
  };

  const enterEdit = () => {
    collapseRef.current = Object.fromEntries(trip.categories.map((c) => [c.id, c.collapsed]));
    editEnteredAt.current = Date.now();
    renamedCount.current = 0;
    lockedIds.current = new Set(
      trip.categories.flatMap((c) => c.items.filter((i) => i.checked).map((i) => i.id))
    );
    const snapshot = (cats: Category[]) => {
      const rates: Record<string, number> = {};
      for (const cat of cats) {
        if (cat.kind !== "activity") continue;
        for (const item of cat.items) {
          const rate = commentRateFor(cat.activityId, item.masterId, item.deleteRate);
          if (rate != null) rates[item.id] = rate;
        }
      }
      overpackRates.current = rates;
    };
    snapshot(trip.categories);
    void loadCatalogFromCloud().then(() => {
      snapshot(trip.categories);
      catalogTick((n) => n + 1);
    });
    track("edit_mode_enter", {
      item_count_total: counts.total,
      activity_count: trip.activities.length,
    });
    setEditing(true);
    clearSpot();
    save((t) => ({
      ...t,
      categories: t.categories.map((c) => ({ ...c, collapsed: false })),
    }));
  };

  const finishEdit = () => {
    const snap = collapseRef.current;
    track("edit_mode_exit", {
      renamed_count: renamedCount.current,
      duration_ms: Date.now() - editEnteredAt.current,
    });
    setEditing(false);
    setRename(null);
    lockedIds.current = new Set();
    save((t) => ({
      ...t,
      categories: t.categories.map((c) => ({
        ...c,
        collapsed: snap[c.id] ?? c.collapsed,
        items: c.items.map((i) => ({ ...i, selected: false })),
      })),
    }));
  };

  const deleteSelected = () => {
    const selected = trip.categories.flatMap((c) =>
      c.items.filter((i) => i.selected).map((i) => ({ cat: c, item: i }))
    );
    undoRef.current = { trips, personalItems };
    selected
      .filter(({ cat }) => isPersonalCat(cat))
      .forEach(({ item }) => removePersonalItem({ personalId: item.personalId, name: item.name }));
    selected.forEach(({ cat, item }) => trackItemDelete(cat, item, true));
    save((t) => ({
      ...t,
      categories: t.categories.map((c) =>
        isPersonalCat(c) ? c : { ...c, items: c.items.filter((i) => !i.selected) }
      ),
    }));
  };

  const deleteOne = (cat: Category, item: ChecklistItem) => {
    undoRef.current = { trips, personalItems };
    if (isPersonalCat(cat)) {
      removePersonalItem({ personalId: item.personalId, name: item.name });
    } else {
      save((t) =>
        patchCategory(t, cat.id, (c) => ({
          ...c,
          items: c.items.filter((i) => i.id !== item.id),
        }))
      );
      if (cat.kind === "activity" && item.masterId) {
        import("@/lib/stats").then(({ recordItemDelete }) => {
          recordItemDelete(cat.activityId ?? cat.kind, item.masterId!);
        });
      }
    }
    setToast({
      msg: "해당 항목을 지웠어요",
      place: "bottom",
      undo: () => {
        track("item_delete_undo", { item_id: item.id });
        if (undoRef.current) restoreSnapshot(undoRef.current);
        if (cat.kind === "activity" && item.masterId) {
          import("@/lib/stats").then(({ undoItemDelete }) => {
            undoItemDelete(cat.activityId ?? cat.kind, item.masterId!);
          });
        }
      },
    });
    trackItemDelete(cat, item, false);
  };

  const commitRename = () => {
    if (!rename) return;
    const name = rename.name.trim();
    if (!name) {
      setRename(null);
      return;
    }
    const cat = trip.categories.find((c) => c.id === rename.catId);
    const item = cat?.items.find((i) => i.id === rename.itemId);
    if (cat && item && name !== item.name) renamedCount.current += 1;
    if (cat && item && isPersonalCat(cat)) {
      renamePersonalItem({ personalId: item.personalId, name: item.name }, name);
    } else {
      save((t) => patchItem(t, rename.catId, rename.itemId, (i) => ({ ...i, name })));
    }
    setRename(null);
  };

  const keepAddFieldVisible = () => {
    const scroller = scrollRef.current;
    const el = addRef.current;
    if (!scroller || !el) return;
    const vv = window.visualViewport;
    const viewBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
    const viewTop = scroller.getBoundingClientRect().top;
    const rect = el.getBoundingClientRect();
    const pad = 28;
    if (rect.bottom > viewBottom - pad) {
      scroller.scrollTop += rect.bottom - (viewBottom - pad);
    } else if (rect.top < viewTop + pad) {
      scroller.scrollTop -= viewTop + pad - rect.top;
    }
  };

  const tryAdd = (catId: string, category: Category) => {
    const name = addText.trim();
    if (!name) return;
    if (addText.length > 30) {
      setToast({ msg: "최대 30자까지 입력할 수 있어요", place: "top" });
      return;
    }
    if (isPersonalCat(category)) {
      addPersonalItem(name);
    } else {
      save((t) =>
        patchCategory(t, catId, (c) => ({ ...c, items: [...c.items, newItem(name)] }))
      );
    }
    track("item_add_complete", { item_name_text: name, category_name: category.name });
    setAddText("");
    setAdding(catId);
    // CHG-134: 다음 아이템 추가 필드로 포커스 이동 시 키패드에 가리지 않게 스크롤 보정
    requestAnimationFrame(() => {
      addRef.current?.focus({ preventScroll: true });
      keepAddFieldVisible();
      requestAnimationFrame(keepAddFieldVisible);
    });
  };

  return (
    <PhoneShell>
      <TopBar
        float
        back={
          editing
            ? undefined
            : () => {
                setEntry("back");
                router.push("/trips");
              }
        }
        center={
          editing ? undefined : (
            <button className="topbar-count" aria-label="미체크 아이템으로 이동" onClick={jumpUnchecked}>
              <IconCheckHeader />
              {counts.checked} / {counts.total}
            </button>
          )
        }
        right={
          <div className="topbar-end">
            {editing ? (
              <button className="topbar-done" onClick={finishEdit}>
                완료
              </button>
            ) : (
              <button className="topbar-done" aria-label="편집" onClick={enterEdit}>
                편집
              </button>
            )}
          </div>
        }
      />
      {!editing && coachOn ? (
        <button type="button" className="counter-coach on" role="tooltip" onClick={dismissCoach}>
          눌러서 안 챙긴 준비물을 확인해요
        </button>
      ) : null}

      <div className="shell-scroll" ref={scrollRef}>
        <div className="pad-c">
          <p className="t-caption" style={{ color: "var(--text-3)", margin: "0 0 4px" }}>
            {checklistSubtitle(countryName(trip.countryId), trip.startDate, trip.endDate)}
          </p>
          <h1 className="t-title1" style={{ margin: 0 }}>
            여행 준비
            <br />
            체크리스트
          </h1>
          <div className="reco-head">여행자님을 위한 추천</div>
        </div>
        <RecoCarousel onSelect={() => setToast({ msg: "상품을 준비하고 있어요", place: "bottom" })} />
        <div className="reco-more">추천 아이템 모두 보기</div>

        {trip.categories.map((cat) => {
          const items = sortChecklistItems(cat.items);
          return (
            <section key={cat.id} data-cat-name={cat.name}>
              <div style={{ position: "relative" }}>
                <div
                  className="cat-head"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (editing) return;
                    toggleCat(cat);
                  }}
                  onKeyDown={(e) => {
                    if (editing) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleCat(cat);
                    }
                  }}
                >
                  <span className="title">
                    {cat.name}
                    {cat.collapsed ? ` · ${cat.items.length}` : ""}
                  </span>
                  {cat.hint ? <span className="hint">{cat.hint}</span> : null}
                  {editing ? (
                    isPersonalCat(cat) || isProtectedCategory(cat) ? null : (
                    <button
                      className="hit-icon"
                      aria-label="카테고리 메뉴"
                      onClick={(e) => {
                        e.stopPropagation();
                        const el = e.currentTarget;
                        setCatMenu(catMenu?.id === cat.id ? null : { id: cat.id, anchor: el });
                      }}
                    >
                      <IconMeatball active={catMenu?.id === cat.id} />
                    </button>
                    )
                  ) : (
                    <IconChevron up={!cat.collapsed} />
                  )}
                </div>
              </div>
              {cat.collapsed ? null : (
                <>
                  {items.map((item) => {
                    const pack =
                      editing && cat.kind === "activity"
                        ? overpackCopy(overpackRates.current[item.id])
                        : null;
                    const reason = pack ? null : item.reason;
                    const renaming = rename?.catId === cat.id && rename.itemId === item.id;
                    const locked = editing && lockedIds.current.has(item.id);
                    const cartable = isPurchasable(item.masterId, item.name);
                    return (
                      <div
                        className={`row${reason || pack ? " sub" : ""}${spotId === item.id ? " spot" : ""}`}
                        key={item.id}
                        data-item-id={item.id}
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target.closest("button, input, textarea, a")) return;
                          if (editing) {
                            toggleSelect(cat.id, item.id);
                          }
                        }}
                      >
                        <button
                          className={`cbx${
                            editing
                              ? locked
                                ? " locked"
                                : item.selected
                                  ? " del"
                                  : ""
                              : item.checked
                                ? " on"
                                : ""
                          }`}
                          aria-label={editing ? (locked ? "이미 챙긴 항목" : "삭제 선택") : "준비 완료"}
                          disabled={locked}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (editing) {
                              toggleSelect(cat.id, item.id);
                              return;
                            }
                            toggleChecked(cat, item);
                          }}
                        >
                          {(editing && (item.selected || locked)) || (!editing && item.checked) ? (
                            <IconCheck />
                          ) : null}
                        </button>
                        <div
                          className={`body${editing || renaming ? "" : " memo"}`}
                          onClick={(e) => {
                            if (editing || renaming) return;
                            e.stopPropagation();
                            setMemo({
                              catId: cat.id,
                              itemId: item.id,
                              text: item.reason ?? "",
                              original: item.reason ?? "",
                            });
                          }}
                        >
                          {renaming ? (
                            <input
                              ref={renameRef}
                              value={rename.name}
                              onChange={(e) => {
                                const next = e.target.value;
                                if (next.length > 30) {
                                  setRename({ ...rename, name: next.slice(0, 30) });
                                  setToast({ msg: "최대 30자까지 입력할 수 있어요", place: "top" });
                                  return;
                                }
                                setRename({ ...rename, name: next });
                              }}
                              onFocus={(e) => e.currentTarget.select()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitRename();
                                if (e.key === "Escape") setRename(null);
                              }}
                              onBlur={commitRename}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span className="name">{item.name}</span>
                          )}
                          {pack ? (
                            <span className="desc overpack">
                              <IconOverpack />
                              {pack}
                            </span>
                          ) : reason ? (
                            <span className={`desc${item.userMemo ? " user-memo" : ""}`}>
                              {item.userMemo ? <i className="memo-dot" aria-hidden /> : null}
                              <span>{reason}</span>
                            </span>
                          ) : null}
                        </div>
                        {editing ? (
                          <div className="row-actions edit">
                            {item.custom ? (
                              <button
                                className="hit-icon"
                                aria-label={renaming ? "이름 저장" : "이름 변경"}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (renaming) commitRename();
                                  else setRename({ catId: cat.id, itemId: item.id, name: item.name });
                                }}
                              >
                                <IconPencil color={renaming ? "var(--primary)" : "var(--text-3)"} />
                              </button>
                            ) : null}
                            {renaming ? null : (
                              <button
                                className="hit-icon"
                                aria-label="삭제"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteOne(cat, item);
                                }}
                              >
                                <IconXSmall />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="row-actions">
                            {hasInfoIcon(item.masterId, item.name, item.linkNote) ? (
                              <button
                                className="hit-icon"
                                aria-label="정보"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInfo({
                                    links: item.links ?? [],
                                    note: item.linkNote,
                                    itemId: item.id,
                                  });
                                }}
                              >
                                <IconInfo />
                              </button>
                            ) : null}
                            {cartable ? (
                            <button
                              className="hit-icon"
                              aria-label="장바구니"
                              onClick={(e) => {
                                e.stopPropagation();
                                save((t) =>
                                  patchItem(t, cat.id, item.id, (i) => ({ ...i, wished: !i.wished }))
                                );
                                track("item_wish_toggle", {
                                  ...itemParams(cat, item),
                                  wish_state: item.wished ? "off" : "on",
                                });
                              }}
                            >
                              <IconCart on={item.wished} />
                            </button>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {editing ? null : (
                    <div className="row" data-add-row>
                      <span className="cbx add" />
                      <div className="body">
                        {adding === cat.id ? (
                          <input
                            ref={addRef}
                            className="add-inline"
                            autoFocus
                            value={addText}
                            placeholder="직접 아이템을 입력해주세요"
                            enterKeyHint="next"
                            onFocus={() => {
                              requestAnimationFrame(keepAddFieldVisible);
                            }}
                            onBeforeInput={(e) => {
                              const ne = e.nativeEvent as InputEvent;
                              if (!ne.inputType?.startsWith("insert") || !ne.data) return;
                              if (ne.inputType === "insertCompositionText") return;
                              const el = e.currentTarget;
                              const selected = (el.selectionEnd ?? 0) - (el.selectionStart ?? 0);
                              if (addText.length - selected + ne.data.length > 30) {
                                e.preventDefault();
                                setToast({ msg: "최대 30자까지 입력할 수 있어요", place: "top" });
                              }
                            }}
                            onChange={(e) => {
                              const next = e.target.value;
                              if (next.length > 30) {
                                setAddText(next.slice(0, 30));
                                setToast({ msg: "최대 30자까지 입력할 수 있어요", place: "top" });
                              } else {
                                setAddText(next);
                              }
                              requestAnimationFrame(() => {
                                const el = addRef.current;
                                if (el) el.scrollLeft = el.scrollWidth;
                              });
                            }}
                            onCompositionStart={() => {
                              addComposing.current = true;
                            }}
                            onCompositionEnd={() => {
                              addComposing.current = false;
                            }}
                            onKeyDown={(e) => {
                              if (e.key !== "Enter") return;
                              e.preventDefault();
                              if (e.nativeEvent.isComposing || e.keyCode === 229 || addComposing.current) return;
                              tryAdd(cat.id, cat);
                            }}
                          />
                        ) : (
                          <button
                            className="name name-add"
                            style={{ background: "none", border: "none", padding: 0, textAlign: "left" }}
                            onClick={() => {
                              setAdding(cat.id);
                              setAddText("");
                              requestAnimationFrame(() => {
                                addRef.current?.focus({ preventScroll: true });
                                keepAddFieldVisible();
                              });
                            }}
                          >
                            아이템 추가
                          </button>
                        )}
                      </div>
                      {adding === cat.id ? (
                        <button
                          className="hit-icon"
                          aria-label="추가"
                          disabled={!addText.trim() || addText.length > 30}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => tryAdd(cat.id, cat)}
                        >
                          <IconPlus
                            color={
                              addText.trim() && addText.length <= 30
                                ? "var(--primary)"
                                : "var(--text-3)"
                            }
                          />
                        </button>
                      ) : null}
                    </div>
                  )}
                </>
              )}
            </section>
          );
        })}

        <div className="footer-legal">
          <button
            className="addcat"
            onClick={() => {
              track("category_add_click", { current_category_count: trip.categories.length });
              router.push(`/trips/${trip.id}/categories`);
            }}
          >
            카테고리 추가
          </button>
          <div className="legalwrap">
            <p className="legal">{LEGAL}</p>
            <div className="legaldiv" />
            <p className="legal2">기후 정보는 2015년~2024년 관측값을 바탕으로 한 추정값입니다.</p>
            <p className="legal2">
              Weather data by{" "}
              <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
                Open-Meteo.com
              </a>{" "}
              (CC BY 4.0)
            </p>
            <p className="legal2" style={{ marginTop: 10 }}>
              아이템 추가·수정·삭제 등의 의견이 있으시다면 아래의 메일로 문의 부탁드립니다.
              <br />
              <a href={MAILTO}>chaeggyeo@gmail.com</a>로 메일 보내기
            </p>
          </div>
        </div>
      </div>

      {editing ? (
        <div className="actionbar">
          <span className="cnt">{selectedCount}개 선택됨</span>
          <button
            className={`act${selectedCount === 0 ? " off" : ""}`}
            disabled={selectedCount === 0}
            onClick={() => setConfirmBulk(true)}
          >
            삭제
          </button>
        </div>
      ) : (
        <button
          className="cart-fab"
          aria-label="장바구니 바로가기"
          onClick={() => {
            setToast({ msg: "바로 주문 기능을 준비하고 있어요", place: "bottom" });
          }}
        >
          <IconCartFab />
          {counts.cart > 0 ? (
            <span className="cart-fab-badge">{counts.cart > 99 ? "99+" : counts.cart}</span>
          ) : null}
        </button>
      )}

      {catMenu ? (
        <Menu
          anchor={catMenu.anchor}
          width={179}
          onClose={() => setCatMenu(null)}
          items={[
            {
              label: "카테고리 삭제하기",
              onClick: () => setConfirmCat(catMenu.id),
            },
          ]}
        />
      ) : null}

      {confirmBulk ? (
        <ConfirmDialog
          message={"선택한 전체 아이템이 함께 삭제됩니다.\n아이템을 삭제하시겠습니까?"}
          onCancel={() => setConfirmBulk(false)}
          onConfirm={() => {
            deleteSelected();
            setConfirmBulk(false);
          }}
        />
      ) : null}

      {confirmCat ? (
        <ConfirmDialog
          message={"카테고리에 속한 아이템이\n함께 삭제됩니다.\n카테고리를 삭제하시겠습니까?"}
          onCancel={() => setConfirmCat(null)}
          onConfirm={() => {
            const cat = trip.categories.find((c) => c.id === confirmCat);
            if (cat) {
              track("category_delete_complete", {
                category_name: cat.name,
                deleted_item_count: cat.items.length,
              });
            }
            if (cat && isProtectedCategory(cat)) {
              setConfirmCat(null);
              setCatMenu(null);
              return;
            }
            if (cat && isPersonalCat(cat)) removePersonalCategory();
            else {
              save((t) => {
                let activities = t.activities;
                if (cat?.kind === "activity" && cat.activityId) {
                  activities = activities.filter((a) => a !== cat.activityId);
                }
                return {
                  ...t,
                  activities,
                  categories: t.categories.filter((c) => c.id !== confirmCat),
                };
              });
            }
            setConfirmCat(null);
            setCatMenu(null);
          }}
        />
      ) : null}

      {info ? (
        <InfoSheet
          links={info.links}
          note={info.note}
          itemId={info.itemId}
          onClose={() => setInfo(null)}
        />
      ) : null}

      {!editing && packGuide ? (
        <PackGuideSheet
          onClose={() => {
            markPackGuideSeen();
            setPackGuide(false);
          }}
        />
      ) : null}

      {memo ? (
        <InputDialog
          title="아이템 메모 추가/변경"
          value={memo.text}
          maxLength={100}
          placeholder="최대 100글자로 메모 직접 입력하기"
          onChange={(v) => setMemo({ ...memo, text: v })}
          confirmDisabled={memo.text === memo.original}
          onLimit={() => setToast({ msg: "최대 100자까지 입력할 수 있어요", place: "top" })}
          onCancel={() => setMemo(null)}
          onConfirm={() => {
            // CHG-130: 빈 값이면 메모 영역 제거, 줄바꿈은 그대로 저장
            const cleared = !memo.text.trim();
            save((t) =>
              patchItem(t, memo.catId, memo.itemId, (i) =>
                cleared
                  ? { ...i, reason: undefined, userMemo: undefined }
                  : { ...i, reason: memo.text, userMemo: true }
              )
            );
            setMemo(null);
          }}
        />
      ) : null}

      {toast ? (
        <Toast
          message={toast.msg}
          action={toast.undo ? "되돌리기" : undefined}
          onAction={toast.undo}
          onDone={() => setToast(null)}
          place={toast.place ?? "top"}
          raised={editing && toast.place === "bottom"}
        />
      ) : null}
    </PhoneShell>
  );
}

export function unusedPresetNames(trip: Trip) {
  const alias: Record<string, string> = { 필수: "필수 준비물", 기본: "기본 짐싸기" };
  const used = new Set(trip.categories.map((c) => alias[c.name.trim()] ?? c.name.trim()));
  return livePresetCategoryNames().filter((n) => n !== "나만의 준비물" && !used.has(n));
}

function tripMasterIds(trip: Trip) {
  const ids = new Set<string>();
  for (const cat of trip.categories) {
    for (const item of cat.items) {
      if (item.masterId) ids.add(item.masterId);
    }
  }
  return ids;
}

function appendCategory(trip: Trip, cat: Category): Trip {
  const used = tripMasterIds(trip);
  const items = cat.items.filter((i) => !i.masterId || !used.has(i.masterId));
  const nextCat = { ...cat, items };
  let next: Trip = { ...trip, categories: [...trip.categories, nextCat] };
  if (nextCat.kind === "activity" && nextCat.activityId && !next.activities.includes(nextCat.activityId)) {
    next = { ...next, activities: [...next.activities, nextCat.activityId] };
  }
  return next;
}

export function addCategoryToTrip(
  trip: Trip,
  name: string,
  personalItems: { id: string; name: string }[] = []
): Trip {
  const alias: Record<string, string> = { 필수: "필수 준비물", 기본: "기본 짐싸기" };
  const canon = alias[name] ?? name;
  if (trip.categories.some((c) => (alias[c.name] ?? c.name) === canon)) return trip;
  const cat = categoryFromPreset(name, personalItems);
  if (name !== cat.name && cat.items.length === 0 && cat.kind === "custom") {
    return appendCategory(trip, emptyCustomCategory(name));
  }
  if (name === "나만의 준비물") {
    if (trip.categories.some(isPersonalCat)) return trip;
    const empty = emptyCustomCategory("나만의 준비물");
    empty.kind = "personal";
    empty.hint = "모든 여행 일정에 담겨요";
    return { ...trip, categories: [empty, ...trip.categories] };
  }
  return appendCategory(trip, cat);
}
