import { useCallback, useMemo, useState } from 'react';
import { CATALOG, DEFAULT_ROWS, EDR_KEY, SAAS_KEY } from '@/data/catalog';
import { computeResult } from '@/lib/sizing';
import type {
  EdrMode,
  EpsType,
  FlowIncluded,
  SaasMode,
  SizingResult,
  SizingState,
  SourceRow,
} from '@/types/sizing';

const initialState: SizingState = {
  eps: '',
  epsType: 'sustentado',
  flowIncluded: 'nao',
  flowRegMin: '0',
  flowFormat: '150',
  edrMode: 'mod',
  saasMode: 'padrao',
  growth: 15,
  rows: DEFAULT_ROWS.map((r) => ({ ...r })),
  projName: 'Sem nome de projeto',
};

export interface SizingApi {
  state: SizingState;
  result: SizingResult;
  // setters de campo
  setEps: (v: string) => void;
  setEpsType: (v: EpsType) => void;
  setFlowIncluded: (v: FlowIncluded) => void;
  setFlowRegMin: (v: string) => void;
  setFlowFormat: (v: string) => void;
  setEdrMode: (v: EdrMode) => void;
  setSaasMode: (v: SaasMode) => void;
  setGrowth: (v: number) => void;
  setProjName: (v: string) => void;
  // operações de linha
  addRow: () => void;
  removeRow: (index: number) => void;
  changeRowName: (index: number, name: string) => void;
  changeRowQty: (index: number, qty: number) => void;
  changeRowCustomLabel: (index: number, label: string) => void;
  overrideMbEffective: (index: number, effectiveMb: number) => void;
  resetRow: (index: number) => void;
  // global
  reset: () => void;
}

export function useSizingState(): SizingApi {
  const [state, setState] = useState<SizingState>(initialState);

  const patch = useCallback((p: Partial<SizingState>) => {
    setState((prev) => ({ ...prev, ...p }));
  }, []);

  const patchRows = useCallback((updater: (rows: SourceRow[]) => SourceRow[]) => {
    setState((prev) => ({ ...prev, rows: updater(prev.rows) }));
  }, []);

  const addRow = useCallback(() => {
    patchRows((rows) => [...rows, { name: 'Outro', qty: 1 }]);
  }, [patchRows]);

  const removeRow = useCallback(
    (index: number) => {
      patchRows((rows) => rows.filter((_, i) => i !== index));
    },
    [patchRows],
  );

  const changeRowName = useCallback(
    (index: number, name: string) => {
      // Trocar de fonte limpa qualquer override anterior daquela linha.
      patchRows((rows) => rows.map((r, i) => (i === index ? { name, qty: r.qty } : r)));
    },
    [patchRows],
  );

  const changeRowQty = useCallback(
    (index: number, qty: number) => {
      patchRows((rows) => rows.map((r, i) => (i === index ? { ...r, qty } : r)));
    },
    [patchRows],
  );

  const changeRowCustomLabel = useCallback(
    (index: number, label: string) => {
      patchRows((rows) => rows.map((r, i) => (i === index ? { ...r, customLabel: label } : r)));
    },
    [patchRows],
  );

  const overrideMbEffective = useCallback((index: number, effectiveMb: number) => {
    setState((prev) => {
      const rows = prev.rows.map((r, i) => {
        if (i !== index) return r;
        // O usuário edita o MB/dia EFETIVO (já com verbosidade embutida).
        // Guardamos como mb = valor efetivo e factor = 1, porque a decomposição
        // base×fator do catálogo não se aplica mais a uma medição manual.
        return { ...r, mb: effectiveMb, factor: 1, override: true };
      });
      return { ...prev, rows };
    });
  }, []);

  const resetRow = useCallback(
    (index: number) => {
      patchRows((rows) =>
        rows.map((r, i) => {
          if (i !== index) return r;
          const { name, qty, customLabel } = r;
          return customLabel ? { name, qty, customLabel } : { name, qty };
        }),
      );
    },
    [patchRows],
  );

  const reset = useCallback(() => {
    setState({ ...initialState, rows: DEFAULT_ROWS.map((r) => ({ ...r })) });
  }, []);

  const result = useMemo(() => computeResult(state), [state]);

  return {
    state,
    result,
    setEps: (v) => patch({ eps: v }),
    setEpsType: (v) => patch({ epsType: v }),
    setFlowIncluded: (v) => patch({ flowIncluded: v }),
    setFlowRegMin: (v) => patch({ flowRegMin: v }),
    setFlowFormat: (v) => patch({ flowFormat: v }),
    setEdrMode: (v) => patch({ edrMode: v }),
    setSaasMode: (v) => patch({ saasMode: v }),
    setGrowth: (v) => patch({ growth: v }),
    setProjName: (v) => patch({ projName: v || 'Sem nome de projeto' }),
    addRow,
    removeRow,
    changeRowName,
    changeRowQty,
    changeRowCustomLabel,
    overrideMbEffective,
    resetRow,
    reset,
  };
}

// Re-export utilitários usados pela UI para conveniência.
export { CATALOG, EDR_KEY, SAAS_KEY };
