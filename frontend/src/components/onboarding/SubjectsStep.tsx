import { Button } from "@cloudflare/kumo";
import {
  AtomIcon,
  BookOpenTextIcon,
  CheckIcon,
  DnaIcon,
  FlaskIcon,
  FunctionIcon,
  ScrollIcon,
  TranslateIcon,
} from "@phosphor-icons/react";

import { cn } from "../../utils/cn";
import { SUBJECTS } from "../../utils/subjects";

import type { SubjectKey } from "../../types";

const SUBJECT_ICONS: Record<SubjectKey, typeof FunctionIcon> = {
  mat: FunctionIcon,
  bio: DnaIcon,
  hist: ScrollIcon,
  pol: BookOpenTextIcon,
  chem: FlaskIcon,
  fiz: AtomIcon,
  ang: TranslateIcon,
};

const SUBJECT_BGS: Record<SubjectKey, string> = {
  mat: "bg-sub-mat/10 text-sub-mat border-sub-mat/20",
  bio: "bg-sub-bio/10 text-sub-bio border-sub-bio/20",
  hist: "bg-sub-hist/10 text-sub-hist border-sub-hist/20",
  pol: "bg-sub-pol/10 text-sub-pol border-sub-pol/20",
  chem: "bg-sub-chem/10 text-sub-chem border-sub-chem/20",
  fiz: "bg-sub-fiz/10 text-sub-fiz border-sub-fiz/20",
  ang: "bg-sub-ang/10 text-sub-ang border-sub-ang/20",
};

type Props = {
  selected: Set<SubjectKey>;
  onToggle: (key: SubjectKey) => void;
};

export function SubjectsStep({ selected, onToggle }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="display italic text-[28px] font-normal leading-[0.95] tracking-[-0.02em] text-ink">
          Z czego chcesz się <em className="not-italic text-amber">uczyć</em>?
        </h2>
        <p className="text-[14px] text-ink-muted mt-2">
          Wybierz co najmniej jeden przedmiot. Zawsze możesz zmienić to w
          ustawieniach.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {(Object.keys(SUBJECTS) as SubjectKey[]).map((key) => {
          const Icon = SUBJECT_ICONS[key];
          const isActive = selected.has(key);
          return (
            <Button
              key={key}
              type="button"
              variant="ghost"
              onClick={() => onToggle(key)}
              className={cn(
                "relative flex flex-col items-center gap-2.5 p-4 rounded-[4px] border text-left transition-all duration-200 bg-transparent",
                isActive
                  ? "border-amber bg-amber-wash shadow-[0_0_0_1px_var(--color-amber)_inset]"
                  : "border-rule hover:border-rule-strong hover:-translate-y-0.5",
              )}
            >
              {isActive && (
                <span className="absolute top-2 right-2 text-amber">
                  <CheckIcon size={14} weight="bold" />
                </span>
              )}
              <div
                className={cn(
                  "w-10 h-10 rounded-sm grid place-items-center border",
                  SUBJECT_BGS[key],
                )}
              >
                <Icon size={20} weight="duotone" />
              </div>
              <span
                className={cn(
                  "text-[14px] font-medium",
                  isActive ? "text-ink" : "text-ink-muted",
                )}
              >
                {SUBJECTS[key].name}
              </span>
            </Button>
          );
        })}
      </div>

      <p className="text-center mono text-[12px] text-ink-faint tracking-[0.08em]">
        Wybrano {selected.size} / {Object.keys(SUBJECTS).length}
      </p>
    </div>
  );
}
