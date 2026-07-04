// ============================================================================
// Tipos centrais do domínio de dimensionamento (sizing)
// ============================================================================

/** Modo de telemetria do EDR — afeta MB/dia e fator da linha de EDR. */
export type EdrMode = 'alert' | 'mod' | 'full';

/** Modo de auditoria SaaS — afeta MB/dia e fator da linha de SaaS. */
export type SaasMode = 'padrao' | 'verbose';

/** Origem do valor de EPS informado — muda a confiança no número. */
export type EpsType = 'sustentado' | 'licenca' | 'naosei';

/** Se o EPS informado já inclui flow de rede ou não. */
export type FlowIncluded = 'nao' | 'sim' | 'naosei';

/** Tema visual da aplicação. */
export type Theme = 'light' | 'dark';

/** Entrada do catálogo: volume-base de mercado + fator de ajuste raw. */
export interface CatalogEntry {
  /** MB/dia por item (volume-base típico de mercado em config padrão). */
  mb: number;
  /** Multiplicador sobre o MB/dia base (verbosidade, overhead, config real). */
  factor: number;
}

/** Uma linha do inventário de fontes montado pelo usuário. */
export interface SourceRow {
  /** Nome da fonte (chave do catálogo). */
  name: string;
  /** Quantidade de itens/ativos dessa fonte. */
  qty: number;
  /** Override manual de MB/dia (quando o usuário sobrescreve com dado real). */
  mb?: number;
  /** Override manual do fator. */
  factor?: number;
  /** Marca que a linha foi sobrescrita manualmente. */
  override?: boolean;
  /** Rótulo customizado quando a fonte é "Outro". */
  customLabel?: string;
}

/** Modo do EDR: MB/dia base + fator + rótulo legível. */
export interface EdrModeConfig {
  mb: number;
  factor: number;
  label: string;
}

/** Modo do SaaS: MB/dia base + fator + rótulo legível. */
export interface SaasModeConfig {
  mb: number;
  factor: number;
  label: string;
}

/** Uma fatia da composição por categoria (para donut e legenda). */
export interface CategorySlice {
  category: string;
  tb: number;
  pct: number;
  color: string;
}

/** Um arco SVG pré-calculado do donut. */
export interface DonutArc {
  color: string;
  dash: number;
  offset: number;
}

/** Uma linha da tabela de sensibilidade. */
export interface SensitivityRow {
  label: string;
  tb: number;
  isBase: boolean;
}

/** Estado completo da aplicação de sizing. */
export interface SizingState {
  eps: string;
  epsType: EpsType;
  flowIncluded: FlowIncluded;
  flowRegMin: string;
  flowFormat: string;
  edrMode: EdrMode;
  saasMode: SaasMode;
  growth: number;
  rows: SourceRow[];
  projName: string;
}

/** Resultado calculado a partir do estado. */
export interface SizingResult {
  gbDayLog: number;
  tbLog: number;
  tbFlow: number;
  tbBase: number;
  tbGrowth: number;
  bytesImplied: number | null;
  categorySlices: CategorySlice[];
  categoryTotal: number;
  sensitivity: SensitivityRow[];
  assumptions: string[];
  isEmpty: boolean;
}
