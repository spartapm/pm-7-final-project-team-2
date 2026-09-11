"use client";

import { useRef, type ReactNode, SVGProps } from "react";

function Svg(props: SVGProps<SVGSVGElement>) {
  return <svg fill="none" xmlns="http://www.w3.org/2000/svg" {...props} />;
}

export function IconBack() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24">
      <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconClose() {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16">
      <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function IconKebab({ active }: { active?: boolean }) {
  return (
    <Svg width="2" height="18" viewBox="0 0 2 18">
      <circle cx="1" cy="1" r="1" fill={active ? "var(--primary)" : "var(--text-1)"} />
      <circle cx="1" cy="9" r="1" fill={active ? "var(--primary)" : "var(--text-1)"} />
      <circle cx="1" cy="17" r="1" fill={active ? "var(--primary)" : "var(--text-1)"} />
    </Svg>
  );
}

export function IconMeatball({ active }: { active?: boolean }) {
  // B-01_icon_guide: always #3A3A3A. `active` is C-01 only — that screen is not in the B-01 guide.
  const fill = active ? "var(--primary)" : "#3A3A3A";
  return (
    <Svg width="18" height="18" viewBox="0 0 18 18">
      <circle cx="1.2" cy="9" r="1.2" fill={fill} />
      <circle cx="9" cy="9" r="1.2" fill={fill} />
      <circle cx="16.8" cy="9" r="1.2" fill={fill} />
    </Svg>
  );
}

export function IconHeart({ on }: { on: boolean }) {
  return (
    <Svg width="18" height="16" viewBox="0 0 18 16">
      <path
        d="M9 15C9 15 1.6 10.2 1.6 5.6 1.6 3.1 3.5 1.2 5.9 1.2 7.2 1.2 8.4 1.9 9 3 9.6 1.9 10.8 1.2 12.1 1.2 14.5 1.2 16.4 3.1 16.4 5.6 16.4 10.2 9 15 9 15Z"
        fill={on ? "var(--accent)" : "var(--letterbox)"}
      />
    </Svg>
  );
}

export function IconPlus({
  color = "var(--primary)",
  size = 24,
  stroke = 2,
}: {
  color?: string;
  size?: number;
  stroke?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d={size === 20 ? "M12 5v14M5 12h14" : "M12 6v12M6 12h12"}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** B-01_icon_guide + glyph: 10×10 bbox, stroke 2, inside the 28 circle. */
export function IconPlusFab() {
  return (
    <Svg width="10" height="10" viewBox="0 0 10 10">
      <path d="M5 0v10M0 5h10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function IconCheck({ color = "#fff" }: { color?: string }) {
  return (
    <Svg width="12" height="12" viewBox="0 0 12 12">
      <path d="M2.6 6.2 5 8.6 9.4 3.6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconCheckSm() {
  return (
    <Svg width="9" height="8" viewBox="0 0 9 8">
      <path d="M1 4.2 3.3 7 8 1" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconHeartSm() {
  return (
    <Svg width="9" height="8" viewBox="0 0 9 8">
      <path
        d="M4.5 7.5C4.5 7.5 1 5 1 2.6 1 1.3 2 .5 3 .5 3.6.5 4.2.8 4.5 1.3 4.8.8 5.4.5 6 .5 7 .5 8 1.3 8 2.6 8 5 4.5 7.5 4.5 7.5Z"
        fill="var(--accent)"
      />
    </Svg>
  );
}

export function IconSheetChevron() {
  return (
    <Svg width="8" height="14" viewBox="0 0 8 14">
      <path d="M1 1l6 6-6 6" stroke="var(--text-3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconCalChevron({ dir }: { dir: "left" | "right" }) {
  return (
    <Svg
      width="10"
      height="20"
      viewBox="0 0 10 20"
      style={{ transform: dir === "left" ? "scaleX(-1)" : undefined }}
    >
      <path d="M2 2l6 8-6 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconChevron({ up }: { up?: boolean }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16" style={{ transform: up ? "rotate(180deg)" : undefined }}>
      <path d="M3 6l5 5 5-5" stroke="var(--text-3)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconPencil({ color = "var(--text-3)" }: { color?: string }) {
  return (
    <Svg width="15" height="15" viewBox="0 0 16 16">
      <path d="M11 2.2a1.8 1.8 0 0 1 2.55 2.55L5.2 13.1l-3.4 1 1-3.4Z" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconXSmall() {
  return (
    <Svg width="13" height="13" viewBox="0 0 13 13">
      <path d="M2 2l9 9M11 2L2 11" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function IconInfo() {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6.5" stroke="var(--text-3)" strokeWidth="1.4" />
      <path d="M8 7v4.2M8 4.8v.2" stroke="var(--text-3)" strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}

export function IconOverpack() {
  return (
    <Svg width="10" height="10" viewBox="0 0 24 24" style={{ transform: "scaleX(-1)" }}>
      <path d="M20 4h-7a4 4 0 0 0-4 4v12" stroke="var(--accent)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 15l-5 5-5-5" stroke="var(--accent)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PhoneShell({ children }: { children: ReactNode }) {
  const startY = useRef(0);
  return (
    <div
      className="shell"
      onTouchStart={(e) => {
        startY.current = e.touches[0]?.clientY ?? 0;
      }}
      onTouchEnd={(e) => {
        const scroller = e.currentTarget.querySelector(".shell-scroll") as HTMLElement | null;
        if (scroller && scroller.scrollTop > 0) return;
        const dy = (e.changedTouches[0]?.clientY ?? 0) - startY.current;
        if (dy > 80) window.location.reload();
      }}
    >
      {children}
    </div>
  );
}
