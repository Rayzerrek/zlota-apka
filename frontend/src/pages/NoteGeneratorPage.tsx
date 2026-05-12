import { Breadcrumbs } from "@cloudflare/kumo/components/breadcrumbs";
import { Button } from "@cloudflare/kumo/components/button";
import {
  ArrowRightIcon,
  BookOpenTextIcon,
  SparkleIcon,
  TextAlignLeftIcon,
} from "@phosphor-icons/react";
import { useRouter, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { useGenerateNote } from "../hooks/api/useNotes";

export function NoteGeneratorPage() {
  const router = useRouter();
  const search = useSearch({ strict: false }) as {
    topic?: string;
    subject?: string;
  };
  const { mutate: generateNote, isPending, error } = useGenerateNote();

  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    if (search.topic) setTopic(search.topic);
    if (search.subject) setSubject(search.subject);
  }, [search.topic, search.subject]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;

    generateNote(
      { topic: topic.trim(), subject: subject.trim() || undefined },
      {
        onSuccess: (data) => {
          router.navigate({ to: "/note/$id", params: { id: data.id } });
        },
      },
    );
  }

  const FIELD_CLASS =
    "w-full bg-paper-3 border border-rule rounded-[3px] px-3.5 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-amber/60 transition-colors";

  return (
    <>
      <div className="mb-9 pb-4 border-b border-rule">
        <Breadcrumbs size="sm" className="mb-3">
          <Breadcrumbs.Link href="/browse">Nauka</Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Current>Generator notatek</Breadcrumbs.Current>
        </Breadcrumbs>
        <div className="flex flex-col gap-2">
          <span className="mono text-xs text-ink-muted uppercase">
            Asystent AI
          </span>
          <h1 className="display italic text-[clamp(36px,6vw,56px)] font-normal leading-[0.95] m-0 text-ink">
            Generator <em className="not-italic text-amber">notatek</em>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 min-[900px]:grid-cols-[1fr_360px] min-[900px]:items-start">
        <section className="enter enter-d1 rounded-sm border border-rule bg-[linear-gradient(180deg,rgba(242,184,48,0.06),transparent_42%),var(--color-paper-2)] p-6 sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-rule pb-5">
              <div className="grid h-10 w-10 place-items-center rounded-sm bg-amber/10 text-amber">
                <SparkleIcon size={20} weight="fill" />
              </div>
              <div>
                <p className="display text-[18px] text-ink">Nowa notatka</p>
                <p className="text-sm text-ink-muted mt-0.5">
                  Wpisz temat, a AI przygotuje kompleksową notatkę
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="topic"
                  className="mono text-[12px] uppercase tracking-[0.16em] text-ink-muted"
                >
                  Temat *
                </label>
                <textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="np. Właściwości funkcji kwadratowej, II wojna światowa — najważniejsze bitwy..."
                  rows={3}
                  className={`${FIELD_CLASS} resize-none min-h-[88px]`}
                  disabled={isPending}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="subject"
                  className="mono text-[12px] uppercase tracking-[0.16em] text-ink-muted"
                >
                  Przedmiot
                  <span className="text-ink-faint normal-case ml-1">
                    (opcjonalnie)
                  </span>
                </label>
                <input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="np. Matematyka, Historia, Biologia..."
                  className={FIELD_CLASS}
                  disabled={isPending}
                />
              </div>

              {error && (
                <div className="rounded-sm border border-rating-1/20 bg-rating-1/8 px-4 py-3 text-sm text-rating-1">
                  {error.message}
                </div>
              )}

              <Button
                type="submit"
                disabled={!topic.trim() || isPending}
                size="lg"
                className="self-start rounded-sm bg-amber text-paper hover:bg-[#ffcc4a] hover:-translate-y-px active:translate-y-0 transition-all font-semibold px-8 py-4 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isPending ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-paper/30 border-t-paper rounded-full animate-spin mr-2" />
                    Generowanie...
                  </>
                ) : (
                  <>
                    Generuj notatkę
                    <ArrowRightIcon
                      size={18}
                      weight="bold"
                      className="ml-1.5"
                    />
                  </>
                )}
              </Button>
            </form>
          </div>
        </section>

        <aside className="enter enter-d2 flex flex-col gap-4">
          <div className="rounded-sm border border-rule bg-paper-2 p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <BookOpenTextIcon size={18} className="text-amber" />
              <span className="mono text-[11px] uppercase tracking-[0.16em] text-ink">
                Jak to działa
              </span>
            </div>
            <ul className="flex flex-col gap-3 text-sm text-ink-muted">
              <li className="flex gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[3px] bg-amber/10 text-[11px] text-amber">
                  1
                </span>
                Wpisz temat i opcjonalnie przedmiot
              </li>
              <li className="flex gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[3px] bg-amber/10 text-[11px] text-amber">
                  2
                </span>
                AI analizuje temat i tworzy notatkę
              </li>
              <li className="flex gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[3px] bg-amber/10 text-[11px] text-amber">
                  3
                </span>
                Notatka jest zapisywana — dostajesz stały link
              </li>
              <li className="flex gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[3px] bg-amber/10 text-[11px] text-amber">
                  4
                </span>
                Wracaj do niej kiedy chcesz, udostępniaj znajomym
              </li>
            </ul>
          </div>

          <div className="rounded-sm border border-rule bg-paper-2 p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <TextAlignLeftIcon size={18} className="text-ink-muted" />
              <span className="mono text-[11px] uppercase tracking-[0.16em] text-ink">
                Przykładowe tematy
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {[
                "Fotosynteza — etapy i znaczenie",
                "Wzory skróconego mnożenia",
                "Przyczyny wybuchu I wojny światowej",
                "Rozbiory Polski",
                "Budowa atomu i układ okresowy",
              ].map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setTopic(ex)}
                  className="w-full rounded-[3px] border border-rule bg-paper px-3 py-2 text-left text-sm text-ink-muted hover:border-amber/40 hover:text-ink transition-colors disabled:opacity-40"
                  disabled={isPending}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
