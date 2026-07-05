import { useState } from 'react';
import { Header } from './components/Header';
import { ContextSection } from './components/ContextSection';
import { InventorySection } from './components/InventorySection';
import { ResultRail } from './components/ResultRail';
import { Report } from './components/Report';
import { CloudGuideModal } from './components/CloudGuideModal';
import { QuickCalcModal } from './components/QuickCalcModal';
import { useSizingState } from './hooks/useSizingState';
import { useTheme } from './hooks/useTheme';

export function App() {
  const api = useSizingState();
  const { theme, toggle } = useTheme();
  const [reportOpen, setReportOpen] = useState(false);
  const [cloudGuideOpen, setCloudGuideOpen] = useState(false);
  const [quickCalcOpen, setQuickCalcOpen] = useState(false);

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
      />

      <main className="mx-auto grid max-w-[1240px] grid-cols-1 items-start gap-[26px] px-7 pb-16 pt-[26px] lg:grid-cols-[minmax(0,1.62fr)_minmax(340px,1fr)]">
        <div className="flex min-w-0 flex-col gap-[22px]">
          <ContextSection api={api} />
          <InventorySection api={api} />
        </div>
        <ResultRail api={api} />
      </main>

      {reportOpen && <Report api={api} />}

      {cloudGuideOpen && <CloudGuideModal onClose={() => setCloudGuideOpen(false)} />}

      {quickCalcOpen && <QuickCalcModal onClose={() => setQuickCalcOpen(false)} />}

      <footer className="app-chrome mx-auto max-w-[1240px] px-7 pb-10 pt-2">
        <p className="border-t border-line pt-5 text-center text-[11.5px] leading-relaxed text-text-faint">
          Estimativa de pré-venda para fins de dimensionamento inicial. Baseada em valores de
          referência de mercado. O volume real de ingestão pode variar conforme configuração,
          verbosidade e sazonalidade do ambiente. O dimensionamento final deve ser confirmado por
          meio de um piloto de ingestão real antes de qualquer decisão de licenciamento.
        </p>
      </footer>
    </div>
  );
}
