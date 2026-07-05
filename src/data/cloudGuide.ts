// ============================================================================
// Guia educativo: como medir o volume real de logs de cada provider cloud.
// Conteúdo puramente informativo. A ferramenta NÃO calcula esses valores;
// ela orienta o usuário a extrair o número real no console e sobrescrever a
// linha correspondente no inventário. Links apontam para a documentação oficial.
// ============================================================================

export interface CloudGuideStep {
  text: string;
}

export interface CloudGuideProvider {
  id: string;
  name: string;
  color: string;
  intro: string;
  path: string; // caminho de navegação no console
  steps: CloudGuideStep[];
  query?: { label: string; code: string };
  docs: { label: string; url: string }[];
}

export const CLOUD_GUIDE_INTRO =
  'Diferente de servidores ou firewalls (que são contáveis por unidade), fontes de nuvem não têm um "volume por item" previsível. Um mesmo serviço pode gerar de dezenas de MB a vários TB por dia, dependendo da atividade da conta e de quais eventos estão habilitados. Por isso, para nuvem o caminho correto não é estimar, e sim medir o volume real diretamente no console do provider e sobrescrever o campo MB/dia da linha correspondente no inventário. Abaixo você encontra onde está esse número em cada provider. Vale lembrar: as telas e caminhos são mantidos pelos próprios providers e podem mudar, então sempre confirme na documentação oficial linkada.';

export const CLOUD_GUIDE: CloudGuideProvider[] = [
  {
    id: 'aws',
    name: 'AWS',
    color: '#FF9900',
    intro:
      'A maior parte do volume vem de logs entregues ao CloudWatch Logs (CloudTrail, VPC Flow Logs, logs de aplicação). O CloudWatch expõe o volume ingerido por log group.',
    path: 'CloudWatch → Log groups → (selecione o grupo) → métrica IncomingBytes',
    steps: [
      { text: 'No console do CloudWatch, abra Log groups e identifique os grupos que serão enviados ao SecOps (por exemplo o grupo do CloudTrail, VPC Flow Logs, etc).' },
      { text: 'Para cada grupo, abra a aba Metrics ou use CloudWatch Metrics, namespace AWS/Logs, métrica IncomingBytes, filtrando pelo LogGroupName.' },
      { text: 'Aplique a estatística Sum com período de 1 dia sobre uma janela representativa (idealmente 7 a 30 dias, incluindo dias úteis de pico) e tire a média diária em bytes.' },
      { text: 'Converta para MB/dia (bytes ÷ 1.048.576) e some os grupos relevantes. Esse é o valor a sobrescrever na linha de cloud do inventário.' },
      { text: 'Fique atento aos Data Events do CloudTrail (ações em nível de objeto no S3, Lambda). Eles ficam desligados por padrão e, se habilitados em buckets movimentados, podem multiplicar o volume em várias ordens de grandeza. Confirme se estão ligados.' },
    ],
    query: {
      label: 'CLI: volume diário de um log group (bytes) na última semana',
      code: `aws cloudwatch get-metric-statistics \\
  --namespace AWS/Logs --metric-name IncomingBytes \\
  --dimensions Name=LogGroupName,Value=/aws/cloudtrail/meu-trail \\
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ) \\
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \\
  --period 86400 --statistics Sum`,
    },
    docs: [
      { label: 'CloudWatch Logs: métricas (IncomingBytes)', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatch-Logs-Monitoring-CloudWatch-Metrics.html' },
      { label: 'CloudTrail: Data Events (impacto de volume)', url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html' },
      { label: 'CloudWatch: analisar e otimizar custos de log', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_billing.html' },
    ],
  },
  {
    id: 'azure',
    name: 'Azure',
    color: '#0078D4',
    intro:
      'No Azure, quase todo log passa por um Log Analytics workspace. O portal mostra a ingestão diária faturável direto na tela de custos, e a tabela Usage permite consultar o volume exato por tabela.',
    path: 'Log Analytics workspace → Settings → Usage and estimated costs',
    steps: [
      { text: 'Abra o Log Analytics workspace de destino no portal do Azure.' },
      { text: 'No menu, vá em Usage and estimated costs. O gráfico mostra a ingestão faturável por tabela dos últimos 31 dias.' },
      { text: 'Para o número exato por dia, abra Logs e rode a query KQL da tabela Usage (ao lado). Ela retorna o total ingerido em GB/dia.' },
      { text: 'Converta GB/dia para MB/dia (× 1024) e sobrescreva a linha de cloud correspondente no inventário. Lembre que Microsoft Sentinel e Defender for Cloud têm modelos próprios em cima do workspace, então considere-os se forem para o SecOps.' },
    ],
    query: {
      label: 'KQL: volume total ingerido nas últimas 24h (GB)',
      code: `Usage
| where TimeGenerated > ago(24h)
| where IsBillable == true
| summarize TotalIngestionGB = sum(Quantity) / 1024`,
    },
    docs: [
      { label: 'Analisar uso de um workspace (Usage and estimated costs)', url: 'https://learn.microsoft.com/azure/azure-monitor/logs/analyze-usage' },
      { label: 'Queries de exemplo da tabela Usage', url: 'https://learn.microsoft.com/azure/azure-monitor/reference/queries/usage' },
      { label: 'Cálculo de custo de logs (como o volume é medido)', url: 'https://learn.microsoft.com/azure/azure-monitor/logs/cost-logs' },
    ],
  },
  {
    id: 'gcp',
    name: 'Google Cloud',
    color: '#4285F4',
    intro:
      'No Google Cloud, o Cloud Logging expõe o volume de bytes ingeridos por bucket/projeto direto no console, e o Metrics Explorer tem a métrica de bytes ingeridos para consulta detalhada.',
    path: 'Logging → Logs Storage (bytes ingeridos por bucket)',
    steps: [
      { text: 'No console, abra Logging → Logs Storage para ver o volume de ingestão por bucket de logs no projeto.' },
      { text: 'Para detalhamento diário, use o Metrics Explorer com a métrica logging.googleapis.com/billing/ingested_bytes, agrupando por recurso e período de 1 dia.' },
      { text: 'Some os buckets/projetos que serão enviados ao SecOps sobre uma janela representativa e tire a média diária em bytes.' },
      { text: 'Converta para MB/dia (bytes ÷ 1.048.576) e sobrescreva a linha de cloud no inventário. Os Data Access audit logs costumam estar desligados por padrão e, quando ligados, aumentam bastante o volume, então confirme se estarão habilitados.' },
    ],
    docs: [
      { label: 'Cloud Logging: visão geral de armazenamento/roteamento', url: 'https://cloud.google.com/logging/docs/routing/overview' },
      { label: 'Métricas de uso de logs (ingested_bytes)', url: 'https://cloud.google.com/logging/docs/logs-based-metrics' },
      { label: 'Audit logs: tipos e volume (Data Access)', url: 'https://cloud.google.com/logging/docs/audit' },
    ],
  },
];
