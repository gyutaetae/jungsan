import type { LedgerEntry, TaxPrepSummary } from "../../types/ledger";
import { EXPENSE_CATEGORIES, PROOF_TYPES } from "../ledger/categories";

export function calculateTaxPrepSummary(
  totalIncomeAmount: number,
  entries: LedgerEntry[],
): TaxPrepSummary {
  const normalizedIncomeAmount = Number.isFinite(totalIncomeAmount)
    ? totalIncomeAmount
    : 0;

  const byCategory = Object.fromEntries(
    EXPENSE_CATEGORIES.map((category) => [category, 0]),
  ) as TaxPrepSummary["byCategory"];

  const byProofType = Object.fromEntries(
    PROOF_TYPES.map((proofType) => [proofType, 0]),
  ) as TaxPrepSummary["byProofType"];

  return entries.reduce<TaxPrepSummary>(
    (summary, entry) => {
      summary.totalExpenseAmount += entry.totalAmount;
      summary.estimatedIncomeAmount =
        summary.totalIncomeAmount - summary.totalExpenseAmount;
      summary.supplyAmount += entry.supplyAmount ?? 0;
      summary.vatAmount += entry.vatAmount ?? 0;
      summary.byCategory[entry.category] += entry.totalAmount;
      summary.byProofType[entry.proofType] += entry.totalAmount;

      if (entry.status === "needs_review" || entry.vatStatus !== "confirmed") {
        summary.reviewItems.push(entry);
        summary.needsReviewCount += 1;
      }

      return summary;
    },
    {
      totalIncomeAmount: normalizedIncomeAmount,
      totalExpenseAmount: 0,
      estimatedIncomeAmount: normalizedIncomeAmount,
      supplyAmount: 0,
      vatAmount: 0,
      needsReviewCount: 0,
      byCategory,
      byProofType,
      reviewItems: [],
    },
  );
}
