import { describe, expect, it } from 'vitest';
import { computeResult, resolveMbFactor, rowGbDay, flowTbYear } from './sizing';
import { EDR_KEY, SAAS_KEY } from '@/data/catalog';
import type { SizingState, SourceRow } from '@/types/sizing';

function baseState(overrides: Partial<SizingState> = {}): SizingState {
  return {
    eps: '',
    epsType: 'sustentado',
    flowIncluded: 'nao',
    flowRegMin: '0',
    flowFormat: '150',
    edrMode: 'mod',
    saasMode: 'padrao',
    growth: 15,
    rows: [],
    projName: 'Test',
    ...overrides,
  };
}

describe('resolveMbFactor', () => {
  it('usa o catálogo padrão para uma fonte comum', () => {
    const row: SourceRow = { name: 'Firewall / NGFW', qty: 1 };
    expect(resolveMbFactor(row, 'mod', 'padrao')).toEqual({ mb: 1000, factor: 1.1 });
  });

  it('respeita o toggle de EDR', () => {
    const row: SourceRow = { name: EDR_KEY, qty: 1 };
    expect(resolveMbFactor(row, 'alert', 'padrao')).toEqual({ mb: 10, factor: 1.0 });
    expect(resolveMbFactor(row, 'full', 'padrao')).toEqual({ mb: 50, factor: 1.3 });
  });

  it('respeita o toggle de SaaS', () => {
    const row: SourceRow = { name: SAAS_KEY, qty: 1 };
    expect(resolveMbFactor(row, 'mod', 'verbose')).toEqual({ mb: 150, factor: 1.2 });
  });

  it('prioriza override manual sobre tudo', () => {
    const row: SourceRow = { name: EDR_KEY, qty: 1, override: true, mb: 999, factor: 2 };
    expect(resolveMbFactor(row, 'full', 'padrao')).toEqual({ mb: 999, factor: 2 });
  });

  it('override de MB efetivo (factor 1) reflete o valor exato editado', () => {
    // Simula o que overrideMbEffective grava: mb = efetivo, factor = 1.
    const row: SourceRow = { name: 'Windows Workstation', qty: 200, override: true, mb: 40, factor: 1 };
    // Sem override seria 10 × 1.75 = 17.5; com override manual, é exatamente 40.
    expect(resolveMbFactor(row, 'mod', 'padrao')).toEqual({ mb: 40, factor: 1 });
    expect(rowGbDay(row, 'mod', 'padrao')).toBeCloseTo((200 * 40 * 1) / 1024, 5);
  });
});

describe('rowGbDay', () => {
  it('calcula GB/dia de uma linha corretamente', () => {
    const row: SourceRow = { name: 'Windows Server', qty: 100 };
    // 100 * 250 * 1.35 / 1024
    expect(rowGbDay(row, 'mod', 'padrao')).toBeCloseTo((100 * 250 * 1.35) / 1024, 5);
  });
});

describe('flowTbYear', () => {
  it('calcula flow em TB/ano', () => {
    // 8000 reg/min * 60 * 24 * 365 * 150 bytes / 1e12
    const expected = (8000 * 60 * 24 * 365 * 150) / 1e12;
    expect(flowTbYear(8000, 150)).toBeCloseTo(expected, 6);
  });
});

describe('computeResult', () => {
  it('retorna vazio quando não há quantidades', () => {
    const result = computeResult(baseState({ rows: [{ name: 'Firewall / NGFW', qty: 0 }] }));
    expect(result.isEmpty).toBe(true);
    expect(result.tbBase).toBe(0);
  });

  it('nunca produz Infinity, mesmo com flowRegMin absurdo (1e999)', () => {
    const result = computeResult(
      baseState({
        rows: [{ name: 'Windows Server', qty: 10 }],
        flowIncluded: 'nao',
        flowRegMin: '1e999', // parseFloat vira Infinity
      }),
    );
    expect(Number.isFinite(result.tbFlow)).toBe(true);
    expect(Number.isFinite(result.tbGrowth)).toBe(true);
  });

  it('bytesImplied é null (não Infinity/NaN) com EPS absurdo', () => {
    const result = computeResult(
      baseState({ rows: [{ name: 'Windows Server', qty: 10 }], eps: '1e999' }),
    );
    expect(result.bytesImplied === null || Number.isFinite(result.bytesImplied)).toBe(true);
  });

  it('aplica a margem de crescimento ao total', () => {
    const result = computeResult(
      baseState({ rows: [{ name: 'Windows Server', qty: 100 }], growth: 20 }),
    );
    expect(result.tbGrowth).toBeCloseTo(result.tbBase * 1.2, 5);
  });

  it('não soma flow quando já está incluso no EPS', () => {
    const result = computeResult(
      baseState({
        rows: [{ name: 'Windows Server', qty: 10 }],
        flowIncluded: 'sim',
        flowRegMin: '8000',
      }),
    );
    expect(result.tbFlow).toBe(0);
  });

  it('soma flow quando é separado do EPS', () => {
    const result = computeResult(
      baseState({
        rows: [{ name: 'Windows Server', qty: 10 }],
        flowIncluded: 'nao',
        flowRegMin: '8000',
        flowFormat: '150',
      }),
    );
    expect(result.tbFlow).toBeGreaterThan(0);
  });

  it('calcula bytes/evento implícito quando EPS é informado', () => {
    const result = computeResult(
      baseState({ rows: [{ name: 'Windows Server', qty: 100 }], eps: '12000' }),
    );
    expect(result.bytesImplied).not.toBeNull();
    expect(result.bytesImplied!).toBeGreaterThan(0);
  });

  it('produz 5 cenários de sensibilidade com base no centro', () => {
    const result = computeResult(baseState({ rows: [{ name: 'Windows Server', qty: 100 }] }));
    expect(result.sensitivity).toHaveLength(5);
    const base = result.sensitivity.find((s) => s.isBase)!;
    expect(base.tb).toBeCloseTo(result.tbBase, 5);
  });
});
