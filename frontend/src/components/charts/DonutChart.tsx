import { useMemo, useState } from "react";

export type DonutSegment = {
  name: string;
  value: number;
  color: string;
};

type Props = {
  data: DonutSegment[];
  size?: number;
  stroke?: number;
  className?: string;
};

export function DonutChart({
  data,
  size = 160,
  stroke = 14,
  className,
}: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  const { total, segments } = useMemo(() => {
    const filtered = data.filter((d) => d.value > 0);
    const sum = filtered.reduce((a, b) => a + b.value, 0);
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    const segs = filtered.map((d) => {
      const pct = sum === 0 ? 0 : d.value / sum;
      const dash = pct * circumference;
      const gap = circumference - dash;
      const seg = {
        ...d,
        dash,
        gap,
        offset: -offset,
        pct: Math.round(pct * 100),
      };
      offset += dash;
      return seg;
    });

    return { total: sum, segments: segs };
  }, [data, size, stroke]);

  const center = size / 2;

  if (total === 0) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={className}
      >
        <circle
          cx={center}
          cy={center}
          r={(size - stroke) / 2}
          fill="none"
          stroke="var(--color-rule)"
          strokeWidth={stroke}
        />
      </svg>
    );
  }

  return (
    <div className={`relative inline-flex ${className ?? ""}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        onMouseLeave={() => setHovered(null)}
      >
        {segments.map((seg, i) => (
          <circle
            key={seg.name}
            cx={center}
            cy={center}
            r={(size - stroke) / 2}
            fill="none"
            stroke={seg.color}
            strokeWidth={hovered === i ? stroke + 2 : stroke}
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            strokeDashoffset={seg.offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            className="transition-all duration-200 cursor-pointer"
            style={{
              opacity: hovered === null || hovered === i ? 1 : 0.45,
            }}
            onMouseEnter={() => setHovered(i)}
          />
        ))}
      </svg>

      {hovered !== null && segments[hovered] && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="mono text-[13px] text-ink-faint uppercase tracking-wider">
            {segments[hovered].name}
          </span>
          <span className="display text-[22px] leading-none text-ink mt-0.5">
            {segments[hovered].value}
          </span>
        </div>
      )}
    </div>
  );
}
