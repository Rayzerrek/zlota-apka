import { NotificationBell } from "../notifications/NotificationBell";

import type { ReactNode } from "react";

type Props = {
  eyebrow?: ReactNode | string;
  title?: ReactNode;
  date?: string;
};

export function PageHead({ eyebrow, title, date }: Props) {
  return (
    <div className="flex items-end justify-between gap-4 mb-9 pb-4 border-b border-rule">
      <div className="flex flex-col gap-2">
        {eyebrow && (
          <span className="mono text-xs text-ink-muted uppercase">
            {eyebrow}
          </span>
        )}
        <h1 className="display italic text-[clamp(36px,6vw,56px)] font-normal leading-[0.95] m-0 text-ink [&_em]:not-italic [&_em]:text-amber">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {date && (
          <div className="mono text-[13px] uppercase text-amber flex flex-col gap-0.5 text-right">
            <span>{date}</span>
          </div>
        )}
        <NotificationBell />
      </div>
    </div>
  );
}
