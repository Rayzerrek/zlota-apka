import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PageHead } from "../components/layout/PageHead";
import {
  type CameraViewProps,
  DesktopCameraView,
  DesktopFileView,
  DesktopModeToggle,
  MobileCameraView,
  MobileFileView,
  type ScannerPageMode,
} from "../components/ocr/ScannerPageViews";
import { queryKeys } from "../hooks/api/keys";
import { apiPost } from "../lib/api";
import { ScanResponseSchema } from "../lib/schemas";
import { compressImage } from "../utils/image";

type Mode = ScannerPageMode;

export function ScannerPage() {
  const [mode, setMode] = useState<Mode>("camera");
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const qc = useQueryClient();

  const previewUrl = useMemo(
    () => (capturedFile ? URL.createObjectURL(capturedFile) : null),
    [capturedFile],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const resetCameraFlow = useCallback(() => {
    setCapturedFile(null);
    setResult("");
    setError("");
  }, []);

  const switchMode = useCallback(
    (nextMode: Mode) => {
      setMode(nextMode);
      resetCameraFlow();
    },
    [resetCameraFlow],
  );

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
      const res = await apiPost("/api/scan", ScanResponseSchema, {
        images: [image],
      });

      if (!res.ok) {
        throw new Error(res.message || "Błąd serwera");
      }

      setResult(res.data?.text || "");
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Wystąpił nieznany błąd";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [capturedFile, qc]);

  const cameraViewProps: CameraViewProps = {
    capturedFile,
    previewUrl,
    loading,
    result,
    error,
    onCapture: handleCameraCapture,
    onReset: resetCameraFlow,
    onScan: handleScanCaptured,
  };

  return (
    <>
      <div className="md:hidden">
        {mode === "camera" ? (
          <MobileCameraView
            {...cameraViewProps}
            onSwitchToFile={() => switchMode("file")}
          />
        ) : (
          <MobileFileView onSwitchToCamera={() => switchMode("camera")} />
        )}
      </div>

      <div className="hidden md:block">
        <PageHead
          eyebrow="Optyczne rozpoznawanie znaków"
          title={
            <>
              <em>Skaner AI</em>
            </>
          }
        />

        <section className="enter enter-d1 flex max-w-[700px] flex-col gap-6">
          <DesktopModeToggle mode={mode} onSwitchMode={switchMode} />

          {mode === "camera" ? (
            <DesktopCameraView {...cameraViewProps} />
          ) : (
            <DesktopFileView />
          )}
        </section>
      </div>
    </>
  );
}
