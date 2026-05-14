import type { Language } from "../types/ui";

type EmptyStateProps = {
  onLoadSample: () => void;
  language: Language;
};

const copy = {
  ko: {
    title: "아직 장부에 들어간 항목이 없어요",
    description: "영수증 사진이나 거래내역 엑셀을 넣어보세요",
    sample: "샘플 데이터로 보기",
  },
  en: {
    title: "No ledger rows yet",
    description: "Upload receipt images or a transaction spreadsheet.",
    sample: "Load sample data",
  },
} satisfies Record<Language, Record<string, string>>;

export function EmptyState({ onLoadSample, language }: EmptyStateProps) {
  const t = copy[language];

  return (
    <div className="flex min-h-56 items-center justify-center rounded-md border border-stone-200 bg-stone-50 px-4 text-center dark:border-stone-800 dark:bg-stone-900">
      <div>
        <p className="font-medium text-stone-800 dark:text-stone-100">
          {t.title}
        </p>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          {t.description}
        </p>
        <button
          type="button"
          onClick={onLoadSample}
          className="mt-4 rounded-md bg-accent-400 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-accent-300"
        >
          {t.sample}
        </button>
      </div>
    </div>
  );
}
