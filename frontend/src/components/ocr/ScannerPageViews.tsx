import { Button } from "@cloudflare/kumo/components/button";
import {
  CameraIcon,
  FilesIcon,
  SpinnerIcon,
  TextAlignLeftIcon,
} from "@phosphor-icons/react";

import { CameraCapture } from "./CameraCapture";
import { Scanner } from "./Scanner";
import { ScanResult } from "./ScanResult";

export type ScannerPageMode = "camera" | "file";

export type CameraViewProps = {
  capturedFile: File | null;
  previewUrl: string | null;
  loading: boolean;
  result: string;
  error: string;
  onCapture: (file: File) => void;
  onReset: () => void;
  onScan: () => void;
  onSwitchToFile?: () => void;
};

export type FileViewProps = {
  onSwitchToCamera: () => void;
};

export type ModeToggleProps = {
  mode: ScannerPageMode;
  onSwitchMode: (mode: ScannerPageMode) => void;
};

export function MobileCameraView({
  capturedFile,
  previewUrl,
  loading,
  result,
  error,
  onCapture,
  onReset,
  onScan,
  onSwitchToFile,
}: CameraViewProps) {
  const mobileViewportClassName =
    "h-[calc(100dvh-7rem-env(safe-area-inset-bottom))]";
  const showCaptureHint = !capturedFile && !loading && !result && !error;
  const showPreviewActions = capturedFile && !loading && !result && !error;
  const showError = error && !loading;
  const showResult = result && !loading;

  return (
    <section
      className={`relative -mb-16 -mt-6 -mx-5 overflow-hidden bg-black ${mobileViewportClassName}`}
    >
      {!capturedFile ? (
        <CameraCapture immersive onCapture={onCapture} />
      ) : (
        <div className="relative h-full bg-black">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Zrobione zdjęcie"
              className="h-full w-full object-cover"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/75" />

          {showPreviewActions && (
            <div className="absolute inset-x-0 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-10 flex items-center justify-center gap-3 px-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onReset}
                className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-[15px] font-medium text-white backdrop-blur-md hover:bg-white/15"
              >
                Nowe zdjęcie
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={onScan}
                className="rounded-full px-6 py-3 text-[15px] font-medium shadow-lg"
              >
                Skanuj
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/75 via-black/30 to-transparent" />

      <div className="absolute left-4 right-4 top-5 z-20 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={onSwitchToFile}
          icon={<FilesIcon size={16} weight="bold" />}
          className="shrink-0 rounded-full border border-rule bg-paper-2 px-3.5 py-2.5 text-[14px] font-medium text-ink"
        >
          Pliki
        </Button>
      </div>

      {showCaptureHint && (
        <div className="pointer-events-none absolute inset-x-6 bottom-[calc(7rem+env(safe-area-inset-bottom))] z-10 rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-center backdrop-blur-sm">
          <p className="text-[14px] leading-relaxed text-white/82">
            Ustaw kartkę w ramce. Najlepiej w dobrym świetle i bez cienia.
          </p>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm">
          <div className="rounded-[28px] border border-white/10 bg-black/55 px-5 py-4 text-center text-white shadow-2xl">
            <SpinnerIcon
              size={24}
              className="mx-auto animate-spin text-amber"
            />
            <p className="mt-3 text-[15px] font-medium">
              AI analizuje zdjęcie…
            </p>
            <p className="mt-1 text-[13px] text-white/65">
              To może potrwać chwilę.
            </p>
          </div>
        </div>
      )}

      {showError && (
        <div className="absolute inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 rounded-[28px] border border-rating-1/30 bg-paper p-5 text-ink shadow-2xl">
          <p className="text-[12px] uppercase tracking-[0.18em] text-rating-1">
            Problem
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
            {error}
          </p>
          <div className="mt-4 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onReset}
              className="rounded-full border border-rule px-4 py-2.5 text-[14px] font-medium text-ink"
            >
              Spróbuj jeszcze raz
            </Button>
          </div>
        </div>
      )}

      {showResult && (
        <div className="absolute inset-x-0 bottom-0 z-30 max-h-[68dvh] overflow-y-auto rounded-t-[32px] border-t border-white/10 bg-paper px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-4 shadow-2xl">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-rule" />
          <div className="mb-4 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onReset}
              className="rounded-full border border-rule px-4 py-2 text-[14px] font-medium text-ink"
            >
              Nowe zdjęcie
            </Button>
          </div>
          <ScanResult text={result} />
        </div>
      )}
    </section>
  );
}

export function MobileFileView({ onSwitchToCamera }: FileViewProps) {
  return (
    <section className="-mb-16 -mt-6 -mx-5 min-h-[calc(100dvh-7rem-env(safe-area-inset-bottom))] bg-paper px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-ink-faint">
            Skaner AI
          </p>
          <h1 className="mt-1 text-[28px] leading-none text-ink">
            Dodaj zdjęcia z plików
          </h1>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={onSwitchToCamera}
          icon={<CameraIcon size={16} weight="bold" />}
          className="rounded-full border border-rule bg-paper-2 px-3.5 py-2.5 text-[14px] font-medium text-ink"
        >
          Aparat
        </Button>
      </div>

      <div className="mx-auto mt-5 max-w-xl rounded-[28px] border border-rule bg-paper-2 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.08)]">
        <div className="mb-4 flex items-start gap-3 rounded-[22px] border border-amber/15 bg-amber/8 p-4">
          <div className="mt-0.5 rounded-full bg-amber/15 p-2 text-amber">
            <TextAlignLeftIcon size={18} weight="bold" />
          </div>
          <div>
            <p className="text-[15px] font-medium text-ink">
              Masz już zdjęcia w telefonie?
            </p>
            <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">
              Wybierz notatki, kartki albo slajdy. Aplikacja wyciągnie z nich
              tekst.
            </p>
          </div>
        </div>
        <Scanner />
      </div>
    </section>
  );
}

export function DesktopModeToggle({ mode, onSwitchMode }: ModeToggleProps) {
  return (
    <div className="flex w-fit items-center gap-1 rounded-sm border border-rule bg-paper-2 p-1">
      <button
        type="button"
        onClick={() => onSwitchMode("camera")}
        className={[
          "flex cursor-pointer items-center gap-2 rounded-sm px-3.5 py-2 text-[14px] font-medium transition-colors duration-200",
          mode === "camera"
            ? "bg-amber text-paper"
            : "text-ink-muted hover:text-ink",
        ].join(" ")}
      >
        <CameraIcon size={16} weight={mode === "camera" ? "fill" : "regular"} />
        Aparat
      </button>
      <button
        type="button"
        onClick={() => onSwitchMode("file")}
        className={[
          "flex cursor-pointer items-center gap-2 rounded-sm px-3.5 py-2 text-[14px] font-medium transition-colors duration-200",
          mode === "file"
            ? "bg-amber text-paper"
            : "text-ink-muted hover:text-ink",
        ].join(" ")}
      >
        <FilesIcon size={16} weight={mode === "file" ? "fill" : "regular"} />
        Pliki
      </button>
    </div>
  );
}

export function DesktopCameraView({
  capturedFile,
  previewUrl,
  loading,
  result,
  error,
  onCapture,
  onReset,
  onScan,
}: CameraViewProps) {
  const showPreview = capturedFile && !loading && !result && !error;
  const showError = error && !loading;
  const showResult = result && !loading;

  return (
    <div className="flex flex-col gap-6">
      {!capturedFile && (
        <>
          <p className="text-[15px] text-ink-faint">
            Zrób zdjęcie notatki, kartki lub slajdu. AI przetworzy je na tekst,
            który możesz wykorzystać w swoich fiszkach.
          </p>
          <CameraCapture onCapture={onCapture} />
        </>
      )}

      {showPreview && (
        <div className="flex flex-col gap-4">
          {previewUrl && (
            <div className="relative overflow-hidden rounded-sm border border-rule bg-black">
              <img
                src={previewUrl}
                alt="Zrobione zdjęcie"
                className="h-auto max-h-[min(50vh,calc(100dvh-320px))] w-full object-contain"
              />
            </div>
          )}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="primary"
              icon={<CameraIcon size={18} />}
              onClick={onScan}
              className="rounded-sm"
            >
              Skanuj
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onReset}
              className="rounded-sm"
            >
              Nowe zdjęcie
            </Button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-ink-muted">
          <SpinnerIcon size={18} className="animate-spin" />
          <span className="text-[15px]">
            AI analizuje zdjęcie (może to potrwać chwilę)…
          </span>
        </div>
      )}

      {showError && (
        <div className="rounded-sm border border-rating-1/20 bg-rating-1/8 p-4 text-[15px] text-rating-1">
          {error}
        </div>
      )}

      {showResult && <ScanResult text={result} />}
    </div>
  );
}

export function DesktopFileView() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[15px] text-ink-faint">
        Wybierz zdjęcia kartek, notatek lub slajdów. AI przetworzy je na tekst,
        który możesz wykorzystać w swoich fiszkach.
      </p>
      <Scanner />
    </div>
  );
}
