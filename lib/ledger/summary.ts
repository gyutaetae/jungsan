import type { ExpenseSummary, LedgerEntry } from "../../types/ledger";
import { EXPENSE_CATEGORIES } from "./categories";

export function calculateExpenseSummary(entries: LedgerEntry[]): ExpenseSummary {
  const byCategory = Object.fromEntries(
    EXPENSE_CATEGORIES.map((category) => [category, 0]),
  ) as ExpenseSummary["byCategory"];

  return entries.reduce<ExpenseSummary>(
    (summary, entry) => {
      summary.totalAmount += entry.totalAmount;
      summary.supplyAmount += entry.supplyAmount ?? 0;
      summary.vatAmount += entry.vatAmount ?? 0;
      summary.byCategory[entry.category] += entry.totalAmount;

      if (entry.status === "needs_review") {
        summary.needsReviewCount += 1;
      }

      if (entry.status === "confirmed") {
        summary.confirmedCount += 1;
      }

      return summary;
    },
    {
      totalAmount: 0,
      supplyAmount: 0,
      vatAmount: 0,
      needsReviewCount: 0,
      confirmedCount: 0,
      byCategory,
    },
  );
}
