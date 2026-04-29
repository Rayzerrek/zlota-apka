import { Button } from "@cloudflare/kumo";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";
type Props = {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  className?: string;
};
export function ThemeButton({ theme, onToggleTheme, className }: Props) {
  return (
    <Button
      variant="ghost"
      icon={theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
      aria-label="Zmień motyw"
      onClick={onToggleTheme}
      className={className}
    />
  );
}
