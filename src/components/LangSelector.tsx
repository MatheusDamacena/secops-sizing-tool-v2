import { LANGS } from '@/i18n/config';
import { useI18n } from '@/i18n/context';
import type { Lang } from '@/i18n/config';

/** Seletor compacto de idioma (dropdown PT / ES / EN). */
export function LangSelector() {
  const { lang, setLang } = useI18n();

  return (
    <div className="relative flex h-[38px] items-center">
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        aria-label="Idioma"
        className="h-[38px] cursor-pointer appearance-none rounded-[10px] border border-line bg-panel-alt pl-3 pr-7 text-[12.5px] font-semibold text-text-dim outline-none transition-colors hover:border-primary focus:border-primary"
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      {/* seta customizada */}
      <svg
        className="pointer-events-none absolute right-2.5 text-text-faint"
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}
