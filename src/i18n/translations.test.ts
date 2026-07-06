import { describe, expect, it } from 'vitest';
import { DICTIONARIES, pt, type TranslationKey } from './translations';

describe('i18n', () => {
  it('ES e EN têm exatamente as mesmas chaves que PT', () => {
    const ptKeys = Object.keys(pt).sort();
    const esKeys = Object.keys(DICTIONARIES.es).sort();
    const enKeys = Object.keys(DICTIONARIES.en).sort();
    expect(esKeys).toEqual(ptKeys);
    expect(enKeys).toEqual(ptKeys);
  });

  it('nenhuma tradução está vazia', () => {
    for (const lang of ['pt', 'es', 'en'] as const) {
      for (const [key, value] of Object.entries(DICTIONARIES[lang])) {
        expect(value, `${lang}.${key} vazio`).toBeTruthy();
      }
    }
  });

  it('preserva termos técnicos que não devem ser traduzidos', () => {
    // "EPS" e "flow" devem aparecer intactos em todos os idiomas onde a chave os usa
    const flowKey: TranslationKey = 'ctx.flowLabel';
    expect(DICTIONARIES.pt[flowKey]).toContain('flow');
    expect(DICTIONARIES.es[flowKey]).toContain('flow');
    expect(DICTIONARIES.en[flowKey]).toContain('flow');
    expect(DICTIONARIES.es[flowKey]).toContain('EPS');
    expect(DICTIONARIES.en[flowKey]).toContain('EPS');
  });

  it('a chave de crosscheck tem os placeholders {eps} e {bytes} em todos os idiomas', () => {
    const key: TranslationKey = 'ctx.epsCrosscheck';
    for (const lang of ['pt', 'es', 'en'] as const) {
      expect(DICTIONARIES[lang][key]).toContain('{eps}');
      expect(DICTIONARIES[lang][key]).toContain('{bytes}');
    }
  });

  it('inclui as chaves de rodapé, guia de cloud e relatório', () => {
    const required: TranslationKey[] = [
      'footer.disclaimer',
      'cloud.title',
      'cloud.intro',
      'report.printButton',
      'report.executiveSummary',
      'report.total',
    ];
    for (const key of required) {
      for (const lang of ['pt', 'es', 'en'] as const) {
        expect(DICTIONARIES[lang][key], `${lang}.${key}`).toBeTruthy();
      }
    }
  });

  it('report.totalSources tem o placeholder {n} em todos os idiomas', () => {
    for (const lang of ['pt', 'es', 'en'] as const) {
      expect(DICTIONARIES[lang]['report.totalSources']).toContain('{n}');
    }
  });
});
