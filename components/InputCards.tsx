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
    <section className="grid gap-4 md:grid-cols-2">
      <label className="block rounded-lg border border-stone-200 bg-white p-5 shadow-soft transition hover:border-accent-300 dark:border-stone-800 dark:bg-stone-950">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-accent-100 text-accent-700">
            <ImageUp size={22} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-stone-950 dark:text-stone-50">
              {t.receiptTitle}
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {t.receiptDescription}
            </p>
          </div>
        </div>
        <div className="mt-5 rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
          <span className="font-medium text-stone-700 dark:text-stone-200">
            {t.imageSelect}
          </span>
          <span className="ml-2">{t.imageHint}</span>
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

      <label className="block rounded-lg border border-stone-200 bg-white p-5 shadow-soft transition hover:border-accent-300 dark:border-stone-800 dark:bg-stone-950">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-200">
            <FileSpreadsheet size={22} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-stone-950 dark:text-stone-50">
              {t.spreadsheetTitle}
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {t.spreadsheetDescription}
            </p>
          </div>
        </div>
        <div className="mt-5 rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
          <span className="font-medium text-stone-700 dark:text-stone-200">
            {t.fileSelect}
          </span>
          <span className="ml-2">{t.fileHint}</span>
        </div>
        <input
          type="file"
          accept=".xlsx,.csv"
          className="sr-only"
          onChange={(event) => onSpreadsheetFiles(event.currentTarget.files)}
        />
      </label>
    </section>
  );
}
