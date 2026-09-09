import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dir = path.join(root, "data");

function parse(text) {
  text = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') {
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
  const header = rows[0];
  return rows
    .slice(1)
    .filter((r) => r.some((x) => String(x).trim()))
    .map((r) => {
      const o = {};
      header.forEach((h, idx) => {
        o[h] = String(r[idx] ?? "").trim();
      });
      return o;
    });
}

const read = (name) => parse(fs.readFileSync(path.join(dir, name), "utf8"));

const ACTIVITY = {
  photo: "photo",
  camping: "camping",
  hiking: "hiking",
  golf: "golf",
  swimming: "swim",
  spa: "spa",
  winter_sports: "winter",
  amusement_park: "themepark",
  festival: "festival",
  temple: "temple",
};

const COMPANION = {
  alone: "solo",
  friend: "friend",
  lover: "couple",
  spouse: "spouse",
  child: "child",
  parent: "parent",
  pet: "pet",
};

const TEMP = { low: "cold", mid: "mild", high: "hot" };

const master = {};
for (const r of read("item_master.csv")) {
  master[r.item_id] = {
    id: r.item_id,
    name: r.item_name,
    desc: r.item_desc || undefined,
    purchasable: r.is_purchasable === "Y",
    linkCount: r.link_count ? Number(r.link_count) : 0,
    linkNote: r.link_note || undefined,
  };
}

const links = read("item_link.csv").map((r) => ({
  itemId: r.item_id,
  order: Number(r.display_order) || 0,
  type: r.link_type,
  text: r.link_text,
  url: r.link_url,
}));

const deleteRates = read("item_delete_rate.csv")
  .filter((r) => r.item_id)
  .map((r) => ({
    activityId: ACTIVITY[r.activity_id] ?? r.activity_id,
    itemId: r.item_id,
    rate: r.delete_rate ? Number(r.delete_rate) : 0,
    shown: r.comment_shown === "Y",
    exposure: r.exposure_count ? Number(r.exposure_count) : 0,
  }));

function itemName(id) {
  return master[id]?.name ?? id;
}

const rules = [];

for (const r of read("rule_essential_item.csv")) {
  rules.push({
    itemId: r.item_id,
    name: itemName(r.item_id),
    reason: r.reason_comment || undefined,
    table: "essential",
  });
}
for (const r of read("rule_base_item.csv")) {
  rules.push({
    itemId: r.item_id,
    name: itemName(r.item_id),
    reason: r.reason_comment || undefined,
    table: "base",
  });
}
for (const r of read("rule_country_item.csv")) {
  rules.push({
    itemId: r.item_id,
    name: itemName(r.item_id),
    reason: r.reason_comment || undefined,
    table: "country",
    countryId: r.country_id,
  });
}
for (const r of read("rule_companion_item.csv")) {
  rules.push({
    itemId: r.item_id,
    name: itemName(r.item_id),
    reason: r.reason_comment || undefined,
    table: "companion",
    companionId: COMPANION[r.companion_id] ?? r.companion_id,
  });
}
for (const r of read("rule_activity_item.csv")) {
  rules.push({
    itemId: r.item_id,
    name: itemName(r.item_id),
    reason: r.reason_comment || undefined,
    table: "activity",
    activityId: ACTIVITY[r.activity_id] ?? r.activity_id,
  });
}
for (const r of read("rule_weather_item.csv")) {
  rules.push({
    itemId: r.item_id,
    name: itemName(r.item_id),
    reason: r.reason_comment || undefined,
    table: "weather",
    weatherId: r.weather_condition_id,
  });
}
for (const r of read("rule_temp_item.csv")) {
  rules.push({
    itemId: r.item_id,
    name: itemName(r.item_id),
    reason: r.reason_comment || undefined,
    table: "temp",
    tempBandId: TEMP[r.temp_band_id] ?? r.temp_band_id,
  });
}

const out = `/* generated from data/*.csv — run node scripts/build-spec.mjs */

export type SpecItem = {
  id: string;
  name: string;
  desc?: string;
  purchasable: boolean;
  linkCount: number;
  linkNote?: string;
};

export type SpecLink = {
  itemId: string;
  order: number;
  type: string;
  text: string;
  url: string;
};

export const SPEC_ITEMS: Record<string, SpecItem> = ${JSON.stringify(master, null, 2)};

export const SPEC_LINKS: SpecLink[] = ${JSON.stringify(links, null, 2)};

export const SPEC_DELETE_RATES: { activityId: string; itemId: string; rate: number; shown: boolean; exposure: number }[] = ${JSON.stringify(deleteRates, null, 2)};

export const SPEC_RULES = ${JSON.stringify(rules, null, 2)};
`;

fs.mkdirSync(path.join(root, "lib"), { recursive: true });
fs.writeFileSync(path.join(root, "lib/specData.ts"), out);
console.log("wrote lib/specData.ts", "items", Object.keys(master).length, "rules", rules.length, "links", links.length);
