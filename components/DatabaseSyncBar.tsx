import { Cloud, CloudOff, DownloadCloud, RefreshCw, UploadCloud } from "lucide-react";

type DatabaseStatus = {
  configured: boolean;
  connected: boolean;
  message: string;
};

type DatabaseSyncBarProps = {
  status: DatabaseStatus | null;
  isSyncing: boolean;
  message: string | null;
  entryCount: number;
  onRefreshStatus: () => void;
  onSave: () => void;
  onLoad: () => void;
};

export function DatabaseSyncBar({
  status,
  isSyncing,
  message,
  entryCount,
  onRefreshStatus,
  onSave,
  onLoad,
}: DatabaseSyncBarProps) {
  const connected = Boolean(status?.connected);

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 text-sm shadow-soft dark:border-stone-800 dark:bg-stone-950">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={
              connected
                ? "mt-0.5 rounded-md bg-accent-100 p-2 text-accent-700 dark:bg-accent-400 dark:text-stone-950"
                : "mt-0.5 rounded-md bg-stone-100 p-2 text-stone-500 dark:bg-stone-900 dark:text-stone-400"
            }
          >
            {connected ? (
              <Cloud size={18} aria-hidden="true" />
            ) : (
              <CloudOff size={18} aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-stone-950 dark:text-stone-50">
              {connected ? "Supabase 연결됨" : "Supabase 미연결"}
            </p>
            <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-stone-400">
              {message ?? status?.message ?? "DB 연결 상태를 확인하는 중입니다."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRefreshStatus}
            disabled={isSyncing}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-900"
          >
            <RefreshCw size={14} aria-hidden="true" />
            상태 확인
          </button>
          <button
            type="button"
            onClick={onLoad}
            disabled={!connected || isSyncing}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-900"
          >
            <DownloadCloud size={14} aria-hidden="true" />
            DB 불러오기
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!connected || isSyncing || entryCount === 0}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-accent-500 px-3 py-2 text-xs font-semibold text-stone-950 transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500"
          >
            <UploadCloud size={14} aria-hidden="true" />
            DB 저장
          </button>
        </div>
      </div>
    </section>
  );
}
