import { Donut } from './Donut';
import type { SizingApi } from '@/hooks/useSizingState';

export function ResultRail({ api }: { api: SizingApi }) {
  const { state, result } = api;

  return (
    <aside className="sticky top-[82px] flex flex-col gap-4">
      {/* Card de resultado (gradiente) */}
      <div className="rounded-[18px] bg-gradient-to-br from-primary to-primary-2 p-[22px_22px_20px] text-white shadow-result">
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/[.72]">
          Número final da cotação
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <div className="font-mono text-[46px] font-bold leading-none tracking-tight">
            {result.tbGrowth.toFixed(1)}
          </div>
          <div className="text-[15px] font-semibold text-white/[.82]">TB/ano</div>
        </div>
        <div className="mt-1 text-[11.5px] text-white/[.75]">
          Volume total com margem de crescimento aplicada
        </div>

        {/* Slider de margem */}
        <div className="mt-4">
          <div className="mb-[7px] flex justify-between text-[11px] font-medium text-white/[.82]">
            <span>Margem de crescimento</span>
            <span className="font-mono">{state.growth}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            value={state.growth}
            onChange={(e) => api.setGrowth(+e.target.value)}
            aria-label="Margem de crescimento"
            className="w-full"
            style={{ accentColor: '#fff' }}
          />
        </div>

        {/* Breakdown log + flow = total */}
        <div className="mt-4 flex items-center gap-2">
          <MiniStat value={result.tbLog.toFixed(1)} label="Log" />
          <span className="font-mono text-[15px] text-white/60">+</span>
          <MiniStat value={result.tbFlow.toFixed(1)} label="Flow" />
          <span className="font-mono text-[15px] text-white/60">=</span>
          <MiniStat value={result.tbBase.toFixed(1)} label="Total" highlight />
        </div>

        {result.isEmpty && (
          <div className="mt-3 rounded-[9px] bg-black/[.12] px-[11px] py-[9px] text-[10.5px] leading-relaxed text-white/[.85]">
            Preencha as quantidades no inventário e o resultado aparece aqui em tempo real.
          </div>
        )}
      </div>

      {/* Composição por categoria */}
      <div className="rounded-2xl border border-line bg-panel p-[18px] shadow-[0_1px_2px_rgba(15,23,42,.04)]">
        <div className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-text-dim">
          Composição por categoria
        </div>
        <div className="flex items-center gap-4">
          <Donut
            slices={result.categorySlices}
            total={result.categoryTotal}
            size={96}
            strokeWidth={13}
            radius={36}
            centerLabel={
              result.categorySlices.length > 0
                ? result.categoryTotal.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
                : '—'
            }
          />
          <div className="min-w-0 flex-1">
            {result.categorySlices.length > 0 ? (
              result.categorySlices.map((s) => (
                <div key={s.category} className="flex items-center gap-2 py-[3px] text-[11px]">
                  <div
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ background: s.color }}
                  />
                  <div className="flex-1 truncate text-text-dim">{s.category}</div>
                  <div className="font-mono text-[10.5px] text-text-faint">{s.pct.toFixed(0)}%</div>
                </div>
              ))
            ) : (
              <div className="text-[11px] leading-relaxed text-text-faint">
                A composição aparece aqui conforme você preenche o inventário.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sensibilidade + premissas */}
      <div className="rounded-2xl border border-line bg-panel p-[18px] shadow-[0_1px_2px_rgba(15,23,42,.04)]">
        <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-text-dim">
          Sensibilidade{' '}
          <span className="font-normal normal-case tracking-normal text-text-faint">
            (±10% / ±20% no volume)
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          {result.sensitivity.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5"
              style={{ background: s.isBase ? 'var(--primary-soft, rgba(37,99,235,.08))' : 'transparent' }}
            >
              <span
                className="text-[11.5px] font-medium"
                style={{ color: s.isBase ? 'var(--primary)' : 'var(--text-dim)' }}
              >
                {s.label}
              </span>
              <span
                className="font-mono text-[12px] font-semibold"
                style={{ color: s.isBase ? 'var(--primary)' : 'var(--text-dim)' }}
              >
                {s.tb.toFixed(1)} TB
              </span>
            </div>
          ))}
        </div>
        <details className="mt-3">
          <summary className="cursor-pointer list-none py-2 text-[11px] font-medium text-text-dim">
            Premissas assumidas ({result.assumptions.length})
          </summary>
          <ul className="m-0 mt-1.5 flex list-none flex-col gap-2 p-0">
            {result.assumptions.map((a, i) => (
              <li key={i} className="relative pl-3.5 text-[11px] leading-relaxed text-text-dim">
                <span className="absolute left-0 text-purple">—</span>
                {a}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </aside>
  );
}

function MiniStat({
  value,
  label,
  highlight = false,
}: {
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex-1 rounded-[11px] p-[10px_8px] text-center ${
        highlight ? 'border border-white/35 bg-white/[.24]' : 'bg-white/[.14]'
      }`}
    >
      <div className="font-mono text-[17px] font-bold">{value}</div>
      <div className="mt-[3px] text-[8.5px] font-medium uppercase tracking-[0.04em] text-white/70">
        {label}
      </div>
    </div>
  );
}
