import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title?: ReactNode;
  date?: string;
};

export function PageHead({ eyebrow, title, date }: Props) {
  return (
    <div className="flex items-end justify-between gap-4 mb-9 pb-4 border-b border-rule">
      <div className="flex flex-col gap-2">
        {eyebrow && (
          <span className="mono text-xs text-ink-muted tracking-[0.12em] uppercase">
            {eyebrow}
          </span>
        )}
        <h1 className="display italic text-[clamp(36px,6vw,56px)] font-normal leading-[0.95] tracking-[-0.02em] m-0 text-ink [&_em]:not-italic [&_em]:text-amber">
          {title}
        </h1>
      </div>
      {date && (
        <div className="mono text-[13px] tracking-[0.2em] uppercase text-amber flex flex-col gap-0.5 text-right">
          <span>{date}</span>
        </div>
      )}
    </div>
  );
}
