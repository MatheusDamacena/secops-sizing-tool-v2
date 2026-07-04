import { useState } from 'react';
import { Header } from './components/Header';
import { ContextSection } from './components/ContextSection';
import { InventorySection } from './components/InventorySection';
import { ResultRail } from './components/ResultRail';
import { Report } from './components/Report';
import { useSizingState } from './hooks/useSizingState';
import { useTheme } from './hooks/useTheme';

export function App() {
  const api = useSizingState();
  const { theme, toggle } = useTheme();
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header
        theme={theme}
        onToggleTheme={toggle}
        onReset={api.reset}
        onToggleReport={() => setReportOpen((o) => !o)}
        reportOpen={reportOpen}
      />

      <main className="mx-auto grid max-w-[1240px] grid-cols-1 items-start gap-[26px] px-7 pb-16 pt-[26px] lg:grid-cols-[minmax(0,1.62fr)_minmax(340px,1fr)]">
        <div className="flex min-w-0 flex-col gap-[22px]">
          <ContextSection api={api} />
          <InventorySection api={api} />
        </div>
        <ResultRail api={api} />
      </main>

      {reportOpen && <Report api={api} />}
    </div>
  );
}
