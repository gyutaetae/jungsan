export type LedgerSource = "receipt" | "spreadsheet" | "sample";

export type LedgerStatus =
  | "queued"
  | "processing"
  | "needs_review"
  | "confirmed"
  | "failed";

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

export type ProcessingItem = {
  id: string;
  fileName: string;
  previewUrl?: string;
  source: "receipt" | "spreadsheet";
  status: "queued" | "processing" | "done" | "failed";
  errorMessage?: string;
};

export type ExpenseSummary = {
  totalAmount: number;
  supplyAmount: number;
  vatAmount: number;
  needsReviewCount: number;
  confirmedCount: number;
  byCategory: Record<ExpenseCategory, number>;
};
