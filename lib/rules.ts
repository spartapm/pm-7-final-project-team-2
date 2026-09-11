import type {
  ActivityId,
  CompanionId,
  CountryId,
  TempBandId,
  WeatherId,
} from "./types";
import { SPEC_RULES, SPEC_WMO_MAP } from "./specData";

export type Rule = {
  id?: string;
  itemId: string;
  name: string;
  reason?: string;
  table:
    | "essential"
    | "base"
    | "country"
    | "companion"
    | "activity"
    | "weather"
    | "temp";
  countryId?: CountryId;
  companionId?: CompanionId;
  activityId?: ActivityId;
  weatherId?: WeatherId;
  tempBandId?: TempBandId;
};

export const RULES: Rule[] = SPEC_RULES as Rule[];

export const SOURCE_RANK: Record<string, string[]> = {
  essential: ["essential"],
  base: ["country", "companion", "weather", "temp", "base"],
  photo: ["activity"],
  camping: ["activity"],
  hiking: ["activity"],
  golf: ["activity"],
  swim: ["activity"],
  spa: ["activity"],
  winter: ["activity"],
  themepark: ["activity"],
  festival: ["activity"],
  temple: ["activity"],
};

export const WMO_MAP = SPEC_WMO_MAP as Record<number, WeatherId>;
