# Architecture Baseline

이 문서는 구현 phase의 코드 배치 기준이다. 상세 디렉터리와 API 계약은 [code-architecture](./code-architecture.md), 데이터 타입은 [data-schema](./data-schema.md), 기술 결정 배경은 [ADR](./adr.md)를 따른다.

## App Structure

- Next.js App Router 기반 단일 화면 웹앱으로 구현한다.
- `app/page.tsx`가 클라이언트 상태의 중심이다.
- 기본 MVP 흐름은 서버 DB와 인증 없이도 동작한다.
- 수업용 확장 구조는 Supabase Postgres와 RLS 기반 인증을 준비한다.
- 업로드 파일은 API route에서 일시 처리하고 저장하지 않는다.

권장 구조:

```txt
app/
  page.tsx
  api/
    extract-receipt/route.ts
    import-transactions/route.ts
    export-ledger/route.ts
    export-tax-prep/route.ts
components/
lib/
  db/
  taxPrep/
supabase/
  migrations/
  queries/
types/
templates/
  official/
```

## API Routes

- `POST /api/extract-receipt`: 이미지 1장을 받아 `LedgerEntry` 초안을 반환한다. `OPENAI_API_KEY`가 있으면 OpenAI Responses API를 사용하고, 모델 출력은 zod로 검증한다.
- `POST /api/import-transactions`: `.xlsx` 또는 `.csv`를 읽어 `LedgerEntry[]`로 정규화한다.
- `POST /api/export-ledger`: 검토된 `LedgerEntry[]`를 받아 `jeongsan-simple-ledger.xlsx`를 반환한다.
- `POST /api/export-tax-prep`: 총수입금액과 검토된 `LedgerEntry[]`를 받아 `jeongsan-tax-prep-draft.xlsx` 검토용 초안을 반환한다.

API route는 파일 변환과 외부 API 호출만 담당한다. 사용자 검토 상태, 처리 큐, 경고 모달 상태는 클라이언트가 가진다.

## Types And Libraries

- 공유 장부 타입은 `types/ledger.ts`에 둔다.
- AI 추출 관련 코드는 `lib/ai/`에 둔다.
- 장부 정규화, 샘플 데이터, 요약 계산은 `lib/ledger/`에 둔다.
- 엑셀 import/export와 템플릿 매핑은 `lib/excel/`에 둔다.
- 홈택스 입력용 요약 계산은 `lib/taxPrep/`에 둔다.
- Supabase 클라이언트 준비 코드는 `lib/db/`에 둔다.
- 런타임 검증에는 `zod`, 엑셀 파싱에는 `xlsx`, 엑셀 생성에는 `exceljs`를 사용한다.

## Database Extension

- Supabase 스키마는 `supabase/migrations/202605170001_initial_schema.sql`에 둔다.
- 발표용 집계 쿼리는 `supabase/queries/demo.sql`에 둔다.
- 자세한 ERD와 테이블 설명은 `docs/database.md`에 둔다.
- 앱은 환경변수 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 없어도 빌드되어야 한다.

## Excel Template Policy

- 공식 국세청 간편장부 엑셀 템플릿을 확보할 수 있으면 우선 사용한다.
- 공식 템플릿 접근 또는 매핑이 막히면 MVP 템플릿 `templates/simple-ledger.xlsx`를 사용한다.
- AI는 엑셀 문서를 직접 생성하지 않는다. 엑셀 생성은 고정 템플릿과 명시적 필드 매핑으로 처리한다.
- 다운로드 파일명은 `jeongsan-simple-ledger.xlsx`로 고정한다.

## Official Tax Prep File Policy

- 공식 HWP 파일은 `templates/official/`에 기준 문서로 보관한다.
- 런타임에서 HWP를 파싱, 변환, 직접 편집하지 않는다.
- 신고 준비 산출물은 공식 문서의 항목 구조를 참고한 xlsx 검토용 초안으로 생성한다.
- 해당 xlsx는 홈택스 입력용 요약과 신고 전 확인을 돕는 초안으로만 표현한다.
- 총수입금액은 영수증/거래내역에서 추정하지 않고 사용자가 직접 입력한다.
