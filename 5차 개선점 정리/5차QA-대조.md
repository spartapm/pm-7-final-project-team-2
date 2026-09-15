# 5차 피드백 대조

와이어: https://www.figma.com/design/8B1CDIc6GY1Qof1of6ppdt/와이어프레임?node-id=1275-1078  
라이브: https://chaenggyeoyo.vercel.app

시트에 5차로 올라온 수정대기 항목. CHG-025만 이전에 반영돼 있었고, 나머지는 이 라운드에서 맞춤.

| 코드 | 요지 | 결과 |
| --- | --- | --- |
| CHG-066 | B-01 미트볼 = 나라 제목과 세로 중앙 | 반영. 카드 padding-top 16 + 제목 24라인 중앙(28)에 28 히트를 맞춤. top 14 / right 20 |
| CHG-076 | iOS에서 나라명이 파랗게 나오던 것 → Text Default | 반영. `.trip` / `.place`에 `color` + `-webkit-text-fill-color` |
| CHG-077 | 「새 여행 등록하기」 설명 → Text Sub | 반영. `.trip-new .when`에 Text 3 + `-webkit-text-fill-color` (iOS 버튼 기본 파랑 방지) |
| CHG-079 | 플로팅 카운터 뒤 리스트가 눌리지 않게 | 반영. 카운터가 보일 때는 클릭을 흡수. 숨겨진 상태만 `pointer-events: none` |
| CHG-080 | 나만의 준비물 항상 포함, 추가·삭제 불가 | 반영. 생성·마이그레이션 시 빈 칸이어도 넣음. D-01 프리셋에서 빼고, 미트볼은 기존처럼 없음 |
| CHG-081 | mailto 디폴트 제목·본문 | 반영. 제목 「준비물 관련 문의」, 본문은 시트 네 줄 |
| CHG-025 | 직접입력 커서 좌정렬 | 반영 (이전 라운드) |
| CHG-075 | 편집 진입 시점의 삭제율로 과잉 코멘트 고정 | 반영. 편집 버튼 누른 순간의 rate를 스냅샷 |
| CHG-034 | 아이템 추가 미입력 시 + 회색·클릭 불가 | 반영. `disabled` + 회색 아이콘. 글자 있을 때만 Primary |
| CHG-078 | 당겨서 새로고침 때 loading.gif | 반영. reload 직전에 로딩 오버레이 |

## GA4 (`GA4 설계.md`)

GTM `GTM-53WG6W4G` 를 root layout head/body에 삽입. 이벤트는 `dataLayer.push({ event, ...params })`. UI가 있는 28건 연결. `push_delivered` / `push_notification_click` 은 열린 탭의 `Notification` 기준.
