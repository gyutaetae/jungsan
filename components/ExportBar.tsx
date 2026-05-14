import { Download, X } from "lucide-react";
import type { Language } from "../types/ui";

type ExportBarProps = {
  entryCount: number;
  showWarning: boolean;
  onExport: () => void;
  onCancelWarning: () => void;
  onConfirmExport: () => void;
  language: Language;
};

const copy = {
  ko: {
    description: "영수증과 거래내역을 한 화면에서 넣고 · 검토하고 · 간편장부로 마무리하기",
    download: "간편장부 엑셀 다운로드",
    warning: "확인 필요 항목이 있어요. 그래도 장부를 만들까요?",
    keepReviewing: "검토 계속",
    makeAnyway: "그래도 만들기",
  },
  en: {
    description: "Upload · review · finish with a simple ledger in one workspace",
    download: "Download simple ledger",
    warning: "Some rows still need review. Download the ledger anyway?",
    keepReviewing: "Keep reviewing",
    makeAnyway: "Download anyway",
  },
} satisfies Record<Language, Record<string, string>>;

export function ExportBar({
  entryCount,
  showWarning,
  onExport,
  onCancelWarning,
  onConfirmExport,
  language,
}: ExportBarProps) {
  const t = copy[language];

  return (
    <section className="rounded-lg border border-accent-200 bg-accent-50 p-4 text-sm text-accent-800 dark:border-stone-800 dark:bg-stone-950 dark:text-accent-200">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p>{t.description}</p>
        <button
          type="button"
          onClick={onExport}
          disabled={entryCount === 0}
          className="inline-flex max-w-full items-center justify-center gap-2 whitespace-normal rounded-md bg-stone-950 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          <Download size={16} aria-hidden="true" />
          {t.download}
        </button>
      </div>

      {showWarning ? (
        <div className="mt-4 rounded-md border border-accent-300 bg-white p-3 text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium">{t.warning}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancelWarning}
                className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700"
              >
                <X size={14} aria-hidden="true" />
                {t.keepReviewing}
              </button>
              <button
                type="button"
                onClick={onConfirmExport}
                className="rounded-md bg-accent-400 px-3 py-2 text-sm font-semibold text-stone-950"
              >
                {t.makeAnyway}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
