import { Button } from "@cloudflare/kumo/components/button";
import { CameraIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useCallback, useState } from "react";

import { useOcrScan } from "../../hooks/useOcrScan";
import { ErrorState } from "../ui/ErrorState";
import { ScanDropZone } from "./ScanDropZone";
import { ScanImagePreview } from "./ScanImagePreview";
import { ScanResult } from "./ScanResult";

export const Scanner = () => {
  const [files, setFiles] = useState<File[]>([]);
  const { state, scan, reset } = useOcrScan();
  const loading = state.status === "loading";

  const addFiles = useCallback(
    (newFiles: File[]) => {
      setFiles((prev) => [...prev, ...newFiles]);
      reset();
    },
    [reset],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clear = () => {
    setFiles([]);
    reset();
  };

  const hasFiles = files.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <ScanDropZone onFiles={addFiles} disabled={loading} />

      {hasFiles && (
        <div className="flex flex-col gap-4">
          <ScanImagePreview files={files} onRemove={removeFile} />

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="primary"
              icon={<CameraIcon size={18} />}
              onClick={() => scan(files)}
              disabled={loading}
              className="rounded-sm"
            >
              {loading ? "Analizowanie…" : "Skanuj"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={clear}
              disabled={loading}
              className="rounded-sm"
            >
              Wyczyść
            </Button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-ink-muted">
          <SpinnerIcon size={18} className="animate-spin" />
          <span className="text-[15px]">
            AI analizuje zdjęcia (może to potrwać chwilę)…
          </span>
        </div>
      )}

      {state.status === "error" && <ErrorState error={state.error} />}

      {state.status === "success" && state.text && (
        <ScanResult text={state.text} />
      )}
    </div>
  );
};
