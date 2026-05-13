import ExcelJS from "exceljs";
import type { LedgerEntry, TaxPrepInput } from "../../types/ledger";
import { EXPENSE_CATEGORIES, PROOF_TYPES } from "../ledger/categories";
import { calculateTaxPrepSummary } from "../taxPrep/summary";

export const TAX_PREP_FILE_NAME = "jeongsan-tax-prep-draft.xlsx";

const REVIEW_NOTICE = "검토용 초안 - 홈택스 제출 전 확인 필요";

type SummaryRow = [string, string | number];

function applyTitle(
  worksheet: ExcelJS.Worksheet,
  title: string,
  columnCount: number,
) {
  worksheet.views = [{ state: "frozen", ySplit: 3 }];
  worksheet.getRow(1).height = 22;
  worksheet.getRow(2).height = 24;
  worksheet.getRow(3).height = 22;

  worksheet.mergeCells(1, 1, 1, columnCount);
  worksheet.mergeCells(2, 1, 2, columnCount);

  worksheet.getCell("A1").value = REVIEW_NOTICE;
  worksheet.getCell("A1").font = {
    bold: true,
    color: { argb: "FF92400E" },
    size: 12,
  };
  worksheet.getCell("A1").alignment = { vertical: "middle" };

  worksheet.getCell("A2").value = title;
  worksheet.getCell("A2").font = {
    bold: true,
    color: { argb: "FF1C1917" },
    size: 14,
  };
  worksheet.getCell("A2").alignment = { vertical: "middle" };
}

function styleHeaderRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FF1C1917" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9F99D" },
    };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FFA8A29E" } },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });
}

function styleDataRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.border = {
      bottom: { style: "hair", color: { argb: "FFE7E5E4" } },
    };
    cell.alignment = { vertical: "middle" };
  });
}

function addSummaryRows(worksheet: ExcelJS.Worksheet, rows: SummaryRow[]) {
  rows.forEach(([label, value]) => {
    const row = worksheet.addRow([label, value]);
    row.getCell(1).font = { bold: true, color: { argb: "FF57534E" } };
    if (typeof value === "number") {
      row.getCell(2).numFmt = "#,##0";
    }
    styleDataRow(row);
  });
}

function addSectionHeader(worksheet: ExcelJS.Worksheet, title: string) {
  const row = worksheet.addRow([title]);
  row.getCell(1).font = { bold: true, color: { argb: "FF1C1917" } };
  row.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF5F5F4" },
  };
  styleDataRow(row);
}

function addHomeTaxSummarySheet(
  workbook: ExcelJS.Workbook,
  input: TaxPrepInput,
) {
  const summary = calculateTaxPrepSummary(
    input.totalIncomeAmount,
    input.entries,
  );
  const worksheet = workbook.addWorksheet("홈택스 입력용 요약");

  worksheet.columns = [
    { key: "label", width: 28 },
    { key: "value", width: 18 },
  ];

  applyTitle(worksheet, "홈택스 입력용 요약", 2);
  const headerRow = worksheet.addRow(["항목", "금액/건수"]);
  styleHeaderRow(headerRow);

  addSummaryRows(worksheet, [
    ["총수입금액", summary.totalIncomeAmount],
    ["필요경비", summary.totalExpenseAmount],
    ["예상 소득금액", summary.estimatedIncomeAmount],
    ["공급가액", summary.supplyAmount],
    ["부가세", summary.vatAmount],
    ["확인 필요 항목 수", summary.needsReviewCount],
  ]);

  worksheet.addRow([]);
  addSectionHeader(worksheet, "계정과목별 합계");
  EXPENSE_CATEGORIES.forEach((category) => {
    const row = worksheet.addRow([category, summary.byCategory[category]]);
    row.getCell(2).numFmt = "#,##0";
    styleDataRow(row);
  });

  worksheet.addRow([]);
  addSectionHeader(worksheet, "증빙유형별 합계");
  PROOF_TYPES.forEach((proofType) => {
    const row = worksheet.addRow([proofType, summary.byProofType[proofType]]);
    row.getCell(2).numFmt = "#,##0";
    styleDataRow(row);
  });
}

function addIncomeExpenseDraftSheet(
  workbook: ExcelJS.Workbook,
  input: TaxPrepInput,
) {
  const summary = calculateTaxPrepSummary(
    input.totalIncomeAmount,
    input.entries,
  );
  const worksheet = workbook.addWorksheet("총수입금액 및 필요경비명세서");

  worksheet.columns = [
    { key: "section", width: 26 },
    { key: "item", width: 28 },
    { key: "amount", width: 18 },
    { key: "memo", width: 32 },
  ];

  applyTitle(worksheet, "총수입금액 및 필요경비명세서", 4);
  const headerRow = worksheet.addRow(["구분", "항목", "금액", "메모"]);
  styleHeaderRow(headerRow);

  [
    ["수입금액", "총수입금액", summary.totalIncomeAmount, "사용자 입력값"],
    ["필요경비", "필요경비 합계", summary.totalExpenseAmount, "검토 테이블 합계"],
  ].forEach((values) => {
    const row = worksheet.addRow(values);
    row.getCell(3).numFmt = "#,##0";
    styleDataRow(row);
  });

  EXPENSE_CATEGORIES.forEach((category) => {
    const row = worksheet.addRow([
      "계정과목별 필요경비",
      category,
      summary.byCategory[category],
      "공식 서식 항목 구조 참고 초안",
    ]);
    row.getCell(3).numFmt = "#,##0";
    styleDataRow(row);
  });
}

function addSimplifiedIncomeCalculationSheet(
  workbook: ExcelJS.Workbook,
  input: TaxPrepInput,
) {
  const summary = calculateTaxPrepSummary(
    input.totalIncomeAmount,
    input.entries,
  );
  const worksheet = workbook.addWorksheet("간편장부소득금액계산서");

  worksheet.columns = [
    { key: "item", width: 30 },
    { key: "amount", width: 18 },
    { key: "memo", width: 44 },
  ];

  applyTitle(worksheet, "간편장부소득금액계산서", 3);
  const headerRow = worksheet.addRow(["항목", "금액", "메모"]);
  styleHeaderRow(headerRow);

  [
    ["총수입금액", summary.totalIncomeAmount, "사용자 입력값"],
    ["필요경비", summary.totalExpenseAmount, "검토 테이블 합계"],
    [
      "소득금액",
      summary.estimatedIncomeAmount,
      "총수입금액에서 필요경비를 차감한 초안",
    ],
    [
      "세무조정 항목",
      "",
      "세무조정 항목은 자동 계산하지 않으며 홈택스 입력 전 검토 필요",
    ],
  ].forEach((values) => {
    const row = worksheet.addRow(values);
    row.getCell(2).numFmt = "#,##0";
    styleDataRow(row);
  });
}

function addReviewItemsSheet(workbook: ExcelJS.Workbook, input: TaxPrepInput) {
  const summary = calculateTaxPrepSummary(
    input.totalIncomeAmount,
    input.entries,
  );
  const worksheet = workbook.addWorksheet("확인 필요 항목");

  worksheet.columns = [
    { key: "transactionDate", width: 14 },
    { key: "vendorName", width: 24 },
    { key: "description", width: 28 },
    { key: "totalAmount", width: 14 },
    { key: "category", width: 14 },
    { key: "proofType", width: 14 },
    { key: "status", width: 14 },
    { key: "vatStatus", width: 14 },
    { key: "memo", width: 32 },
  ];

  applyTitle(worksheet, "확인 필요 항목", 9);
  const headerRow = worksheet.addRow([
    "거래일",
    "거래처",
    "내용",
    "금액",
    "계정과목",
    "증빙유형",
    "상태",
    "부가세 상태",
    "메모",
  ]);
  styleHeaderRow(headerRow);

  summary.reviewItems.forEach((entry: LedgerEntry) => {
    const row = worksheet.addRow([
      entry.transactionDate,
      entry.vendorName,
      entry.description,
      entry.totalAmount,
      entry.category,
      entry.proofType,
      entry.status,
      entry.vatStatus,
      entry.memo ?? "",
    ]);
    row.getCell(4).numFmt = "#,##0";
    styleDataRow(row);
  });
}

export async function exportTaxPrepToWorkbookBuffer(
  input: TaxPrepInput,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "jeongsan";
  workbook.created = new Date();

  addHomeTaxSummarySheet(workbook, input);
  addIncomeExpenseDraftSheet(workbook, input);
  addSimplifiedIncomeCalculationSheet(workbook, input);
  addReviewItemsSheet(workbook, input);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
