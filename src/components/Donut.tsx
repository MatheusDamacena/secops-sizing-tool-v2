import { donutArcs } from '@/lib/sizing';
import type { CategorySlice } from '@/types/sizing';

interface DonutProps {
  slices: CategorySlice[];
  total: number;
  size: number;
  strokeWidth: number;
  radius: number;
  centerLabel: string;
  centerSub?: string;
}

/** Donut de composição por categoria, com placeholder neutro quando vazio. */
export function Donut({
  slices,
  total,
  size,
  strokeWidth,
  radius,
  centerLabel,
  centerSub,
}: DonutProps) {
  const hasData = slices.length > 0 && total > 0.001;
  const arcs = hasData ? donutArcs(slices, total, radius) : [];
  const c = size / 2;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {hasData ? (
          arcs.map((a, i) => (
            <circle
              key={i}
              cx={c}
              cy={c}
              r={radius}
              fill="none"
              stroke={a.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${a.dash} ${2 * Math.PI * radius - a.dash}`}
              strokeDashoffset={a.offset}
              transform={`rotate(-90 ${c} ${c})`}
            />
          ))
        ) : (
          <circle
            cx={c}
            cy={c}
            r={radius}
            fill="none"
            stroke="var(--line)"
            strokeWidth={strokeWidth}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono font-semibold text-text" style={{ fontSize: size * 0.14 }}>
          {centerLabel}
        </div>
        {centerSub && <div className="mt-0.5 text-[9px] text-text-faint">{centerSub}</div>}
      </div>
    </div>
  );
}
