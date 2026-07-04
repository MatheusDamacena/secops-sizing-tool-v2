import { SectionCard } from './SectionCard';
import { SegButton } from './SegButton';
import { epsAdvisory, flowAdvisory } from '@/lib/sizing';
import type { SizingApi } from '@/hooks/useSizingState';

const inputCls =
  'w-full rounded-[9px] border border-line bg-panel-alt px-[11px] py-[9px] font-mono text-[14px] text-text outline-none transition-colors focus:border-primary';

const labelCls = 'mb-2 block text-[12px] font-medium text-text-dim';

export function ContextSection({ api }: { api: SizingApi }) {
  const { state, result } = api;
  const epsAdv = epsAdvisory(state);
  const flowAdv = flowAdvisory(state);

  return (
    <SectionCard
      num={1}
      title="Contexto & validação"
      desc="As perguntas que mudam o resultado mais do que qualquer ajuste de catálogo."
    >
      <div className="grid grid-cols-1 gap-[18px_22px] md:grid-cols-2">
        {/* EPS */}
        <div>
          <label className={labelCls}>
            EPS real observado no SIEM{' '}
            <span className="font-normal text-text-faint">— cross-check, opcional</span>
          </label>
          <input
            type="number"
            min={0}
            placeholder="ex: 12000"
            value={state.eps}
            onChange={(e) => api.setEps(e.target.value)}
            onFocus={(e) => e.target.select()}
            className={inputCls}
            aria-label="EPS real observado no SIEM de origem"
          />
          {result.bytesImplied !== null && (
            <div className="mt-2 text-[11px] leading-relaxed text-text-faint">
              Cross-check: {parseFloat(state.eps).toLocaleString('pt-BR')} EPS implicaria em{' '}
              <b className="text-purple">{result.bytesImplied.toFixed(0)} bytes/evento</b> médio para
              bater com o TB/ano. Compare com o observado no SIEM de origem.
            </div>
          )}
        </div>

        {/* Toggles EDR + SaaS */}
        <div>
          <label className={labelCls}>
            Telemetria do EDR / XDR / AV{' '}
            <span className="font-normal text-text-faint">— afeta essa linha</span>
          </label>
          <div className="flex gap-1.5">
            <SegButton variant="purple" active={state.edrMode === 'alert'} onClick={() => api.setEdrMode('alert')}>
              Só alertas
            </SegButton>
            <SegButton variant="purple" active={state.edrMode === 'mod'} onClick={() => api.setEdrMode('mod')}>
              Moderado
            </SegButton>
            <SegButton variant="purple" active={state.edrMode === 'full'} onClick={() => api.setEdrMode('full')}>
              Full
            </SegButton>
          </div>
          <div className="mb-2 mt-2 text-[11px] font-medium text-text-dim">
            Auditoria SaaS (M365 / Workspace)
          </div>
          <div className="flex gap-1.5">
            <SegButton active={state.saasMode === 'padrao'} onClick={() => api.setSaasMode('padrao')}>
              Padrão (agregado)
            </SegButton>
            <SegButton active={state.saasMode === 'verbose'} onClick={() => api.setSaasMode('verbose')}>
              Verbose (UAL)
            </SegButton>
          </div>
        </div>
      </div>

      <div className="mx-0 my-[18px] h-px bg-line" />

      <div className="grid grid-cols-1 gap-[18px_22px] md:grid-cols-2">
        {/* EPS sustentado vs licença */}
        <div>
          <label className="mb-[9px] block text-[12px] font-medium text-text-dim">
            O EPS informado é sustentado ou de licença?
          </label>
          <div className="flex flex-wrap gap-1.5">
            <SegButton variant="amber" active={state.epsType === 'sustentado'} onClick={() => api.setEpsType('sustentado')}>
              Sustentado
            </SegButton>
            <SegButton variant="amber" active={state.epsType === 'licenca'} onClick={() => api.setEpsType('licenca')}>
              Licença
            </SegButton>
            <SegButton variant="amber" active={state.epsType === 'naosei'} onClick={() => api.setEpsType('naosei')}>
              Não sei
            </SegButton>
          </div>
          {epsAdv && <Advisory text={epsAdv} />}
        </div>

        {/* Flow incluso? */}
        <div>
          <label className="mb-[9px] block text-[12px] font-medium text-text-dim">
            O EPS já inclui flow (NetFlow / IPFIX)?
          </label>
          <div className="flex flex-wrap gap-1.5">
            <SegButton variant="amber" active={state.flowIncluded === 'nao'} onClick={() => api.setFlowIncluded('nao')}>
              Não, separado
            </SegButton>
            <SegButton variant="amber" active={state.flowIncluded === 'sim'} onClick={() => api.setFlowIncluded('sim')}>
              Sim, incluso
            </SegButton>
            <SegButton variant="amber" active={state.flowIncluded === 'naosei'} onClick={() => api.setFlowIncluded('naosei')}>
              Não sei
            </SegButton>
          </div>
          {flowAdv && <Advisory text={flowAdv} />}
          {state.flowIncluded !== 'sim' && (
            <div className="mt-2.5 grid grid-cols-[1fr_1.3fr] gap-2.5">
              <div>
                <label className="mb-[5px] block text-[10.5px] text-text-faint">
                  Flow (registros/min)
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="ex: 8000"
                  value={state.flowRegMin}
                  onChange={(e) => api.setFlowRegMin(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className="w-full rounded-lg border border-line bg-panel-alt px-[9px] py-[7px] font-mono text-[12.5px] text-text outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-[5px] block text-[10.5px] text-text-faint">
                  Formato predominante
                </label>
                <select
                  value={state.flowFormat}
                  onChange={(e) => api.setFlowFormat(e.target.value)}
                  className="w-full rounded-lg border border-line bg-panel-alt px-[9px] py-[7px] text-[12px] text-text outline-none focus:border-primary"
                >
                  <option value="150">NetFlow v5/v9, sFlow (~150 B/reg)</option>
                  <option value="300">IPFIX / QFlow L7 (~300 B/reg)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

function Advisory({ text }: { text: string }) {
  return (
    <div className="mt-[9px] rounded-[9px] border border-[color:var(--amber)]/25 bg-[color:var(--amber)]/[.08] px-[11px] py-[9px] text-[11px] leading-relaxed text-amber">
      {text}
    </div>
  );
}
