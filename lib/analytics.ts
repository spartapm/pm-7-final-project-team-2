import { getLiveCatalog } from "./liveCatalog";
import type { Category, ChecklistItem } from "./types";

export const GTM_ID = "GTM-53WG6W4G";
export const GA4_MEASUREMENT_ID = "G-NN6YXT1SX0";

const ENTRY_KEY = "chaeggyeo:entry";

export type EntryType = "after_create" | "revisit" | "back" | "shared_link";

type OverpackSeen = { at: number; comment_tier: string; delete_rate_band: string };

const overpackSeen = new Map<string, OverpackSeen>();

export function track(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as Window & { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event: name, ...params });
}

export function setEntry(type: EntryType) {
  try {
    sessionStorage.setItem(ENTRY_KEY, type);
  } catch {
    /* ignore */
  }
}

export function consumeEntry(): EntryType {
  try {
    const v = sessionStorage.getItem(ENTRY_KEY);
    sessionStorage.removeItem(ENTRY_KEY);
    if (v === "after_create" || v === "back" || v === "shared_link") return v;
  } catch {
    /* ignore */
  }
  return "revisit";
}

export function itemSource(item: ChecklistItem) {
  return item.custom || item.personalId ? "user" : "system";
}

export function itemOrigin(cat: Category, item: ChecklistItem) {
  const rule = item.masterId
    ? getLiveCatalog().rules.find((r) => r.itemId === item.masterId)
    : undefined;
  if (rule?.table === "weather") return "weather";
  if (rule?.table === "temp") return "temperature";
  if (rule?.table === "country") return "country";
  if (rule?.table === "activity") return "activity";
  if (rule?.table === "essential") return "essential";
  if (rule?.table === "companion") return "base";
  if (cat.kind === "essential") return "essential";
  if (cat.kind === "activity") return "activity";
  if (cat.kind === "base") return "base";
  return "base";
}

function overpackTier(copy: string) {
  if (copy.includes("3명")) return "3명";
  if (copy.includes("2명")) return "2명";
  return "1명";
}

function overpackBand(rate: number) {
  if (rate < 0.8) return "70-79";
  if (rate < 0.9) return "80-89";
  return "90-100";
}

export function noteOverpackImpression(itemId: string, copy: string, rate: number) {
  if (overpackSeen.has(itemId)) return;
  const comment_tier = overpackTier(copy);
  const delete_rate_band = overpackBand(rate);
  overpackSeen.set(itemId, { at: Date.now(), comment_tier, delete_rate_band });
  track("overpack_comment_impression", {
    item_id: itemId,
    comment_tier,
    delete_rate_band,
  });
}

export function overpackSeenOf(itemId: string) {
  return overpackSeen.get(itemId);
}

export function itemParams(cat: Category, item: ChecklistItem) {
  return {
    item_id: item.id,
    category_name: cat.name,
    item_source: itemSource(item),
    item_origin: itemOrigin(cat, item),
  };
}

export function trackItemDelete(cat: Category, item: ChecklistItem, is_bulk: boolean) {
  const seen = overpackSeenOf(item.id);
  if (seen) {
    track("overpack_comment_effect", {
      item_id: item.id,
      comment_tier: seen.comment_tier,
      time_from_impression_ms: Date.now() - seen.at,
    });
  }
  track("item_delete", {
    ...itemParams(cat, item),
    had_checked: item.checked,
    had_overpack_comment: Boolean(seen),
    is_bulk,
  });
}
