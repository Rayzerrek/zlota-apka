import { Button } from "@cloudflare/kumo/components/button";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";

type Props = {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  actionTo: string;
  actionLabel: string;
};

export function LoginHeader({
  theme,
  onToggleTheme,
  actionTo,
  actionLabel,
}: Props) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-5 py-4 md:px-10">
      <span className="display italic font-semibold text-[26px] text-amber leading-none">
        Recurs
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          icon={
            theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />
          }
          aria-label="Zmień motyw"
          onClick={onToggleTheme}
        />
        <Button variant="outline" onClick={() => navigate({ to: actionTo })}>
          {actionLabel}
        </Button>
      </div>
    </header>
  );
}
