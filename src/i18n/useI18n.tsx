import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { detectLang, type Lang } from './config';
import { DICTIONARIES } from './translations';
import { I18nContext } from './context';
import type { TranslationKey } from './translations';

const STORAGE_KEY = 'secops-sizing-lang';

function readInitialLang(): Lang {
  if (typeof window === 'undefined') return 'pt';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'pt' || stored === 'es' || stored === 'en') return stored;
  } catch {
    /* localStorage indisponível — ignora */
  }
  return detectLang();
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignora */
    }
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      let text = DICTIONARIES[lang][key] ?? DICTIONARIES.pt[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      return text;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
