import Image from "next/image";

type AppHeaderProps = {
  onLoadSample: () => void;
};

export function AppHeader({ onLoadSample }: AppHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-accent-100 shadow-soft">
          <Image
            src="/logo.png"
            alt="정산"
            width={48}
            height={48}
            className="h-full w-full object-cover"
            priority
          />
        </div>
        <h1 className="text-4xl font-semibold tracking-normal text-stone-950 sm:text-5xl">
          영수증 정리부터 장부 다운로드까지
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
          사진이나 엑셀을 올리면 장부 초안을 만들어요. 검토하고 고친 뒤
          간편장부와 신고 준비 요약을 내려받으세요.
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
