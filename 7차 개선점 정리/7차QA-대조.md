# 7차 피드백 대조

와이어: https://www.figma.com/design/8B1CDIc6GY1Qof1of6ppdt/와이어프레임?node-id=1347-1895  
라이브: https://chaenggyeoyo.vercel.app

시트에 7차로 올라온 수정대기 항목. 흰색은 기존 명세, 분홍=당장 수정, 파랑=v3 추가.

| 코드 | 요지 | 결과 |
| --- | --- | --- |
| CHG-089 | A-03 활동 미선택해도 생성 | 반영. 동반자만 필수. 활동 칩은 `catalog_activities.activity_name` |
| CHG-090 | C-01 케밥 → 필터+편집. 미체크/찜 모아보기, 활성 시 ‘전체 아이템 보기’만 | 반영. 미체크는 체크된 카테고리 상단. 찜은 찜 있는 카테고리 상단. 접힌 칸 전부 펼침 |
| CHG-091 | E-01에서도 필터 동일 | 반영. 편집 중에도 필터 아이콘. 완료는 오른쪽 유지 |
| CHG-092 | 편집 진입 때 이미 체크된 항목은 선택 잠금 | 반영. fill `#3A3A3A` 20%, stroke 없음, 흰 체크 |
| CHG-093 | C-01 첫 진입 준비물 삭제 안내 바텀시트 | 반영. `bottom_sheet_img.svg` + 고정 제목/설명/확인. 일정당 1회 |
| CHG-094 | `catalog_activities`로 활동 추가. 아이템 없어도 활동 카테고리 생성 | 반영. 어드민 활동 탭. D-01 프리셋도 이 테이블. SQL 실행 필요 |
| CHG-088 | `item_group`/`item_order` + `catalog_group` 정렬. null 그룹 마지막 | 반영. 어드민 아이템 group/order, 그룹 탭. SQL 실행 필요 |

## DB

어드민 `/admin` → **SQL 복사** → Supabase SQL Editor Run. 이미 카탈로그가 있으면 ALTER/CREATE만 추가됩니다.

- `catalog_items.item_group`, `item_order`
- `catalog_activities` (`activity_id`, `activity_name`, `activity_category_name`)
- `catalog_group` (`group_id`, `group_name`, `group_order`)

기본 활동·그룹을 넣으려면 **CSV 시드 올리기**. 아이템 이름을 이미 많이 고쳤으면 시드는 건너뛰고 활동/그룹 탭에서 직접 넣어도 됩니다.
