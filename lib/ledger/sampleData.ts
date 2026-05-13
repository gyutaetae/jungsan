import type { LedgerEntry } from "../../types/ledger";
import { createId } from "../utils/ids";

const sampleRows: Omit<LedgerEntry, "id" | "createdAt">[] = [
  {
    source: "sample",
    status: "needs_review",
    transactionDate: "2026-04-03",
    vendorName: "문구로운 사무소",
    description: "프린터 용지와 파일철",
    totalAmount: 38400,
    supplyAmount: 34909,
    vatAmount: 3491,
    vatStatus: "confirmed",
    category: "소모품비",
    proofType: "카드영수증",
    memo: "사무실 비품",
    confidence: 0.94,
  },
  {
    source: "sample",
    status: "needs_review",
    transactionDate: "2026-04-08",
    vendorName: "초록택시",
    description: "거래처 미팅 이동",
    totalAmount: 18200,
    vatStatus: "missing",
    category: "여비교통비",
    proofType: "카드영수증",
    memo: "부가세 미확인",
    confidence: 0.88,
  },
  {
    source: "sample",
    status: "confirmed",
    transactionDate: "2026-04-12",
    vendorName: "라인모바일",
    description: "업무용 휴대폰 요금",
    totalAmount: 55000,
    supplyAmount: 50000,
    vatAmount: 5000,
    vatStatus: "confirmed",
    category: "통신비",
    proofType: "세금계산서",
    memo: "4월 통신비",
    confidence: 0.97,
  },
  {
    source: "sample",
    status: "needs_review",
    transactionDate: "2026-04-18",
    vendorName: "캠페인랩",
    description: "검색 광고 충전",
    totalAmount: 120000,
    supplyAmount: 109091,
    vatAmount: 10909,
    vatStatus: "confirmed",
    category: "광고선전비",
    proofType: "카드영수증",
    memo: "봄 프로모션",
    confidence: 0.91,
  },
  {
    source: "sample",
    status: "confirmed",
    transactionDate: "2026-04-24",
    vendorName: "든든페이",
    description: "결제 대행 수수료",
    totalAmount: 27600,
    vatStatus: "missing",
    category: "지급수수료",
    proofType: "기타",
    memo: "정산서 확인 필요",
    confidence: 0.82,
  },
];

export function createSampleLedgerEntries(): LedgerEntry[] {
  const createdAt = new Date().toISOString();

  return sampleRows.map((row) => ({
    ...row,
    id: createId("sample"),
    category: row.category ?? "기타경비",
    createdAt,
  }));
}

export function createSampleReceiptEntry(originalFileName?: string): LedgerEntry {
  return {
    ...sampleRows[0],
    id: createId("sample"),
    source: "sample",
    status: "needs_review",
    originalFileName,
    createdAt: new Date().toISOString(),
  };
}
