import { SectionCard } from './SectionCard';
import { SegButton } from './SegButton';
import { epsAdvisory, flowAdvisory } from '@/lib/sizing';
import type { SizingApi } from '@/hooks/useSizingState';
import { useI18n } from '@/i18n/context';

const inputCls =
  'w-full rounded-[9px] border border-line bg-panel-alt px-[11px] py-[9px] font-mono text-[14px] text-text outline-none transition-colors focus:border-primary';

const labelCls = 'mb-2 block text-[12px] font-medium text-text-dim';

export function ContextSection({ api }: { api: SizingApi }) {
  const { state, result } = api;
  const { t } = useI18n();
  const epsAdv = epsAdvisory(state);
  const flowAdv = flowAdvisory(state);

  return (
    <SectionCard
      num={1}
      title={t('ctx.title')}
      desc={t('ctx.desc')}
    >
      <div className="grid grid-cols-1 gap-[18px_22px] md:grid-cols-2">
        {/* EPS */}
        <div>
          <label className={labelCls}>
            {t('ctx.epsLabel')}{' '}
            <span className="font-normal text-text-faint">({t('ctx.epsHint')})</span>
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
              {t('ctx.epsCrosscheck', {
                eps: parseFloat(state.eps).toLocaleString('pt-BR'),
                bytes: result.bytesImplied.toFixed(0),
              })}
            </div>
          )}
        </div>

        {/* Toggles EDR + SaaS */}
        <div>
          <label className={labelCls}>
            {t('ctx.edrLabel')}{' '}
            <span className="font-normal text-text-faint">({t('ctx.edrHint')})</span>
          </label>
          <div className="flex gap-1.5">
            <SegButton variant="purple" active={state.edrMode === 'alert'} onClick={() => api.setEdrMode('alert')}>
              {t('ctx.edrAlert')}
            </SegButton>
            <SegButton variant="purple" active={state.edrMode === 'mod'} onClick={() => api.setEdrMode('mod')}>
              {t('ctx.edrMod')}
            </SegButton>
            <SegButton variant="purple" active={state.edrMode === 'full'} onClick={() => api.setEdrMode('full')}>
              {t('ctx.edrFull')}
            </SegButton>
          </div>
          <div className="mb-2 mt-2 text-[11px] font-medium text-text-dim">
            {t('ctx.saasLabel')}
          </div>
          <div className="flex gap-1.5">
            <SegButton active={state.saasMode === 'padrao'} onClick={() => api.setSaasMode('padrao')}>
              {t('ctx.saasPadrao')}
            </SegButton>
            <SegButton active={state.saasMode === 'verbose'} onClick={() => api.setSaasMode('verbose')}>
              {t('ctx.saasVerbose')}
            </SegButton>
          </div>
        </div>
      </div>

      <div className="mx-0 my-[18px] h-px bg-line" />

      <div className="grid grid-cols-1 gap-[18px_22px] md:grid-cols-2">
        {/* EPS sustentado vs licença */}
        <div>
          <label className="mb-[9px] block text-[12px] font-medium text-text-dim">
            {t('ctx.epsTypeLabel')}
          </label>
          <div className="flex flex-wrap gap-1.5">
            <SegButton variant="amber" active={state.epsType === 'sustentado'} onClick={() => api.setEpsType('sustentado')}>
              {t('ctx.epsSustentado')}
            </SegButton>
            <SegButton variant="amber" active={state.epsType === 'licenca'} onClick={() => api.setEpsType('licenca')}>
              {t('ctx.epsLicenca')}
            </SegButton>
            <SegButton variant="amber" active={state.epsType === 'naosei'} onClick={() => api.setEpsType('naosei')}>
              {t('ctx.epsNaosei')}
            </SegButton>
          </div>
          {epsAdv && <Advisory text={epsAdv} />}
        </div>

        {/* Flow incluso? */}
        <div>
          <label className="mb-[9px] block text-[12px] font-medium text-text-dim">
            {t('ctx.flowLabel')}
          </label>
          <div className="flex flex-wrap gap-1.5">
            <SegButton variant="amber" active={state.flowIncluded === 'nao'} onClick={() => api.setFlowIncluded('nao')}>
              {t('ctx.flowNao')}
            </SegButton>
            <SegButton variant="amber" active={state.flowIncluded === 'sim'} onClick={() => api.setFlowIncluded('sim')}>
              {t('ctx.flowSim')}
            </SegButton>
            <SegButton variant="amber" active={state.flowIncluded === 'naosei'} onClick={() => api.setFlowIncluded('naosei')}>
              {t('ctx.flowNaosei')}
            </SegButton>
          </div>
          {flowAdv && <Advisory text={flowAdv} />}
          {state.flowIncluded !== 'sim' && (
            <div className="mt-2.5 grid grid-cols-[1fr_1.3fr] gap-2.5">
              <div>
                <label className="mb-[5px] block text-[10.5px] text-text-faint">
                  {t('ctx.flowRegMin')}
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
                  {t('ctx.flowFormat')}
                </label>
                <select
                  value={state.flowFormat}
                  onChange={(e) => api.setFlowFormat(e.target.value)}
                  className="w-full rounded-lg border border-line bg-panel-alt px-[9px] py-[7px] text-[12px] text-text outline-none focus:border-primary"
                >
                  <option value="150">{t('ctx.flowFmt150')}</option>
                  <option value="300">{t('ctx.flowFmt300')}</option>
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
