# 챙겨요 — 여행 준비물 체크리스트 DB

여행 조건 몇 가지를 넣으면 **"무엇을 챙겨야 하는지, 왜 챙겨야 하는지"** 목록이 나오도록 만든 데이터입니다.
CSV 18장으로 되어 있고, 각 파일은 관계형 테이블처럼 PK/FK로 조인됩니다.

```
목적지 국가 ┐
여행 날짜  ├─▶  [ 이 DB ]  ─▶  섹션별 준비물 목록 + 각 항목의 이유
동반자    │                    필수 / 기본 / 액티비티별
액티비티   ┘
```

날씨와 기온은 **입력받지 않습니다.** 목적지와 날짜로 추정합니다(→ [5장](#5-날씨와-기온은-어떻게-정하나)).

---

## 폴더 구성

```
csv/                    데이터 18장
README.md               이 문서
example_generate.py     체크리스트를 만드는 참조 구현 (약 100줄, 표준 라이브러리만)
```

바로 돌려볼 수 있습니다.

```
python example_generate.py --country JP --month 4 --day 12 --companion friend --activity photo,spa
```

---

## 1. 읽기 전에 알아야 할 3가지

**① 인코딩은 UTF-8 BOM입니다.** 파이썬은 `encoding="utf-8-sig"`로 열어야 첫 컬럼명 앞에 `﻿`가 붙지 않습니다. 엑셀에서 더블클릭해도 한글이 깨지지 않습니다.

**② `_NAME_TEMP`로 끝나는 컬럼은 무시해도 됩니다.** `item_id` 옆의 `item_id_NAME_TEMP`처럼, 사람이 파일을 눈으로 볼 때 `I0033`이 「카메라」라는 걸 알 수 있게 붙여 둔 **보조 컬럼**입니다. 값은 항상 대응하는 마스터 테이블에서 그대로 복사한 것이라 **읽는 시점에 버리고 id로만 조인하면 됩니다.** 코드로 읽을 때는 이렇게 걸러내세요.

```python
{k: v for k, v in row.items() if not k.endswith("_NAME_TEMP")}
```

**③ 값 하나에 여러 개가 들어가는 컬럼은 `;`로 구분합니다.** `weather_condition_ids`(`sunny;rain`)와 `source_rule_table`이 여기 해당합니다. **나열 순서에 의미가 있는 경우가 있으니**(→ [4장 3단계](#3단계-겹치는-아이템을-하나로-접는다)) 정렬하지 마세요.

---

## 2. 파일 한눈에 보기

### 조건 차원 — "어떤 상황인가"

| 파일 | PK | 행 | 설명 |
|---|---|---|---|
| `dim_country.csv` | country_id | 7 | 국가. 예보 조회용 대표 도시 좌표(`latitude`/`longitude`)를 함께 가짐 |
| `dim_companion.csv` | companion_id | 7 | 동반자 유형 (혼자·친구·연인·배우자·아이·부모님·반려동물) |
| `dim_activity.csv` | activity_id | 10 | 액티비티 종류 (사진·캠핑·하이킹·골프·수영·놀이공원·온천·겨울스포츠·사원·페스티벌) |
| `dim_weather_condition.csv` | weather_condition_id | 5 | 날씨 상태 (맑음·구름·바람·비·눈)와 **판정 기준** |
| `dim_temp_band.csv` | temp_band_id | 3 | 온도 구간 (5도 미만 / 5~26도 / 26도 이상) |

### 규칙 — "그 상황에서 무엇이 필요한가"

7장 합계 **247행**. 모두 `item_id`와 `reason_comment`를 갖고, 조건 테이블은 각자의 FK를 하나씩 더 갖습니다.

| 파일 | PK | 행 | 조건 FK | 뜻 |
|---|---|---|---|---|
| `rule_essential_item.csv` | rule_id | 5 | (없음) | 없으면 **여행 자체가 불가능**한 것 |
| `rule_base_item.csv` | rule_id | 26 | (없음) | 조건과 무관하게 보통 챙기는 것 |
| `rule_country_item.csv` | rule_id | 72 | country_id | 그 나라라서 필요한 것 |
| `rule_companion_item.csv` | rule_id | 26 | companion_id | 그 동반자라서 필요한 것 |
| `rule_activity_item.csv` | rule_id | 84 | activity_id | 그 활동이라서 필요한 것 |
| `rule_weather_item.csv` | rule_id | 18 | weather_condition_id | 그 날씨라서 필요한 것 |
| `rule_temp_item.csv` | rule_id | 16 | temp_band_id | 그 기온이라서 필요한 것 |

### 아이템 — "그게 정확히 무엇인가"

| 파일 | PK | 행 | 설명 |
|---|---|---|---|
| `item_master.csv` | item_id | 130 | 준비물 사전. `item_name`, `item_desc`(조건과 무관한 상시 설명), `is_purchasable`(Y면 구매 연결 대상) |
| `dim_item_category.csv` | category_id | 12 | 화면 섹션 12종. **정렬·겹침 판정 규칙이 전부 여기 들어 있습니다** |
| `item_category_map.csv` | map_id | 179 | 아이템 ↔ 섹션 매핑. 규칙 테이블을 훑어 **파생된** 표라 직접 편집 대상이 아니며, 조회 편의용입니다 |

### 기후 — "그때 거기 날씨가 어떤가"

| 파일 | PK | 행 | 설명 |
|---|---|---|---|
| `dim_period.csv` | period | 3 | 한 달을 나누는 순(旬) — 상순(1~10) / 중순(11~20) / 하순(21~말일) |
| `climate_normal_period.csv` | normal_id | 252 | 국가 7 × 12개월 × 3순. 그 시기의 평균 최저·최고 기온과 날씨 상태 |
| `map_weather_code.csv` | wmo_code | 28 | Open-Meteo가 주는 WMO 날씨 코드 28종 → 날씨 상태 5종 |

---

## 3. 관계도

```
dim_country ──┐
dim_companion ┤
dim_activity ─┼─▶ rule_*_item ──▶ item_master ──▶ item_category_map ──▶ dim_item_category
dim_weather ──┤     (247행)         (130개)          (179행·파생)          (12섹션)
dim_temp_band ┘

dim_country ──▶ climate_normal_period ──▶ dim_weather_condition
                (좌표·날짜로 조회)            dim_temp_band
```

조건 5개 차원은 **서로 직접 연결되지 않습니다.** 오직 `item_id`를 매개로만 만납니다.
덕분에 새 조건(예: 숙소 유형)이 필요해지면 `rule_lodging_item.csv` 한 장만 추가하면 되고 기존 테이블은 건드릴 필요가 없습니다.

---

## 4. 체크리스트 만드는 법

이 장이 이 문서의 핵심입니다. `example_generate.py`가 아래를 그대로 구현하고 있습니다.

### 입력

| 값 | 어디서 오나 |
|---|---|
| `country_id` | 사용자가 고른 목적지 |
| `companion_id` | 사용자가 고른 동반자 |
| `activity_ids` | 사용자가 고른 액티비티 (0개 이상) |
| `weather_condition_ids` | **추정** — 5장 참고 |
| `temp_band_id` | **추정** — 5장 참고 |

### 1단계: 조건에 걸리는 규칙을 모두 모은다

7개 규칙 테이블을 각자의 FK로 거릅니다. `essential`과 `base`는 조건이 없으니 전부 가져옵니다.

### 2단계: 각 규칙에 「화면 섹션」을 붙인다

여기에 이 스키마에서 가장 헷갈리는 규칙이 하나 있습니다.

> **국가·동반자·날씨·온도 규칙에서 나온 아이템은 각자의 섹션이 아니라 「기본」 섹션에 표시됩니다.**
> 액티비티만 예외로 종류별 전용 섹션(「온천·스파」, 「캠핑」…)을 갖습니다.

| 규칙 테이블 | 붙이는 category_id |
|---|---|
| `rule_essential_item` | `essential` |
| `rule_base_item` | `base` |
| `rule_country_item` / `rule_companion_item` / `rule_weather_item` / `rule_temp_item` | `base` |
| `rule_activity_item` | 그 행의 `activity_id` (= `photo`, `spa`, …) |

규칙 테이블이 분리되어 있는 것은 **조건별로 코멘트를 다르게 쓰기 위해서**지, 화면 섹션을 나누기 위해서가 아닙니다. 사용자에게 「국가 준비물」「날씨 준비물」이 따로 보이면 오히려 산만하기 때문입니다.

### 3단계: 겹치는 아이템을 하나로 접는다

한 아이템이 여러 규칙에 동시에 걸리는 일이 흔합니다(예: 「경량 패딩·방한복」 = 국가 + 날씨 + 온도). 이때 **두 가지를 각각 정해야 합니다.**

**어느 섹션에 넣을까 → `dim_item_category.match_priority`가 작은 쪽**

```
1  필수
2~11  액티비티 10종
12  기본
```

즉 **액티비티 규칙에 한 번이라도 걸린 아이템은 액티비티 섹션으로 가고, 기본 짐싸기에는 다시 나오지 않습니다.** 「방수팩」이 수영·물놀이 섹션에만 나오는 이유입니다. 그 액티비티를 고르지 않은 여행에서는 원래대로 기본에 나옵니다.

**어느 코멘트를 보여줄까 → 그 섹션의 `source_rule_table` 나열 순서가 앞선 쪽**

`base` 섹션의 값은 이렇게 되어 있습니다.

```
rule_country_item;rule_companion_item;rule_weather_item;rule_temp_item;rule_base_item
```

**국가 > 동반 > 날씨 > 온도 > 기본** 순입니다. 더 구체적인 조건에서 나온 근거가 더 쓸모 있다고 봤기 때문입니다. 순서를 바꾸고 싶으면 이 문자열만 고치면 됩니다.

> ⚠️ 그래서 `rule_base_item`의 코멘트는 **가장 약한 근거**입니다. 같은 아이템이 국가·날씨 규칙에도 있으면 화면에 뜨지 않습니다.

### 4단계: 섹션을 `display_order`로 정렬한다

```
1  필수
2  기본
3~12  액티비티 10종
```

> **`display_order`와 `match_priority`는 일부러 다릅니다.**
> 화면 순서는 필수 → **기본** → 액티비티지만, 겹쳤을 때 이기는 쪽은 필수 → **액티비티** → 기본입니다.
> "기본을 위에 보여주되, 겹치면 더 구체적인 액티비티가 가져간다"를 표현하려고 두 컬럼으로 나눴습니다.

### 5단계: 코멘트를 고른다

항목 아래에 보여줄 한 줄은 **`reason_comment`가 있으면 그것을, 없으면 `item_master.item_desc`를** 씁니다.

- `reason_comment` — **그 조건 때문에** 필요한 이유. 조건마다 달라집니다.
- `item_desc` — 조건과 무관한 상시 설명.
- **둘 다 비어 있는 것은 의도된 것입니다.** 여권·항공권·속옷처럼 이름만 봐도 아는 항목에 설명을 달면 화면만 길어집니다.

### 의사코드

```
규칙 = []
규칙 += 전부(rule_essential_item)                        → 섹션 "essential"
규칙 += 전부(rule_base_item)                             → 섹션 "base"
규칙 += 거르기(rule_country_item,   country_id)          → 섹션 "base"
규칙 += 거르기(rule_companion_item, companion_id)        → 섹션 "base"
규칙 += 거르기(rule_weather_item,   weather_ids 중 하나)  → 섹션 "base"
규칙 += 거르기(rule_temp_item,      temp_band_id)        → 섹션 "base"
규칙 += 거르기(rule_activity_item,  activity_ids 중 하나) → 섹션 = 그 activity_id

선택 = {}
각 규칙에 대해:
    기존이 없거나 match_priority(새 섹션) < match_priority(기존 섹션):
        선택[item_id] = 새 규칙

각 규칙에 대해:                        # 섹션이 정해진 뒤 코멘트를 고른다
    그 규칙의 섹션 == 선택된 섹션 이고
    src_rank(섹션, 규칙테이블) < src_rank(섹션, 선택된 규칙테이블):
        선택[item_id].코멘트 = 그 규칙의 reason_comment

섹션별로 묶고 → display_order 로 정렬 → 출력
```

### 실행 예 — 일본 · 4월 12일 · 친구와 · 사진 여행 + 온천

```
기후 추정: 9~19° · 맑음, 바람, 비  →  온도 구간 「5~26도」

── 필수 (5) ──────────────────────────
  □ 여권
      유효기간 6개월 이상 남았는지 함께 확인
  □ 항공권(모바일 e-티켓)
  □ eSIM 또는 로밍 데이터
  ...

── 기본 (43) ─────────────────────────
  □ 동전 지갑
      자판기·코인로커·사찰 참배료가 대부분 동전이라 금방 쌓여요   ← 국가 규칙
  □ 변압기(220V 전용 발열기기용)
      일본은 100V라 한국 220V 전용 고데기·드라이기는 제대로 안 돌아가요
  □ 넥워머·버프
      바람이 강하면 목과 얼굴이 가장 먼저 시려워요               ← 날씨 규칙(바람)
  □ 양산
      그늘이 없는 구간에서 체감온도를 크게 낮춰줘요              ← 날씨 규칙(맑음)
  ...

── 사진 여행 (5) ──────────────────────
── 온천·스파 (6) ──────────────────────
  □ 헤어캡(샤워캡)
      탕에 머리카락이 들어가지 않게 감싸요. 습식 사우나에서도 유용해요
  □ 문신 커버 씰
      문신이 있으면 입욕을 제한하는 곳이 많아요. 전신 문신은 대절탕을 예약하세요
  ...

합계 59개
```

같은 코드로 조건만 바꾸면(중국 · 12월 25일 · 아이와 · 액티비티 없음) 필수 5 + 기본 56 = 61개가 나옵니다.

---

## 5. 날씨와 기온은 어떻게 정하나

사용자에게 묻지 않고 **목적지 + 날짜**로 추정합니다. 경로가 두 개입니다.

### 출발까지 16일 이내 — 실제 예보

[Open-Meteo](https://open-meteo.com) 예보 API를 씁니다. **API 키도 가입도 필요 없습니다.**

```
https://api.open-meteo.com/v1/forecast
  ?latitude={dim_country.latitude}&longitude={dim_country.longitude}
  &start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
  &daily=temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max
  &timezone=auto
```

응답의 일별 값을 이렇게 접습니다.

| 얻고 싶은 것 | 계산 |
|---|---|
| `temp_band_id` | 여행 기간 `temperature_2m_min`의 **최솟값**과 `temperature_2m_max`의 **최댓값**을 `dim_temp_band`의 구간과 대조 |
| `weather_condition_ids` | 일별 `weather_code`를 `map_weather_code.csv`로 접고 중복 제거 |
| `windy` 추가 여부 | `wind_speed_10m_max`가 **하루라도** `dim_weather_condition.wind_min_kmh`(현재 30) 이상이면 추가 |

`windy`만 별도 계산인 이유는 **WMO 날씨 코드에 「바람」이 없기 때문**입니다.

### 16일 초과 또는 호출 실패 — `climate_normal_period.csv` 폴백

```sql
SELECT temp_min_c, temp_max_c, weather_condition_ids
FROM climate_normal_period
WHERE country_id = ? AND month = ? AND ? BETWEEN day_from AND day_to
```

`day_from`/`day_to`는 **그 달에서 그 순이 실제로 덮는 날짜**라 하순은 달마다 다릅니다(28·30·31일, 2월은 윤일까지 29). 그래서 달 길이를 몰라도 숫자 비교만으로 행이 하나 정해집니다.

> `dim_period.csv`의 `day_to`가 하순에서 31인 것은 **달을 모르는 구간 정의**라 상한을 적어 둔 것입니다. 실제 말일은 월을 아는 `climate_normal_period.csv` 쪽에 있습니다.

### 두 경로가 날씨를 다르게 판정합니다 (의도된 것)

`dim_weather_condition.csv`가 판정 기준을 **두 벌** 갖는 이유입니다.

| 컬럼 | 쓰는 곳 |
|---|---|
| `forecast_source` (+ `wind_min_kmh`) | 16일 이내 예보 |
| `normal_source` / `normal_agg` / `normal_op` / `normal_threshold` / `normal_min_ratio` | 평년값 재계산 |

**예보는 `weather_code`를 씁니다.** 이 값은 Open-Meteo 정의상 *"the most severe weather condition on a given day"* — **그날의 가장 심한 날씨**입니다. 특정 여행일 하루에 대해서는 "그날 조금이라도 비가 오는가"가 알맞은 질문이라 이 의미가 목적에 맞습니다.

**반대로 10년 평균을 낼 때는 이 값을 쓰면 안 됩니다.** 새벽에 이슬비가 15분만 와도 그날 코드는 51(drizzle)이 되므로, 세어 보면 습윤 기후의 거의 모든 날이 「비」가 됩니다. 그래서 평년값은 물리량으로 판정합니다.

| 상태 | 집계 | 기준 |
|---|---|---|
| 맑음 | 구간 평균 | 일조율(`sunshine_duration ÷ daylight_duration`) 0.55 이상 |
| 구름 | 구간 평균 | 일조율 0.35 미만 — 맑음과 **배타적** |
| 비 | 날짜 비율 | 일강수량 1.0mm 이상인 날이 30% 이상 |
| 눈 | 날짜 비율 | 일신적설 1.0cm 이상인 날이 **10%** 이상 |
| 바람 | 날짜 비율 | 일최대풍속 30km/h 이상인 날이 25% 이상 |

> ⚠️ **`weather_condition_ids`의 맑음/구름 판정은 아직 조정 중입니다.**
> 현재 값으로는 252구간 중 맑음이 약 93%로 쏠려 있어 변별력이 없습니다. ERA5의 일조율 분포가 예상보다 높게 나와 임계값(0.55/0.35)이 실제 데이터와 맞지 않는 상태입니다.
> **기온(`temp_min_c`/`temp_max_c`)과 비·눈·바람 판정은 정상이며 그대로 쓰셔도 됩니다.** 맑음/구름만 참고용으로 봐 주세요.
> 조정은 `_build/fill_climate_normals.py --stats` 로 실제 분포를 확인한 뒤 `dim_weather_condition.csv`의 `normal_threshold`만 고치면 됩니다.

맑음·구름만 「평균」인 것은 그것이 **그 시기의 전형적인 하늘**을 말하는 값이기 때문입니다. 날짜를 세는 방식으로 재면 "가끔 맑은 날이 있는가"를 묻는 셈이라 웬만한 곳이 다 통과합니다. 반대로 비·눈·바람은 "대비해야 할 일이 얼마나 잦은가"라서 날짜를 세는 편이 맞습니다. 눈만 문턱이 10%인 것은 눈이 「평소 날씨」가 아니라 **「대비해야 할 가능성」** 신호이기 때문입니다.

---

## 6. 데이터를 고칠 때

| 하고 싶은 일 | 고칠 곳 |
|---|---|
| 새 국가 추가 | `dim_country.csv` + 필요한 만큼 `rule_country_item.csv` |
| 새 아이템 추가 | `item_master.csv` + 해당 조건의 `rule_*` 테이블. **조건이 있으면 조건 테이블에 넣는 쪽이 항상 낫습니다** (코멘트가 더 구체적이고 우선순위도 앞섬) |
| 새 액티비티 추가 | `dim_activity.csv` + `dim_item_category.csv`에 섹션 1행 + `rule_activity_item.csv` |
| 새 조건 차원 추가 | `dim_*` 1장 + `rule_*_item.csv` 1장. **기본값은 「기본 섹션으로 합류」**이므로 `dim_item_category.csv`의 `base` 행 `source_rule_table` 끝에 이름만 덧붙이면 됩니다(붙인 위치가 곧 코멘트 우선순위) |
| 화면 섹션 순서 변경 | `dim_item_category.display_order` — 코드 변경 불필요 |
| 겹쳤을 때 이기는 섹션 변경 | `dim_item_category.match_priority` |
| 날씨 판정 임계값 조정 | `dim_weather_condition.csv` — 코드 변경 불필요 |
| 기후 집계 단위 변경 (10일 → 5일 등) | `dim_period.csv`의 행과 `day_from`/`day_to` |

`item_category_map.csv`는 규칙 테이블에서 파생되는 표라 손으로 관리하지 않습니다.

---

## 7. 알아두어야 할 한계

**데이터 신뢰도가 항목마다 다릅니다.**

| 데이터 | 상태 |
|---|---|
| 규칙·아이템·코멘트 | 조사해서 작성. 아래 「출처」의 최신 규정이 반영되어 있습니다 |
| `climate_normal_period` 기온 | Open-Meteo ERA5 재분석 2015~2024년 10년 일별 실측 평균 |
| `climate_normal_period` 날씨 상태 | 같은 자료 + 위 5장의 판정 기준 |
| `dim_weather_condition.wind_min_kmh` (30km/h) | ⚠️ **근거 있는 값이 아니라 조정용 초기값입니다.** 실제 데이터를 보고 맞춰 주세요 |

**그 밖의 한계**

- 국가 데이터는 **한국 여권 소지자 기준**입니다.
- **미국·중국은 국가 단위 판정이 부정확합니다.** 뉴욕 좌표로 마이애미 여행을, 베이징 좌표로 하이난 여행을 판정합니다. 도시 단위 조건 차원을 추가하면 `dim_country` 대신 도시 테이블이 좌표를 갖게 되고 나머지 구조는 그대로 재사용됩니다.
- 「반입 금지」나 「안 가져가도 된다」 같은 신호는 **별도 컬럼이 아니라 `reason_comment` 문장 안에만** 있습니다. 화면에서 경고 배지·취소선으로 분기하려면 텍스트를 파싱하거나 플래그 컬럼을 새로 설계해야 합니다.
- 일부 국가 규칙(김치 반입 판정, 중국 국내선 보조배터리 CCC 인증, 필리핀 리프세이프 선크림의 법적 강제력)은 1차 공식 출처를 확보하지 못해 **보수적으로 서술**했거나 제외했습니다.
- 국가가 7개국뿐입니다.

---

## 8. 출처

**기후 데이터** — [Open-Meteo](https://open-meteo.com) Historical Weather API (ERA5 재분석).
라이선스는 **CC BY 4.0**이며, 이 값을 쓰는 화면에 **출처 표기가 필요합니다.**

```
Weather data by Open-Meteo.com
```

비상업 이용은 API 키 없이 무료입니다. 상업적으로 쓰려면 별도 엔드포인트와 키가 필요합니다.

**규정 정보** — 코멘트에 2025~2026년 변경분이 반영되어 있어, 기존 여행 블로그와 어긋나는 내용이 있습니다. 유지보수 시 주의하세요.

- 보조배터리: 2026.4.20 ICAO 기준으로 **1인 2개·160Wh 이하**. 2025.9부터 단자 절연 의무
- 미국 ESTA 수수료: 2025.9.30부터 약 $40
- 미국 신발 벗기: 2025.7 TSA 폐지 → 「보안검색용 슬립온」은 불필요로 정정
- 태국 대마: 2025.6.25부터 태국 의사 처방 없는 제품은 불법 (해외 처방전 무효)
- 싱가포르 전자담배: 2026.5.1 TVCA로 소지 벌금 S$10,000, 반입은 최대 징역 9년
- 중국 무비자 30일: **2026.12.31까지 한시 정책** — 만료 시 재확인 필요
- 전자 입국신고: 태국 TDAC, 베트남 사전신고, 필리핀 eTravel, 싱가포르 SGAC, 미국 ESTA, 중국 온라인 입국카드를 한 아이템으로 묶고 국가별 코멘트로 차이를 설명. 일본 Visit Japan Web만 의무가 아닌 선택
