import { FileSpreadsheet, ImageUp } from "lucide-react";
import type { Language } from "../types/ui";

type InputCardsProps = {
  onReceiptFiles: (files: FileList | null) => void;
  onSpreadsheetFiles: (files: FileList | null) => void;
  language: Language;
};

const copy = {
  ko: {
    receiptTitle: "영수증 촬영/업로드",
    receiptDescription: "여러 이미지를 골라 처리 큐에 올려둡니다.",
    imageSelect: "이미지 선택",
    imageHint: "여러 장을 한 장씩 분석합니다.",
    spreadsheetTitle: "거래내역 엑셀 업로드",
    spreadsheetDescription: "xlsx 또는 csv 파일을 같은 큐에 올립니다.",
    fileSelect: "파일 선택",
    fileHint: "xlsx 또는 csv를 장부 행으로 변환합니다.",
  },
  en: {
    receiptTitle: "Capture or upload receipts",
    receiptDescription: "Add multiple receipt images to the queue.",
    imageSelect: "Choose images",
    imageHint: "Each image is analyzed one by one.",
    spreadsheetTitle: "Upload transaction sheet",
    spreadsheetDescription: "Add an xlsx or csv file to the same queue.",
    fileSelect: "Choose file",
    fileHint: "Convert xlsx or csv rows into ledger entries.",
  },
} satisfies Record<Language, Record<string, string>>;

export function InputCards({
  onReceiptFiles,
  onSpreadsheetFiles,
  language,
}: InputCardsProps) {
  const t = copy[language];

  return (
    <section className="grid grid-cols-2 gap-3 sm:gap-4">
      <label className="group block min-w-0 cursor-pointer rounded-lg border border-stone-200 bg-white p-3 shadow-soft transition-all hover:border-accent-400 hover:bg-accent-50/50 dark:border-stone-800 dark:bg-stone-950 dark:hover:border-accent-700 dark:hover:bg-accent-900/20 sm:p-5">
        <div className="flex min-w-0 items-start gap-2 sm:items-center sm:gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-100 text-accent-700 transition-colors group-hover:bg-accent-200 group-hover:text-accent-800 dark:group-hover:bg-accent-800 dark:group-hover:text-accent-200 sm:h-11 sm:w-11">
            <ImageUp size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold leading-snug text-stone-950 dark:text-stone-50 sm:text-lg">
              {t.receiptTitle}
            </h2>
            <p className="mt-1 text-xs leading-snug text-stone-500 dark:text-stone-400 sm:text-sm">
              {t.receiptDescription}
            </p>
          </div>
        </div>
        <div className="mt-3 rounded-md border border-dashed border-stone-300 bg-stone-50 px-3 py-4 text-xs leading-snug text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 sm:mt-5 sm:px-4 sm:py-6 sm:text-sm">
          <span className="block font-medium text-stone-700 dark:text-stone-200 sm:inline">
            {t.imageSelect}
          </span>
          <span className="mt-1 block sm:ml-2 sm:mt-0 sm:inline">{t.imageHint}</span>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(event) => onReceiptFiles(event.currentTarget.files)}
        />
      </label>

      <label className="group block min-w-0 cursor-pointer rounded-lg border border-stone-200 bg-white p-3 shadow-soft transition-all hover:border-accent-400 hover:bg-accent-50/50 dark:border-stone-800 dark:bg-stone-950 dark:hover:border-accent-700 dark:hover:bg-accent-900/20 sm:p-5">
        <div className="flex min-w-0 items-start gap-2 sm:items-center sm:gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-100 text-accent-700 transition-colors group-hover:bg-accent-200 group-hover:text-accent-800 dark:group-hover:bg-accent-800 dark:group-hover:text-accent-200 sm:h-11 sm:w-11">
            <FileSpreadsheet size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold leading-snug text-stone-950 dark:text-stone-50 sm:text-lg">
              {t.spreadsheetTitle}
            </h2>
            <p className="mt-1 text-xs leading-snug text-stone-500 dark:text-stone-400 sm:text-sm">
              {t.spreadsheetDescription}
            </p>
          </div>
        </div>
        <div className="mt-3 rounded-md border border-dashed border-stone-300 bg-stone-50 px-3 py-4 text-xs leading-snug text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 sm:mt-5 sm:px-4 sm:py-6 sm:text-sm">
          <span className="block font-medium text-stone-700 dark:text-stone-200 sm:inline">
            {t.fileSelect}
          </span>
          <span className="mt-1 block sm:ml-2 sm:mt-0 sm:inline">{t.fileHint}</span>
        </div>
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          className="sr-only"
          onChange={(event) => onSpreadsheetFiles(event.currentTarget.files)}
        />
      </label>
    </section>
  );
}
