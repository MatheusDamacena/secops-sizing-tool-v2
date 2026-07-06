import { CATEGORY_MAP } from '@/data/catalog';
import { donutArcs, flowGbDay, resolveMbFactor } from '@/lib/sizing';
import type { SizingApi } from '@/hooks/useSizingState';
import { useI18n } from '@/i18n/context';

/** Relatório imprimível. Paleta própria fixa (documento sempre claro). */
// i18n
const DATE_LOCALE: Record<string, string> = { pt: 'pt-BR', es: 'es-ES', en: 'en-US' };

export function Report({ api }: { api: SizingApi }) {
  const { t, lang } = useI18n();
  const { state, result } = api;
  const today = new Date();
  const dateStr = today.toLocaleDateString(DATE_LOCALE[lang] ?? 'pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const gbDia = result.gbDayLog + (state.flowIncluded !== 'sim' ? flowGbDay(result.tbFlow) : 0);
  const arcs = donutArcs(result.categorySlices, result.categoryTotal, 55);

  // Agrupa fontes por categoria para a tabela detalhada
  const groups = new Map<string, typeof state.rows>();
  for (const row of state.rows) {
    const cat = CATEGORY_MAP[row.name] ?? 'Outros';
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(row);
  }

  return (
    <div className="mx-auto max-w-[1240px] px-7 pb-[60px]">
      <div className="app-chrome mb-4 flex items-center justify-end gap-2.5">
        <input
          type="text"
          placeholder={t('common.projectName')}
          value={state.projName}
          onChange={(e) => api.setProjName(e.target.value)}
          className="w-[240px] rounded-[9px] border border-line bg-panel px-[11px] py-[9px] text-[12.5px] text-text outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-[9px] border-none bg-primary px-[18px] py-2.5 text-[12.5px] font-semibold text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          {t('report.printButton')}
        </button>
      </div>

      <div
        className="report-page report-print-area mx-auto max-w-[860px] rounded-lg border border-[#eef0f4] bg-white p-5 text-[#1a1a2e] shadow-[0_4px_24px_rgba(15,23,42,.10)] sm:p-[52px_56px_40px]"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <svg width="34" height="34" viewBox="0 0 40 40">
              <polygon points="20,3 36,12 20,21 4,12" fill="#1e293b" />
              <polygon points="4,12 20,21 20,37 4,28" fill="#2563eb" />
              <circle cx="29" cy="27" r="7" fill="#db2777" />
            </svg>
            <div>
              <div className="text-[17px] font-semibold leading-none tracking-tight text-[#1a1a2e]">
                SecOps Sizing Tool
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-[#64748b]">
{t('report.headerSubtitle')}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[13px] font-semibold text-[#1e293b]">
              {state.projName || t('report.noProject')}
            </div>
            <div className="mt-[3px] font-mono text-[10px] text-[#64748b]">{dateStr}</div>
            <div className="mt-0.5 font-mono text-[9px] text-[#94a3b8]">SecMath // Sizing Engine</div>
          </div>
        </div>

        <Divider />

        {/* Resumo executivo */}
        <SectionLabel>{t('report.executiveSummary')}</SectionLabel>
        <div className="grid grid-cols-2 gap-2.5 report-metrics sm:grid-cols-5">
          <Metric label={t('report.metricSources')} value={String(state.rows.length)} />
          <Metric label={t('report.metricGbDay')} value={gbDia.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} />
          <Metric label={t('report.metricGbMonth')} value={(gbDia * 30).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} />
          <Metric label={t('report.metricMargin')} value={`${state.growth}%`} />
          <div className="col-span-2 sm:col-span-1 report-metric-featured">
            <Metric
              label={t('report.metricTbYear')}
              value={result.tbGrowth.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
              featured
            />
          </div>
        </div>

        <Divider />

        {/* Composição */}
        <SectionLabel>{t('report.composition')}</SectionLabel>
        <div className="flex flex-col items-center gap-4 report-composition sm:flex-row sm:items-center sm:gap-[30px]">
          <div className="relative h-[140px] w-[140px] flex-shrink-0">
            <svg width="140" height="140" viewBox="0 0 140 140">
              {arcs.map((a, i) => (
                <circle
                  key={i}
                  cx="70"
                  cy="70"
                  r="55"
                  fill="none"
                  stroke={a.color}
                  strokeWidth="18"
                  strokeDasharray={`${a.dash} ${2 * Math.PI * 55 - a.dash}`}
                  strokeDashoffset={a.offset}
                  transform="rotate(-90 70 70)"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-mono text-[18px] font-semibold text-[#1a1a2e]">
                {result.categoryTotal.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
              </div>
              <div className="mt-0.5 text-[9px] text-[#64748b]">TB/ano</div>
            </div>
          </div>
          <div className="w-full flex-1">
            {result.categorySlices.map((s) => (
              <div
                key={s.category}
                className="flex items-center gap-[9px] border-b border-[#f4f6f9] py-1.5 text-[11px]"
              >
                <div className="h-[9px] w-[9px] flex-shrink-0 rounded-full" style={{ background: s.color }} />
                <div className="flex-1 text-[#334155]">{s.category}</div>
                <div className="font-mono text-[11px] font-medium text-[#1e293b]">
                  {(s.tb * (1 + state.growth / 100)).toFixed(2)} TB
                </div>
                <div className="w-[46px] text-right font-mono text-[11px] text-[#94a3b8]">
                  ({s.pct.toFixed(0)}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* Tabela detalhada */}
        <SectionLabel>{t('report.detailBySource')}</SectionLabel>
        <div className="overflow-x-auto report-table-wrap">
          <table className="w-full min-w-[420px] border-collapse text-[10px]">
          <thead>
            <tr>
              <RptTh>{t('report.colSource')}</RptTh>
              <RptTh right>{t('report.colQty')}</RptTh>
              <RptTh right>{t('report.colMbDay')}</RptTh>
              <RptTh right>{t('report.colGbDay')}</RptTh>
              <RptTh right>{t('report.colTbYear')}</RptTh>
            </tr>
          </thead>
          <tbody>
            {[...groups.entries()].map(([cat, rows]) => (
              <RptGroup key={cat} cat={cat} rows={rows} api={api} />
            ))}
            {result.tbFlow > 0 && (
              <>
                <tr>
                  <td colSpan={5} className="bg-[#f8fafc] px-2 py-1.5 text-[9px] font-semibold uppercase tracking-[0.03em] text-[#64748b]">
                    {t('report.flowRow')}
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-[#eef0f4] bg-[#f8fafc] px-2 py-1.5 font-medium text-[#334155]">
                    NetFlow/sFlow/J-Flow/IPFIX
                  </td>
                  <td className="border-b border-[#eef0f4] px-2 py-1.5 text-right font-mono text-[#334155]">—</td>
                  <td className="border-b border-[#eef0f4] px-2 py-1.5 text-right font-mono text-[#334155]">—</td>
                  <td className="border-b border-[#eef0f4] px-2 py-1.5 text-right font-mono text-[#334155]">
                    {flowGbDay(result.tbFlow).toFixed(2)}
                  </td>
                  <td className="border-b border-[#eef0f4] px-2 py-1.5 text-right font-mono text-[#334155]">
                    {result.tbFlow.toFixed(2)}
                  </td>
                </tr>
              </>
            )}
            <tr>
              <td className="bg-[#1e293b] px-2 py-2 text-[9px] font-semibold text-white">
                {t('report.total')}: {t('report.totalSources', { n: state.rows.length })}
                {result.tbFlow > 0 ? ' + flow' : ''}
              </td>
              <td className="bg-[#1e293b]" />
              <td className="bg-[#1e293b]" />
              <td className="bg-[#1e293b] px-2 py-2 text-right font-mono text-[9px] font-semibold text-white">
                {gbDia.toFixed(2)}
              </td>
              <td className="bg-[#059669] px-2 py-2 text-right font-mono text-[12px] font-semibold text-white">
                {result.tbGrowth.toFixed(2)} TB/ano
              </td>
            </tr>
          </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-col gap-1 border-t border-[#eef0f4] pt-3.5 text-[8px] text-[#94a3b8] sm:flex-row sm:justify-between sm:gap-0">
          <span>{t('report.footer')}</span>
          <span>SecMath // Sizing Engine</span>
        </div>
      </div>
    </div>
  );
}

function RptGroup({
  cat,
  rows,
  api,
}: {
  cat: string;
  rows: SizingApi['state']['rows'];
  api: SizingApi;
}) {
  return (
    <>
      <tr>
        <td colSpan={5} className="bg-[#f8fafc] px-2 py-1.5 text-[9px] font-semibold uppercase tracking-[0.03em] text-[#64748b]">
          {cat}
        </td>
      </tr>
      {rows.map((row, i) => {
        const { mb, factor } = resolveMbFactor(row, api.state.edrMode, api.state.saasMode);
        const gbd = (row.qty * mb * factor) / 1024;
        const tb = (gbd * 365) / 1024;
        const name = row.customLabel && row.name === 'Outro' ? row.customLabel : row.name;
        return (
          <tr key={i}>
            <td className="border-b border-[#eef0f4] bg-[#f8fafc] px-2 py-1.5 font-medium text-[#334155]">{name}</td>
            <td className="border-b border-[#eef0f4] px-2 py-1.5 text-right font-mono text-[#334155]">{row.qty.toLocaleString('pt-BR')}</td>
            <td className="border-b border-[#eef0f4] px-2 py-1.5 text-right font-mono text-[#334155]">{(mb * factor).toFixed(0)}</td>
            <td className="border-b border-[#eef0f4] px-2 py-1.5 text-right font-mono text-[#334155]">{gbd.toFixed(2)}</td>
            <td className="border-b border-[#eef0f4] px-2 py-1.5 text-right font-mono text-[#334155]">{tb.toFixed(2)}</td>
          </tr>
        );
      })}
    </>
  );
}

function Divider() {
  return <div className="my-[22px] h-px bg-[#eef0f4]" />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#2563eb]">
      {children}
    </div>
  );
}

function Metric({ label, value, featured = false }: { label: string; value: string; featured?: boolean }) {
  return (
    <div
      className={`rounded-[10px] border p-[12px_13px] ${
        featured
          ? 'border-[rgba(37,99,235,.28)] bg-gradient-to-br from-[#eff4ff] to-[#f6f0fb]'
          : 'border-[#eef0f4] bg-[#f8fafc]'
      }`}
    >
      <div className="text-[8px] font-medium uppercase tracking-[0.08em] text-[#64748b]">{label}</div>
      <div className={`mt-[5px] font-mono text-[20px] font-semibold ${featured ? 'text-[#db2777]' : 'text-[#1e293b]'}`}>
        {value}
      </div>
    </div>
  );
}

function RptTh({ children, right = false }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={`bg-[#1c1e21] px-2 py-[7px] text-[8px] font-medium uppercase tracking-[0.04em] text-[#90a2aa] ${
        right ? 'text-right' : 'text-left'
      }`}
    >
      {children}
    </th>
  );
}
