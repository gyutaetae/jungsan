import { Download, X } from "lucide-react";

type ExportBarProps = {
  entryCount: number;
  showWarning: boolean;
  onExport: () => void;
  onCancelWarning: () => void;
  onConfirmExport: () => void;
};

export function ExportBar({
  entryCount,
  showWarning,
  onExport,
  onCancelWarning,
  onConfirmExport,
}: ExportBarProps) {
  return (
    <section className="rounded-lg border border-accent-200 bg-accent-50 p-4 text-sm text-accent-800">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p>
          영수증과 거래내역을 한 화면에서 넣고 · 검토하고 · 간편장부로
          마무리하기
        </p>
        <button
          type="button"
          onClick={onExport}
          disabled={entryCount === 0}
          className="inline-flex max-w-full items-center justify-center gap-2 whitespace-normal rounded-md bg-stone-950 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          <Download size={16} aria-hidden="true" />
          간편장부 엑셀 다운로드
        </button>
      </div>

      {showWarning ? (
        <div className="mt-4 rounded-md border border-accent-300 bg-white p-3 text-stone-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium">
              확인 필요 항목이 있어요. 그래도 장부를 만들까요?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancelWarning}
                className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700"
              >
                <X size={14} aria-hidden="true" />
                검토 계속
              </button>
              <button
                type="button"
                onClick={onConfirmExport}
                className="rounded-md bg-accent-400 px-3 py-2 text-sm font-semibold text-stone-950"
              >
                그래도 만들기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
