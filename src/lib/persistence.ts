// ============================================================================
// Persistência do estado de sizing: auto-save local, export e import de arquivo.
//
// SEGURANÇA: um arquivo importado é INPUT NÃO CONFIÁVEL. Nunca aplicamos o JSON
// diretamente ao estado — ele passa por validação estrita de schema (validateState)
// que reconstrói um objeto limpo campo a campo, descartando qualquer coisa
// inesperada. Isso evita que um arquivo malformado ou malicioso quebre a app
// ou injete propriedades não previstas.
// ============================================================================

import type {
  EdrMode,
  EpsType,
  FlowIncluded,
  SaasMode,
  SizingState,
  SourceRow,
} from '@/types/sizing';
import { CATALOG } from '@/data/catalog';

/** Versão do formato do arquivo — permite migrações futuras sem quebrar arquivos antigos. */
export const SCHEMA_VERSION = 1;

const STORAGE_KEY = 'secops-sizing-state';

export interface PersistedFile {
  schema: number;
  savedAt: string;
  state: SizingState;
}

const EDR_MODES: EdrMode[] = ['alert', 'mod', 'full'];
const SAAS_MODES: SaasMode[] = ['padrao', 'verbose'];
const EPS_TYPES: EpsType[] = ['sustentado', 'licenca', 'naosei'];
const FLOW_INCLUDED: FlowIncluded[] = ['nao', 'sim', 'naosei'];

const CATALOG_NAMES = new Set(Object.keys(CATALOG));

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : fallback;
}

function asEnum<T extends string>(v: unknown, allowed: T[], fallback: T): T {
  return typeof v === 'string' && (allowed as string[]).includes(v) ? (v as T) : fallback;
}

/** Valida e sanitiza uma linha de fonte vinda de fora. */
function validateRow(raw: unknown): SourceRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const name = asString(r.name);
  // Aceita nomes do catálogo ou "Outro" com rótulo custom; nomes desconhecidos viram "Outro".
  const safeName = CATALOG_NAMES.has(name) ? name : 'Outro';
  const row: SourceRow = {
    name: safeName,
    qty: Math.max(0, asNumber(r.qty, 0)),
  };
  if (typeof r.mb === 'number' && Number.isFinite(r.mb)) row.mb = Math.max(0, r.mb);
  if (typeof r.factor === 'number' && Number.isFinite(r.factor)) row.factor = Math.max(0, r.factor);
  if (r.override === true) row.override = true;
  if (typeof r.customLabel === 'string') row.customLabel = r.customLabel.slice(0, 120);
  return row;
}

/**
 * Reconstrói um SizingState limpo a partir de dados não confiáveis.
 * Qualquer campo ausente ou inválido cai num default seguro.
 */
export function validateState(raw: unknown): SizingState | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;

  const rowsRaw = Array.isArray(s.rows) ? s.rows : [];
  // Limita a 200 linhas para evitar arquivos absurdos travarem a UI.
  const rows = rowsRaw
    .slice(0, 200)
    .map(validateRow)
    .filter((r): r is SourceRow => r !== null);

  return {
    eps: asString(s.eps),
    epsType: asEnum(s.epsType, EPS_TYPES, 'sustentado'),
    flowIncluded: asEnum(s.flowIncluded, FLOW_INCLUDED, 'nao'),
    flowRegMin: asString(s.flowRegMin, '0'),
    flowFormat: asString(s.flowFormat, '150'),
    edrMode: asEnum(s.edrMode, EDR_MODES, 'mod'),
    saasMode: asEnum(s.saasMode, SAAS_MODES, 'padrao'),
    growth: Math.min(100, Math.max(0, asNumber(s.growth, 15))),
    rows,
    projName: asString(s.projName).slice(0, 200),
  };
}

/** Serializa o estado num arquivo com versão e timestamp. */
export function serializeState(state: SizingState): string {
  const payload: PersistedFile = {
    schema: SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    state,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Faz o parse de um arquivo importado (texto). Retorna o estado validado
 * ou lança erro com mensagem amigável se o arquivo for inválido.
 */
export function parseImportedFile(text: string): SizingState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('invalid-json');
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('invalid-structure');
  }
  const obj = parsed as Record<string, unknown>;
  // Aceita tanto o formato com envelope { schema, state } quanto o estado cru.
  const stateRaw = 'state' in obj ? obj.state : obj;
  const validated = validateState(stateRaw);
  if (!validated) {
    throw new Error('invalid-structure');
  }
  return validated;
}

// ---------------------------------------------------------------------------
// Auto-save local (localStorage) — sempre protegido por try/catch.
// ---------------------------------------------------------------------------

export function saveStateLocal(state: SizingState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, serializeState(state));
  } catch {
    /* localStorage indisponível (aba anônima, cota cheia) — ignora */
  }
}

export function loadStateLocal(): SizingState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseImportedFile(raw);
  } catch {
    return null;
  }
}

export function clearStateLocal(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignora */
  }
}
