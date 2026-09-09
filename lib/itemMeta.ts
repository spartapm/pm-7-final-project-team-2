import { SPEC_DELETE_RATES, SPEC_ITEMS, SPEC_LINKS, type SpecLink } from "./specData";

export function specByName(name: string) {
  return Object.values(SPEC_ITEMS).find((i) => i.name === name);
}

export function specOf(masterId?: string, name?: string) {
  if (masterId && SPEC_ITEMS[masterId]) return SPEC_ITEMS[masterId];
  if (name) return specByName(name);
  return undefined;
}

export function linksFor(masterId?: string, name?: string): SpecLink[] {
  const spec = specOf(masterId, name);
  if (!spec) return [];
  return SPEC_LINKS.filter((l) => l.itemId === spec.id).sort((a, b) => a.order - b.order);
}

export function hasInfoIcon(masterId?: string, name?: string, linkNote?: string) {
  const spec = specOf(masterId, name);
  if (linkNote) return true;
  if (!spec) return false;
  return Boolean(spec.linkNote) || spec.linkCount >= 1 || linksFor(spec.id).length > 0;
}

export function deleteRateFor(activityId?: string, masterId?: string) {
  if (!activityId || !masterId) return undefined;
  const row = SPEC_DELETE_RATES.find((r) => r.activityId === activityId && r.itemId === masterId);
  if (!row) return undefined;
  if (row.shown) return row.rate;
  if (row.rate >= 0.7 && row.exposure >= 30) return row.rate;
  return undefined;
}

export function overpackCopy(rate?: number) {
  if (rate == null || rate < 0.7) return null;
  if (rate < 0.8) return "10명 중 3명이 챙겼어요";
  if (rate < 0.9) return "10명 중 2명이 챙겼어요";
  return "10명 중 1명이 챙겼어요";
}
