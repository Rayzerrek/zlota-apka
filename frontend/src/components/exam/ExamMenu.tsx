import { DropdownMenu } from "@cloudflare/kumo/components/dropdown";
import {
  CardsIcon,
  DotsThreeIcon,
  NotePencilIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

type Props = {
  examId: string;
  subjectKey?: string | null;
};

export function ExamMenu({ examId, subjectKey }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        render={
          <button
            type="button"
            aria-label={t("exam.examOptions")}
            title={t("exam.examOptions")}
            className="grid h-8 w-8 place-items-center rounded-[4px] text-ink-faint transition-colors hover:bg-white/[0.04] hover:text-ink focus:outline-none"
          />
        }
      >
        <DotsThreeIcon size={18} weight="bold" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="enter min-w-[196px] rounded-[4px] overflow-hidden py-1 z-[100] outline-none bg-paper-3 border border-rule-strong shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
          <DropdownMenu.Item
            onSelect={() => navigate({ to: `/notes/${examId}` })}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-left text-[13px] text-ink-muted hover:text-ink hover:bg-white/[0.04] transition-colors outline-none cursor-pointer"
          >
            <span className="text-ink-faint">
              <NotePencilIcon size={15} />
            </span>
            {t("exam.generateNote")}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() =>
              navigate({
                to: "/browse",
                search: subjectKey ? { subject: subjectKey } : {},
              })
            }
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-left text-[13px] text-ink-muted hover:text-ink hover:bg-white/[0.04] transition-colors outline-none cursor-pointer"
          >
            <span className="text-ink-faint">
              <CardsIcon size={15} />
            </span>
            {t("exam.browseCards")}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
}
