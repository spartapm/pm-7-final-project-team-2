"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { createPortal } from "react-dom";
import { IconBack, IconCalChevron, IconClose, IconKebab, IconSheetChevron } from "./icons";
import { track } from "@/lib/analytics";

declare global {
  interface Window {
    __chaeggyeoBaseH?: number;
  }
}

function rememberBaseHeight() {
  const h = Math.max(window.innerHeight, window.visualViewport?.height ?? 0);
  const prev = window.__chaeggyeoBaseH ?? 0;
  if (h >= prev - 40) window.__chaeggyeoBaseH = Math.max(prev, h);
  return window.__chaeggyeoBaseH ?? h;
}

if (typeof window !== "undefined") {
  rememberBaseHeight();
  window.addEventListener("resize", rememberBaseHeight);
  window.visualViewport?.addEventListener("resize", rememberBaseHeight);
}

export function TopBar({
  back,
  close,
  title,
  progress,
  center,
  right,
  kebab,
  kebabActive,
  kebabRef,
  float,
}: {
  back?: () => void;
  close?: () => void;
  title?: string;
  progress?: string;
  center?: ReactNode;
  right?: ReactNode;
  kebab?: () => void;
  kebabActive?: boolean;
  kebabRef?: Ref<HTMLButtonElement>;
  float?: boolean;
}) {
  return (
    <header className={`topbar${float ? " float" : ""}${title ? " modal" : ""}`}>
      {back ? (
        <button className="icon-btn icon-btn--back" aria-label="뒤로" onClick={back}>
          <IconBack />
        </button>
      ) : close ? (
        <button className="icon-btn icon-btn--close" aria-label="닫기" onClick={close}>
          <IconClose />
        </button>
      ) : null}
      {title ? <span className="ttl">{title}</span> : null}
      {center ? <div className="topbar-center">{center}</div> : null}
      <span className="grow" />
      {progress ? <span className="t-button" style={{ color: "var(--text-3)" }}>{progress}</span> : null}
      {right}
      {kebab ? (
        <button ref={kebabRef} className="icon-btn icon-btn--kebab" aria-label="메뉴" onClick={kebab}>
          <IconKebab active={kebabActive} />
        </button>
      ) : null}
    </header>
  );
}

export function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="progress">
      <div className="track">
        <div className="fill" style={{ width: `${(step / total) * 100}%` }} />
      </div>
    </div>
  );
}

export function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button className="btn btn-primary" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

export function Chip({
  label,
  pressed,
  onClick,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="chip" aria-pressed={pressed} onClick={onClick}>
      {label}
    </button>
  );
}

export function Toast({
  message,
  action,
  onAction,
  onDone,
  place = "top",
  raised,
}: {
  message: string;
  action?: string;
  onAction?: () => void;
  onDone: () => void;
  place?: "top" | "bottom";
  raised?: boolean;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone, message]);
  return (
    <div className={`toast-wrap${place === "bottom" ? " bottom" : ""}${raised ? " raised" : ""}`}>
      <div className="toast">
        <span className="msg">{message}</span>
        {action ? (
          <button
            className="act"
            onClick={() => {
              onAction?.();
              onDone();
            }}
          >
            {action}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  message,
  onCancel,
  onConfirm,
}: {
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="dim" onClick={onCancel}>
      <div className="confirm" onClick={(e) => e.stopPropagation()}>
        <div className="msg">{message}</div>
        <div className="acts">
          <button onClick={onCancel}>취소</button>
          <button onClick={onConfirm}>확인</button>
        </div>
      </div>
    </div>
  );
}

export function InputDialog({
  title = "직접입력",
  value,
  onChange,
  placeholder = "최대 30글자로\n카테고리/아이템 직접 입력하기",
  maxLength = 30,
  confirmDisabled,
  onCancel,
  onConfirm,
  onLimit,
}: {
  title?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  confirmDisabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onLimit?: () => void;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const composing = useRef(false);
  const primed = useRef(true);
  const apply = (next: string) => {
    primed.current = false;
    if (next.length > maxLength) {
      onChange(next.slice(0, maxLength));
      onLimit?.();
      return;
    }
    onChange(next);
  };
  const pinCaret = () => {
    const el = inputRef.current;
    if (!el || el.value) return;
    el.setSelectionRange(0, 0);
  };
  const primeSelection = () => {
    const el = inputRef.current;
    if (!el || !primed.current) return;
    if (el.value) el.select();
    else pinCaret();
  };
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "24px";
    if (value) el.style.height = `${Math.min(el.scrollHeight, 184)}px`;
  }, [value]);
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const dim = dimRef.current;
    const dialog = dialogRef.current;
    if (!frame || !dim || !dialog) return;
    const field = inputRef.current;
    // preventScroll: iOS/Android가 입력칸을 찾아 화면을 밀면 다이얼로그가 키보드 뒤로 사라진다.
    field?.focus({ preventScroll: true });
    primeSelection();

    const shell = document.querySelector(".shell") as HTMLElement | null;
    const scroller = shell?.querySelector(".shell-scroll") as HTMLElement | null;
    scroller?.classList.add("lock");
    const vv = window.visualViewport;
    const baseH = rememberBaseHeight();
    // body를 fixed로 잠그거나 virtualKeyboard.overlaysContent를 켜면
    // iOS는 키패드가 안 뜨고, 안드로이드는 visualViewport가 줄지 않는다.
    const sync = () => {
      const vvNow = window.visualViewport;
      const width = vvNow?.width ?? window.innerWidth;
      const height = vvNow?.height ?? window.innerHeight;
      frame.style.width = `${width}px`;
      frame.style.height = `${height}px`;
      frame.style.transform = `translate(${vvNow?.offsetLeft ?? 0}px, ${vvNow?.offsetTop ?? 0}px)`;
      // ".kb"는 여행 카드 케밥 버튼 클래스라 쓰면 dim이 28px 버튼으로 줄어든다.
      dim.classList.toggle("kb-open", baseH - height > 100);
    };
    const onViewport = () => requestAnimationFrame(sync);
    sync();
    const blockScroll = (e: TouchEvent | WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("textarea, input")) return;
      e.preventDefault();
    };
    frame.addEventListener("touchmove", blockScroll, { passive: false });
    frame.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("resize", onViewport);
    vv?.addEventListener("resize", onViewport);
    vv?.addEventListener("scroll", onViewport);
    const ids = [80, 280, 560, 900].map((ms) =>
      window.setTimeout(() => {
        primeSelection();
        sync();
      }, ms),
    );
    return () => {
      scroller?.classList.remove("lock");
      frame.removeEventListener("touchmove", blockScroll);
      frame.removeEventListener("wheel", blockScroll);
      window.removeEventListener("resize", onViewport);
      vv?.removeEventListener("resize", onViewport);
      vv?.removeEventListener("scroll", onViewport);
      ids.forEach((id) => window.clearTimeout(id));
    };
  }, []);
  if (typeof document === "undefined") return null;
  return createPortal(
    <div ref={frameRef} className="kb-frame">
    <div ref={dimRef} className="dim" onClick={onCancel}>
      <div ref={dialogRef} className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="con">
          <div className="tt">{title}</div>
          <div className="ds" onClick={() => inputRef.current?.focus()}>
            {!value ? <div className="ph">{placeholder}</div> : null}
            {!value ? <span className="caret" aria-hidden /> : null}
            <textarea
              ref={inputRef}
              value={value}
              rows={1}
              dir="ltr"
              autoComplete="off"
              autoCorrect="off"
              enterKeyHint="done"
              className={value ? "typed" : "empty"}
              onChange={(e) => {
                primed.current = false;
                if (composing.current) {
                  onChange(e.target.value);
                  return;
                }
                apply(e.target.value);
              }}
              onCompositionStart={() => {
                composing.current = true;
              }}
              onCompositionEnd={(e) => {
                composing.current = false;
                apply(e.currentTarget.value);
              }}
              onBeforeInput={(e) => {
                const ne = e.nativeEvent as InputEvent;
                if (!ne.inputType?.startsWith("insert") || !ne.data) return;
                if (ne.inputType === "insertCompositionText") return;
                const el = e.currentTarget;
                const selected = (el.selectionEnd ?? 0) - (el.selectionStart ?? 0);
                if (value.length - selected + ne.data.length > maxLength) {
                  e.preventDefault();
                  onLimit?.();
                }
              }}
              onFocus={pinCaret}
              onClick={pinCaret}
              onSelect={pinCaret}
            />
          </div>
        </div>
        <div className="acts">
          <button onClick={onCancel}>취소</button>
          <button className={confirmDisabled ? "off" : ""} disabled={confirmDisabled} onClick={onConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
    </div>,
    document.body
  );
}

export function InfoSheet({
  links,
  note,
  itemId,
  onClose,
}: {
  links: { text: string; url: string }[];
  note?: string;
  itemId?: string;
  onClose: () => void;
}) {
  return (
    <div className="dim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        {links.length ? (
          <div className="sheet-list">
            {links.map((l, i) => (
              <a
                key={l.url + l.text}
                className="sheet-row"
                href={l.url}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  track("info_modal_link_click", {
                    item_id: itemId,
                    link_text: l.text,
                    link_url: l.url,
                    display_order: i + 1,
                  })
                }
              >
                <span>{l.text}</span>
                <IconSheetChevron />
              </a>
            ))}
          </div>
        ) : null}
        {note ? <p className="sheet-note">{note}</p> : null}
      </div>
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="loading-dim">
      <img src="/loading.gif" alt="" width={72} height={72} />
    </div>
  );
}

export function PackGuideSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="dim" onClick={onClose}>
      <div className="sheet pack-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="pack-sheet-art">
          <img src="/bottom_sheet_img.svg" alt="" width={247} height={115} />
        </div>
        <h2>준비물은 필요한 것보다 더 넉넉하게 담아드렸어요</h2>
        <p>필요없는 건 지워서 나만의 체크리스트를 완성해요</p>
        <button className="pack-sheet-btn" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
}

export function Menu({
  items,
  onClose,
  anchor,
  width = 179,
}: {
  items: { label: string; onClick: () => void }[];
  onClose: () => void;
  anchor: HTMLElement;
  width?: number;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const menuH = boxRef.current?.offsetHeight ?? items.length * 44 + 8;
    const gap = 8;
    const r = anchor.getBoundingClientRect();
    let top = r.bottom + gap;
    let left = r.right - width;
    left = Math.min(Math.max(8, left), window.innerWidth - width - 8);
    if (top + menuH > window.innerHeight - 8 && r.top - gap - menuH >= 8) {
      top = r.top - gap - menuH;
    }
    setPos({ top, left });
  }, [anchor, items.length, width]);

  useEffect(() => {
    const close = () => onClose();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <div className="menu-back" onClick={onClose} />
      <div
        ref={boxRef}
        className="menu"
        role="menu"
        style={{
          width,
          top: pos?.top ?? 0,
          left: pos?.left ?? 0,
          visibility: pos ? "visible" : "hidden",
        }}
      >
        {items.map((it) => (
          <button
            key={it.label}
            role="menuitem"
            onClick={() => {
              it.onClick();
              onClose();
            }}
          >
            {it.label}
          </button>
        ))}
      </div>
    </>,
    document.body
  );
}

export function Calendar({
  start,
  end,
  onChange,
}: {
  start?: string;
  end?: string;
  onChange: (start: string, end?: string) => void;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState(() => {
    const base = start ? new Date(start) : today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const rangeRef = useRef({ start, end });
  rangeRef.current = { start, end };

  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const first = new Date(y, m, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const iso = (d: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const clickDay = (d: number) => {
    const id = iso(d);
    const { start: from, end: to } = rangeRef.current;
    const ranged = Boolean(from && to && from !== to);
    if (!from || ranged) {
      onChange(id, id);
      return;
    }
    if (id < from) {
      onChange(id, from);
      return;
    }
    onChange(from, id);
  };

  const inRange = (id: string) => {
    if (!start) return false;
    if (!end) return id === start;
    return id >= start && id <= end;
  };
  const isEdge = (id: string) => id === start || id === end;

  const label = start && end
    ? `${start.replaceAll("-", ".")} ~ ${end.replaceAll("-", ".")}`
    : start
      ? start.replaceAll("-", ".")
      : "날짜를 선택해 주세요";

  const nights =
    start && end
      ? Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000)
      : 0;
  const days = start && end ? nights + 1 : start ? 1 : 0;
  const period = days <= 1 ? (days ? "1일" : "") : `${nights}박 ${days}일`;

  return (
    <div className="cal">
      <div className="capt">
        <button aria-label="이전달" onClick={() => setCursor(new Date(y, m - 1, 1))}>
          <IconCalChevron dir="left" />
        </button>
        <span className="m">
          {y}년 {m + 1}월
        </span>
        <button aria-label="다음달" onClick={() => setCursor(new Date(y, m + 1, 1))}>
          <IconCalChevron dir="right" />
        </button>
      </div>
      <table>
        <thead>
          <tr>
            {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil(cells.length / 7) }, (_, r) => (
            <tr key={r}>
              {cells.slice(r * 7, r * 7 + 7).map((d, i) => {
                if (!d) return <td key={i} />;
                const id = iso(d);
                return (
                  <td key={i}>
                    <button
                      className={`d${inRange(id) ? " is-range" : ""}${isEdge(id) ? " is-edge" : ""}`}
                      onClick={() => clickDay(d)}
                    >
                      {d}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="sum">
        <span>{label}</span>
        <span className="r">{period}</span>
      </div>
    </div>
  );
}
