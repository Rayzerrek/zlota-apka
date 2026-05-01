import {
  ArrowCounterClockwiseIcon,
  CameraIcon,
  CheckIcon,
  FlashlightIcon,
  SpinnerIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  onCapture: (file: File) => void;
};

export function CameraCapture({ onCapture }: Props) {
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
    startCamera(facing);
    return () => stopStream();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup captured Object URL on unmount or when captured changes
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
      <div className="flex flex-col items-center justify-center gap-5 py-16 px-6 bg-paper-2 border border-rule rounded-sm">
        <div className="w-16 h-16 rounded-full bg-rating-1/10 flex items-center justify-center">
          <WarningCircleIcon size={32} className="text-rating-1" />
        </div>
        <p className="text-[15px] text-ink-muted text-center max-w-72">
          {error}
        </p>
        <button
          type="button"
          onClick={() => startCamera(facing)}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber text-paper rounded-sm text-[15px] font-medium cursor-pointer transition-colors duration-200 hover:bg-amber-dim"
        >
          <ArrowCounterClockwiseIcon size={16} weight="bold" />
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  if (captured && capturedFile) {
    return (
      <div className="relative flex flex-col">
        <div className="relative rounded-sm overflow-hidden border border-rule bg-black">
          <img
            src={captured}
            alt="Zrobione zdjęcie"
            className="w-full h-auto max-h-[min(60vh,calc(100dvh-240px))] object-contain"
          />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-5 left-5 w-8 h-8 border-t-2 border-l-2 border-amber/70 rounded-tl-sm" />
            <div className="absolute top-5 right-5 w-8 h-8 border-t-2 border-r-2 border-amber/70 rounded-tr-sm" />
            <div className="absolute bottom-5 left-5 w-8 h-8 border-b-2 border-l-2 border-amber/70 rounded-bl-sm" />
            <div className="absolute bottom-5 right-5 w-8 h-8 border-b-2 border-r-2 border-amber/70 rounded-br-sm" />
          </div>

          <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-3 z-10">
            <button
              type="button"
              onClick={handleRetake}
              className="flex items-center gap-2 px-5 py-3 bg-paper-3/90 border border-rule rounded-sm text-ink-muted text-[15px] font-medium cursor-pointer transition-colors duration-200 hover:bg-paper-2 hover:text-ink shadow-lg"
            >
              <ArrowCounterClockwiseIcon size={18} weight="bold" />
              Powtórz
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-2 px-6 py-3 bg-amber text-paper rounded-sm text-[15px] font-medium cursor-pointer transition-colors duration-200 hover:bg-amber-dim shadow-lg"
            >
              <CheckIcon size={18} weight="bold" />
              Skanuj zdjęcie
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col">
      <div className="relative rounded-sm overflow-hidden border border-rule bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto max-h-[min(60vh,calc(100dvh-240px))] object-cover"
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

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-amber/60 rounded-tl-sm" />
          <div className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-amber/60 rounded-tr-sm" />
          <div className="absolute bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 border-amber/60 rounded-bl-sm" />
          <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-amber/60 rounded-br-sm" />
        </div>

        <div className="absolute top-3 right-3 flex gap-2">
          <button
            type="button"
            onClick={handleSwitchFacing}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 cursor-pointer transition-colors duration-200 hover:bg-black/60"
            aria-label="Zmień kamerę"
          >
            <CameraIcon size={16} weight="bold" />
          </button>
          <button
            type="button"
            onClick={handleFlash}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-black/60"
            aria-label={flashOn ? "Wyłącz lampę" : "Włącz lampę"}
          >
            <FlashlightIcon
              size={16}
              weight={flashOn ? "fill" : "regular"}
              className={flashOn ? "text-amber" : "text-white/80"}
            />
          </button>
        </div>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
          <button
            type="button"
            onClick={handleCapture}
            disabled={!ready}
            className="relative w-18 h-18 rounded-full border-3 border-amber bg-transparent flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl"
            aria-label="Zrób zdjęcie"
          >
            <div className="w-15 h-15 rounded-full bg-amber" />
          </button>
        </div>
      </div>
    </div>
  );
}
