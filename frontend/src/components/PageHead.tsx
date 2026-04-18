import type { ReactNode } from "react";

type Props = {
	eyebrow?: string;
	title: ReactNode;
	date?: string;
};

export function PageHead({ eyebrow, title, date }: Props) {
	return (
		<div className="flex items-end justify-between gap-4 mb-9 pb-4 border-b border-[var(--rule)] enter">
			<div className="flex flex-col gap-2">
				{eyebrow && (
					<span className="mono text-xs text-[var(--ink-muted)] tracking-[0.12em] uppercase">
						{eyebrow}
					</span>
				)}
				<h1 className="page-title">{title}</h1>
			</div>
			{date && (
				<div className="mono text-[10px] tracking-[0.2em] uppercase text-[var(--amber)] flex flex-col gap-0.5 text-right">
					{date && <span>{date}</span>}
				</div>
			)}
		</div>
	);
}
