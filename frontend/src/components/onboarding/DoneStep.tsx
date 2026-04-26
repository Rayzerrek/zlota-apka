import { Label, Select } from "@cloudflare/kumo";
import { CheckIcon } from "@phosphor-icons/react";

type Props = {
  selectedCount: number;
  grade: string;
  onGradeChange: (value: string) => void;
};

export function DoneStep({ selectedCount, grade, onGradeChange }: Props) {
  return (
    <div className="flex flex-col items-center text-center gap-6">
      <div className="w-16 h-16 rounded-full bg-amber-wash border border-amber/20 grid place-items-center text-amber">
        <CheckIcon size={28} weight="bold" />
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="display italic text-[clamp(32px,5vw,44px)] font-normal leading-[0.95] tracking-[-0.02em] text-ink">
          Wszystko <em className="not-italic text-amber">gotowe</em>
        </h2>
        <p className="text-[16px] text-ink-muted leading-relaxed max-w-[360px] mx-auto">
          Masz wybrane {selectedCount} przedmiot
          {selectedCount === 1 ? "" : selectedCount < 5 ? "y" : "ów"}. Teraz
          możesz zacząć naukę.
        </p>
      </div>

      <div className="w-full max-w-[320px] flex flex-col gap-2 text-left">
        <Label htmlFor="grade" className="text-[14px] text-ink">
          Klasa <span className="text-rating-1">*</span>
        </Label>
        <Select
          value={grade}
          onValueChange={(v) => onGradeChange((v as string) ?? "")}
          required
          aria-label="Klasa"
          placeholder="Wybierz klasę"
        >
          <Select.Group>
            <Select.GroupLabel>Szkoła podstawowa</Select.GroupLabel>
            {Array.from({ length: 8 }, (_, i) => {
              const val = `${i + 1} SP`;
              return (
                <Select.Option key={val} value={val}>
                  {i + 1}
                </Select.Option>
              );
            })}
          </Select.Group>
          <Select.Separator />
          <Select.Group>
            <Select.GroupLabel>Szkoła średnia</Select.GroupLabel>
            {Array.from({ length: 5 }, (_, i) => {
              const val = `${i + 1} LO/TECH`;
              return (
                <Select.Option key={val} value={val}>
                  {i + 1}
                </Select.Option>
              );
            })}
          </Select.Group>
        </Select>
      </div>
    </div>
  );
}
