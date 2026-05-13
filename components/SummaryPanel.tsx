import type { ExpenseSummary, TaxPrepSummary } from "../types/ledger";
import { EXPENSE_CATEGORIES } from "../lib/ledger/categories";
import { formatMoney } from "../lib/utils/money";

type SummaryPanelProps = {
  summary: ExpenseSummary;
  taxPrepSummary: TaxPrepSummary;
  totalIncomeAmount: number;
  onTotalIncomeAmountChange: (value: number) => void;
  onDownloadTaxPrep: () => void;
  entryCount: number;
};

export function SummaryPanel({
  summary,
  taxPrepSummary,
  totalIncomeAmount,
  onTotalIncomeAmountChange,
  onDownloadTaxPrep,
  entryCount,
}: SummaryPanelProps) {
  function handleTotalIncomeAmountChange(value: string) {
    const nextValue = Number(value);
    onTotalIncomeAmountChange(
      Number.isFinite(nextValue) ? Math.max(0, nextValue) : 0,
    );
  }

  return (
    <aside className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
      <h2 className="text-lg font-semibold text-stone-950">필요경비 요약</h2>
      <dl className="mt-5 space-y-4 text-sm">
        <SummaryRow label="총 금액" value={formatMoney(summary.totalAmount)} />
        <SummaryRow
          label="공급가액"
          value={formatMoney(summary.supplyAmount)}
        />
        <SummaryRow label="부가세" value={formatMoney(summary.vatAmount)} />
        <SummaryRow
          label="확인 필요"
          value={`${summary.needsReviewCount}건`}
          accent
        />
        <SummaryRow label="완료" value={`${summary.confirmedCount}건`} />
      </dl>

      <div className="mt-6 border-t border-stone-200 pt-4">
        <h3 className="text-sm font-semibold text-stone-950">계정과목별 합계</h3>
        <dl className="mt-3 space-y-2 text-sm">
          {EXPENSE_CATEGORIES.map((category) => (
            <SummaryRow
              key={category}
              label={category}
              value={formatMoney(summary.byCategory[category])}
              compact
            />
          ))}
        </dl>
      </div>

      <div className="mt-6 border-t border-stone-200 pt-4">
        <h3 className="text-sm font-semibold text-stone-950">
          홈택스 입력용 요약
        </h3>

        <label className="mt-4 block text-sm">
          <span className="font-medium text-stone-700">총수입금액</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={totalIncomeAmount}
            onChange={(event) =>
              handleTotalIncomeAmountChange(event.currentTarget.value)
            }
            className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-right text-sm font-semibold text-stone-950 outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
          />
        </label>

        <dl className="mt-4 space-y-2 text-sm">
          <SummaryRow
            label="필요경비"
            value={formatMoney(taxPrepSummary.totalExpenseAmount)}
            compact
          />
          <SummaryRow
            label="예상 소득금액"
            value={formatMoney(taxPrepSummary.estimatedIncomeAmount)}
            accent
            compact
          />
          <SummaryRow
            label="확인 필요 항목"
            value={`${taxPrepSummary.needsReviewCount}건`}
            compact
          />
        </dl>
      </div>

      <div className="mt-6 border-t border-stone-200 pt-4">
        <h3 className="text-sm font-semibold text-stone-950">신고 준비 문서</h3>
        <p className="mt-3 text-xs leading-5 text-stone-500">
          공식 서식을 기준으로 만든 검토용 초안입니다. 홈택스 제출 전 확인이
          필요합니다.
        </p>
        <button
          type="button"
          onClick={onDownloadTaxPrep}
          disabled={entryCount === 0}
          className="mt-4 w-full rounded-md bg-accent-500 px-4 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500"
        >
          신고 준비 문서 다운로드
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
    <div className="flex items-center justify-between gap-3">
      <dt className={compact ? "text-xs text-stone-500" : "text-stone-500"}>
        {label}
      </dt>
      <dd
        className={
          accent
            ? "font-semibold text-accent-700"
            : "font-semibold text-stone-900"
        }
      >
        {value}
      </dd>
    </div>
  );
}
