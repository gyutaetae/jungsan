# User Intervention Baseline

이 문서는 구현 중 외부 의존성이 막힐 때 사람이 결정하거나 준비해야 하는 지점을 정리한다. fallback은 제품 요구사항이며 데모 흐름을 멈추지 않아야 한다.

## OpenAI API Key

- `OPENAI_API_KEY`가 있으면 영수증 추출 API는 OpenAI Responses API를 사용한다.
- `OPENAI_API_KEY`가 없으면 애플리케이션은 실패하지 않고 샘플 추출 결과로 동작한다.
- UI에는 샘플/fallback 사용이 드러나야 하며, 검토 테이블에서 사용자가 수정할 수 있어야 한다.

## Official Ledger Template

- 공식 국세청 간편장부 엑셀 템플릿 확보를 우선 시도한다.
- 공식 템플릿 다운로드, 라이선스 확인, 필드 매핑이 막히면 MVP 템플릿을 사용한다.
- MVP 템플릿은 핵심 장부 필드와 필요경비 요약을 안정적으로 생성하는 것을 우선한다.

## Manual Review

- AI 추출값과 파일 import 결과는 최종값이 아니라 장부 초안이다.
- 사용자가 검토 테이블에서 직접 수정한 값이 export의 기준이다.
- 공급가액이나 부가세가 불명확하면 사람에게 확인을 맡기고, 시스템은 세금 값을 임의 역산하지 않는다.
