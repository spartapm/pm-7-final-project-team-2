import { isPurchasable } from "./itemMeta";
import type { Trip } from "./types";
import { addDays, atHour } from "./dates";

export type ReminderKind = "d7" | "d3" | "d1";

export function cartCount(trip: Trip) {
  return trip.categories.reduce(
    (n, c) => n + c.items.filter((i) => i.wished && isPurchasable(i.masterId, i.name)).length,
    0
  );
}

export function reminderCopy(kind: ReminderKind, cart = 0): { title: string; body: string } {
  if (kind === "d7") {
    return {
      title: "여행까지 D-7, 지금 주문하면 배송이 넉넉해요",
      body: "체크리스트를 열어 없는 물건부터 확인해보세요. 지금 주문하면 여유 있게 도착해요.",
    };
  }
  if (kind === "d1") {
    return {
      title: "내일 여행 출발!✈️ 마지막 점검하세요",
      body: "출발 전 마지막 점검만 남았어요! 같이 확인해볼까요?",
    };
  }
  if (cart > 0) {
    return {
      title: "여행까지 D-3, 아직 장바구니에 물건이 남아있어요",
      body: "지금 주문해야 출발 전에 받아볼 수 있어요. 담아둔 것부터 확인해보세요.",
    };
  }
  return {
    title: "여행까지 D-3, 지금이 없는 물건을 주문할 수 있는 마지막 타이밍이에요",
    body: "체크리스트를 열어 없는 물건부터 확인해보세요. 담아두면 한 번에 모아서 볼 수 있어요.",
  };
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

function kstParts(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value])
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
  };
}

export function daysUntilKst(startIso: string, now = new Date()) {
  const today = kstParts(now).date;
  return Math.round((Date.parse(`${startIso}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
}

export function scheduledKindNow(trip: Trip, now = new Date(), ignoreHour = false): ReminderKind | null {
  const { hour } = kstParts(now);
  if (!ignoreHour && hour < 19) return null;
  const days = daysUntilKst(trip.startDate, now);
  const kind: ReminderKind | null = days === 7 ? "d7" : days === 3 ? "d3" : days === 1 ? "d1" : null;
  if (!kind) return null;
  if (trip.remindersShown.includes(kind)) return null;
  if (new Date(trip.createdAt).getTime() > now.getTime()) return null;
  return kind;
}
