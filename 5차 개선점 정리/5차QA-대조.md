# 5차 피드백 대조

와이어: https://www.figma.com/design/8B1CDIc6GY1Qof1of6ppdt/와이어프레임?node-id=1275-1078  
라이브: https://chaenggyeoyo.vercel.app

5차 정리에 적힌 수정은 CHG-025 한 건. 첨부 스크린샷은 빈 다이얼로그에서 커서가 「최대 30글자로」 뒤에 가 있는 상태.

| 코드 | 요지 | 결과 |
| --- | --- | --- |
| CHG-025 | 직접입력 커서 = 안내 문구 첫 줄 맨 앞 | 반영. 빈 칸은 가짜 캐럿을 왼쪽 끝에 고정. 네이티브 커서가 필드 가운데로 가는 모바일 버그 우회 |

## GA4 (`GA4 설계.md`)

GTM `GTM-53WG6W4G` 를 root layout head/body에 삽입. 이벤트는 `dataLayer.push({ event, ...params })`. 회색(미구현) 없음 — UI가 있는 28건 모두 연결.

서비스워커 푸시는 없음. `push_delivered` / `push_notification_click` 은 인페이지 `Notification` 기준.
