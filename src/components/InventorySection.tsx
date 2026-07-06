import { SectionCard } from './SectionCard';
import { CATALOG } from '@/data/catalog';
import { METHOD_GROUPS } from '@/data/copy';
import { resolveMbFactor } from '@/lib/sizing';
import type { SizingApi } from '@/hooks/useSizingState';
import type { SourceRow } from '@/types/sizing';
import { useI18n } from '@/i18n/context';

const catalogKeys = Object.keys(CATALOG);

export function InventorySection({ api }: { api: SizingApi }) {
  const { state } = api;
  const { t } = useI18n();

  return (
    <SectionCard
      num={2}
      title={t('inv.title')}
      desc={t('inv.desc')}
      bodyClassName="px-[14px] pb-[18px] pt-1.5"
    >
      <div className="-mx-2 overflow-x-auto px-2">
        <table className="w-full min-w-[480px] table-fixed border-collapse">
          <thead>
            <tr>
              <Th className="w-[28%]">{t('inv.colSource')}</Th>
              <Th className="w-[17%]">{t('inv.colQty')}</Th>
              <Th className="w-[21%]">{t('inv.colMb')}</Th>
              <Th className="w-[20%] text-right">{t('inv.colGb')}</Th>
              <Th className="w-[14%]"> </Th>
            </tr>
          </thead>
          <tbody>
            {state.rows.map((row, i) => (
              <InventoryRow key={i} row={row} index={i} api={api} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-2 pt-1">
        <button
          type="button"
          onClick={api.addRow}
          className="mt-1 w-full rounded-[11px] border border-dashed border-line-2 bg-transparent px-3 py-[11px] font-mono text-[12px] text-text-dim transition-colors hover:border-primary hover:text-primary"
        >
          {t('inv.addRow')}
        </button>

        <details className="mt-3.5">
          <summary className="cursor-pointer list-none rounded-[9px] border border-line bg-panel-alt px-[13px] py-2.5 text-[11.5px] font-medium text-primary">
            {t('inv.mbExplainerTitle')}
          </summary>
          <div className="mt-2 rounded-[9px] border border-line bg-panel-alt px-4 py-3.5 text-[11.5px] leading-relaxed text-text-dim">
            {t('inv.mbExplainerBody')}
          </div>
        </details>

        <details className="mt-2.5">
          <summary className="cursor-pointer list-none rounded-[9px] border border-line bg-panel-alt px-[13px] py-2.5 text-[11.5px] font-medium text-purple">
            {t('inv.rationaleTitle')}
          </summary>
          <div className="mt-2 max-h-[380px] overflow-y-auto rounded-[9px] border border-line bg-panel-alt p-4">
            {METHOD_GROUPS.map((g) => (
              <div key={g.title} className="mb-4 last:mb-0">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-primary">
                  {g.title}
                </div>
                {g.rows.map((m) => (
                  <div key={m.term} className="mb-[7px] text-[11px] leading-relaxed text-text-dim">
                    <b className="text-text">{m.term}</b>: {m.desc}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </details>
      </div>
    </SectionCard>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`border-b border-line px-2 pb-[9px] pt-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-text-faint ${className}`}
    >
      {children}
    </th>
  );
}

function InventoryRow({ row, index, api }: { row: SourceRow; index: number; api: SizingApi }) {
  const { t } = useI18n();
  const { mb, factor } = resolveMbFactor(row, api.state.edrMode, api.state.saasMode);
  const gbDay = (row.qty * mb * factor) / 1024;
  const isOutro = row.name === 'Outro';
  const overridden = !!row.override;

  const cellInput =
    'w-full rounded-lg border bg-panel-alt px-2 py-[7px] text-right font-mono text-[12.5px] outline-none';
  const overrideCls = overridden
    ? 'border-amber text-amber'
    : 'border-line text-text focus:border-primary';

  return (
    <tr className="border-b border-line-soft">
      <td className="px-2.5 py-2 align-top">
        <select
          value={row.name}
          onChange={(e) => api.changeRowName(index, e.target.value)}
          className="w-full rounded-lg border border-line bg-panel-alt px-2 py-[7px] text-[12px] text-text outline-none focus:border-primary"
        >
          {catalogKeys.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        {isOutro && (
          <input
            type="text"
            placeholder={t('inv.customPlaceholder')}
            value={row.customLabel ?? ''}
            onChange={(e) => api.changeRowCustomLabel(index, e.target.value)}
            className="mt-[5px] w-full rounded-lg border border-line bg-panel-alt px-2 py-1.5 text-[11.5px] text-text-dim outline-none focus:border-primary"
          />
        )}
      </td>
      <td className="px-2 py-2 align-top">
        <input
          type="number"
          min={0}
          value={row.qty}
          onChange={(e) => api.changeRowQty(index, parseFloat(e.target.value) || 0)}
          onFocus={(e) => e.target.select()}
          className="w-full rounded-lg border border-line bg-panel-alt px-2 py-[7px] text-right font-mono text-[12.5px] text-text outline-none focus:border-primary"
        />
      </td>
      <td className="px-2 py-2 align-top">
        <input
          type="number"
          min={0}
          step={1}
          value={Number((mb * factor).toFixed(2))}
          onChange={(e) => api.overrideMbEffective(index, parseFloat(e.target.value) || 0)}
          onFocus={(e) => e.target.select()}
          className={`${cellInput} ${overrideCls}`}
        />
      </td>
      <td className="px-2 py-2 text-right align-top">
        <span className="font-mono text-[13px] font-semibold text-primary">{gbDay.toFixed(2)}</span>
        {overridden && (
          <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.04em] text-amber">
            {t('inv.realData')}
          </div>
        )}
      </td>
      <td className="px-2 py-2 align-top">
        <div className="flex justify-end gap-[5px]">
          {overridden && (
            <button
              type="button"
              onClick={() => api.resetRow(index)}
              title={t('inv.resetRow')}
              className="flex h-[30px] w-[26px] items-center justify-center rounded-[7px] border border-amber bg-transparent text-[13px] text-amber"
            >
              ↺
            </button>
          )}
          <button
            type="button"
            onClick={() => api.removeRow(index)}
            title={t('inv.removeRow')}
            className="flex h-[30px] w-[26px] items-center justify-center rounded-[7px] border border-line bg-transparent text-[15px] text-text-faint transition-colors hover:border-destructive hover:text-destructive"
          >
            ×
          </button>
        </div>
      </td>
    </tr>
  );
}
