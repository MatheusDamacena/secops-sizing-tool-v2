import type {
  CatalogEntry,
  EdrMode,
  EdrModeConfig,
  SaasMode,
  SaasModeConfig,
} from '@/types/sizing';

// ============================================================================
// Catálogo de fontes — MB/dia por item + fator de ajuste raw.
// Estimativas de referência de mercado; sobrescreva com dado real quando possível.
// ============================================================================
export const CATALOG: Record<string, CatalogEntry> = {
  'Firewall / NGFW': { mb: 1000, factor: 1.1 },
  DNS: { mb: 150, factor: 1.1 },
  WAF: { mb: 250, factor: 1.2 },
  'Proxy Web': { mb: 250, factor: 1.2 },
  'IPS/IDS': { mb: 150, factor: 1.3 },
  'EDR / XDR / AV': { mb: 10, factor: 4.0 }, // controlado pelo toggle EDR
  DLP: { mb: 50, factor: 1.3 },
  'Windows Server': { mb: 250, factor: 1.35 },
  NDR: { mb: 150, factor: 1.3 },
  'Active Directory / DC': { mb: 250, factor: 1.3 },
  'Linux/Unix Server': { mb: 150, factor: 1.2 },
  VPN: { mb: 250, factor: 1.1 },
  NAC: { mb: 250, factor: 1.1 },
  Database: { mb: 150, factor: 1.2 },
  'Cloud IaaS (AWS/Azure/GCP)': { mb: 250, factor: 1.3 },
  'Cloud PaaS': { mb: 250, factor: 1.2 },
  CASB: { mb: 150, factor: 1.2 },
  'Email / Exchange': { mb: 250, factor: 1.2 },
  'Load Balancer': { mb: 100, factor: 1.1 },
  UBA: { mb: 150, factor: 1.2 },
  'Windows Workstation': { mb: 10, factor: 1.75 },
  Hypervisor: { mb: 50, factor: 1.1 },
  'SaaS (M365/Workspace) por usuário': { mb: 25, factor: 1.3 }, // toggle SaaS
  'OT/IoT (SCADA, PLC, Historian)': { mb: 50, factor: 1.2 },
  'Telecom (PABX, SBC, SD-WAN)': { mb: 100, factor: 1.1 },
  'Dados/AI (Data Lake, ETL, LLM corporativo)': { mb: 150, factor: 1.2 },
  'Vulnerability Management': { mb: 150, factor: 1.1 },
  'Threat Intelligence Feeds': { mb: 50, factor: 1.1 },
  'Sandbox (Análise de Malware)': { mb: 150, factor: 1.2 },
  ZTNA: { mb: 250, factor: 1.15 },
  'Asset & Identity Feeds (CMDB/LDAP/GRC)': { mb: 25, factor: 1.1 },
  'PAM/IAM (SSO/PAM/IAM)': { mb: 250, factor: 1.2 },
  'Físico (Controle de Acesso/Catracas)': { mb: 25, factor: 1.1 },
  'Azure AD / Entra ID (Sign-in + Audit + Risk)': { mb: 500, factor: 1.15 },
  'Email Security Gateway (Proofpoint/Mimecast/Defender O365)': { mb: 300, factor: 1.15 },
  'MDM/UEM (Intune/Jamf/Workspace ONE)': { mb: 75, factor: 1.15 },
  'DDoS Protection (Akamai/Cloudflare/Arbor)': { mb: 200, factor: 1.15 },
  'Kubernetes/Container (Audit Logs)': { mb: 400, factor: 1.2 },
  'Wireless LAN Controller': { mb: 125, factor: 1.1 },
  Outro: { mb: 100, factor: 1.0 },
};

export const EDR_KEY = 'EDR / XDR / AV';
export const SAAS_KEY = 'SaaS (M365/Workspace) por usuário';

// ============================================================================
// Modos de EDR e SaaS (toggles) — controlam a verbosidade dessas linhas.
// ============================================================================
export const EDR_MODES: Record<EdrMode, EdrModeConfig> = {
  alert: { mb: 10, factor: 1.0, label: 'Somente alertas (~10 MB/dia/item)' },
  mod: { mb: 10, factor: 4.0, label: 'Moderado (~40 MB/dia/item)' },
  full: { mb: 50, factor: 1.3, label: 'Full telemetria (~65 MB/dia/item)' },
};

export const SAAS_MODES: Record<SaasMode, SaasModeConfig> = {
  padrao: { mb: 25, factor: 1.3, label: 'Padrão/agregado (~32 MB/dia/usuário)' },
  verbose: { mb: 150, factor: 1.2, label: 'Verbose/Unified Audit Log (~180 MB/dia/usuário)' },
};

// ============================================================================
// Mapeamento de fonte -> categoria (para composição e agrupamento no relatório).
// ============================================================================
export const CATEGORY_MAP: Record<string, string> = {
  'Firewall / NGFW': 'Rede/Perímetro',
  DNS: 'Rede/Perímetro',
  WAF: 'Rede/Perímetro',
  'Proxy Web': 'Rede/Perímetro',
  'IPS/IDS': 'Rede/Perímetro',
  VPN: 'Rede/Perímetro',
  NAC: 'Rede/Perímetro',
  'Load Balancer': 'Rede/Perímetro',
  'DDoS Protection (Akamai/Cloudflare/Arbor)': 'Rede/Perímetro',
  'Wireless LAN Controller': 'Rede/Perímetro',
  'Windows Workstation': 'Endpoint/Identidade',
  'Windows Server': 'Endpoint/Identidade',
  'Active Directory / DC': 'Endpoint/Identidade',
  'Azure AD / Entra ID (Sign-in + Audit + Risk)': 'Endpoint/Identidade',
  'PAM/IAM (SSO/PAM/IAM)': 'Endpoint/Identidade',
  'Físico (Controle de Acesso/Catracas)': 'Endpoint/Identidade',
  'EDR / XDR / AV': 'EDR/DLP/SaaS',
  DLP: 'EDR/DLP/SaaS',
  'SaaS (M365/Workspace) por usuário': 'EDR/DLP/SaaS',
  'Linux/Unix Server': 'Servidor/Infra/Cloud',
  Database: 'Servidor/Infra/Cloud',
  Hypervisor: 'Servidor/Infra/Cloud',
  'Cloud IaaS (AWS/Azure/GCP)': 'Servidor/Infra/Cloud',
  'Cloud PaaS': 'Servidor/Infra/Cloud',
  'Kubernetes/Container (Audit Logs)': 'Servidor/Infra/Cloud',
  'Email / Exchange': 'Servidor/Infra/Cloud',
  'Email Security Gateway (Proofpoint/Mimecast/Defender O365)': 'Servidor/Infra/Cloud',
  'MDM/UEM (Intune/Jamf/Workspace ONE)': 'Servidor/Infra/Cloud',
  NDR: 'Segurança/Detecção',
  UBA: 'Segurança/Detecção',
  ZTNA: 'Segurança/Detecção',
  'Sandbox (Análise de Malware)': 'Segurança/Detecção',
  'Vulnerability Management': 'Segurança/Detecção',
  'Threat Intelligence Feeds': 'Segurança/Detecção',
  'Asset & Identity Feeds (CMDB/LDAP/GRC)': 'Segurança/Detecção',
  CASB: 'Segurança/Detecção',
  'OT/IoT (SCADA, PLC, Historian)': 'Outros',
  'Telecom (PABX, SBC, SD-WAN)': 'Outros',
  'Dados/AI (Data Lake, ETL, LLM corporativo)': 'Outros',
  Outro: 'Outros',
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Rede/Perímetro': '#2563eb',
  'Endpoint/Identidade': '#db2777',
  'EDR/DLP/SaaS': '#7c3aed',
  'Servidor/Infra/Cloud': '#059669',
  'Segurança/Detecção': '#d97706',
  Outros: '#64748b',
  'Flow de rede': '#0891b2',
};

/** Linhas padrão do inventário (quantidades zeradas — template). */
export const DEFAULT_ROWS = [
  { name: 'Windows Workstation', qty: 0 },
  { name: 'Windows Server', qty: 0 },
  { name: 'Linux/Unix Server', qty: 0 },
  { name: 'WAF', qty: 0 },
  { name: 'Firewall / NGFW', qty: 0 },
  { name: 'Proxy Web', qty: 0 },
  { name: EDR_KEY, qty: 0 },
];
