"use client";

import type { ReactNode, SVGProps } from "react";

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
      <circle cx="1" cy="2" r="1" fill={active ? "var(--primary)" : "var(--text-1)"} />
      <circle cx="1" cy="9" r="1" fill={active ? "var(--primary)" : "var(--text-1)"} />
      <circle cx="1" cy="16" r="1" fill={active ? "var(--primary)" : "var(--text-1)"} />
    </Svg>
  );
}

export function IconMeatball({ active }: { active?: boolean }) {
  const fill = active ? "var(--primary)" : "var(--text-3)";
  return (
    <Svg width="16" height="2" viewBox="0 0 16 2">
      <circle cx="1" cy="1" r="1" fill={fill} />
      <circle cx="8" cy="1" r="1" fill={fill} />
      <circle cx="15" cy="1" r="1" fill={fill} />
    </Svg>
  );
}

export function IconHeart({ on }: { on: boolean }) {
  return (
    <Svg width="18" height="16" viewBox="0 0 18 16">
      <path
        d="M9 14.5s-6.5-4.1-6.5-8.2C2.5 4 4.2 2.5 6.2 2.5c1.2 0 2.3.6 2.8 1.5.5-.9 1.6-1.5 2.8-1.5 2 0 3.7 1.5 3.7 3.8 0 4.1-6.5 8.2-6.5 8.2z"
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
      <path d="M12 5v14M5 12h14" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
    </Svg>
  );
}

export function IconCheck() {
  return (
    <Svg width="12" height="12" viewBox="0 0 12 12">
      <path d="M2 6.2l2.6 2.6L10 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

export function IconPencil() {
  return (
    <Svg width="15" height="15" viewBox="0 0 15 15">
      <path d="M10.2 2.2l2.6 2.6M2 13l.6-3.4L10.2 2.2 12.8 4.8 5.4 12.2 2 13z" stroke="var(--text-3)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
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

export function PhoneShell({ children }: { children: ReactNode }) {
  return <div className="shell">{children}</div>;
}
