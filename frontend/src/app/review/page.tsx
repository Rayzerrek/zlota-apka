import { Button } from "@cloudflare/kumo";
import { ArrowRightIcon, XIcon } from "@phosphor-icons/react";
import { useState, useCallback } from "react";

import { SUBJECTS } from "../../utils/subjects";

import type { Card, Rating } from "../../types/types";

type Props = {
	cards: Card[];
	onExit: () => void;
};

const RATING_LABELS: Record<Rating, { label: string; sub: string }> = {
	1: { label: "Nie wiem", sub: "od nowa" },
	2: { label: "Ledwo", sub: "trudne" },
	3: { label: "OK", sub: "z wysiłkiem" },
	4: { label: "Łatwo", sub: "pewnie" },
	5: { label: "Idealnie", sub: "natychmiast" },
};

export function ReviewPage({ cards, onExit }: Props) {
	const [idx, setIdx] = useState(0);
	const [flipped, setFlipped] = useState(false);
	const [ratings, setRatings] = useState<Rating[]>([]);
	const [done, setDone] = useState(false);

	const current = cards[idx];
	const progress = done ? 1 : idx / cards.length;

	const handleRate = useCallback(
		(r: Rating) => {
			const next = [...ratings, r];
			setRatings(next);
			if (idx + 1 >= cards.length) {
				setDone(true);
			} else {
				setFlipped(false);
				setTimeout(() => setIdx(idx + 1), 100);
			}
		},
		[idx, cards.length, ratings],
	);

	if (!current) return null;

	if (done) {
		const correct = ratings.filter((r) => r >= 3).length;
		const wrong = ratings.length - correct;
		return (
			<div className="review">
				<div className="flex items-center justify-between px-6 py-5 border-b border-[var(--rule)] relative">
					<Button
						variant="ghost"
						icon={XIcon}
						onClick={onExit}
						className="text-[var(--ink-muted)] hover:text-[var(--amber)] mono text-[11px] tracking-[0.16em] uppercase"
					>
						Zamknij
					</Button>
					<span className="mono text-[11px] tracking-[0.16em] uppercase text-[var(--ink-muted)]">
						<span className="text-[var(--ink)] font-semibold">Ukończono</span>
					</span>
					<span className="w-20" />
					<div className="review-progress-bar" style={{ width: "100%" }} />
				</div>
				<div className="flex-1 grid place-items-center p-6 perspective-[1800px]">
					<div className="text-center flex flex-col items-center gap-5 px-10 py-10 animate-[fadeIn_0.5s_var(--ease-out)]">
						<div className="display italic text-[120px] text-[var(--amber)] leading-[0.9] font-light">
							✓
						</div>
						<div className="display font-normal text-[36px] tracking-[-0.02em] [&_em]:italic [&_em]:text-[var(--amber)]">
							<em>Koniec</em> sesji.
						</div>
						<p className="text-[var(--ink-muted)] max-w-[40ch]">
							Dobra robota. Kolejne powtórki zaplanowaliśmy na podstawie ocen — karty „idealne" wrócą za
							dłużej, trudne wrócą jutro.
						</p>
						<div className="flex gap-9 mt-4 py-5 border-t border-[var(--rule)] border-b">
							<div className="flex flex-col gap-1">
								<div className="display text-[34px] leading-none text-[var(--rating-4)]">{correct}</div>
								<div className="mono text-[10px] tracking-[0.16em] uppercase text-[var(--ink-faint)]">
									Poprawnych
								</div>
							</div>
							<div className="flex flex-col gap-1">
								<div className="display text-[34px] leading-none text-[var(--rating-1)]">{wrong}</div>
								<div className="mono text-[10px] tracking-[0.16em] uppercase text-[var(--ink-faint)]">
									Do poprawy
								</div>
							</div>
							<div className="flex flex-col gap-1">
								<div className="display text-[34px] leading-none text-[var(--ink)]">{cards.length}</div>
								<div className="mono text-[10px] tracking-[0.16em] uppercase text-[var(--ink-faint)]">
									Razem
								</div>
							</div>
						</div>
						<Button
							size="lg"
							variant="ghost"
							onClick={onExit}
							className="bg-[var(--amber)] text-[var(--paper)] rounded-sm hover:bg-[#ffcc4a] font-semibold px-7 py-4 tracking-[0.02em]"
						>
							Wróć do planu
							<ArrowRightIcon size={18} weight="bold" className="ml-1" />
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const subj = SUBJECTS[current.subject];

	return (
		<div className="review">
			<div className="flex items-center justify-between px-6 py-5 border-b border-[var(--rule)] relative">
				<Button
					variant="ghost"
					icon={XIcon}
					onClick={onExit}
					className="text-[var(--ink-muted)] hover:text-[var(--amber)] mono text-[11px] tracking-[0.16em] uppercase"
				>
					Zamknij
				</Button>
				<span className="mono text-[11px] tracking-[0.16em] uppercase text-[var(--ink-muted)]">
					<span className="text-[var(--ink)] font-semibold">{idx + 1}</span> / {cards.length}
				</span>
				<span className="w-20" />
				<div className="review-progress-bar" style={{ width: `${progress * 100}%` }} />
			</div>

			<div className="flex-1 grid place-items-center p-6 [perspective:1800px]">
				<div
					className="review-card"
					data-flipped={flipped}
					role="button"
					tabIndex={0}
					onClick={() => setFlipped((f) => !f)}
				>
					<div className="review-face review-face-front">
						<div className="flex items-center gap-3 mono text-[11px] tracking-[0.16em] uppercase text-[var(--ink-muted)]">
							<span className="w-2 h-2 rounded-full shrink-0" style={{ background: subj.color }} />
							{subj.name} · {current.topic}
							<span className="mono text-[10px] tracking-[0.24em] text-[var(--ink-faint)] ml-auto">
								awers
							</span>
						</div>
						<div className="flex-1 flex items-center justify-center text-center p-5">
							<div className="display font-light text-[clamp(28px,4.5vw,44px)] leading-[1.2] tracking-[-0.02em] text-[var(--ink)] max-w-[28ch]">
								{current.question}
							</div>
						</div>
						<div className="mono text-[11px] tracking-[0.16em] uppercase text-[var(--ink-faint)] text-center">
							Kliknij lub spacja, żeby odwrócić
						</div>
					</div>

					<div className="review-face review-face-back">
						<div className="flex items-center gap-3 mono text-[11px] tracking-[0.16em] uppercase text-[var(--ink-muted)]">
							<span className="w-2 h-2 rounded-full shrink-0" style={{ background: subj.color }} />
							{subj.name} · {current.topic}
							<span className="mono text-[10px] tracking-[0.24em] text-[var(--ink-faint)] ml-auto">
								rewers
							</span>
						</div>
						<div className="flex-1 flex items-center justify-center text-center p-5">
							<div className="display italic font-medium text-[clamp(32px,5vw,52px)] leading-[1.15] tracking-[-0.02em] text-[var(--amber)] max-w-[28ch]">
								{current.answer}
							</div>
						</div>
						<div className="mono text-[11px] tracking-[0.16em] uppercase text-[var(--ink-faint)] text-center">
							Oceń, jak dobrze znałeś odpowiedź
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-5 gap-2.5 px-6 pb-6 pt-5 max-w-[720px] w-full mx-auto">
				{([1, 2, 3, 4, 5] as Rating[]).map((r) => (
					<button
						key={r}
						type="button"
						className="rate-btn"
						data-rating={r}
						disabled={!flipped}
						onClick={() => handleRate(r)}
						style={{ opacity: flipped ? 1 : 0.35, cursor: flipped ? "pointer" : "not-allowed" }}
					>
						<span className="rate-num">{r}</span>
						<span className="rate-label">{RATING_LABELS[r].label}</span>
						<span className="rate-key">Klawisz {r}</span>
					</button>
				))}
			</div>
		</div>
	);
}
