// ============================================================================
// Calculadora rápida: converte qualquer taxa de ingestão para TB/ano.
// Lógica pura (sem React), portada da ferramenta SecOps Sizing Tool v2.
//
// IMPORTANTE: usa base DECIMAL (1 TB = 10^12 bytes), que é a convenção de
// cotação/faturamento de ingestão. Isto difere do cálculo binário (÷1024)
// usado no inventário principal — são contextos diferentes e ambos corretos.
// ============================================================================

export type QuickUnit =
  | 'MB_per_day'
  | 'GB_per_day'
  | 'TB_per_day'
  | 'MB_per_hour'
  | 'GB_per_hour'
  | 'TB_per_hour'
  | 'GB_per_month'
  | 'TB_per_month'
  | 'EPS';

export interface QuickUnitOption {
  value: QuickUnit;
  label: string;
  isEps?: boolean;
}

export const QUICK_UNITS: QuickUnitOption[] = [
  { value: 'MB_per_day', label: 'MB / dia' },
  { value: 'GB_per_day', label: 'GB / dia' },
  { value: 'TB_per_day', label: 'TB / dia' },
  { value: 'MB_per_hour', label: 'MB / hora' },
  { value: 'GB_per_hour', label: 'GB / hora' },
  { value: 'TB_per_hour', label: 'TB / hora' },
  { value: 'GB_per_month', label: 'GB / mês' },
  { value: 'TB_per_month', label: 'TB / mês' },
  { value: 'EPS', label: 'EPS (events/s) — requer tamanho do evento', isEps: true },
];

const BYTES = { MB: 1e6, GB: 1e9, TB: 1e12 } as const;

export interface QuickCalcInput {
  value: number;
  unit: QuickUnit;
  daysPerYear: number; // 365 ou 366
  daysPerMonth: number; // 30 ou 30.4375
  eventBytes: number; // usado só quando unit === 'EPS'
  overhead: number; // fator multiplicador (1.0 = sem overhead)
}

export interface QuickCalcResult {
  bytesPerYear: number;
  tbPerYear: number;
  gbPerYear: number;
  gbPerDay: number;
  isEps: boolean;
}

/** Converte a entrada da calculadora rápida em bytes/ano, depois TB/ano decimal. */
export function quickCalc(input: QuickCalcInput): QuickCalcResult {
  const { value, unit, daysPerYear, daysPerMonth, eventBytes, overhead } = input;
  const v = Number.isFinite(value) ? value : 0;

  let bytesPerYear = 0;

  switch (unit) {
    case 'MB_per_day':
      bytesPerYear = v * BYTES.MB * daysPerYear;
      break;
    case 'GB_per_day':
      bytesPerYear = v * BYTES.GB * daysPerYear;
      break;
    case 'TB_per_day':
      bytesPerYear = v * BYTES.TB * daysPerYear;
      break;
    case 'MB_per_hour':
      bytesPerYear = v * BYTES.MB * 24 * daysPerYear;
      break;
    case 'GB_per_hour':
      bytesPerYear = v * BYTES.GB * 24 * daysPerYear;
      break;
    case 'TB_per_hour':
      bytesPerYear = v * BYTES.TB * 24 * daysPerYear;
      break;
    case 'GB_per_month':
      bytesPerYear = v * BYTES.GB * daysPerMonth * 12;
      break;
    case 'TB_per_month':
      bytesPerYear = v * BYTES.TB * daysPerMonth * 12;
      break;
    case 'EPS':
      // eventos/s × segundos/dia × dias/ano × bytes/evento × overhead
      bytesPerYear = v * 86_400 * daysPerYear * eventBytes * overhead;
      break;
  }

  const tbPerYear = bytesPerYear / BYTES.TB;
  const gbPerYear = bytesPerYear / BYTES.GB;
  const gbPerDay = gbPerYear / daysPerYear;

  return {
    bytesPerYear,
    tbPerYear,
    gbPerYear,
    gbPerDay,
    isEps: unit === 'EPS',
  };
}

/** Monta a linha de memória de cálculo para exibição. */
export function quickCalcMemo(input: QuickCalcInput): string {
  const { value, unit, daysPerYear, eventBytes, overhead } = input;
  const label = QUICK_UNITS.find((u) => u.value === unit)?.label ?? unit;
  if (unit === 'EPS') {
    return `${value} (EPS) · ${daysPerYear} dias · ${eventBytes}B · ${overhead}×`;
  }
  return `${value} (${label}) · ${daysPerYear} dias`;
}
