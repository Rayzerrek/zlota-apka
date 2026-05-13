import { Breadcrumbs } from "@cloudflare/kumo/components/breadcrumbs";
import { Button } from "@cloudflare/kumo/components/button";
import { NotePencilIcon } from "@phosphor-icons/react";
import { useParams, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";

import { useGeneratedNote } from "../hooks/api/useNotes";
import { longDate } from "../utils/date";

export function GeneratedNotePage() {
  const { t } = useTranslation();
  const params = useParams({ strict: false });
  const id = params.id as string;
  const router = useRouter();
  const { data: note, isLoading, error } = useGeneratedNote(id);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-16 w-2/3 animate-pulse rounded-sm bg-paper-2" />
        <div className="h-64 animate-pulse rounded-sm border border-rule bg-paper-2" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="py-24 text-center">
        <p className="display italic text-[28px] text-ink-faint">
          {t("notes.notFoundTitle")}
        </p>
        <p className="mt-3 text-sm text-ink-muted">{t("notes.notFoundHint")}</p>
        <Button
          variant="outline"
          icon={NotePencilIcon}
          onClick={() => router.navigate({ to: "/note/new" })}
          className="mt-6 rounded-sm"
        >
          {t("notes.generateNew")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-9 pb-4 border-b border-rule">
        <Breadcrumbs size="sm" className="mb-3">
          <Breadcrumbs.Link href="/browse">{t("notes.study")}</Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Link href="/note/new">
            {t("notes.noteGenerator")}
          </Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Current>{note.title}</Breadcrumbs.Current>
        </Breadcrumbs>
        <div className="flex flex-col gap-2">
          <span className="mono text-xs text-ink-muted uppercase">
            {note.subject ?? t("notes.note")}
            {" · "}
            {longDate(note.createdAt.split("T")[0])}
          </span>
          <h1 className="display italic text-[clamp(36px,6vw,56px)] font-normal leading-[0.95] m-0 text-ink">
            {note.title}
          </h1>
        </div>
      </div>

      <div className="enter enter-d1 bg-paper-2 border border-rule rounded-sm p-6 sm:p-8">
        <div className="text-ink text-[17px] leading-relaxed prose prose-amber max-w-none">
          <ReactMarkdown
            disallowedElements={["script", "iframe", "form", "input", "style"]}
            unwrapDisallowed
          >
            {note.content}
          </ReactMarkdown>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3 border-t border-rule pt-6">
        <Button
          variant="outline"
          icon={NotePencilIcon}
          onClick={() => router.navigate({ to: "/note/new" })}
          className="rounded-sm"
        >
          {t("notes.generateAnother")}
        </Button>
      </div>
    </>
  );
}
