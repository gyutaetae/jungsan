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
  excel/
    importTransactions.ts
    exportLedger.ts
    templateMap.ts
  utils/
    ids.ts
    money.ts

templates/
  simple-ledger.xlsx

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

## Client State

`app/page.tsx` owns:

- `entries: LedgerEntry[]`
- `processingItems: ProcessingItem[]`
- export warning modal state

Derived values:

- `ExpenseSummary` from `lib/ledger/summary.ts`

## Reliability Requirements

- Empty state includes `샘플 데이터로 보기`.
- Receipt extraction failure includes `샘플 결과 사용`.
- Excel export must work without AI.
- API key absence must not break the demo.
- Uploaded files must not be persisted.
