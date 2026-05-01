import { TrashIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { revokeObjectUrl } from "../../utils/image";

type Props = {
  files: File[];
  onRemove: (index: number) => void;
};

export function ScanImagePreview({ files, onRemove }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {files.map((file, i) => (
        <PreviewItem
          key={`${file.name}-${file.size}-${file.lastModified}`}
          file={file}
          onRemove={() => onRemove(i)}
        />
      ))}
    </div>
  );
}

function PreviewItem({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => revokeObjectUrl(objectUrl);
  }, [file]);

  if (!url) {
    return (
      <div className="relative w-24 h-24 rounded-sm border border-rule overflow-hidden bg-paper-2 animate-pulse" />
    );
  }

  return (
    <div className="relative group w-24 h-24 rounded-sm border border-rule overflow-hidden bg-paper-2">
      <img src={url} alt={file.name} className="w-full h-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 p-1 bg-paper/80 rounded-sm text-rating-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
        aria-label="Usuń zdjęcie"
      >
        <TrashIcon size={14} weight="bold" />
      </button>
    </div>
  );
}
