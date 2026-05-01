import { Button } from "@cloudflare/kumo";
import { CameraIcon, FilesIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";

import { PageHead } from "../components/layout/PageHead";
import { CameraCapture } from "../components/ocr/CameraCapture";
import { Scanner } from "../components/ocr/Scanner";
import { ScanResult } from "../components/ocr/ScanResult";
import { apiPost } from "../lib/api";
import { compressImage } from "../utils/image";

type Mode = "camera" | "file";

export function ScannerPage() {
  const [mode, setMode] = useState<Mode>("camera");
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let url: string | null = null;
    if (capturedFile) {
      url = URL.createObjectURL(capturedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [capturedFile]);

  const handleCameraCapture = useCallback((file: File) => {
    setCapturedFile(file);
  }, []);

  const handleScanCaptured = useCallback(async () => {
    if (!capturedFile) return;

    setLoading(true);
    setResult("");
    setError("");

    try {
      const image = await compressImage(capturedFile);
      const res = await apiPost<{ text?: string }>("/api/scan", {
        images: [image],
      });

      if (!res.ok) {
        throw new Error(res.message || "Błąd serwera");
      }

      setResult(res.data?.text || "");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Wystąpił nieznany błąd";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [capturedFile]);

  const handleNewPhoto = useCallback(() => {
    setCapturedFile(null);
    setResult("");
    setError("");
  }, []);

  return (
    <>
      <PageHead
        eyebrow="Optyczne rozpoznawanie znaków"
        title={
          <>
            <em>Skaner AI</em>
          </>
        }
      />

      <section className="enter enter-d1 flex flex-col gap-6 max-w-[700px]">
        <div className="flex items-center gap-1 p-1 bg-paper-2 border border-rule rounded-sm w-fit">
          <button
            type="button"
            onClick={() => {
              setMode("camera");
              setCapturedFile(null);
              setResult("");
              setError("");
            }}
            className={[
              "flex items-center gap-2 px-3.5 py-2 rounded-sm text-[14px] font-medium cursor-pointer transition-colors duration-200",
              mode === "camera"
                ? "bg-amber text-paper"
                : "text-ink-muted hover:text-ink",
            ].join(" ")}
          >
            <CameraIcon
              size={16}
              weight={mode === "camera" ? "fill" : "regular"}
            />
            Aparat
          </button>
          <button
            type="button"
            onClick={() => setMode("file")}
            className={[
              "flex items-center gap-2 px-3.5 py-2 rounded-sm text-[14px] font-medium cursor-pointer transition-colors duration-200",
              mode === "file"
                ? "bg-amber text-paper"
                : "text-ink-muted hover:text-ink",
            ].join(" ")}
          >
            <FilesIcon
              size={16}
              weight={mode === "file" ? "fill" : "regular"}
            />
            Pliki
          </button>
        </div>

        {mode === "camera" ? (
          <div className="flex flex-col gap-6">
            {!capturedFile && (
              <>
                <p className="text-[15px] text-ink-faint">
                  Zrób zdjęcie notatki, kartki lub slajdu. AI przetworzy je na
                  tekst, który możesz wykorzystać w swoich fiszkach.
                </p>
                <CameraCapture onCapture={handleCameraCapture} />
              </>
            )}

            {capturedFile && !loading && !result && !error && (
              <div className="flex flex-col gap-4">
                {previewUrl && (
                  <div className="relative rounded-sm overflow-hidden border border-rule bg-black">
                    <img
                      src={previewUrl}
                      alt="Zrobione zdjęcie"
                      className="w-full h-auto max-h-[min(50vh,calc(100dvh-320px))] object-contain"
                    />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="primary"
                    icon={<CameraIcon size={18} />}
                    onClick={handleScanCaptured}
                    className="rounded-sm"
                  >
                    Skanuj
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleNewPhoto}
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

            {error && !loading && (
              <div className="bg-rating-1/8 border border-rating-1/20 rounded-sm p-4 text-rating-1 text-[15px]">
                {error}
              </div>
            )}

            {result && !loading && <ScanResult text={result} />}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-[15px] text-ink-faint">
              Wybierz zdjęcia kartek, notatek lub slajdów. AI przetworzy je na
              tekst, który możesz wykorzystać w swoich fiszkach.
            </p>
            <Scanner />
          </div>
        )}
      </section>
    </>
  );
}
