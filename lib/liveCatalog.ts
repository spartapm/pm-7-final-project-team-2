import { ACTIVITIES, CATEGORY_META, EXTRA_PRESET_CATEGORIES } from "./catalog";
import { SPEC_ITEMS, SPEC_LINKS, SPEC_RULES, type SpecItem, type SpecLink } from "./specData";
import { getSupabase } from "./supabase";
import type { CategoryKind } from "./types";
import type { Rule } from "./rules";

export type StatRow = {
  activityId: string;
  itemId: string;
  exposure: number;
  deletes: number;
  shown: boolean;
};

export type CatalogActivity = {
  id: string;
  name: string;
  categoryName: string;
};

export type CatalogGroup = {
  id: number;
  name: string;
  order: number;
};

type Live = {
  items: Record<string, SpecItem>;
  links: SpecLink[];
  rules: Rule[];
  stats: StatRow[];
  activities: CatalogActivity[];
  groups: CatalogGroup[];
};

export const DEFAULT_ACTIVITIES: CatalogActivity[] = ACTIVITIES.map((a) => ({
  id: a.id,
  name: a.name,
  categoryName: CATEGORY_META[a.id]?.name ?? a.name,
}));

export const DEFAULT_GROUPS: CatalogGroup[] = [
  { id: 1, name: "cloth", order: 1 },
  { id: 2, name: "wash", order: 2 },
  { id: 3, name: "electric", order: 3 },
];

let live: Live | null = null;
const listeners = new Set<() => void>();

function fallback(): Live {
  return {
    items: SPEC_ITEMS,
    links: SPEC_LINKS,
    rules: SPEC_RULES as Rule[],
    stats: [],
    activities: DEFAULT_ACTIVITIES,
    groups: DEFAULT_GROUPS,
  };
}

export function getLiveCatalog(): Live {
  return live ?? fallback();
}

export function subscribeCatalog(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function emit() {
  listeners.forEach((fn) => fn());
}

export function setLiveStats(stats: StatRow[]) {
  live = { ...getLiveCatalog(), stats };
  emit();
}

export function liveActivities() {
  const list = getLiveCatalog().activities;
  return list.length ? list : DEFAULT_ACTIVITIES;
}

export function liveGroups() {
  const list = getLiveCatalog().groups;
  return list.length ? list : DEFAULT_GROUPS;
}

export function liveActivityName(id: string) {
  return liveActivities().find((a) => a.id === id)?.name ?? id;
}

export function liveActivityCategoryName(id: string) {
  const a = liveActivities().find((x) => x.id === id);
  return a?.categoryName || a?.name || id;
}

export function liveCategoryMeta(): Record<
  string,
  { name: string; kind: CategoryKind; hint?: string; matchPriority: number; displayOrder: number }
> {
  const meta = { ...CATEGORY_META };
  liveActivities().forEach((a, i) => {
    meta[a.id] = {
      name: a.categoryName || a.name,
      kind: "activity",
      matchPriority: CATEGORY_META[a.id]?.matchPriority ?? 20 + i,
      displayOrder: CATEGORY_META[a.id]?.displayOrder ?? 20 + i,
    };
  });
  return meta;
}

export function livePresetCategoryNames() {
  const acts = liveActivities().map((a) => a.categoryName || a.name);
  return [
    ...EXTRA_PRESET_CATEGORIES.map((c) => c.name),
    "필수 준비물",
    "기본 짐싸기",
    ...acts,
    "나만의 준비물",
  ];
}

function mapItems(
  rows: {
    id: string;
    name: string;
    item_desc?: string | null;
    purchasable?: boolean | null;
    link_count?: number | null;
    link_note?: string | null;
    item_group?: string | null;
    item_order?: number | null;
  }[]
) {
  const items: Record<string, SpecItem> = {};
  for (const r of rows) {
    items[r.id] = {
      id: r.id,
      name: r.name,
      desc: r.item_desc ?? undefined,
      purchasable: Boolean(r.purchasable),
      linkCount: r.link_count ?? 0,
      linkNote: r.link_note ?? undefined,
      itemGroup: r.item_group ?? undefined,
      itemOrder: r.item_order ?? undefined,
    };
  }
  return items;
}

export async function loadCatalogFromCloud() {
  const sb = getSupabase();
  if (!sb) return getLiveCatalog();

  const [itemsRes, linksRes, rulesRes, statsRes, actRes, groupRes] = await Promise.all([
    sb
      .from("catalog_items")
      .select("id, name, item_desc, purchasable, link_count, link_note, item_group, item_order"),
    sb.from("catalog_links").select("item_id, display_order, link_type, link_text, link_url"),
    sb.from("catalog_rules").select(
      "id, table_name, item_id, reason, country_id, companion_id, activity_id, weather_id, temp_band_id"
    ),
    sb.from("item_stats").select("activity_id, item_id, exposure_count, delete_count, comment_shown"),
    sb.from("catalog_activities").select("activity_id, activity_name, activity_category_name"),
    sb.from("catalog_group").select("group_id, group_name, group_order"),
  ]);

  let itemRows: Parameters<typeof mapItems>[0] | null = itemsRes.data;
  if (itemsRes.error) {
    const retry = await sb
      .from("catalog_items")
      .select("id, name, item_desc, purchasable, link_count, link_note");
    if (retry.error || !retry.data?.length) return getLiveCatalog();
    itemRows = retry.data;
  }
  if (!itemRows?.length) return getLiveCatalog();

  const items = mapItems(itemRows);
  live = {
    items,
    links: (linksRes.data ?? []).map((r) => ({
      itemId: r.item_id,
      order: r.display_order ?? 0,
      type: r.link_type ?? "",
      text: r.link_text ?? "",
      url: r.link_url ?? "",
    })),
    rules: (rulesRes.data ?? []).map((r) => ({
      id: r.id,
      itemId: r.item_id,
      name: items[r.item_id]?.name ?? r.item_id,
      reason: r.reason ?? undefined,
      table: r.table_name,
      countryId: r.country_id ?? undefined,
      companionId: r.companion_id ?? undefined,
      activityId: r.activity_id ?? undefined,
      weatherId: r.weather_id ?? undefined,
      tempBandId: r.temp_band_id ?? undefined,
    })) as Rule[],
    stats: (statsRes.data ?? []).map((r) => ({
      activityId: r.activity_id,
      itemId: r.item_id,
      exposure: r.exposure_count ?? 0,
      deletes: r.delete_count ?? 0,
      shown: Boolean(r.comment_shown),
    })),
    activities: actRes.error || !actRes.data?.length
      ? DEFAULT_ACTIVITIES
      : actRes.data.map((r) => ({
          id: r.activity_id,
          name: r.activity_name,
          categoryName: r.activity_category_name || r.activity_name,
        })),
    groups: groupRes.error || !groupRes.data?.length
      ? DEFAULT_GROUPS
      : groupRes.data
          .map((r) => ({
            id: r.group_id,
            name: r.group_name,
            order: r.group_order ?? 0,
          }))
          .sort((a, b) => a.order - b.order),
  };
  emit();
  return live;
}

export async function seedCatalog() {
  const sb = getSupabase();
  if (!sb) return { ok: false, message: "Supabase 키가 없습니다" };

  const items = Object.values(SPEC_ITEMS).map((i) => ({
    id: i.id,
    name: i.name,
    item_desc: i.desc ?? null,
    purchasable: i.purchasable,
    link_count: i.linkCount,
    link_note: i.linkNote ?? null,
  }));
  const links = SPEC_LINKS.map((l) => ({
    item_id: l.itemId,
    display_order: l.order,
    link_type: l.type,
    link_text: l.text,
    link_url: l.url,
  }));
  const rules = (SPEC_RULES as Rule[]).map((r, idx) => ({
    id: `R${String(idx + 1).padStart(4, "0")}`,
    table_name: r.table,
    item_id: r.itemId,
    reason: r.reason ?? null,
    country_id: r.countryId ?? null,
    companion_id: r.companionId ?? null,
    activity_id: r.activityId ?? null,
    weather_id: r.weatherId ?? null,
    temp_band_id: r.tempBandId ?? null,
  }));
  const activities = DEFAULT_ACTIVITIES.map((a) => ({
    activity_id: a.id,
    activity_name: a.name,
    activity_category_name: a.categoryName,
  }));
  const groups = DEFAULT_GROUPS.map((g) => ({
    group_id: g.id,
    group_name: g.name,
    group_order: g.order,
  }));

  const a = await sb.from("catalog_items").upsert(items);
  if (a.error) return { ok: false, message: a.error.message };
  await sb.from("catalog_links").delete().neq("item_id", "");
  const b = await sb.from("catalog_links").insert(links);
  if (b.error) return { ok: false, message: b.error.message };
  const c = await sb.from("catalog_rules").upsert(rules);
  if (c.error) return { ok: false, message: c.error.message };
  const d = await sb.from("catalog_activities").upsert(activities);
  if (d.error) return { ok: false, message: `${d.error.message} (활동 테이블 SQL을 먼저 실행하세요)` };
  const e = await sb.from("catalog_group").upsert(groups);
  if (e.error) return { ok: false, message: `${e.error.message} (그룹 테이블 SQL을 먼저 실행하세요)` };
  await loadCatalogFromCloud();
  return { ok: true, message: `아이템 ${items.length} · 규칙 ${rules.length} · 활동 ${activities.length} 올렸습니다` };
}
