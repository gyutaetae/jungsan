# Architecture Baseline

이 문서는 구현 phase의 코드 배치 기준이다. 상세 디렉터리와 API 계약은 [code-architecture](./code-architecture.md), 데이터 타입은 [data-schema](./data-schema.md), 기술 결정 배경은 [ADR](./adr.md)를 따른다.

## App Structure

- Next.js App Router 기반 단일 화면 웹앱으로 구현한다.
- `app/page.tsx`가 클라이언트 상태의 중심이다.
- 서버 DB와 인증은 두지 않는다.
- 업로드 파일은 API route에서 일시 처리하고 저장하지 않는다.

권장 구조:

```txt
app/
  page.tsx
  api/
    extract-receipt/route.ts
    import-transactions/route.ts
    export-ledger/route.ts
components/
lib/
types/
templates/
```

## API Routes

- `POST /api/extract-receipt`: 이미지 1장을 받아 `LedgerEntry` 초안을 반환한다. `OPENAI_API_KEY`가 있으면 OpenAI Responses API를 사용하고, 모델 출력은 zod로 검증한다.
- `POST /api/import-transactions`: `.xlsx` 또는 `.csv`를 읽어 `LedgerEntry[]`로 정규화한다.
- `POST /api/export-ledger`: 검토된 `LedgerEntry[]`를 받아 `jeongsan-simple-ledger.xlsx`를 반환한다.

API route는 파일 변환과 외부 API 호출만 담당한다. 사용자 검토 상태, 처리 큐, 경고 모달 상태는 클라이언트가 가진다.

## Types And Libraries

- 공유 장부 타입은 `types/ledger.ts`에 둔다.
- AI 추출 관련 코드는 `lib/ai/`에 둔다.
- 장부 정규화, 샘플 데이터, 요약 계산은 `lib/ledger/`에 둔다.
- 엑셀 import/export와 템플릿 매핑은 `lib/excel/`에 둔다.
- 런타임 검증에는 `zod`, 엑셀 파싱에는 `xlsx`, 엑셀 생성에는 `exceljs`를 사용한다.

## Excel Template Policy

- 공식 국세청 간편장부 엑셀 템플릿을 확보할 수 있으면 우선 사용한다.
- 공식 템플릿 접근 또는 매핑이 막히면 MVP 템플릿 `templates/simple-ledger.xlsx`를 사용한다.
- AI는 엑셀 문서를 직접 생성하지 않는다. 엑셀 생성은 고정 템플릿과 명시적 필드 매핑으로 처리한다.
- 다운로드 파일명은 `jeongsan-simple-ledger.xlsx`로 고정한다.
