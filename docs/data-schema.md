# Data Schema

MVP 앱은 서버 DB 없이 클라이언트 상태의 `LedgerEntry[]`로도 동작한다. 데이터베이스 수업 제출용 확장안은 같은 모델을 Supabase Postgres에 저장한다.

- 현재 데모 기본값: 원본 파일을 저장하지 않고, 업로드/촬영 파일은 API 처리 후 버린다.
- DB 확장값: 장부 행, 업로드 묶음, 파일 메타데이터, 신고 준비 요약을 Postgres에 저장한다.
- 전체 관계형 설계는 `docs/database.md`와 `supabase/migrations/202605170001_initial_schema.sql`에 있다.

## LedgerEntry

```ts
export type LedgerSource = "receipt" | "spreadsheet" | "camera" | "sample";
export type LedgerStatus = "queued" | "processing" | "needs_review" | "confirmed" | "failed";
export type VatStatus = "confirmed" | "missing" | "estimated";

export type ExpenseCategory =
  | "소모품비"
  | "여비교통비"
  | "접대비"
  | "통신비"
  | "지급수수료"
  | "광고선전비"
  | "차량유지비"
  | "기타경비";

export type ProofType =
  | "카드영수증"
  | "현금영수증"
  | "세금계산서"
  | "간이영수증"
  | "기타";

export type LedgerEntry = {
  id: string;
  source: LedgerSource;
  status: LedgerStatus;
  transactionDate: string;
  vendorName: string;
  businessNumber?: string;
  description: string;
  totalAmount: number;
  supplyAmount?: number;
  vatAmount?: number;
  vatStatus: VatStatus;
  category: ExpenseCategory;
  proofType: ProofType;
  confidence?: number;
  memo?: string;
  originalFileName?: string;
  createdAt: string;
};
```

## ProcessingItem

```ts
export type ProcessingItem = {
  id: string;
  fileName: string;
  previewUrl?: string;
  source: "receipt" | "spreadsheet" | "camera";
  status: "queued" | "processing" | "done" | "failed";
  errorMessage?: string;
};
```

## ExpenseSummary

```ts
export type ExpenseSummary = {
  totalAmount: number;
  supplyAmount: number;
  vatAmount: number;
  needsReviewCount: number;
  confirmedCount: number;
  byCategory: Record<ExpenseCategory, number>;
};
```

## TaxPrepInput

```ts
export type TaxPrepInput = {
  totalIncomeAmount: number;
  entries: LedgerEntry[];
};
```

## TaxPrepSummary

```ts
export type TaxPrepSummary = {
  totalIncomeAmount: number;
  totalExpenseAmount: number;
  estimatedIncomeAmount: number;
  supplyAmount: number;
  vatAmount: number;
  needsReviewCount: number;
  byCategory: Record<ExpenseCategory, number>;
  byProofType: Record<ProofType, number>;
  reviewItems: LedgerEntry[];
};
```

## Spreadsheet Import Columns

Required:

- `거래일`
- `거래처`
- `금액`
- `메모`
- `증빙유형`

Optional:

- `공급가액`
- `부가세`
- `사업자등록번호`
- `계정과목`

## Calculation Rules

- `totalAmount` is required.
- If supply/vat are unclear, leave them empty and set `vatStatus = "missing"`.
- Do not infer tax amounts with a 10% reverse calculation.
- Default `category = "기타경비"`.
- Default `status = "needs_review"` for imported/extracted rows.
- `totalIncomeAmount` is provided by the user and must not be inferred from expense entries.
- `estimatedIncomeAmount = totalIncomeAmount - totalExpenseAmount`.
- `reviewItems` includes entries where `status === "needs_review"` or `vatStatus !== "confirmed"`.

## Supabase Tables

수업용 DB 확장 스키마는 아래 테이블로 구성한다.

- `profiles`: Supabase Auth 사용자 프로필
- `businesses`: 소상공인·프리랜서의 신고 단위
- `import_batches`: 엑셀 업로드 또는 여러 장 촬영 묶음
- `source_files`: 원본 파일명, MIME 타입, 선택적 storage path
- `ledger_entries`: 검토 테이블의 장부 행
- `tax_prep_summaries`: 신고 준비 요약 스냅샷

핵심 설계:

- 원본 이미지는 기본 저장하지 않고 파일 메타데이터만 남길 수 있다.
- 한 번의 여러 장 촬영은 `import_batches 1 : N source_files`로 표현한다.
- `ledger_entries`는 `business_id`, `batch_id`, `source_file_id`를 통해 사용자의 신고 단위와 업로드 출처를 추적한다.
- enum, check constraint, FK, RLS 정책으로 데이터 품질과 접근 제어를 설명할 수 있다.
