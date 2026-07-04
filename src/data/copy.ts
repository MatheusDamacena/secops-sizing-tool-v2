import type { EpsType, FlowIncluded } from '@/types/sizing';

/** Avisos exibidos conforme a origem do EPS informado. */
export const EPS_TYPE_ADVISORY: Record<EpsType, string> = {
  sustentado: '',
  licenca:
    'Atenção: EPS de licença costuma rodar 40-70% acima do uso real sustentado (headroom de dimensionamento). O cálculo usa o valor informado como se fosse sustentado — considere pedir o gráfico de utilização real do License Manager antes de fechar a cotação.',
  naosei:
    'Confirme com o cliente antes de fechar a cotação — essa é a variável que mais muda o resultado final, mais do que qualquer ajuste de catálogo.',
};

/** Avisos exibidos conforme a resposta sobre flow incluso no EPS. */
export const FLOW_INCLUDED_ADVISORY: Record<FlowIncluded, string> = {
  nao: '',
  sim: 'Se o EPS já inclui flow, NÃO preencha o campo de flow abaixo — somar os dois causaria dupla contagem do mesmo tráfego.',
  naosei:
    'Se for QRadar: verifique a aba "Network Activity" e a métrica FPM em System and License Management — se houver valor ali, o flow é coletado separado do log (EPS). Se for outro SIEM, procure a métrica equivalente de flow/registros por minuto na licença ou no dashboard de ingestão.',
};

/** Racional dos fatores de ajuste, agrupado por categoria (para o expander). */
export interface MethodGroup {
  title: string;
  rows: { term: string; desc: string }[];
}

export const METHOD_GROUPS: MethodGroup[] = [
  {
    title: 'Rede / Perímetro',
    rows: [
      { term: 'Firewall/NGFW (1.10x)', desc: 'NGFW moderno já loga com bastante detalhe por padrão (UTM, App-ID, threat log); pouca folga entre config padrão e uso real.' },
      { term: 'DNS (1.10x)', desc: 'log de resolução é compacto e uniforme por natureza; pouca variação entre implementações.' },
      { term: 'Proxy Web (1.20x)', desc: 'URL completa + headers aumentam volume acima do log básico de conexão.' },
      { term: 'IPS/IDS (1.30x)', desc: 'modo de detecção com payload/assinatura completa é mais verboso que log de alerta simples.' },
      { term: 'VPN (1.10x) / NAC (1.10x)', desc: 'log de sessão segue formato relativamente padronizado.' },
      { term: 'Load Balancer (1.10x) / WLAN Controller (1.10x)', desc: 'log de sessão/associação é compacto e padronizado.' },
      { term: 'DDoS Protection (1.15x)', desc: 'log de mitigação inclui características de tráfego agregado.' },
    ],
  },
  {
    title: 'Endpoint / Identidade',
    rows: [
      { term: 'Windows Workstation (1.75x)', desc: 'muitos ambientes habilitam Advanced Audit Policy além do Security log básico, aumentando o volume real bem acima do padrão "vanilla".' },
      { term: 'Windows Server (1.35x)', desc: 'auditoria detalhada (logon, Kerberos/NTLM) é comum em servidores.' },
      { term: 'Active Directory/DC (1.30x)', desc: 'auditoria de autenticação detalhada gera volume acima do padrão básico.' },
      { term: 'Azure AD/Entra ID (1.15x)', desc: 'sign-in + audit + risk logs são verbosos em JSON, mas o volume é por tenant (não por usuário), então o ajuste é moderado.' },
      { term: 'PAM/IAM (1.20x)', desc: 'gravação de sessão privilegiada/comandos pode aumentar volume.' },
      { term: 'Físico/Controle de Acesso (1.10x)', desc: 'evento de badge é compacto e de baixa frequência por natureza.' },
    ],
  },
  {
    title: 'EDR / DLP / SaaS (toggles)',
    rows: [
      { term: 'EDR "Somente alertas" (1.0x)', desc: 'reflete só eventos de detecção, sem telemetria contínua.' },
      { term: 'EDR "Moderado" (4.0x sobre a base de alertas)', desc: 'já inclui parte da telemetria de processo/rede além dos alertas.' },
      { term: 'EDR "Full telemetria" (mb maior, 1.3x)', desc: 'telemetria completa de processo/rede/arquivo, ordem de grandeza maior que alert-only.' },
      { term: 'DLP (1.30x)', desc: 'inspeção de conteúdo com contexto de política aumenta volume por evento de violação.' },
      { term: 'SaaS "Padrão" (1.30x sobre base baixa)', desc: 'reflete agregado comum (email + SSO + conferência), não o log completo de auditoria.' },
      { term: 'SaaS "Verbose" (mb bem maior, 1.20x)', desc: 'reflete Unified Audit Log completo habilitado, ordem de grandeza maior que o agregado padrão.' },
    ],
  },
  {
    title: 'Servidor / Infra / Cloud',
    rows: [
      { term: 'Linux/Unix Server (1.20x)', desc: 'syslog pode incluir auditd/journald com mais detalhe que syslog básico.' },
      { term: 'Database (1.20x)', desc: 'auditoria de transação pode ser habilitada em nível mais detalhado que o padrão.' },
      { term: 'Hypervisor (1.10x)', desc: 'log de gerenciamento é relativamente enxuto e padronizado.' },
      { term: 'Cloud IaaS (1.30x)', desc: 'logs de audit de nuvem (tipo CloudTrail) representam cada chamada de API, tendem a ser mais verbosos que a média.' },
      { term: 'Cloud PaaS (1.20x)', desc: 'similar ao IaaS, mas volume de chamadas por serviço tende a ser um pouco menor.' },
      { term: 'Kubernetes/Container (1.20x)', desc: 'audit log de API do cluster é um dos mais verbosos do catálogo — cada chamada é um evento JSON detalhado.' },
      { term: 'Email/Exchange (1.20x)', desc: 'inclui metadados de roteamento/anexo além do fluxo básico.' },
      { term: 'Email Security Gateway (1.15x)', desc: 'inclui resultado de varredura de anexo/URL, mais verboso que o fluxo simples do Exchange.' },
      { term: 'MDM/UEM (1.15x)', desc: 'compacto, mas pode variar com frequência de check-in do dispositivo.' },
    ],
  },
  {
    title: 'Segurança / Detecção / Outros',
    rows: [
      { term: 'NDR (1.30x)', desc: 'metadados de sessão com contexto comportamental são mais verbosos que flow simples.' },
      { term: 'UBA (1.20x)', desc: 'contexto comportamental agregado por usuário pode ser mais verboso que evento simples.' },
      { term: 'ZTNA (1.15x)', desc: 'log de sessão com contexto de dispositivo/postura é mais rico que VPN tradicional.' },
      { term: 'Sandbox (1.20x)', desc: 'relatório de análise comportamental pode incluir múltiplos artefatos por amostra.' },
      { term: 'Vulnerability Management / Threat Intel (1.10x)', desc: 'resultado de scan e feed de IOC são relativamente estruturados e compactos.' },
      { term: 'Asset & Identity Feeds (1.10x)', desc: 'dado de enriquecimento, não evento contínuo — volume inerentemente baixo.' },
      { term: 'CASB (1.20x)', desc: 'inspeção de conteúdo/contexto de aplicação SaaS aumenta volume por evento.' },
      { term: 'OT/IoT (1.20x)', desc: 'protocolos industriais são compactos, mas gateways modernos podem agregar telemetria adicional.' },
      { term: 'Telecom (1.10x)', desc: 'CDR e eventos de sessão são relativamente padronizados.' },
      { term: 'Dados/AI (1.20x)', desc: 'logs de pipeline/ETL podem incluir metadados de schema e execução.' },
      { term: 'Outro (1.00x)', desc: 'sem calibração específica; ajuste manualmente com dado real da fonte.' },
    ],
  },
];
