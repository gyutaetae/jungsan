import { Check, TableProperties } from "lucide-react";
import { EXPENSE_CATEGORIES, PROOF_TYPES } from "../lib/ledger/categories";
import { parseMoneyInput } from "../lib/utils/money";
import type { LedgerEntry } from "../types/ledger";
import type { ExpenseCategory, ProofType } from "../types/ledger";
import type { Language } from "../types/ui";

type ReviewTableProps = {
  entries: LedgerEntry[];
  onUpdateEntry: (id: string, patch: Partial<LedgerEntry>) => void;
  language: Language;
};

const inputClass =
  "h-9 w-full rounded-md border border-stone-200 bg-white px-2 text-sm text-stone-800 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100";

const copy = {
  ko: {
    title: "검토 테이블",
    count: (count: number) => `${count}개 항목`,
    headers: ["거래일", "거래처", "메모", "금액", "공급가액", "부가세", "계정과목", "증빙유형", "상태"],
    confirm: "확인",
    done: "완료",
  },
  en: {
    title: "Review table",
    count: (count: number) => `${count} items`,
    headers: ["Date", "Vendor", "Memo", "Amount", "Supply", "VAT", "Category", "Proof", "Status"],
    confirm: "Confirm",
    done: "Done",
  },
} satisfies Record<
  Language,
  {
    title: string;
    count: (count: number) => string;
    headers: string[];
    confirm: string;
    done: string;
  }
>;

const categoryLabels: Record<Language, Record<ExpenseCategory, string>> = {
  ko: {
    소모품비: "소모품비",
    여비교통비: "여비교통비",
    접대비: "접대비",
    통신비: "통신비",
    지급수수료: "지급수수료",
    광고선전비: "광고선전비",
    차량유지비: "차량유지비",
    기타경비: "기타경비",
  },
  en: {
    소모품비: "Supplies",
    여비교통비: "Travel",
    접대비: "Client meals",
    통신비: "Telecom",
    지급수수료: "Fees",
    광고선전비: "Ads",
    차량유지비: "Vehicle",
    기타경비: "Other",
  },
};

const proofLabels: Record<Language, Record<ProofType, string>> = {
  ko: {
    카드영수증: "카드영수증",
    현금영수증: "현금영수증",
    세금계산서: "세금계산서",
    간이영수증: "간이영수증",
    기타: "기타",
  },
  en: {
    카드영수증: "Card receipt",
    현금영수증: "Cash receipt",
    세금계산서: "Tax invoice",
    간이영수증: "Simple receipt",
    기타: "Other",
  },
};

function moneyInputValue(value?: number) {
  return typeof value === "number" ? String(value) : "";
}

export function ReviewTable({
  entries,
  onUpdateEntry,
  language,
}: ReviewTableProps) {
  const t = copy[language];

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft dark:border-stone-800 dark:bg-stone-950">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <TableProperties
            className="text-accent-600"
            size={22}
            aria-hidden="true"
          />
          <h2 className="text-lg font-semibold text-stone-950 dark:text-stone-50">
            {t.title}
          </h2>
        </div>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 dark:bg-stone-900 dark:text-stone-300">
          {t.count(entries.length)}
        </span>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-[1260px] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {t.headers.map((header) => (
                <th
                  key={header}
                  className="border-b border-stone-200 pb-2 pr-2 dark:border-stone-800"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="border-b border-stone-100 py-3 pr-2 dark:border-stone-900">
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
                <td className="border-b border-stone-100 py-3 pr-2 dark:border-stone-900">
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
                <td className="border-b border-stone-100 py-3 pr-2 dark:border-stone-900">
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
                <td className="border-b border-stone-100 py-3 pr-2 dark:border-stone-900">
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
                <td className="border-b border-stone-100 py-3 pr-2 dark:border-stone-900">
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
                <td className="border-b border-stone-100 py-3 pr-2 dark:border-stone-900">
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
                <td className="border-b border-stone-100 py-3 pr-2 dark:border-stone-900">
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
                        {categoryLabels[language][category]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border-b border-stone-100 py-3 pr-2 dark:border-stone-900">
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
                        {proofLabels[language][proofType]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="w-28 border-b border-stone-100 py-3 dark:border-stone-900">
                  {entry.status === "confirmed" ? (
                    <span className="inline-flex h-9 min-w-24 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-accent-300 bg-accent-100 px-3 text-sm font-semibold text-accent-800 dark:border-accent-500 dark:bg-accent-400 dark:text-stone-950">
                      <Check size={16} aria-hidden="true" />
                      {t.done}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateEntry(entry.id, {
                          status: "confirmed",
                        })
                      }
                      className="inline-flex h-9 min-w-24 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-red-500 px-3 text-sm font-semibold text-white shadow-soft transition hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                    >
                      <Check size={16} aria-hidden="true" />
                      {t.confirm}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
