# GA4 설계

날짜: September 11, 2026 3:00 (EDT) → September 14, 2026 3:00 (EDT)
분류: 중간문서

GA4 측정 ID: `G-NN6YXT1SX0` 

GTM 컨테이너 ID: `GTM-53WG6W4G`

1. 페이지의 **<head>**에서 최대한 위쪽에 이 코드를 붙여넣습니다.

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-53WG6W4G');</script>
<!-- End Google Tag Manager -->
```

2. 여는 **<body>** 태그 바로 뒤에 이 코드를 붙여넣습니다.

```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-53WG6W4G"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

---

> 회색 배경 부분: 아직 미구현 기능, 추후 구현 시 추가
> 

| 순번 | 이벤트 이름 | 발생 위치 및 조건 | 파라미터 | 설계 의도 및 주의사항 |
| --- | --- | --- | --- | --- |
| 1 | onboarding_start | A-01 / '시작하기' 버튼을 클릭한 순간 | - | KPI '완주율'의 분모. 항상 활성 상태 버튼이므로 클릭 즉시 전송 |
| 2 | trip_step2_next | A-02 / '다음' 버튼을 클릭해 A-03으로 전환된 순간 | - | A-02 이탈률 산출. 버튼은 목적지·날짜 입력 완료 시에만 활성화되므로, 입력 완료 대비 진행 비율을 볼 수 있음 |
| 3 | checklist_generate_complete | A-03 / '체크리스트 생성하기' 클릭 후 서버 생성 성공 응답이 떨어진 순간 | activity_count,
generation_time_ms | 실제 생성 성공 횟수 확인 |
| 4 | trip_home_view | B-01 진입 순간 (생성 직후 / 재접속 랜딩 / 뒤로가기 모두 포함) | entry_type (after_create, revisit, back, shared_link) | entry_type으로 유입 경로를 분리해야 D-n 재방문율을 산출하기 위함 |
| 5 | trip_card_click | B-01 / 일정 카드를 클릭해 C-01로 전환되는 순간 | trip_id,
trip_status,
days_until_departure,
is_new (NEW 칩 표시 여부) | KPI '완주율'(온보딩 시작 → C-01 도달)의 마지막 단계. 생성 후 B-01에 머물다 C-01까지 가지 않는 이탈 측정 |
| 6 | checklist_view | C-01 진입 순간 | item_count_total,
checked_count,
wished_count
 | **[메인 KPI]** 가장 중요한 이벤트. 플로팅 카운터에 표시되는 값(체크 수/전체, 찜 수)을 그대로 측정해 체크율, 위시율을 계산 |
| 7 | item_check_toggle | C-01 / 아이템 영역(하트 버튼 제외)을 클릭해 체크 또는 해제 상태가 저장된 순간 | item_id,
category_name,
check_state (on, off),
item_source (system, user),
item_origin (essential, base, country, activity, weather, temperature) | ‘버튼(찜)을 제외한 아이템 영역 전체 클릭 시 체크'이므로 체크 영역이 넓음. item_source로 시스템/직접추가를 분리해 완주율 분모 조작을 방지 |
| 8 | item_wish_toggle | C-01 / 아이템 우측 하트 버튼을 클릭해 저장 성공한 순간 | item_id,
category_name,
wish_state (on, off),
item_source (system, user),
item_origin (essential, base, country, activity, weather, temperature) | 하트는 '구매 의사 여부 체크'. KPI '찜하기 항목 체크율' 산출. 소지 여부(체크박스)와 별개 축 |
| 9 | info_modal_link_click | C-05 / 모달 내 링크(예: '여행자 보험 가입하기')를 클릭해 외부로 이동하는 순간 | item_id,
link_text,
link_url,
display_order | 현재 설계에서 외부 전환이 실제로 발생하는 지점. 실제 트리플의 BM |
| 10 | category_toggle | C-01 / 카테고리 헤더를 클릭해 하위 아이템을 접거나 펼친 순간 | category_name,
toggle_state (collapse, expand),
item_count | 디폴트 펼침 상태이므로 collapse 발생으로 '리스트가 길다'는 신호 측정. 접기 사용률이 높으면 항목 수 축소 검토 |
| 11 | menu_open | C-01 / 케밥(⋮) 버튼을 클릭해 메뉴가 열린 순간 |  | 편집·필터의 유일한 진입점. menu_open 대비 edit_mode_enter·filter_apply 비율로 메뉴 항목의 발견성 평가 |
| 12 | filter_apply | C-01 / 메뉴에서 '미체크 아이템 모아보기' 또는 '찜한 아이템 모아보기'를 선택한 순간 | filter_type (unchecked, wished),
result_count | result_count = 0 이면 C-04 빈 상태 화면. 찜 필터 사용률을 구매 의사 지표의 보조 근거로 사용 |
| 13 | filter_reset | C-01 / 필터 활성 상태에서 '전체 아이템 보기'로 토글한 순간 | filter_type | 필터 체류 시간 파악. 즉시 해제가 많으면 필터 결과가 기대와 다르다는 신호 |
| 14 | category_add_click | C-02 / '카테고리 추가' 버튼을 클릭해 D-01로 전환되는 순간 | current_category_count | 기본 제공 카테고리가 부족하다는 신호. 발생률이 높으면 생성 로직에 카테고리를 추가 배치할 근거 |
| 15 | category_add_complete | D-01 / 프리셋 선택 또는 직접 입력으로 카테고리가 추가된 순간 | add_method (preset, custom),
category_name,
added_item_count | 활동 관련 프리셋을 추가하면 해당 아이템이 함께 담기는 설계이므로 added_item_count를 함께 수집. A-03에서 활동을 미선택한 사용자가 여기서 보완하는 패턴을 확인할 수 있음 |
| 16 | edit_mode_enter | C-01 / 케밥 메뉴에서 '편집'을 선택해 편집 모드로 전환된 순간 | item_count_total,
activity_count | 삭제율 해석의 분모. 또한 편집 모드 진입 시에만 과잉 코멘트가 노출되므로, 과잉 억제 기능의 도달 범위를 재는 지표 |
| 17 | overpack_comment_impression | E-01 / 삭제율 70% 이상 아이템의 과잉 코멘트('10명 중 N명이 챙겼어요')가 노출된 순간 (아이템당 세션 내 1회) | item_id,
comment_tier (3명, 2명, 1명),
delete_rate_band (70-79, 80-89, 90-100) | 과잉 억제 기능의 분모. A-03에서 활동을 미선택한 사용자에게는 아예 노출되지 않음 — 분모를 '활동 선택자'로 한정해 해석 |
| 18 | overpack_comment_effect | E-01 / 과잉 코멘트가 노출된 아이템을 실제로 삭제한 순간 | item_id,
comment_tier,
time_from_impression_ms | impression 대비 비율이 곧 과잉 억제 기능의 성과. comment_tier별로 비교하면 '1명이 챙겼어요'가 '3명'보다 실제로 더 효과적인지 검증 가능 |
| 19 | item_delete | E-01 / 리스트에서 아이템이 삭제된 순간 | item_id,
category_name,
item_source,
item_origin,
had_checked,
had_overpack_comment,
is_bulk(일괄삭제 여부) | KPI '항목 삭제율' 산출. 유효 삭제율 계산 시 item_source=user, undo된 건, F-01 일괄 삭제는 분자에서 제외 |
| 20 | item_delete_undo | E-01 / 삭제 토스트의 '되돌리기'를 클릭해 삭제가 취소된 순간 | item_id | 오조작 필터. 삭제율에서 제외할 건. |
| 21 | edit_mode_exit | E-01 / '완료' 버튼을 클릭해 편집 모드를 종료한 순간 | renamed_count,
duration_ms | 한 번의 편집에서 정리하는 아이템 분량 파악. duration_ms가 길면 편집 UX에 마찰 |
| 22 | category_delete_complete | F-02 / 카테고리 미트볼 → '카테고리 삭제하기' → 확인을 눌러 카테고리와 소속 아이템이 삭제된 순간 | category_name,
deleted_item_count | 설계서 상 '나만의 준비물' 카테고리는 삭제 불가(미트볼 아이콘 제거). 특정 카테고리의 삭제율이 높으면 해당 축의 추천 품질 문제 |
| 23 | item_add_complete | G-01 / 아이템 이름 입력 후 '+' 버튼 또는 Enter로 추가되어 저장된 순간 | item_name_text,
category_name | KPI '항목 추가율' 산출. item_name_text를 집계하면 우리가 놓친 준비물을 발굴해 추천 DB를 보강할 수 있음. 자유 입력이므로 수집 범위는 사전 검토 필요 |
| 24 | push_permission_result | 브라우저 푸시 권한 요청에 사용자가 응답한 순간 | result (granted, denied, default) | H-01 푸시는 D-n 재방문의 핵심 유입원. 권한 허용률이 낮으면 메인 KPI 자체가 성립하지 않으므로 가장 먼저 확인할 지표 |
| 25 | push_notification_click | D-7 / D-3 / D-1 19시에 발송된 푸시 알림을 클릭해 C-01로 진입한 순간 | push_day (d7, d3, d1),
trip_id,
unchecked_count (D-3 문구의 {N}값) | **[메인 KPI]** 'D-n 재방문율'의 직접 측정 이벤트. push_day별 클릭률을 비교해 어느 시점 알림이 가장 효과적인지 확인, 리마인더 n값을 데이터로 정하는 근거로 활용 |
| 26 | push_delivered | 푸시 발송이 클라이언트에 도달한 순간 (서비스워커 수신) | push_day,
trip_id | 클릭률 = click ÷ delivered. delivered 없이 클릭만 봐서 전송 실패와 무관심을 구분 |
| 27 | checklist_load_fail | 공유 링크 접속 시 권한이 없거나 데이터가 없어 '일정을 찾을 수 없어요' 화면이 노출된 순간 | fail_reason (no_permission, not_found),
entry_type | 로그인 없는 구조의 최대 리스크인 데이터 접근 실패를 정량 추적. 설계서에 '서로 다른 공유 링크를 돌아가며 클릭 시 의도하지 않은 계정의 여행 홈으로 접속' 이슈가 기록되어 있어, 이 이벤트로 실제 발생 여부를 감시 |
| 28 | load_delay_toast | 화면 조회가 5초를 초과해 지연 토스트가 노출된 순간 | screen_id,
elapsed_ms | 설계상 5초 초과 시 실행 취소 후 이전 화면 유지. 발생률이 높으면 이탈률 상승의 원인이 성능임을 입증 |