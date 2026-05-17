"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { EmptyState } from "../components/EmptyState";
import { ExportBar } from "../components/ExportBar";
import { InputCards } from "../components/InputCards";
import { ProcessingQueue } from "../components/ProcessingQueue";
import { ReviewTable } from "../components/ReviewTable";
import { SummaryPanel } from "../components/SummaryPanel";
import {
  createSampleLedgerEntries,
  createSampleReceiptEntry,
} from "../lib/ledger/sampleData";
import { calculateExpenseSummary } from "../lib/ledger/summary";
import { calculateTaxPrepSummary } from "../lib/taxPrep/summary";
import { createId } from "../lib/utils/ids";
import type { LedgerEntry, ProcessingItem } from "../types/ledger";
import type { Language, ThemeMode } from "../types/ui";

function isLedgerEntry(value: unknown): value is LedgerEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "transactionDate" in value &&
    "totalAmount" in value
  );
}

function isLedgerEntryArray(value: unknown): value is LedgerEntry[] {
  return Array.isArray(value) && value.every(isLedgerEntry);
}

export default function Home() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [processingItems, setProcessingItems] = useState<ProcessingItem[]>([]);
  const [showDownloadWarning, setShowDownloadWarning] = useState(false);
  const [totalIncomeAmount, setTotalIncomeAmount] = useState(0);
  const [language, setLanguage] = useState<Language>("ko");
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");

  const summary = useMemo(() => calculateExpenseSummary(entries), [entries]);
  const taxPrepSummary = useMemo(
    () => calculateTaxPrepSummary(totalIncomeAmount, entries),
    [entries, totalIncomeAmount],
  );

  function addSampleData() {
    setEntries((currentEntries) => [
      ...currentEntries,
      ...createSampleLedgerEntries(),
    ]);
    setShowDownloadWarning(false);
  }

  async function handleSpreadsheetFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    const spreadsheetFiles = Array.from(files);
    const nextItems = spreadsheetFiles.map((file, index) => ({
      id: createId("queue"),
      fileName: file.name,
      source: "spreadsheet",
      status: index === 0 ? "processing" : "queued",
    })) satisfies ProcessingItem[];

    setProcessingItems((currentItems) => [...nextItems, ...currentItems]);

    for (let index = 0; index < spreadsheetFiles.length; index += 1) {
      const file = spreadsheetFiles[index];
      const item = nextItems[index];

      setProcessingItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, status: "processing", errorMessage: undefined }
            : currentItem,
        ),
      );

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/import-transactions", {
          method: "POST",
          body: formData,
        });
        const payload = (await response.json()) as
          | LedgerEntry[]
          | { error?: string };

        if (!response.ok || !isLedgerEntryArray(payload)) {
          throw new Error(
            "error" in payload && payload.error
              ? payload.error
              : "거래내역 파일을 읽지 못했습니다.",
          );
        }

        setEntries((currentEntries) => [...payload, ...currentEntries]);
        setProcessingItems((currentItems) =>
          currentItems.map((currentItem) =>
            currentItem.id === item.id
              ? { ...currentItem, status: "done", errorMessage: undefined }
              : currentItem,
          ),
        );
      } catch (error) {
        setProcessingItems((currentItems) =>
          currentItems.map((currentItem) =>
            currentItem.id === item.id
              ? {
                  ...currentItem,
                  status: "failed",
                  errorMessage:
                    error instanceof Error
                      ? error.message
                      : "거래내역 파일을 읽지 못했습니다.",
                }
              : currentItem,
          ),
        );
      }
    }
  }

  async function handleReceiptFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    const receiptFiles = Array.from(files);
    const nextItems = receiptFiles.map((file) => ({
      id: createId("queue"),
      fileName: file.name,
      source: "receipt",
      status: "queued",
    })) satisfies ProcessingItem[];

    setProcessingItems((currentItems) => [...nextItems, ...currentItems]);

    for (let index = 0; index < receiptFiles.length; index += 1) {
      const file = receiptFiles[index];
      const item = nextItems[index];

      setProcessingItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, status: "processing", errorMessage: undefined }
            : currentItem,
        ),
      );

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/extract-receipt", {
          method: "POST",
          body: formData,
        });
        const payload = (await response.json()) as
          | LedgerEntry
          | { error?: string };

        if (!response.ok || !isLedgerEntry(payload)) {
          throw new Error(
            "error" in payload && payload.error
              ? payload.error
              : "영수증 분석에 실패했습니다.",
          );
        }

        setEntries((currentEntries) => [payload, ...currentEntries]);
        setProcessingItems((currentItems) =>
          currentItems.map((currentItem) =>
            currentItem.id === item.id
              ? { ...currentItem, status: "done", errorMessage: undefined }
              : currentItem,
          ),
        );
      } catch (error) {
        setProcessingItems((currentItems) =>
          currentItems.map((currentItem) =>
            currentItem.id === item.id
              ? {
                  ...currentItem,
                  status: "failed",
                  errorMessage:
                    error instanceof Error
                      ? error.message
                      : "영수증 분석에 실패했습니다.",
                }
              : currentItem,
          ),
        );
      }
    }
  }

  function useSampleResult(itemId: string) {
    const item = processingItems.find(
      (currentItem) => currentItem.id === itemId,
    );

    if (!item) {
      return;
    }

    setEntries((currentEntries) => [
      createSampleReceiptEntry(item.fileName),
      ...currentEntries,
    ]);
    setProcessingItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === itemId
          ? { ...currentItem, status: "done", errorMessage: undefined }
          : currentItem,
      ),
    );
  }

  function updateEntry(id: string, patch: Partial<LedgerEntry>) {
    setEntries((currentEntries) =>
      currentEntries.map((entry) => {
        if (entry.id !== id) {
          return entry;
        }

        const updatedEntry = {
          ...entry,
          ...patch,
          category: patch.category ?? entry.category ?? "기타경비",
        };

        if ("supplyAmount" in patch || "vatAmount" in patch) {
          updatedEntry.vatStatus =
            updatedEntry.supplyAmount === undefined &&
            updatedEntry.vatAmount === undefined
              ? "missing"
              : "confirmed";
        }

        return updatedEntry;
      }),
    );
  }

  async function downloadLedger() {
    const response = await fetch("/api/export-ledger", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ entries }),
    });

    if (!response.ok) {
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "jeongsan-simple-ledger.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function downloadTaxPrep() {
    try {
      const response = await fetch("/api/export-tax-prep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ totalIncomeAmount, entries }),
      });

      if (!response.ok) {
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "jeongsan-tax-prep-draft.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      // The tax prep export route is added in the next phase.
    }
  }

  function requestExport() {
    if (summary.needsReviewCount > 0) {
      setShowDownloadWarning(true);
      return;
    }

    setShowDownloadWarning(false);
    void downloadLedger();
  }

  function confirmExport() {
    setShowDownloadWarning(false);
    void downloadLedger();
  }

  return (
    <div className={themeMode === "dark" ? "dark" : undefined}>
      <main className="min-h-screen bg-stone-50 text-ink dark:bg-stone-950">
        <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6 sm:px-8 lg:py-10">
          <AppHeader
            onLoadSample={addSampleData}
            language={language}
            themeMode={themeMode}
            onToggleLanguage={() =>
              setLanguage((current) => (current === "ko" ? "en" : "ko"))
            }
            onToggleTheme={() =>
              setThemeMode((current) =>
                current === "light" ? "dark" : "light",
              )
            }
          />

          <InputCards
            onReceiptFiles={handleReceiptFiles}
            onSpreadsheetFiles={handleSpreadsheetFiles}
            language={language}
          />

          <ProcessingQueue
            items={processingItems}
            onUseSampleResult={useSampleResult}
            language={language}
          />

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <div className="min-w-0">
              {entries.length > 0 ? (
                <ReviewTable
                  entries={entries}
                  onUpdateEntry={updateEntry}
                  language={language}
                />
              ) : (
                <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft dark:border-stone-800 dark:bg-stone-950">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-stone-950 dark:text-stone-50">
                      {language === "ko" ? "검토 테이블" : "Review table"}
                    </h2>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 dark:bg-stone-900 dark:text-stone-300">
                      {language === "ko" ? "0개 항목" : "0 items"}
                    </span>
                  </div>
                  <EmptyState onLoadSample={addSampleData} language={language} />
                </section>
              )}
            </div>
            {entries.length > 0 ? (
              <div className="min-w-0 lg:sticky lg:top-6">
                <SummaryPanel
                  summary={summary}
                  taxPrepSummary={taxPrepSummary}
                  totalIncomeAmount={totalIncomeAmount}
                  onTotalIncomeAmountChange={setTotalIncomeAmount}
                  onDownloadTaxPrep={downloadTaxPrep}
                  entryCount={entries.length}
                  language={language}
                />
              </div>
            ) : null}
          </section>

          <ExportBar
            entryCount={entries.length}
            showWarning={showDownloadWarning}
            onExport={requestExport}
            onCancelWarning={() => setShowDownloadWarning(false)}
            onConfirmExport={confirmExport}
            language={language}
          />
        </section>
      </main>
    </div>
  );
}
