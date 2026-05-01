import { UploadIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
};

export function ScanDropZone({ onFiles, disabled }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || disabled) return;
      const images = Array.from(fileList).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (images.length) onFiles(images);
    },
    [onFiles, disabled],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  useEffect(() => {
    if (disabled) return;
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length) onFiles(files);
    };
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [onFiles, disabled]);

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={[
        "group relative flex flex-col items-center justify-center gap-3",
        "w-full h-40 rounded-sm border-2 border-dashed cursor-pointer",
        "transition-colors duration-200",
        dragOver
          ? "border-amber bg-amber/5"
          : "border-rule hover:border-amber/60 bg-paper-2",
        disabled && "opacity-50 cursor-not-allowed",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
        className="sr-only"
      />
      <UploadIcon
        size={28}
        className={[
          "transition-colors duration-200",
          dragOver ? "text-amber" : "text-ink-faint group-hover:text-amber",
        ].join(" ")}
      />
      <div className="text-center">
        <p className="text-[15px] text-ink-muted">
          Przeciągnij zdjęcia lub kliknij, aby wybrać
        </p>
        <p className="text-[13px] text-ink-faint mt-0.5">
          Możesz też wkleić ze schowka (Ctrl+V)
        </p>
      </div>
    </div>
  );
}
