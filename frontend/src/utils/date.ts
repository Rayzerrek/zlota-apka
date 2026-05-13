import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
  formatDuration,
  intervalToDuration,
  parseISO,
} from "date-fns";
import { enUS, pl } from "date-fns/locale";

import i18n from "../i18n";

function getLocale() {
  return i18n.language === "en" ? enUS : pl;
}

export function daysBetween(fromISO: string, toISOStr: string): number {
  return differenceInDays(parseISO(toISOStr), parseISO(fromISO));
}

export function dayShort(iso: string): string {
  return format(parseISO(iso), "EEEEEE", { locale: getLocale() });
}

export function dayLong(iso: string): string {
  return format(parseISO(iso), "EEEE", { locale: getLocale() });
}

export function dayNum(iso: string): number {
  return Number(format(parseISO(iso), "d"));
}

export function longDate(iso: string): string {
  return format(parseISO(iso), "d MMMM yyyy", { locale: getLocale() });
}

export function monthYear(iso: string): string {
  return format(parseISO(iso), "LLLL yyyy", { locale: getLocale() });
}

export function formatMinutes(totalMinutes: number): string {
  if (totalMinutes <= 0) return "0 min";

  if (totalMinutes < 60) {
    return formatDuration(
      intervalToDuration({ start: 0, end: totalMinutes * 60 * 1000 }),
      {
        locale: getLocale(),
        format: ["minutes"],
      },
    );
  }

  return formatDuration(
    intervalToDuration({ start: 0, end: totalMinutes * 60 * 1000 }),
    {
      locale: getLocale(),
      format: ["hours", "minutes"],
      zero: false,
    },
  );
}

export function timeAgo(ts: number): string {
  const locale = getLocale();
  const date = new Date(ts);
  const now = Date.now();
  const minutes = differenceInMinutes(now, date);
  if (minutes < 1) return i18n.language === "en" ? "just now" : "przed chwilą";
  if (minutes < 60) {
    const h = differenceInHours(now, date);
    if (h < 1)
      return i18n.language === "en"
        ? `${minutes} min ago`
        : `${minutes} min temu`;
    if (h < 24) return i18n.language === "en" ? `${h}h ago` : `${h} godz. temu`;
  }
  if (differenceInHours(now, date) < 48)
    return i18n.language === "en" ? "yesterday" : "wczoraj";
  return format(date, "d MMM", { locale });
}
