import type {
  ActivityId,
  CompanionId,
  CountryId,
  TempBandId,
  WeatherId,
} from "./types";

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

const E = (
  id: string,
  name: string,
  reason?: string
): Rule => ({ itemId: id, name, reason, table: "essential" });

const B = (
  id: string,
  name: string,
  reason?: string
): Rule => ({ itemId: id, name, reason, table: "base" });

const C = (
  countryId: CountryId,
  id: string,
  name: string,
  reason?: string
): Rule => ({ itemId: id, name, reason, table: "country", countryId });

const P = (
  companionId: CompanionId,
  id: string,
  name: string,
  reason?: string
): Rule => ({ itemId: id, name, reason, table: "companion", companionId });

const A = (
  activityId: ActivityId,
  id: string,
  name: string,
  reason?: string
): Rule => ({ itemId: id, name, reason, table: "activity", activityId });

const W = (
  weatherId: WeatherId,
  id: string,
  name: string,
  reason?: string
): Rule => ({ itemId: id, name, reason, table: "weather", weatherId });

const T = (
  tempBandId: TempBandId,
  id: string,
  name: string,
  reason?: string
): Rule => ({ itemId: id, name, reason, table: "temp", tempBandId });

export const RULES: Rule[] = [
  E("passport", "여권", "유효기간 6개월 이상 남았는지 함께 확인"),
  E("ticket", "항공권(모바일 e-티켓)"),
  E("esim", "eSIM 또는 로밍 데이터"),
  E("insurance", "여행자보험 증서"),
  E("card", "결제 카드"),

  B("underwear", "속옷"),
  B("socks", "양말"),
  B("toiletry", "세면도구"),
  B("charger", "충전기·케이블"),
  B("powerbank", "보조배터리", "2026.4.20 ICAO 기준 1인 2개·160Wh 이하. 단자는 절연하세요"),
  B("meds", "상비약"),
  B("mask", "마스크"),
  B("pouch", "세면·약 파우치"),
  B("slippers", "슬리퍼"),
  B("clothes", "여벌 옷"),
  B("laundry", "여행용 세제"),
  B("copy", "여권 사본"),

  C("JP", "coin", "동전 지갑", "자판기·코인로커·사찰 참배료가 대부분 동전이라 금방 쌓여요"),
  C("JP", "transformer", "변압기(220V 전용 발열기기용)", "일본은 100V라 한국 220V 전용 고데기·드라이기는 제대로 안 돌아가요"),
  C("JP", "vjw", "Visit Japan Web", "의무는 아니지만 입국 심사가 빨라져요"),
  C("JP", "iccard", "교통카드(Suica/PASMO)", "공항에서 바로 쓸 수 있게 앱 잔액을 채워 두세요"),
  C("JP", "cash", "엔화 현금 소액", "소규모 식당·사원은 카드가 안 되는 곳이 있어요"),

  C("VN", "tdac", "전자 입국신고", "베트남은 입국 전 사전신고가 필요해요"),
  C("VN", "mosquito", "모기 기피제", "도심·해안 모두 모기가 많아요"),
  C("VN", "adapter_vn", "멀티 어댑터", "A·C형이 섞여 있어요"),
  C("VN", "cash_vnd", "동 소액 현금", "길거리 음식·그랩 바이크 잔돈이 필요할 수 있어요"),

  C("CN", "visa", "전자 입국카드", "무비자 30일은 2026.12.31까지 한시 정책이에요. 여행 전 재확인하세요"),
  C("CN", "vpn", "메신저·지도 대안", "구글·카카오가 안 될 수 있어 현지 앱을 미리 받아 두세요"),
  C("CN", "cny", "위안화 소액 현금"),
  C("CN", "adapter_cn", "I형 어댑터"),

  C("US", "esta", "ESTA", "2025.9.30부터 수수료가 약 $40로 올랐어요"),
  C("US", "adapter_us", "A형 어댑터"),
  C("US", "tip", "팁용 소액 달러"),

  C("TH", "tdac_th", "TDAC 전자 입국신고", "태국은 입국 전 TDAC 제출이 필요해요"),
  C("TH", "mosquito_th", "모기 기피제"),
  C("TH", "adapter_th", "A·B형 어댑터"),
  C("TH", "cannabis", "대마 함유 제품 주의", "2025.6.25부터 태국 의사 처방 없는 제품은 불법이에요"),

  C("PH", "etravel", "eTravel", "필리핀은 입국 전 eTravel 신고가 필요해요"),
  C("PH", "mosquito_ph", "모기 기피제"),
  C("PH", "reef", "리프세이프 선크림", "일부 해역은 일반 선크림 사용을 제한해요"),
  C("PH", "adapter_ph", "A·C형 어댑터"),

  C("SG", "sgac", "SGAC 입국신고"),
  C("SG", "adapter_sg", "G형 어댑터", "영국형 플러그만 써요"),
  C("SG", "vape", "전자담배 반입 금지", "2026.5.1부터 소지만으로도 벌금이 커요"),
  C("SG", "gum", "풍선껌 반입 주의", "치료 목적 외 반입이 제한돼요"),

  P("child", "kids_meds", "어린이용 상비약"),
  P("child", "kids_snack", "아이 간식"),
  P("child", "stroller", "휴대용 유모차·힙시트"),
  P("pet", "pet_passport", "반려동물 검역·건강증명"),
  P("pet", "carrier", "이동장"),
  P("pet", "pet_food", "평소 먹던 사료 소량"),
  P("parent", "extra_meds", "복용약 여분", "시차·일정 밀림을 대비해 하루치 더 챙기세요"),
  P("parent", "neck", "목 쿠션"),
  P("couple", "charger_share", "여분 충전 케이블"),
  P("friend", "split", "더치페이용 가계부 앱"),
  P("spouse", "copy_docs", "가족 관계 서류 사본", "렌터카·보험에서 필요할 수 있어요"),

  A("photo", "camera", "카메라"),
  A("photo", "battery", "여분 배터리"),
  A("photo", "cleaner", "렌즈 클리너"),
  A("photo", "sd", "메모리 카드"),
  A("photo", "strap", "스트랩·파우치"),

  A("camping", "headlamp", "헤드램프"),
  A("camping", "sleeping", "경량 침낭·라이너"),
  A("camping", "multitool", "멀티툴"),
  A("camping", "drybag", "드라이백"),

  A("hiking", "boots", "등산화"),
  A("hiking", "pole", "트레킹 폴"),
  A("hiking", "raincoat", "우의"),
  A("hiking", "salt", "염분 보충제"),

  A("golf", "glove", "골프장갑"),
  A("golf", "shoes_golf", "골프화"),
  A("golf", "tee", "티·볼 마커"),

  A("swim", "swimwear", "수영복"),
  A("swim", "goggle", "수경"),
  A("swim", "drypack", "방수팩", "물놀이할 때 폰·여권을 젖지 않게 해요"),
  A("swim", "rash", "래시가드"),

  A("spa", "haircap", "헤어캡(샤워캡)", "탕에 머리카락이 들어가지 않게 감싸요. 습식 사우나에서도 유용해요"),
  A("spa", "tattoo", "문신 커버 씰", "문신이 있으면 입욕을 제한하는 곳이 많아요"),
  A("spa", "inner", "수건·가운 여분", "대여가 유료이거나 작은 곳이 있어요"),
  A("spa", "skincare", "보습 크림", "온천 후 피부가 당길 수 있어요"),
  A("spa", "slide", "워터 슬리퍼"),
  A("spa", "makeup", "클렌징", "온천 전 화장을 지워야 해요"),

  A("winter", "goggle_w", "고글"),
  A("winter", "gloves_w", "방한 장갑"),
  A("winter", "base_w", "내복·히트텍"),
  A("winter", "pass", "리프트권 바우처"),

  A("themepark", "sunscreen_p", "선크림"),
  A("themepark", "power_p", "보조배터리"),
  A("themepark", "rainponcho", "우비 판초"),

  A("festival", "earplug", "귀마개"),
  A("festival", "light", "휴대용 라이트"),
  A("festival", "fold", "접이식 부채"),

  A("temple", "modest", "어깨·무릎을 가리는 옷"),
  A("temple", "socks_t", "깨끗한 양말", "신발을 벗는 곳이 많아요"),
  A("temple", "cash_t", "참배·기부 현금"),

  W("rain", "umbrella", "우산"),
  W("rain", "zip", "지퍼백", "젖은 옷과 전자기기를 나눠 담아요"),
  W("sunny", "parasol", "양산", "그늘이 없는 구간에서 체감온도를 크게 낮춰줘요"),
  W("sunny", "hat", "모자"),
  W("sunny", "sunscreen", "선크림"),
  W("windy", "neckwarmer", "넥워머·버프", "바람이 강하면 목과 얼굴이 가장 먼저 시려워요"),
  W("snow", "boots_s", "방수 부츠"),
  W("snow", "padding", "경량 패딩·방한복"),
  W("cloudy", "light_layer", "얇은 겉옷", "구름 낀 날은 일교차가 커요"),

  T("cold", "heattech", "히트텍·내복"),
  T("cold", "gloves", "장갑"),
  T("cold", "padding_c", "경량 패딩·방한복"),
  T("mild", "cardigan", "가디건·얇은 재킷", "이 시기 평균 기후 기준이에요"),
  T("hot", "linen", "통풍 잘 되는 옷"),
  T("hot", "towel", "냉각 타월"),
  T("hot", "bottle", "물통"),
];

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
