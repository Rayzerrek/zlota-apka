type Props = {
  name: string;
  initial: string;
  classLabel: string;
  email: string;
};

export function ProfileHeader({ name, initial, classLabel, email }: Props) {
  return (
    <section className="enter flex items-center gap-5">
      <div className="w-[72px] h-[72px] rounded-sm bg-amber text-paper grid place-items-center display italic font-bold text-[32px] shrink-0">
        {initial}
      </div>
      <div className="flex flex-col gap-1">
        <div className="display italic text-[28px] leading-none text-ink">
          {name}
        </div>
        <div className="mono text-[11px] text-ink-muted tracking-[0.14em] uppercase">
          {classLabel} · {email}
        </div>
      </div>
    </section>
  );
}
