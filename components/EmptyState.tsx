type EmptyStateProps = {
  onLoadSample: () => void;
};

export function EmptyState({ onLoadSample }: EmptyStateProps) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-md border border-stone-200 bg-stone-50 px-4 text-center">
      <div>
        <p className="font-medium text-stone-800">
          아직 장부에 들어간 항목이 없어요
        </p>
        <p className="mt-2 text-sm text-stone-500">
          영수증 사진이나 거래내역 엑셀을 넣어보세요
        </p>
        <button
          type="button"
          onClick={onLoadSample}
          className="mt-4 rounded-md bg-accent-400 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-accent-300"
        >
          샘플 데이터로 보기
        </button>
      </div>
    </div>
  );
}
