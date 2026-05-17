import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { calculateTaxPrepSummary } from "../taxPrep/summary";
import type { Database } from "../../types/database";
import type { LedgerEntry } from "../../types/ledger";

const DEMO_EMAIL = process.env.SUPABASE_DEMO_EMAIL ?? "demo@jungsan.local";
const DEMO_BUSINESS_NAME =
  process.env.SUPABASE_DEMO_BUSINESS_NAME ?? "정산 데모 사업자";
const DEMO_TAX_YEAR = Number(process.env.SUPABASE_DEMO_TAX_YEAR ?? "2026");

export function hasSupabaseServerConfig() {
  return Boolean(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function createServerSupabaseClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function ensureDemoBusiness() {
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase server config is missing.");
  }

  const userId = await ensureDemoUser(supabase);

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    email: DEMO_EMAIL,
    display_name: "정산 데모",
  });

  if (profileError) {
    throw profileError;
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .upsert(
      {
        owner_id: userId,
        business_name: DEMO_BUSINESS_NAME,
        tax_year: DEMO_TAX_YEAR,
      },
      {
        onConflict: "owner_id,business_name,tax_year",
      },
    )
    .select("id")
    .single();

  if (businessError) {
    throw businessError;
  }

  return {
    businessId: business.id,
    taxYear: DEMO_TAX_YEAR,
  };
}

async function ensureDemoUser(
  supabase: SupabaseClient,
) {
  const existingUserId = await findUserIdByEmail(supabase, DEMO_EMAIL);

  if (existingUserId) {
    return existingUserId;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    email_confirm: true,
    user_metadata: {
      app: "jungsan",
      purpose: "database-class-demo",
    },
  });

  if (error) {
    const fallbackUserId = await findUserIdByEmail(supabase, DEMO_EMAIL);

    if (fallbackUserId) {
      return fallbackUserId;
    }

    throw error;
  }

  return data.user.id;
}

async function findUserIdByEmail(
  supabase: SupabaseClient,
  email: string,
) {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw error;
  }

  return data.users.find((user) => user.email === email)?.id ?? null;
}

export function toLedgerEntryRow(
  entry: LedgerEntry,
  businessId: string,
): Database["public"]["Tables"]["ledger_entries"]["Insert"] {
  return {
    business_id: businessId,
    source: entry.source,
    status: entry.status,
    transaction_date: entry.transactionDate,
    vendor_name: entry.vendorName,
    business_number: entry.businessNumber ?? null,
    description: entry.description,
    total_amount: entry.totalAmount,
    supply_amount: entry.supplyAmount ?? null,
    vat_amount: entry.vatAmount ?? null,
    vat_status: entry.vatStatus,
    category: entry.category,
    proof_type: entry.proofType,
    confidence: entry.confidence ?? null,
    memo: entry.memo ?? null,
    original_file_name: entry.originalFileName ?? null,
    created_at: entry.createdAt,
  };
}

export function fromLedgerEntryRow(
  row: Database["public"]["Tables"]["ledger_entries"]["Row"],
): LedgerEntry {
  return {
    id: row.id,
    source: row.source,
    status: row.status,
    transactionDate: row.transaction_date,
    vendorName: row.vendor_name,
    businessNumber: row.business_number ?? undefined,
    description: row.description,
    totalAmount: Number(row.total_amount),
    supplyAmount:
      row.supply_amount === null ? undefined : Number(row.supply_amount),
    vatAmount: row.vat_amount === null ? undefined : Number(row.vat_amount),
    vatStatus: row.vat_status,
    category: row.category,
    proofType: row.proof_type,
    confidence: row.confidence === null ? undefined : Number(row.confidence),
    memo: row.memo ?? undefined,
    originalFileName: row.original_file_name ?? undefined,
    createdAt: row.created_at,
  };
}

export function toTaxPrepSummaryRow(
  businessId: string,
  taxYear: number,
  totalIncomeAmount: number,
  entries: LedgerEntry[],
): Database["public"]["Tables"]["tax_prep_summaries"]["Insert"] {
  const summary = calculateTaxPrepSummary(totalIncomeAmount, entries);

  return {
    business_id: businessId,
    tax_year: taxYear,
    total_income_amount: summary.totalIncomeAmount,
    total_expense_amount: summary.totalExpenseAmount,
    supply_amount: summary.supplyAmount,
    vat_amount: summary.vatAmount,
    needs_review_count: summary.needsReviewCount,
  };
}
