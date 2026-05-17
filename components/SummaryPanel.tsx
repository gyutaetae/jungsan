import type { ExpenseSummary, TaxPrepSummary } from "../types/ledger";
import { EXPENSE_CATEGORIES } from "../lib/ledger/categories";
import { formatMoney } from "../lib/utils/money";
import type { ExpenseCategory } from "../types/ledger";
import type { Language } from "../types/ui";

type SummaryPanelProps = {
  summary: ExpenseSummary;
  taxPrepSummary: TaxPrepSummary;
  totalIncomeAmount: number;
  onTotalIncomeAmountChange: (value: number) => void;
  onDownloadTaxPrep: () => void;
  entryCount: number;
  language: Language;
};

const copy = {
  ko: {
    title: "필요경비 요약",
    total: "총 금액",
    supply: "공급가액",
    vat: "부가세",
    needsReview: "확인 필요",
    done: "완료",
    count: (count: number) => `${count}건`,
    byCategory: "계정과목별 합계",
    hometax: "홈택스 입력용 요약",
    income: "총수입금액",
    expense: "필요경비",
    expectedIncome: "예상 소득금액",
    reviewItems: "확인 필요 항목",
    document: "신고 준비 문서",
    documentHelp: "공식 서식을 기준으로 만든 검토용 초안입니다. 홈택스 제출 전 확인이 필요합니다.",
    download: "신고 준비 문서 다운로드",
  },
  en: {
    title: "Expense summary",
    total: "Total amount",
    supply: "Supply amount",
    vat: "VAT",
    needsReview: "Needs review",
    done: "Done",
    count: (count: number) => `${count}`,
    byCategory: "By category",
    hometax: "Hometax input summary",
    income: "Total income",
    expense: "Expenses",
    expectedIncome: "Estimated income",
    reviewItems: "Needs review",
    document: "Tax prep document",
    documentHelp: "A review draft based on official form fields. Check it before entering data in Hometax.",
    download: "Download tax prep draft",
  },
} satisfies Record<
  Language,
  Record<string, string | ((count: number) => string)>
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

export function SummaryPanel({
  summary,
  taxPrepSummary,
  totalIncomeAmount,
  onTotalIncomeAmountChange,
  onDownloadTaxPrep,
  entryCount,
  language,
}: SummaryPanelProps) {
  const t = copy[language];
  const count = t.count as (count: number) => string;

  function handleTotalIncomeAmountChange(value: string) {
    const nextValue = Number(value);
    onTotalIncomeAmountChange(
      Number.isFinite(nextValue) ? Math.max(0, nextValue) : 0,
    );
  }

  return (
    <aside className="w-full rounded-lg border border-stone-200 bg-white p-5 shadow-soft dark:border-stone-800 dark:bg-stone-950">
      <h2 className="text-lg font-semibold text-stone-950 dark:text-stone-50">
        {t.title as string}
      </h2>
      <dl className="mt-5 space-y-4 text-sm">
        <SummaryRow label={t.total as string} value={formatMoney(summary.totalAmount)} />
        <SummaryRow
          label={t.supply as string}
          value={formatMoney(summary.supplyAmount)}
        />
        <SummaryRow label={t.vat as string} value={formatMoney(summary.vatAmount)} />
        <SummaryRow
          label={t.needsReview as string}
          value={count(summary.needsReviewCount)}
          accent
        />
        <SummaryRow label={t.done as string} value={count(summary.confirmedCount)} />
      </dl>

      <div className="mt-6 border-t border-stone-200 pt-4 dark:border-stone-800">
        <h3 className="text-sm font-semibold text-stone-950 dark:text-stone-50">
          {t.byCategory as string}
        </h3>
        <dl className="mt-3 space-y-2 text-sm">
          {EXPENSE_CATEGORIES.map((category) => (
            <SummaryRow
              key={category}
              label={categoryLabels[language][category]}
              value={formatMoney(summary.byCategory[category])}
              compact
            />
          ))}
        </dl>
      </div>

      <div className="mt-6 border-t border-stone-200 pt-4 dark:border-stone-800">
        <h3 className="text-sm font-semibold text-stone-950 dark:text-stone-50">
          {t.hometax as string}
        </h3>

        <label className="mt-4 block text-sm">
          <span className="font-medium text-stone-700 dark:text-stone-300">
            {t.income as string}
          </span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={totalIncomeAmount}
            onChange={(event) =>
              handleTotalIncomeAmountChange(event.currentTarget.value)
            }
            className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-right text-sm font-semibold text-stone-950 outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          />
        </label>

        <dl className="mt-4 space-y-2 text-sm">
          <SummaryRow
            label={t.expense as string}
            value={formatMoney(taxPrepSummary.totalExpenseAmount)}
            compact
          />
          <SummaryRow
            label={t.expectedIncome as string}
            value={formatMoney(taxPrepSummary.estimatedIncomeAmount)}
            accent
            compact
          />
          <SummaryRow
            label={t.reviewItems as string}
            value={count(taxPrepSummary.needsReviewCount)}
            compact
          />
        </dl>
      </div>

      <div className="mt-6 border-t border-stone-200 pt-4 dark:border-stone-800">
        <h3 className="text-sm font-semibold text-stone-950 dark:text-stone-50">
          {t.document as string}
        </h3>
        <p className="mt-3 text-xs leading-5 text-stone-500 dark:text-stone-400">
          {t.documentHelp as string}
        </p>
        <button
          type="button"
          onClick={onDownloadTaxPrep}
          disabled={entryCount === 0}
          className="mt-4 w-full rounded-md bg-accent-500 px-4 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500"
        >
          {t.download as string}
        </button>
      </div>
    </aside>
  );
}

function SummaryRow({
  label,
  value,
  accent = false,
  compact = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className={compact ? "min-w-0 text-xs text-stone-500 dark:text-stone-400" : "min-w-0 text-stone-500 dark:text-stone-400"}>
        {label}
      </dt>
      <dd
        className={
          accent
            ? "shrink-0 text-right font-semibold text-accent-700 dark:text-accent-300"
            : "shrink-0 text-right font-semibold text-stone-900 dark:text-stone-100"
        }
      >
        {value}
      </dd>
    </div>
  );
}
