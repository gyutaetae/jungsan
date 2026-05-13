import { NextResponse } from "next/server";
import { extractReceipt } from "../../../lib/ai/extractReceipt";
import { createId } from "../../../lib/utils/ids";
import type { LedgerEntry } from "../../../types/ledger";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return errorResponse("이미지 파일 1장을 file 필드로 업로드해주세요.");
    }

    if (!file.type.startsWith("image/")) {
      return errorResponse("이미지 파일만 업로드할 수 있습니다.");
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return errorResponse("이미지는 10MB 이하만 업로드할 수 있습니다.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extracted = await extractReceipt({
      fileName: file.name,
      mimeType: file.type,
      base64Image: buffer.toString("base64"),
    });

    const entry: LedgerEntry = {
      ...extracted,
      id: createId("receipt"),
      originalFileName: file.name,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(entry);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "영수증 분석 중 알 수 없는 오류가 발생했습니다.";

    return errorResponse(message, message.includes("OPENAI_API_KEY") ? 503 : 502);
  }
}
