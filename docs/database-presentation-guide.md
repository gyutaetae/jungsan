# 데이터베이스 수업 발표 가이드: 정산

## 발표 목표

이번 발표의 목표는 `정산`을 단순한 AI 영수증 인식 앱이 아니라, 흩어진 거래 자료를 Supabase Postgres 기반 장부 데이터로 저장·조회·집계하는 데이터베이스 프로젝트로 설명하는 것이다.

핵심 메시지는 다음과 같다.

> 정산은 영수증 사진과 거래내역 엑셀을 장부 행으로 구조화하고, Supabase Postgres에 저장한 뒤, 검토 상태·계정과목·증빙유형 기준으로 신고 준비 요약을 만드는 서비스입니다.

## 한 줄 소개

`정산`은 소상공인과 프리랜서가 영수증 사진과 거래내역 파일을 검토 가능한 장부 데이터로 바꾸고, Supabase DB에 저장해 필요경비와 홈택스 입력용 요약을 관리하는 신고 준비 웹앱이다.

## 발표에서 강조할 평가 포인트

데이터베이스 수업에서는 화면보다 데이터 설계가 중요하다. 발표에서는 아래 항목을 반드시 보여준다.

1. 현실 문제를 어떤 데이터 모델로 바꿨는가
2. 어떤 테이블과 관계를 설계했는가
3. 정규화, 제약조건, 인덱스를 어떻게 적용했는가
4. 업로드부터 저장, 조회, 집계까지 데이터 흐름이 어떻게 이어지는가
5. Supabase RLS로 사용자별 데이터를 어떻게 분리할 수 있는가

## 문제 정의

소상공인과 프리랜서는 신고 전에 영수증, 카드 거래내역, 엑셀 파일, 장부 양식을 따로 관리한다. 문제는 자료가 흩어져 있고 같은 거래 정보를 여러 번 옮겨 적어야 한다는 점이다.

`정산`은 이 문제를 데이터베이스 관점에서 해결한다. 비정형 입력인 영수증 이미지와 반정형 입력인 엑셀 파일을 공통 장부 행으로 바꾸고, DB에 저장 가능한 구조로 정리한다.

## 현재 구현된 DB 연동

현재 프로젝트에는 Supabase 연동이 실제로 들어가 있다.

- `GET /api/database/status`: Supabase 환경변수와 연결 상태 확인
- `GET /api/database/ledger`: 데모 사업자의 장부 행과 총수입금액 불러오기
- `PUT /api/database/ledger`: 현재 검토 테이블과 신고 준비 요약 저장
- `lib/db/server.ts`: Supabase service role 기반 서버 DB 로직
- `supabase/migrations/202605170001_initial_schema.sql`: 테이블, enum, 제약조건, 인덱스, RLS, view 정의
- `supabase/queries/demo.sql`: 발표용 집계 쿼리

발표 문장:

> 초기에는 클라이언트 상태만으로 장부를 관리했지만, 현재는 Supabase Postgres에 장부 행과 신고 준비 요약을 저장하고 다시 불러오는 흐름까지 연결했습니다.

## 주요 테이블

### profiles

Supabase Auth 사용자와 1:1로 연결되는 사용자 프로필이다.

주요 컬럼:

- `id`: `auth.users.id`를 참조하는 PK
- `email`
- `display_name`
- `created_at`

### businesses

사용자의 사업장 또는 신고 단위를 저장한다.

주요 컬럼:

- `id`
- `owner_id`: `profiles.id` FK
- `business_name`
- `business_number`
- `tax_year`

중요 제약:

- `unique(owner_id, business_name, tax_year)`
- 한 사용자가 같은 연도에 같은 사업장을 중복 생성하지 못하게 한다.

### import_batches

한 번의 영수증 촬영 묶음, 이미지 업로드 묶음, 엑셀 업로드를 표현한다.

주요 컬럼:

- `id`
- `business_id`
- `source_type`: `receipt`, `spreadsheet`, `camera`, `sample`
- `status`
- `item_count`
- `created_at`
- `completed_at`

발표 포인트:

> 여러 장 촬영 기능은 한 번의 업로드 묶음으로 관리하고, 그 안에 여러 파일과 여러 장부 행이 연결됩니다.

### source_files

업로드되거나 촬영된 파일의 메타데이터를 저장한다. 원본 이미지는 기본 저장하지 않고, 필요한 경우 `storage_path`로만 연결할 수 있다.

주요 컬럼:

- `id`
- `batch_id`
- `original_file_name`
- `storage_path`
- `mime_type`
- `status`
- `error_message`

### ledger_entries

가장 중요한 장부 거래 테이블이다.

주요 컬럼:

- `business_id`
- `batch_id`
- `source_file_id`
- `source`
- `status`
- `transaction_date`
- `vendor_name`
- `business_number`
- `description`
- `total_amount`
- `supply_amount`
- `vat_amount`
- `vat_status`
- `category`
- `proof_type`
- `confidence`
- `memo`
- `original_file_name`

발표 문장:

> `ledger_entries`는 검토 테이블의 실제 DB 표현입니다. 영수증 AI 결과와 엑셀 거래내역이 모두 이 테이블의 같은 구조로 저장됩니다.

### tax_prep_summaries

신고 준비 요약 스냅샷을 저장한다.

주요 컬럼:

- `business_id`
- `tax_year`
- `total_income_amount`
- `total_expense_amount`
- `estimated_income_amount`
- `supply_amount`
- `vat_amount`
- `needs_review_count`

중요 포인트:

- `estimated_income_amount`는 generated column이다.
- `total_income_amount - total_expense_amount`를 DB에서 계산해 저장한다.
- `unique(business_id, tax_year)`로 신고 연도별 요약을 하나로 유지한다.

## ERD 설명

발표에서는 아래 관계를 중심으로 설명하면 된다.

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

쉽게 설명하면 다음과 같다.

> 한 사용자는 여러 신고 단위를 가질 수 있고, 하나의 신고 단위에는 여러 업로드 묶음과 장부 거래가 연결됩니다. 업로드 파일은 장부 거래의 출처를 추적하기 위한 메타데이터이며, 신고 준비 요약은 장부 거래를 집계한 결과입니다.

## 정규화 포인트

정규화는 다음처럼 설명한다.

- 사용자 정보는 `profiles`로 분리했다.
- 사업장/신고 단위는 `businesses`로 분리했다.
- 업로드 이벤트는 `import_batches`로 분리했다.
- 파일 메타데이터는 `source_files`로 분리했다.
- 실제 거래 데이터는 `ledger_entries`에 저장했다.
- 신고 요약은 `tax_prep_summaries`에 스냅샷으로 저장했다.

발표 문장:

> 모든 데이터를 하나의 거대한 테이블에 넣지 않고, 사용자, 사업장, 업로드 묶음, 파일, 장부 행, 요약을 역할별로 분리했습니다. 덕분에 업로드 이력 추적, 장부 조회, 신고 요약 집계를 각각 독립적으로 관리할 수 있습니다.

## 무결성 규칙

마이그레이션에 실제 제약조건이 들어가 있으므로 발표에서 강하게 말할 수 있다.

- `tax_year`는 2000년부터 2100년 사이만 허용한다.
- `total_amount`는 0 이상이어야 한다.
- `supply_amount`, `vat_amount`도 null이 아니면 0 이상이어야 한다.
- `confidence`는 0 이상 1 이하만 허용한다.
- `vat_status = 'confirmed'`이면 `supply_amount`, `vat_amount`가 반드시 있어야 한다.
- `businesses`는 같은 사용자, 같은 사업장명, 같은 신고연도로 중복 생성될 수 없다.
- `tax_prep_summaries`는 사업장과 신고연도 기준으로 하나만 유지된다.

발표 문장:

> 세금 신고 준비 데이터는 정확성이 중요하기 때문에 애플리케이션 검증뿐 아니라 DB check constraint로도 잘못된 값을 막았습니다.

## Enum 설계

Postgres enum을 사용해 상태값과 분류값을 제한했다.

- `ledger_source`: `receipt`, `spreadsheet`, `camera`, `sample`
- `ledger_status`: `queued`, `processing`, `needs_review`, `confirmed`, `failed`
- `vat_status`: `confirmed`, `missing`, `estimated`
- `expense_category`: 소모품비, 여비교통비, 접대비 등
- `proof_type`: 카드영수증, 현금영수증, 세금계산서 등
- `import_status`: `pending`, `processing`, `done`, `failed`

발표 문장:

> 문자열을 자유롭게 저장하면 오타나 잘못된 상태가 들어갈 수 있습니다. 그래서 enum으로 허용 가능한 상태와 분류를 제한했습니다.

## 인덱스 설계

조회와 집계에 필요한 인덱스도 들어가 있다.

- `businesses(owner_id, tax_year)`: 사용자별 신고연도 조회
- `import_batches(business_id, created_at desc)`: 최근 업로드 묶음 조회
- `ledger_entries(business_id, transaction_date desc)`: 장부 날짜순 조회
- `ledger_entries(business_id, category)`: 계정과목별 집계
- `ledger_entries(business_id, proof_type)`: 증빙유형별 집계
- `ledger_entries(status)`: 검토 필요 항목 필터
- `tax_prep_summaries(business_id, tax_year)`: 연도별 요약 조회

발표 문장:

> 사용자가 실제로 자주 보는 화면은 날짜순 장부, 계정과목별 합계, 증빙유형별 합계, 검토 필요 항목입니다. 그 조회 패턴에 맞춰 인덱스를 설계했습니다.

## View와 집계

DB에는 발표용으로 설명하기 좋은 view가 있다.

- `monthly_expense_summary`: 월별 지출 합계
- `category_expense_summary`: 계정과목별 필요경비 합계
- `proof_type_expense_summary`: 증빙유형별 합계
- `needs_review_entries`: 확인 필요 항목

발표에서는 `supabase/queries/demo.sql`의 쿼리를 보여주면 좋다.

예시 설명:

> 장부 행을 단순 저장하는 데서 끝나지 않고, 월별·계정과목별·증빙유형별 집계 view를 만들어 신고 준비에 필요한 요약을 DB에서 바로 확인할 수 있게 했습니다.

## 보안 설계

Supabase RLS가 켜져 있다.

- 사용자는 자기 `profiles` 행만 접근한다.
- 사용자는 자기 `businesses`만 접근한다.
- `import_batches`, `source_files`, `ledger_entries`, `tax_prep_summaries`는 연결된 사업장의 소유자만 접근한다.

현재 앱의 데모 API는 서버에서 service role key를 사용한다. 실제 서비스로 확장하면 클라이언트 인증과 RLS 정책을 함께 사용해 사용자별 장부 접근을 분리할 수 있다.

발표 문장:

> 세무 데이터는 민감하기 때문에 사용자별 접근 분리가 중요합니다. Supabase RLS 정책을 통해 각 사용자는 자신이 소유한 사업장과 장부 데이터만 접근하도록 설계했습니다.

## 데이터 흐름

발표에서 가장 중요한 흐름이다.

1. 사용자가 영수증 이미지 또는 거래내역 엑셀을 업로드한다.
2. AI 또는 파일 파서가 거래 정보를 추출한다.
3. 앱은 결과를 `LedgerEntry` 구조로 정규화한다.
4. 사용자는 검토 테이블에서 값을 수정하고 확인한다.
5. `PUT /api/database/ledger`가 현재 장부와 총수입금액을 Supabase에 저장한다.
6. 서버는 데모 사용자와 사업장을 보장한다.
7. 기존 장부 행을 교체하고 새 `ledger_entries`를 저장한다.
8. `tax_prep_summaries`를 upsert한다.
9. `GET /api/database/ledger`로 저장된 장부와 총수입금액을 다시 불러온다.

## 데모 순서

1. 앱 실행 후 DB 상태 확인 버튼을 보여준다.
2. 샘플 데이터 또는 영수증/엑셀을 검토 테이블에 추가한다.
3. 거래 하나를 수정하고 확인 상태로 바꾼다.
4. 필요경비 요약이 바뀌는 것을 보여준다.
5. DB 저장을 누른다.
6. 새로고침 후 DB 불러오기로 데이터가 유지되는 것을 보여준다.
7. Supabase 테이블 또는 `demo.sql` 집계 쿼리를 보여준다.
8. 간편장부 엑셀 또는 신고 준비 문서 다운로드로 마무리한다.

## 추천 슬라이드 구성

1. 표지: `정산 - 영수증과 거래내역을 신고 준비 DB로`
2. 문제 정의: 자료가 흩어져 있어 신고 전 정리가 어렵다
3. 서비스 흐름: 업로드 → 장부화 → 검토 → DB 저장 → 요약
4. ERD: profiles, businesses, import_batches, source_files, ledger_entries, tax_prep_summaries
5. 핵심 테이블: `ledger_entries`
6. 정규화: 역할별 테이블 분리
7. 무결성: enum, FK, unique, check constraint
8. 성능: 인덱스와 집계 view
9. 보안: Supabase RLS
10. 데모
11. 한계와 개선: 실제 로그인, 원본 파일 선택 저장, 세무사 검토 연동

## 예상 질문과 답변

### Q. DB를 실제로 사용하나요?

네. Supabase Postgres 연동 API가 구현되어 있고, 검토 테이블의 장부 행과 신고 준비 요약을 저장하고 다시 불러올 수 있습니다. 마이그레이션 파일에는 테이블, enum, 제약조건, 인덱스, RLS, view가 포함되어 있습니다.

### Q. 왜 Supabase를 선택했나요?

Postgres 기반이라 정규화, FK, check constraint, index, view, RLS를 수업 평가 포인트로 설명하기 좋습니다. 또한 실제 서비스로 확장할 때 인증과 사용자별 데이터 분리를 붙이기 쉽습니다.

### Q. `ledger_entries`가 왜 핵심인가요?

영수증 AI 결과와 엑셀 거래내역이 모두 같은 장부 행으로 통합되기 때문입니다. 이후 필요경비 합계, 증빙유형별 집계, 신고 준비 요약은 모두 `ledger_entries`를 기준으로 계산됩니다.

### Q. AI가 틀린 데이터는 어떻게 처리하나요?

AI 결과는 바로 확정하지 않고 `needs_review` 상태로 저장합니다. 사용자가 검토한 뒤 `confirmed`가 됩니다. 부가세가 불명확하면 임의로 계산하지 않고 `vat_status = missing`으로 남깁니다.

### Q. 원본 영수증 이미지는 저장하나요?

현재 데모에서는 원본 이미지를 기본 저장하지 않습니다. 개인정보 보호와 데모 안정성을 위해 장부 행과 요약을 중심으로 저장합니다. 실제 서비스에서는 `source_files.storage_path`를 통해 Supabase Storage와 선택적으로 연결할 수 있습니다.

## 마무리 문장

> 정산은 영수증 OCR에서 끝나는 앱이 아닙니다. 비정형 자료를 장부 데이터로 구조화하고, Supabase Postgres에 저장한 뒤, 검토 상태와 계정과목, 증빙유형 기준으로 신고 준비 요약까지 만드는 데이터베이스 프로젝트입니다.
