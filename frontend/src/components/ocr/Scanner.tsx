import { Button } from "@cloudflare/kumo/components/button";
import { CameraIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useCallback, useState } from "react";

import { apiPost } from "../../lib/api";
import { ScanResponseSchema } from "../../lib/schemas";
import { compressImage } from "../../utils/image";
import { ScanDropZone } from "./ScanDropZone";
import { ScanImagePreview } from "./ScanImagePreview";
import { ScanResult } from "./ScanResult";

export const Scanner = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const addFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setResult("");
    setError("");
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleScan = async () => {
    if (files.length === 0) return;

    setLoading(true);
    setResult("");
    setError("");

    try {
      const images = await Promise.all(
        files.map((file) => compressImage(file)),
      );

      const res = await apiPost("/api/scan", ScanResponseSchema, { images });

      if (!res.ok) {
        throw new Error(res.message || "Błąd serwera");
      }

      setResult(res.data?.text || "");
    } catch (err: unknown) {
      console.error("Błąd skanera:", err);
      const message =
        err instanceof Error ? err.message : "Wystąpił nieznany błąd";
      setError(message);
    } finally {
      setLoading(false);
    }
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
              onClick={handleScan}
              disabled={loading}
              className="rounded-sm"
            >
              {loading ? "Analizowanie…" : "Skanuj"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setFiles([]);
                setResult("");
                setError("");
              }}
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

      {error && !loading && (
        <div className="bg-rating-1/8 border border-rating-1/20 rounded-sm p-4 text-rating-1 text-[15px]">
          {error}
        </div>
      )}

      {result && !loading && <ScanResult text={result} />}
    </div>
  );
};
