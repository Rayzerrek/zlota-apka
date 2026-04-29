export type CompressedImage = {
  data: string;
  mimeType: string;
};

const MAX_WIDTH = 1280;
const QUALITY = 0.7;

export function compressImage(file: File): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = () => reject(new Error("Nie udało się odczytać pliku"));
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onerror = () => reject(new Error("Nie udało się załadować obrazu"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = (MAX_WIDTH / width) * height;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Brak wsparcia dla canvas"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", QUALITY);
        resolve({
          data: compressedBase64.split(",")[1],
          mimeType: "image/jpeg",
        });
      };
    };
  });
}

export function fileToObjectUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeObjectUrl(url: string) {
  URL.revokeObjectURL(url);
}
