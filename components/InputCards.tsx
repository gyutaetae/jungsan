"use client";

import { Camera, FileSpreadsheet, ImageUp, X } from "lucide-react";
import type { DragEvent } from "react";
import { useRef, useState } from "react";
import { CameraBatchCapture } from "./CameraBatchCapture";
import type { Language } from "../types/ui";

type InputCardsProps = {
  onReceiptFiles: (files: FileList | null) => void;
  onCameraReceiptFiles: (files: File[]) => void;
  onSpreadsheetFiles: (files: FileList | null) => void;
  language: Language;
};

const copy = {
  ko: {
    receiptTitle: "영수증 촬영/업로드",
    receiptDescription: "여러 이미지를 골라 처리 큐에 올려둡니다.",
    imageSelect: "클릭 또는 드롭",
    imageHint: "PC는 파일 선택, 휴대폰은 사진 선택 또는 여러 장 촬영",
    mobileTitle: "영수증 입력 방식",
    mobileDescription: "기존 사진을 고르거나 카메라로 여러 장 찍어 모아두세요.",
    pickPhotos: "기존 사진 선택",
    batchCamera: "카메라로 여러 장 촬영",
    close: "닫기",
    spreadsheetTitle: "거래내역 엑셀 업로드",
    spreadsheetDescription: "xlsx 또는 csv 파일을 같은 큐에 올립니다.",
    fileSelect: "클릭 또는 드롭",
    fileHint: "xlsx 또는 csv를 장부 행으로 변환합니다.",
  },
  en: {
    receiptTitle: "Capture or upload receipts",
    receiptDescription: "Add multiple receipt images to the queue.",
    imageSelect: "Click or drop",
    imageHint: "Desktop opens files; mobile can pick photos or batch capture.",
    mobileTitle: "Receipt input",
    mobileDescription: "Choose existing photos or capture several receipts with the camera.",
    pickPhotos: "Choose photos",
    batchCamera: "Batch capture",
    close: "Close",
    spreadsheetTitle: "Upload transaction sheet",
    spreadsheetDescription: "Add an xlsx or csv file to the same queue.",
    fileSelect: "Click or drop",
    fileHint: "Convert xlsx or csv rows into ledger entries.",
  },
} satisfies Record<Language, Record<string, string>>;

function handleDrop(
  event: DragEvent<HTMLElement>,
  onFiles: (files: FileList | null) => void,
) {
  event.preventDefault();
  event.stopPropagation();
  onFiles(event.dataTransfer.files);
}

export function InputCards({
  onReceiptFiles,
  onCameraReceiptFiles,
  onSpreadsheetFiles,
  language,
}: InputCardsProps) {
  const t = copy[language];
  const receiptInputRef = useRef<HTMLInputElement | null>(null);
  const [showReceiptOptions, setShowReceiptOptions] = useState(false);
  const [showCameraCapture, setShowCameraCapture] = useState(false);

  function isMobileLikeDevice() {
    return window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;
  }

  function openReceiptInput() {
    receiptInputRef.current?.click();
  }

  function handleReceiptCardClick() {
    if (isMobileLikeDevice()) {
      setShowReceiptOptions(true);
      return;
    }

    openReceiptInput();
  }

  function handleReceiptFiles(files: FileList | null) {
    onReceiptFiles(files);
    setShowReceiptOptions(false);
    if (receiptInputRef.current) {
      receiptInputRef.current.value = "";
    }
  }

  function handleCameraReceipts(files: File[]) {
    onCameraReceiptFiles(files);
    setShowCameraCapture(false);
    setShowReceiptOptions(false);
  }

  return (
    <>
      <section className="grid grid-cols-2 gap-3 sm:gap-4">
      <button
        type="button"
        onClick={handleReceiptCardClick}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => handleDrop(event, handleReceiptFiles)}
        className="group block min-w-0 cursor-pointer rounded-lg border border-stone-200 bg-white p-3 text-left shadow-soft transition-all hover:border-accent-400 hover:bg-accent-50/50 dark:border-stone-800 dark:bg-stone-950 dark:hover:border-accent-700 dark:hover:bg-accent-900/20 sm:p-5"
      >
        <div className="flex min-w-0 items-start gap-2 sm:items-center sm:gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-100 text-accent-700 transition-colors group-hover:bg-accent-200 group-hover:text-accent-800 dark:group-hover:bg-accent-800 dark:group-hover:text-accent-200 sm:h-11 sm:w-11">
            <ImageUp size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold leading-snug text-stone-950 dark:text-stone-50 sm:text-lg">
              {t.receiptTitle}
            </h2>
            <p className="mt-1 text-xs leading-snug text-stone-500 dark:text-stone-400 sm:text-sm">
              {t.receiptDescription}
            </p>
          </div>
        </div>
        <div className="mt-3 rounded-md border border-dashed border-stone-300 bg-stone-50 px-3 py-4 text-xs leading-snug text-stone-500 transition-colors group-hover:border-accent-300 group-hover:bg-accent-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 dark:group-hover:border-accent-700 dark:group-hover:bg-accent-950/30 sm:mt-5 sm:px-4 sm:py-6 sm:text-sm">
          <span className="block font-medium text-stone-700 dark:text-stone-200 sm:inline">
            {t.imageSelect}
          </span>
          <span className="mt-1 block sm:ml-2 sm:mt-0 sm:inline">{t.imageHint}</span>
        </div>
      </button>
      <input
        ref={receiptInputRef}
        type="file"
        multiple
        accept="image/*"
        className="sr-only"
        onChange={(event) => handleReceiptFiles(event.currentTarget.files)}
      />

      <label
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => handleDrop(event, onSpreadsheetFiles)}
        className="group block min-w-0 cursor-pointer rounded-lg border border-stone-200 bg-white p-3 shadow-soft transition-all hover:border-accent-400 hover:bg-accent-50/50 dark:border-stone-800 dark:bg-stone-950 dark:hover:border-accent-700 dark:hover:bg-accent-900/20 sm:p-5"
      >
        <div className="flex min-w-0 items-start gap-2 sm:items-center sm:gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-100 text-accent-700 transition-colors group-hover:bg-accent-200 group-hover:text-accent-800 dark:group-hover:bg-accent-800 dark:group-hover:text-accent-200 sm:h-11 sm:w-11">
            <FileSpreadsheet size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold leading-snug text-stone-950 dark:text-stone-50 sm:text-lg">
              {t.spreadsheetTitle}
            </h2>
            <p className="mt-1 text-xs leading-snug text-stone-500 dark:text-stone-400 sm:text-sm">
              {t.spreadsheetDescription}
            </p>
          </div>
        </div>
        <div className="mt-3 rounded-md border border-dashed border-stone-300 bg-stone-50 px-3 py-4 text-xs leading-snug text-stone-500 transition-colors group-hover:border-accent-300 group-hover:bg-accent-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 dark:group-hover:border-accent-700 dark:group-hover:bg-accent-950/30 sm:mt-5 sm:px-4 sm:py-6 sm:text-sm">
          <span className="block font-medium text-stone-700 dark:text-stone-200 sm:inline">
            {t.fileSelect}
          </span>
          <span className="mt-1 block sm:ml-2 sm:mt-0 sm:inline">{t.fileHint}</span>
        </div>
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          className="sr-only"
          onChange={(event) => onSpreadsheetFiles(event.currentTarget.files)}
        />
      </label>
    </section>

      {showReceiptOptions ? (
        <div className="fixed inset-0 z-40 flex items-end bg-stone-950/50 p-3 sm:items-center sm:justify-center">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-lg border border-stone-200 bg-white p-4 shadow-soft dark:border-stone-800 dark:bg-stone-950 sm:max-w-3xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-stone-950 dark:text-stone-50">
                  {t.mobileTitle}
                </h2>
                <p className="mt-1 text-sm leading-6 text-stone-500 dark:text-stone-400">
                  {t.mobileDescription}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowReceiptOptions(false);
                  setShowCameraCapture(false);
                }}
                aria-label={t.close}
                title={t.close}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-700 transition hover:border-accent-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {!showCameraCapture ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={openReceiptInput}
                  className="flex min-h-28 items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4 text-left transition hover:border-accent-300 hover:bg-accent-50 dark:border-stone-800 dark:bg-stone-900"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-100 text-accent-700">
                    <ImageUp size={19} aria-hidden="true" />
                  </span>
                  <span className="font-semibold text-stone-900 dark:text-stone-50">
                    {t.pickPhotos}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCameraCapture(true)}
                  className="flex min-h-28 items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4 text-left transition hover:border-accent-300 hover:bg-accent-50 dark:border-stone-800 dark:bg-stone-900"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-100 text-accent-700">
                    <Camera size={19} aria-hidden="true" />
                  </span>
                  <span className="font-semibold text-stone-900 dark:text-stone-50">
                    {t.batchCamera}
                  </span>
                </button>
              </div>
            ) : (
              <CameraBatchCapture
                onAnalyzeReceipts={handleCameraReceipts}
                language={language}
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
