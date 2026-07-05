import { useMemo, useState } from 'react';
import { QUICK_UNITS, quickCalc, quickCalcMemo, type QuickUnit } from '@/lib/quickCalc';

interface QuickCalcModalProps {
  onClose: () => void;
}

const fieldCls =
  'w-full rounded-[10px] border border-line bg-panel-alt px-3 py-2.5 text-[13px] text-text outline-none transition-colors focus:border-primary';
const labelCls =
  'mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.06em] text-text-faint';
const hintCls = 'mt-1 text-[11px] text-text-faint';

export function QuickCalcModal({ onClose }: QuickCalcModalProps) {
  const [value, setValue] = useState('500');
  const [unit, setUnit] = useState<QuickUnit>('GB_per_day');
  const [daysPerYear, setDaysPerYear] = useState(365);
  const [daysPerMonth, setDaysPerMonth] = useState(30);
  const [eventBytes, setEventBytes] = useState('600');
  const [overhead, setOverhead] = useState('1.2');
  const [copied, setCopied] = useState(false);

  const isEps = unit === 'EPS';
  const isMonthly = unit === 'GB_per_month' || unit === 'TB_per_month';

  const input = useMemo(
    () => ({
      value: parseFloat(value) || 0,
      unit,
      daysPerYear,
      daysPerMonth,
      eventBytes: parseFloat(eventBytes) || 0,
      overhead: parseFloat(overhead) || 1,
    }),
    [value, unit, daysPerYear, daysPerMonth, eventBytes, overhead],
  );

  const result = useMemo(() => quickCalc(input), [input]);
  const memo = useMemo(() => quickCalcMemo(input), [input]);

  const reset = () => {
    setValue('500');
    setUnit('GB_per_day');
    setDaysPerYear(365);
    setDaysPerMonth(30);
    setEventBytes('600');
    setOverhead('1.2');
  };

  const copy = async () => {
    const text = `${result.tbPerYear.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} TB/ano (${memo})`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível — ignore silenciosamente */
    }
  };

  return (
    <div
      className="app-chrome fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-10 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] rounded-2xl border border-line bg-panel shadow-[0_20px_60px_rgba(0,0,0,.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 className="text-[16px] font-semibold text-text">Calculadora rápida</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-text-dim">
              Converta qualquer taxa de ingestão para TB/ano (base decimal, 1 TB = 10¹² bytes).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-line bg-panel-alt text-[18px] text-text-faint transition-colors hover:border-destructive hover:text-destructive"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Valor de entrada</label>
              <input
                type="number"
                min={0}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="Ex.: 500 GB/dia, 1000 EPS…"
                className={fieldCls}
              />
            </div>
            <div>
              <label className={labelCls}>Unidade / taxa</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as QuickUnit)}
                className={fieldCls}
              >
                {QUICK_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
              <div className={hintCls}>Resultado sempre em TB/ano.</div>
            </div>
          </div>

          {isEps && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Tamanho médio do evento (bytes)</label>
                <input
                  type="number"
                  min={0}
                  value={eventBytes}
                  onChange={(e) => setEventBytes(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className={fieldCls}
                />
                <div className={hintCls}>Firewall ~400–800B · EDR ~1200–1800B.</div>
              </div>
              <div>
                <label className={labelCls}>Fator overhead</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={overhead}
                  onChange={(e) => setOverhead(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className={fieldCls}
                />
                <div className={hintCls}>Headers, metadata. 1.0 = sem overhead.</div>
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Dias no ano</label>
              <select
                value={daysPerYear}
                onChange={(e) => setDaysPerYear(Number(e.target.value))}
                className={fieldCls}
              >
                <option value={365}>365 dias</option>
                <option value={366}>366 dias (bissexto)</option>
              </select>
              <div className={hintCls}>Para estimativa padrão, use 365.</div>
            </div>
            {isMonthly && (
              <div>
                <label className={labelCls}>Dias por mês</label>
                <select
                  value={daysPerMonth}
                  onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                  className={fieldCls}
                >
                  <option value={30}>30 dias / mês</option>
                  <option value={30.4375}>30,4375 (média anual)</option>
                </select>
                <div className={hintCls}>Relevante apenas para unidades mensais.</div>
              </div>
            )}
          </div>

          {isEps && (
            <div className="mt-4 rounded-[10px] border border-[color:var(--amber)]/25 bg-[color:var(--amber)]/[.08] px-3.5 py-2.5 text-[11.5px] leading-relaxed text-amber">
              EPS é estimativa: o tamanho real do evento varia bastante por fonte. Use como ordem de
              grandeza, não como número fechado.
            </div>
          )}

          {/* Resultado */}
          <div className="mt-5 rounded-[12px] bg-gradient-to-br from-primary to-primary-2 p-5 text-white">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/[.72]">
              Resultado
            </div>
            <div className="mt-1.5 font-mono text-[32px] font-bold leading-none">
              {result.tbPerYear.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
              <span className="ml-2 text-[16px] font-semibold text-white/[.82]">TB/ano</span>
            </div>
            <div className="mt-2.5 font-mono text-[11px] text-white/[.75]">{memo}</div>
            <div className="mt-1 font-mono text-[11px] text-white/[.6]">
              ≈ {result.gbPerYear.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} GB/ano ·{' '}
              {result.gbPerDay.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} GB/dia
            </div>
          </div>

          <div className="mt-4 flex gap-2.5">
            <button
              type="button"
              onClick={copy}
              className="flex-1 rounded-[10px] bg-primary px-4 py-2.5 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              {copied ? '✓ Copiado' : 'Copiar resultado'}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-[10px] border border-line bg-panel-alt px-5 py-2.5 text-[12.5px] font-medium text-text-dim transition-colors hover:border-primary hover:text-primary"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
