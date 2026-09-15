import { getLiveCatalog } from "./liveCatalog";
import type { ChecklistItem } from "./types";

export function sortItems<T extends { masterId?: string; id?: string }>(items: T[]): T[] {
  const live = getLiveCatalog();
  const groupRank = new Map(live.groups.map((g) => [g.name, g.order]));
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const sa = specRank(a.item.masterId, groupRank);
      const sb = specRank(b.item.masterId, groupRank);
      if (sa.group !== sb.group) return sa.group - sb.group;
      if (sa.order !== sb.order) return sa.order - sb.order;
      return a.index - b.index;
    })
    .map((x) => x.item);
}

export function sortChecklistItems(items: ChecklistItem[]) {
  return sortItems(items);
}

function specRank(masterId: string | undefined, groupRank: Map<string, number>) {
  const spec = masterId ? getLiveCatalog().items[masterId] : undefined;
  const group = spec?.itemGroup;
  return {
    group: group ? groupRank.get(group) ?? 9998 : 9999,
    order: spec?.itemOrder ?? 9999,
  };
}
