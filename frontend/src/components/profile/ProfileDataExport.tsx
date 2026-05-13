import { Button } from "@cloudflare/kumo/components/button";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import Papa from "papaparse";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useAllCards, useReviewHistory } from "../../hooks/api/useCards";
import { useAllExams } from "../../hooks/api/useExams";
import { useNotificationInbox } from "../../hooks/api/useNotifications";
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
  const { t } = useTranslation();
  const { addNotification } = useNotificationInbox();
  const { data: apiCards } = useAllCards();
  const { data: apiExams } = useAllExams();
  const { data: apiSessions } = useAllSessions();
  const { data: apiHistory } = useReviewHistory();

  const cards = useMemo(
    () => (apiCards ?? []).map(adaptApiCardToCard),
    [apiCards],
  );
  const exams = useMemo(() => apiExams ?? [], [apiExams]);
  const sessions = useMemo(
    () => (apiSessions ?? []).map(adaptApiSessionToStudySession),
    [apiSessions],
  );
  const history = useMemo(
    () => (apiHistory ?? []).map(adaptApiReviewHistoryToEntry),
    [apiHistory],
  );

  const isLoading = [apiCards, apiExams, apiSessions, apiHistory].some(
    (data) => data === undefined,
  );

  const exportFile = useCallback(
    ({
      filename,
      content,
      mime,
      notificationTitle,
    }: {
      filename: string;
      content: string;
      mime: string;
      notificationTitle: string;
    }) => {
      if (isLoading) return;

      download(filename, content, mime);
      addNotification({
        type: "data_exported",
        title: notificationTitle,
        description: filename,
      });
    },
    [addNotification, isLoading],
  );

  const handleJSON = useCallback(() => {
    const filename = `powtorki-${todayStamp()}.json`;
    const payload = {
      exportedAtISO: new Date().toISOString(),
      cards,
      sessions,
      exams,
      history,
    };
    exportFile({
      filename,
      content: JSON.stringify(payload, null, 2),
      mime: "application/json",
      notificationTitle: t("profile.exportedData"),
    });
  }, [cards, exams, exportFile, history, sessions, t]);

  const handleCSV = useCallback(() => {
    const filename = `powtorki-history-${todayStamp()}.csv`;
    exportFile({
      filename,
      content: Papa.unparse(history),
      mime: "text/csv",
      notificationTitle: t("profile.exportedHistory"),
    });
  }, [exportFile, history, t]);

  return (
    <section className="enter enter-d3 flex flex-col gap-3 pt-2">
      <h2 className="display font-normal text-[21px] text-ink flex items-baseline gap-3">
        <span className="mono text-xs text-amber">02 —</span>
        {t("profile.yourData")}
      </h2>
      <p className="text-[15px] text-ink-muted leading-[1.55] max-w-[52ch]">
        {t("profile.dataDescription")}
      </p>
      <div className="flex gap-2.5 flex-wrap mt-1">
        <Button
          variant="secondary"
          icon={DownloadSimpleIcon}
          onClick={handleJSON}
          disabled={isLoading}
        >
          {t("profile.exportJSON")}
        </Button>
        <Button
          variant="secondary"
          icon={DownloadSimpleIcon}
          onClick={handleCSV}
          disabled={isLoading}
        >
          {t("profile.exportCSV")}
        </Button>
      </div>
    </section>
  );
}
