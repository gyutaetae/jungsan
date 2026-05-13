import { Sparkles } from "lucide-react";

type AppHeaderProps = {
  onLoadSample: () => void;
};

export function AppHeader({ onLoadSample }: AppHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-300 bg-accent-50 px-3 py-1 text-sm font-medium text-accent-700">
          <Sparkles size={16} aria-hidden="true" />
          정산 MVP
        </div>
        <h1 className="text-4xl font-semibold tracking-normal text-stone-950 sm:text-5xl">
          영수증과 거래내역, 장부 초안까지 한 번에
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
          AI가 먼저 정리하고, 사람은 필요한 부분만 확인해요. 확실하지 않은
          세금값은 비워두고 확인 필요로 표시합니다.
        </p>
      </div>
      <button
        type="button"
        onClick={onLoadSample}
        className="inline-flex w-fit max-w-full items-center justify-center whitespace-normal rounded-md bg-accent-400 px-5 py-3 text-center text-sm font-semibold text-stone-950 shadow-soft transition hover:bg-accent-300"
      >
        샘플 데이터로 보기
      </button>
    </header>
  );
}
