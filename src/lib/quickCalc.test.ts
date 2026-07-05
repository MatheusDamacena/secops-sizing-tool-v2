import { describe, expect, it } from 'vitest';
import { quickCalc, type QuickCalcInput } from './quickCalc';

function input(overrides: Partial<QuickCalcInput> = {}): QuickCalcInput {
  return {
    value: 500,
    unit: 'GB_per_day',
    daysPerYear: 365,
    daysPerMonth: 30,
    eventBytes: 600,
    overhead: 1.2,
    ...overrides,
  };
}

describe('quickCalc', () => {
  it('500 GB/dia = 182,5 TB/ano (base decimal)', () => {
    // Validado contra a ferramenta original: 500 × 365 = 182.500 GB = 182,5 TB
    const r = quickCalc(input({ unit: 'GB_per_day' }));
    expect(r.tbPerYear).toBeCloseTo(182.5, 3);
  });

  it('modo EPS: 500 EPS × 600B × 1.2 = 11,35 TB/ano', () => {
    // Validado contra a ferramenta original: 500 × 86400 × 365 × 600 × 1.2 / 1e12
    const r = quickCalc(input({ unit: 'EPS' }));
    expect(r.tbPerYear).toBeCloseTo(11.35, 1);
    expect(r.isEps).toBe(true);
  });

  it('TB/dia converte direto', () => {
    const r = quickCalc(input({ value: 1, unit: 'TB_per_day' }));
    expect(r.tbPerYear).toBeCloseTo(365, 5);
  });

  it('unidades horárias multiplicam por 24', () => {
    const perHour = quickCalc(input({ value: 10, unit: 'GB_per_hour' }));
    const perDayEquivalent = quickCalc(input({ value: 240, unit: 'GB_per_day' }));
    expect(perHour.tbPerYear).toBeCloseTo(perDayEquivalent.tbPerYear, 5);
  });

  it('GB/mês usa dias/mês × 12', () => {
    const r = quickCalc(input({ value: 100, unit: 'GB_per_month', daysPerMonth: 30 }));
    // 100 GB × 30 dias × 12 meses = 36.000 GB/ano = 36 TB (decimal: 1 TB = 1000 GB)
    expect(r.tbPerYear).toBeCloseTo(36, 5);
  });

  it('ano bissexto (366) aumenta levemente o total', () => {
    const normal = quickCalc(input({ daysPerYear: 365 }));
    const leap = quickCalc(input({ daysPerYear: 366 }));
    expect(leap.tbPerYear).toBeGreaterThan(normal.tbPerYear);
  });

  it('valor inválido resulta em zero', () => {
    const r = quickCalc(input({ value: NaN }));
    expect(r.tbPerYear).toBe(0);
  });
});
