import type {
  ActivityId,
  CompanionId,
  CountryId,
  TempBandId,
  WeatherId,
} from "./types";
import { SPEC_RULES } from "./specData";

export type Rule = {
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

export const WMO_MAP: Record<number, WeatherId> = {
  0: "sunny",
  1: "sunny",
  2: "cloudy",
  3: "cloudy",
  45: "cloudy",
  48: "cloudy",
  51: "rain",
  53: "rain",
  55: "rain",
  56: "rain",
  57: "rain",
  61: "rain",
  63: "rain",
  65: "rain",
  66: "rain",
  67: "rain",
  71: "snow",
  73: "snow",
  75: "snow",
  77: "snow",
  80: "rain",
  81: "rain",
  82: "rain",
  85: "snow",
  86: "snow",
  95: "rain",
  96: "rain",
  99: "rain",
};

/** 월별 평년 기온(대표 도시). 맑음/구름은 참고용 */
export const CLIMATE_NORMAL: Record<
  CountryId,
  { min: number; max: number; weather: WeatherId[] }[]
> = {
  JP: [
    { min: 2, max: 10, weather: ["cloudy", "windy"] },
    { min: 2, max: 11, weather: ["cloudy"] },
    { min: 5, max: 14, weather: ["cloudy", "rain"] },
    { min: 10, max: 19, weather: ["sunny", "rain", "windy"] },
    { min: 15, max: 24, weather: ["sunny", "rain"] },
    { min: 19, max: 27, weather: ["rain"] },
    { min: 23, max: 31, weather: ["sunny"] },
    { min: 24, max: 32, weather: ["sunny"] },
    { min: 21, max: 28, weather: ["sunny", "rain"] },
    { min: 15, max: 22, weather: ["cloudy", "rain"] },
    { min: 9, max: 17, weather: ["cloudy"] },
    { min: 4, max: 12, weather: ["cloudy", "windy"] },
  ],
  VN: [
    { min: 14, max: 20, weather: ["cloudy"] },
    { min: 15, max: 21, weather: ["cloudy"] },
    { min: 18, max: 24, weather: ["cloudy", "rain"] },
    { min: 21, max: 28, weather: ["rain"] },
    { min: 24, max: 32, weather: ["rain"] },
    { min: 26, max: 33, weather: ["rain"] },
    { min: 26, max: 33, weather: ["rain"] },
    { min: 26, max: 32, weather: ["rain"] },
    { min: 25, max: 31, weather: ["rain"] },
    { min: 22, max: 28, weather: ["rain"] },
    { min: 18, max: 25, weather: ["cloudy"] },
    { min: 15, max: 21, weather: ["cloudy"] },
  ],
  CN: [
    { min: -8, max: 2, weather: ["snow", "windy"] },
    { min: -5, max: 6, weather: ["windy"] },
    { min: 1, max: 13, weather: ["windy"] },
    { min: 9, max: 21, weather: ["sunny"] },
    { min: 15, max: 27, weather: ["sunny"] },
    { min: 20, max: 31, weather: ["sunny", "rain"] },
    { min: 23, max: 32, weather: ["rain"] },
    { min: 22, max: 31, weather: ["rain"] },
    { min: 16, max: 27, weather: ["sunny"] },
    { min: 9, max: 20, weather: ["sunny"] },
    { min: 1, max: 10, weather: ["windy"] },
    { min: -6, max: 3, weather: ["windy"] },
  ],
  US: [
    { min: -3, max: 4, weather: ["snow", "windy"] },
    { min: -2, max: 6, weather: ["snow"] },
    { min: 2, max: 11, weather: ["windy"] },
    { min: 7, max: 17, weather: ["rain"] },
    { min: 13, max: 22, weather: ["sunny"] },
    { min: 18, max: 27, weather: ["sunny"] },
    { min: 22, max: 30, weather: ["sunny"] },
    { min: 21, max: 29, weather: ["sunny"] },
    { min: 17, max: 25, weather: ["sunny"] },
    { min: 11, max: 19, weather: ["rain"] },
    { min: 6, max: 12, weather: ["windy"] },
    { min: 0, max: 7, weather: ["snow"] },
  ],
  TH: [
    { min: 21, max: 32, weather: ["sunny"] },
    { min: 23, max: 33, weather: ["sunny"] },
    { min: 25, max: 34, weather: ["sunny"] },
    { min: 26, max: 35, weather: ["sunny"] },
    { min: 26, max: 34, weather: ["rain"] },
    { min: 25, max: 33, weather: ["rain"] },
    { min: 25, max: 32, weather: ["rain"] },
    { min: 25, max: 32, weather: ["rain"] },
    { min: 25, max: 32, weather: ["rain"] },
    { min: 24, max: 32, weather: ["rain"] },
    { min: 23, max: 32, weather: ["sunny"] },
    { min: 21, max: 31, weather: ["sunny"] },
  ],
  PH: [
    { min: 23, max: 30, weather: ["sunny"] },
    { min: 23, max: 31, weather: ["sunny"] },
    { min: 24, max: 32, weather: ["sunny"] },
    { min: 25, max: 33, weather: ["rain"] },
    { min: 25, max: 33, weather: ["rain"] },
    { min: 25, max: 32, weather: ["rain"] },
    { min: 24, max: 31, weather: ["rain"] },
    { min: 24, max: 31, weather: ["rain"] },
    { min: 24, max: 31, weather: ["rain"] },
    { min: 24, max: 31, weather: ["rain"] },
    { min: 24, max: 31, weather: ["rain"] },
    { min: 23, max: 30, weather: ["sunny"] },
  ],
  SG: [
    { min: 24, max: 31, weather: ["rain"] },
    { min: 24, max: 32, weather: ["rain"] },
    { min: 25, max: 32, weather: ["rain"] },
    { min: 25, max: 32, weather: ["rain"] },
    { min: 25, max: 32, weather: ["rain"] },
    { min: 25, max: 31, weather: ["rain"] },
    { min: 25, max: 31, weather: ["rain"] },
    { min: 25, max: 31, weather: ["rain"] },
    { min: 25, max: 31, weather: ["rain"] },
    { min: 24, max: 31, weather: ["rain"] },
    { min: 24, max: 31, weather: ["rain"] },
    { min: 24, max: 31, weather: ["rain"] },
  ],
};
