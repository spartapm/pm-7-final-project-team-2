import { getLiveCatalog, setLiveStats, type StatRow } from "./liveCatalog";
import { getSupabase } from "./supabase";

function rateOf(row: StatRow) {
  if (!row.exposure) return 0;
  return row.deletes / row.exposure;
}

export function liveDeleteRate(activityId?: string, itemId?: string) {
  if (!activityId || !itemId) return undefined;
  const row = getLiveCatalog().stats.find((r) => r.activityId === activityId && r.itemId === itemId);
  if (!row) return undefined;
  const rate = rateOf(row);
  if (rate < 0.7) return undefined;
  if (row.shown || row.exposure >= 30) return rate;
  return undefined;
}

async function bump(activityId: string, itemId: string, field: "exposure_count" | "delete_count", delta: number) {
  const sb = getSupabase();
  if (!sb || !activityId || !itemId) return;
  const { data } = await sb
    .from("item_stats")
    .select("activity_id, item_id, exposure_count, delete_count, comment_shown")
    .eq("activity_id", activityId)
    .eq("item_id", itemId)
    .maybeSingle();
  const next = {
    activity_id: activityId,
    item_id: itemId,
    exposure_count: Math.max(0, (data?.exposure_count ?? 0) + (field === "exposure_count" ? delta : 0)),
    delete_count: Math.max(0, (data?.delete_count ?? 0) + (field === "delete_count" ? delta : 0)),
    comment_shown: Boolean(data?.comment_shown),
    updated_at: new Date().toISOString(),
  };
  await sb.from("item_stats").upsert(next);
  const stats = getLiveCatalog().stats.filter((r) => !(r.activityId === activityId && r.itemId === itemId));
  stats.push({
    activityId,
    itemId,
    exposure: next.exposure_count,
    deletes: next.delete_count,
    shown: next.comment_shown,
  });
  setLiveStats(stats);
}

export function recordItemExposure(activityId: string, itemId: string) {
  return bump(activityId, itemId, "exposure_count", 1);
}

export function recordItemDelete(activityId: string, itemId: string) {
  return bump(activityId, itemId, "delete_count", 1);
}

export function undoItemDelete(activityId: string, itemId: string) {
  return bump(activityId, itemId, "delete_count", -1);
}

export async function saveStat(row: StatRow) {
  const sb = getSupabase();
  if (!sb) return { ok: false, message: "Supabase 키가 없습니다" };
  const { error } = await sb.from("item_stats").upsert({
    activity_id: row.activityId,
    item_id: row.itemId,
    exposure_count: row.exposure,
    delete_count: row.deletes,
    comment_shown: row.shown,
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, message: error.message };
  const stats = getLiveCatalog().stats.filter((r) => !(r.activityId === row.activityId && r.itemId === row.itemId));
  stats.push(row);
  setLiveStats(stats);
  return { ok: true };
}
