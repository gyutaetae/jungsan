import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createServerSupabaseClient,
  ensureDemoBusiness,
  fromLedgerEntryRow,
  hasSupabaseServerConfig,
  toLedgerEntryRow,
  toTaxPrepSummaryRow,
} from "../../../../lib/db/server";
import type { Database } from "../../../../types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ledgerEntrySchema = z.object({
  id: z.string(),
  source: z.enum(["receipt", "spreadsheet", "camera", "sample"]),
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

const saveRequestSchema = z.object({
  entries: z.array(ledgerEntrySchema),
  totalIncomeAmount: z.number().min(0).default(0),
});

function missingConfigResponse() {
  return NextResponse.json(
    {
      error:
        "Supabase 연결 정보가 없습니다. SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY를 설정하세요.",
    },
    { status: 503 },
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const record = error as {
      message?: unknown;
      details?: unknown;
      code?: unknown;
    };
    const parts = [record.message, record.details, record.code].filter(
      (part): part is string => typeof part === "string" && part.length > 0,
    );

    if (parts.length > 0) {
      return parts.join(" ");
    }
  }

  return fallback;
}

export async function GET() {
  if (!hasSupabaseServerConfig()) {
    return missingConfigResponse();
  }

  try {
    const supabase = createServerSupabaseClient();

    if (!supabase) {
      return missingConfigResponse();
    }

    const { businessId, taxYear } = await ensureDemoBusiness();

    const [entries, summary] = await Promise.all([
      fetchSupabaseRows("ledger_entries", {
        select: "*",
        business_id: `eq.${businessId}`,
        order: "transaction_date.desc,created_at.desc",
      }),
      fetchSupabaseRows("tax_prep_summaries", {
        select: "*",
        business_id: `eq.${businessId}`,
        tax_year: `eq.${taxYear}`,
        limit: "1",
      }),
    ]);

    const savedSummary = summary[0] as
      | { total_income_amount: number | string | null }
      | undefined;

    return NextResponse.json({
      entries: (entries as LedgerEntryRows).map(fromLedgerEntryRow),
      totalIncomeAmount: Number(savedSummary?.total_income_amount ?? 0),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          getErrorMessage(error, "Supabase에서 장부를 불러오지 못했습니다."),
      },
      { status: 500 },
    );
  }
}

async function fetchSupabaseRows(
  tableName: string,
  params: Record<string, string>,
) {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase server config is missing.");
  }

  const url = new URL(`/rest/v1/${tableName}`, supabaseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as DatabaseRows;
}

type DatabaseRows = Array<Record<string, unknown>>;
type LedgerEntryRows = Array<Database["public"]["Tables"]["ledger_entries"]["Row"]>;

export async function PUT(request: Request) {
  if (!hasSupabaseServerConfig()) {
    return missingConfigResponse();
  }

  try {
    const payload = saveRequestSchema.parse(await request.json());
    const supabase = createServerSupabaseClient();

    if (!supabase) {
      return missingConfigResponse();
    }

    const { businessId, taxYear } = await ensureDemoBusiness();

    const { error: deleteError } = await supabase
      .from("ledger_entries")
      .delete()
      .eq("business_id", businessId);

    if (deleteError) {
      throw deleteError;
    }

    if (payload.entries.length > 0) {
      const { error: insertError } = await supabase
        .from("ledger_entries")
        .insert(
          payload.entries.map((entry) => toLedgerEntryRow(entry, businessId)),
        );

      if (insertError) {
        throw insertError;
      }
    }

    const { error: summaryError } = await supabase
      .from("tax_prep_summaries")
      .upsert(toTaxPrepSummaryRow(
        businessId,
        taxYear,
        payload.totalIncomeAmount,
        payload.entries,
      ), {
        onConflict: "business_id,tax_year",
      });

    if (summaryError) {
      throw summaryError;
    }

    return NextResponse.json({
      saved: true,
      entryCount: payload.entries.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          getErrorMessage(error, "Supabase에 장부를 저장하지 못했습니다."),
      },
      { status: 500 },
    );
  }
}
