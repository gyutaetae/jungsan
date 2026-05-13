import { NextResponse } from "next/server";
import { importTransactionsFromWorkbook } from "../../../lib/excel/importTransactions";

export const runtime = "nodejs";

const MAX_SPREADSHEET_BYTES = 5 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = [".xlsx", ".csv"];

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isSupportedFileName(fileName: string) {
  const normalizedFileName = fileName.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((extension) =>
    normalizedFileName.endsWith(extension),
  );
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return errorResponse("xlsx 또는 csv 파일을 file 필드로 업로드해주세요.");
    }

    if (!isSupportedFileName(file.name)) {
      return errorResponse("xlsx 또는 csv 파일만 업로드할 수 있습니다.");
    }

    if (file.size > MAX_SPREADSHEET_BYTES) {
      return errorResponse("거래내역 파일은 5MB 이하만 업로드할 수 있습니다.");
    }

    const entries = importTransactionsFromWorkbook(
      Buffer.from(await file.arrayBuffer()),
      file.name,
    );

    return NextResponse.json(entries);
  } catch (error) {
    return errorResponse(
      error instanceof Error
        ? error.message
        : "거래내역 파일을 읽는 중 알 수 없는 오류가 발생했습니다.",
    );
  }
}
