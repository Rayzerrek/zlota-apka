import { Button } from "@cloudflare/kumo";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

type Props = {
  onPrev: () => void;
  onToday: () => void;
  onNext: () => void;
};

export function CalendarNav({ onPrev, onToday, onNext }: Props) {
  return (
    <div className="flex gap-2.5 mb-5 items-center justify-center">
      <Button
        variant="outline"
        icon={CaretLeftIcon}
        onClick={onPrev}
        className="rounded-sm ring-rule-strong text-ink hover:ring-amber hover:text-amber"
      >
        Poprzedni
      </Button>
      <Button
        variant="outline"
        onClick={onToday}
        className="rounded-sm ring-rule-strong text-ink hover:ring-amber hover:text-amber"
      >
        Dziś
      </Button>
      <Button
        variant="outline"
        onClick={onNext}
        className="rounded-sm ring-rule-strong text-ink hover:ring-amber hover:text-amber"
      >
        Następny
        <CaretRightIcon size={14} />
      </Button>
    </div>
  );
}
