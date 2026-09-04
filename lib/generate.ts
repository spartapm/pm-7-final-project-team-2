import type {
  ActivityId,
  Category,
  ChecklistItem,
  ClimateInfo,
  CompanionId,
  CountryId,
  TempBandId,
  WeatherId,
} from "./types";
import { CATEGORY_META } from "./catalog";
import { RULES, SOURCE_RANK, type Rule } from "./rules";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function categoryForRule(rule: Rule): string {
  if (rule.table === "essential") return "essential";
  if (rule.table === "activity" && rule.activityId) return rule.activityId;
  return "base";
}

function srcRank(section: string, table: string) {
  const order = SOURCE_RANK[section] ?? ["activity", "country", "companion", "weather", "temp", "base"];
  const i = order.indexOf(table);
  return i === -1 ? 99 : i;
}

export function overlappingTempBands(min: number, max: number): TempBandId[] {
  const bands: TempBandId[] = [];
  if (min < 5) bands.push("cold");
  if (max >= 5 && min <= 26) bands.push("mild");
  if (max >= 26) bands.push("hot");
  if (bands.length === 0) bands.push("mild");
  return bands;
}

export function generateCategories(input: {
  countryId: CountryId;
  companions: CompanionId[];
  activities: ActivityId[];
  weatherIds: WeatherId[];
  tempBands: TempBandId[];
  personalItems: { id: string; name: string }[];
}): Category[] {
  const matched: Rule[] = [];
  for (const rule of RULES) {
    if (rule.table === "essential" || rule.table === "base") {
      matched.push(rule);
      continue;
    }
    if (rule.table === "country" && rule.countryId === input.countryId) {
      matched.push(rule);
      continue;
    }
    if (rule.table === "companion" && rule.companionId && input.companions.includes(rule.companionId)) {
      matched.push(rule);
      continue;
    }
    if (rule.table === "activity" && rule.activityId && input.activities.includes(rule.activityId)) {
      matched.push(rule);
      continue;
    }
    if (rule.table === "weather" && rule.weatherId && input.weatherIds.includes(rule.weatherId)) {
      matched.push(rule);
      continue;
    }
    if (rule.table === "temp" && rule.tempBandId && input.tempBands.includes(rule.tempBandId)) {
      matched.push(rule);
    }
  }

  type Picked = { rule: Rule; section: string };
  const picked = new Map<string, Picked>();

  for (const rule of matched) {
    const section = categoryForRule(rule);
    const existing = picked.get(rule.itemId);
    const newPri = CATEGORY_META[section]?.matchPriority ?? 99;
    const oldPri = existing ? CATEGORY_META[existing.section]?.matchPriority ?? 99 : 99;
    if (!existing || newPri < oldPri) {
      picked.set(rule.itemId, { rule, section });
    }
  }

  for (const rule of matched) {
    const current = picked.get(rule.itemId);
    if (!current) continue;
    const section = categoryForRule(rule);
    if (section !== current.section) continue;
    if (srcRank(section, rule.table) < srcRank(section, current.rule.table)) {
      picked.set(rule.itemId, { rule, section });
    }
  }

  const bySection = new Map<string, ChecklistItem[]>();
  for (const { rule, section } of picked.values()) {
    const list = bySection.get(section) ?? [];
    list.push({
      id: uid("it"),
      name: rule.name,
      reason: rule.reason,
      checked: false,
      wished: false,
      custom: false,
    });
    bySection.set(section, list);
  }

  if (input.personalItems.length) {
    bySection.set(
      "personal",
      input.personalItems.map((p) => ({
        id: uid("it"),
        name: p.name,
        checked: false,
        wished: false,
        custom: true,
      }))
    );
  }

  const sections = [...bySection.entries()].sort((a, b) => {
    const da = CATEGORY_META[a[0]]?.displayOrder ?? 50;
    const db = CATEGORY_META[b[0]]?.displayOrder ?? 50;
    return da - db;
  });

  return sections.map(([key, items]) => {
    const meta = CATEGORY_META[key];
    return {
      id: uid("cat"),
      name: meta?.name ?? key,
      kind: meta?.kind ?? "custom",
      activityId: meta?.kind === "activity" ? (key as ActivityId) : undefined,
      hint: meta?.hint,
      collapsed: false,
      items,
    };
  });
}

export function emptyCustomCategory(name: string): Category {
  return {
    id: uid("cat"),
    name,
    kind: "custom",
    hint: "직접 추가한 항목",
    collapsed: false,
    items: [],
  };
}

export function climateReasonNote(climate?: ClimateInfo) {
  if (!climate) return undefined;
  if (climate.source === "normal") return "이 시기 평균 기후 기준이에요";
  return undefined;
}
