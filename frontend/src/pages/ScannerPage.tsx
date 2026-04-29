import { PageHead } from "../components/layout/PageHead";
import { Scanner } from "../components/ocr/Scanner";

export function ScannerPage() {
  return (
    <>
      <PageHead
        eyebrow="Optyczne rozpoznawanie znaków"
        title={
          <>
            <em>Skaner AI</em>
          </>
        }
      />

      <section className="enter enter-d1 flex flex-col gap-6 max-w-[700px]">
        <div className="pb-3 border-b border-rule flex items-baseline gap-3">
          <span className="mono text-xs text-amber">01 —</span>
          <h2 className="display text-[23px] text-ink">Wgraj zdjęcia</h2>
        </div>
        <p className="text-[15px] text-ink-faint -mt-2">
          Wybierz zdjęcia kartek, notatek lub slajdów. AI przetworzy je na
          tekst, który możesz wykorzystać w swoich fiszkach.
        </p>
        <Scanner />
      </section>
    </>
  );
}
