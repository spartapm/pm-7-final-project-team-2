import { getSupabase } from "./supabase";
import { loadCatalogFromCloud } from "./liveCatalog";
import { saveStat } from "./stats";

const ACTIVITY: Record<string, string> = {
  photo: "photo",
  camping: "camping",
  hiking: "hiking",
  golf: "golf",
  swimming: "swim",
  swim: "swim",
  spa: "spa",
  winter_sports: "winter",
  winter: "winter",
  amusement_park: "themepark",
  themepark: "themepark",
  festival: "festival",
  temple: "temple",
};

const COMPANION: Record<string, string> = {
  alone: "solo",
  solo: "solo",
  friend: "friend",
  lover: "couple",
  couple: "couple",
  spouse: "spouse",
  child: "child",
  parent: "parent",
  pet: "pet",
};

const TEMP: Record<string, string> = {
  low: "cold",
  mid: "mild",
  high: "hot",
  cold: "cold",
  mild: "mild",
  hot: "hot",
};

export function parseCsv(text: string): Record<string, string>[] {
  const src = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let q = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
          continue;
        }
        q = false;
        continue;
      }
      field += c;
      continue;
    }
    if (c === '"') {
      q = true;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (c === "\r") continue;
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  const header = (rows[0] ?? []).map((h) => h.trim());
  return rows
    .slice(1)
    .filter((r) => r.some((x) => String(x).trim()))
    .map((r) => {
      const o: Record<string, string> = {};
      header.forEach((h, idx) => {
        o[h] = String(r[idx] ?? "").trim();
      });
      return o;
    });
}

type Kind =
  | "items"
  | "links"
  | "stats"
  | "essential"
  | "base"
  | "country"
  | "companion"
  | "activity"
  | "weather"
  | "temp";

function classify(name: string, headers: string[]): Kind | null {
  const n = name.toLowerCase();
  if (n.includes("item_master")) return "items";
  if (n.includes("item_link")) return "links";
  if (n.includes("item_delete_rate")) return "stats";
  if (n.includes("rule_essential")) return "essential";
  if (n.includes("rule_base")) return "base";
  if (n.includes("rule_country")) return "country";
  if (n.includes("rule_companion")) return "companion";
  if (n.includes("rule_activity")) return "activity";
  if (n.includes("rule_weather")) return "weather";
  if (n.includes("rule_temp")) return "temp";
  if (headers.includes("item_name") && headers.includes("item_id")) return "items";
  if (headers.includes("link_url") && headers.includes("link_text")) return "links";
  if (headers.includes("delete_rate") || headers.includes("exposure_count")) return "stats";
  return null;
}

export async function importCsvFiles(files: { name: string; text: string }[]) {
  const sb = getSupabase();
  if (!sb) return { ok: false, message: "Supabase 키가 없습니다. .env.local을 확인하세요." };

  const parts: string[] = [];
  const unknown: string[] = [];

  for (const file of files) {
    const rows = parseCsv(file.text);
    const kind = classify(file.name, Object.keys(rows[0] ?? {}));
    if (!kind) {
      unknown.push(file.name);
      continue;
    }

    if (kind === "items") {
      const items = rows
        .filter((r) => r.item_id)
        .map((r) => ({
          id: r.item_id,
          name: r.item_name || r.item_id,
          item_desc: r.item_desc || null,
          purchasable: r.is_purchasable === "Y" || r.is_purchasable === "true",
          link_count: r.link_count ? Number(r.link_count) : 0,
          link_note: r.link_note || null,
        }));
      const res = await sb.from("catalog_items").upsert(items);
      if (res.error) return { ok: false, message: `${file.name}: ${res.error.message}` };
      parts.push(`아이템 ${items.length}개`);
      continue;
    }

    if (kind === "links") {
      const links = rows
        .filter((r) => r.item_id && r.link_url)
        .map((r) => ({
          item_id: r.item_id,
          display_order: Number(r.display_order) || 0,
          link_type: r.link_type || null,
          link_text: r.link_text || null,
          link_url: r.link_url,
        }));
      await sb.from("catalog_links").delete().neq("item_id", "");
      const res = await sb.from("catalog_links").insert(links);
      if (res.error) return { ok: false, message: `${file.name}: ${res.error.message}` };
      parts.push(`링크 ${links.length}개`);
      continue;
    }

    if (kind === "stats") {
      let n = 0;
      for (const r of rows) {
        if (!r.item_id) continue;
        const activityId = ACTIVITY[r.activity_id] ?? r.activity_id;
        if (!activityId) continue;
        const exposure = Number(r.exposure_count) || 0;
        const deletes =
          r.delete_count !== undefined && r.delete_count !== ""
            ? Number(r.delete_count) || 0
            : r.delete_rate
              ? Math.round(exposure * Number(r.delete_rate))
              : 0;
        const saved = await saveStat({
          activityId,
          itemId: r.item_id,
          exposure,
          deletes,
          shown: r.comment_shown === "Y" || r.comment_shown === "true",
        });
        if (!saved.ok) return { ok: false, message: `${file.name}: ${saved.message}` };
        n += 1;
      }
      parts.push(`삭제율 ${n}건`);
      continue;
    }

    const rules = rows
      .filter((r) => r.item_id)
      .map((r, idx) => ({
        id: r.rule_id || `${kind}_${idx + 1}`,
        table_name: kind,
        item_id: r.item_id,
        reason: r.reason_comment || null,
        country_id: r.country_id || null,
        companion_id: r.companion_id ? COMPANION[r.companion_id] ?? r.companion_id : null,
        activity_id: r.activity_id ? ACTIVITY[r.activity_id] ?? r.activity_id : null,
        weather_id: r.weather_condition_id || null,
        temp_band_id: r.temp_band_id ? TEMP[r.temp_band_id] ?? r.temp_band_id : null,
      }));
    const res = await sb.from("catalog_rules").upsert(rules);
    if (res.error) return { ok: false, message: `${file.name}: ${res.error.message}` };
    parts.push(`${file.name} 규칙 ${rules.length}개`);
  }

  await loadCatalogFromCloud();
  if (!parts.length) {
    return {
      ok: false,
      message: unknown.length
        ? `인식하지 못한 파일: ${unknown.join(", ")}. item_master / item_link / item_delete_rate / rule_* 이름이어야 합니다.`
        : "올린 파일이 없습니다.",
    };
  }
  const extra = unknown.length ? ` · 건너뜀 ${unknown.join(", ")}` : "";
  return { ok: true, message: `${parts.join(" · ")} 올렸습니다${extra}` };
}
