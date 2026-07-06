import { describe, expect, it } from 'vitest';
import { evaluateSanity } from './sanity';
import type { SizingResult, SizingState } from '@/types/sizing';

function state(overrides: Partial<SizingState> = {}): SizingState {
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
    projName: '',
    ...overrides,
  };
}

function result(overrides: Partial<SizingResult> = {}): SizingResult {
  return {
    gbDayLog: 10,
    tbLog: 3,
    tbFlow: 0,
    tbBase: 3,
    tbGrowth: 3.45,
    bytesImplied: null,
    categorySlices: [],
    categoryTotal: 0,
    sensitivity: [],
    assumptions: [],
    isEmpty: false,
    ...overrides,
  };
}

describe('evaluateSanity — bytes/evento', () => {
  it('não alerta quando bytes/evento está na faixa plausível', () => {
    const alerts = evaluateSanity(state(), result({ bytesImplied: 382 }));
    expect(alerts.find((a) => a.id.startsWith('bytes'))).toBeUndefined();
  });

  it('alerta quando bytes/evento está muito baixo', () => {
    const alerts = evaluateSanity(state(), result({ bytesImplied: 80 }));
    const alert = alerts.find((a) => a.id === 'bytes-low');
    expect(alert).toBeDefined();
    expect(alert!.level).toBe('warning');
  });

  it('alerta quando bytes/evento está muito alto', () => {
    const alerts = evaluateSanity(state(), result({ bytesImplied: 3000 }));
    expect(alerts.find((a) => a.id === 'bytes-high')).toBeDefined();
  });

  it('não alerta bytes quando EPS não foi informado (bytesImplied null)', () => {
    const alerts = evaluateSanity(state(), result({ bytesImplied: null }));
    expect(alerts.find((a) => a.id.startsWith('bytes'))).toBeUndefined();
  });

  it('respeita exatamente os limites da faixa', () => {
    expect(evaluateSanity(state(), result({ bytesImplied: 150 })).find((a) => a.id.startsWith('bytes'))).toBeUndefined();
    expect(evaluateSanity(state(), result({ bytesImplied: 2000 })).find((a) => a.id.startsWith('bytes'))).toBeUndefined();
    expect(evaluateSanity(state(), result({ bytesImplied: 149 })).find((a) => a.id === 'bytes-low')).toBeDefined();
    expect(evaluateSanity(state(), result({ bytesImplied: 2001 })).find((a) => a.id === 'bytes-high')).toBeDefined();
  });
});

describe('evaluateSanity — dominância de fonte', () => {
  it('alerta quando uma categoria passa de 85% do total', () => {
    const alerts = evaluateSanity(
      state(),
      result({
        categoryTotal: 100,
        categorySlices: [
          { category: 'Rede/Perímetro', tb: 90, pct: 90, color: '#000' },
          { category: 'Endpoint/Identidade', tb: 10, pct: 10, color: '#111' },
        ],
      }),
    );
    const alert = alerts.find((a) => a.id === 'dominance');
    expect(alert).toBeDefined();
    expect(alert!.level).toBe('info');
  });

  it('não alerta quando a distribuição é equilibrada', () => {
    const alerts = evaluateSanity(
      state(),
      result({
        categoryTotal: 100,
        categorySlices: [
          { category: 'Rede/Perímetro', tb: 60, pct: 60, color: '#000' },
          { category: 'Endpoint/Identidade', tb: 40, pct: 40, color: '#111' },
        ],
      }),
    );
    expect(alerts.find((a) => a.id === 'dominance')).toBeUndefined();
  });

  it('não alerta dominância quando há só uma categoria', () => {
    const alerts = evaluateSanity(
      state(),
      result({
        categoryTotal: 100,
        categorySlices: [{ category: 'Rede/Perímetro', tb: 100, pct: 100, color: '#000' }],
      }),
    );
    expect(alerts.find((a) => a.id === 'dominance')).toBeUndefined();
  });
});

describe('evaluateSanity — quantidade extrema', () => {
  it('alerta quando uma linha passa de 100.000 itens', () => {
    const alerts = evaluateSanity(
      state({ rows: [{ name: 'Windows Workstation', qty: 500000 }] }),
      result(),
    );
    expect(alerts.find((a) => a.id === 'qty-extreme')).toBeDefined();
  });

  it('não alerta para quantidades normais', () => {
    const alerts = evaluateSanity(
      state({ rows: [{ name: 'Windows Workstation', qty: 5000 }] }),
      result(),
    );
    expect(alerts.find((a) => a.id === 'qty-extreme')).toBeUndefined();
  });
});

describe('evaluateSanity — cenário limpo', () => {
  it('retorna lista vazia quando tudo está plausível', () => {
    const alerts = evaluateSanity(
      state({ rows: [{ name: 'Windows Server', qty: 100 }] }),
      result({
        bytesImplied: 400,
        categoryTotal: 100,
        categorySlices: [
          { category: 'A', tb: 60, pct: 60, color: '#000' },
          { category: 'B', tb: 40, pct: 40, color: '#111' },
        ],
      }),
    );
    expect(alerts).toHaveLength(0);
  });
});
