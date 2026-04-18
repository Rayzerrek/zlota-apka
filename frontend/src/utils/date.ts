import { parseISO, format, differenceInDays } from "date-fns";
import { pl } from "date-fns/locale";

export function daysBetween(fromISO: string, toISOStr: string): number {
	return differenceInDays(parseISO(toISOStr), parseISO(fromISO));
}

export function dayShort(iso: string): string {
	return format(parseISO(iso), "EEEEEE", { locale: pl });
}

export function dayLong(iso: string): string {
	return format(parseISO(iso), "EEEE", { locale: pl });
}

export function dayNum(iso: string): number {
	return parseISO(iso).getDate();
}

export function longDate(iso: string): string {
	return format(parseISO(iso), "d MMMM yyyy", { locale: pl });
}

export function monthYear(iso: string): string {
	return format(parseISO(iso), "LLLL yyyy", { locale: pl });
}
