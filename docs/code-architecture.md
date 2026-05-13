# Code Architecture

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- OpenAI Responses API
- zod
- xlsx
- exceljs
- lucide-react
- Vercel

## Directory Structure

```txt
app/
  page.tsx
  api/
    extract-receipt/route.ts
    import-transactions/route.ts
    export-ledger/route.ts
    export-tax-prep/route.ts

components/
  AppHeader.tsx
  InputCards.tsx
  ProcessingQueue.tsx
  ReviewTable.tsx
  SummaryPanel.tsx
  ExportBar.tsx
  EmptyState.tsx

lib/
  ai/
    extractReceipt.ts
    schemas.ts
  ledger/
    normalize.ts
    summary.ts
    sampleData.ts
    categories.ts
  taxPrep/
    summary.ts
  excel/
    importTransactions.ts
    exportLedger.ts
    exportTaxPrep.ts
    templateMap.ts
  utils/
    ids.ts
    money.ts

templates/
  simple-ledger.xlsx
  official/
    income-expense-statement.hwp
    simplified-income-calculation.hwp

types/
  ledger.ts
```

## API Routes

### `POST /api/extract-receipt`

Input: one image file.

Output: one `LedgerEntry` draft.

Behavior:
- Use OpenAI when `OPENAI_API_KEY` exists.
- Validate model output with zod.
- Return clear errors on failure.
- Do not store uploaded files.

### `POST /api/import-transactions`

Input: `.xlsx` or `.csv`.

Output: `LedgerEntry[]`.

Behavior:
- Parse MVP sample format.
- Normalize missing tax fields as `vatStatus = "missing"`.
- Set default category to `기타경비`.

### `POST /api/export-ledger`

Input: `LedgerEntry[]`.

Output: Excel file.

Behavior:
- Use official 국세청 간편장부 template if available.
- Fall back to MVP template if official mapping is blocked.
- File name: `jeongsan-simple-ledger.xlsx`.

### `POST /api/export-tax-prep`

Input: `{ totalIncomeAmount: number; entries: LedgerEntry[] }`.

Output: Excel file.

Behavior:
- Validate input with zod.
- Calculate `TaxPrepSummary` in `lib/taxPrep/summary.ts`.
- Generate `jeongsan-tax-prep-draft.xlsx` with `lib/excel/exportTaxPrep.ts`.
- Include 홈택스 입력용 요약, 총수입금액 및 필요경비명세서 초안, 간편장부소득금액계산서 초안, 확인 필요 항목 sheets.
- Treat the workbook as a 검토용 초안 and include 홈택스 입력 전 확인 필요 wording.
- Do not parse, convert, or edit HWP files at runtime.

## Client State

`app/page.tsx` owns:

- `entries: LedgerEntry[]`
- `processingItems: ProcessingItem[]`
- export warning modal state
- `totalIncomeAmount` for tax prep summary

Derived values:

- `ExpenseSummary` from `lib/ledger/summary.ts`
- `TaxPrepSummary` from `lib/taxPrep/summary.ts`

## Reliability Requirements

- Empty state includes `샘플 데이터로 보기`.
- Receipt extraction failure includes `샘플 결과 사용`.
- Excel export must work without AI.
- Tax prep xlsx export must work without AI.
- API key absence must not break the demo.
- Uploaded files must not be persisted.
