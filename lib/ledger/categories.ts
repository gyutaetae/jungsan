import type { ExpenseCategory, LedgerStatus, ProofType } from "../../types/ledger";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "소모품비",
  "여비교통비",
  "접대비",
  "통신비",
  "지급수수료",
  "광고선전비",
  "차량유지비",
  "기타경비",
];

export const PROOF_TYPES: ProofType[] = [
  "카드영수증",
  "현금영수증",
  "세금계산서",
  "간이영수증",
  "기타",
];

export const LEDGER_STATUSES: LedgerStatus[] = [
  "queued",
  "processing",
  "needs_review",
  "confirmed",
  "failed",
];

export const ledgerStatusLabels: Record<LedgerStatus, string> = {
  queued: "대기",
  processing: "읽는 중",
  needs_review: "확인 필요",
  confirmed: "완료",
  failed: "실패",
};
