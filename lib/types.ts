export type CountryId = "JP" | "VN" | "CN" | "US" | "TH" | "PH" | "SG";
export type CompanionId =
  | "solo"
  | "friend"
  | "couple"
  | "spouse"
  | "child"
  | "parent"
  | "pet";
export type ActivityId =
  | "photo"
  | "camping"
  | "hiking"
  | "golf"
  | "swim"
  | "spa"
  | "winter"
  | "themepark"
  | "festival"
  | "temple";
export type WeatherId = "sunny" | "cloudy" | "windy" | "rain" | "snow";
export type TempBandId = "cold" | "mild" | "hot";
export type CategoryKind = "essential" | "base" | "activity" | "personal" | "custom";
export type FilterMode = "all" | "unchecked" | "wished";
export type TripStatus = "ongoing" | "upcoming" | "done";

export type ChecklistItem = {
  id: string;
  name: string;
  reason?: string;
  checked: boolean;
  wished: boolean;
  custom: boolean;
  selected?: boolean;
};

export type Category = {
  id: string;
  name: string;
  kind: CategoryKind;
  activityId?: ActivityId;
  hint?: string;
  collapsed: boolean;
  items: ChecklistItem[];
};

export type ClimateInfo = {
  tempMin: number;
  tempMax: number;
  weatherIds: WeatherId[];
  source: "forecast" | "normal";
};

export type Trip = {
  id: string;
  countryId: CountryId;
  startDate: string;
  endDate: string;
  companions: CompanionId[];
  activities: ActivityId[];
  createdAt: string;
  climate?: ClimateInfo;
  categories: Category[];
  remindersShown: string[];
};

export type OnboardingDraft = {
  countryId?: CountryId;
  startDate?: string;
  endDate?: string;
  companions: CompanionId[];
  activities: ActivityId[];
};

export type AppState = {
  accountId: string;
  trips: Trip[];
  personalItems: { id: string; name: string }[];
  draft: OnboardingDraft;
};
