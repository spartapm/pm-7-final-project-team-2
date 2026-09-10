"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { countryName, PRESET_CATEGORY_NAMES } from "@/lib/catalog";
import { checklistSubtitle } from "@/lib/dates";
import { track } from "@/lib/analytics";
import { categoryFromPreset, emptyCustomCategory } from "@/lib/generate";
import { deleteRateFor, hasInfoIcon, overpackCopy } from "@/lib/itemMeta";
import { subscribeCatalog } from "@/lib/liveCatalog";
import { setLastHome } from "@/lib/lastHome";
import { newItem, patchCategory, patchItem, useStore } from "@/lib/store";
import type { Category, ChecklistItem, FilterMode, Trip } from "@/lib/types";
import {
  IconCheck,
  IconCheckSm,
  IconChevron,
  IconHeart,
  IconHeartSm,
  IconInfo,
  IconMeatball,
  IconOverpack,
  IconPencil,
  IconPlus,
  IconXSmall,
  PhoneShell,
} from "./icons";
import { ConfirmDialog, InfoSheet, Menu, Toast, TopBar } from "./ui";

const LEGAL =
  "챙겨요(가칭)가 제공하는 국가별 반입 주의·금지 품목 및 관련 법적·규정 정보는 각 항목에 표시된 작성·갱신 기준일 시점에 확인된 내용을 바탕으로 한 참고용 정보입니다. 관련 법령 및 규정은 국가와 시기에 따라 사전 예고 없이 변경될 수 있으며, 본 서비스가 제공하는 정보가 실제 세관·출입국 규정과 다를 수 있습니다. 챙겨요(가칭)는 해당 정보의 최신성·정확성·완전성을 보장하지 않으며, 이를 신뢰하여 발생한 불이익이나 손해에 대해 책임을 지지 않습니다. 정확한 반입 규정은 반드시 이용 항공사, 목적지 국가의 대사관·영사관, 관세청 등 공식 기관을 통해 여행 전 별도로 확인하시기 바랍니다.";

function isPersonalCat(c: Category) {
  return c.kind === "personal" || c.name === "나만의 준비물";
}

function RecoCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; sl: number } | null>(null);

  const onDown = (e: ReactPointerEvent) => {
    const el = ref.current;
    if (!el) return;
    drag.current = { x: e.clientX, sl: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
  };
  const onMove = (e: ReactPointerEvent) => {
    const el = ref.current;
    const d = drag.current;
    if (!el || !d) return;
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
      {[0, 1].map((i) => (
        <div className="reco" key={i}>
          <div>
            <div className="txt">여행자님이 좋아하실 상품을 준비하고 있어요.</div>
            <div className="src">트리플 추천</div>
          </div>
          <div className="thumb" />
        </div>
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
  const [filter, setFilter] = useState<FilterMode>("all");
  const [kebabOpen, setKebabOpen] = useState(false);
  const [catMenu, setCatMenu] = useState<{ id: string; anchor: HTMLElement } | null>(null);
  const kebabRef = useRef<HTMLButtonElement>(null);
  const [confirmCat, setConfirmCat] = useState<string | null>(null);
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
  const [info, setInfo] = useState<{ links: { text: string; url: string }[]; note?: string } | null>(null);
  const [counterOn, setCounterOn] = useState(true);
  const [, catalogTick] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedCount = useMemo(
    () => trip?.categories.reduce((n, c) => n + c.items.filter((i) => i.selected).length, 0) ?? 0,
    [trip]
  );

  const counts = useMemo(() => {
    const items = trip?.categories.flatMap((c) => c.items) ?? [];
    return {
      checked: items.filter((i) => i.checked).length,
      total: items.length,
      wished: items.filter((i) => i.wished).length,
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
  }, [trip?.id]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let last = el.scrollTop;
    const onScroll = () => {
      const y = el.scrollTop;
      if (y < last - 4) setCounterOn(true);
      else if (y > last + 4) setCounterOn(false);
      last = y;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [trip?.id]);

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

  const orderedCats = useMemo(() => {
    const cats = trip?.categories ?? [];
    if (filter === "all") return cats;
    const vis = (item: ChecklistItem) => {
      if (filter === "unchecked") return !item.checked;
      if (filter === "wished") return item.wished;
      return true;
    };
    return [...cats].sort((a, b) => {
      const am = a.items.some(vis) ? 0 : 1;
      const bm = b.items.some(vis) ? 0 : 1;
      return am - bm;
    });
  }, [trip?.categories, filter]);

  if (!trip) {
    return (
      <PhoneShell>
        <TopBar back={() => router.push("/trips")} />
        <div className="empty">일정을 찾을 수 없어요.</div>
      </PhoneShell>
    );
  }

  const save = (fn: (t: Trip) => Trip) => updateTrip(trip.id, fn);

  const visible = (item: ChecklistItem) => {
    if (filter === "unchecked") return !item.checked;
    if (filter === "wished") return item.wished;
    return true;
  };

  const toggleChecked = (catId: string, item: ChecklistItem) => {
    save((t) => patchItem(t, catId, item.id, (i) => ({ ...i, checked: !i.checked })));
    track("item_status_changed", {
      item_id: item.id,
      status: item.checked ? "skip" : "has",
    });
  };

  const toggleSelect = (catId: string, itemId: string) => {
    save((t) => patchItem(t, catId, itemId, (i) => ({ ...i, selected: !i.selected })));
  };

  const kebabItems = () => {
    const items = [
      {
        label: "편집",
        onClick: () => {
          collapseRef.current = Object.fromEntries(trip.categories.map((c) => [c.id, c.collapsed]));
          setEditing(true);
          save((t) => ({
            ...t,
            categories: t.categories.map((c) => ({ ...c, collapsed: false })),
          }));
        },
      },
    ];
    if (filter !== "all") {
      items.push({
        label: "전체 아이템 보기",
        onClick: () => setFilter("all"),
      });
      return items;
    }
    const expandAll = () =>
      save((t) => ({
        ...t,
        categories: t.categories.map((c) => ({ ...c, collapsed: false })),
      }));
    items.push({
      label: "미체크 아이템 모아보기",
      onClick: () => {
        setFilter("unchecked");
        expandAll();
      },
    });
    items.push({
      label: "찜한 아이템 모아보기",
      onClick: () => {
        setFilter("wished");
        expandAll();
      },
    });
    return items;
  };

  const finishEdit = () => {
    const snap = collapseRef.current;
    setEditing(false);
    setRename(null);
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
    save((t) => ({
      ...t,
      categories: t.categories.map((c) =>
        isPersonalCat(c) ? c : { ...c, items: c.items.filter((i) => !i.selected) }
      ),
    }));
    track("item_removed", { is_bulk: true });
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
        if (undoRef.current) restoreSnapshot(undoRef.current);
        if (cat.kind === "activity" && item.masterId) {
          import("@/lib/stats").then(({ undoItemDelete }) => {
            undoItemDelete(cat.activityId ?? cat.kind, item.masterId!);
          });
        }
      },
    });
    track("item_removed", { is_bulk: false, item_id: item.id });
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
    if (cat && item && isPersonalCat(cat)) {
      renamePersonalItem({ personalId: item.personalId, name: item.name }, name);
    } else {
      save((t) => patchItem(t, rename.catId, rename.itemId, (i) => ({ ...i, name })));
    }
    setRename(null);
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
    track("item_added", { is_bulk: false });
    setAddText("");
    setAdding(catId);
    requestAnimationFrame(() => addRef.current?.focus());
  };

  return (
    <PhoneShell>
      <TopBar
        float
        back={editing ? undefined : () => router.push("/trips")}
        kebab={
          !editing
            ? () => {
                setCatMenu(null);
                setKebabOpen((v) => !v);
              }
            : undefined
        }
        kebabActive={kebabOpen}
        kebabRef={kebabRef}
        right={
          editing ? (
            <button className="topbar-done" onClick={finishEdit}>
              완료
            </button>
          ) : undefined
        }
      />
      {kebabOpen && kebabRef.current ? (
        <Menu anchor={kebabRef.current} items={kebabItems()} onClose={() => setKebabOpen(false)} />
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
        <RecoCarousel />
        <div className="reco-more">추천 아이템 모두 보기</div>

        {orderedCats.map((cat) => {
          const items = cat.items.filter(visible);
          return (
            <section key={cat.id} data-cat-name={cat.name}>
              <div style={{ position: "relative" }}>
                <div
                  className="cat-head"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (editing) return;
                    save((t) => patchCategory(t, cat.id, (c) => ({ ...c, collapsed: !c.collapsed })));
                  }}
                  onKeyDown={(e) => {
                    if (editing) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      save((t) => patchCategory(t, cat.id, (c) => ({ ...c, collapsed: !c.collapsed })));
                    }
                  }}
                >
                  <span className="title">
                    {cat.name}
                    {cat.collapsed ? ` · ${cat.items.length}` : ""}
                  </span>
                  {cat.hint ? <span className="hint">{cat.hint}</span> : null}
                  {editing ? (
                    <button
                      className="hit-icon"
                      aria-label="카테고리 메뉴"
                      onClick={(e) => {
                        e.stopPropagation();
                        const el = e.currentTarget;
                        setKebabOpen(false);
                        setCatMenu(catMenu?.id === cat.id ? null : { id: cat.id, anchor: el });
                      }}
                    >
                      <IconMeatball active={catMenu?.id === cat.id} />
                    </button>
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
                        ? overpackCopy(deleteRateFor(cat.activityId, item.masterId) ?? item.deleteRate)
                        : null;
                    const reason = pack ? null : item.reason;
                    const renaming = rename?.catId === cat.id && rename.itemId === item.id;
                    return (
                      <div
                        className={`row${reason || pack ? " sub" : ""}`}
                        key={item.id}
                        data-item-id={item.id}
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target.closest("button, input, textarea, a")) return;
                          if (editing) {
                            toggleSelect(cat.id, item.id);
                            return;
                          }
                          toggleChecked(cat.id, item);
                        }}
                      >
                        <button
                          className={`cbx${editing ? (item.selected ? " del" : "") : item.checked ? " on" : ""}`}
                          aria-label={editing ? "삭제 선택" : "준비 완료"}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (editing) {
                              toggleSelect(cat.id, item.id);
                              return;
                            }
                            toggleChecked(cat.id, item);
                          }}
                        >
                          {(editing && item.selected) || (!editing && item.checked) ? <IconCheck /> : null}
                        </button>
                        <div className="body">
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
                            <span className="desc">{reason}</span>
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
                                  });
                                }}
                              >
                                <IconInfo />
                              </button>
                            ) : null}
                            <button
                              className="hit-icon"
                              aria-label="찜"
                              onClick={(e) => {
                                e.stopPropagation();
                                save((t) =>
                                  patchItem(t, cat.id, item.id, (i) => ({ ...i, wished: !i.wished }))
                                );
                                track("item_status_changed", {
                                  item_id: item.id,
                                  status: item.wished ? "has" : "need",
                                });
                              }}
                            >
                              <IconHeart on={item.wished} />
                            </button>
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
                            onChange={(e) => {
                              const next = e.target.value;
                              if (next.length > 30 && addText.length <= 30) {
                                setToast({ msg: "최대 30자까지 입력할 수 있어요", place: "top" });
                              }
                              setAddText(next);
                              requestAnimationFrame(() => {
                                const el = addRef.current;
                                if (el) el.scrollLeft = el.scrollWidth;
                              });
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") tryAdd(cat.id, cat);
                            }}
                          />
                        ) : (
                          <button
                            className="name name-add"
                            style={{ background: "none", border: "none", padding: 0, textAlign: "left" }}
                            onClick={() => {
                              setAdding(cat.id);
                              setAddText("");
                              requestAnimationFrame(() => addRef.current?.focus());
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
                          aria-disabled={!addText.trim() || addText.length > 30}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => tryAdd(cat.id, cat)}
                        >
                          <IconPlus color={addText.length > 30 ? "var(--text-3)" : "var(--primary)"} />
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
          <button className="addcat" onClick={() => router.push(`/trips/${trip.id}/categories`)}>
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
          </div>
        </div>
      </div>

      {editing ? (
        <div className="actionbar">
          <span className="cnt">{selectedCount}개 선택됨</span>
          <button
            className={`act${selectedCount === 0 ? " off" : ""}`}
            disabled={selectedCount === 0}
            onClick={deleteSelected}
          >
            삭제
          </button>
        </div>
      ) : (
        <div className={`float-count${counterOn ? "" : " off"}`}>
          <span className="n">
            <IconCheckSm />
            {counts.checked}/{counts.total}
          </span>
          <span className="div" />
          <span className="n">
            <IconHeartSm />
            {counts.wished}
          </span>
        </div>
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

      {confirmCat ? (
        <ConfirmDialog
          message={"카테고리에 속한 아이템이\n함께 삭제됩니다.\n카테고리를 삭제하시겠습니까?"}
          onCancel={() => setConfirmCat(null)}
          onConfirm={() => {
            const cat = trip.categories.find((c) => c.id === confirmCat);
            if (cat && isPersonalCat(cat)) removePersonalCategory();
            else save((t) => ({ ...t, categories: t.categories.filter((c) => c.id !== confirmCat) }));
            setConfirmCat(null);
            setCatMenu(null);
          }}
        />
      ) : null}

      {info ? <InfoSheet links={info.links} note={info.note} onClose={() => setInfo(null)} /> : null}

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
  return PRESET_CATEGORY_NAMES.filter((n) => !used.has(n));
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
    const fallback = emptyCustomCategory(name);
    return { ...trip, categories: [...trip.categories, fallback] };
  }
  if (name === "나만의 준비물") {
    const empty = emptyCustomCategory("나만의 준비물");
    empty.kind = "personal";
    empty.hint = "모든 여행 일정에 담겨요";
    return { ...trip, categories: [empty, ...trip.categories] };
  }
  return { ...trip, categories: [...trip.categories, cat] };
}
