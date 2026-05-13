import type { ExpenseSummary } from "../types/ledger";
import { EXPENSE_CATEGORIES } from "../lib/ledger/categories";
import { formatMoney } from "../lib/utils/money";

type SummaryPanelProps = {
  summary: ExpenseSummary;
};

export function SummaryPanel({ summary }: SummaryPanelProps) {
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
