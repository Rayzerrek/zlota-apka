export function WelcomeStep() {
  return (
    <div className="flex flex-col items-center text-center gap-6">
      <div className="w-16 h-16 rounded-sm bg-amber-wash border border-amber/20 grid place-items-center text-amber">
        <span className="display italic font-semibold text-[28px]">N</span>
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="display italic text-[clamp(32px,5vw,44px)] font-normal leading-[0.95] tracking-[-0.02em] text-ink">
          Witaj w <em className="not-italic text-amber">Nazwa</em>
        </h1>
        <p className="text-[16px] text-ink-muted leading-relaxed max-w-[360px] mx-auto">
          Skonfiguruj swoją naukę w pół minuty. Wybierz przedmioty, a my
          przygotujemy dla Ciebie plan.
        </p>
      </div>
    </div>
  );
}
