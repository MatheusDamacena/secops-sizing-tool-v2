// ============================================================================
// Infraestrutura de internacionalização (i18n) — leve, tipada, sem dependências.
//
// PRINCÍPIO: termos técnicos NUNCA são traduzidos (EPS, flow, raw, EDR, SIEM,
// CloudTrail, Advanced Audit Policy, etc.). Apenas as frases que os conectam
// mudam de idioma. Os nomes de fontes do catálogo também permanecem originais.
// ============================================================================

export type Lang = 'pt' | 'es' | 'en';

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'pt', label: 'PT' },
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
];

/** Detecta o idioma inicial a partir do navegador; cai em PT se não reconhecer. */
export function detectLang(): Lang {
  if (typeof navigator === 'undefined') return 'pt';
  const nav = (navigator.language || 'pt').toLowerCase();
  if (nav.startsWith('es')) return 'es';
  if (nav.startsWith('en')) return 'en';
  return 'pt';
}
