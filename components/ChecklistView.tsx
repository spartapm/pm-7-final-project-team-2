"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { countryName, PRESET_CATEGORY_NAMES } from "@/lib/catalog";
import { checklistSubtitle } from "@/lib/dates";
import { track } from "@/lib/analytics";
import { emptyCustomCategory } from "@/lib/generate";
import { newItem, patchCategory, patchItem, useStore } from "@/lib/store";
import type { Category, ChecklistItem, FilterMode, Trip } from "@/lib/types";
import {
  IconCheck,
  IconChevron,
  IconHeart,
  IconMeatball,
  IconPencil,
  IconPlus,
  IconXSmall,
  PhoneShell,
} from "./icons";
import { ConfirmDialog, InputDialog, Menu, Toast, TopBar } from "./ui";

const LEGAL =
  "챙겨요(가칭)가 제공하는 국가별 반입 주의·금지 품목 및 관련 법적·규정 정보는 각 항목에 표시된 작성·갱신 기준일 시점에 확인된 내용을 바탕으로 한 참고용 정보입니다. 관련 법령 및 규정은 국가와 시기에 따라 사전 예고 없이 변경될 수 있으며, 본 서비스가 제공하는 정보가 실제 세관·출입국 규정과 다를 수 있습니다. 챙겨요(가칭)는 해당 정보의 최신성·정확성·완전성을 보장하지 않으며, 이를 신뢰하여 발생한 불이익이나 손해에 대해 책임을 지지 않습니다. 정확한 반입 규정은 반드시 이용 항공사, 목적지 국가의 대사관·영사관, 관세청 등 공식 기관을 통해 여행 전 별도로 확인하시기 바랍니다.";

export function ChecklistView({ tripId }: { tripId: string }) {
  const router = useRouter();
  const { trips, updateTrip, addPersonalItem } = useStore();
  const trip = trips.find((t) => t.id === tripId);
  const [editing, setEditing] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [kebabOpen, setKebabOpen] = useState(false);
  const [catMenu, setCatMenu] = useState<{ id: string; anchor: HTMLElement } | null>(null);
  const kebabRef = useRef<HTMLButtonElement>(null);
  const [confirmCat, setConfirmCat] = useState<string | null>(null);
  const [rename, setRename] = useState<{ catId: string; itemId: string; name: string } | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [addText, setAddText] = useState("");
  const [toast, setToast] = useState<{ msg: string; undo?: () => void } | null>(null);
  const addRef = useRef<HTMLInputElement>(null);
  const undoRef = useRef<Trip | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [drag, setDrag] = useState<{ itemId: string; overId: string } | null>(null);
  const dragRef = useRef<{
    catId: string;
    itemId: string;
    overId: string;
    timer: number | null;
    armed: boolean;
    startX: number;
    startY: number;
  } | null>(null);

  const selectedCount = useMemo(
    () => trip?.categories.reduce((n, c) => n + c.items.filter((i) => i.selected).length, 0) ?? 0,
    [trip]
  );

  useEffect(() => {
    if (!trip) return;
    const added = new URLSearchParams(window.location.search).get("added");
    if (!added) return;
    const el = document.querySelector(`[data-cat-name="${CSS.escape(added)}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    router.replace(`/trips/${trip.id}`, { scroll: false });
  }, [router, trip]);

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

  const endDrag = (commit: boolean) => {
    const d = dragRef.current;
    if (d?.timer) window.clearTimeout(d.timer);
    if (commit && d?.armed && d.itemId !== d.overId) {
      save((t) =>
        patchCategory(t, d.catId, (c) => {
          const vis = c.items.filter(visible);
          const from = vis.findIndex((i) => i.id === d.itemId);
          const to = vis.findIndex((i) => i.id === d.overId);
          if (from < 0 || to < 0) return c;
          const ids = vis.map((i) => i.id);
          const [moved] = ids.splice(from, 1);
          ids.splice(to, 0, moved);
          const visSet = new Set(ids);
          const hidden = c.items.filter((i) => !visSet.has(i.id));
          const ordered = ids.map((id) => c.items.find((i) => i.id === id)!);
          return { ...c, items: [...ordered, ...hidden] };
        })
      );
    }
    dragRef.current = null;
    setDrag(null);
    document.querySelector(".shell-scroll")?.classList.remove("lock");
  };

  const onItemPointerDown = (catId: string, itemId: string, e: ReactPointerEvent) => {
    if (editing || selecting) return;
    if ((e.target as HTMLElement).closest("button, input")) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const timer = window.setTimeout(() => {
      if (!dragRef.current) return;
      dragRef.current.armed = true;
      document.querySelector(".shell-scroll")?.classList.add("lock");
      setDrag({ itemId, overId: itemId });
    }, 1000);
    dragRef.current = { catId, itemId, overId: itemId, timer, armed: false, startX, startY };

    const move = (ev: PointerEvent) => {
      const cur = dragRef.current;
      if (!cur) return;
      if (!cur.armed) {
        if (Math.hypot(ev.clientX - cur.startX, ev.clientY - cur.startY) > 8) {
          if (cur.timer) window.clearTimeout(cur.timer);
          cur.timer = null;
        }
        return;
      }
      ev.preventDefault();
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      const row = el?.closest("[data-item-id]") as HTMLElement | null;
      const overId = row?.dataset.itemId;
      if (overId && overId !== cur.overId) {
        cur.overId = overId;
        setDrag({ itemId: cur.itemId, overId });
      }
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      endDrag(true);
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const toggleChecked = (catId: string, item: ChecklistItem) => {
    save((t) =>
      patchCategory(t, catId, (c) => {
        const next = c.items.map((i) =>
          i.id === item.id ? { ...i, checked: !i.checked } : i
        );
        const target = next.find((i) => i.id === item.id);
        if (!target) return c;
        const rest = next.filter((i) => i.id !== item.id);
        return { ...c, items: target.checked ? [...rest, target] : [target, ...rest] };
      })
    );
    track("item_status_changed", {
      item_id: item.id,
      status: item.checked ? "skip" : "has",
    });
  };

  const enterSelect = (catId: string, itemId: string) => {
    setSelecting(true);
    save((t) =>
      patchItem(t, catId, itemId, (i) => ({ ...i, selected: !i.selected }))
    );
  };

  const kebabItems = () => {
    const items = [
      {
        label: "편집",
        onClick: () => {
          setEditing(true);
          setSelecting(false);
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
      label: "찜한 상품 모아보기",
      onClick: () => {
        setFilter("wished");
        expandAll();
      },
    });
    return items;
  };

  const finishEdit = () => {
    setEditing(false);
    setSelecting(false);
    save((t) => ({
      ...t,
      categories: t.categories.map((c) => ({
        ...c,
        items: c.items.map((i) => ({ ...i, selected: false })),
      })),
    }));
  };

  const deleteSelected = () => {
    save((t) => ({
      ...t,
      categories: t.categories.map((c) => ({
        ...c,
        items: c.items.filter((i) => !i.selected),
      })),
    }));
    setSelecting(false);
    track("item_removed", { is_bulk: true });
  };

  const deleteOne = (catId: string, item: ChecklistItem) => {
    undoRef.current = trip;
    save((t) =>
      patchCategory(t, catId, (c) => ({
        ...c,
        items: c.items.filter((i) => i.id !== item.id),
      }))
    );
    setToast({
      msg: "해당 항목을 지웠어요",
      undo: () => {
        if (undoRef.current) updateTrip(trip.id, () => undoRef.current as Trip);
      },
    });
    track("item_removed", { is_bulk: false, item_id: item.id });
  };

  const tryAdd = (catId: string, category: Category) => {
    const name = addText.trim();
    if (!name) return;
    if (name.length > 30) {
      setToast({ msg: "최대 30자까지 입력할 수 있어요" });
      return;
    }
    save((t) =>
      patchCategory(t, catId, (c) => ({ ...c, items: [...c.items, newItem(name)] }))
    );
    if (category.kind === "personal") addPersonalItem(name);
    track("item_added", { is_bulk: false });
    setAddText("");
    setAdding(catId);
    requestAnimationFrame(() => addRef.current?.focus());
  };

  const over = addText.length > 30;

  return (
    <PhoneShell>
      <TopBar
        float
        back={() => router.push("/trips")}
        kebab={!editing ? () => { setCatMenu(null); setKebabOpen((v) => !v); } : undefined}
        kebabActive={kebabOpen}
        kebabRef={kebabRef}
        right={
          editing ? (
            <button className="t-button" style={{ color: "var(--primary)", background: "none", border: "none" }} onClick={finishEdit}>
              완료
            </button>
          ) : undefined
        }
      />
      {kebabOpen && kebabRef.current ? (
        <Menu anchor={kebabRef.current} items={kebabItems()} onClose={() => setKebabOpen(false)} />
      ) : null}

      <div className="shell-scroll">
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
        <div className="reco-row">
          {[0, 1, 2].map((i) => (
            <div className="reco" key={i}>
              <div>
                <div className="txt">여행자님이 좋아하실 상품을 준비하고 있어요.</div>
                <div className="src">트리플 추천</div>
              </div>
              <div className="thumb" />
            </div>
          ))}
        </div>
        <div className="reco-more">추천 아이템 모두 보기</div>

        {trip.categories.map((cat) => {
          const items = cat.items.filter(visible);
          const empty = items.length === 0;
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
                      className="icon-btn"
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
                  {empty && filter !== "all" ? (
                    <div className="empty tight">해당하는 항목이 없어요</div>
                  ) : null}
                  {items.map((item) => (
                    <div
                      className={`row${item.reason ? " sub" : ""}${drag?.itemId === item.id ? " dragging" : ""}${drag?.overId === item.id && drag.itemId !== item.id ? " drag-over" : ""}`}
                      key={item.id}
                      data-item-id={item.id}
                      onPointerDown={(e) => onItemPointerDown(cat.id, item.id, e)}
                    >
                      <button
                        className={`cbx${editing ? (item.selected ? " del" : "") : item.checked ? " on" : ""}`}
                        aria-label={editing ? "삭제 선택" : "준비 완료"}
                        onClick={() => {
                          if (editing) {
                            enterSelect(cat.id, item.id);
                            return;
                          }
                          toggleChecked(cat.id, item);
                        }}
                      >
                        {(editing && item.selected) || (!editing && item.checked) ? <IconCheck /> : null}
                      </button>
                      <div className="body">
                        <span className="name">{item.name}</span>
                        {item.reason ? <span className="desc">{item.reason}</span> : null}
                      </div>
                      {editing ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {item.custom ? (
                            <button
                              className="icon-btn"
                              aria-label="이름 변경"
                              onClick={() => setRename({ catId: cat.id, itemId: item.id, name: item.name })}
                            >
                              <IconPencil />
                            </button>
                          ) : null}
                          <button className="icon-btn" aria-label="삭제" onClick={() => deleteOne(cat.id, item)}>
                            <IconXSmall />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="icon-btn"
                          aria-label="찜"
                          onClick={() => {
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
                      )}
                    </div>
                  ))}
                  <div className={`row${selecting ? " muted" : ""}`}>
                    <span className="cbx add" />
                    <div className="body">
                      {adding === cat.id ? (
                        <input
                          ref={addRef}
                          autoFocus
                          value={addText}
                          maxLength={30}
                          placeholder="직접 아이템을 입력해주세요"
                          onChange={(e) => setAddText(e.target.value)}
                          onBeforeInput={(e) => {
                            const ne = e.nativeEvent as InputEvent;
                            if (!ne.inputType?.startsWith("insert")) return;
                            if (ne.inputType === "insertCompositionText") return;
                            const el = e.currentTarget;
                            const insert = ne.data ?? "";
                            if (!insert) return;
                            const selected = el.selectionEnd - el.selectionStart;
                            if (addText.length - selected + insert.length > 30) {
                              e.preventDefault();
                              setToast({ msg: "최대 30자까지 입력할 수 있어요" });
                            }
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
                        className="icon-btn"
                        aria-label="추가"
                        disabled={selecting || (!addText.trim() && !over)}
                        onClick={() => {
                          if (over) {
                            setToast({ msg: "최대 30자까지 입력할 수 있어요" });
                            return;
                          }
                          tryAdd(cat.id, cat);
                        }}
                      >
                        <IconPlus color={over ? "var(--text-3)" : "var(--primary)"} />
                      </button>
                    ) : null}
                  </div>
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
            <p className="legal2">Weather data by Open-Meteo.com (CC BY 4.0)</p>
          </div>
        </div>
      </div>

      {selecting ? (
        <div className="actionbar">
          <span className="cnt">{selectedCount}개 선택됨</span>
          <button className={`act${selectedCount === 0 ? " off" : ""}`} disabled={selectedCount === 0} onClick={() => setConfirmBulk(true)}>
            삭제
          </button>
        </div>
      ) : null}

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
          message={"선택한 전체 아이템이\n함께 삭제됩니다.\n아이템을 삭제하시겠습니까?"}
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
            save((t) => ({ ...t, categories: t.categories.filter((c) => c.id !== confirmCat) }));
            setConfirmCat(null);
            setCatMenu(null);
          }}
        />
      ) : null}

      {rename ? (
        <InputDialog
          value={rename.name}
          onChange={(v) => setRename({ ...rename, name: v })}
          confirmDisabled={!rename.name.trim() || rename.name.length > 30}
          onLimit={() => setToast({ msg: "최대 30자까지 입력할 수 있어요" })}
          onCancel={() => setRename(null)}
          onConfirm={() => {
            save((t) => patchItem(t, rename.catId, rename.itemId, (i) => ({ ...i, name: rename.name.trim() })));
            setRename(null);
          }}
        />
      ) : null}

      {toast ? (
        <Toast
          message={toast.msg}
          action={toast.undo ? "되돌리기" : undefined}
          onAction={toast.undo}
          onDone={() => setToast(null)}
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

export function addCategoryToTrip(trip: Trip, name: string): Trip {
  const alias: Record<string, string> = { 필수: "필수 준비물", 기본: "기본 짐싸기" };
  const canon = alias[name] ?? name;
  if (trip.categories.some((c) => (alias[c.name] ?? c.name) === canon)) return trip;
  const cat = emptyCustomCategory(name);
  const presets = new Set(PRESET_CATEGORY_NAMES);
  if (name === "나만의 준비물") {
    cat.kind = "personal";
    cat.hint = "모든 여행 일정에 담겨요";
    return { ...trip, categories: [cat, ...trip.categories] };
  }
  if (!presets.has(canon)) {
    cat.hint = "직접 추가한 항목";
  }
  return { ...trip, categories: [...trip.categories, cat] };
}
