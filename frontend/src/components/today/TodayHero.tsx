import { Button } from "@cloudflare/kumo";
import { ArrowRightIcon, PlusIcon } from "@phosphor-icons/react";

type Props = {
  onStart: () => void;
  onAddExam: () => void;
};

export function TodayHero({ onStart, onAddExam }: Props) {
  return (
    <div className="flex flex-col gap-[18px] relative">
      <p className="text-base text-ink-muted max-w-[38ch] leading-[1.5]">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Est, aliquam!
        Doloremque ducimus corporis nulla impedit facilis illum veniam? Alias at
        repellat accusantium quas. Culpa ducimus fugiat ea, atque iusto cum?
      </p>
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        <Button
          size="lg"
          variant="ghost"
          onClick={onStart}
          className="bg-amber text-paper rounded-sm hover:bg-[#ffcc4a] hover:-translate-y-px active:translate-y-0 transition-all font-semibold px-7 py-4 tracking-[0.02em]"
        >
          Zacznij powtórkę
          <ArrowRightIcon size={18} weight="bold" className="ml-1" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={onAddExam}
          icon={<PlusIcon size={16} weight="bold" />}
          className="rounded-sm"
        >
          Dodaj sprawdzian
        </Button>
      </div>
    </div>
  );
}
