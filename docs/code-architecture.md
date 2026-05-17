# Code Architecture

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase Postgres
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
    database/
      status/route.ts
      ledger/route.ts
    extract-receipt/route.ts
    import-transactions/route.ts
    export-ledger/route.ts
    export-tax-prep/route.ts

components/
  AppHeader.tsx
  InputCards.tsx
  CameraBatchCapture.tsx
  ProcessingQueue.tsx
  ReviewTable.tsx
  SummaryPanel.tsx
  ExportBar.tsx
  EmptyState.tsx

lib/
  db/
    supabase.ts
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
  database.ts
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

### `GET /api/database/status`

Output: Supabase configuration and connection status.

Behavior:
- Return `configured = false` when Supabase env vars are missing.
- Validate that the server route can query the database when env vars exist.

### `GET /api/database/ledger`

Output: `{ entries: LedgerEntry[]; totalIncomeAmount: number }`.

Behavior:
- Ensure a demo Supabase Auth user, `profiles` row, and `businesses` row exist.
- Load ledger rows for the demo business.
- Load the saved tax prep income amount if available.

### `PUT /api/database/ledger`

Input: `{ entries: LedgerEntry[]; totalIncomeAmount: number }`.

Output: `{ saved: true; entryCount: number }`.

Behavior:
- Ensure the same demo business exists.
- Replace the demo business ledger rows with the current review table.
- Upsert `tax_prep_summaries`.
- Require `SUPABASE_SERVICE_ROLE_KEY` on the server.

## Client State

`app/page.tsx` owns:

- `entries: LedgerEntry[]`
- `processingItems: ProcessingItem[]`
- camera batch capture callback integration
- database sync status and save/load feedback
- export warning modal state
- `totalIncomeAmount` for tax prep summary

The app can run without database credentials. Supabase integration is an optional persistence layer for class demo and future product work.

Derived values:

- `ExpenseSummary` from `lib/ledger/summary.ts`
- `TaxPrepSummary` from `lib/taxPrep/summary.ts`

## Client Components

### `components/CameraBatchCapture.tsx`

Role:
- Open and close the browser camera with `navigator.mediaDevices.getUserMedia`.
- Capture receipt images with a canvas and keep them in a client-only temporary list.
- Let users delete captured images before analysis.
- Send captured `File[]` to the existing receipt analysis flow when the user starts batch analysis.
- Stop camera tracks and revoke preview URLs when they are no longer needed.

Integration:
- `components/InputCards.tsx` opens the camera batch flow from the existing `영수증 촬영/업로드` card on mobile-like devices.
- `app/page.tsx` passes a shared receipt file handler so uploaded images and captured camera images use the same `/api/extract-receipt` queue.
- The component does not create a new API route and does not persist captured images on the server.

## Reliability Requirements

- Empty state includes `샘플 데이터로 보기`.
- Receipt extraction failure includes `샘플 결과 사용`.
- Excel export must work without AI.
- Tax prep xlsx export must work without AI.
- API key absence must not break the demo.
- Uploaded files must not be persisted.

## Database Extension

Supabase Postgres schema lives in `supabase/migrations/202605170001_initial_schema.sql`.

Tables:
- `profiles`
- `businesses`
- `import_batches`
- `source_files`
- `ledger_entries`
- `tax_prep_summaries`

Design:
- Keep the current privacy-first demo path: uploaded images are processed transiently.
- Store normalized ledger data and file metadata when database persistence is enabled.
- Use RLS policies so each user only reads and writes rows connected to their own `businesses`.
- Use summary views for monthly expense totals, category totals, proof-type totals, and review-needed rows.
