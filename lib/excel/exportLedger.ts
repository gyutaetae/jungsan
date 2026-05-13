import ExcelJS from "exceljs";
import type { LedgerEntry } from "../../types/ledger";
import { SIMPLE_LEDGER_COLUMNS } from "./templateMap";

function applyWorksheetStyle(worksheet: ExcelJS.Worksheet) {
  worksheet.views = [{ state: "frozen", ySplit: 2 }];
  worksheet.getRow(1).height = 24;
  worksheet.getRow(2).height = 22;

  worksheet.getCell("A1").font = {
    bold: true,
    color: { argb: "FF1C1917" },
    size: 14,
  };
  worksheet.getCell("A1").alignment = { vertical: "middle" };
  worksheet.mergeCells(1, 1, 1, SIMPLE_LEDGER_COLUMNS.length);

  worksheet.getRow(2).eachCell((cell) => {
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

function appendEntryRows(worksheet: ExcelJS.Worksheet, entries: LedgerEntry[]) {
  entries.forEach((entry) => {
    const row = worksheet.addRow(
      SIMPLE_LEDGER_COLUMNS.map((column) => entry[column.key] ?? ""),
    );

    row.getCell(4).numFmt = "#,##0";
    row.getCell(5).numFmt = "#,##0";
    row.getCell(6).numFmt = "#,##0";

    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: "hair", color: { argb: "FFE7E5E4" } },
      };
      cell.alignment = { vertical: "middle" };
    });
  });
}

export async function exportLedgerToWorkbookBuffer(entries: LedgerEntry[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "jeongsan";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("간편장부");
  worksheet.columns = SIMPLE_LEDGER_COLUMNS.map((column) => ({
    key: column.key,
    width: column.width,
  }));
  worksheet.addRow(["간편장부"]);
  worksheet.addRow(SIMPLE_LEDGER_COLUMNS.map((column) => column.header));

  applyWorksheetStyle(worksheet);
  appendEntryRows(worksheet, entries);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
