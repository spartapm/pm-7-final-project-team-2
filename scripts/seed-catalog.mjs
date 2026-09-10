import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error("missing supabase env");
  process.exit(1);
}

const specPath = new URL("../lib/specData.ts", import.meta.url);
const raw = readFileSync(specPath, "utf8");
const itemsMatch = raw.match(/export const SPEC_ITEMS[\s\S]*?= ({[\s\S]*?});/);
const linksMatch = raw.match(/export const SPEC_LINKS[\s\S]*?= (\[[\s\S]*?\]);/);
const rulesMatch = raw.match(/export const SPEC_RULES = (\[[\s\S]*\]);\s*$/);
if (!itemsMatch || !linksMatch || !rulesMatch) {
  console.error("could not parse specData.ts");
  process.exit(1);
}
const SPEC_ITEMS = JSON.parse(itemsMatch[1]);
const SPEC_LINKS = JSON.parse(linksMatch[1]);
const SPEC_RULES = JSON.parse(rulesMatch[1]);

const sb = createClient(url, key, { auth: { persistSession: false } });
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
const rules = SPEC_RULES.map((r, idx) => ({
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
if (a.error) throw a.error;
await sb.from("catalog_links").delete().neq("item_id", "__none__");
const b = await sb.from("catalog_links").insert(links);
if (b.error) throw b.error;
const c = await sb.from("catalog_rules").upsert(rules);
if (c.error) throw c.error;
console.log("seeded", items.length, "items", rules.length, "rules", links.length, "links");
