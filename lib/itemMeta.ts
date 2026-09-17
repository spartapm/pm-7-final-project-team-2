import { getLiveCatalog } from "./liveCatalog";
import { currentDeleteRate, liveDeleteRate } from "./stats";
import type { SpecLink } from "./specData";

export function specByName(name: string) {
  return Object.values(getLiveCatalog().items).find((i) => i.name === name);
}

export function specOf(masterId?: string, name?: string) {
  const items = getLiveCatalog().items;
  if (masterId && items[masterId]) return items[masterId];
  if (name) return specByName(name);
  return undefined;
}

export function linksFor(masterId?: string, name?: string): SpecLink[] {
  const spec = specOf(masterId, name);
  if (!spec) return [];
  return getLiveCatalog()
    .links.filter((l) => l.itemId === spec.id)
    .sort((a, b) => a.order - b.order);
}

export function hasInfoIcon(masterId?: string, name?: string, linkNote?: string) {
  const spec = specOf(masterId, name);
  if (linkNote) return true;
  if (!spec) return false;
  return Boolean(spec.linkNote) || spec.linkCount >= 1 || linksFor(spec.id).length > 0;
}

export function isPurchasable(masterId?: string, name?: string) {
  return Boolean(specOf(masterId, name)?.purchasable);
}

export function deleteRateFor(activityId?: string, masterId?: string) {
  return liveDeleteRate(activityId, masterId);
}

export function commentRateFor(activityId?: string, masterId?: string, baked?: number) {
  const live = currentDeleteRate(activityId, masterId);
  return live != null ? live : baked;
}

export function overpackCopy(rate?: number) {
  if (rate == null || rate < 0.7) return null;
  if (rate < 0.8) return "10명 중 3명이 챙겼어요";
  if (rate < 0.9) return "10명 중 2명이 챙겼어요";
  return "10명 중 1명이 챙겼어요";
}
