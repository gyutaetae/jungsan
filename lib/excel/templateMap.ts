import type { LedgerEntry } from "../../types/ledger";

export const SIMPLE_LEDGER_FILE_NAME = "jeongsan-simple-ledger.xlsx";

export const SIMPLE_LEDGER_COLUMNS = [
  { key: "transactionDate", header: "거래일", width: 14 },
  { key: "vendorName", header: "거래처", width: 24 },
  { key: "description", header: "내용", width: 28 },
  { key: "totalAmount", header: "총액", width: 14 },
  { key: "supplyAmount", header: "공급가액", width: 14 },
  { key: "vatAmount", header: "부가세", width: 14 },
  { key: "category", header: "계정과목", width: 14 },
  { key: "proofType", header: "증빙유형", width: 14 },
] satisfies {
  key: keyof Pick<
    LedgerEntry,
    | "transactionDate"
    | "vendorName"
    | "description"
    | "totalAmount"
    | "supplyAmount"
    | "vatAmount"
    | "category"
    | "proofType"
  >;
  header: string;
  width: number;
}[];

export const REQUIRED_TRANSACTION_COLUMNS = [
  "거래일",
  "거래처",
  "금액",
  "메모",
  "증빙유형",
] as const;

export const OPTIONAL_TRANSACTION_COLUMNS = [
  "공급가액",
  "부가세",
  "사업자등록번호",
  "계정과목",
] as const;
