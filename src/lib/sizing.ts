import {
  CATALOG,
  CATEGORY_COLORS,
  CATEGORY_MAP,
  EDR_KEY,
  EDR_MODES,
  SAAS_KEY,
  SAAS_MODES,
} from '@/data/catalog';
import { EPS_TYPE_ADVISORY, FLOW_INCLUDED_ADVISORY } from '@/data/copy';
import type {
  CategorySlice,
  DonutArc,
  EdrMode,
  SaasMode,
  SizingResult,
  SizingState,
  SourceRow,
} from '@/types/sizing';

const SECONDS_PER_DAY = 86_400;
const DAYS_PER_YEAR = 365;
const GB_PER_TB = 1024;

/**
 * Resolve MB/dia e fator efetivos de uma linha, considerando:
 * override manual > toggle (EDR/SaaS) > catálogo padrão.
 */
export function resolveMbFactor(
  row: SourceRow,
  edrMode: EdrMode,
  saasMode: SaasMode,
): { mb: number; factor: number } {
  if (row.override && row.mb !== undefined && row.factor !== undefined) {
    return { mb: row.mb, factor: row.factor };
  }
  if (row.name === EDR_KEY) {
    const m = EDR_MODES[edrMode];
    return { mb: m.mb, factor: m.factor };
  }
  if (row.name === SAAS_KEY) {
    const m = SAAS_MODES[saasMode];
    return { mb: m.mb, factor: m.factor };
  }
  const c = CATALOG[row.name] ?? CATALOG['Outro'];
  return { mb: c.mb, factor: c.factor };
}

/** GB/dia de uma única linha. */
export function rowGbDay(row: SourceRow, edrMode: EdrMode, saasMode: SaasMode): number {
  const { mb, factor } = resolveMbFactor(row, edrMode, saasMode);
  return (row.qty * mb * factor) / GB_PER_TB;
}

/** GB/dia total de todas as fontes de log. */
export function totalGbDay(rows: SourceRow[], edrMode: EdrMode, saasMode: SaasMode): number {
  return rows.reduce((sum, row) => sum + rowGbDay(row, edrMode, saasMode), 0);
}

/** TB/ano de flow, a partir de registros/min e bytes/registro. */
export function flowTbYear(flowRegMin: number, bytesPerReg: number): number {
  const regsYear = flowRegMin * 60 * 24 * DAYS_PER_YEAR;
  return (regsYear * bytesPerReg) / 1e12;
}

/** Converte TB/ano de flow em GB/dia equivalente. */
export function flowGbDay(tbFlow: number): number {
  return (tbFlow * GB_PER_TB) / DAYS_PER_YEAR;
}

/**
 * Composição por categoria (com margem opcional aplicada ao valor absoluto).
 * As proporções não mudam com a margem; apenas o total absoluto.
 */
export function categoryBreakdown(
  rows: SourceRow[],
  edrMode: EdrMode,
  saasMode: SaasMode,
  tbFlow: number,
  growthMult = 1,
): { slices: CategorySlice[]; total: number } {
  const totals: Record<string, number> = {};

  for (const row of rows) {
    const gbd = rowGbDay(row, edrMode, saasMode);
    const tb = ((gbd * DAYS_PER_YEAR) / GB_PER_TB) * growthMult;
    const cat = CATEGORY_MAP[row.name] ?? 'Outros';
    totals[cat] = (totals[cat] ?? 0) + tb;
  }
  if (tbFlow > 0) {
    totals['Flow de rede'] = (totals['Flow de rede'] ?? 0) + tbFlow * growthMult;
  }

  const entries = Object.entries(totals)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;

  const slices: CategorySlice[] = entries.map(([category, tb]) => ({
    category,
    tb,
    pct: (tb / total) * 100,
    color: CATEGORY_COLORS[category] ?? '#64748b',
  }));

  return { slices, total };
}

/** Pré-calcula os arcos SVG do donut a partir das fatias. */
export function donutArcs(slices: CategorySlice[], total: number, radius: number): DonutArc[] {
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return slices.map((s) => {
    const dash = (s.tb / total) * circumference;
    const arc: DonutArc = { color: s.color, dash, offset: -offset };
    offset += dash;
    return arc;
  });
}

/** Cálculo completo do resultado a partir do estado. */
export function computeResult(state: SizingState): SizingResult {
  const { rows, edrMode, saasMode, growth, flowIncluded, flowRegMin, flowFormat, eps } = state;

  const gbDayLog = totalGbDay(rows, edrMode, saasMode);
  const tbLog = (gbDayLog * DAYS_PER_YEAR) / GB_PER_TB;

  // Flow — só entra se não estiver incluso no EPS
  let tbFlow = 0;
  if (flowIncluded !== 'sim') {
    const regMin = parseFloat(flowRegMin) || 0;
    const bytesPerReg = parseFloat(flowFormat) || 150;
    tbFlow = flowTbYear(regMin, bytesPerReg);
  }

  const tbBase = tbLog + tbFlow;
  const growthMult = 1 + growth / 100;
  const tbGrowth = tbBase * growthMult;

  // Cross-check de EPS: bytes/evento implícito
  const epsVal = parseFloat(eps);
  let bytesImplied: number | null = null;
  if (epsVal && epsVal > 0) {
    const eventsYear = epsVal * SECONDS_PER_DAY * DAYS_PER_YEAR;
    bytesImplied = (tbBase * 1e12) / eventsYear;
  }

  const { slices, total } = categoryBreakdown(rows, edrMode, saasMode, tbFlow, growthMult);

  // Sensibilidade ±10% / ±20%
  const variations = [
    { label: '−20%', mult: 0.8 },
    { label: '−10%', mult: 0.9 },
    { label: 'Base', mult: 1.0 },
    { label: '+10%', mult: 1.1 },
    { label: '+20%', mult: 1.2 },
  ];
  const sensitivity = variations.map((v) => ({
    label: v.label,
    tb: tbBase * v.mult,
    isBase: v.label === 'Base',
  }));

  const assumptions = buildAssumptions(state);

  return {
    gbDayLog,
    tbLog,
    tbFlow,
    tbBase,
    tbGrowth,
    bytesImplied,
    categorySlices: slices,
    categoryTotal: total,
    sensitivity,
    assumptions,
    isEmpty: tbBase <= 0,
  };
}

/** Monta a lista de premissas assumidas, refletindo os toggles atuais. */
function buildAssumptions(state: SizingState): string[] {
  const { epsType, flowIncluded, edrMode, saasMode } = state;

  const epsLabel =
    epsType === 'sustentado'
      ? 'sustentado/uso real'
      : epsType === 'licenca'
        ? 'licença/contratado (risco de superestimar)'
        : 'não confirmado, validar antes de fechar';

  const flowLabel =
    flowIncluded === 'sim'
      ? 'já incluso no EPS, não somado à parte'
      : flowIncluded === 'nao'
        ? 'tratado como fonte separada do EPS'
        : 'não confirmado, validar no QRadar (Network Activity / FPM)';

  return [
    `EPS tratado como ${epsLabel}.`,
    `Flow de rede ${flowLabel}.`,
    `EDR/XDR/AV em modo ${EDR_MODES[edrMode].label}. Confirmar com o cliente o nível real configurado no console.`,
    `SaaS (M365/Workspace) em modo ${SAAS_MODES[saasMode].label}.`,
    `Cálculo aditivo por fonte (não médias ponderadas), o que evita que uma fonte com contagem muito alta distorça o total.`,
    `Fator de ajuste raw assume ingestão bruta sem filtro, que é o padrão de billing do Google SecOps, salvo Data Processing Pipelines (Enterprise/Enterprise Plus).`,
    `EPS real usado só como cross-check de consistência, não como driver do cálculo.`,
    `Verificar se há fontes adicionais no ambiente não listadas no inventário.`,
  ];
}

/** Texto do aviso de EPS conforme a origem. */
export function epsAdvisory(state: SizingState): string {
  return EPS_TYPE_ADVISORY[state.epsType];
}

/** Texto do aviso de flow conforme a resposta. */
export function flowAdvisory(state: SizingState): string {
  return FLOW_INCLUDED_ADVISORY[state.flowIncluded];
}
