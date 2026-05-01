import { Button } from "@cloudflare/kumo";
import {
  ArrowCounterClockwiseIcon,
  CameraIcon,
  CheckIcon,
  FlashlightIcon,
  SpinnerIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "../../utils/cn";

type Props = {
  onCapture: (file: File) => void;
  immersive?: boolean;
};

export function CameraCapture({ onCapture, immersive = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");

  const stopStream = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(
    async (faceMode: "environment" | "user") => {
      setError("");
      setReady(false);
      stopStream();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: faceMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        await video.play();
        setReady(true);
      } catch {
        setError(
          "Nie można uzyskać dostępu do kamery. Sprawdź uprawnienia w ustawieniach przeglądarki.",
        );
      }
    },
    [stopStream],
  );

  useEffect(() => {
    void (async () => {
      await startCamera(facing);
    })();

    return () => stopStream();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (captured) URL.revokeObjectURL(captured);
    };
  }, [captured]);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facing === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `scan-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const url = URL.createObjectURL(blob);
        setCaptured(url);
        setCapturedFile(file);
      },
      "image/jpeg",
      0.92,
    );

    stopStream();
  }, [facing, stopStream]);

  const handleFlash = useCallback(async () => {
    const stream = streamRef.current;
    if (!stream) return;

    const track = stream.getVideoTracks()[0];
    if (!track) return;

    try {
      await track.applyConstraints({
        advanced: [{ torch: !flashOn } as MediaTrackConstraintSet],
      });
      setFlashOn(!flashOn);
    } catch {
      setFlashOn(false);
    }
  }, [flashOn]);

  const handleRetake = useCallback(() => {
    if (captured) URL.revokeObjectURL(captured);
    setCaptured(null);
    setCapturedFile(null);
    startCamera(facing);
  }, [captured, facing, startCamera]);

  const handleConfirm = useCallback(() => {
    if (capturedFile) {
      onCapture(capturedFile);
    }
  }, [capturedFile, onCapture]);

  const handleSwitchFacing = useCallback(() => {
    const next = facing === "environment" ? "user" : "environment";
    setFacing(next);
    startCamera(next);
  }, [facing, startCamera]);

  if (error) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-5 py-16 px-6",
          immersive
            ? "h-full bg-black text-white"
            : "bg-paper-2 border border-rule rounded-sm",
        )}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rating-1/10">
          <WarningCircleIcon size={32} className="text-rating-1" />
        </div>
        <p
          className={cn(
            "max-w-72 text-center text-[15px]",
            immersive ? "text-white/80" : "text-ink-muted",
          )}
        >
          {error}
        </p>
        <Button
          type="button"
          variant="primary"
          icon={<ArrowCounterClockwiseIcon size={16} weight="bold" />}
          onClick={() => startCamera(facing)}
          className="rounded-full px-5 py-2.5 text-[15px] font-medium"
        >
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  if (captured && capturedFile) {
    return (
      <div className={cn("relative flex flex-col", immersive && "h-full")}>
        <div
          className={cn(
            "relative overflow-hidden bg-black",
            immersive ? "h-full" : "rounded-sm border border-rule",
          )}
        >
          <img
            src={captured}
            alt="Zrobione zdjęcie"
            className={cn(
              "w-full",
              immersive
                ? "h-full object-cover"
                : "h-auto max-h-[min(60vh,calc(100dvh-240px))] object-contain",
            )}
          />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-5 top-5 h-8 w-8 rounded-tl-sm border-l-2 border-t-2 border-amber/70" />
            <div className="absolute right-5 top-5 h-8 w-8 rounded-tr-sm border-r-2 border-t-2 border-amber/70" />
            <div className="absolute bottom-5 left-5 h-8 w-8 rounded-bl-sm border-b-2 border-l-2 border-amber/70" />
            <div className="absolute bottom-5 right-5 h-8 w-8 rounded-br-sm border-b-2 border-r-2 border-amber/70" />
          </div>

          <div
            className={cn(
              "absolute left-0 right-0 z-10 flex items-center justify-center gap-3",
              immersive
                ? "bottom-[calc(1.25rem+env(safe-area-inset-bottom))] px-4"
                : "bottom-5",
            )}
          >
            <Button
              type="button"
              variant="ghost"
              icon={<ArrowCounterClockwiseIcon size={18} weight="bold" />}
              onClick={handleRetake}
              className="rounded-full border border-rule bg-paper-3/90 px-5 py-3 text-[15px] font-medium text-ink-muted shadow-lg hover:bg-paper-2 hover:text-ink"
            >
              Powtórz
            </Button>
            <Button
              type="button"
              variant="primary"
              icon={<CheckIcon size={18} weight="bold" />}
              onClick={handleConfirm}
              className="rounded-full px-6 py-3 text-[15px] font-medium shadow-lg"
            >
              Skanuj zdjęcie
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative flex flex-col", immersive && "h-full")}>
      <div
        className={cn(
          "relative overflow-hidden bg-black",
          immersive ? "h-full" : "rounded-sm border border-rule",
        )}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "w-full object-cover",
            immersive
              ? "h-full"
              : "h-auto max-h-[min(60vh,calc(100dvh-240px))]",
          )}
          style={facing === "user" ? { transform: "scaleX(-1)" } : undefined}
        />

        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80">
            <SpinnerIcon size={32} className="animate-spin text-amber" />
            <span className="text-[15px] text-amber/80">
              Uruchamianie kamery…
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-6 top-6 h-10 w-10 rounded-tl-sm border-l-2 border-t-2 border-amber/60" />
          <div className="absolute right-6 top-6 h-10 w-10 rounded-tr-sm border-r-2 border-t-2 border-amber/60" />
          <div className="absolute bottom-6 left-6 h-10 w-10 rounded-bl-sm border-b-2 border-l-2 border-amber/60" />
          <div className="absolute bottom-6 right-6 h-10 w-10 rounded-br-sm border-b-2 border-r-2 border-amber/60" />
        </div>

        <div
          className={cn(
            "absolute z-10 flex gap-2",
            immersive
              ? "right-4 top-[max(1rem,env(safe-area-inset-top))]"
              : "right-3 top-3",
          )}
        >
          <button
            type="button"
            onClick={handleSwitchFacing}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-colors duration-200 hover:bg-black/60"
            aria-label="Zmień kamerę"
          >
            <CameraIcon size={16} weight="bold" />
          </button>
          <button
            type="button"
            onClick={handleFlash}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-colors duration-200 hover:bg-black/60"
            aria-label={flashOn ? "Wyłącz lampę" : "Włącz lampę"}
          >
            <FlashlightIcon
              size={16}
              weight={flashOn ? "fill" : "regular"}
              className={flashOn ? "text-amber" : "text-white/80"}
            />
          </button>
        </div>

        <div
          className={cn(
            "absolute left-1/2 z-10 -translate-x-1/2",
            immersive
              ? "bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"
              : "bottom-5",
          )}
        >
          <button
            type="button"
            onClick={handleCapture}
            disabled={!ready}
            className="relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-3 border-amber bg-transparent shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Zrób zdjęcie"
          >
            <div className="h-16 w-16 rounded-full bg-amber" />
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
