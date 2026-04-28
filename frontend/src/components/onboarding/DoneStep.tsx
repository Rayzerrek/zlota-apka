import { CheckIcon } from "@phosphor-icons/react";

type Props = {
  selectedCount: number;
};

export function DoneStep({ selectedCount }: Props) {
  return (
    <div className="flex flex-col items-center text-center gap-6">
      <div className="w-16 h-16 rounded-full bg-amber-wash border border-amber/20 grid place-items-center text-amber">
        <CheckIcon size={28} weight="bold" />
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="display italic text-[clamp(32px,5vw,44px)] font-normal leading-[0.95] text-ink">
          Wszystko <em className="not-italic text-amber">gotowe</em>
        </h2>
        <p className="text-[16px] text-ink-muted leading-relaxed max-w-[360px] mx-auto">
          Masz wybrane {selectedCount} przedmiot
          {selectedCount === 1 ? "" : selectedCount < 5 ? "y" : "ów"}. Teraz
          możesz zacząć naukę.
        </p>
      </div>
    </div>
  );
}
