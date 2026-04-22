import { DropdownMenu } from "@cloudflare/kumo";
import {
  DotsThreeIcon,
  NotePencilIcon,
  CardsIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router";

type Props = {
  examId: string;
};

export function ExamMenu({ examId }: Props) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger>
        <DotsThreeIcon size={18} weight="bold" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="enter min-w-[196px] rounded-[4px] overflow-hidden py-1 z-[100] outline-none"
          style={{
            background: "var(--color-paper-3)",
            border: "1px solid var(--color-rule-strong)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <DropdownMenu.Item
            onSelect={() => navigate(`/notes/${examId}`)}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-left text-[13px] text-ink-muted hover:text-ink hover:bg-white/[0.04] transition-colors outline-none cursor-pointer"
          >
            <span className="text-ink-faint">
              <NotePencilIcon size={15} />
            </span>
            Wygeneruj notatkę
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => navigate("/browse")}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-left text-[13px] text-ink-muted hover:text-ink hover:bg-white/[0.04] transition-colors outline-none cursor-pointer"
          >
            <span className="text-ink-faint">
              <CardsIcon size={15} />
            </span>
            Przeglądaj fiszki
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
}
