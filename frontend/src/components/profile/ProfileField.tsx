type Props = {
  label: string;
  hint?: string;
  children: React.ReactNode;
};

export function ProfileField({ label, hint, children }: Props) {
  return (
    <label className="flex flex-col gap-2">
      <span className="mono text-[14px] text-ink-muted tracking-[0.14em] uppercase">
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-[15px] text-ink-faint leading-[1.5]">{hint}</span>
      )}
    </label>
  );
}
