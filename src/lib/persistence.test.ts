import { describe, expect, it } from 'vitest';
import {
  parseImportedFile,
  serializeState,
  validateState,
  SCHEMA_VERSION,
} from './persistence';
import type { SizingState } from '@/types/sizing';

function sampleState(): SizingState {
  return {
    eps: '12000',
    epsType: 'sustentado',
    flowIncluded: 'nao',
    flowRegMin: '8000',
    flowFormat: '150',
    edrMode: 'full',
    saasMode: 'verbose',
    growth: 20,
    rows: [
      { name: 'Windows Server', qty: 100 },
      { name: 'Firewall / NGFW', qty: 5, mb: 1200, factor: 1, override: true },
    ],
    projName: 'Cliente X',
  };
}

describe('serializeState / parseImportedFile (round-trip)', () => {
  it('preserva o estado num ciclo completo de ida e volta', () => {
    const original = sampleState();
    const json = serializeState(original);
    const restored = parseImportedFile(json);
    expect(restored).toEqual(original);
  });

  it('inclui versão de schema e timestamp no arquivo', () => {
    const json = serializeState(sampleState());
    const parsed = JSON.parse(json);
    expect(parsed.schema).toBe(SCHEMA_VERSION);
    expect(parsed.savedAt).toBeTruthy();
  });
});

describe('validateState (input não confiável)', () => {
  it('rejeita valores não-objeto', () => {
    expect(validateState(null)).toBeNull();
    expect(validateState('string')).toBeNull();
    expect(validateState(42)).toBeNull();
  });

  it('preenche defaults seguros para campos ausentes', () => {
    const result = validateState({});
    expect(result).not.toBeNull();
    expect(result!.epsType).toBe('sustentado');
    expect(result!.edrMode).toBe('mod');
    expect(result!.growth).toBe(15);
    expect(result!.rows).toEqual([]);
  });

  it('descarta enums inválidos, caindo no default', () => {
    const result = validateState({ edrMode: 'hackermode', epsType: '<script>' });
    expect(result!.edrMode).toBe('mod');
    expect(result!.epsType).toBe('sustentado');
  });

  it('faz clamp de growth fora do intervalo', () => {
    expect(validateState({ growth: 999 })!.growth).toBe(100);
    expect(validateState({ growth: -50 })!.growth).toBe(0);
  });

  it('impede quantidade negativa nas linhas', () => {
    const result = validateState({ rows: [{ name: 'Windows Server', qty: -100 }] });
    expect(result!.rows[0].qty).toBe(0);
  });

  it('converte nome de fonte desconhecido em "Outro"', () => {
    const result = validateState({ rows: [{ name: 'FonteInexistente', qty: 5 }] });
    expect(result!.rows[0].name).toBe('Outro');
  });

  it('limita o número de linhas a 200', () => {
    const manyRows = Array.from({ length: 500 }, () => ({ name: 'Windows Server', qty: 1 }));
    const result = validateState({ rows: manyRows });
    expect(result!.rows.length).toBe(200);
  });

  it('trunca customLabel e projName excessivamente longos', () => {
    const longStr = 'a'.repeat(1000);
    const result = validateState({
      projName: longStr,
      rows: [{ name: 'Outro', qty: 1, customLabel: longStr }],
    });
    expect(result!.projName.length).toBeLessThanOrEqual(200);
    expect(result!.rows[0].customLabel!.length).toBeLessThanOrEqual(120);
  });

  it('ignora propriedades extras não previstas (não as propaga)', () => {
    const result = validateState({
      growth: 10,
      maliciousField: 'xyz',
    });
    expect(result).not.toHaveProperty('maliciousField');
    expect(result!.growth).toBe(10);
  });
});

describe('parseImportedFile (erros amigáveis)', () => {
  it('lança erro para JSON malformado', () => {
    expect(() => parseImportedFile('{not json')).toThrow('invalid-json');
  });

  it('aceita o estado cru sem envelope', () => {
    const raw = JSON.stringify({ growth: 25, rows: [] });
    const result = parseImportedFile(raw);
    expect(result.growth).toBe(25);
  });

  it('aceita o formato com envelope { schema, state }', () => {
    const enveloped = serializeState(sampleState());
    const result = parseImportedFile(enveloped);
    expect(result.projName).toBe('Cliente X');
  });
});
