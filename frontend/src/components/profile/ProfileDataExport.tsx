import { Button } from "@cloudflare/kumo/components/button";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import Papa from "papaparse";
import { useCallback } from "react";

import { useNotifications } from "../../contexts/NotificationContext";
import { useAllCards } from "../../hooks/api/useCards";
import { useReviewHistory } from "../../hooks/api/useCards";
import { useAllExams } from "../../hooks/api/useExams";
import { useAllSessions } from "../../hooks/api/useSessions";
import {
  adaptApiCardToCard,
  adaptApiReviewHistoryToEntry,
  adaptApiSessionToStudySession,
} from "../../lib/adapters";

function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ProfileDataExport() {
  const { addNotification } = useNotifications();
  const { data: apiCards } = useAllCards();
  const { data: apiExams } = useAllExams();
  const { data: apiSessions } = useAllSessions();
  const { data: apiHistory } = useReviewHistory();

  const cards = (apiCards ?? []).map(adaptApiCardToCard);
  const exams = apiExams ?? [];
  const sessions = (apiSessions ?? []).map(adaptApiSessionToStudySession);
  const history = (apiHistory ?? []).map(adaptApiReviewHistoryToEntry);

  const isLoading =
    apiCards === undefined ||
    apiExams === undefined ||
    apiSessions === undefined ||
    apiHistory === undefined;

  const handleJSON = useCallback(() => {
    if (isLoading) return;
    const payload = {
      exportedAtISO: new Date().toISOString(),
      cards,
      sessions,
      exams,
      history,
    };
    download(
      `powtorki-${todayStamp()}.json`,
      JSON.stringify(payload, null, 2),
      "application/json",
    );
    addNotification({
      type: "data_exported",
      title: "Wyeksportowano dane",
      description: `powtorki-${todayStamp()}.json`,
    });
  }, [addNotification, cards, exams, history, isLoading, sessions]);

  const handleCSV = useCallback(() => {
    if (isLoading) return;
    download(
      `powtorki-history-${todayStamp()}.csv`,
      Papa.unparse(history),
      "text/csv",
    );
    addNotification({
      type: "data_exported",
      title: "Wyeksportowano historię",
      description: `powtorki-history-${todayStamp()}.csv`,
    });
  }, [addNotification, history, isLoading]);

  return (
    <section className="enter enter-d3 flex flex-col gap-3 pt-2">
      <h2 className="display font-normal text-[21px] text-ink flex items-baseline gap-3">
        <span className="mono text-xs text-amber">02 —</span>
        Twoje dane
      </h2>
      <p className="text-[15px] text-ink-muted leading-[1.55] max-w-[52ch]">
        Historia powtórek należy do Ciebie. Pobierz ją w dowolnej chwili — JSON
        zawiera całość (karty, sesje, sprawdziany, oceny), CSV to sama historia
        ocen do arkuszy.
      </p>
      <div className="flex gap-2.5 flex-wrap mt-1">
        <Button
          variant="secondary"
          icon={DownloadSimpleIcon}
          onClick={handleJSON}
          disabled={isLoading}
        >
          Eksport JSON
        </Button>
        <Button
          variant="secondary"
          icon={DownloadSimpleIcon}
          onClick={handleCSV}
          disabled={isLoading}
        >
          Eksport CSV (historia)
        </Button>
      </div>
    </section>
  );
}
