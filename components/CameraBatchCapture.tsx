"use client";

import { Camera, CameraOff, Images, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Language } from "../types/ui";

type CapturedReceipt = {
  id: string;
  file: File;
  previewUrl: string;
};

type CameraBatchCaptureProps = {
  onAnalyzeReceipts: (files: File[]) => void;
  language: Language;
};

const copy = {
  ko: {
    title: "영수증 여러 장 촬영",
    description:
      "카메라로 한 장씩 찍어 모아두고, 촬영이 끝나면 한 번에 장부 초안을 만들어요.",
    open: "카메라 열기",
    close: "카메라 닫기",
    capture: "촬영",
    analyze: "한 번에 장부 초안 만들기",
    empty: "촬영한 영수증이 아직 없어요",
    count: (count: number) => `촬영한 영수증 ${count}장`,
    delete: "삭제",
    previewAlt: (index: number) => `촬영한 영수증 ${index}`,
    unsupported: "이 브라우저에서는 카메라 촬영을 지원하지 않습니다.",
    permission:
      "카메라를 열지 못했습니다. 브라우저 권한을 확인하거나 파일 업로드를 사용해 주세요.",
    captureFailed: "사진을 캡처하지 못했습니다. 카메라를 다시 열어 주세요.",
  },
  en: {
    title: "Batch capture receipts",
    description:
      "Take receipt photos one by one, keep them in a batch, then create ledger drafts at once.",
    open: "Open camera",
    close: "Close camera",
    capture: "Capture",
    analyze: "Create ledger drafts",
    empty: "No captured receipts yet",
    count: (count: number) => `${count} captured receipts`,
    delete: "Delete",
    previewAlt: (index: number) => `Captured receipt ${index}`,
    unsupported: "Camera capture is not supported in this browser.",
    permission:
      "Could not open the camera. Check browser permissions or use file upload.",
    captureFailed: "Could not capture the photo. Reopen the camera and try again.",
  },
} satisfies Record<
  Language,
  Record<string, string | ((count: number) => string)>
>;

function getText(value: string | ((count: number) => string)): string {
  return typeof value === "string" ? value : "";
}

export function CameraBatchCapture({
  onAnalyzeReceipts,
  language,
}: CameraBatchCaptureProps) {
  const t = copy[language];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const capturedReceiptsRef = useRef<CapturedReceipt[]>([]);
  const [capturedReceipts, setCapturedReceipts] = useState<CapturedReceipt[]>(
    [],
  );
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraOpen(false);
  }

  useEffect(() => {
    capturedReceiptsRef.current = capturedReceipts;
  }, [capturedReceipts]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      capturedReceiptsRef.current.forEach((receipt) =>
        URL.revokeObjectURL(receipt.previewUrl),
      );
    };
  }, []);

  async function openCamera() {
    setErrorMessage(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage(getText(t.unsupported));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraOpen(true);
    } catch {
      setErrorMessage(getText(t.permission));
      stopCamera();
    }
  }

  function captureReceipt() {
    const video = videoRef.current;

    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setErrorMessage(getText(t.captureFailed));
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      setErrorMessage(getText(t.captureFailed));
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setErrorMessage(getText(t.captureFailed));
          return;
        }

        const nextIndex = capturedReceipts.length + 1;
        const file = new File(
          [blob],
          `camera-receipt-${Date.now()}-${nextIndex}.jpg`,
          { type: "image/jpeg" },
        );
        const previewUrl = URL.createObjectURL(blob);

        setCapturedReceipts((currentReceipts) => [
          ...currentReceipts,
          {
            id: `${file.name}-${crypto.randomUUID()}`,
            file,
            previewUrl,
          },
        ]);
      },
      "image/jpeg",
      0.9,
    );
  }

  function deleteReceipt(receiptId: string) {
    setCapturedReceipts((currentReceipts) => {
      const receipt = currentReceipts.find((item) => item.id === receiptId);
      if (receipt) {
        URL.revokeObjectURL(receipt.previewUrl);
      }

      return currentReceipts.filter((item) => item.id !== receiptId);
    });
  }

  function analyzeCapturedReceipts() {
    if (capturedReceipts.length === 0) {
      return;
    }

    const files = capturedReceipts.map((receipt) => receipt.file);
    capturedReceipts.forEach((receipt) =>
      URL.revokeObjectURL(receipt.previewUrl),
    );
    setCapturedReceipts([]);
    onAnalyzeReceipts(files);
  }

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft dark:border-stone-800 dark:bg-stone-950 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-100 text-accent-700">
              <Images size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-stone-950 dark:text-stone-50 sm:text-lg">
                {getText(t.title)}
              </h2>
              <p className="mt-1 text-sm leading-6 text-stone-500 dark:text-stone-400">
                {getText(t.description)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={isCameraOpen ? stopCamera : openCamera}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-800 transition hover:border-accent-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          >
            {isCameraOpen ? (
              <CameraOff size={16} aria-hidden="true" />
            ) : (
              <Camera size={16} aria-hidden="true" />
            )}
            {isCameraOpen ? getText(t.close) : getText(t.open)}
          </button>
          <button
            type="button"
            onClick={analyzeCapturedReceipts}
            disabled={capturedReceipts.length === 0}
            className="inline-flex h-10 items-center justify-center rounded-md bg-stone-950 px-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {getText(t.analyze)}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-h-56 overflow-hidden rounded-md border border-stone-200 bg-stone-950 dark:border-stone-800">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`h-full min-h-56 w-full object-cover ${
              isCameraOpen ? "block" : "hidden"
            }`}
          />
          {!isCameraOpen ? (
            <div className="flex min-h-56 items-center justify-center px-4 text-center text-sm text-stone-300">
              {getText(t.open)}
            </div>
          ) : null}
        </div>

        <div className="min-w-0">
          <button
            type="button"
            onClick={captureReceipt}
            disabled={!isCameraOpen}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent-400 px-4 text-sm font-semibold text-stone-950 transition hover:bg-accent-300 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            <Camera size={16} aria-hidden="true" />
            {getText(t.capture)}
          </button>

          {errorMessage ? (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">
              {errorMessage}
            </p>
          ) : null}

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-stone-950 dark:text-stone-50">
                {capturedReceipts.length > 0
                  ? t.count(capturedReceipts.length)
                  : getText(t.empty)}
              </h3>
            </div>
            {capturedReceipts.length > 0 ? (
              <ul className="grid max-h-64 gap-2 overflow-y-auto pr-1">
                {capturedReceipts.map((receipt, index) => (
                  <li
                    key={receipt.id}
                    className="flex items-center gap-3 rounded-md bg-stone-50 p-2 dark:bg-stone-900"
                  >
                    {/* Blob previews are local object URLs, so Next Image optimization is not useful here. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={receipt.previewUrl}
                      alt={t.previewAlt(index + 1)}
                      className="h-14 w-14 shrink-0 rounded-md object-cover"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm text-stone-700 dark:text-stone-200">
                      {receipt.file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteReceipt(receipt.id)}
                      aria-label={getText(t.delete)}
                      title={getText(t.delete)}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-700 transition hover:border-red-300 hover:text-red-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
