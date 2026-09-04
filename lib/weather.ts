import type { ClimateInfo, CountryId, WeatherId } from "./types";
import { COUNTRIES } from "./catalog";
import { CLIMATE_NORMAL, WMO_MAP } from "./rules";
import { overlappingTempBands } from "./generate";
import { daysUntil, parseDate } from "./dates";

export function climateFromNormal(countryId: CountryId, startDate: string): ClimateInfo {
  const month = parseDate(startDate).getMonth();
  const row = CLIMATE_NORMAL[countryId][month];
  return {
    tempMin: row.min,
    tempMax: row.max,
    weatherIds: row.weather,
    source: "normal",
  };
}

export async function fetchClimate(
  countryId: CountryId,
  startDate: string,
  endDate: string
): Promise<ClimateInfo> {
  const fallback = climateFromNormal(countryId, startDate);
  const until = daysUntil(startDate);
  if (until > 16) return fallback;

  const country = COUNTRIES.find((c) => c.id === countryId);
  if (!country) return fallback;

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(country.lat));
    url.searchParams.set("longitude", String(country.lon));
    url.searchParams.set("start_date", startDate);
    url.searchParams.set("end_date", endDate);
    url.searchParams.set(
      "daily",
      "temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max"
    );
    url.searchParams.set("timezone", "auto");
    const res = await fetch(url.toString());
    if (!res.ok) return fallback;
    const json = await res.json();
    const daily = json.daily;
    if (!daily) return fallback;
    const mins: number[] = daily.temperature_2m_min ?? [];
    const maxs: number[] = daily.temperature_2m_max ?? [];
    const codes: number[] = daily.weather_code ?? [];
    const winds: number[] = daily.wind_speed_10m_max ?? [];
    const tempMin = Math.min(...mins);
    const tempMax = Math.max(...maxs);
    const weather = new Set<WeatherId>();
    for (const code of codes) {
      const w = WMO_MAP[code];
      if (w) weather.add(w);
    }
    if (winds.some((w) => w >= 30)) weather.add("windy");
    return {
      tempMin,
      tempMax,
      weatherIds: [...weather],
      source: "forecast",
    };
  } catch {
    return fallback;
  }
}

export function climateBands(climate: ClimateInfo) {
  return overlappingTempBands(climate.tempMin, climate.tempMax);
}
