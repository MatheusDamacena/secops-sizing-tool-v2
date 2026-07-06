// ============================================================================
// Guardrails de sanidade: detectam dimensionamentos implausíveis e emitem
// alertas NÃO-BLOQUEANTES. O objetivo é proteger contra uso incorreto por
// alguém sem o julgamento de campo necessário, sem impedir casos legítimos.
//
// As faixas são heurísticas de referência de mercado, calibradas em torno do
// benchmark de ~382 bytes/evento (certificação QRadar 7.5) e validadas contra
// resultados de ferramentas de mercado. Não são regras rígidas: um ambiente
// pode legitimamente cair fora delas, por isso os alertas apenas avisam.
// ============================================================================

import type { SizingResult, SizingState } from '@/types/sizing';

/** Faixa plausível de bytes/evento implícito (cross-check de EPS). */
export const BYTES_PER_EVENT_MIN = 150;
export const BYTES_PER_EVENT_MAX = 2000;

/** Acima desta fração, uma única fonte "domina" o dimensionamento. */
export const SOURCE_DOMINANCE_THRESHOLD = 0.85;

/** Quantidade de itens numa fonte acima da qual vale confirmar. */
export const QTY_SANITY_THRESHOLD = 100_000;

export type SanityLevel = 'info' | 'warning';

export interface SanityAlert {
  id: string;
  level: SanityLevel;
  /** Chave de tradução da mensagem. */
  messageKey: string;
  /** Variáveis para interpolar na mensagem. */
  vars?: Record<string, string | number>;
}

/**
 * Avalia o estado + resultado e retorna a lista de alertas de sanidade.
 * Lista vazia = nenhum problema detectado.
 */
export function evaluateSanity(state: SizingState, result: SizingResult): SanityAlert[] {
  const alerts: SanityAlert[] = [];

  // 1. bytes/evento implícito fora da faixa plausível
  if (result.bytesImplied !== null && result.bytesImplied > 0) {
    if (result.bytesImplied < BYTES_PER_EVENT_MIN) {
      alerts.push({
        id: 'bytes-low',
        level: 'warning',
        messageKey: 'sanity.bytesLow',
        vars: { value: result.bytesImplied.toFixed(0), min: BYTES_PER_EVENT_MIN },
      });
    } else if (result.bytesImplied > BYTES_PER_EVENT_MAX) {
      alerts.push({
        id: 'bytes-high',
        level: 'warning',
        messageKey: 'sanity.bytesHigh',
        vars: { value: result.bytesImplied.toFixed(0), max: BYTES_PER_EVENT_MAX },
      });
    }
  }

  // 2. uma única categoria domina o volume total
  if (result.categorySlices.length > 1 && result.categoryTotal > 0) {
    const top = result.categorySlices[0];
    const fraction = top.tb / result.categoryTotal;
    if (fraction > SOURCE_DOMINANCE_THRESHOLD) {
      alerts.push({
        id: 'dominance',
        level: 'info',
        messageKey: 'sanity.dominance',
        vars: { category: top.category, pct: (fraction * 100).toFixed(0) },
      });
    }
  }

  // 3. quantidade extrema numa linha
  const extremeRow = state.rows.find((r) => r.qty > QTY_SANITY_THRESHOLD);
  if (extremeRow) {
    alerts.push({
      id: 'qty-extreme',
      level: 'info',
      messageKey: 'sanity.qtyExtreme',
      vars: { qty: extremeRow.qty.toLocaleString('pt-BR'), name: extremeRow.name },
    });
  }

  return alerts;
}
