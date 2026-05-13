# 정산

영수증 이미지와 거래내역 파일을 검토 가능한 장부 초안으로 바꾸고, 간편장부 엑셀을 내려받는 전국 아이디어톤 데모용 MVP입니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

품질 검증은 아래 명령으로 수행합니다.

```bash
npm run lint
npm run build
```

## 환경 변수

영수증 AI 추출을 사용하려면 `.env.local`에 다음 값을 설정합니다.

```bash
OPENAI_API_KEY=sk-...
OPENAI_RECEIPT_MODEL=gpt-4.1-mini
```

`OPENAI_API_KEY`가 없어도 앱 빌드와 UI는 동작합니다. 이 경우 영수증 분석 요청은 실패 상태가 되며, 처리 큐의 `샘플 결과 사용`으로 데모 흐름을 이어갈 수 있습니다.

## 데모 흐름

1. 첫 화면에서 `샘플 데이터로 보기`를 눌러 검토 테이블과 요약 패널을 즉시 확인합니다.
2. 또는 `영수증 촬영/업로드`로 이미지를 넣어 AI 추출 결과를 장부 행으로 추가합니다.
3. `거래내역 엑셀 업로드`로 `.xlsx` 또는 `.csv` 파일을 추가하면 같은 검토 테이블에 병합됩니다.
4. 검토 테이블에서 거래일, 거래처, 금액, 공급가액, 부가세, 계정과목, 증빙유형, 상태를 수정합니다.
5. 확인 필요 항목이 남아 있어도 경고를 확인한 뒤 `간편장부 엑셀 다운로드`를 진행할 수 있습니다.

앱은 단일 화면으로 구성되어 있으며 데스크톱에서는 요약 패널이 오른쪽, 모바일에서는 검토 테이블 아래에 배치됩니다.

## Vercel 배포 메모

- Build Command: `npm run build`
- Install Command: `npm install`
- Output 설정은 Next.js 기본값을 사용합니다.
- AI 추출까지 시연하려면 Vercel Project Settings의 Environment Variables에 `OPENAI_API_KEY`와 필요 시 `OPENAI_RECEIPT_MODEL`을 등록합니다.
- 서버 DB, 로그인, 업로드 원본 저장은 사용하지 않습니다. API route는 업로드 파일을 일시 처리한 뒤 장부 행 또는 엑셀 파일만 반환합니다.
