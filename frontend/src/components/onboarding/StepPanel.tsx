import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  direction: 1 | -1;
  step: number;
};

export function StepPanel({ children, direction, step }: Props) {
  return (
    <div
      key={step}
      className="animate-enter"
      style={
        {
          "--enter-offset": direction === 1 ? "16px" : "-16px",
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
