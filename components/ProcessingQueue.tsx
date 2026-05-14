import { Loader2 } from "lucide-react";
import type { ProcessingItem } from "../types/ledger";
import type { Language } from "../types/ui";

const copy = {
  ko: {
    title: "처리 큐",
    count: (count: number) => `${count}개 대기표`,
    sample: "샘플 결과 사용",
    statusLabels: {
      queued: "대기",
      processing: "읽는 중",
      done: "완료",
      failed: "실패",
    },
  },
  en: {
    title: "Processing queue",
    count: (count: number) => `${count} queued`,
    sample: "Use sample result",
    statusLabels: {
      queued: "Queued",
      processing: "Reading",
      done: "Done",
      failed: "Failed",
    },
  },
};

type ProcessingQueueProps = {
  items: ProcessingItem[];
  onUseSampleResult: (itemId: string) => void;
  language: Language;
};

export function ProcessingQueue({
  items,
  onUseSampleResult,
  language,
}: ProcessingQueueProps) {
  if (items.length === 0) {
    return null;
  }

  const t = copy[language];

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-stone-950 dark:text-stone-50">
          {t.title}
        </h2>
        <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-medium text-accent-700">
          {t.count(items.length)}
        </span>
      </div>
      <ul className="grid gap-2 md:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-md bg-stone-50 px-3 py-2 text-sm dark:bg-stone-900"
          >
            <div className="min-w-0">
              <span className="block truncate text-stone-700 dark:text-stone-200">
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
                  {t.sample}
                </button>
              ) : null}
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-medium text-stone-600 dark:bg-stone-950 dark:text-stone-300">
                {item.status === "processing" ? (
                  <Loader2
                    className="animate-spin"
                    size={12}
                    aria-hidden="true"
                  />
                ) : null}
                {t.statusLabels[item.status]}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
