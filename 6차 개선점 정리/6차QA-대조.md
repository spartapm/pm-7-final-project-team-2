# 6차 피드백 대조

와이어: https://www.figma.com/design/8B1CDIc6GY1Qof1of6ppdt/와이어프레임?node-id=1319-3369  
라이브: https://chaenggyeoyo.vercel.app  
커스텀 도메인: https://chaenggyeoyo.me (가비아 DNS 반영 후)

| 코드 | 요지 | 결과 |
| --- | --- | --- |
| CHG-082 | B-01 D-N Primary, NEW Accent, 날짜 Text sub, 활동 태그 75% | 반영. `.trip`의 `-webkit-text-fill-color`가 자식까지 회색으로 덮던 것을 항목별로 다시 지정 |
| CHG-086 | 「내 여행 준비」 20px | 반영. Title2 (20/28) |
| CHG-087 | 일정 공유하기 말풍선. 클릭하면 사라지고 기기당 1회 | 반영. 버튼 아래, 꼬리는 위를 향함. 문구 고정. `localStorage` `chaeggyeo:shareTip` |
| CHG-083 | C-01 하트 `:active` 회색/파란 박스 제거 | 반영. 탭 하이라이트 끄고 hit-icon 기본 박스 제거 |
| CHG-084 | D-01 iOS 카테고리명 Text Default. 타이틀·직접입력은 유지 | 반영. `.listrow`에 color + fill-color. 「직접 입력」은 Primary 유지 |
| CHG-075 | 삭제율 70% 미만으로 되돌리면 추천 코멘트로 | 반영. 편집 진입 때 라이브 삭제율을 봄. 70% 미만이면 생성 때 박힌 과잉율을 쓰지 않음 |
| CHG-085 | chaenggyeoyo.me | DNS 값 정리. Vercel 프로젝트 Domains에 도메인 추가 후 가비아 반영 필요 |

## CHG-085 가비아에 전달할 값

Vercel이 이 프로젝트에 실제로 요구하는 값입니다. apex는 `www.chaenggyeoyo.me`로 308입니다.

- A / 호스트 `@` / `216.198.79.1`
- CNAME / 호스트 `www` / `3ff2e8483112c4f4.vercel-dns-017.com`
