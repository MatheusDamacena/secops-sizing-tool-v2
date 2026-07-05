import type { Theme } from '@/types/sizing';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onReset: () => void;
  onToggleReport: () => void;
  reportOpen: boolean;
  onOpenCloudGuide: () => void;
}

export function Header({
  theme,
  onToggleTheme,
  onReset,
  onToggleReport,
  reportOpen,
  onOpenCloudGuide,
}: HeaderProps) {
  return (
    <header className="app-chrome sticky top-0 z-30 border-b border-line bg-panel shadow-[0_1px_3px_rgba(15,23,42,.04)]">
      <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-7 py-3">
        <div className="flex items-center gap-3">
          <svg width="30" height="30" viewBox="0 0 40 40" className="flex-shrink-0">
            <polygon points="20,3 36,12 20,21 4,12" fill="var(--primary)" />
            <polygon points="4,12 20,21 20,37 4,28" fill="var(--purple)" />
            <circle cx="29" cy="27" r="7" fill="var(--pink)" />
          </svg>
          <div>
            <div className="text-[15px] font-semibold leading-tight tracking-tight text-text">
              SecOps Sizing Engine
            </div>
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-faint">
              SecMath // Cotação de ingestão
            </div>
          </div>
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={onOpenCloudGuide}
          className="flex h-[38px] items-center gap-2 rounded-[10px] border border-line bg-panel-alt px-4 text-[12.5px] font-medium text-text-dim transition-colors hover:border-primary hover:text-primary"
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
          Como medir logs da cloud
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          title="Alternar modo claro/escuro"
          aria-label="Alternar entre modo claro e modo escuro"
          className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-line bg-panel-alt text-text-dim transition-colors hover:border-primary"
        >
          <span className="text-[15px]">{theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="flex h-[38px] items-center gap-1.5 rounded-[10px] border border-line bg-panel-alt px-4 text-[12.5px] font-medium text-text-dim transition-colors hover:border-primary"
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
          Resetar
        </button>

        <button
          type="button"
          onClick={onToggleReport}
          className="flex h-[38px] items-center gap-2 rounded-[10px] border-none bg-primary px-[17px] text-[12.5px] font-semibold text-white shadow-[0_1px_2px_rgba(37,99,235,.35)] transition-opacity hover:opacity-90"
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
          {reportOpen ? 'Ocultar relatório' : 'Gerar relatório'}
        </button>
      </div>
    </header>
  );
}
