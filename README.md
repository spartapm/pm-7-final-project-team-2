# 챙겨요 — 여행 준비 체크리스트

내배캠 PM 7기 2조(안2잘부) 최종 프로젝트. 트리플 일정(국가·기간·동반·활동)으로 준비물 리스트를 만들고 체크·찜·편집합니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000

화면은 393px 폭 + `#DADBDF` 레터박스입니다. 개발자 도구 모바일 뷰(393×852)로 보는 것이 가장 가깝습니다.

## 데이터

- 일정·체크 상태는 이 브라우저 localStorage에 캐시되고, Supabase `accounts` / `trips`에 동기화됩니다.
- 홈의 공유 링크(`/s/{accountId}`)는 그 계정 전체를 다른 기기에서 여는 키입니다.
- 출발 16일 이내면 [Open-Meteo](https://open-meteo.com) 예보, 그 외·실패 시 평년 기온으로 준비물을 고릅니다.
- 기능 명세서의 `csv.zip`이 없어 README 규칙으로 아이템·규칙을 코드에 넣었습니다. 원본 CSV가 있으면 `lib/rules.ts`만 갈아끼우면 됩니다.

## Supabase

로컬은 `.env.local`에 프로젝트 URL과 publishable key가 있으면 됩니다. 템플릿은 `.env.example`. **시크릿·서비스롤·DB 비밀번호는 앱/Vercel에 넣지 않습니다.** 테이블이 없으면 [SQL Editor](https://supabase.com/dashboard/project/vsvlniwtfnjhqonsbldc/sql/new)에 `supabase/schema.sql`을 붙여넣고 Run 합니다.

앱을 꺼 둔 상태의 웹 푸시(D-7/D-3/D-1 19시 KST)는 서비스 워커 + Vercel Cron(`/api/push/dispatch`)으로 보냅니다. iOS는 포함하지 않습니다. 구독 테이블이 없으면 어드민 **푸시** 탭에서 SQL을 복사해 Run 하세요.

라이브: https://chaenggyeoyo.vercel.app  
커스텀 도메인: https://chaenggyeoyo.me (가비아 DNS 반영 후)

## Vercel

GitHub 저장소 루트가 이 앱입니다. Root Directory는 비워 두면 됩니다(Framework Preset: Next.js). 배포 주소는 `chaenggyeoyo.vercel.app` 이고, 커스텀 도메인은 `chaenggyeoyo.me` 입니다.

가비아에는 Vercel Domains 화면에 나온 레코드를 넣습니다. 이 프로젝트 기준은 아래입니다.

- A / 호스트 `@` / `216.198.79.1`
- CNAME / 호스트 `www` / `3ff2e8483112c4f4.vercel-dns-017.com`

apex는 `www.chaenggyeoyo.me`로 308 리다이렉트됩니다.

Settings → Environment Variables에 아래를 넣습니다. Production / Preview / Development 모두 체크.

| Name | Value | 어디서 복사 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase → Project Settings → Data API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` | 같은 화면의 publishable / anon key |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `web-push generate-vapid-keys`의 public key | 로컬에서 한 번 생성 후 재사용 |
| `VAPID_PRIVATE_KEY` | 같은 명령의 private key | 서버 전용. 클라이언트에 넣지 마세요 |
| `VAPID_SUBJECT` | `mailto:chaeggyeo@gmail.com` | 연락용. 선택 |
| `CRON_SECRET` | 임의 문자열 | Vercel Cron이 `/api/push/dispatch`를 호출할 때 Bearer로 붙습니다 |

`NEXT_PUBLIC_` 은 빌드 때 번들에 들어갑니다. 값을 바꾼 뒤에는 Redeploy가 필요합니다. `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` 은 Vercel에 넣지 마세요.
