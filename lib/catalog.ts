import type {
  ActivityId,
  CompanionId,
  CountryId,
  CategoryKind,
} from "./types";

export const COUNTRIES: {
  id: CountryId;
  name: string;
  lat: number;
  lon: number;
}[] = [
  { id: "JP", name: "일본", lat: 35.6762, lon: 139.6503 },
  { id: "VN", name: "베트남", lat: 21.0278, lon: 105.8342 },
  { id: "CN", name: "중국", lat: 39.9042, lon: 116.4074 },
  { id: "US", name: "미국", lat: 40.7128, lon: -74.006 },
  { id: "TH", name: "태국", lat: 13.7563, lon: 100.5018 },
  { id: "PH", name: "필리핀", lat: 14.5995, lon: 120.9842 },
  { id: "SG", name: "싱가포르", lat: 1.3521, lon: 103.8198 },
];

export const COMPANIONS: { id: CompanionId; name: string }[] = [
  { id: "solo", name: "혼자" },
  { id: "friend", name: "친구와" },
  { id: "couple", name: "연인과" },
  { id: "spouse", name: "배우자와" },
  { id: "child", name: "아이와" },
  { id: "parent", name: "부모님과" },
  { id: "pet", name: "반려동물" },
];

export const ACTIVITIES: { id: ActivityId; name: string }[] = [
  { id: "photo", name: "사진 여행" },
  { id: "camping", name: "캠핑" },
  { id: "hiking", name: "하이킹·등산" },
  { id: "golf", name: "골프" },
  { id: "swim", name: "수영·물놀이" },
  { id: "spa", name: "온천·스파" },
  { id: "winter", name: "겨울 스포츠" },
  { id: "themepark", name: "놀이공원" },
  { id: "festival", name: "페스티벌" },
  { id: "temple", name: "종교시설·사원" },
];

export const EXTRA_PRESET_CATEGORIES = [
  { id: "triple", name: "트리플에서 챙기기" },
  { id: "transit", name: "통신/교통 준비" },
  { id: "fun", name: "즐길거리 준비" },
  { id: "kids", name: "아이 준비물" },
  { id: "parents", name: "부모님을 위한 준비물" },
];

export const CATEGORY_META: Record<
  string,
  { name: string; kind: CategoryKind; hint?: string; matchPriority: number; displayOrder: number }
> = {
  personal: {
    name: "나만의 준비물",
    kind: "personal",
    hint: "모든 여행 일정에 담겨요",
    matchPriority: 13,
    displayOrder: 0,
  },
  essential: {
    name: "필수 준비물",
    kind: "essential",
    matchPriority: 1,
    displayOrder: 1,
  },
  base: { name: "기본 짐싸기", kind: "base", matchPriority: 12, displayOrder: 2 },
  photo: {
    name: "사진 여행",
    kind: "activity",
    matchPriority: 2,
    displayOrder: 3,
  },
  camping: { name: "캠핑", kind: "activity", matchPriority: 3, displayOrder: 4 },
  hiking: {
    name: "하이킹·등산",
    kind: "activity",
    matchPriority: 4,
    displayOrder: 5,
  },
  golf: { name: "골프", kind: "activity", matchPriority: 5, displayOrder: 6 },
  swim: {
    name: "수영·물놀이",
    kind: "activity",
    matchPriority: 6,
    displayOrder: 7,
  },
  spa: { name: "온천·스파", kind: "activity", matchPriority: 7, displayOrder: 8 },
  winter: {
    name: "겨울 스포츠",
    kind: "activity",
    matchPriority: 8,
    displayOrder: 9,
  },
  themepark: {
    name: "놀이공원",
    kind: "activity",
    matchPriority: 9,
    displayOrder: 10,
  },
  festival: {
    name: "페스티벌",
    kind: "activity",
    matchPriority: 10,
    displayOrder: 11,
  },
  temple: {
    name: "종교시설·사원",
    kind: "activity",
    matchPriority: 11,
    displayOrder: 12,
  },
};

export const PRESET_CATEGORY_NAMES = [
  "트리플에서 챙기기",
  "통신/교통 준비",
  "즐길거리 준비",
  "아이 준비물",
  "부모님을 위한 준비물",
  "필수 준비물",
  "기본 짐싸기",
  "사진 여행",
  "캠핑",
  "하이킹·등산",
  "골프",
  "수영·물놀이",
  "온천·스파",
  "겨울 스포츠",
  "놀이공원",
  "페스티벌",
  "종교시설·사원",
  "나만의 준비물",
];

export function countryName(id: CountryId) {
  return COUNTRIES.find((c) => c.id === id)?.name ?? id;
}

export function activityName(id: ActivityId) {
  return ACTIVITIES.find((a) => a.id === id)?.name ?? id;
}

export function companionName(id: CompanionId) {
  return COMPANIONS.find((c) => c.id === id)?.name ?? id;
}
