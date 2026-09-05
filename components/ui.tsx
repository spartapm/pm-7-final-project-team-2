"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { createPortal } from "react-dom";
import { IconBack, IconCalChevron, IconClose, IconKebab } from "./icons";

export function TopBar({
  back,
  close,
  title,
  progress,
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
  right?: ReactNode;
  kebab?: () => void;
  kebabActive?: boolean;
  kebabRef?: Ref<HTMLButtonElement>;
  float?: boolean;
}) {
  return (
    <header className={`topbar${float ? " float" : ""}${title ? " modal" : ""}`}>
      {back ? (
        <button className="icon-btn" aria-label="뒤로" onClick={back}>
          <IconBack />
        </button>
      ) : close ? (
        <button className="icon-btn" aria-label="닫기" onClick={close}>
          <IconClose />
        </button>
      ) : null}
      {title ? <span className="ttl">{title}</span> : null}
      <span className="grow" />
      {progress ? <span className="t-button" style={{ color: "var(--text-3)" }}>{progress}</span> : null}
      {right}
      {kebab ? (
        <button ref={kebabRef} className="icon-btn" aria-label="메뉴" onClick={kebab}>
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
}: {
  message: string;
  action?: string;
  onAction?: () => void;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone, message]);
  return (
    <div className="toast-wrap">
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
  confirmDisabled,
  onCancel,
  onConfirm,
  onLimit,
}: {
  title?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  confirmDisabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onLimit?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="dim" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="con">
          <div className="tt">{title}</div>
          <div className="ds" onClick={() => inputRef.current?.focus()}>
            {!value ? <div className="ph">{placeholder}</div> : null}
            <input
              ref={inputRef}
              autoFocus
              maxLength={30}
              value={value}
              className={value ? "typed" : "empty"}
              onChange={(e) => onChange(e.target.value.slice(0, 30))}
              onBeforeInput={(e) => {
                const ne = e.nativeEvent as InputEvent;
                if (!ne.inputType?.startsWith("insert") || !ne.data) return;
                if (ne.inputType === "insertCompositionText") return;
                const el = e.currentTarget;
                const selected = el.selectionEnd - el.selectionStart;
                if (value.length - selected + ne.data.length > 30) {
                  e.preventDefault();
                  onLimit?.();
                }
              }}
              onFocus={(e) => {
                if (value) e.target.select();
              }}
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
    const ranged = Boolean(start && end && start !== end);
    if (!start || ranged) {
      onChange(id, id);
      return;
    }
    if (id < start) {
      onChange(id, start);
      return;
    }
    onChange(start, id);
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
