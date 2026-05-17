# Database Design

`정산`은 데모 안정성을 위해 클라이언트 상태만으로도 동작한다. 데이터베이스 수업 프로젝트에서는 같은 도메인 모델을 Supabase Postgres로 확장해, 영수증/엑셀 입력부터 신고 준비 요약까지 저장·조회·집계할 수 있는 구조를 제안한다.

## Why Supabase

- Postgres 기반이라 정규화, 제약조건, 인덱스, 뷰, 집계 쿼리를 수업 평가 요소로 설명하기 좋다.
- Supabase Auth와 Row Level Security를 함께 쓰면 소상공인·프리랜서별 장부 데이터를 계정 단위로 분리할 수 있다.
- 원본 영수증 이미지는 기본 저장하지 않고, 필요한 경우에도 `source_files.storage_path`에 선택적으로 연결한다.

## ERD

```txt
auth.users 1 ── 1 profiles
profiles 1 ── N businesses
businesses 1 ── N import_batches
import_batches 1 ── N source_files
businesses 1 ── N ledger_entries
import_batches 1 ── N ledger_entries
source_files 1 ── N ledger_entries
businesses 1 ── N tax_prep_summaries
```

## Tables

### `profiles`

Supabase Auth 사용자와 1:1로 연결되는 프로필이다.

- `id`: `auth.users.id`를 참조하는 PK
- `email`, `display_name`
- `created_at`

### `businesses`

사용자가 관리하는 사업자 또는 프리랜서 신고 단위다.

- `owner_id`: `profiles.id` FK
- `business_name`, `business_number`
- `tax_year`
- `unique(owner_id, business_name, tax_year)`로 같은 연도 신고 단위 중복 방지

### `import_batches`

한 번의 영수증 촬영 묶음, 이미지 업로드 묶음, 엑셀 업로드를 나타낸다.

- `business_id`: 어떤 신고 단위의 업로드인지 연결
- `source_type`: `receipt`, `camera`, `spreadsheet`, `sample`
- `status`, `item_count`, `created_at`, `completed_at`

### `source_files`

업로드되거나 촬영된 파일의 메타데이터다. 개인정보 보호를 위해 원본 저장은 선택이다.

- `batch_id`
- `original_file_name`
- `storage_path`: Supabase Storage를 쓰는 경우에만 값이 들어간다.
- `mime_type`, `status`, `error_message`

### `ledger_entries`

검토 테이블의 핵심 장부 행이다.

- 거래 정보: `transaction_date`, `vendor_name`, `business_number`, `description`
- 금액 정보: `total_amount`, `supply_amount`, `vat_amount`, `vat_status`
- 세무 분류: `category`, `proof_type`
- 검토 상태: `status`, `confidence`, `memo`
- 추적 정보: `business_id`, `batch_id`, `source_file_id`, `original_file_name`

제약조건:

- 금액은 0 이상이어야 한다.
- `confidence`는 0 이상 1 이하만 허용한다.
- `vat_status = 'confirmed'`이면 `supply_amount`, `vat_amount`가 있어야 한다.

### `tax_prep_summaries`

다운로드 직전의 신고 준비 요약 스냅샷이다.

- `total_income_amount`
- `total_expense_amount`
- `estimated_income_amount`: generated column
- `supply_amount`, `vat_amount`
- `needs_review_count`
- `unique(business_id, tax_year)`로 신고 연도별 요약 1개 유지

## Normalization Points

- 사용자(`profiles`), 신고 단위(`businesses`), 업로드 묶음(`import_batches`), 파일 메타데이터(`source_files`), 장부 행(`ledger_entries`)을 분리했다.
- 여러 장 촬영 기능은 한 `import_batches` 아래 여러 `source_files`와 여러 `ledger_entries`로 표현한다.
- 장부 행은 원본 이미지 저장 여부와 분리되어, 개인정보를 덜 저장해도 핵심 분석이 가능하다.
- 카테고리, 증빙유형, 상태값은 enum으로 제한해 데이터 품질을 높인다.

## Security

모든 주요 테이블은 RLS를 켠다. 정책은 `businesses.owner_id = auth.uid()`를 기준으로 연결 테이블까지 전파한다.

- 사용자는 자기 `profiles` 행만 접근한다.
- 사용자는 자기 `businesses`만 접근한다.
- `import_batches`, `source_files`, `ledger_entries`, `tax_prep_summaries`는 연결된 사업자 소유자만 접근한다.

## Indexes

- `businesses(owner_id, tax_year)`: 사용자별 신고 연도 조회
- `import_batches(business_id, created_at desc)`: 최근 업로드 묶음 조회
- `ledger_entries(business_id, transaction_date desc)`: 장부 날짜순 조회
- `ledger_entries(business_id, category)`: 필요경비 계정과목 집계
- `ledger_entries(business_id, proof_type)`: 증빙유형 집계
- `ledger_entries(status)`: 검토 필요 항목 필터링

## Views

- `monthly_expense_summary`: 월별 지출 합계
- `category_expense_summary`: 계정과목별 필요경비 합계
- `proof_type_expense_summary`: 증빙유형별 합계
- `needs_review_entries`: 사용자가 확인해야 하는 행

## Demo Queries

`supabase/queries/demo.sql`에는 발표 때 보여줄 수 있는 쿼리가 있다.

- 계정과목별 필요경비 합계
- 월별 지출 추이
- 검토 필요 항목 목록
- 확정 장부 기준 신고 준비 요약 upsert

## Setup

1. Supabase 프로젝트를 만든다.
2. SQL Editor에서 `supabase/migrations/202605170001_initial_schema.sql`을 실행한다.
3. `.env.local`에 아래 값을 넣는다. `SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 쓰는 비밀키라 `NEXT_PUBLIC_` 접두사를 붙이면 안 된다.

```bash
SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DEMO_EMAIL=demo@jungsan.local
SUPABASE_DEMO_BUSINESS_NAME=정산 데모 사업자
SUPABASE_DEMO_TAX_YEAR=2026
```

4. 앱에서 `DB 저장`, `DB 불러오기`, `상태 확인` 버튼으로 연결 상태와 저장 결과를 확인한다.

## App Integration

현재 앱에는 Supabase 연결 API가 붙어 있다.

- `GET /api/database/status`: 환경변수와 DB 연결 상태 확인
- `GET /api/database/ledger`: 데모 사업자의 장부 행과 총수입금액 불러오기
- `PUT /api/database/ledger`: 현재 검토 테이블과 신고 준비 요약 저장

저장 방식:

- 서버 라우트가 service role key로 Supabase에 접속한다.
- 데모 사용자 `SUPABASE_DEMO_EMAIL`을 Supabase Auth에 만들거나 기존 사용자를 재사용한다.
- `profiles`, `businesses`를 보장한 뒤 `ledger_entries`와 `tax_prep_summaries`를 저장한다.
- 원본 이미지는 저장하지 않고 장부 행과 요약만 저장한다.

## Scoring Points

- 정규화: 사용자, 사업자, 업로드 묶음, 파일, 장부, 요약을 분리했다.
- 무결성: enum, FK, unique, check constraint로 잘못된 데이터를 줄인다.
- 보안: RLS로 사용자별 장부 접근을 분리한다.
- 성능: 날짜, 카테고리, 증빙유형, 상태 조회에 맞춘 인덱스가 있다.
- 분석: view와 집계 쿼리로 신고 준비 요약을 DB에서 설명할 수 있다.
