import * as XLSX from "xlsx";
import { EXPENSE_CATEGORIES, PROOF_TYPES } from "../ledger/categories";
import { createId } from "../utils/ids";
import { parseMoneyInput } from "../utils/money";
import type { ExpenseCategory, LedgerEntry, ProofType } from "../../types/ledger";
import { REQUIRED_TRANSACTION_COLUMNS } from "./templateMap";

type TransactionRow = Record<string, unknown>;

const DATE_NUMBER_FORMAT = "yyyy-mm-dd";

function normalizeHeader(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeString(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeMoney(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }

  return parseMoneyInput(normalizeString(value));
}

function normalizeDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);

    if (parsed) {
      return [
        String(parsed.y).padStart(4, "0"),
        String(parsed.m).padStart(2, "0"),
        String(parsed.d).padStart(2, "0"),
      ].join("-");
    }
  }

  const text = normalizeString(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const compactMatch = text.match(/^(\d{4})[./년\s-]?(\d{1,2})[./월\s-]?(\d{1,2})/);

  if (compactMatch) {
    return [
      compactMatch[1],
      compactMatch[2].padStart(2, "0"),
      compactMatch[3].padStart(2, "0"),
    ].join("-");
  }

  return "";
}

function normalizeCategory(value: unknown): ExpenseCategory {
  const category = normalizeString(value) as ExpenseCategory;
  return EXPENSE_CATEGORIES.includes(category) ? category : "기타경비";
}

function normalizeProofType(value: unknown): ProofType {
  const proofType = normalizeString(value) as ProofType;
  return PROOF_TYPES.includes(proofType) ? proofType : "기타";
}

function assertRequiredColumns(rows: TransactionRow[]) {
  const firstRow = rows[0];

  if (!firstRow) {
    throw new Error("거래내역 파일에 데이터 행이 없습니다.");
  }

  const columns = Object.keys(firstRow).map(normalizeHeader);
  const missingColumns = REQUIRED_TRANSACTION_COLUMNS.filter(
    (column) => !columns.includes(column),
  );

  if (missingColumns.length > 0) {
    throw new Error(`필수 컬럼이 없습니다: ${missingColumns.join(", ")}`);
  }
}

export function importTransactionsFromWorkbook(
  buffer: Buffer,
  originalFileName: string,
) {
  const workbook = XLSX.read(buffer, {
    cellDates: true,
    dateNF: DATE_NUMBER_FORMAT,
    type: "buffer",
  });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("거래내역 파일에 시트가 없습니다.");
  }

  const rows = XLSX.utils.sheet_to_json<TransactionRow>(
    workbook.Sheets[firstSheetName],
    {
      defval: "",
      raw: true,
    },
  );

  assertRequiredColumns(rows);

  return rows
    .map((row): LedgerEntry | undefined => {
      const transactionDate = normalizeDate(row["거래일"]);
      const vendorName = normalizeString(row["거래처"]);
      const totalAmount = normalizeMoney(row["금액"]);
      const memo = normalizeString(row["메모"]);
      const supplyAmount = normalizeMoney(row["공급가액"]);
      const vatAmount = normalizeMoney(row["부가세"]);

      if (!transactionDate || !vendorName || totalAmount === undefined) {
        return undefined;
      }

      return {
        id: createId("spreadsheet"),
        source: "spreadsheet",
        status: "needs_review",
        transactionDate,
        vendorName,
        businessNumber: normalizeString(row["사업자등록번호"]) || undefined,
        description: memo || "거래내역",
        totalAmount,
        supplyAmount,
        vatAmount,
        vatStatus:
          supplyAmount === undefined && vatAmount === undefined
            ? "missing"
            : "confirmed",
        category: normalizeCategory(row["계정과목"]),
        proofType: normalizeProofType(row["증빙유형"]),
        memo: memo || undefined,
        originalFileName,
        createdAt: new Date().toISOString(),
      } satisfies LedgerEntry;
    })
    .filter((entry): entry is LedgerEntry => entry !== undefined);
}
