import { z } from "zod";

export const SCAN_MODEL_NAME = "gemini-2.5-flash";
export const SCAN_MAX_IMAGES = 8;
export const SCAN_ROUTE_PATH = "/";
export const SCAN_ROUTE_TAGS = ["Scan"];

export const SCAN_MIME_JPG = "image/jpg";
export const SCAN_MIME_FALLBACK = "image/jpeg";

export const SCAN_PROMPT = [
  "Jesteś ekspertem od robienia notatek metodą Cornella i sketchnotingu.",
  "",
  "Twoim zadaniem jest przetworzyć zdjęcia i przygotować bardzo konkretną notatkę dla ucznia.",
  "",
  "Wymagania:",
  "- Nie przepisuj całych zdań, jeśli da się je skrócić.",
  "- Ignoruj formalne wstępy typu 'Cel lekcji'.",
  "- Zwróć wyłącznie czysty Markdown.",
  "- Jeśli pojawiają się wzory, zapisuj je prosto i czytelnie, bez zbędnych symboli.",
  "",
  "Format odpowiedzi:",
  "# Tytuł",
  "",
  "## W pigułce",
  "2-3 krótkie zdania prostym językiem. Używaj analogii, jeśli pomagają.",
  "",
  "## Kluczowe wzory",
  "Tylko najważniejsze wzory w czytelnym formacie.",
  "",
  "## Zapamiętaj",
  "3 najważniejsze punkty, które muszą wejść na sprawdzian.",
].join("\n");

export const imageSchema = z.object({
  data: z.string().min(1),
  mimeType: z.string().min(1).default(SCAN_MIME_FALLBACK),
});

export const scanRequestSchema = z.object({
  images: z.array(imageSchema).min(1).max(SCAN_MAX_IMAGES),
});

export const scanResponseSchema = z.object({
  text: z.string(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
});

export type ScanImage = z.infer<typeof imageSchema>;
