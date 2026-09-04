import type { Trip } from "./types";
import { addDays, atHour } from "./dates";

export type ReminderKind = "d7" | "d3" | "d1";

export const REMINDER_COPY: Record<
  ReminderKind,
  { title: string; body: (n?: number) => string }
> = {
  d7: {
    title: "D-7, 지금 사면 배송이 넉넉해요",
    body: () =>
      "출발까지 일주일 남았어요. 체크리스트를 열어 없는 물건부터 확인해보세요. 지금 주문하면 여유 있게 도착해요.",
  },
  d3: {
    title: "D-3, 아직 없는 물건 {N}개 남았어요",
    body: (n = 0) =>
      `오늘 주문하면 출발 전에 받을 수 있어요. 구매 목록을 열어 마지막으로 확인해보세요.`.replace(
        "{N}",
        String(n)
      ),
  },
  d1: {
    title: "D-1, 내일 출발! 마지막 점검하세요",
    body: () =>
      "이제 택배는 늦어요. 못 챙긴 건 공항이나 현지에서 살 수 있는지 확인하고, 나머지는 오늘 캐리어에 넣어주세요.",
  },
};

export function uncheckedCount(trip: Trip) {
  return trip.categories.reduce(
    (n, c) => n + c.items.filter((i) => !i.checked).length,
    0
  );
}

export function reminderSchedule(trip: Trip) {
  return [
    { kind: "d7" as const, at: atHour(addDays(trip.startDate, -7), 19) },
    { kind: "d3" as const, at: atHour(addDays(trip.startDate, -3), 19) },
    { kind: "d1" as const, at: atHour(addDays(trip.startDate, -1), 19) },
  ];
}

export function dueReminders(trip: Trip, now = new Date()) {
  return reminderSchedule(trip).filter((r) => {
    if (r.at.getTime() > now.getTime()) return false;
    if (trip.remindersShown.includes(r.kind)) return false;
    if (r.at.getTime() < new Date(trip.createdAt).getTime()) return false;
    return true;
  });
}

export function reminderTitle(kind: ReminderKind, n: number) {
  if (kind === "d3") return `D-3, 아직 없는 물건 ${n}개 남았어요`;
  return REMINDER_COPY[kind].title.replace("{N}", String(n));
}
