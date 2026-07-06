// ============================================================================
// Guia educativo: como medir o volume real de logs de cada provider cloud.
// Conteúdo puramente informativo. A ferramenta NÃO calcula esses valores;
// ela orienta o usuário a extrair o número real no console e sobrescrever a
// linha correspondente no inventário. Links apontam para a documentação oficial.
//
// TRADUÇÃO: os campos de texto corrido (intro, steps, query.label, docs.label)
// são objetos por idioma { pt, es, en }. Nomes técnicos permanecem em inglês
// dentro das frases (CloudWatch, Log groups, IncomingBytes, CloudTrail, Data
// Events, Log Analytics, Usage and estimated costs, KQL, Logs Storage,
// Metrics Explorer, Data Access audit logs, etc.). Os campos puramente técnicos
// (name, color, path, query.code, docs.url) NÃO são traduzidos.
// ============================================================================

import type { Lang } from '@/i18n/config';

export type LocalizedText = Record<Lang, string>;

export interface CloudGuideStep {
  text: LocalizedText;
}

export interface CloudGuideProvider {
  id: string;
  name: string;
  color: string;
  intro: LocalizedText;
  path: string;
  steps: CloudGuideStep[];
  query?: { label: LocalizedText; code: string };
  docs: { label: LocalizedText; url: string }[];
}

export const CLOUD_GUIDE: CloudGuideProvider[] = [
  {
    id: 'aws',
    name: 'AWS',
    color: '#FF9900',
    intro: {
      pt: 'A maior parte do volume vem de logs entregues ao CloudWatch Logs (CloudTrail, VPC Flow Logs, logs de aplicação). O CloudWatch expõe o volume ingerido por log group.',
      es: 'La mayor parte del volumen proviene de logs entregados a CloudWatch Logs (CloudTrail, VPC Flow Logs, logs de aplicación). CloudWatch expone el volumen ingerido por log group.',
      en: 'Most of the volume comes from logs delivered to CloudWatch Logs (CloudTrail, VPC Flow Logs, application logs). CloudWatch exposes the ingested volume per log group.',
    },
    path: 'CloudWatch → Log groups → (selecione o grupo) → métrica IncomingBytes',
    steps: [
      {
        text: {
          pt: 'No console do CloudWatch, abra Log groups e identifique os grupos que serão enviados ao SecOps (por exemplo o grupo do CloudTrail, VPC Flow Logs, etc).',
          es: 'En la consola de CloudWatch, abra Log groups e identifique los grupos que se enviarán a SecOps (por ejemplo el grupo de CloudTrail, VPC Flow Logs, etc).',
          en: 'In the CloudWatch console, open Log groups and identify the groups that will be sent to SecOps (for example the CloudTrail group, VPC Flow Logs, etc).',
        },
      },
      {
        text: {
          pt: 'Para cada grupo, abra a aba Metrics ou use CloudWatch Metrics, namespace AWS/Logs, métrica IncomingBytes, filtrando pelo LogGroupName.',
          es: 'Para cada grupo, abra la pestaña Metrics o use CloudWatch Metrics, namespace AWS/Logs, métrica IncomingBytes, filtrando por LogGroupName.',
          en: 'For each group, open the Metrics tab or use CloudWatch Metrics, namespace AWS/Logs, metric IncomingBytes, filtering by LogGroupName.',
        },
      },
      {
        text: {
          pt: 'Aplique a estatística Sum com período de 1 dia sobre uma janela representativa (idealmente 7 a 30 dias, incluindo dias úteis de pico) e tire a média diária em bytes.',
          es: 'Aplique la estadística Sum con período de 1 día sobre una ventana representativa (idealmente 7 a 30 días, incluyendo días hábiles de pico) y saque el promedio diario en bytes.',
          en: 'Apply the Sum statistic with a 1-day period over a representative window (ideally 7 to 30 days, including peak business days) and take the daily average in bytes.',
        },
      },
      {
        text: {
          pt: 'Converta para MB/dia (bytes ÷ 1.048.576) e some os grupos relevantes. Esse é o valor a sobrescrever na linha de cloud do inventário.',
          es: 'Convierta a MB/día (bytes ÷ 1.048.576) y sume los grupos relevantes. Ese es el valor a sobrescribir en la línea de cloud del inventario.',
          en: 'Convert to MB/day (bytes ÷ 1,048,576) and sum the relevant groups. That is the value to override in the cloud row of the inventory.',
        },
      },
      {
        text: {
          pt: 'Fique atento aos Data Events do CloudTrail (ações em nível de objeto no S3, Lambda). Eles ficam desligados por padrão e, se habilitados em buckets movimentados, podem multiplicar o volume em várias ordens de grandeza. Confirme se estão ligados.',
          es: 'Preste atención a los Data Events de CloudTrail (acciones a nivel de objeto en S3, Lambda). Están deshabilitados por defecto y, si se habilitan en buckets con mucho tráfico, pueden multiplicar el volumen en varios órdenes de magnitud. Confirme si están habilitados.',
          en: 'Watch out for CloudTrail Data Events (object-level actions on S3, Lambda). They are off by default and, if enabled on busy buckets, can multiply the volume by several orders of magnitude. Confirm whether they are on.',
        },
      },
    ],
    query: {
      label: {
        pt: 'CLI: volume diário de um log group (bytes) na última semana',
        es: 'CLI: volumen diario de un log group (bytes) en la última semana',
        en: 'CLI: daily volume of a log group (bytes) over the last week',
      },
      code: `aws cloudwatch get-metric-statistics \\
  --namespace AWS/Logs --metric-name IncomingBytes \\
  --dimensions Name=LogGroupName,Value=/aws/cloudtrail/meu-trail \\
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ) \\
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \\
  --period 86400 --statistics Sum`,
    },
    docs: [
      {
        label: {
          pt: 'CloudWatch Logs: métricas (IncomingBytes)',
          es: 'CloudWatch Logs: métricas (IncomingBytes)',
          en: 'CloudWatch Logs: metrics (IncomingBytes)',
        },
        url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatch-Logs-Monitoring-CloudWatch-Metrics.html',
      },
      {
        label: {
          pt: 'CloudTrail: Data Events (impacto de volume)',
          es: 'CloudTrail: Data Events (impacto en el volumen)',
          en: 'CloudTrail: Data Events (volume impact)',
        },
        url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html',
      },
      {
        label: {
          pt: 'CloudWatch: analisar e otimizar custos de log',
          es: 'CloudWatch: analizar y optimizar costos de log',
          en: 'CloudWatch: analyze and optimize log costs',
        },
        url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_billing.html',
      },
    ],
  },
  {
    id: 'azure',
    name: 'Azure',
    color: '#0078D4',
    intro: {
      pt: 'No Azure, quase todo log passa por um Log Analytics workspace. O portal mostra a ingestão diária faturável direto na tela de custos, e a tabela Usage permite consultar o volume exato por tabela.',
      es: 'En Azure, casi todo log pasa por un Log Analytics workspace. El portal muestra la ingesta diaria facturable directo en la pantalla de costos, y la tabla Usage permite consultar el volumen exacto por tabla.',
      en: 'In Azure, almost every log goes through a Log Analytics workspace. The portal shows billable daily ingestion right on the costs screen, and the Usage table lets you query the exact volume per table.',
    },
    path: 'Log Analytics workspace → Settings → Usage and estimated costs',
    steps: [
      {
        text: {
          pt: 'Abra o Log Analytics workspace de destino no portal do Azure.',
          es: 'Abra el Log Analytics workspace de destino en el portal de Azure.',
          en: 'Open the target Log Analytics workspace in the Azure portal.',
        },
      },
      {
        text: {
          pt: 'No menu, vá em Usage and estimated costs. O gráfico mostra a ingestão faturável por tabela dos últimos 31 dias.',
          es: 'En el menú, vaya a Usage and estimated costs. El gráfico muestra la ingesta facturable por tabla de los últimos 31 días.',
          en: 'In the menu, go to Usage and estimated costs. The chart shows billable ingestion per table over the last 31 days.',
        },
      },
      {
        text: {
          pt: 'Para o número exato por dia, abra Logs e rode a query KQL da tabela Usage (ao lado). Ela retorna o total ingerido em GB/dia.',
          es: 'Para el número exacto por día, abra Logs y ejecute la query KQL de la tabla Usage (al lado). Devuelve el total ingerido en GB/día.',
          en: 'For the exact number per day, open Logs and run the KQL query on the Usage table (shown here). It returns the total ingested in GB/day.',
        },
      },
      {
        text: {
          pt: 'Converta GB/dia para MB/dia (× 1024) e sobrescreva a linha de cloud correspondente no inventário. Lembre que Microsoft Sentinel e Defender for Cloud têm modelos próprios em cima do workspace, então considere-os se forem para o SecOps.',
          es: 'Convierta GB/día a MB/día (× 1024) y sobrescriba la línea de cloud correspondiente en el inventario. Recuerde que Microsoft Sentinel y Defender for Cloud tienen modelos propios sobre el workspace, así que considérelos si van para SecOps.',
          en: 'Convert GB/day to MB/day (× 1024) and override the corresponding cloud row in the inventory. Remember that Microsoft Sentinel and Defender for Cloud have their own models on top of the workspace, so account for them if they go to SecOps.',
        },
      },
    ],
    query: {
      label: {
        pt: 'KQL: volume total ingerido nas últimas 24h (GB)',
        es: 'KQL: volumen total ingerido en las últimas 24h (GB)',
        en: 'KQL: total volume ingested in the last 24h (GB)',
      },
      code: `Usage
| where TimeGenerated > ago(24h)
| where IsBillable == true
| summarize TotalIngestionGB = sum(Quantity) / 1024`,
    },
    docs: [
      {
        label: {
          pt: 'Analisar uso de um workspace (Usage and estimated costs)',
          es: 'Analizar uso de un workspace (Usage and estimated costs)',
          en: 'Analyze workspace usage (Usage and estimated costs)',
        },
        url: 'https://learn.microsoft.com/azure/azure-monitor/logs/analyze-usage',
      },
      {
        label: {
          pt: 'Queries de exemplo da tabela Usage',
          es: 'Queries de ejemplo de la tabla Usage',
          en: 'Example queries for the Usage table',
        },
        url: 'https://learn.microsoft.com/azure/azure-monitor/reference/queries/usage',
      },
      {
        label: {
          pt: 'Cálculo de custo de logs (como o volume é medido)',
          es: 'Cálculo de costo de logs (cómo se mide el volumen)',
          en: 'Log cost calculation (how the volume is measured)',
        },
        url: 'https://learn.microsoft.com/azure/azure-monitor/logs/cost-logs',
      },
    ],
  },
  {
    id: 'gcp',
    name: 'Google Cloud',
    color: '#4285F4',
    intro: {
      pt: 'No Google Cloud, o Cloud Logging expõe o volume de bytes ingeridos por bucket/projeto direto no console, e o Metrics Explorer tem a métrica de bytes ingeridos para consulta detalhada.',
      es: 'En Google Cloud, Cloud Logging expone el volumen de bytes ingeridos por bucket/proyecto directo en la consola, y el Metrics Explorer tiene la métrica de bytes ingeridos para consulta detallada.',
      en: 'In Google Cloud, Cloud Logging exposes the volume of ingested bytes per bucket/project right in the console, and the Metrics Explorer has the ingested-bytes metric for detailed querying.',
    },
    path: 'Logging → Logs Storage (bytes ingeridos por bucket)',
    steps: [
      {
        text: {
          pt: 'No console, abra Logging → Logs Storage para ver o volume de ingestão por bucket de logs no projeto.',
          es: 'En la consola, abra Logging → Logs Storage para ver el volumen de ingesta por bucket de logs en el proyecto.',
          en: 'In the console, open Logging → Logs Storage to see the ingestion volume per log bucket in the project.',
        },
      },
      {
        text: {
          pt: 'Para detalhamento diário, use o Metrics Explorer com a métrica logging.googleapis.com/billing/ingested_bytes, agrupando por recurso e período de 1 dia.',
          es: 'Para detalle diario, use el Metrics Explorer con la métrica logging.googleapis.com/billing/ingested_bytes, agrupando por recurso y período de 1 día.',
          en: 'For a daily breakdown, use the Metrics Explorer with the metric logging.googleapis.com/billing/ingested_bytes, grouping by resource and a 1-day period.',
        },
      },
      {
        text: {
          pt: 'Some os buckets/projetos que serão enviados ao SecOps sobre uma janela representativa e tire a média diária em bytes.',
          es: 'Sume los buckets/proyectos que se enviarán a SecOps sobre una ventana representativa y saque el promedio diario en bytes.',
          en: 'Sum the buckets/projects that will be sent to SecOps over a representative window and take the daily average in bytes.',
        },
      },
      {
        text: {
          pt: 'Converta para MB/dia (bytes ÷ 1.048.576) e sobrescreva a linha de cloud no inventário. Os Data Access audit logs costumam estar desligados por padrão e, quando ligados, aumentam bastante o volume, então confirme se estarão habilitados.',
          es: 'Convierta a MB/día (bytes ÷ 1.048.576) y sobrescriba la línea de cloud en el inventario. Los Data Access audit logs suelen estar deshabilitados por defecto y, cuando se habilitan, aumentan bastante el volumen, así que confirme si estarán habilitados.',
          en: 'Convert to MB/day (bytes ÷ 1,048,576) and override the cloud row in the inventory. Data Access audit logs are usually off by default and, when enabled, increase the volume considerably, so confirm whether they will be on.',
        },
      },
    ],
    docs: [
      {
        label: {
          pt: 'Cloud Logging: visão geral de armazenamento/roteamento',
          es: 'Cloud Logging: visión general de almacenamiento/enrutamiento',
          en: 'Cloud Logging: storage/routing overview',
        },
        url: 'https://cloud.google.com/logging/docs/routing/overview',
      },
      {
        label: {
          pt: 'Métricas de uso de logs (ingested_bytes)',
          es: 'Métricas de uso de logs (ingested_bytes)',
          en: 'Log usage metrics (ingested_bytes)',
        },
        url: 'https://cloud.google.com/logging/docs/logs-based-metrics',
      },
      {
        label: {
          pt: 'Audit logs: tipos e volume (Data Access)',
          es: 'Audit logs: tipos y volumen (Data Access)',
          en: 'Audit logs: types and volume (Data Access)',
        },
        url: 'https://cloud.google.com/logging/docs/audit',
      },
    ],
  },
];
