import { useCallback, useEffect, useState } from 'react';
import type { Theme } from '@/types/sizing';

/**
 * Gerencia o tema claro/escuro.
 * - Inicializa a partir da preferência do sistema (prefers-color-scheme).
 * - Aplica o atributo data-theme no <html> (usado pelo Tailwind darkMode).
 */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggle };
}
