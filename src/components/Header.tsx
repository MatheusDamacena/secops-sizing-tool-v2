import { useRef } from 'react';
import type { Theme } from '@/types/sizing';
import { useI18n } from '@/i18n/context';
import { LangSelector } from './LangSelector';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onReset: () => void;
  onToggleReport: () => void;
  reportOpen: boolean;
  onOpenCloudGuide: () => void;
  onOpenQuickCalc: () => void;
  onExport: () => void;
  onImportText: (text: string) => void;
  onOpenHelp: () => void;
}

export function Header({
  theme,
  onToggleTheme,
  onReset,
  onToggleReport,
  reportOpen,
  onOpenCloudGuide,
  onOpenQuickCalc,
  onExport,
  onImportText,
  onOpenHelp,
}: HeaderProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onImportText(String(reader.result ?? ''));
    reader.readAsText(file);
    // permite reimportar o mesmo arquivo depois
    e.target.value = '';
  };

  return (
    <header className="app-chrome sticky top-0 z-30 border-b border-line bg-panel shadow-[0_1px_3px_rgba(15,23,42,.04)]">
      <div className="mx-auto flex max-w-[1240px] items-center gap-2 px-4 py-3 sm:gap-4 sm:px-7">
        <div className="flex items-center gap-3">
          <svg width="30" height="30" viewBox="0 0 40 40" className="flex-shrink-0">
            <polygon points="20,3 36,12 20,21 4,12" fill="var(--primary)" />
            <polygon points="4,12 20,21 20,37 4,28" fill="var(--purple)" />
            <circle cx="29" cy="27" r="7" fill="var(--pink)" />
          </svg>
          <div>
            <div className="text-[14px] font-semibold leading-tight tracking-tight text-text sm:text-[15px]">
              SecOps Sizing Engine
            </div>
            <div className="mt-0.5 hidden font-mono text-[10px] uppercase tracking-[0.14em] text-text-faint sm:block">
              {t('header.subtitle')}
            </div>
          </div>
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={onOpenHelp}
          aria-label={t('help.button')}
          title={t('help.button')}
          className="flex h-[38px] items-center gap-2 rounded-[10px] border border-primary/40 bg-[color:var(--primary)]/[.08] px-2.5 text-[12.5px] font-medium text-primary transition-colors hover:bg-[color:var(--primary)]/[.14] sm:px-4"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className="hidden sm:inline">{t('help.button')}</span>
        </button>

        <button
          type="button"
          onClick={onOpenQuickCalc}
          aria-label={t('header.quickCalc')}
          className="flex h-[38px] items-center gap-2 rounded-[10px] border border-line bg-panel-alt px-2.5 text-[12.5px] font-medium text-text-dim transition-colors hover:border-primary hover:text-primary sm:px-4"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="8" y1="6" x2="16" y2="6" />
            <line x1="8" y1="10" x2="8" y2="10" />
            <line x1="12" y1="10" x2="12" y2="10" />
            <line x1="16" y1="10" x2="16" y2="10" />
            <line x1="8" y1="14" x2="8" y2="14" />
            <line x1="12" y1="14" x2="12" y2="14" />
            <line x1="16" y1="14" x2="16" y2="18" />
            <line x1="8" y1="18" x2="12" y2="18" />
          </svg>
          <span className="hidden sm:inline">{t('header.quickCalc')}</span>
        </button>

        <button
          type="button"
          onClick={onOpenCloudGuide}
          aria-label={t('header.cloudGuide')}
          className="flex h-[38px] items-center gap-2 rounded-[10px] border border-line bg-panel-alt px-2.5 text-[12.5px] font-medium text-text-dim transition-colors hover:border-primary hover:text-primary sm:px-4"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17.5 19a4.5 4.5 0 1 0 0-9h-1.8A7 7 0 1 0 4 15.9" />
          </svg>
          <span className="hidden sm:inline">{t('header.cloudGuide')}</span>
        </button>

        <LangSelector />

        <button
          type="button"
          onClick={onToggleTheme}
          title={t('header.themeToggle')}
          aria-label={t('header.themeToggle')}
          className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px] border border-line bg-panel-alt text-text-dim transition-colors hover:border-primary"
        >
          <span className="text-[15px]">{theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFile}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label={t('header.import')}
          title={t('header.import')}
          className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px] border border-line bg-panel-alt text-text-dim transition-colors hover:border-primary hover:text-primary"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onExport}
          aria-label={t('header.export')}
          title={t('header.export')}
          className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px] border border-line bg-panel-alt text-text-dim transition-colors hover:border-primary hover:text-primary"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onReset}
          aria-label={t('header.reset')}
          className="hidden h-[38px] items-center gap-1.5 rounded-[10px] border border-line bg-panel-alt px-4 text-[12.5px] font-medium text-text-dim transition-colors hover:border-primary sm:flex"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          {t('header.reset')}
        </button>

        <button
          type="button"
          onClick={onToggleReport}
          aria-label={reportOpen ? t('header.hideReport') : t('header.generateReport')}
          className="flex h-[38px] items-center gap-2 rounded-[10px] border-none bg-primary px-3 text-[12.5px] font-semibold text-white shadow-[0_1px_2px_rgba(37,99,235,.35)] transition-opacity hover:opacity-90 sm:px-[17px]"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          <span className="hidden sm:inline">{reportOpen ? t('header.hideReport') : t('header.generateReport')}</span>
        </button>
      </div>
    </header>
  );
}
