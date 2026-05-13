import { TableProperties } from "lucide-react";
import {
  EXPENSE_CATEGORIES,
  ledgerStatusLabels,
  LEDGER_STATUSES,
  PROOF_TYPES,
} from "../lib/ledger/categories";
import { parseMoneyInput } from "../lib/utils/money";
import type { LedgerEntry } from "../types/ledger";

type ReviewTableProps = {
  entries: LedgerEntry[];
  onUpdateEntry: (id: string, patch: Partial<LedgerEntry>) => void;
};

const inputClass =
  "h-9 w-full rounded-md border border-stone-200 bg-white px-2 text-sm text-stone-800 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100";

function moneyInputValue(value?: number) {
  return typeof value === "number" ? String(value) : "";
}

export function ReviewTable({ entries, onUpdateEntry }: ReviewTableProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <TableProperties
            className="text-accent-600"
            size={22}
            aria-hidden="true"
          />
          <h2 className="text-lg font-semibold text-stone-950">검토 테이블</h2>
        </div>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
          {entries.length}개 항목
        </span>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-[1120px] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold text-stone-500">
              <th className="border-b border-stone-200 pb-2 pr-2">거래일</th>
              <th className="border-b border-stone-200 pb-2 pr-2">거래처</th>
              <th className="border-b border-stone-200 pb-2 pr-2">메모</th>
              <th className="border-b border-stone-200 pb-2 pr-2">금액</th>
              <th className="border-b border-stone-200 pb-2 pr-2">공급가액</th>
              <th className="border-b border-stone-200 pb-2 pr-2">부가세</th>
              <th className="border-b border-stone-200 pb-2 pr-2">계정과목</th>
              <th className="border-b border-stone-200 pb-2 pr-2">증빙유형</th>
              <th className="border-b border-stone-200 pb-2">상태</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="border-b border-stone-100 py-3 pr-2">
                  <input
                    type="date"
                    value={entry.transactionDate}
                    onChange={(event) =>
                      onUpdateEntry(entry.id, {
                        transactionDate: event.currentTarget.value,
                      })
                    }
                    className={inputClass}
                  />
                </td>
                <td className="border-b border-stone-100 py-3 pr-2">
                  <input
                    value={entry.vendorName}
                    onChange={(event) =>
                      onUpdateEntry(entry.id, {
                        vendorName: event.currentTarget.value,
                      })
                    }
                    className={inputClass}
                  />
                </td>
                <td className="border-b border-stone-100 py-3 pr-2">
                  <input
                    value={entry.memo ?? ""}
                    onChange={(event) =>
                      onUpdateEntry(entry.id, {
                        memo: event.currentTarget.value,
                      })
                    }
                    className={inputClass}
                  />
                </td>
                <td className="border-b border-stone-100 py-3 pr-2">
                  <input
                    inputMode="numeric"
                    value={moneyInputValue(entry.totalAmount)}
                    onChange={(event) =>
                      onUpdateEntry(entry.id, {
                        totalAmount:
                          parseMoneyInput(event.currentTarget.value) ?? 0,
                      })
                    }
                    className={inputClass}
                  />
                </td>
                <td className="border-b border-stone-100 py-3 pr-2">
                  <input
                    inputMode="numeric"
                    value={moneyInputValue(entry.supplyAmount)}
                    onChange={(event) =>
                      onUpdateEntry(entry.id, {
                        supplyAmount: parseMoneyInput(
                          event.currentTarget.value,
                        ),
                      })
                    }
                    className={inputClass}
                  />
                </td>
                <td className="border-b border-stone-100 py-3 pr-2">
                  <input
                    inputMode="numeric"
                    value={moneyInputValue(entry.vatAmount)}
                    onChange={(event) =>
                      onUpdateEntry(entry.id, {
                        vatAmount: parseMoneyInput(event.currentTarget.value),
                      })
                    }
                    className={inputClass}
                  />
                </td>
                <td className="border-b border-stone-100 py-3 pr-2">
                  <select
                    value={entry.category}
                    onChange={(event) =>
                      onUpdateEntry(entry.id, {
                        category: event.currentTarget.value as LedgerEntry["category"],
                      })
                    }
                    className={inputClass}
                  >
                    {EXPENSE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border-b border-stone-100 py-3 pr-2">
                  <select
                    value={entry.proofType}
                    onChange={(event) =>
                      onUpdateEntry(entry.id, {
                        proofType: event.currentTarget.value as LedgerEntry["proofType"],
                      })
                    }
                    className={inputClass}
                  >
                    {PROOF_TYPES.map((proofType) => (
                      <option key={proofType} value={proofType}>
                        {proofType}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border-b border-stone-100 py-3">
                  <select
                    value={entry.status}
                    onChange={(event) =>
                      onUpdateEntry(entry.id, {
                        status: event.currentTarget.value as LedgerEntry["status"],
                      })
                    }
                    className={inputClass}
                  >
                    {LEDGER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {ledgerStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
