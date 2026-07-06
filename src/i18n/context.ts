import { createContext, useContext } from 'react';
import type { Lang } from './config';
import type { TranslationKey } from './translations';

export interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Traduz uma chave; aceita variáveis para interpolar (ex: {eps}). */
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n deve ser usado dentro de I18nProvider');
  return ctx;
}
