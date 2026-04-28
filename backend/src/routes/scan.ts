import { Hono } from 'hono';
import { GoogleGenerativeAI } from "@google/generative-ai";

const scanRouter = new Hono<{ Bindings: { API_KEY: string } }>();

scanRouter.post('/', async (c) => {
    
  try {
    const { images } = await c.req.json() as { images: { data: string, mimeType: string }[] };
    const currentKey = c.env.API_KEY;

    
    // Upewniamy się, że klucz istnieje
    if (!currentKey) {
      return c.json({ error: "Brak klucza API w .dev.vars" }, 500);
    }

    const genAI = new GoogleGenerativeAI(currentKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Jesteś ekspertem od robienia notatek (metoda Cornella/sketchnoting).

Twoim zadaniem jest przetworzyć zdjęcia i przygotować ekstremalnie konkretną notatkę dla ucznia.



Zasady:

1. NIE PRZEPISUJ całych zdań.

2. Używaj formatu:

   - Tytuł (krótki).

   - "W pigułce": 2-3 zdania wyjaśniające temat prostym językiem (używaj analogii).

   - "Kluczowe wzory": tylko najważniejsze formuły w czytelnym formacie.

   - "Zapamiętaj": 3 najważniejsze punkty, które na pewno będą na sprawdzianie.

3. Ignoruj formalne wstępy typu "Cel lekcji".

4. Zwracaj czysty tekst w formacie Markdown.
5.Jeżeli w notatce pojawią się wzory zapisuj je w sposób zrozumiały, unikając znaków i symboli takich jak "$"`;

    // Mapujemy obrazy poprawnie składniowo
    const imageParts = images.map((img) => {
      const rawMimeType = img.mimeType || "image/jpeg";
      let type = rawMimeType.split(';')[0].toLowerCase();
      if (type === 'image/jpg') type = 'image/jpeg';

      return {
        inlineData: {
          data: img.data,
          mimeType: type
        }
      };
    });

    const result = await model.generateContent([
      prompt,
      ...imageParts
    ]);

    return c.json({ text: result.response.text() });
  } catch (error: any) {
    console.error("Błąd AI:", error);
    return c.json({ error: error.message || "Błąd podczas generowania notatki" }, 500);
  }
});

export default scanRouter;