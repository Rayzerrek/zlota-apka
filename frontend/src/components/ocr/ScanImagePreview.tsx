import { TrashIcon } from "@phosphor-icons/react";
import { useEffect } from "react";

import { fileToObjectUrl, revokeObjectUrl } from "../../utils/image";

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
  const url = fileToObjectUrl(file);

  useEffect(() => {
    return () => revokeObjectUrl(url);
  }, [url]);

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
