import type { Trip, TripStatus } from "./types";

export function parseDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toIso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDot(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${y}.${m}.${d}`;
}

export function nightDay(start: string, end: string) {
  const a = parseDate(start);
  const b = parseDate(end);
  const days = Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
  const nights = Math.max(0, days - 1);
  if (days <= 1) return { nights: 0, days: 1, label: "1일" };
  return { nights, days, label: `${nights}박 ${days}일` };
}

export function tripPeriodLabel(start: string, end: string) {
  const { label } = nightDay(start, end);
  const [sy, sm, sd] = start.split("-");
  const [ey, em, ed] = end.split("-");
  const left = `${sy}.${sm}.${sd}`;
  const right = sy === ey ? `${em}.${ed}` : `${ey}.${em}.${ed}`;
  return `${left} ~ ${right} · ${label}`;
}

export function checklistSubtitle(country: string, start: string, end: string) {
  const { nights, days, label } = nightDay(start, end);
  if (days <= 1) return `${country} 여행 · 1일`;
  return `${country} 여행 · ${nights}박 ${days}일`;
}

export function daysUntil(iso: string, from = new Date()) {
  const start = parseDate(iso);
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((start.getTime() - today.getTime()) / 86400000);
}

export function tripStatus(trip: Trip, from = new Date()): TripStatus {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const start = parseDate(trip.startDate);
  const end = parseDate(trip.endDate);
  if (today.getTime() < start.getTime()) return "upcoming";
  if (today.getTime() > end.getTime()) return "done";
  return "ongoing";
}

export function statusChip(trip: Trip, from = new Date()) {
  const status = tripStatus(trip, from);
  if (status === "ongoing") return { label: "여행중", kind: "on" as const };
  if (status === "done") return { label: "완료", kind: "off" as const };
  const d = daysUntil(trip.startDate, from);
  return { label: `D-${d}`, kind: "on" as const };
}

export function sortTrips(trips: Trip[], from = new Date()) {
  const rank: Record<TripStatus, number> = { ongoing: 0, upcoming: 1, done: 2 };
  return [...trips].sort((a, b) => {
    const sa = tripStatus(a, from);
    const sb = tripStatus(b, from);
    if (rank[sa] !== rank[sb]) return rank[sa] - rank[sb];
    if (sa === "ongoing") return a.endDate.localeCompare(b.endDate);
    if (sa === "upcoming") return a.startDate.localeCompare(b.startDate);
    return b.endDate.localeCompare(a.endDate);
  });
}

export function atHour(iso: string, hour: number) {
  const d = parseDate(iso);
  d.setHours(hour, 0, 0, 0);
  return d;
}

export function addDays(iso: string, n: number) {
  const d = parseDate(iso);
  d.setDate(d.getDate() + n);
  return toIso(d);
}
