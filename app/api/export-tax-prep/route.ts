import { NextResponse } from "next/server";
import { z } from "zod";
import {
  exportTaxPrepToWorkbookBuffer,
  TAX_PREP_FILE_NAME,
} from "../../../lib/excel/exportTaxPrep";

export const runtime = "nodejs";

const ledgerEntrySchema = z.object({
  id: z.string(),
  source: z.enum(["receipt", "spreadsheet", "sample"]),
  status: z.enum(["queued", "processing", "needs_review", "confirmed", "failed"]),
  transactionDate: z.string(),
  vendorName: z.string(),
  businessNumber: z.string().optional(),
  description: z.string(),
  totalAmount: z.number(),
  supplyAmount: z.number().optional(),
  vatAmount: z.number().optional(),
  vatStatus: z.enum(["confirmed", "missing", "estimated"]),
  category: z.enum([
    "소모품비",
    "여비교통비",
    "접대비",
    "통신비",
    "지급수수료",
    "광고선전비",
    "차량유지비",
    "기타경비",
  ]),
  proofType: z.enum(["카드영수증", "현금영수증", "세금계산서", "간이영수증", "기타"]),
  confidence: z.number().optional(),
  memo: z.string().optional(),
  originalFileName: z.string().optional(),
  createdAt: z.string(),
});

const requestSchema = z.object({
  totalIncomeAmount: z.number().nonnegative(),
  entries: z.array(ledgerEntrySchema).min(1),
});

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const buffer = await exportTaxPrepToWorkbookBuffer(payload);

    return new NextResponse(new Blob([new Uint8Array(buffer)]), {
      headers: {
        "Content-Disposition": `attachment; filename="${TAX_PREP_FILE_NAME}"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    return errorResponse(
      error instanceof Error
        ? error.message
        : "신고 준비 문서 초안을 만드는 중 알 수 없는 오류가 발생했습니다.",
    );
  }
}
