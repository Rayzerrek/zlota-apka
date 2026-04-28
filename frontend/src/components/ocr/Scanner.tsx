import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

// 1. Wyciągamy funkcję kompresji NA ZEWNĄTRZ, żeby nie śmieciła w komponencie
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1280;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = (MAX_WIDTH / width) * height;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Kompresja do 70% jakości - kluczowe dla uniknięcia błędu 503
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64.split(',')[1]);
      };
    };
  });
};

export const Scanner = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleVision = async (files: File[]) => {
    if (files.length === 0) return;

    setLoading(true);
    setResult("");

    try {
      // 2. Przetwarzamy wszystkie pliki przez kompresję
      // Używamy "files" (to co wpada do funkcji), a nie "selectedFiles"
      const processedImages = await Promise.all(
        files.map(async (file: File) => ({
          data: await compressImage(file),
          mimeType: "image/jpeg",
        }))
      );

      // 3. Wysyłamy "lekkie" zdjęcia do backendu
      const response = await fetch("http://127.0.0.1:8787/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: processedImages }),
      });

      const data = await response.json() as { text?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Błąd serwera (możliwe przeciążenie AI)");
      }

      setResult(data.text || "");
    } catch (err: any) {
      console.error("Szczegóły błędu:", err);
      setResult("Błąd: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-paper-2 border-2 border-amber rounded-2xl p-8 mt-10 shadow-2xl text-center">
      <h2 className="font-display text-3xl text-amber mb-6 italic underline decoration-amber/30">Skaner AI</h2>
      
      <div className="flex flex-col items-center gap-4">
        <input 
          type="file" 
          accept="image/*"
          multiple 
          onChange={(e) => {
            if (e.target.files) {
              handleVision(Array.from(e.target.files));
            }
          }}
          className="block w-full max-w-xs text-sm text-ink-muted file:bg-amber file:text-paper file:px-6 file:py-3 file:rounded-full file:border-0 hover:file:opacity-80 cursor-pointer"
        />
        {loading && (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber"></div>
            <p className="text-amber font-bold">AI analizuje zdjęcia (może to potrwać chwilę)...</p>
          </div>
        )}
      </div>

      {result && (
        <div className="mt-8 bg-white/50 p-6 rounded-xl border border-amber shadow-inner text-left">
          <p className="text-[10px] uppercase font-bold text-amber mb-4 tracking-widest">
             Twoja Notatka:
          </p>
          <div className="text-ink text-lg leading-relaxed prose prose-amber max-w-none">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};