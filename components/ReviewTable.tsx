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

const baseInputClass =
  "w-full rounded-md border border-stone-200 bg-white px-2 text-sm text-stone-800 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100";
const inputClass = `h-9 ${baseInputClass}`;
const textareaClass = `h-[108px] resize-none py-2 ${baseInputClass}`;

const copy = {
  ko: {
    title: "검토 테이블",
    count: (count: number) => `${count}개 항목`,
    headers: ["기본 정보", "분류", "결제 금액", "메모", "상태"],
    placeholders: {
      vendor: "거래처명",
      supply: "공급가액",
      vat: "부가세",
      memo: "메모",
    },
    labels: {
      date: "거래일",
      vendor: "거래처명",
      category: "계정과목",
      proof: "증빙유형",
      total: "총 금액",
      supply: "공급가액",
      vat: "부가세",
      memo: "메모",
    },
    confirm: "확인",
    done: "완료",
  },
  en: {
    title: "Review table",
    count: (count: number) => `${count} items`,
    headers: ["Info", "Class.", "Amount", "Memo", "Status"],
    placeholders: {
      vendor: "Vendor",
      supply: "Supply",
      vat: "VAT",
      memo: "Memo",
    },
    labels: {
      date: "Date",
      vendor: "Vendor",
      category: "Category",
      proof: "Proof",
      total: "Total",
      supply: "Supply",
      vat: "VAT",
      memo: "Memo",
    },
    confirm: "Confirm",
    done: "Done",
  },
} satisfies Record<
  Language,
  {
    title: string;
    count: (count: number) => string;
    headers: string[];
    placeholders: {
      vendor: string;
      supply: string;
      vat: string;
      memo: string;
    };
    labels: {
      date: string;
      vendor: string;
      category: string;
      proof: string;
      total: string;
      supply: string;
      vat: string;
      memo: string;
    };
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
    <section className="min-w-0 overflow-hidden rounded-lg border border-stone-200 bg-white p-3 shadow-soft dark:border-stone-800 dark:bg-stone-950 sm:p-5">
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

      <div className="mt-5 max-w-full overflow-x-auto overscroll-x-contain">
        <table className="w-full min-w-[632px] table-fixed border-separate border-spacing-0 text-left text-sm sm:min-w-[680px]">
          <thead>
            <tr className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {t.headers.map((header, index) => {
                const isFirst = index === 0;
                const isLast = index === t.headers.length - 1;
                let stickyClasses = "";
                if (isFirst) {
                  stickyClasses = "w-40 bg-white dark:bg-stone-950 sm:sticky sm:left-0 sm:z-20";
                } else if (isLast) {
                  stickyClasses = "sticky right-0 z-20 w-20 bg-white pl-2 text-center dark:bg-stone-950 sm:w-28";
                }
                return (
                  <th
                    key={header}
                    className={`border-b border-stone-200 pb-2 pr-2 dark:border-stone-800 ${stickyClasses}`}
                  >
                    {header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => {
              const isStriped = index % 2 === 1;
              const rowBg = isStriped ? "bg-stone-50 dark:bg-stone-800/40" : "bg-white dark:bg-stone-950";
              return (
              <tr key={entry.id} className={rowBg}>
                <td className={`w-40 border-b border-stone-100 py-3 pr-2 align-top dark:border-stone-900 sm:sticky sm:left-0 sm:z-10 ${rowBg}`}>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-stone-500 dark:text-stone-400">
                        {t.labels.date}
                      </label>
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
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-stone-500 dark:text-stone-400">
                        {t.labels.vendor}
                      </label>
                      <input
                        value={entry.vendorName}
                        placeholder={t.placeholders.vendor}
                        onChange={(event) =>
                          onUpdateEntry(entry.id, {
                            vendorName: event.currentTarget.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                </td>
                <td className="w-32 border-b border-stone-100 py-3 pr-2 align-top dark:border-stone-900">
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-stone-500 dark:text-stone-400">
                        {t.labels.category}
                      </label>
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
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-stone-500 dark:text-stone-400">
                        {t.labels.proof}
                      </label>
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
                    </div>
                  </div>
                </td>
                <td className="w-48 border-b border-stone-100 py-3 pr-2 align-top dark:border-stone-900">
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-stone-500 dark:text-stone-400">
                        {t.labels.total}
                      </label>
                      <input
                        inputMode="numeric"
                        value={moneyInputValue(entry.totalAmount)}
                        onChange={(event) =>
                          onUpdateEntry(entry.id, {
                            totalAmount:
                              parseMoneyInput(event.currentTarget.value) ?? 0,
                          })
                        }
                        className={`${inputClass} font-semibold text-stone-950 dark:text-white`}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="mb-1 block text-[11px] font-medium text-stone-500 dark:text-stone-400">
                          {t.labels.supply}
                        </label>
                        <input
                          inputMode="numeric"
                          placeholder={t.placeholders.supply}
                          value={moneyInputValue(entry.supplyAmount)}
                          onChange={(event) =>
                            onUpdateEntry(entry.id, {
                              supplyAmount: parseMoneyInput(
                                event.currentTarget.value,
                              ),
                            })
                          }
                          className={`${inputClass} text-xs`}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block text-[11px] font-medium text-stone-500 dark:text-stone-400">
                          {t.labels.vat}
                        </label>
                        <input
                          inputMode="numeric"
                          placeholder={t.placeholders.vat}
                          value={moneyInputValue(entry.vatAmount)}
                          onChange={(event) =>
                            onUpdateEntry(entry.id, {
                              vatAmount: parseMoneyInput(event.currentTarget.value),
                            })
                          }
                          className={`${inputClass} text-xs`}
                        />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="w-28 border-b border-stone-100 py-3 pr-2 align-top dark:border-stone-900">
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-stone-500 dark:text-stone-400">
                        {t.labels.memo}
                      </label>
                      <textarea
                        value={entry.memo ?? ""}
                        placeholder={t.placeholders.memo}
                        onChange={(event) =>
                          onUpdateEntry(entry.id, {
                            memo: event.currentTarget.value,
                          })
                        }
                        className={textareaClass}
                      />
                    </div>
                  </div>
                </td>
                <td className={`sticky right-0 z-10 w-20 border-b border-stone-100 py-3 pl-2 align-middle dark:border-stone-900 sm:w-28 ${rowBg}`}>
                  {entry.status === "confirmed" ? (
                    <span className="inline-flex h-9 min-w-16 items-center justify-center gap-1 whitespace-nowrap rounded-md border border-accent-300 bg-accent-100 px-2 text-xs font-semibold text-accent-800 dark:border-accent-500 dark:bg-accent-400 dark:text-stone-950 sm:min-w-24 sm:gap-1.5 sm:px-3 sm:text-sm">
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
                      className="inline-flex h-9 min-w-16 items-center justify-center gap-1 whitespace-nowrap rounded-md bg-red-500 px-2 text-xs font-semibold text-white shadow-soft transition hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 sm:min-w-24 sm:gap-1.5 sm:px-3 sm:text-sm"
                    >
                      <Check size={16} aria-hidden="true" />
                      {t.confirm}
                    </button>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
