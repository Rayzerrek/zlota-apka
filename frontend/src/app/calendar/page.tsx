import { Button } from "@cloudflare/kumo";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { parseISO, format, addDays, startOfWeek, eachDayOfInterval } from "date-fns";
import { useState } from "react";

import { PageHead } from "../../components/PageHead";
import { EXAMS, SESSIONS, TODAY } from "../../data/mock";
import { dayLong, dayNum, dayShort, daysBetween, longDate } from "../../utils/date";
import { SUBJECTS, subjectName } from "../../utils/subjects";

function shiftWeek(iso: string, n: number): string {
	return format(addDays(parseISO(iso), n), "yyyy-MM-dd");
}

function weekDaysFrom(iso: string): string[] {
	const start = startOfWeek(parseISO(iso), { weekStartsOn: 1 });
	return eachDayOfInterval({ start, end: addDays(start, 6) }).map((d) => format(d, "yyyy-MM-dd"));
}

export function CalendarPage() {
	const [weekAnchor, setWeekAnchor] = useState(TODAY);
	const [selected, setSelected] = useState(TODAY);

	const days = weekDaysFrom(weekAnchor);
	const selectedSessions = SESSIONS.filter((s) => s.dateISO === selected);

	const upcomingExams = [...EXAMS]
		.filter((e) => e.dateISO >= TODAY)
		.sort((a, b) => a.dateISO.localeCompare(b.dateISO));

	return (
		<>
			<PageHead
				eyebrow="plan tygodniowy"
				title={<em>Tydzien</em>}
				date={`Tydzień z ${longDate(days[0])}`}
			/>

			<div className="flex gap-2.5 mb-5 items-center">
				<Button
					variant="outline"
					icon={CaretLeftIcon}
					onClick={() => setWeekAnchor(shiftWeek(weekAnchor, -7))}
					className="rounded-sm ring-[var(--rule-strong)] text-[var(--ink)] hover:ring-[var(--amber)] hover:text-[var(--amber)]"
				>
					Poprzedni
				</Button>
				<Button
					variant="outline"
					onClick={() => setWeekAnchor(TODAY)}
					className="rounded-sm ring-[var(--rule-strong)] text-[var(--ink)] hover:ring-[var(--amber)] hover:text-[var(--amber)]"
				>
					Dziś
				</Button>
				<Button
					variant="outline"
					onClick={() => setWeekAnchor(shiftWeek(weekAnchor, 7))}
					className="rounded-sm ring-[var(--rule-strong)] text-[var(--ink)] hover:ring-[var(--amber)] hover:text-[var(--amber)]"
				>
					Następny
					<CaretRightIcon size={14} />
				</Button>
			</div>

			<div className="grid grid-cols-7 gap-2 mb-10">
				{days.map((iso, idx) => {
					const sessionsOfDay = SESSIONS.filter((s) => s.dateISO === iso);
					const examOnDay = EXAMS.find((e) => e.dateISO === iso);
					const uniqSubjects = Array.from(new Set(sessionsOfDay.map((s) => s.subject)));
					return (
						<button
							key={iso}
							type="button"
							className="cal-day enter"
							style={{ animationDelay: `${0.04 * idx}s` }}
							data-today={iso === TODAY}
							data-selected={iso === selected}
							onClick={() => setSelected(iso)}
						>
							<span className="mono text-[10px] tracking-[0.14em] text-[var(--ink-faint)] uppercase">
								{dayShort(iso)}
							</span>
							<span className="cal-day-num">{dayNum(iso)}</span>
							<span className="flex gap-[3px] min-h-[6px]">
								{uniqSubjects.slice(0, 5).map((s) => (
									<span
										key={s}
										className="w-[6px] h-[6px] rounded-full opacity-85"
										style={{ background: SUBJECTS[s].color }}
									/>
								))}
								{examOnDay && (
									<span
										className="w-[6px] h-[6px] rounded-full opacity-85"
										style={{ background: "var(--amber)", boxShadow: "0 0 6px var(--amber)" }}
									/>
								)}
							</span>
						</button>
					);
				})}
			</div>

			<section className="mt-6">
				<div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-[var(--rule)]">
					<h2 className="display font-normal text-[22px] tracking-[-0.01em] text-[var(--ink)] flex items-baseline gap-3">
						<span className="mono text-xs text-[var(--amber)] tracking-[0.08em]">02 —</span>{" "}
						{dayLong(selected)}
					</h2>
					<span className="mono text-[11px] tracking-[0.14em] uppercase text-[var(--ink-faint)]">
						{selectedSessions.length === 0
							? "Brak zaplanowanych sesji"
							: `${selectedSessions.length} sesji`}
					</span>
				</div>

				{selectedSessions.length === 0 ? (
					<div className="py-8 text-[var(--ink-faint)] display italic text-2xl">
						dzień wolny — złap oddech.
					</div>
				) : (
					selectedSessions.map((s, idx) => {
						const subj = SUBJECTS[s.subject];
						return (
							<div
								key={s.id}
								className="grid grid-cols-[52px_1fr_auto] gap-5 items-center py-[18px] px-1 border-b border-[var(--rule)] enter"
								style={{ animationDelay: `${0.1 + idx * 0.04}s` }}
								data-done={s.done}
							>
								<span
									className={`mono text-[13px] tracking-[0.04em] ${s.done ? "text-[var(--ink-faint)]" : "text-[var(--ink-muted)]"}`}
								>
									{s.timeOfDay}
								</span>
								<span className="flex flex-col gap-1 min-w-0">
									<span className="flex items-center gap-2 mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-muted)]">
										<span className="w-2 h-2 rounded-full shrink-0" style={{ background: subj.color }} />
										{subj.name}
									</span>
									<span
										className={`display font-normal text-[18px] leading-[1.2] tracking-[-0.005em] ${s.done ? "line-through decoration-[var(--rule-strong)] decoration-[1px] text-[var(--ink-faint)]" : "text-[var(--ink)]"}`}
									>
										{s.topic}
									</span>
								</span>
								<span className="mono text-sm text-[var(--ink)] flex items-center gap-2.5">
									<span className="text-[var(--ink-faint)]">{s.cardIds.length} kart</span>
								</span>
							</div>
						);
					})
				)}
			</section>

			<section className="mt-16">
				<div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-[var(--rule)]">
					<h2 className="display font-normal text-[22px] tracking-[-0.01em] text-[var(--ink)] flex items-baseline gap-3">
						<span className="mono text-xs text-[var(--amber)] tracking-[0.08em]">03 —</span> Sprawdziany
						na horyzoncie
					</h2>
					<span className="mono text-[11px] tracking-[0.14em] uppercase text-[var(--ink-faint)]">
						{upcomingExams.length} terminów
					</span>
				</div>
				<div className="flex flex-col">
					{upcomingExams.map((e, idx) => {
						const days = daysBetween(TODAY, e.dateISO);
						const near = days <= 7 ? "close" : "far";
						return (
							<div
								key={e.id}
								className="grid grid-cols-[80px_1fr_auto] gap-5 items-center py-5 border-b border-[var(--rule)] enter"
								style={{ animationDelay: `${0.2 + idx * 0.05}s` }}
								data-near={near}
							>
								<div
									className={`display italic font-normal text-[44px] leading-none tracking-[-0.02em] text-right ${near === "far" ? "!not-italic text-[var(--ink-muted)]" : "text-[var(--amber)]"}`}
								>
									{days}
								</div>
								<div>
									<div className="display text-[18px] leading-[1.2] text-[var(--ink)]">{e.name}</div>
									<div className="mono text-[11px] text-[var(--ink-faint)] tracking-[0.12em] uppercase mt-1">
										{subjectName(e.subject)} · {longDate(e.dateISO)}
									</div>
								</div>
								<div className="mono text-xs text-[var(--ink-muted)] text-right">
									<div>waga</div>
									<div className="text-[var(--ink)] text-lg mt-0.5">{e.weight}</div>
								</div>
							</div>
						);
					})}
				</div>
			</section>
		</>
	);
}
