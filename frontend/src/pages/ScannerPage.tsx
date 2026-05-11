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
import { useMobile } from "../hooks/useMobile";
import { useOcrScan } from "../hooks/useOcrScan";
import { apiErrorMessage } from "../lib/error";

type Mode = ScannerPageMode;

export function ScannerPage() {
  const isMobile = useMobile();
  const [mode, setMode] = useState<Mode>("camera");
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const { state, scan, reset: resetScan } = useOcrScan();

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
    resetScan();
  }, [resetScan]);

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

  const handleScanCaptured = useCallback(() => {
    if (!capturedFile) return;
    scan([capturedFile]);
  }, [capturedFile, scan]);

  const cameraViewProps: CameraViewProps = {
    capturedFile,
    previewUrl,
    loading: state.status === "loading",
    result: state.status === "success" ? state.text : "",
    error: state.status === "error" ? apiErrorMessage(state.error) : "",
    onCapture: handleCameraCapture,
    onReset: resetCameraFlow,
    onScan: handleScanCaptured,
  };

  return (
    <>
      {isMobile ? (
        mode === "camera" ? (
          <MobileCameraView
            {...cameraViewProps}
            onSwitchToFile={() => switchMode("file")}
          />
        ) : (
          <MobileFileView onSwitchToCamera={() => switchMode("camera")} />
        )
      ) : (
        <>
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
        </>
      )}
    </>
  );
}
