# Data Schema

서버 DB는 없다. 모든 입력은 클라이언트 상태의 `LedgerEntry[]`로 합쳐진다. API는 파일 처리와 변환만 담당한다.

## LedgerEntry

```ts
export type LedgerSource = "receipt" | "spreadsheet" | "sample";
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
  source: "receipt" | "spreadsheet";
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
