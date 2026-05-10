import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { apiPost } from "../lib/api";
import { type ApiError, ApiErrorException } from "../lib/error";
import { ScanResponseSchema } from "../lib/schemas";
import { compressImage } from "../utils/image";
import { queryKeys } from "./api/keys";

export type OcrState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; text: string }
  | { status: "error"; error: ApiError };

/**
 * Single source of truth for OCR scanning logic. Used by both the dropzone
 * Scanner component and the camera-based ScannerPage. Keeps image compression
 * and the `/api/scan` call in one place.
 */
export function useOcrScan() {
  const qc = useQueryClient();
  const [state, setState] = useState<OcrState>({ status: "idle" });

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  const scan = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      setState({ status: "loading" });

      try {
        const images = await Promise.all(
          files.map((file) => compressImage(file)),
        );
        const res = await apiPost("/api/scan", ScanResponseSchema, { images });

        if (!res.ok) {
          setState({ status: "error", error: res.error });
          return;
        }

        setState({ status: "success", text: res.data.text ?? "" });
        qc.invalidateQueries({ queryKey: queryKeys.notifications });
      } catch (err: unknown) {
        if (err instanceof ApiErrorException) {
          setState({ status: "error", error: err.apiError });
          return;
        }
        // compressImage throws on file/canvas failures; surface as network-shaped error.
        const message =
          err instanceof Error
            ? err.message
            : "Nie udało się przetworzyć obrazu";
        setState({
          status: "error",
          error: { tag: "http", status: 0, message },
        });
      }
    },
    [qc],
  );

  return { state, scan, reset };
}
