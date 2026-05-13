import { Loader2 } from "lucide-react";
import type { ProcessingItem } from "../types/ledger";

const statusLabels: Record<ProcessingItem["status"], string> = {
  queued: "대기",
  processing: "읽는 중",
  done: "완료",
  failed: "실패",
};

type ProcessingQueueProps = {
  items: ProcessingItem[];
  onUseSampleResult: (itemId: string) => void;
};

export function ProcessingQueue({
  items,
  onUseSampleResult,
}: ProcessingQueueProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-stone-950">처리 큐</h2>
        <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-medium text-accent-700">
          {items.length}개 대기표
        </span>
      </div>
      <ul className="grid gap-2 md:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-md bg-stone-50 px-3 py-2 text-sm"
          >
            <div className="min-w-0">
              <span className="block truncate text-stone-700">
                {item.fileName}
              </span>
              {item.errorMessage ? (
                <span className="mt-1 block truncate text-xs text-red-600">
                  {item.errorMessage}
                </span>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {item.status === "failed" ? (
                <button
                  type="button"
                  onClick={() => onUseSampleResult(item.id)}
                  className="rounded-md border border-accent-300 bg-accent-50 px-2 py-1 text-center text-xs font-medium text-accent-800 transition hover:bg-accent-100"
                >
                  샘플 결과 사용
                </button>
              ) : null}
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-medium text-stone-600">
                {item.status === "processing" ? (
                  <Loader2
                    className="animate-spin"
                    size={12}
                    aria-hidden="true"
                  />
                ) : null}
                {statusLabels[item.status]}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
