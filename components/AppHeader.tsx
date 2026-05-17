import Image from "next/image";
import { Languages, Moon, Sun } from "lucide-react";
import type { Language, ThemeMode } from "../types/ui";

type AppHeaderProps = {
  onLoadSample: () => void;
  language: Language;
  themeMode: ThemeMode;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
};

const copy = {
  ko: {
    title: "영수증 정리부터 장부 다운로드까지",
    description:
      "사진이나 엑셀을 올리면 장부 초안을 만들어요.\n직접 검토하고 고친 뒤 간편장부와 신고 준비 요약을 내려받으세요.",
    sample: "샘플 데이터로 보기",
    theme: "화면 모드 전환",
    language: "언어 전환",
    nextLanguage: "EN",
    logoAlt: "정산",
  },
  en: {
    title: "From receipts to ledger drafts",
    description:
      "Upload receipt images or spreadsheets,\nreview the draft rows, then download a simple ledger and tax prep summary.",
    sample: "Load sample data",
    theme: "Toggle theme",
    language: "Toggle language",
    nextLanguage: "한",
    logoAlt: "Jungsan",
  },
} satisfies Record<Language, Record<string, string>>;

export function AppHeader({
  onLoadSample,
  language,
  themeMode,
  onToggleLanguage,
  onToggleTheme,
}: AppHeaderProps) {
  const t = copy[language];

  return (
    <header className="relative flex flex-col gap-5 border-b border-stone-200 pb-4 dark:border-stone-800 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-accent-100 shadow-soft">
          <Image
            src="/logo.png"
            alt={t.logoAlt}
            width={48}
            height={48}
            className="h-full w-full object-cover"
            priority
          />
        </div>
        <h1 className="text-4xl font-semibold tracking-normal text-stone-950 dark:text-stone-50 sm:text-5xl">
          {t.title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-stone-500 dark:text-stone-400 sm:text-lg whitespace-pre-line">
          {t.description}
        </p>
      </div>
      <div className="fixed right-3 top-3 z-30 flex items-center gap-1.5 md:absolute md:right-0 md:top-0">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={t.theme}
          title={t.theme}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-800 transition hover:border-accent-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 md:h-9 md:w-9"
        >
          {themeMode === "dark" ? (
            <Sun size={16} aria-hidden="true" />
          ) : (
            <Moon size={16} aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={onToggleLanguage}
          aria-label={t.language}
          title={t.language}
          className="inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-md border border-stone-200 bg-white px-1.5 text-xs font-semibold text-stone-800 transition hover:border-accent-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 md:h-9 md:min-w-9"
        >
          <Languages size={14} aria-hidden="true" />
          <span>{t.nextLanguage}</span>
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <button
          type="button"
          onClick={onLoadSample}
          className="inline-flex h-10 max-w-full items-center justify-center whitespace-nowrap rounded-md bg-accent-400 px-4 text-center text-sm font-semibold text-stone-950 shadow-soft transition hover:bg-accent-300"
        >
          {t.sample}
        </button>
      </div>
    </header>
  );
}
