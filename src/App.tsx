import { useState } from 'react';
import { Header } from './components/Header';
import { ContextSection } from './components/ContextSection';
import { InventorySection } from './components/InventorySection';
import { ResultRail } from './components/ResultRail';
import { Report } from './components/Report';
import { CloudGuideModal } from './components/CloudGuideModal';
import { QuickCalcModal } from './components/QuickCalcModal';
import { HelpModal } from './components/HelpModal';
import { useSizingState } from './hooks/useSizingState';
import { useTheme } from './hooks/useTheme';
import { useI18n } from './i18n/context';

export function App() {
  const api = useSizingState();
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const [reportOpen, setReportOpen] = useState(false);
  const [cloudGuideOpen, setCloudGuideOpen] = useState(false);
  const [quickCalcOpen, setQuickCalcOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: 'ok' | 'err' } | null>(null);

  const handleImport = (text: string) => {
    try {
      api.importFromText(text);
      setToast({ msg: t('header.importSuccess'), kind: 'ok' });
    } catch {
      setToast({ msg: t('header.importError'), kind: 'err' });
    }
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header
        theme={theme}
        onToggleTheme={toggle}
        onReset={api.reset}
        onToggleReport={() => setReportOpen((o) => !o)}
        reportOpen={reportOpen}
        onOpenCloudGuide={() => setCloudGuideOpen(true)}
        onOpenQuickCalc={() => setQuickCalcOpen(true)}
        onExport={api.exportToFile}
        onImportText={handleImport}
        onOpenHelp={() => setHelpOpen(true)}
      />

      <main className="mx-auto grid max-w-[1240px] grid-cols-1 items-start gap-4 px-4 pb-16 pt-4 sm:gap-[26px] sm:px-7 sm:pt-[26px] lg:grid-cols-[minmax(0,1.62fr)_minmax(340px,1fr)]">
        <div className="flex min-w-0 flex-col gap-4 sm:gap-[22px]">
          <ContextSection api={api} />
          <InventorySection api={api} />
        </div>
        <ResultRail api={api} />
      </main>

      {reportOpen && <Report api={api} />}

      {cloudGuideOpen && <CloudGuideModal onClose={() => setCloudGuideOpen(false)} />}

      {quickCalcOpen && <QuickCalcModal onClose={() => setQuickCalcOpen(false)} />}

      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}

      {toast && (
        <div
          role="status"
          className={[
            'app-chrome fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-[10px] border px-4 py-3 text-[12.5px] font-medium shadow-lg',
            toast.kind === 'ok'
              ? 'border-primary bg-primary text-white'
              : 'border-destructive bg-destructive text-white',
          ].join(' ')}
        >
          {toast.msg}
        </div>
      )}

      <footer className="app-chrome mx-auto max-w-[1240px] px-4 pb-10 pt-2 sm:px-7">
        <p className="border-t border-line pt-5 text-center text-[11.5px] leading-relaxed text-text-faint">
          {t('footer.disclaimer')}
        </p>
      </footer>
    </div>
  );
}
