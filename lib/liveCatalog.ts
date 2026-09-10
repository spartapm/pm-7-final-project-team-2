import { SPEC_ITEMS, SPEC_LINKS, SPEC_RULES, type SpecItem, type SpecLink } from "./specData";
import { getSupabase } from "./supabase";
import type { Rule } from "./rules";

export type StatRow = {
  activityId: string;
  itemId: string;
  exposure: number;
  deletes: number;
  shown: boolean;
};

type Live = {
  items: Record<string, SpecItem>;
  links: SpecLink[];
  rules: Rule[];
  stats: StatRow[];
};

let live: Live | null = null;
const listeners = new Set<() => void>();

export function getLiveCatalog(): Live {
  return (
    live ?? {
      items: SPEC_ITEMS,
      links: SPEC_LINKS,
      rules: SPEC_RULES as Rule[],
      stats: [],
    }
  );
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

export async function loadCatalogFromCloud() {
  const sb = getSupabase();
  if (!sb) return getLiveCatalog();

  const [itemsRes, linksRes, rulesRes, statsRes] = await Promise.all([
    sb.from("catalog_items").select("id, name, item_desc, purchasable, link_count, link_note"),
    sb.from("catalog_links").select("item_id, display_order, link_type, link_text, link_url"),
    sb.from("catalog_rules").select(
      "id, table_name, item_id, reason, country_id, companion_id, activity_id, weather_id, temp_band_id"
    ),
    sb.from("item_stats").select("activity_id, item_id, exposure_count, delete_count, comment_shown"),
  ]);

  if (itemsRes.error || !itemsRes.data?.length) return getLiveCatalog();

  const items: Record<string, SpecItem> = {};
  for (const r of itemsRes.data) {
    items[r.id] = {
      id: r.id,
      name: r.name,
      desc: r.item_desc ?? undefined,
      purchasable: Boolean(r.purchasable),
      linkCount: r.link_count ?? 0,
      linkNote: r.link_note ?? undefined,
    };
  }

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

  const a = await sb.from("catalog_items").upsert(items);
  if (a.error) return { ok: false, message: a.error.message };
  await sb.from("catalog_links").delete().neq("item_id", "");
  const b = await sb.from("catalog_links").insert(links);
  if (b.error) return { ok: false, message: b.error.message };
  const c = await sb.from("catalog_rules").upsert(rules);
  if (c.error) return { ok: false, message: c.error.message };
  await loadCatalogFromCloud();
  return { ok: true, message: `아이템 ${items.length} · 규칙 ${rules.length} 올렸습니다` };
}
